// Migrations run in order; PRAGMA user_version stores the last applied one.
// Never edit a shipped migration. Append a new one.
export const MIGRATIONS: string[] = [
  `
  CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL) STRICT;

  CREATE TABLE epics (
    id         INTEGER PRIMARY KEY,
    key        TEXT NOT NULL UNIQUE,
    title      TEXT,
    created_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE tickets (
    id         INTEGER PRIMARY KEY,
    key        TEXT NOT NULL UNIQUE,
    title      TEXT,
    epic_id    INTEGER REFERENCES epics(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL
  ) STRICT;
  CREATE INDEX tickets_epic ON tickets(epic_id);

  CREATE TABLE counters (type TEXT PRIMARY KEY, n INTEGER NOT NULL) STRICT;

  CREATE TABLE memos (
    id         INTEGER PRIMARY KEY,
    code       TEXT NOT NULL UNIQUE,
    type       TEXT NOT NULL CHECK (type IN ('issue','attempt','fix','decision','note')),
    title      TEXT NOT NULL,
    body       TEXT NOT NULL DEFAULT '',
    epic_id    INTEGER REFERENCES epics(id) ON DELETE SET NULL,
    ticket_id  INTEGER REFERENCES tickets(id) ON DELETE SET NULL,
    session_id TEXT,
    branch     TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  ) STRICT;
  CREATE INDEX memos_type_time ON memos(type, created_at DESC);
  CREATE INDEX memos_ticket    ON memos(ticket_id, type);
  CREATE INDEX memos_epic      ON memos(epic_id, type);
  CREATE INDEX memos_updated   ON memos(updated_at DESC);

  CREATE TABLE issues (
    memo_id      INTEGER PRIMARY KEY REFERENCES memos(id) ON DELETE CASCADE,
    signature    TEXT,
    status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','wontfix')),
    occurrences  INTEGER NOT NULL DEFAULT 1,
    last_seen_at TEXT NOT NULL
  ) STRICT;
  CREATE UNIQUE INDEX issues_signature ON issues(signature) WHERE signature IS NOT NULL;
  CREATE INDEX issues_status ON issues(status);

  CREATE TABLE attempts (
    memo_id  INTEGER PRIMARY KEY REFERENCES memos(id) ON DELETE CASCADE,
    issue_id INTEGER REFERENCES memos(id) ON DELETE SET NULL,
    outcome  TEXT NOT NULL DEFAULT 'failed' CHECK (outcome IN ('failed','partial','worked'))
  ) STRICT;
  CREATE INDEX attempts_issue ON attempts(issue_id);

  CREATE TABLE fixes (
    memo_id     INTEGER PRIMARY KEY REFERENCES memos(id) ON DELETE CASCADE,
    issue_id    INTEGER REFERENCES memos(id) ON DELETE SET NULL,
    attempt_id  INTEGER REFERENCES memos(id) ON DELETE SET NULL,
    status      TEXT NOT NULL DEFAULT 'unconfirmed' CHECK (status IN ('unconfirmed','confirmed','stale')),
    pr_ref      TEXT,
    verified_at TEXT
  ) STRICT;
  CREATE INDEX fixes_issue ON fixes(issue_id);

  CREATE TABLE decisions (
    memo_id       INTEGER PRIMARY KEY REFERENCES memos(id) ON DELETE CASCADE,
    rationale     TEXT NOT NULL DEFAULT '',
    alternatives  TEXT NOT NULL DEFAULT '[]',
    status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','superseded','stale')),
    supersedes_id INTEGER REFERENCES memos(id) ON DELETE SET NULL
  ) STRICT;
  CREATE INDEX decisions_status ON decisions(status);

  CREATE TABLE notes (
    memo_id     INTEGER PRIMARY KEY REFERENCES memos(id) ON DELETE CASCADE,
    kind        TEXT NOT NULL DEFAULT 'lesson' CHECK (kind IN ('convention','gotcha','lesson','structure','glossary')),
    status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','stale')),
    verified_at TEXT
  ) STRICT;

  CREATE TABLE tags (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE) STRICT;
  CREATE TABLE memo_tags (
    memo_id INTEGER NOT NULL REFERENCES memos(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (memo_id, tag_id)
  ) STRICT, WITHOUT ROWID;
  CREATE INDEX memo_tags_tag ON memo_tags(tag_id, memo_id);

  CREATE TABLE refs (
    id      INTEGER PRIMARY KEY,
    memo_id INTEGER NOT NULL REFERENCES memos(id) ON DELETE CASCADE,
    kind    TEXT NOT NULL CHECK (kind IN ('file','commit','req','url')),
    value   TEXT NOT NULL
  ) STRICT;
  CREATE INDEX refs_memo  ON refs(memo_id);
  CREATE INDEX refs_value ON refs(kind, value);

  CREATE TABLE events (
    id      INTEGER PRIMARY KEY,
    memo_id INTEGER NOT NULL REFERENCES memos(id) ON DELETE CASCADE,
    at      TEXT NOT NULL,
    action  TEXT NOT NULL,
    detail  TEXT NOT NULL DEFAULT ''
  ) STRICT;
  CREATE INDEX events_memo ON events(memo_id, at);

  CREATE VIRTUAL TABLE memo_fts USING fts5(
    title, body, tags,
    tokenize = 'unicode61 remove_diacritics 2'
  );
  `,
];
