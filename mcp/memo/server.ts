#!/usr/bin/env node
// Minimal MCP server over stdio (newline-delimited JSON-RPC). No dependencies.
import { createInterface } from 'node:readline';
import { callTool, closeAll, MemoError, TOOLS } from './tools.ts';
import type { Row } from './store.ts';

const PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const msgOf = (e: unknown): string => (e instanceof Error ? e.message : String(e));
const send = (msg: Row): boolean => process.stdout.write(`${JSON.stringify(msg)}\n`);
const reply = (id: unknown, result: unknown): boolean => send({ jsonrpc: '2.0', id, result });
const error = (id: unknown, code: number, message: string): boolean => send({ jsonrpc: '2.0', id, error: { code, message } });

function handle(msg: Row): unknown {
  const { id, method, params } = msg;
  const isRequest = id !== undefined && id !== null;
  switch (method) {
    case 'initialize':
      return reply(id, {
        protocolVersion: PROTOCOLS.includes(params?.protocolVersion) ? params.protocolVersion : PROTOCOLS[0],
        capabilities: { tools: {} },
        serverInfo: { name: 'memo', version: '0.2.0' },
      });
    case 'ping': return isRequest && reply(id, {});
    case 'tools/list': return reply(id, { tools: TOOLS });
    case 'tools/call': {
      try {
        const out = callTool(params?.name, params?.arguments ?? {});
        return reply(id, { content: [{ type: 'text', text: JSON.stringify(out) }] });
      } catch (e) {
        const text = e instanceof MemoError ? e.message : `Internal error: ${msgOf(e)}`;
        return reply(id, { content: [{ type: 'text', text }], isError: true });
      }
    }
    default:
      if (isRequest) error(id, -32601, `Method not found: ${method}`);
  }
  return undefined;
}

const rl = createInterface({ input: process.stdin });
rl.on('line', (line) => {
  if (!line.trim()) return;
  let msg: Row;
  try { msg = JSON.parse(line); } catch { return error(null, -32700, 'Parse error'); }
  try { handle(msg); } catch (e) { if (msg.id != null) error(msg.id, -32603, msgOf(e)); }
});
rl.on('close', () => { closeAll(); process.exit(0); });
