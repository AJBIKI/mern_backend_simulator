import type { Concept } from './types'

export const level1Concepts: Concept[] = [
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
      highlights: {
        3: 'emerald',
        6: 'amber',
        9: 'rose',
        15: 'emerald',
      },
    },
    terms: ['http', 'request', 'response', 'method', 'status-code', 'header', 'body', 'url', 'query-string'],
    pitfalls: [
      'GET requests should never have a body — proxies and caches may strip it silently.',
      'Forgetting `Content-Type: application/json` means Express won\'t parse req.body (requires express.json() middleware too).',
      'Status codes matter — sending 200 for an error confuses clients and monitoring tools. Use 4xx/5xx correctly.',
    ],
    interview: [
      'What is the difference between req.params, req.query, and req.body in Express?',
      'Why do we need the Content-Type header when sending a POST request?',
    ],
    next: ['middleware-pipeline', 'jwt-anatomy'],
  },

  {
    id: 'middleware-pipeline',
    level: 1,
    order: 2,
    title: 'Middleware Pipeline',
    oneLiner: 'Middleware functions process a request in a chain — each one passes control to the next.',
    mentalModel:
      'Picture airport security: passport control, X-ray scan, boarding gate check — each station does one job and waves you through (or stops you). Express middleware works the same way: each function either calls next() to continue or sends a response to stop the chain.',
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
      highlights: {
        8: 'emerald',
        13: 'rose',
        14: 'rose',
        15: 'emerald',
        20: 'amber',
      },
    },
    terms: ['middleware', 'next', 'pipeline', 'route-handler', 'error-middleware'],
    pitfalls: [
      'Forgetting to call next() (or send a response) leaves the request hanging forever — the client times out.',
      'Order matters: body-parser must come before any middleware that reads req.body.',
      'Error middleware must have exactly 4 parameters (err, req, res, next) — Express won\'t treat it as error middleware otherwise.',
    ],
    interview: [
      'What happens if a middleware function neither calls next() nor sends a response?',
      'How do you write an error-handling middleware in Express, and where should it be registered?',
    ],
    next: ['http-request-anatomy', 'jwt-anatomy', 'event-loop-deep-dive'],
  },
]
