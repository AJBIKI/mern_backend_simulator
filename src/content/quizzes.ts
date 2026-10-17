export interface Quiz {
  id: string;
  conceptId: string;
  question: string;
  code: string;              // 3–10 lines
  options: string[];         // exactly 4
  correctIndex: number;
  explanation: string;       // 2–3 sentences
}

export const quizzes: Quiz[] = [
  // ─── 1. Middleware Pipeline ──────────────────────────────────────────────
  {
    id: 'quiz-middleware-order',
    conceptId: 'middleware-pipeline',
    question: 'What is logged to the console when a GET /test request is handled?',
    code: `app.use((req, res, next) => {
  console.log('A');
  next();
  console.log('B');
});
app.get('/test', (req, res) => {
  console.log('C');
  res.send('ok');
});`,
    options: ['A, B, C', 'A, C, B', 'C, A, B', 'A, C'],
    correctIndex: 1,
    explanation: 'Code after next() executes as the call stack unwinds. Express calls the first middleware which logs "A", invokes next() to run the route handler logging "C", and then control returns to log "B".',
  },
  {
    id: 'quiz-middleware-missing-next',
    conceptId: 'middleware-pipeline',
    question: 'What happens when a client sends a GET /data request without an Authorization header?',
    code: `app.use((req, res, next) => {
  console.log('Checking auth');
  if (req.headers['authorization']) {
    next();
  }
});
app.get('/data', (req, res) => res.json({ secret: 42 }));`,
    options: [
      'Returns 401 Unauthorized automatically',
      'The client request hangs until timing out',
      'Returns 404 Not Found',
      'Throws an unhandled exception in Node',
    ],
    correctIndex: 1,
    explanation: 'Express middleware must either invoke next() or send a response via res.send()/res.json(). Without either, the HTTP connection remains open and the client will eventually time out.',
  },

  // ─── 2. HTTP Response & Status Codes ─────────────────────────────────────
  {
    id: 'quiz-status-204-body',
    conceptId: 'http-response-status-codes',
    question: 'What body content will the client receive from this DELETE endpoint?',
    code: `app.delete('/item/1', (req, res) => {
  res.status(204).json({ success: true, message: 'Deleted' });
});`,
    options: [
      '{"success": true, "message": "Deleted"}',
      'An empty response body (0 bytes)',
      'null',
      'Throws HTTP 500 header mismatch error',
    ],
    correctIndex: 1,
    explanation: 'HTTP 204 indicates "No Content". Per HTTP standards, 204 responses must not include a message body, so Express and web clients drop any payload provided.',
  },
  {
    id: 'quiz-status-headers-sent',
    conceptId: 'http-response-status-codes',
    question: 'What happens when invoking GET /user without an "id" query parameter?',
    code: `app.get('/user', (req, res) => {
  if (!req.query.id) {
    res.status(400).send('ID required');
  }
  res.send('User data');
});`,
    options: [
      'Sends 400 "ID required" and exits cleanly',
      'Sends 200 "User data"',
      'Sends 400 then throws ERR_HTTP_HEADERS_SENT',
      'Sends both responses combined',
    ],
    correctIndex: 2,
    explanation: 'Calling res.send() does not terminate function execution. Without a return statement, execution falls through to the second res.send(), throwing an ERR_HTTP_HEADERS_SENT exception.',
  },

  // ─── 3. Callbacks → Promises → async/await ───────────────────────────────
  {
    id: 'quiz-async-try-catch',
    conceptId: 'callbacks-promises-async',
    question: 'What is logged when calling fetchUser()?',
    code: `async function fetchUser() {
  try {
    return await Promise.reject(new Error('DB Failed'));
  } catch (err) {
    return 'fallback user';
  }
}
fetchUser().then(console.log);`,
    options: [
      'fallback user',
      'UnhandledPromiseRejectionError',
      'undefined',
      'Error: DB Failed',
    ],
    correctIndex: 0,
    explanation: 'Using await on a rejected promise converts the rejection into a thrown exception caught by the catch block. The catch block returns "fallback user", resolving the outer promise successfully.',
  },
  {
    id: 'quiz-async-return-no-await',
    conceptId: 'callbacks-promises-async',
    question: 'What will be output by this code?',
    code: `async function getUser() {
  try {
    return Promise.reject(new Error('fail'));
  } catch (err) {
    return 'caught!';
  }
}
getUser().catch(err => console.log('handled:', err.message));`,
    options: [
      'caught!',
      'handled: fail',
      'undefined',
      'UnhandledPromiseRejectionWarning',
    ],
    correctIndex: 1,
    explanation: 'Returning a promise without await returns the pending promise directly before it rejects. The local try/catch is bypassed, so the outer caller must handle the rejection.',
  },

  // ─── 4. Routing ──────────────────────────────────────────────────────────
  {
    id: 'quiz-routing-order',
    conceptId: 'routing',
    question: 'What response does GET /users/me return?',
    code: `app.get('/users/:id', (req, res) => {
  res.send('User: ' + req.params.id);
});
app.get('/users/me', (req, res) => {
  res.send('Current Profile');
});`,
    options: [
      'Current Profile',
      'User: me',
      '404 Not Found',
      '400 Bad Request',
    ],
    correctIndex: 1,
    explanation: 'Express evaluates routes sequentially in the order registered. Because /users/:id is registered first, it captures "me" as req.params.id, never reaching the /users/me handler.',
  },
  {
    id: 'quiz-routing-param-mw',
    conceptId: 'routing',
    question: 'What is the output of GET /items/42?',
    code: `app.param('id', (req, res, next, id) => {
  req.itemId = parseInt(id, 10);
  next();
});
app.get('/items/:id', (req, res) => {
  res.json({ type: typeof req.itemId, val: req.itemId });
});`,
    options: [
      '{"type":"number","val":42}',
      '{"type":"string","val":"42"}',
      '{"type":"undefined"}',
      '404 Not Found',
    ],
    correctIndex: 0,
    explanation: 'app.param triggers parameter middleware whenever :id is matched. It parses the string into an integer and assigns it to req.itemId before the route handler runs.',
  },

  // ─── 5. Error Handling 101 ───────────────────────────────────────────────
  {
    id: 'quiz-error-arity',
    conceptId: 'error-handling-101',
    question: 'What does a client receive when requesting GET /boom?',
    code: `app.use((err, req, res) => {
  res.status(500).send('Custom: ' + err.message);
});
app.get('/boom', (req, res, next) => {
  next(new Error('Kaboom'));
});`,
    options: [
      'Custom: Kaboom',
      'Default Express HTML error page with status 500',
      '200 OK',
      'Request hangs indefinitely',
    ],
    correctIndex: 1,
    explanation: 'Express distinguishes error middleware exclusively by checking function.length === 4 (err, req, res, next). A 3-parameter function is treated as standard middleware and skipped during error propagation.',
  },
  {
    id: 'quiz-error-async-bubble',
    conceptId: 'error-handling-101',
    question: 'In Express 4.x, what happens when requesting GET /crash?',
    code: `app.get('/crash', async (req, res) => {
  throw new Error('Async boom');
});
app.use((err, req, res, next) => {
  res.status(500).send('Caught error');
});`,
    options: [
      'Returns 500 "Caught error"',
      'Request hangs and an unhandled rejection is logged',
      'Returns 200 OK with empty body',
      'Returns 404 Not Found',
    ],
    correctIndex: 1,
    explanation: 'Express 4 does not automatically catch unhandled promise rejections in async route handlers. Without wrapping with try/catch and passing to next(err), the request stalls until client timeout.',
  },

  // ─── 6. JWT Anatomy ──────────────────────────────────────────────────────
  {
    id: 'quiz-jwt-decoding',
    conceptId: 'jwt-anatomy',
    question: 'Can an observer read the claims inside a signed JWT without knowing the secret key?',
    code: `const token = "eyJhbGciOiJIUzI1NiJ9.eyJhZG1pbiI6dHJ1ZX0.sig";
const payload = Buffer.from(token.split('.')[1], 'base64url').toString();
console.log(JSON.parse(payload));`,
    options: [
      'No, JWT payloads are AES encrypted by default',
      'Yes, the payload is Base64URL encoded JSON, not encrypted',
      'Only if the algorithm header is set to "none"',
      'Only with the server private key',
    ],
    correctIndex: 1,
    explanation: 'JWTs are signed, not encrypted. The payload is standard Base64URL encoded text that anyone can decode; signatures verify authenticity and tamper-resistance, not confidentiality.',
  },
  {
    id: 'quiz-jwt-expiry-check',
    conceptId: 'jwt-anatomy',
    question: 'What error is thrown when verifying an expired token with jsonwebtoken?',
    code: `const token = jwt.sign({ user: 'bob' }, 'secret', { expiresIn: '-5s' });
try {
  jwt.verify(token, 'secret');
} catch (err) {
  console.log(err.name);
}`,
    options: [
      'TokenExpiredError',
      'JsonWebTokenError',
      'NotBeforeError',
      'SignatureVerificationError',
    ],
    correctIndex: 0,
    explanation: 'jwt.verify inspects the exp timestamp against Date.now() / 1000. When expired, it throws TokenExpiredError with properties expiredAt and message "jwt expired".',
  },

  // ─── 7. Indexing: COLLSCAN vs IXSCAN ──────────────────────────────────────
  {
    id: 'quiz-index-prefix-order',
    conceptId: 'indexing-collscan-ixscan',
    question: 'Which execution stage will MongoDB use for this query on a { age: 1, name: 1 } index?',
    code: `// Collection has index: { age: 1, name: 1 }
db.users.find({ name: 'Charlie' }).explain('executionStats');`,
    options: [
      'IXSCAN (Index Scan)',
      'COLLSCAN (Collection Scan)',
      'TEXT scan',
      'GEO scan',
    ],
    correctIndex: 1,
    explanation: 'Compound indexes require query predicates to match an index prefix starting from the first key. Filtering only on "name" skips the leading "age" field, forcing MongoDB into a full COLLSCAN.',
  },
  {
    id: 'quiz-index-covered-query',
    conceptId: 'indexing-collscan-ixscan',
    question: 'Why does this query avoid reading documents from disk (totalDocsExamined: 0)?',
    code: `// Index exists: { email: 1 }
db.users.find(
  { email: 'user@test.com' },
  { _id: 0, email: 1 }
).explain('executionStats');`,
    options: [
      'It is a covered query satisfying all fields from the index',
      'MongoDB stores the entire document inside memory buffers',
      'The query uses collation optimization',
      'The query returns no results',
    ],
    correctIndex: 0,
    explanation: 'A covered query occurs when all filtered fields and projected fields are in the index and _id is excluded ({ _id: 0 }). MongoDB answers the query directly from the B-tree without disk fetch.',
  },

  // ─── 8. Rate Limiting ────────────────────────────────────────────────────
  {
    id: 'quiz-ratelimit-429',
    conceptId: 'rate-limiting',
    question: 'What status code is returned when a client exceeds their rate limit threshold?',
    code: `const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 2 });
app.use('/api', limiter);
// Client sends 3 consecutive requests in 10 seconds`,
    options: [
      '400 Bad Request',
      '429 Too Many Requests',
      '503 Service Unavailable',
      '403 Forbidden',
    ],
    correctIndex: 1,
    explanation: 'HTTP 429 Too Many Requests is the standard response for rate limiting. It informs the client that their quota window is exhausted and provides Retry-After headers.',
  },
  {
    id: 'quiz-ratelimit-proxy-ip',
    conceptId: 'rate-limiting',
    question: 'What happens if express-rate-limit is used behind Nginx without app.set("trust proxy", 1)?',
    code: `// Node app deployed behind Nginx reverse proxy
const limiter = rateLimit({ windowMs: 60000, max: 10 });
app.use(limiter);`,
    options: [
      'All users share the proxy IP and quickly exhaust the shared quota',
      'Rate limiting throws a fatal socket error',
      'Every request passes through without any rate limiting',
      'The server sends 502 Bad Gateway',
    ],
    correctIndex: 0,
    explanation: 'Without "trust proxy", Express reads req.ip from the direct TCP socket which is the reverse proxy IP. All clients appear to share that single IP address, sharing and rapidly depleting the limit.',
  },

  // ─── 9. Aggregation Pipeline ─────────────────────────────────────────────
  {
    id: 'quiz-agg-match-index',
    conceptId: 'aggregation-pipeline',
    question: 'Can MongoDB use an index on { total: 1 } in this pipeline?',
    code: `db.orders.aggregate([
  { $group: { _id: "$customer", total: { $sum: "$amount" } } },
  { $match: { total: { $gt: 100 } } }
]);`,
    options: [
      'Yes, MongoDB uses index scans on the orders collection',
      'No, because "total" was computed in memory by the preceding $group',
      'Yes, by automatically converting to a MapReduce job',
      'Only if $sort is placed before $match',
    ],
    correctIndex: 1,
    explanation: 'Indexes on collection fields can only be leveraged at the beginning of a pipeline before document shapes change. Because "total" is computed dynamically by $group, the $match filters documents in RAM.',
  },
  {
    id: 'quiz-agg-unwind-empty',
    conceptId: 'aggregation-pipeline',
    question: 'What happens to a document where items is [] when $unwind: "$items" runs?',
    code: `// Document: { _id: 1, items: [] }
db.orders.aggregate([
  { $unwind: "$items" }
]);`,
    options: [
      'The document is omitted from output results',
      'Outputs { _id: 1, items: null }',
      'Outputs { _id: 1, items: [] } unchanged',
      'Throws an aggregation execution error',
    ],
    correctIndex: 0,
    explanation: 'By default, $unwind removes documents whose target array field is empty, null, or missing. To retain them, pass { path: "$items", preserveNullAndEmptyArrays: true }.',
  },

  // ─── 10. Event Loop Deep Dive ────────────────────────────────────────────
  {
    id: 'quiz-eventloop-microtask-order',
    conceptId: 'event-loop-deep-dive',
    question: 'What is the exact sequence printed to the console?',
    code: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
process.nextTick(() => console.log('4'));
console.log('5');`,
    options: [
      '1, 5, 4, 3, 2',
      '1, 5, 3, 4, 2',
      '1, 2, 3, 4, 5',
      '1, 4, 3, 2, 5',
    ],
    correctIndex: 0,
    explanation: 'Synchronous code runs first ("1", "5"). Next, microtasks drain, where process.nextTick takes priority over resolved Promises ("4", "3"). Lastly, the event loop runs macrotask timers ("2").',
  },
  {
    id: 'quiz-eventloop-io-immediate',
    conceptId: 'event-loop-deep-dive',
    question: 'Inside an I/O callback, what is the guaranteed execution order?',
    code: `const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});`,
    options: [
      'Always "immediate" then "timeout"',
      'Always "timeout" then "immediate"',
      'Non-deterministic based on OS clock resolution',
      'Both execute simultaneously on worker threads',
    ],
    correctIndex: 0,
    explanation: 'Inside an I/O callback in the Poll phase, the next immediate phase is Check (which runs setImmediate). Timers are only checked on the subsequent tick, ensuring setImmediate always runs first.',
  },
];

export const quizzesByConcept = quizzes.reduce<Record<string, Quiz[]>>((acc, q) => {
  if (!acc[q.conceptId]) acc[q.conceptId] = [];
  acc[q.conceptId].push(q);
  return acc;
}, {});
