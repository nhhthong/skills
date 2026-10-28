# Patterns

One small example per rule in [SKILL.md](SKILL.md). Read only the section you need.

## Discriminated unions

```ts
// BAD: four optional fields, sixteen shapes, most of them impossible
type Upload = { progress?: number; url?: string; error?: string; done?: boolean };

// GOOD: three shapes, each complete
type Upload =
  | { kind: 'uploading'; progress: number }
  | { kind: 'done'; url: string }
  | { kind: 'failed'; error: string };
```

## Branded types and honest guards

```ts
type UserId = string & { readonly __brand: 'UserId' };

function isUserId(s: string): s is UserId {
  return /^usr_[a-z0-9]{12}$/.test(s);
}

function parseUserId(s: string): UserId {
  if (!isUserId(s)) throw new Error(`not a user id: ${s}`);
  return s;
}

declare function deleteOrder(orderId: OrderId, by: UserId): void;
// deleteOrder(userId, orderId) no longer compiles.
```

## Construct the legal shape

```ts
type NonEmpty<T> = [T, ...T[]];
const first = <T>(xs: NonEmpty<T>): T => xs[0]; // no `!`, no "never happens"

// A range that cannot end before it starts
type Slot = { start: Date; minutes: number };
```

## Parse at the boundary, `unknown` over `any`

```ts
import { z } from 'zod';

const Order = z.object({ id: z.string(), total: z.number().nonnegative() });
type Order = z.infer<typeof Order>;

app.post('/orders', (req, res) => {
  const order = Order.parse(req.body); // req.body is unknown until here
  res.json(place(order));              // place() trusts Order, no checks inside
});
```

Without a schema library, write one parse function per boundary that takes `unknown` and returns the domain type or an error.

## Check, then type; `satisfies`

```ts
// BAD: claims a shape nobody checked
const cfg = JSON.parse(text) as Config;

// GOOD: checked, then typed
const cfg = Config.parse(JSON.parse(text));

// A literal checked against a type, keeping its narrow keys
const routes = { home: '/', orders: '/orders' } satisfies Record<string, `/${string}`>;
```

## Exhaustive switches

```ts
function label(u: Upload): string {
  switch (u.kind) {
    case 'uploading': return `${u.progress}%`;
    case 'done': return 'Done';
    case 'failed': return u.error;
    default: {
      const _exhaustive: never = u;
      throw new Error(`unhandled upload ${JSON.stringify(_exhaustive)}`);
    }
  }
}
```

## Derived types

```ts
type CreateUser = Omit<User, 'id' | 'createdAt'>;
type Charge = Awaited<ReturnType<typeof payments.charge>>;
```

## Object arguments

```ts
// BAD: transfer(from, to, amount): swapping `from` and `to` compiles
// GOOD
function transfer({ from, to, amount }: { from: AccountId; to: AccountId; amount: Cents }) {}
```

Adapted from pstack (Lauren Tan, MIT): `typescript-best-practices/references/patterns.md`.
