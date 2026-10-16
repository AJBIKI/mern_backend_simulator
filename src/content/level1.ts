import type { Concept } from './types'

// ─── Helpers for TwoPanelCompare step data ───────────────────────────────────
function tpc(data: object): string {
  return JSON.stringify(data)
}

// ─── Helpers for URLMatcher step data ────────────────────────────────────────
function um(data: object): string {
  return JSON.stringify(data)
}

export const level1Concepts: Concept[] = [
  // ─── 1. HTTP Request Anatomy (unchanged) ────────────────────────────────────
  {
    id: 'http-request-anatomy',
    level: 1,
    order: 1,
    title: 'HTTP Request Anatomy',
    oneLiner: 'Every request is an envelope: method, URL, headers, and body.',
    mentalModel:
      'Think of an HTTP request like mailing a letter. The envelope has a "To" address (URL), a service type (method), instructions for handling (headers), and optionally a letter inside (body). The post office (server) reads the envelope and sends back a reply.',
    viz: {
      component: 'SequenceSwimlane',
      steps: [
        {
          label: 'Client builds request',
          caption: 'Browser or API client assembles method (GET), URL, and headers before sending anything.',
          highlights: ['client'],
        },
        {
          label: 'Request travels to server',
          caption: 'The request crosses the network. Headers like Content-Type and Authorization travel with it.',
          highlights: ['client-to-server'],
        },
        {
          label: 'Server parses request',
          caption: 'Express reads req.method, req.url, req.headers, req.body — all available in your route handler.',
          highlights: ['server'],
        },
        {
          label: 'Server queries database',
          caption: 'For data requests, the server talks to MongoDB. The query runs and results are returned.',
          highlights: ['server-to-db'],
        },
        {
          label: 'Response sent back',
          caption: 'Server builds a response: status code 200, JSON body, response headers. Client receives it.',
          highlights: ['server-to-client'],
        },
      ],
    },
    snippet: {
      lang: 'js',
      code: `// Express route — anatomy visible in req object
app.get('/users/:id', async (req, res) => {
  // URL params
  const { id } = req.params;       // /users/42 → id="42"

  // Query string
  const { format } = req.query;    // ?format=json

  // Headers
  const auth = req.headers['authorization'];

  // Body (POST/PUT only)
  // const data = req.body;

  const user = await User.findById(id);
  res.status(200).json({ user });  // status + body
});`,
      highlights: { 3: 'emerald', 6: 'amber', 9: 'rose', 15: 'emerald' },
    },
    terms: ['http', 'request', 'response', 'method', 'status-code', 'header', 'body', 'url', 'query-string'],
    pitfalls: [
      'GET requests should never have a body — proxies and caches may strip it silently.',
      "Forgetting `Content-Type: application/json` means Express won't parse req.body (requires express.json() middleware too).",
      'Status codes matter — sending 200 for an error confuses clients and monitoring tools. Use 4xx/5xx correctly.',
    ],
    interview: [
      'What is the difference between req.params, req.query, and req.body in Express?',
      'Why do we need the Content-Type header when sending a POST request?',
    ],
    next: ['middleware-pipeline', 'client-server-model', 'http-response-status-codes'],
  },

  // ─── 2. Middleware Pipeline (unchanged) ─────────────────────────────────────
  {
    id: 'middleware-pipeline',
    level: 1,
    order: 2,
    title: 'Middleware Pipeline',
    oneLiner: 'Middleware functions process a request in a chain — each one passes control to the next.',
    mentalModel:
      "Picture airport security: passport control, X-ray scan, boarding gate check — each station does one job and waves you through (or stops you). Express middleware works the same way: each function either calls next() to continue or sends a response to stop the chain.",
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Request enters pipeline',
          caption: 'An incoming request hits the first registered middleware. The pipeline has not started processing yet.',
          highlights: ['stage-0'],
        },
        {
          label: 'Logger middleware',
          caption: 'Logs method and URL, then calls next(). The request passes through — this stage always lets it continue.',
          highlights: ['stage-1'],
        },
        {
          label: 'Auth middleware',
          caption: 'Checks Authorization header. If token is valid, calls next(). If missing or invalid, calls res.status(401).json({...}) and the chain stops.',
          highlights: ['stage-2'],
        },
        {
          label: 'Body parser',
          caption: 'express.json() parses the raw request body and attaches it to req.body. Calls next().',
          highlights: ['stage-3'],
        },
        {
          label: 'Route handler',
          caption: 'Final stop — the route handler sends the actual response. No next() call needed here.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import express from 'express'
const app = express()

// 1. Global middleware (runs on every request)
app.use(express.json())
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.url}\`)
  next()                        // pass control forward
})

// 2. Route-level middleware
function requireAuth(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// 3. Route handler — end of the chain
app.get('/dashboard', requireAuth, (req, res) => {
  res.json({ page: 'dashboard' })
})`,
      highlights: { 8: 'emerald', 13: 'rose', 14: 'rose', 15: 'emerald', 20: 'amber' },
    },
    terms: ['middleware', 'next', 'pipeline', 'route-handler', 'error-middleware'],
    pitfalls: [
      "Forgetting to call next() (or send a response) leaves the request hanging forever — the client times out.",
      'Order matters: body-parser must come before any middleware that reads req.body.',
      "Error middleware must have exactly 4 parameters (err, req, res, next) — Express won't treat it as error middleware otherwise.",
    ],
    interview: [
      'What happens if a middleware function neither calls next() nor sends a response?',
      'How do you write an error-handling middleware in Express, and where should it be registered?',
    ],
    next: ['http-request-anatomy', 'jwt-anatomy', 'error-handling-101'],
  },

  // ─── 3. Client–Server Model ─────────────────────────────────────────────────
  {
    id: 'client-server-model',
    level: 1,
    order: 3,
    title: 'Client–Server Model',
    oneLiner: 'The client asks; the server answers — they never talk to each other directly.',
    mentalModel:
      'A restaurant: you (client) order from a menu; the kitchen (server) prepares the food and sends it back. You never walk into the kitchen — you only interact via the waiter (the HTTP protocol).',
    viz: {
      component: 'SequenceSwimlane',
      steps: [
        {
          label: 'Client initiates',
          caption: 'The client (browser, mobile app, Postman) always sends the first message. Servers only react — they never push unsolicited data in basic HTTP.',
          highlights: ['client'],
        },
        {
          label: 'Request sent over network',
          caption: 'The request travels via TCP/IP to the server\'s IP address on port 80 (HTTP) or 443 (HTTPS).',
          highlights: ['client-to-server'],
        },
        {
          label: 'Server receives and processes',
          caption: 'The server reads the request, runs business logic (validates, queries DB, applies rules), and prepares a response.',
          highlights: ['server'],
        },
        {
          label: 'Server may query database',
          caption: 'Most responses require data. The server queries MongoDB and waits for results before continuing.',
          highlights: ['server-to-db'],
        },
        {
          label: 'Response returned to client',
          caption: 'Server sends back status code + body. The connection may close (HTTP/1.1) or be reused (HTTP/2). Client renders the result.',
          highlights: ['server-to-client'],
        },
      ],
    },
    snippet: {
      lang: 'js',
      code: `// Server: Express listening for client requests
import express from 'express'
const app = express()

app.get('/ping', (req, res) => {
  // Server only reacts — client initiated this
  res.json({ message: 'pong', ts: Date.now() })
})

app.listen(3000, () => {
  console.log('Server ready on http://localhost:3000')
})

// Client: fetch API (browser or Node.js)
const data = await fetch('http://localhost:3000/ping')
const json = await data.json()
console.log(json.message)  // "pong"`,
      highlights: { 5: 'emerald', 6: 'amber', 7: 'emerald', 14: 'rose', 15: 'rose' },
    },
    terms: ['client', 'server', 'http', 'tcp', 'port', 'protocol'],
    pitfalls: [
      'Basic HTTP is stateless — the server forgets the client after each response. Sessions/cookies/tokens are needed to remember state.',
      'Clients and servers must agree on a shared protocol (JSON over REST, or GraphQL, etc.) — otherwise they cannot understand each other.',
      'Never expose raw database errors to the client — always map server errors to clean, safe HTTP responses.',
    ],
    interview: [
      'Why is HTTP described as a stateless protocol, and how do you maintain state across requests?',
      'What is the difference between the client, server, and the database in a 3-tier MERN architecture?',
    ],
    next: ['http-request-anatomy', 'dns-tcp-http-journey', 'rest-principles'],
  },

  // ─── 4. HTTP Response & Status Codes ────────────────────────────────────────
  {
    id: 'http-response-status-codes',
    level: 1,
    order: 4,
    title: 'HTTP Response & Status Codes',
    oneLiner: 'Status codes tell the client exactly what happened — success, error, or redirect.',
    mentalModel:
      'Status codes are like the delivery driver\'s update: "Delivered" (200), "Not at address" (404), "Refused delivery" (403), "Warehouse on fire" (500). A single three-digit number instantly communicates the outcome.',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: '2xx — Success',
          caption: '2xx codes mean the request was received, understood, and accepted. 200 OK is most common; 201 Created is used after POST.',
          highlights: [tpc({
            left: {
              title: '2xx Success',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: '200 OK', value: 'Standard success. Body contains requested data.' },
                { label: '201 Created', value: 'Resource successfully created (POST). Location header often included.' },
                { label: '204 No Content', value: 'Success but no body (DELETE, PATCH with no return).' },
              ],
            },
            right: {
              title: '3xx Redirect',
              color: 'amber',
              rows: [
                { label: '301 Moved', value: 'Permanent redirect. Browser caches the new URL.' },
                { label: '302 Found', value: 'Temporary redirect. Use for login redirects.' },
                { label: '304 Not Modified', value: 'Cached response is still valid. Body is empty.' },
              ],
            },
          })],
        },
        {
          label: '4xx — Client Errors',
          caption: '4xx means the client did something wrong. 401 = not authenticated; 403 = authenticated but not allowed; 404 = resource doesn\'t exist.',
          highlights: [tpc({
            left: {
              title: '4xx Client Error',
              color: 'rose',
              activeRow: 0,
              rows: [
                { label: '400 Bad Request', value: 'Malformed syntax, invalid body, validation failed.' },
                { label: '401 Unauthorized', value: 'Missing or invalid auth credentials.' },
                { label: '403 Forbidden', value: 'Authenticated but lacks permission.' },
                { label: '404 Not Found', value: 'Resource does not exist at this URL.' },
                { label: '429 Too Many', value: 'Rate limit exceeded. Retry after delay.' },
              ],
            },
            right: {
              title: '5xx Server Error',
              color: 'rose',
              rows: [
                { label: '500 Internal', value: 'Unhandled exception on the server.' },
                { label: '502 Bad Gateway', value: 'Upstream server returned an invalid response.' },
                { label: '503 Unavailable', value: 'Server is down or overloaded.' },
                { label: '504 Timeout', value: 'Upstream server took too long to respond.' },
              ],
            },
          })],
        },
        {
          label: '401 vs 403 — Common confusion',
          caption: '401 Unauthorized means "tell me who you are." 403 Forbidden means "I know who you are, but you can\'t do this."',
          highlights: [tpc({
            left: {
              title: '401 Unauthorized',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Meaning', value: 'No credentials provided or token is invalid/expired.' },
                { label: 'Fix', value: 'Client must log in or refresh token.' },
                { label: 'Example', value: 'Missing Authorization header on a protected route.' },
              ],
            },
            right: {
              title: '403 Forbidden',
              color: 'rose',
              activeRow: 0,
              rows: [
                { label: 'Meaning', value: 'Valid credentials, but role/scope insufficient.' },
                { label: 'Fix', value: 'User needs higher privileges — contact admin.' },
                { label: 'Example', value: 'Regular user accessing /admin/users.' },
              ],
            },
            badge: { side: 'left', text: 'not authenticated', color: 'amber' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Always send the right status code
app.post('/users', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  const existing = await User.findOne({ email })
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' })
  }

  const user = await User.create({ email, password })
  res.status(201).json({ id: user._id })   // 201 = Created
})`,
      highlights: { 4: 'rose', 5: 'rose', 8: 'amber', 9: 'amber', 12: 'emerald', 13: 'emerald' },
    },
    terms: ['status-code', 'response', '2xx', '4xx', '5xx', '3xx', 'redirect'],
    pitfalls: [
      'Returning 200 for errors (e.g., `{ success: false }` with status 200) breaks HTTP semantics and confuses monitoring tools.',
      'Using 403 when you mean 401 hides the "please log in" signal from clients — they won\'t know to re-authenticate.',
      'Never expose raw stack traces in 500 responses — log them server-side and return a generic message to the client.',
    ],
    interview: [
      'What is the difference between a 401 and a 403 status code?',
      'When should you use 201 instead of 200 in a REST API?',
    ],
    next: ['http-request-anatomy', 'rest-principles', 'error-handling-101'],
  },

  // ─── 5. Idempotency & Safe Methods ──────────────────────────────────────────
  {
    id: 'idempotency-safe-methods',
    level: 1,
    order: 5,
    title: 'Idempotency & Safe Methods',
    oneLiner: 'Safe methods never change data; idempotent methods are safe to retry without side effects.',
    mentalModel:
      'Pressing a lift button twice doesn\'t call two lifts — it\'s idempotent. But submitting a payment form twice charges you twice — it\'s not idempotent. GET is safe; PUT is idempotent; POST is neither.',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'Safe methods — read only',
          caption: 'Safe methods (GET, HEAD, OPTIONS) never modify server state. They are always safe to retry, cache, or bookmark.',
          highlights: [tpc({
            left: {
              title: 'Safe Methods',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'GET', value: 'Fetch a resource. Never modifies data. Cacheable.' },
                { label: 'HEAD', value: 'Like GET but returns headers only — no body.' },
                { label: 'OPTIONS', value: 'Ask server what methods it supports (used in CORS preflight).' },
              ],
            },
            right: {
              title: 'Unsafe Methods',
              color: 'rose',
              rows: [
                { label: 'POST', value: 'Creates a new resource. NOT idempotent — repeating creates duplicates.' },
                { label: 'PUT', value: 'Replaces a resource. Idempotent — repeating gives same result.' },
                { label: 'PATCH', value: 'Partially updates a resource. Usually idempotent.' },
                { label: 'DELETE', value: 'Removes a resource. Idempotent — deleting twice is still "gone".' },
              ],
            },
          })],
        },
        {
          label: 'PUT vs POST — idempotency in action',
          caption: 'POST /orders sends payment twice → two charges. PUT /orders/42 sent twice → same order, no duplicate.',
          highlights: [tpc({
            left: {
              title: 'POST (NOT idempotent)',
              color: 'rose',
              activeRow: 0,
              rows: [
                { label: 'Request 1', value: 'POST /orders → creates Order #100, charges card.' },
                { label: 'Request 2', value: 'POST /orders → creates Order #101, charges card again!' },
                { label: 'Result', value: 'Two separate orders. Network retry = double charge.' },
              ],
            },
            right: {
              title: 'PUT (idempotent)',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Request 1', value: 'PUT /orders/42 → sets order to "confirmed".' },
                { label: 'Request 2', value: 'PUT /orders/42 → sets order to "confirmed" again.' },
                { label: 'Result', value: 'Same state. Safe to retry on network failure.' },
              ],
            },
            badge: { side: 'right', text: 'retry-safe', color: 'emerald' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'js',
      code: `// POST — creates new resource (NOT idempotent)
app.post('/orders', async (req, res) => {
  const order = await Order.create(req.body)
  res.status(201).json(order)     // new _id every call
})

// PUT — replaces resource (idempotent)
app.put('/orders/:id', async (req, res) => {
  const order = await Order.findByIdAndReplace(
    req.params.id,
    req.body,
    { new: true, upsert: true }   // same result on retry
  )
  res.json(order)
})`,
      highlights: { 1: 'rose', 3: 'rose', 7: 'emerald', 8: 'emerald', 11: 'emerald' },
    },
    terms: ['idempotency', 'safe-method', 'method', 'put', 'post'],
    pitfalls: [
      'Using POST for operations that should be idempotent (e.g., "confirm order") causes duplicate processing on retries.',
      'DELETE is idempotent but not safe — calling DELETE /users/42 twice is fine (same result), but it does change state.',
      'PUT should replace the entire resource — using it for partial updates (like PATCH) leads to unintentional data loss.',
    ],
    interview: [
      'What does "idempotent" mean and which HTTP methods are idempotent?',
      'Why is POST not considered idempotent, and what problems does this cause in distributed systems?',
    ],
    next: ['http-request-anatomy', 'rest-principles', 'http-response-status-codes'],
  },

  // ─── 6. DNS → TCP → HTTP Journey ────────────────────────────────────────────
  {
    id: 'dns-tcp-http-journey',
    level: 1,
    order: 6,
    title: 'DNS → TCP → HTTP Journey',
    oneLiner: 'Before your request reaches the server, DNS resolves the domain and TCP opens a connection.',
    mentalModel:
      'Navigating to a website is like calling a friend: first you look up their number in the contacts (DNS), then your phone connects the call (TCP handshake), and only then you say hello (HTTP request). Most developers skip steps 1–2 because browsers handle them invisibly.',
    viz: {
      component: 'SequenceSwimlane',
      steps: [
        {
          label: 'DNS lookup',
          caption: 'Browser checks its cache, then asks a DNS resolver: "What is the IP address for api.example.com?" Answer: 203.0.113.42.',
          highlights: ['client'],
        },
        {
          label: 'TCP handshake (SYN → SYN-ACK → ACK)',
          caption: 'Client and server exchange three packets to establish a reliable connection before any HTTP data flows.',
          highlights: ['client-to-server'],
        },
        {
          label: 'TLS handshake (HTTPS only)',
          caption: 'Client and server negotiate an encryption cipher and exchange certificates. This adds ~1 round trip but secures all traffic.',
          highlights: ['server'],
        },
        {
          label: 'HTTP request sent',
          caption: 'Now the actual HTTP request (GET /users HTTP/1.1 + headers + body) travels over the established TCP connection.',
          highlights: ['client-to-server'],
        },
        {
          label: 'Server processes & responds',
          caption: 'Your Express app receives the request, runs middleware, queries MongoDB, and sends back a response.',
          highlights: ['server-to-db'],
        },
        {
          label: 'Response received',
          caption: 'Client receives the HTTP response. Connection is kept alive (HTTP/1.1 keep-alive) or closed after response.',
          highlights: ['server-to-client'],
        },
      ],
    },
    snippet: {
      lang: 'bash',
      code: `# Inspect each layer of the journey with curl
# --resolve overrides DNS (skips lookup)
# --verbose shows TCP + TLS handshake details

curl --verbose \\
     --resolve api.example.com:443:203.0.113.42 \\
     https://api.example.com/users

# Key output sections:
# *  Trying 203.0.113.42...         ← TCP connect
# *  SSL handshake                  ← TLS (HTTPS)
# > GET /users HTTP/2               ← HTTP request
# < HTTP/2 200                      ← HTTP response`,
      highlights: { 5: 'emerald', 6: 'amber', 10: 'emerald', 11: 'emerald', 12: 'rose', 13: 'rose' },
    },
    terms: ['dns', 'tcp', 'tls', 'ip-address', 'port', 'handshake', 'http'],
    pitfalls: [
      'DNS caching can cause stale IP lookups — always set short TTLs for DNS records when doing deployments or failover.',
      'TLS adds latency, but HTTP/2 multiplexing and TLS session resumption make the overhead negligible in practice.',
      'Forgetting that TCP keeps connections alive by default (keep-alive) — opening too many connections can exhaust server file descriptors.',
    ],
    interview: [
      'What happens between typing a URL in the browser and the first byte of the response arriving?',
      'What is the purpose of a TLS handshake and where does it fit in relation to the HTTP request?',
    ],
    next: ['client-server-model', 'http-request-anatomy', 'cors-preflight'],
  },

  // ─── 7. What is Node.js ─────────────────────────────────────────────────────
  {
    id: 'what-is-nodejs',
    level: 1,
    order: 7,
    title: 'What is Node.js',
    oneLiner: 'Node.js runs JavaScript on the server using Chrome\'s V8 engine, not a browser.',
    mentalModel:
      'Imagine JavaScript as a language spoken only inside a specific building (the browser). Node.js is a portable speaker that lets JavaScript be spoken anywhere — on servers, in terminals, even on IoT devices. The language is the same; the environment changes.',
    viz: {
      component: 'SequenceSwimlane',
      steps: [
        {
          label: 'JavaScript code runs',
          caption: 'Your JS code (app.js) is loaded and executed by V8 — the same engine Chrome uses. V8 compiles JS to machine code.',
          highlights: ['client'],
        },
        {
          label: 'Node.js APIs called',
          caption: 'When your code calls fs.readFile() or http.createServer(), these calls hit Node.js built-in modules written in C++.',
          highlights: ['client-to-server'],
        },
        {
          label: 'libuv handles async I/O',
          caption: 'libuv receives the I/O request and decides: use the OS event notification (epoll/kqueue) or dispatch to the thread pool.',
          highlights: ['server'],
        },
        {
          label: 'Thread pool or OS event',
          caption: 'File I/O and DNS lookups go to libuv\'s thread pool (4 threads default). Network I/O uses OS async primitives — no thread needed.',
          highlights: ['server-to-db'],
        },
        {
          label: 'Callback returned to event loop',
          caption: 'When I/O completes, the callback is placed in the event queue. The event loop picks it up and runs it on the main JS thread.',
          highlights: ['server-to-client'],
        },
      ],
    },
    snippet: {
      lang: 'js',
      code: `// Node.js: same JS syntax, server-side APIs
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'

// File I/O — async, doesn't block
const content = await readFile('./data.json', 'utf8')

// Built-in HTTP server (Express wraps this)
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Hello from Node.js!')
})

server.listen(3000)
console.log('Node.js version:', process.version)`,
      highlights: { 2: 'emerald', 3: 'emerald', 6: 'amber', 9: 'rose', 12: 'emerald' },
    },
    terms: ['nodejs', 'v8', 'libuv', 'event-loop', 'thread-pool', 'runtime'],
    pitfalls: [
      'Node.js is single-threaded for JS execution — one CPU-bound loop blocks ALL requests. Use worker threads for heavy compute.',
      'Node.js is not a web server — it\'s a runtime. Express (or Fastify) is the web framework built on top of Node\'s http module.',
      'process.env is only available server-side — never bundle server-only environment variables into client-side React code.',
    ],
    interview: [
      'Why is Node.js suitable for high-concurrency I/O-bound applications despite being single-threaded?',
      'What is the difference between Node.js and a browser JavaScript environment?',
    ],
    next: ['event-loop-intro', 'callbacks-promises-async', 'express-bootstrapping'],
  },

  // ─── 8. Event Loop (Intro) ──────────────────────────────────────────────────
  {
    id: 'event-loop-intro',
    level: 1,
    order: 8,
    title: 'Event Loop (Intro)',
    oneLiner: 'The event loop is what lets Node.js handle many requests without extra threads.',
    mentalModel:
      'The event loop is a chef who keeps checking the counter: "Any orders ready?" When a dish finishes cooking (I/O completes), the chef serves it immediately before checking the next order. No waiting around — always busy, never blocked.',
    viz: {
      component: 'EventLoopClock',
      steps: [
        {
          label: 'Synchronous code runs first',
          caption: 'All synchronous code executes on the call stack. The event loop doesn\'t start until the stack is empty.',
          highlights: ['call-stack'],
        },
        {
          label: 'Timers phase checked',
          caption: 'The loop enters the Timers phase. Any setTimeout/setInterval callbacks whose delay has elapsed run here.',
          highlights: ['timers'],
        },
        {
          label: 'Poll phase — wait for I/O',
          caption: 'The loop reaches Poll and waits for I/O events (file reads, network responses). Most time is spent here.',
          highlights: ['poll'],
        },
        {
          label: 'Check phase — setImmediate',
          caption: 'setImmediate() callbacks run after I/O, in the Check phase — before the next timer tick.',
          highlights: ['check'],
        },
        {
          label: 'Microtasks drain between every phase',
          caption: 'After every phase, ALL Promise.then / queueMicrotask callbacks run before the loop advances. This is why Promises resolve before timers.',
          highlights: ['microtask-queue'],
        },
      ],
    },
    snippet: {
      lang: 'js',
      code: `// Event loop phases — visible in execution order
console.log('A — sync')                          // 1st

setTimeout(() => console.log('C — timer'), 0)    // 3rd

Promise.resolve()
  .then(() => console.log('B — microtask'))      // 2nd

setImmediate(() => console.log('D — check'))     // 4th

// Output: A → B → C → D
// Microtasks always before macrotasks`,
      highlights: { 2: 'emerald', 4: 'amber', 6: 'rose', 8: 'amber' },
    },
    terms: ['event-loop', 'call-stack', 'microtask-queue', 'macrotask-queue', 'timers-phase', 'poll-phase', 'libuv'],
    pitfalls: [
      'Blocking the event loop with synchronous code (JSON.parse on a huge object, a tight loop) stalls all other requests.',
      'Assuming callbacks run "immediately" — they always go through the event loop queue, which may have items ahead of them.',
      'Mixing callbacks and promises in the same async flow creates ordering bugs. Prefer async/await consistently.',
    ],
    interview: [
      'In what order do these run: setTimeout(fn,0), Promise.resolve().then(fn), synchronous code?',
      'What is the Poll phase of the Node.js event loop?',
    ],
    next: ['what-is-nodejs', 'callbacks-promises-async', 'event-loop-deep-dive'],
  },

  // ─── 9. Callbacks → Promises → async/await ──────────────────────────────────
  {
    id: 'callbacks-promises-async',
    level: 1,
    order: 9,
    title: 'Callbacks → Promises → async/await',
    oneLiner: 'Three generations of async code — each generation fixes the readability of the last.',
    mentalModel:
      'Callbacks are a sticky note left on your desk ("call me when done"). Promises are a ticket ("I\'ll call you"). async/await is just a phone call — you write it like you\'re waiting right there, but you\'re not blocking anyone.',
    viz: {
      component: 'QueueLanes',
      steps: [
        {
          label: 'Callback style',
          caption: 'Callbacks pass a function as an argument. On completion, the callback is placed in the macrotask queue and runs.',
          highlights: ['macrotask-queue'],
        },
        {
          label: 'Promise created',
          caption: 'A Promise is created immediately and returned. The async operation runs in the background.',
          highlights: ['call-stack'],
        },
        {
          label: '.then() queued as microtask',
          caption: 'When the Promise resolves, .then() callbacks are placed in the microtask queue — higher priority than setTimeout callbacks.',
          highlights: ['microtask-queue'],
        },
        {
          label: 'async/await — syntactic sugar',
          caption: 'await pauses the async function and lets other code run. Internally, it\'s a .then() in the microtask queue.',
          highlights: ['microtask-queue'],
        },
        {
          label: 'Async function resumes',
          caption: 'After the awaited Promise resolves, the async function resumes — the code after await runs like normal synchronous code.',
          highlights: ['call-stack'],
        },
      ],
    },
    snippet: {
      lang: 'js',
      code: `// The same operation — 3 generations

// 1. Callback (old Node.js style)
fs.readFile('data.json', 'utf8', (err, data) => {
  if (err) throw err
  console.log(JSON.parse(data))         // callback hell risk
})

// 2. Promise
fs.promises.readFile('data.json', 'utf8')
  .then(data => console.log(JSON.parse(data)))
  .catch(err => console.error(err))

// 3. async/await (preferred)
async function load() {
  const data = await fs.promises.readFile('data.json', 'utf8')
  console.log(JSON.parse(data))         // reads like sync code
}`,
      highlights: { 4: 'amber', 9: 'emerald', 10: 'emerald', 14: 'rose', 15: 'rose' },
    },
    terms: ['callback', 'promise', 'async-await', 'microtask-queue', 'macrotask-queue', 'callback-hell'],
    pitfalls: [
      'Callback hell: deeply nested callbacks become unreadable and error-prone — this is why Promises and async/await exist.',
      'Missing `await` before an async call means you get back a Promise object, not the resolved value — a silent bug.',
      'Using `async` without `try/catch` (or `.catch()`) means rejected Promises cause UnhandledPromiseRejection warnings in Node.js.',
    ],
    interview: [
      'What is "callback hell" and how do Promises and async/await solve it?',
      'What happens if you forget the `await` keyword before an async function call?',
    ],
    next: ['event-loop-intro', 'event-loop-deep-dive', 'express-bootstrapping'],
  },

  // ─── 10. Modules: CJS vs ESM ─────────────────────────────────────────────────
  {
    id: 'modules-cjs-vs-esm',
    level: 1,
    order: 10,
    title: 'Modules: CJS vs ESM',
    oneLiner: 'CommonJS and ES Modules are two incompatible ways to share code between files.',
    mentalModel:
      'CJS (require) is like a physical library card catalogue — you pull books at runtime, one by one. ESM (import) is like a digital pre-order list — everything is declared upfront, which enables better static analysis and tree-shaking.',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'Syntax comparison',
          caption: 'CJS uses require() / module.exports (runtime). ESM uses import / export (static, parsed before execution).',
          highlights: [tpc({
            left: {
              title: 'CommonJS (CJS)',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Import', value: 'const express = require("express")' },
                { label: 'Export', value: 'module.exports = { fn }' },
                { label: 'Dynamic', value: 'require() can be inside an if-block or loop.' },
                { label: 'Default in', value: 'Node.js, older npm packages.' },
              ],
            },
            right: {
              title: 'ES Modules (ESM)',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Import', value: 'import express from "express"' },
                { label: 'Export', value: 'export const fn = () => {}' },
                { label: 'Static', value: 'Imports are hoisted and resolved before code runs.' },
                { label: 'Default in', value: 'Modern Node.js ("type":"module"), browsers natively.' },
              ],
            },
          })],
        },
        {
          label: 'Key differences',
          caption: 'ESM is the future standard but requires "type":"module" in package.json or .mjs extension. CJS is synchronous; ESM is asynchronous.',
          highlights: [tpc({
            left: {
              title: 'CJS Behaviour',
              color: 'amber',
              rows: [
                { label: 'Loading', value: 'Synchronous — blocks until module is fully loaded.' },
                { label: '__dirname', value: 'Available automatically.' },
                { label: 'Tree-shaking', value: 'Not possible — bundlers can\'t statically analyse.' },
                { label: 'Top-level await', value: 'Not supported.' },
              ],
            },
            right: {
              title: 'ESM Behaviour',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Loading', value: 'Asynchronous — can\'t block the main thread.' },
                { label: '__dirname', value: 'Not available — use import.meta.url instead.' },
                { label: 'Tree-shaking', value: 'Supported — dead code can be removed by bundlers.' },
                { label: 'Top-level await', value: 'Supported in ESM files.' },
              ],
            },
            badge: { side: 'right', text: 'modern standard', color: 'emerald' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'json',
      code: `// package.json — choose your module system
{
  "name": "my-api",
  "type": "module",       // enables ESM (import/export)
  "scripts": {
    "dev": "node --watch src/index.js"
  }
}

// With "type": "module", all .js files use ESM
// Without it (or "type":"commonjs"), .js = CJS
// Mix both: use .mjs for ESM, .cjs for CJS`,
      highlights: { 4: 'emerald', 11: 'amber' },
    },
    terms: ['cjs', 'esm', 'require', 'module-exports', 'import', 'export', 'tree-shaking'],
    pitfalls: [
      'Mixing CJS and ESM in the same project causes "ERR_REQUIRE_ESM" errors — pick one system and stay consistent.',
      '__dirname and __filename are not available in ESM — use `import.meta.url` and `path.dirname(fileURLToPath(...))` instead.',
      'Many older npm packages are CJS-only. If your project is ESM, you can still `import` them, but you cannot `require()` ESM packages.',
    ],
    interview: [
      'What is the difference between CommonJS (require) and ES Modules (import)?',
      'How do you use __dirname equivalent in an ES Module file?',
    ],
    next: ['npm-package-json', 'what-is-nodejs', 'express-bootstrapping'],
  },

  // ─── 11. npm & package.json ──────────────────────────────────────────────────
  {
    id: 'npm-package-json',
    level: 1,
    order: 11,
    title: 'npm & package.json',
    oneLiner: 'npm is the package manager; package.json is your project\'s manifest of dependencies and scripts.',
    mentalModel:
      'package.json is like a shopping list — it says what packages you need. npm install is the shopping trip — it fetches everything on the list into the node_modules bag. You never commit the bag, only the list.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'npm install triggered',
          caption: 'Running `npm install` reads package.json and fetches all listed dependencies from the npm registry.',
          highlights: ['stage-0'],
        },
        {
          label: 'Dependency resolution',
          caption: 'npm resolves the full dependency tree — each package may depend on other packages, creating a deep graph.',
          highlights: ['stage-1'],
        },
        {
          label: 'Lockfile check',
          caption: 'package-lock.json locks exact versions. If it exists, npm installs those exact versions instead of resolving again.',
          highlights: ['stage-2'],
        },
        {
          label: 'Packages downloaded',
          caption: 'Packages are downloaded from the registry (or cache) and placed in node_modules/.',
          highlights: ['stage-3'],
        },
        {
          label: 'Scripts available',
          caption: 'After install, scripts defined in package.json ("start", "dev", "build") are runnable via `npm run <script>`.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'json',
      code: `{
  "name": "my-mern-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev":   "nodemon src/index.js",
    "start": "node src/index.js",
    "test":  "jest"
  },
  "dependencies": {
    "express":  "^5.0.0",
    "mongoose": "^8.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}`,
      highlights: { 5: 'emerald', 6: 'emerald', 7: 'emerald', 10: 'amber', 13: 'rose' },
    },
    terms: ['npm', 'package-json', 'node-modules', 'lockfile', 'dependency', 'dev-dependency', 'semver'],
    pitfalls: [
      'Never commit node_modules/ — add it to .gitignore and let teammates run `npm install` to restore it.',
      'The `^` caret in version ranges allows minor/patch updates. `"^5.0.0"` may install 5.4.1 — pin versions in production for reproducibility.',
      'devDependencies should contain only build tools and test libraries — they are NOT installed in production (`npm install --omit=dev`).',
    ],
    interview: [
      'What is the difference between `dependencies` and `devDependencies` in package.json?',
      'Why should package-lock.json be committed to version control?',
    ],
    next: ['modules-cjs-vs-esm', 'express-bootstrapping', 'what-is-nodejs'],
  },

  // ─── 12. Express App Bootstrapping ──────────────────────────────────────────
  {
    id: 'express-bootstrapping',
    level: 1,
    order: 12,
    title: 'Express App Bootstrapping',
    oneLiner: 'Bootstrapping sets up the Express app: import, configure middleware, mount routes, then listen.',
    mentalModel:
      'Opening a shop: you set up the layout (middleware), put up the signs (routes), and then unlock the door (app.listen). Every customer who walks in (HTTP request) follows the shop\'s layout in the order you arranged it.',
    viz: {
      component: 'SequenceSwimlane',
      steps: [
        {
          label: 'Import Express',
          caption: 'express() creates the app object — the core request handler. This is the starting point of every Express backend.',
          highlights: ['client'],
        },
        {
          label: 'Register global middleware',
          caption: 'app.use() mounts middleware for all routes. Order matters — these run top to bottom for every request.',
          highlights: ['client-to-server'],
        },
        {
          label: 'Mount route handlers',
          caption: 'app.use("/api/users", userRouter) mounts a router at a path prefix. Requests to /api/users/* are delegated to userRouter.',
          highlights: ['server'],
        },
        {
          label: 'Register error middleware',
          caption: 'Error middleware (4 params) must be registered LAST, after all routes. It catches any error passed via next(err).',
          highlights: ['server-to-db'],
        },
        {
          label: 'app.listen — server starts',
          caption: 'app.listen(PORT) opens the TCP socket and begins accepting connections. The event loop keeps Node.js alive.',
          highlights: ['server-to-client'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import express from 'express'
import { userRouter } from './routes/users.js'

const app = express()
const PORT = process.env.PORT ?? 3000

// Global middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Route mounting
app.use('/api/users', userRouter)

// Error middleware — must be last, must have 4 params
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => console.log(\`Listening on \${PORT}\`))`,
      highlights: { 4: 'emerald', 8: 'amber', 9: 'amber', 12: 'emerald', 15: 'rose', 17: 'rose', 19: 'emerald' },
    },
    terms: ['express', 'app-listen', 'router', 'global-middleware', 'error-middleware', 'port'],
    pitfalls: [
      'Registering routes before global middleware (like express.json()) means those routes won\'t have req.body populated.',
      'Forgetting to export the app (for testing) and instead calling app.listen() directly in every file makes unit testing hard.',
      'Error middleware with only 3 params (req, res, next) is treated as a regular middleware by Express — errors slip through uncaught.',
    ],
    interview: [
      'Why must error-handling middleware be registered after all routes in Express?',
      'What is the difference between app.use() and app.get() in Express?',
    ],
    next: ['routing', 'middleware-pipeline', 'body-parsing-json'],
  },

  // ─── 13. Routing ─────────────────────────────────────────────────────────────
  {
    id: 'routing',
    level: 1,
    order: 13,
    title: 'Routing',
    oneLiner: 'Routing maps incoming URLs to the function that should handle them.',
    mentalModel:
      'A phone switchboard: the operator (router) sees the incoming call\'s extension number (URL + method) and connects it to the right desk (handler). Express.Router() lets you build mini-switchboards per feature.',
    viz: {
      component: 'URLMatcher',
      steps: [
        {
          label: 'GET /users — exact match',
          caption: 'Incoming GET /users matches the first route exactly. All users are returned.',
          highlights: [um({
            url: 'GET /users',
            routes: [
              { pattern: 'GET /users', method: 'GET', active: true, match: true },
              { pattern: 'GET /users/:id', method: 'GET', active: false, match: null },
              { pattern: 'POST /users', method: 'POST', active: false, match: null },
              { pattern: 'DELETE /users/:id', method: 'DELETE', active: false, match: null },
            ],
          })],
        },
        {
          label: 'GET /users/42 — param match',
          caption: 'The :id param captures "42" from the URL. req.params.id === "42" inside the handler.',
          highlights: [um({
            url: 'GET /users/42',
            routes: [
              { pattern: 'GET /users', method: 'GET', active: true, match: false },
              { pattern: 'GET /users/:id', method: 'GET', active: true, match: true },
              { pattern: 'POST /users', method: 'POST', active: false, match: null },
              { pattern: 'DELETE /users/:id', method: 'DELETE', active: false, match: null },
            ],
            params: { id: '42' },
          })],
        },
        {
          label: 'DELETE /users/99 — different method',
          caption: 'Same path pattern as GET /users/:id but different HTTP method. Express matches both pattern AND method.',
          highlights: [um({
            url: 'DELETE /users/99',
            routes: [
              { pattern: 'GET /users', method: 'GET', active: false, match: null },
              { pattern: 'GET /users/:id', method: 'GET', active: true, match: false },
              { pattern: 'POST /users', method: 'POST', active: false, match: null },
              { pattern: 'DELETE /users/:id', method: 'DELETE', active: true, match: true },
            ],
            params: { id: '99' },
          })],
        },
        {
          label: 'GET /users/42/posts — deeper path',
          caption: 'Nested routes (user posts) are handled with Express Router chaining or sub-routers. No match in basic routes → 404.',
          highlights: [um({
            url: 'GET /users/42/posts',
            routes: [
              { pattern: 'GET /users', method: 'GET', active: true, match: false },
              { pattern: 'GET /users/:id', method: 'GET', active: true, match: false },
              { pattern: 'POST /users', method: 'POST', active: false, match: null },
              { pattern: 'GET /users/:id/posts', method: 'GET', active: true, match: true },
            ],
            params: { id: '42' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import { Router } from 'express'
const router = Router()

// GET /users
router.get('/', getUsers)

// GET /users/:id
router.get('/:id', getUserById)

// POST /users
router.post('/', createUser)

// DELETE /users/:id
router.delete('/:id', deleteUser)

// Mount with prefix in app.ts:
// app.use('/users', router)`,
      highlights: { 4: 'emerald', 7: 'emerald', 10: 'amber', 13: 'rose' },
    },
    terms: ['router', 'route-handler', 'url-param', 'express', 'method', 'wildcard'],
    pitfalls: [
      'Route order matters — Express matches routes top-to-bottom. A wildcard route (`/users/*`) before a specific route (`/users/me`) will catch everything.',
      'req.params values are always strings even if the URL segment looks like a number. Always parse: `Number(req.params.id)` or use Mongoose\'s ObjectId handling.',
      'Not separating routers into files leads to a monolithic app.ts that becomes impossible to maintain as the API grows.',
    ],
    interview: [
      'How does Express determine which route handler to invoke for an incoming request?',
      'What is the difference between req.params and req.query in Express routing?',
    ],
    next: ['express-bootstrapping', 'body-parsing-json', 'middleware-pipeline'],
  },

  // ─── 14. Body Parsing & JSON ─────────────────────────────────────────────────
  {
    id: 'body-parsing-json',
    level: 1,
    order: 14,
    title: 'Body Parsing & JSON',
    oneLiner: 'req.body is empty until middleware converts the raw byte stream into a JavaScript object.',
    mentalModel:
      'When a letter arrives, the envelope is the HTTP headers, and the letter inside is the body — but the body arrives as raw bytes. express.json() is the translator who reads the bytes and hands you an actual JavaScript object.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Raw request arrives',
          caption: 'The HTTP request arrives as a raw byte stream. req.body is undefined — nothing has parsed it yet.',
          highlights: ['stage-0'],
        },
        {
          label: 'Content-Type check',
          caption: 'express.json() checks the Content-Type header. If it\'s "application/json", it proceeds to parse the body.',
          highlights: ['stage-1'],
        },
        {
          label: 'Body collected and parsed',
          caption: 'The middleware collects the incoming bytes into a buffer, then JSON.parses the buffer into a JS object.',
          highlights: ['stage-2'],
        },
        {
          label: 'req.body populated',
          caption: 'The parsed object is assigned to req.body. Now route handlers can access req.body.email, req.body.password, etc.',
          highlights: ['stage-3'],
        },
        {
          label: 'Route handler receives data',
          caption: 'The route handler runs with req.body populated. It can destructure, validate, and use the data directly.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import express from 'express'
const app = express()

// Must be registered BEFORE routes that need req.body
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // for form data

app.post('/login', (req, res) => {
  // req.body is now a JS object
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Fields required' })
  }
  // ... authenticate
})`,
      highlights: { 5: 'emerald', 6: 'amber', 9: 'rose', 10: 'rose', 12: 'amber' },
    },
    terms: ['body-parser', 'content-type', 'json', 'urlencoded', 'request-body', 'middleware'],
    pitfalls: [
      'Registering routes before express.json() means req.body is always undefined on those routes.',
      'Without the Content-Type: application/json header, express.json() silently skips parsing — req.body stays empty.',
      'By default, express.json() has a 100kb size limit. Large payloads (file uploads) need multipart form parsers like multer.',
    ],
    interview: [
      'Why is req.body undefined even though you sent JSON in a POST request?',
      'What is the difference between express.json() and express.urlencoded()?',
    ],
    next: ['express-bootstrapping', 'routing', 'middleware-pipeline'],
  },

  // ─── 15. REST Principles ─────────────────────────────────────────────────────
  {
    id: 'rest-principles',
    level: 1,
    order: 15,
    title: 'REST Principles',
    oneLiner: 'REST is a set of constraints that makes HTTP APIs predictable, scalable, and cacheable.',
    mentalModel:
      'REST treats your API like a collection of nouns (resources), not a list of actions. Instead of `/getUser` and `/deleteUser`, REST says: the resource is `/users/{id}` — GET it, DELETE it, PUT it. The verb is the HTTP method, not part of the URL.',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'REST vs RPC naming',
          caption: 'REST uses resource URLs + HTTP methods. RPC (Remote Procedure Call) embeds the action in the URL — less standard, harder to cache.',
          highlights: [tpc({
            left: {
              title: 'REST (Resource-based)',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'GET /users', value: 'List all users.' },
                { label: 'POST /users', value: 'Create a user.' },
                { label: 'GET /users/42', value: 'Get user 42.' },
                { label: 'PUT /users/42', value: 'Replace user 42.' },
                { label: 'DELETE /users/42', value: 'Delete user 42.' },
              ],
            },
            right: {
              title: 'RPC (Action-based)',
              color: 'rose',
              rows: [
                { label: 'POST /getUsers', value: 'List all users.' },
                { label: 'POST /createUser', value: 'Create a user.' },
                { label: 'POST /getUserById', value: 'Get user by ID.' },
                { label: 'POST /updateUser', value: 'Update a user.' },
                { label: 'POST /removeUser', value: 'Remove a user.' },
              ],
            },
            badge: { side: 'left', text: 'cacheable & standard', color: 'emerald' },
          })],
        },
        {
          label: 'REST constraints',
          caption: 'REST has 6 architectural constraints. Statelessness (no server-side session) and Uniform Interface (resource URLs + methods) are the most important.',
          highlights: [tpc({
            left: {
              title: 'Key Constraints',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Stateless', value: 'Each request contains all information needed — no server session.' },
                { label: 'Uniform Interface', value: 'Resources + standard HTTP methods. Self-describing messages.' },
                { label: 'Cacheable', value: 'GET responses can be cached by proxies and browsers.' },
                { label: 'Layered', value: 'Client doesn\'t know if it talks to the real server or a proxy/CDN.' },
              ],
            },
            right: {
              title: 'Resource URL Patterns',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Collection', value: '/users — list or create.' },
                { label: 'Item', value: '/users/:id — read, update, delete.' },
                { label: 'Nested', value: '/users/:id/posts — user\'s posts.' },
                { label: 'No verbs!', value: 'Never /users/getAll or /users/deleteById.' },
              ],
            },
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// REST resource router — clean URL design
const router = Router()

// Collection endpoints
router.get('/',    getAll)       // GET  /products
router.post('/',   createOne)   // POST /products

// Item endpoints
router.get('/:id',    getOne)   // GET    /products/:id
router.put('/:id',    replaceOne) // PUT  /products/:id
router.patch('/:id',  updateOne)  // PATCH /products/:id
router.delete('/:id', deleteOne)  // DELETE /products/:id

// Mounted in app.ts:
// app.use('/products', router)`,
      highlights: { 4: 'emerald', 5: 'amber', 8: 'emerald', 9: 'amber', 10: 'amber', 11: 'rose' },
    },
    terms: ['rest', 'resource', 'stateless', 'uniform-interface', 'rpc', 'endpoint'],
    pitfalls: [
      'Putting verbs in URLs (/getUser, /deleteUser) breaks REST conventions and makes the API non-cacheable.',
      'REST does not mean "use JSON" — REST is about resource design. You could use XML, though JSON is the de-facto standard today.',
      'Over-nesting URLs (/users/:id/posts/:postId/comments/:commentId) becomes unwieldy — consider flattening beyond 2 levels.',
    ],
    interview: [
      'What does "stateless" mean in REST, and what are the implications for authentication?',
      'How would you design REST endpoints for a resource called "Order" with nested "Items"?',
    ],
    next: ['routing', 'idempotency-safe-methods', 'jwt-anatomy'],
  },

  // ─── 16. Environment Variables ───────────────────────────────────────────────
  {
    id: 'environment-variables',
    level: 1,
    order: 16,
    title: 'Environment Variables',
    oneLiner: 'Environment variables store secrets and config outside your code, safe from version control.',
    mentalModel:
      'Think of environment variables as the safe in the back office — the code running in the store knows where to find the combination (process.env.DB_URL), but the combination itself never appears in the employee handbook (your source code). Different stores (dev/prod) have different safes.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: '.env file created',
          caption: '.env holds key=value pairs like DB_URL=... and JWT_SECRET=... This file is added to .gitignore and NEVER committed.',
          highlights: ['stage-0'],
        },
        {
          label: 'dotenv loads variables',
          caption: 'At startup, `dotenv.config()` reads .env and injects all key-value pairs into process.env.',
          highlights: ['stage-1'],
        },
        {
          label: 'process.env available',
          caption: 'Any module can now access process.env.DB_URL, process.env.JWT_SECRET, etc. — set before your app code runs.',
          highlights: ['stage-2'],
        },
        {
          label: 'Code reads config',
          caption: 'Your application reads from process.env. Same code works in dev (.env file) and production (real env vars injected by the host).',
          highlights: ['stage-3'],
        },
        {
          label: 'Production: no .env needed',
          caption: 'In production (Heroku, Railway, AWS), env vars are set in the platform dashboard — no .env file on the server.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// .env (never commit this file)
// DB_URL=mongodb+srv://user:pass@cluster.mongodb.net/mydb
// JWT_SECRET=s3cr3t-k3y-here
// PORT=3000

// src/config.ts — validate and centralise env access
import 'dotenv/config'

export const config = {
  dbUrl:     process.env.DB_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  port:      Number(process.env.PORT) || 3000,
}

// Fail fast if critical vars missing
if (!config.dbUrl || !config.jwtSecret) {
  throw new Error('Missing required environment variables')
}`,
      highlights: { 7: 'emerald', 9: 'amber', 10: 'amber', 11: 'amber', 14: 'rose', 15: 'rose' },
    },
    terms: ['env-var', 'dotenv', 'process-env', 'gitignore', 'config', 'secret'],
    pitfalls: [
      'Never hardcode secrets (DB passwords, API keys) in source code — they end up in git history permanently, even if deleted later.',
      'Accessing process.env.MISSING_VAR returns undefined (not an error) — always validate required vars at startup and fail fast.',
      'Vite/React exposes only VITE_-prefixed env vars to the client bundle. Accidentally putting server secrets as VITE_ vars exposes them publicly.',
    ],
    interview: [
      'Why should you never commit a .env file to version control?',
      'How do you ensure all required environment variables are present before your server starts?',
    ],
    next: ['express-bootstrapping', 'mongodb-basics', 'jwt-anatomy'],
  },

  // ─── 17. MongoDB Basics ──────────────────────────────────────────────────────
  {
    id: 'mongodb-basics',
    level: 1,
    order: 17,
    title: 'MongoDB Basics',
    oneLiner: 'MongoDB stores data as flexible JSON-like documents in collections, not rows in tables.',
    mentalModel:
      'A SQL database is like a spreadsheet — rigid columns, every row must fit the same shape. MongoDB is like a folder of sticky notes — each note (document) can have different fields, and you can put any sticky note into the folder (collection).',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'Documents vs Rows',
          caption: 'SQL stores data in fixed-schema rows. MongoDB stores JSON-like BSON documents — each document can have different fields.',
          highlights: [tpc({
            left: {
              title: 'MongoDB (Document)',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Store', value: '{ _id, name, email, address: { city } }' },
                { label: 'Schema', value: 'Flexible — documents in same collection can differ.' },
                { label: 'Relations', value: 'Embed or reference. No JOIN — use populate().' },
                { label: 'ID', value: '_id is a 12-byte ObjectId, auto-generated.' },
              ],
            },
            right: {
              title: 'SQL (Row/Table)',
              color: 'amber',
              rows: [
                { label: 'Store', value: 'Fixed columns: id, name, email, city_id (FK).' },
                { label: 'Schema', value: 'Rigid — all rows must have same columns.' },
                { label: 'Relations', value: 'Foreign keys + JOIN queries.' },
                { label: 'ID', value: 'Integer primary key, auto-increment.' },
              ],
            },
            badge: { side: 'left', text: 'flexible schema', color: 'emerald' },
          })],
        },
        {
          label: 'CRUD operations',
          caption: 'Create, Read, Update, Delete map directly to MongoDB driver methods. Mongoose adds schema validation on top.',
          highlights: [tpc({
            left: {
              title: 'MongoDB CRUD',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Create', value: 'db.users.insertOne({ name, email })' },
                { label: 'Read', value: 'db.users.find({ role: "admin" })' },
                { label: 'Update', value: 'db.users.updateOne({ _id }, { $set: { name } })' },
                { label: 'Delete', value: 'db.users.deleteOne({ _id })' },
              ],
            },
            right: {
              title: 'SQL CRUD',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Create', value: 'INSERT INTO users (name, email) VALUES (...)' },
                { label: 'Read', value: 'SELECT * FROM users WHERE role = "admin"' },
                { label: 'Update', value: 'UPDATE users SET name = ... WHERE id = ?' },
                { label: 'Delete', value: 'DELETE FROM users WHERE id = ?' },
              ],
            },
          })],
        },
      ],
    },
    snippet: {
      lang: 'js',
      code: `import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.DB_URL)
await client.connect()

const db = client.db('myapp')
const users = db.collection('users')

// Create
await users.insertOne({ name: 'Alice', email: 'alice@x.com' })

// Read
const admins = await users.find({ role: 'admin' }).toArray()

// Update
await users.updateOne({ email: 'alice@x.com' }, { $set: { role: 'admin' } })

// Delete
await users.deleteOne({ email: 'alice@x.com' })`,
      highlights: { 6: 'emerald', 7: 'emerald', 10: 'amber', 12: 'emerald', 14: 'amber', 17: 'rose' },
    },
    terms: ['mongodb', 'document', 'collection', 'bson', 'objectid', 'crud', 'embed', 'reference'],
    pitfalls: [
      'Embedding vs referencing: embed when data is always fetched together; reference (like a FK) when data is shared or large.',
      'MongoDB _id is an ObjectId, not a plain integer — always use mongoose.Types.ObjectId for comparisons, not string equality.',
      'The flexible schema is a feature but also a trap — documents with inconsistent fields cause runtime bugs. Always use Mongoose schemas.',
    ],
    interview: [
      'What is the difference between embedding documents and using references in MongoDB?',
      'How does MongoDB\'s document model differ from a relational database table?',
    ],
    next: ['mongoose-schema-model', 'indexing-collscan-ixscan', 'environment-variables'],
  },

  // ─── 18. Mongoose Schema & Model ─────────────────────────────────────────────
  {
    id: 'mongoose-schema-model',
    level: 1,
    order: 18,
    title: 'Mongoose Schema & Model',
    oneLiner: 'A Mongoose Schema defines the shape; the Model is the class used to query and save documents.',
    mentalModel:
      'A Schema is a cookie cutter — it defines the shape of every cookie (document). A Model is the machine that uses the cutter: it creates cookies, finds them in the jar (collection), updates them, and deletes them.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Schema defined',
          caption: 'new Schema({ ... }) describes the document structure: field names, types, required constraints, defaults.',
          highlights: ['stage-0'],
        },
        {
          label: 'Validation rules added',
          caption: 'Schema fields can have built-in validators: required, minlength, enum, match (regex). Mongoose runs these before saving.',
          highlights: ['stage-1'],
        },
        {
          label: 'Model created',
          caption: 'mongoose.model("User", userSchema) creates a Model — a constructor class tied to the "users" MongoDB collection.',
          highlights: ['stage-2'],
        },
        {
          label: 'Document instantiated',
          caption: 'new User({ name, email }) creates an in-memory document. It\'s not saved yet — call .save() or use User.create().',
          highlights: ['stage-3'],
        },
        {
          label: 'Saved to MongoDB',
          caption: 'await user.save() validates against the Schema, then writes the BSON document to the "users" collection.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import mongoose, { Schema, model } from 'mongoose'

// 1. Define Schema
const userSchema = new Schema({
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  role:  { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
})

// 2. Create Model
export const User = model('User', userSchema)

// 3. Use Model
const user = await User.create({ name: 'Alice', email: 'a@x.com' })
const found = await User.findById(user._id)
await User.updateOne({ _id: user._id }, { $set: { role: 'admin' } })`,
      highlights: { 4: 'emerald', 5: 'emerald', 6: 'amber', 7: 'amber', 11: 'emerald', 14: 'rose', 15: 'rose', 16: 'rose' },
    },
    terms: ['mongoose', 'schema', 'model', 'document', 'validation', 'populate', 'objectid'],
    pitfalls: [
      'Calling mongoose.model() more than once with the same name throws "Cannot overwrite model" — guard with `mongoose.models.User || model("User", ...)`.',
      'unique: true in a Schema creates a MongoDB index, but it does NOT handle duplicate errors automatically — catch the MongoServerError (code 11000) and return 409.',
      'Not awaiting Mongoose queries — User.find() returns a Query object, not the data. Always await or use .exec().',
    ],
    interview: [
      'What is the difference between a Mongoose Schema and a Mongoose Model?',
      'How does Mongoose\'s unique constraint differ from application-level uniqueness validation?',
    ],
    next: ['mongodb-basics', 'indexing-collscan-ixscan', 'error-handling-101'],
  },

  // ─── 19. Error Handling 101 ───────────────────────────────────────────────────
  {
    id: 'error-handling-101',
    level: 1,
    order: 19,
    title: 'Error Handling 101',
    oneLiner: 'Errors in Express need to be caught and forwarded to error middleware — they don\'t bubble up automatically.',
    mentalModel:
      'Error handling is like a safety net in a circus act. Without it, a fall (thrown error) ends the show. With a net (error middleware), the act continues — the performer is caught, the audience sees a graceful recovery, and the error is logged backstage.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Route handler executes',
          caption: 'A request arrives and a route handler runs. Everything is normal so far.',
          highlights: ['stage-0'],
        },
        {
          label: 'Error thrown / rejected',
          caption: 'An unexpected condition occurs: DB query fails, validation fails, a service is down. An error is thrown or a Promise rejects.',
          highlights: ['stage-1'],
        },
        {
          label: 'next(err) called',
          caption: 'In async handlers, wrap in try/catch and call next(err). Or use a wrapper utility (express-async-errors) that does this automatically.',
          highlights: ['stage-2'],
        },
        {
          label: 'Error middleware activated',
          caption: 'Express detects the 4-parameter middleware (err, req, res, next) and invokes it. Regular middleware is skipped.',
          highlights: ['stage-3'],
        },
        {
          label: 'Safe response sent',
          caption: 'Error middleware logs the error server-side and sends a clean, non-leaking JSON response with the appropriate status code.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Route — async error must be forwarded with next()
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'Not found' })
    res.json(user)
  } catch (err) {
    next(err)           // forward to error middleware
  }
})

// Error middleware — must have exactly 4 params
app.use((err: Error, req, res, next) => {
  console.error(err.stack)   // log internally
  res.status(500).json({
    error: 'Something went wrong'  // safe message for client
  })
})`,
      highlights: { 3: 'emerald', 5: 'amber', 7: 'rose', 8: 'rose', 12: 'emerald', 13: 'amber', 14: 'amber', 15: 'rose' },
    },
    terms: ['error-middleware', 'next', 'try-catch', 'promise-rejection', 'http-error', 'stack-trace'],
    pitfalls: [
      'Unhandled Promise rejections in async route handlers crash Node.js (or emit warnings) — always wrap async handlers in try/catch.',
      'Sending the error\'s stack trace to the client leaks internal file paths and library versions — a security risk. Log it, don\'t expose it.',
      'Registering error middleware before routes means it never triggers — it must come AFTER all routes and regular middleware.',
    ],
    interview: [
      'How do you handle errors in async Express route handlers?',
      'Why must an Express error-handling middleware have exactly 4 parameters?',
    ],
    next: ['middleware-pipeline', 'express-bootstrapping', 'http-response-status-codes'],
  },

  // ─── 20. CORS & Preflight ─────────────────────────────────────────────────────
  {
    id: 'cors-preflight',
    level: 1,
    order: 20,
    title: 'CORS & Preflight',
    oneLiner: 'CORS is the browser\'s security mechanism that blocks cross-origin requests unless the server explicitly allows them.',
    mentalModel:
      'CORS is like a club bouncer: the browser asks "is my origin on the guest list?" before it lets your code make requests to a different domain. The server must respond with the right headers — the bouncer\'s approval stamp.',
    viz: {
      component: 'SequenceSwimlane',
      steps: [
        {
          label: 'Browser detects cross-origin',
          caption: 'Your React app at http://localhost:3000 makes a fetch to http://localhost:4000/api. The browser detects different origins.',
          highlights: ['client'],
        },
        {
          label: 'OPTIONS preflight sent',
          caption: 'For non-simple requests (POST with JSON, custom headers), the browser first sends an OPTIONS request asking "is this allowed?"',
          highlights: ['client-to-server'],
        },
        {
          label: 'Server responds to preflight',
          caption: 'Server must reply with Access-Control-Allow-Origin, Access-Control-Allow-Methods, and Access-Control-Allow-Headers headers.',
          highlights: ['server'],
        },
        {
          label: 'Actual request sent',
          caption: 'If the preflight response approves the origin and method, the browser sends the actual POST/PUT/etc. request.',
          highlights: ['client-to-server'],
        },
        {
          label: 'Response returned to browser',
          caption: 'Server responds normally. Browser checks the Access-Control-Allow-Origin header again — if missing or wrong, JS cannot read the response.',
          highlights: ['server-to-client'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import cors from 'cors'
import express from 'express'

const app = express()

// Simple: allow all origins (development only!)
app.use(cors())

// Production: restrict to known origins
app.use(cors({
  origin: ['https://myapp.com', 'https://admin.myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,   // allow cookies / auth headers
}))`,
      highlights: { 7: 'rose', 10: 'emerald', 11: 'emerald', 12: 'emerald', 13: 'emerald', 14: 'amber' },
    },
    terms: ['cors', 'preflight', 'origin', 'access-control-headers', 'same-origin-policy', 'options-method'],
    pitfalls: [
      'Using `cors()` with no config in production allows ANY origin — malicious sites can make authenticated requests on behalf of your users.',
      'CORS is a browser restriction only — server-to-server requests and Postman are never blocked by CORS.',
      'Setting `credentials: true` requires the `origin` to be a specific domain, not `*` — the wildcard and credentials are mutually exclusive.',
    ],
    interview: [
      'What is a CORS preflight request, and when does the browser send one?',
      'CORS errors only appear in the browser, not in Postman. Why?',
    ],
    next: ['dns-tcp-http-journey', 'http-request-anatomy', 'middleware-pipeline'],
  },
]
