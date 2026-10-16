import type { GlossaryTerm } from './types'

export const glossary: GlossaryTerm[] = [
  // HTTP & Request Anatomy
  {
    id: 'http',
    term: 'HTTP',
    definition: 'HyperText Transfer Protocol — the rule set for sending requests and responses between client and server over the web.',
  },
  {
    id: 'request',
    term: 'Request',
    definition: 'A message sent by the client to the server asking for a resource or action. Contains method, URL, headers, and optional body.',
  },
  {
    id: 'response',
    term: 'Response',
    definition: 'The server\'s reply to a request. Contains a status code, headers, and optional body.',
  },
  {
    id: 'method',
    term: 'HTTP Method',
    definition: 'Verb that describes the intent: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove).',
  },
  {
    id: 'status-code',
    term: 'Status Code',
    definition: '3-digit number indicating the result: 2xx success, 3xx redirect, 4xx client error, 5xx server error.',
  },
  {
    id: 'header',
    term: 'Header',
    definition: 'Key-value metadata attached to a request or response. Controls auth, content type, caching, and more.',
  },
  {
    id: 'body',
    term: 'Body',
    definition: 'The payload of a request or response — usually JSON in REST APIs. Not all methods have a body (GET, DELETE rarely do).',
  },
  {
    id: 'url',
    term: 'URL',
    definition: 'Uniform Resource Locator — the address of a resource: scheme + host + path + query string.',
  },
  {
    id: 'query-string',
    term: 'Query String',
    definition: 'Key-value pairs appended to a URL after `?`. Used for filtering, pagination, and search: `/users?role=admin&page=2`.',
  },
  // Middleware
  {
    id: 'middleware',
    term: 'Middleware',
    definition: 'A function that sits between the incoming request and the final route handler, executing logic and calling `next()` to pass control.',
  },
  {
    id: 'next',
    term: 'next()',
    definition: 'A function passed to each middleware in Express. Calling it moves execution to the next middleware in the chain.',
  },
  {
    id: 'pipeline',
    term: 'Pipeline',
    definition: 'A series of processing stages where each stage transforms or validates data and passes it forward.',
  },
  {
    id: 'route-handler',
    term: 'Route Handler',
    definition: 'The final function in a middleware chain that sends the response back to the client.',
  },
  {
    id: 'error-middleware',
    term: 'Error Middleware',
    definition: 'Special Express middleware with 4 parameters (err, req, res, next). Called when any middleware calls `next(err)`.',
  },
  // JWT
  {
    id: 'jwt',
    term: 'JWT',
    definition: 'JSON Web Token — a compact, self-contained string for transmitting claims between parties, split into header.payload.signature.',
  },
  {
    id: 'jwt-header',
    term: 'JWT Header',
    definition: 'Base64url-encoded JSON specifying the token type and signing algorithm, e.g. `{"alg":"HS256","typ":"JWT"}`.',
  },
  {
    id: 'jwt-payload',
    term: 'JWT Payload',
    definition: 'Base64url-encoded JSON containing claims — data about the user like `sub`, `role`, `iat` (issued-at), `exp` (expiry).',
  },
  {
    id: 'jwt-signature',
    term: 'JWT Signature',
    definition: 'HMAC or RSA hash of header + payload using a secret key. Prevents tampering — changing the payload breaks the signature.',
  },
  {
    id: 'claim',
    term: 'Claim',
    definition: 'A key-value pair inside a JWT payload asserting something about the user or token, e.g. `{ "role": "admin" }`.',
  },
  {
    id: 'bearer-token',
    term: 'Bearer Token',
    definition: 'Auth scheme where the client sends `Authorization: Bearer <token>` in every request header.',
  },
  {
    id: 'secret-key',
    term: 'Secret Key',
    definition: 'A server-only string used to sign and verify JWTs. Must never be exposed to the client.',
  },
  // Indexing
  {
    id: 'index',
    term: 'Index',
    definition: 'A sorted data structure (B-Tree) built alongside a collection to speed up queries without scanning every document.',
  },
  {
    id: 'collscan',
    term: 'COLLSCAN',
    definition: 'Collection Scan — MongoDB reads every document in a collection to find matches. O(n) and very slow on large collections.',
  },
  {
    id: 'ixscan',
    term: 'IXSCAN',
    definition: 'Index Scan — MongoDB walks a B-Tree index to find matching document pointers. O(log n) — dramatically faster than COLLSCAN.',
  },
  {
    id: 'b-tree',
    term: 'B-Tree',
    definition: 'The balanced tree data structure MongoDB uses for indexes. Keeps data sorted and allows logarithmic-time lookups.',
  },
  {
    id: 'compound-index',
    term: 'Compound Index',
    definition: 'An index on multiple fields, e.g. `{ email: 1, role: 1 }`. Useful when queries filter on multiple fields together.',
  },
  {
    id: 'explain',
    term: '.explain()',
    definition: 'MongoDB method that returns the query execution plan, showing whether MongoDB used COLLSCAN or IXSCAN.',
  },
  // Event Loop
  {
    id: 'event-loop',
    term: 'Event Loop',
    definition: 'Node.js mechanism that continuously checks queues and executes callbacks, enabling non-blocking I/O on a single thread.',
  },
  {
    id: 'call-stack',
    term: 'Call Stack',
    definition: 'LIFO structure tracking which function is currently executing. JavaScript runs one function at a time from this stack.',
  },
  {
    id: 'microtask-queue',
    term: 'Microtask Queue',
    definition: 'High-priority queue for Promise callbacks and `queueMicrotask`. Always drained completely before the event loop moves on.',
  },
  {
    id: 'macrotask-queue',
    term: 'Macrotask Queue',
    definition: 'Lower-priority queue for `setTimeout`, `setInterval`, and I/O callbacks. One task runs per event loop iteration.',
  },
  {
    id: 'libuv',
    term: 'libuv',
    definition: 'C library under Node.js that provides the event loop, thread pool, and async I/O primitives across operating systems.',
  },
  {
    id: 'timers-phase',
    term: 'Timers Phase',
    definition: 'First phase of the event loop — executes `setTimeout` and `setInterval` callbacks whose delay has elapsed.',
  },
  {
    id: 'poll-phase',
    term: 'Poll Phase',
    definition: 'The heart of the event loop — waits for I/O events and executes their callbacks. The loop spends most time here.',
  },
  // Cache
  {
    id: 'cache',
    term: 'Cache',
    definition: 'A fast-access storage layer (usually in-memory, e.g. Redis) that stores results of expensive operations for quick re-use.',
  },
  {
    id: 'cache-aside',
    term: 'Cache-Aside',
    definition: 'Read pattern: app checks cache first; on miss, fetches from DB and populates cache. Application controls cache population.',
  },
  {
    id: 'cache-hit',
    term: 'Cache Hit',
    definition: 'When the requested data is found in the cache — no DB query needed, response is instant.',
  },
  {
    id: 'cache-miss',
    term: 'Cache Miss',
    definition: 'When data is NOT in cache — the app must fall back to the database and then store the result in cache.',
  },
  {
    id: 'ttl',
    term: 'TTL',
    definition: 'Time To Live — how long a cached value stays valid before expiring. Prevents stale data from being served.',
  },
  {
    id: 'redis',
    term: 'Redis',
    definition: 'In-memory key-value store commonly used as a cache, message broker, and session store in Node.js applications.',
  },
  {
    id: 'stale-data',
    term: 'Stale Data',
    definition: 'Cached data that no longer matches the source of truth (the database). Managed via TTL or explicit cache invalidation.',
  },
]

export const glossaryMap = Object.fromEntries(glossary.map(t => [t.id, t]))
