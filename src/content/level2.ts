import type { Concept } from './types'

// Helper for TwoPanelCompare step data
function tpc(data: object): string {
  return JSON.stringify(data)
}

// Helper for TreeTraversal step data
function tt(data: object): string {
  return JSON.stringify(data)
}

// Helper for StateMachine step data
function sm(data: object): string {
  return JSON.stringify(data)
}

// Helper for CacheFlow step data
function cf(data: object): string {
  return JSON.stringify(data)
}

// Helper for TokenBucket step data
function tb(data: object): string {
  return JSON.stringify(data)
}

export const level2Concepts: Concept[] = [
  // ─── 1. Layered Architecture ────────────────────────────────────────────────
  {
    id: 'layered-architecture',
    level: 2,
    order: 1,
    title: 'Layered Architecture',
    oneLiner: 'Separate routes, controllers, services, and models so each layer has only one job.',
    mentalModel:
      'A fine dining restaurant: the host seats you (routes), the waiter takes your order (controller), the chef prepares the recipe (service), and the pantry supplies ingredients (model/DB). No one does someone else\'s job.',
    viz: {
      component: 'SequenceSwimlane',
      steps: [
        {
          label: 'Client hits Route',
          caption: 'Request arrives at /api/users. The route definition maps the HTTP verb and path, delegating directly to the controller.',
          highlights: ['client'],
        },
        {
          label: 'Route forwards to Controller',
          caption: 'Controller parses HTTP input (req.params, req.body, req.query) and validates formats before calling the service layer.',
          highlights: ['client-to-server'],
        },
        {
          label: 'Controller delegates to Service',
          caption: 'The Service layer contains pure business logic: calculations, third-party API calls, and business rules. It knows nothing about req or res.',
          highlights: ['server'],
        },
        {
          label: 'Service queries Model / DB',
          caption: 'The Service invokes Mongoose Model methods (e.g. User.create()) to interact with the database persistence layer.',
          highlights: ['server-to-db'],
        },
        {
          label: 'Data flows back to Client',
          caption: 'Result bubbles back: Model -> Service -> Controller -> Client (HTTP 200/201 JSON response).',
          highlights: ['server-to-client'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// 1. Controller: handles HTTP layer only
export async function register(req: Request, res: Response) {
  const { email, password } = req.body
  const user = await authService.registerUser(email, password)
  res.status(201).json({ user })
}

// 2. Service: pure business logic, framework-agnostic
export async function registerUser(email: string, pass: string) {
  const existing = await UserModel.findOne({ email })
  if (existing) throw new AppError('Email taken', 409)
  const hashed = await hashPassword(pass)
  return UserModel.create({ email, password: hashed })
}`,
      highlights: { 2: 'emerald', 4: 'emerald', 9: 'amber', 11: 'rose', 13: 'emerald' },
    },
    terms: ['layered-architecture', 'controller', 'service-layer', 'model', 'route-handler', 'soc'],
    pitfalls: [
      'Putting database queries directly inside route handlers makes unit testing and refactoring nearly impossible.',
      'Passing Express req and res objects into the service layer tightly couples business logic to HTTP transport.',
      'Skipping the service layer for "simple" apps leads to fat controllers that rapidly become unmaintainable.',
    ],
    interview: [
      'What is the difference between a Controller and a Service in a layered Express architecture?',
      'Why should the Service layer never receive or touch Express req and res objects?',
    ],
    next: ['controller-vs-service-vs-model', 'input-validation-zod', 'centralized-error-handling'],
  },

  // ─── 2. Controller vs Service vs Model ───────────────────────────────────────
  {
    id: 'controller-vs-service-vs-model',
    level: 2,
    order: 2,
    title: 'Controller vs Service vs Model',
    oneLiner: 'Controllers speak HTTP, Services speak business logic, Models speak database.',
    mentalModel:
      'Controller is the translator turning HTTP into function arguments; Service is the brain making decisions; Model is the filing cabinet where records are saved and retrieved.',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'Controller vs Service responsibilities',
          caption: 'Controllers deal with status codes, headers, and request bodies. Services deal with domain logic, rules, and calculations.',
          highlights: [tpc({
            left: {
              title: 'Controller (HTTP Layer)',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Role', value: 'Extracts req.body, req.params, cookies, headers' },
                { label: 'Output', value: 'Sends res.status(200).json(...) to client' },
                { label: 'Coupling', value: 'Tied to Express / HTTP framework' },
                { label: 'Rule', value: 'Never contains SQL/Mongoose query logic' },
              ],
            },
            right: {
              title: 'Service (Domain Layer)',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Role', value: 'Executes core business rules and workflows' },
                { label: 'Output', value: 'Returns plain JS objects or throws errors' },
                { label: 'Coupling', value: 'Independent of HTTP (works in CLI, cron, queue)' },
                { label: 'Rule', value: 'Never touches req, res, or HTTP status codes' },
              ],
            },
            badge: { side: 'left', text: 'Clean Separation', color: 'emerald' },
          })],
        },
        {
          label: 'Service vs Model comparison',
          caption: 'Services coordinate workflows; Models validate schema constraints and talk directly to the database collection.',
          highlights: [tpc({
            left: {
              title: 'Service Layer',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Focus', value: 'Orchestrates multiple models, sends emails, hashes passwords' },
                { label: 'Transaction', value: 'Manages transactional consistency across records' },
                { label: 'Reusability', value: 'Called by REST routes, GraphQL, or background workers' },
              ],
            },
            right: {
              title: 'Model Layer',
              color: 'rose',
              activeRow: 0,
              rows: [
                { label: 'Focus', value: 'Defines schema types, indexes, and document structure' },
                { label: 'Validation', value: 'Enforces field constraints (required, unique, regex)' },
                { label: 'Persistence', value: 'Directly reads and writes BSON documents in MongoDB' },
              ],
            },
            badge: { side: 'right', text: 'Data Authority', color: 'rose' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Good separation in practice:
// users.controller.ts
export const create = async (req: Request, res: Response) => {
  const result = await UserService.createAccount(req.body)
  res.status(201).json(result)
}

// users.service.ts
export const createAccount = async (data: UserInput) => {
  const existing = await UserModel.findOne({ email: data.email })
  if (existing) throw new DuplicateError('Email already exists')
  return UserModel.create(data)
}`,
      highlights: { 3: 'emerald', 5: 'emerald', 9: 'amber', 11: 'rose', 12: 'emerald' },
    },
    terms: ['controller', 'service-layer', 'model', 'business-logic', 'schema', 'soc'],
    pitfalls: [
      'Sending HTTP responses directly from inside services ruins reusability for queue workers and websockets.',
      'Placing business calculations in Mongoose virtuals or schema hooks can hide side effects from team members.',
      'Controller bloat: putting 200 lines of query building, email dispatch, and parsing in a single controller handler.',
    ],
    interview: [
      'Why is passing the Express response object into a service considered an anti-pattern?',
      'If you need to send a welcome email after user creation, should that live in the Controller, Service, or Model?',
    ],
    next: ['layered-architecture', 'input-validation-zod', 'centralized-error-handling'],
  },

  // ─── 3. Input Validation (Zod) ──────────────────────────────────────────────
  {
    id: 'input-validation-zod',
    level: 2,
    order: 3,
    title: 'Input Validation (Zod)',
    oneLiner: 'Validate incoming request data at the perimeter before any controller logic executes.',
    mentalModel:
      'A nightclub bouncer checking IDs at the front door. If your ID is expired or fake (invalid types/missing fields), you are turned away immediately with a 400. You never even make it to the bar.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Request hits validation gate',
          caption: 'Raw request body arrives from express.json() containing untrusted client input.',
          highlights: ['stage-0'],
        },
        {
          label: 'Zod parses payload',
          caption: 'zodSchema.parseAsync(req.body) validates shapes, types, string lengths, and email formats.',
          highlights: ['stage-1'],
        },
        {
          label: 'Invalid input rejected',
          caption: 'If schema validation fails, Zod throws a ZodError with path-specific error messages. Returns 400 Bad Request immediately.',
          highlights: ['stage-2'],
        },
        {
          label: 'Clean sanitized payload',
          caption: 'Zod strips unrecognised properties and coerces types, attaching validated data to res.locals or typed req.body.',
          highlights: ['stage-3'],
        },
        {
          label: 'Controller executes safely',
          caption: 'Controller runs with compile-time and runtime type safety guaranteed. No manual if (!email) checks required.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 chars'),
    age: z.number().int().min(18).optional(),
  })
})

export const validate = (schema: z.AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    req.body = await schema.parseAsync({ body: req.body }).then(d => d.body)
    next()
  }`,
      highlights: { 3: 'emerald', 5: 'emerald', 6: 'amber', 12: 'rose', 13: 'emerald' },
    },
    terms: ['zod', 'input-validation', 'schema-validation', 'sanitization', 'type-inference', 'bad-request'],
    pitfalls: [
      'Relying solely on frontend validation — attackers bypass browser forms trivially using curl or Postman.',
      'Allowing unexpected payload keys without stripping them, opening mass assignment vulnerabilities.',
      'Returning raw internal schema errors with cryptic stack traces instead of user-friendly field-level error messages.',
    ],
    interview: [
      'What is the advantage of using Zod over manual validation statements in Express controllers?',
      'How does schema-based validation prevent mass assignment vulnerabilities?',
    ],
    next: ['centralized-error-handling', 'layered-architecture', 'auth-middleware-rbac'],
  },

  // ─── 4. Centralized Error Handling ──────────────────────────────────────────
  {
    id: 'centralized-error-handling',
    level: 2,
    order: 4,
    title: 'Centralized Error Handling',
    oneLiner: 'Funnel every application error into one global middleware to ensure consistent, safe responses.',
    mentalModel:
      'A hospital triage desk: no matter which ward or clinic an accident occurs in, every patient passes through the same desk to receive standardized classification, logging, and treatment.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Error thrown in Controller / Service',
          caption: 'Any runtime exception, rejected promise, or custom AppError is thrown during request handling.',
          highlights: ['stage-0'],
        },
        {
          label: 'Forwarded via next(err)',
          caption: 'Async wrapper forwards the caught error straight into Express middleware chain using next(err).',
          highlights: ['stage-1'],
        },
        {
          label: 'Global Error Middleware catches',
          caption: 'The 4-parameter error handler (err, req, res, next) intercepts the error before it can crash the process.',
          highlights: ['stage-2'],
        },
        {
          label: 'Classification & Logging',
          caption: 'Distinguishes between trusted operational errors (4xx) and unknown bugs (5xx). Logs stack traces internally.',
          highlights: ['stage-3'],
        },
        {
          label: 'Standard JSON response sent',
          caption: 'Client receives a clean { status, message } response without leaking internal paths or stack traces.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `export class AppError extends Error {
  constructor(public message: string, public statusCode = 500) {
    super(message)
  }
}

// Global error-handling middleware (must have 4 arguments)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500
  const message = err instanceof AppError ? err.message : 'Internal Server Error'

  if (statusCode === 500) logger.error(err.stack) // log internally only
  res.status(statusCode).json({ error: { message, statusCode } })
})`,
      highlights: { 1: 'emerald', 8: 'rose', 9: 'amber', 12: 'rose', 13: 'emerald' },
    },
    terms: ['centralized-error', 'app-error', 'error-middleware', 'operational-error', 'stack-trace', 'fail-safe'],
    pitfalls: [
      'Defining error middleware with only 3 arguments — Express will treat it as regular middleware and bypass it on errors.',
      'Sending err.stack in production responses, leaking system directory structure and database credentials.',
      'Swallowing errors in try/catch blocks without re-throwing or passing to next(err), leaving clients hanging.',
    ],
    interview: [
      'What are the requirements for a function to be recognized by Express as an error-handling middleware?',
      'Why should you distinguish between custom operational errors and unknown system errors in your global error handler?',
    ],
    next: ['operational-vs-programmer-errors', 'async-error-wrapper', 'input-validation-zod'],
  },

  // ─── 5. Operational vs Programmer Errors ─────────────────────────────────────
  {
    id: 'operational-vs-programmer-errors',
    level: 2,
    order: 5,
    title: 'Operational vs Programmer Errors',
    oneLiner: 'Operational errors are expected runtime issues; programmer errors are bugs that require code fixes.',
    mentalModel:
      'Operational error: a customer hands you an expired credit card (expected, handle gracefully). Programmer error: the cash register software crashes due to undefined.total (bug, needs a patch).',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'Nature & Predictability',
          caption: 'Operational errors are inevitable in real-world environments (network drop, invalid input). Programmer errors are bugs in your code.',
          highlights: [tpc({
            left: {
              title: 'Operational Errors (Expected)',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Cause', value: 'Invalid client input, DB connection drop, expired token' },
                { label: 'Response', value: 'Send 4xx or 503 with helpful user guidance' },
                { label: 'Action', value: 'Log as warning, do NOT restart process' },
                { label: 'Handled by', value: 'Custom AppError class with isOperational=true' },
              ],
            },
            right: {
              title: 'Programmer Errors (Bugs)',
              color: 'rose',
              activeRow: 0,
              rows: [
                { label: 'Cause', value: 'TypeError: cannot read property of undefined, syntax error' },
                { label: 'Response', value: 'Generic 500 "Internal Server Error"' },
                { label: 'Action', value: 'Alert team, log fatal stack, restart process via PM2/K8s' },
                { label: 'Handled by', value: 'Unit tests, TypeScript, uncaughtException handlers' },
              ],
            },
            badge: { side: 'left', text: 'Known Runtime States', color: 'amber' },
          })],
        },
        {
          label: 'Process Recovery Strategy',
          caption: 'Keep the server running on operational errors. Gracefully restart the worker process when an unexpected bug corrupts application memory.',
          highlights: [tpc({
            left: {
              title: 'Operational Handling',
              color: 'emerald',
              activeRow: 1,
              rows: [
                { label: 'Memory', value: 'Application state remains intact and safe' },
                { label: 'Process', value: 'Continue serving other concurrent requests' },
                { label: 'Recovery', value: 'Client retries or corrects credentials' },
              ],
            },
            right: {
              title: 'Bug / Crash Handling',
              color: 'rose',
              activeRow: 1,
              rows: [
                { label: 'Memory', value: 'State may be corrupted or leaking memory' },
                { label: 'Process', value: 'Gracefully shutdown and let supervisor restart' },
                { label: 'Recovery', value: 'Hotfix code deployment needed' },
              ],
            },
            badge: { side: 'right', text: 'Crash & Restart Safely', color: 'rose' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Operational error: expected, trusted
export class NotFoundError extends AppError {
  constructor(entity: string) {
    super(\`\${entity} not found\`, 404)
    this.isOperational = true
  }
}

// Programmer error: unhandled bug
// const user = undefined
// console.log(user.name) // throws TypeError!

process.on('uncaughtException', (err) => {
  logger.fatal('Programmer error detected:', err)
  process.exit(1) // restart via process manager
})`,
      highlights: { 2: 'emerald', 5: 'emerald', 13: 'rose', 15: 'rose' },
    },
    terms: ['operational-error', 'programmer-error', 'app-error', 'process-exit', 'uncaught-exception', 'fail-fast'],
    pitfalls: [
      'Catching programmer bugs (like TypeErrors) and continuing execution with corrupted in-memory state.',
      'Treating every error as a 500, making it impossible for clients to distinguish between bad input and server crashes.',
      'Ignoring process unhandledRejection events, allowing subtle silent failures in Node.js processes.',
    ],
    interview: [
      'What is the fundamental difference between an operational error and a programmer error in Node.js?',
      'Why is it recommended to restart the Node process after encountering an uncaught programmer error?',
    ],
    next: ['centralized-error-handling', 'async-error-wrapper', 'logging-and-config'],
  },

  // ─── 6. Async Error Wrapper ─────────────────────────────────────────────────
  {
    id: 'async-error-wrapper',
    level: 2,
    order: 6,
    title: 'Async Error Wrapper',
    oneLiner: 'Wrap async route handlers to automatically catch rejected promises and forward them to next().',
    mentalModel:
      'An electrical circuit breaker wrapper around your appliance. If the appliance shorts out (async function rejects), the breaker trips instantly and directs the power surge safely into the ground wire (next(err)).',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Request enters wrapped handler',
          caption: 'catchAsync(fn) returns a standard Express middleware function signature (req, res, next).',
          highlights: ['stage-0'],
        },
        {
          label: 'Async handler executes',
          caption: 'The original async controller logic executes. Promise is returned.',
          highlights: ['stage-1'],
        },
        {
          label: 'Async operation rejects',
          caption: 'An unhandled promise rejection occurs (e.g. database timeout or failed assertion).',
          highlights: ['stage-2'],
        },
        {
          label: '.catch(next) catches rejection',
          caption: 'Promise.resolve(fn(req, res, next)).catch(next) intercepts the rejection automatically.',
          highlights: ['stage-3'],
        },
        {
          label: 'Forwarded to error middleware',
          caption: 'Control shifts to global error middleware without needing manual try/catch blocks everywhere.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Universal async error wrapper utility
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Clean controller without repetitive try/catch boilerplate
export const getUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.params.id)
  if (!user) throw new NotFoundError('User')
  res.json({ user })
})`,
      highlights: { 2: 'emerald', 4: 'rose', 9: 'emerald', 11: 'amber', 12: 'emerald' },
    },
    terms: ['catch-async', 'promise-rejection', 'error-middleware', 'higher-order-function', 'boilerplate'],
    pitfalls: [
      'Writing manual try/catch blocks in every single route handler leads to massive boilerplate and missed catches.',
      'Forgetting to return or await an async function inside catchAsync can cause race conditions.',
      'In Express 5, async errors are natively caught, but in Express 4 an async error without catchAsync hangs the request forever.',
    ],
    interview: [
      'What happens in Express 4 if an async route handler throws an error without a try/catch or wrapper?',
      'How does the higher-order catchAsync function work under the hood?',
    ],
    next: ['centralized-error-handling', 'operational-vs-programmer-errors', 'input-validation-zod'],
  },

  // ─── 7. Mongoose Schema Deep Dive ───────────────────────────────────────────
  {
    id: 'mongoose-schema-deep-dive',
    level: 2,
    order: 7,
    title: 'Mongoose Schema Deep Dive',
    oneLiner: 'Use custom validators, getters, virtuals, and hooks to enforce data integrity before saving.',
    mentalModel:
      'A quality control assembly line in a factory. Before a manufactured item is boxed (saved to MongoDB), it passes through dimension calipers (types), safety checks (custom validators), and serial number stamps (pre-save hooks).',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Document created in memory',
          caption: 'new User({ email, password }) initializes a Mongoose document instance.',
          highlights: ['stage-0'],
        },
        {
          label: 'Built-in & custom validators run',
          caption: 'Checks required, enum, regex, and async validators (e.g. verifying email format).',
          highlights: ['stage-1'],
        },
        {
          label: 'Pre-save middleware triggers',
          caption: 'Runs schema.pre("save", async function) to hash passwords or generate slugs before storage.',
          highlights: ['stage-2'],
        },
        {
          label: 'Saved to collection',
          caption: 'Data writes to MongoDB collection with schema timestamps (createdAt, updatedAt).',
          highlights: ['stage-3'],
        },
        {
          label: 'Virtuals & getters computed',
          caption: 'Virtual fields like user.fullName are evaluated dynamically on JSON output without being stored.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `const userSchema = new Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true })

// Pre-save hook: hash password automatically
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
})

// Virtual: computed at runtime, not stored in DB
userSchema.virtual('domain').get(function() {
  return this.email.split('@')[1]
})`,
      highlights: { 2: 'emerald', 8: 'amber', 9: 'amber', 10: 'rose', 14: 'emerald' },
    },
    terms: ['mongoose', 'schema', 'pre-save-hook', 'virtuals', 'validators', 'timestamps', 'schema-options'],
    pitfalls: [
      'Using arrow functions in schema methods or pre-save hooks, which loses the this binding to the document.',
      'Forgetting this.isModified("password") check, which re-hashes already hashed passwords on regular updates.',
      'Updating documents with Model.updateOne() skips document validation and pre("save") hooks by default.',
    ],
    interview: [
      'Why is it critical to check this.isModified("password") inside a Mongoose pre-save hook?',
      'What is the difference between a Mongoose virtual property and a regular schema field?',
    ],
    next: ['embedding-vs-referencing', 'hashing-and-salting', 'populate-vs-lookup'],
  },

  // ─── 8. Embedding vs Referencing ─────────────────────────────────────────────
  {
    id: 'embedding-vs-referencing',
    level: 2,
    order: 8,
    title: 'Embedding vs Referencing',
    oneLiner: 'Embed for data accessed together; reference for unbounded growth and many-to-many relationships.',
    mentalModel:
      'Embedding is having your driver\'s license inside your physical wallet (always with you, fetched in one grab). Referencing is storing an address in your contacts book pointing to a warehouse across town (fetched only when needed).',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'Data access patterns',
          caption: 'Embedded documents are stored directly inside parent documents. Referenced documents store ObjectIds pointing to separate collections.',
          highlights: [tpc({
            left: {
              title: 'Embedded (Denormalized)',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Storage', value: 'Nested subdocuments or arrays in parent doc' },
                { label: 'Read Speed', value: 'Super fast — single disk read, no joins' },
                { label: 'Updates', value: 'Atomic within single parent document' },
                { label: 'Best for', value: '1-to-Few (e.g. user addresses, order items)' },
              ],
            },
            right: {
              title: 'Referenced (Normalized)',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Storage', value: 'ObjectIds pointing to separate collection' },
                { label: 'Read Speed', value: 'Requires populate() or $lookup join' },
                { label: 'Document Limit', value: 'Safe from 16MB document size limit' },
                { label: 'Best for', value: '1-to-Many unbounded (e.g. log events, comments)' },
              ],
            },
            badge: { side: 'left', text: 'Fast Single Reads', color: 'emerald' },
          })],
        },
        {
          label: 'The 16MB boundary rule',
          caption: 'MongoDB documents cannot exceed 16MB. Embedding unbounded arrays (e.g. millions of activity logs) will eventually crash your database writes.',
          highlights: [tpc({
            left: {
              title: 'Embed when...',
              color: 'emerald',
              activeRow: 1,
              rows: [
                { label: 'Bound', value: 'Array size is small and strictly bounded (<100)' },
                { label: 'Access', value: 'Data is always read together with parent' },
                { label: 'Isolation', value: 'Child has no independent lifecycle' },
              ],
            },
            right: {
              title: 'Reference when...',
              color: 'rose',
              activeRow: 1,
              rows: [
                { label: 'Bound', value: 'Unbounded growth (e.g. tweets, sensor logs)' },
                { label: 'Access', value: 'Child records are frequently queried alone' },
                { label: 'Duplication', value: 'Avoiding stale duplicated copies across records' },
              ],
            },
            badge: { side: 'right', text: 'Avoid 16MB Cap', color: 'rose' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// 1. EMBEDDED: Addresses live inside User doc
const userSchema = new Schema({
  name: String,
  addresses: [{ street: String, city: String, zip: String }]
})

// 2. REFERENCED: Orders live in separate collection
const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ productId: String, quantity: Number }],
  total: Number
})`,
      highlights: { 4: 'emerald', 9: 'amber', 10: 'emerald' },
    },
    terms: ['embedding', 'referencing', 'denormalization', '16mb-limit', 'populate', 'one-to-many'],
    pitfalls: [
      'Embedding unbounded arrays: an array of user comments that grows indefinitely will eventually hit the 16MB limit.',
      'Over-referencing everything like a SQL schema, resulting in 10 populate() calls per request and horrible query latency.',
      'Forgetting that embedded subdocuments cannot be easily paginated via native MongoDB query operators.',
    ],
    interview: [
      'What criteria determine whether you should embed subdocuments or use references in MongoDB?',
      'What is MongoDB\'s document size limit, and how does it influence data modeling decisions?',
    ],
    next: ['populate-vs-lookup', 'mongoose-schema-deep-dive', 'transactions-and-sessions'],
  },

  // ─── 9. populate() vs $lookup ───────────────────────────────────────────────
  {
    id: 'populate-vs-lookup',
    level: 2,
    order: 9,
    title: 'populate() vs $lookup',
    oneLiner: 'populate() runs multiple queries in Node; $lookup performs an optimized left outer join inside MongoDB.',
    mentalModel:
      'populate() is like sending a courier back and forth for every single record in an order (N+1 queries). $lookup is having the warehouse manager assemble the whole package on the warehouse floor before shipping it to you in one delivery.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'populate() — Initial query',
          caption: 'Mongoose queries the primary collection: Order.find(). Returns 50 orders with user ObjectIds.',
          highlights: ['stage-0'],
        },
        {
          label: 'populate() — Subsequent queries',
          caption: 'Mongoose collects user IDs and executes a second query: User.find({ _id: { $in: userIds } }).',
          highlights: ['stage-1'],
        },
        {
          label: 'In-memory joining in Node',
          caption: 'Node.js runtime merges the user documents into the orders array. In heavy traffic, this causes high memory consumption.',
          highlights: ['stage-2'],
        },
        {
          label: '$lookup — Single database query',
          caption: 'MongoDB engine executes a single aggregation pipeline stage, joining collections directly on the database server.',
          highlights: ['stage-3'],
        },
        {
          label: 'Optimized pipeline output',
          caption: 'Result is filtered, sorted, and projected on the DB server before sending only the final transformed payload to Node.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Method A: Mongoose populate() (Runs 2+ distinct queries)
const orders = await Order.find()
  .populate('userId', 'name email')
  .lean()

// Method B: MongoDB $lookup aggregation (Runs 1 server-side join)
const ordersAgg = await Order.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user'
    }
  },
  { $unwind: '$user' }
])`,
      highlights: { 3: 'amber', 7: 'emerald', 9: 'emerald', 15: 'rose' },
    },
    terms: ['populate', 'lookup', 'aggregation-pipeline', 'n-plus-one', 'left-outer-join', 'lean'],
    pitfalls: [
      'Chaining multiple deep .populate() calls causes the notorious N+1 query problem and massive latency spikes.',
      'Forgetting .lean() when using populate(), causing Mongoose to instantiate hundreds of heavy Mongoose document wrappers.',
      'Running heavy $lookup operations on unindexed foreign fields will trigger slow collection scans on the joined collection.',
    ],
    interview: [
      'What is the fundamental difference in execution between Mongoose populate() and MongoDB $lookup?',
      'Why is using .lean() recommended when reading large datasets with Mongoose populate()?',
    ],
    next: ['embedding-vs-referencing', 'aggregation-pipeline', 'compound-index-esr-rule'],
  },

  // ─── 10. Compound Index & ESR Rule ───────────────────────────────────────────
  {
    id: 'compound-index-esr-rule',
    level: 2,
    order: 10,
    title: 'Compound Index & ESR Rule',
    oneLiner: 'Order compound index keys by Equality first, Sort second, and Range last.',
    mentalModel:
      'A phone directory: sorted by City (Equality), then by Lastname (Sort), then by Age (Range). If you put Age first, sorting by Lastname becomes impossible without flipping through every page.',
    viz: {
      component: 'TreeTraversal',
      steps: [
        {
          label: 'Query arrives with filters',
          caption: 'Query: find({ status: "active", age: { $gte: 21 } }).sort({ createdAt: -1 }). Needs an efficient compound index.',
          highlights: [tt({ mode: 'IXSCAN', activeNodeId: 'root', comparison: 'ESR Rule: Equality (status) -> Sort (createdAt) -> Range (age)' })],
        },
        {
          label: 'E: Equality matches first',
          caption: 'Status is an exact equality match. The B-Tree immediately zeroes in on matching subtrees, discarding non-active records.',
          highlights: [tt({ mode: 'IXSCAN', activeNodeId: 'child-2', comparison: 'status == "active" narrowed branch' })],
        },
        {
          label: 'S: Sort uses index order',
          caption: 'Because sort key (createdAt) comes before range, the index order satisfies the sort with zero in-memory sort penalty.',
          highlights: [tt({ mode: 'IXSCAN', activeNodeId: 'child-2', comparison: 'Sort satisfied by index (no memory sort)' })],
        },
        {
          label: 'R: Range scan at the end',
          caption: 'Finally, age >= 21 bounds are scanned within the pre-sorted candidate records.',
          highlights: [tt({ mode: 'IXSCAN', activeNodeId: 'child-2', result: 'IXSCAN: 0 in-memory sorting, minimal documents examined' })],
        },
        {
          label: 'COLLSCAN comparison',
          caption: 'Without following ESR, MongoDB scans every document and throws a 32MB in-memory sort exceeded error.',
          highlights: [tt({ mode: 'COLLSCAN', scannedNodeIds: ['root', 'child-1', 'child-2', 'child-3'], comparison: 'COLLSCAN: Scanned entire collection' })],
        },
      ],
    },
    snippet: {
      lang: 'js',
      code: `// Query:
// db.users.find({ status: 'active', age: { $gte: 21 } })
//         .sort({ createdAt: -1 })

// PERFECT INDEX following ESR:
// 1. Equality: status
// 2. Sort:     createdAt
// 3. Range:    age
db.users.createIndex({
  status: 1,      // E - Equality
  createdAt: -1,  // S - Sort
  age: 1          // R - Range
})`,
      highlights: { 8: 'emerald', 9: 'amber', 10: 'rose' },
    },
    terms: ['compound-index', 'esr-rule', 'ixscan', 'collscan', 'b-tree', 'sort-memory-limit'],
    pitfalls: [
      'Placing Range fields before Sort fields in compound indexes forces MongoDB to do a slow in-memory sort.',
      'Exceeding MongoDB\'s 32MB in-memory sort limit when index keys do not cover the requested sort order.',
      'Creating multiple overlapping indexes that waste RAM and degrade write performance instead of one well-crafted ESR index.',
    ],
    interview: [
      'Explain the ESR (Equality, Sort, Range) rule for designing compound indexes in MongoDB.',
      'What happens if a query requiring a sort cannot use an index for the sorting phase?',
    ],
    next: ['indexing-collscan-ixscan', 'pagination-filter-sort-projection', 'aggregation-pipeline'],
  },

  // ─── 11. Pagination, Filter, Sort, Projection ───────────────────────────────
  {
    id: 'pagination-filter-sort-projection',
    level: 2,
    order: 11,
    title: 'Pagination, Filter, Sort, Projection',
    oneLiner: 'Use cursor pagination for large datasets and projection to return only necessary fields.',
    mentalModel:
      'Window shopping: projection chooses which items to put in the window (hide sensitive data), and cursor pagination is a bookmark remembering where you stopped reading, avoiding recounting from page 1 every time.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Parse query parameters',
          caption: 'Extract page, limit, sort, fields, and filter criteria from req.query.',
          highlights: ['stage-0'],
        },
        {
          label: 'Apply Filter ($match)',
          caption: 'Build database filter object, excluding reserved keywords (page, sort, limit).',
          highlights: ['stage-1'],
        },
        {
          label: 'Apply Sort & Pagination',
          caption: 'Offset skip((page-1)*limit) or cursor _id > lastId limits rows evaluated.',
          highlights: ['stage-2'],
        },
        {
          label: 'Apply Projection',
          caption: 'Select only needed fields (.select("-password -__v")), reducing network payload size.',
          highlights: ['stage-3'],
        },
        {
          label: 'Deliver metadata envelope',
          caption: 'Return { data, total, page, totalPages } so clients can render pagination controls.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Cursor-based pagination (fast on 1M+ rows)
export async function getProducts(req: Request, res: Response) {
  const { limit = 20, cursor } = req.query
  const query = cursor ? { _id: { $gt: cursor } } : {}

  const products = await Product.find(query)
    .sort({ _id: 1 })
    .limit(Number(limit) + 1)
    .select('title price category inStock') // projection

  const hasNext = products.length > Number(limit)
  if (hasNext) products.pop()

  res.json({ products, nextCursor: hasNext ? products.at(-1)?._id : null })
}`,
      highlights: { 4: 'amber', 7: 'emerald', 8: 'emerald', 9: 'rose', 14: 'emerald' },
    },
    terms: ['pagination', 'cursor-pagination', 'offset-pagination', 'projection', 'filtering', 'sorting'],
    pitfalls: [
      'Using skip(100000) in offset pagination: MongoDB must scan all 100,000 documents into memory before discarding them.',
      'Omitting projection and accidentally returning password hashes or internal secret keys to the client.',
      'Allowing arbitrary client query strings directly into Product.find(req.query), enabling NoSQL injection attacks.',
    ],
    interview: [
      'Why is cursor-based pagination significantly faster than offset-based skip/limit pagination on large tables?',
      'How does field projection improve performance across the database and network layers?',
    ],
    next: ['compound-index-esr-rule', 'aggregation-pipeline', 'input-validation-zod'],
  },

  // ─── 12. Aggregation Pipeline ───────────────────────────────────────────────
  {
    id: 'aggregation-pipeline',
    level: 2,
    order: 12,
    title: 'Aggregation Pipeline',
    oneLiner: 'Process documents through sequential stages to filter, reshape, group, and calculate analytics.',
    mentalModel:
      'An industrial juice factory: raw fruit enters, sorting stage removes bruised fruit ($match), juicer extracts liquid ($project), blending vats combine flavors ($group), and packing line sorts bottles ($sort).',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: '$match Stage',
          caption: 'Filters documents to only include orders with status: "completed". Always place $match early.',
          highlights: ['stage-0'],
        },
        {
          label: '$unwind Stage',
          caption: 'Deconstructs an array field from the input documents to output a document for each element.',
          highlights: ['stage-1'],
        },
        {
          label: '$group Stage',
          caption: 'Groups documents by category and calculates total revenue ($sum) and average quantity ($avg).',
          highlights: ['stage-2'],
        },
        {
          label: '$sort Stage',
          caption: 'Orders the grouped aggregation results by totalSales in descending order.',
          highlights: ['stage-3'],
        },
        {
          label: '$project Stage',
          caption: 'Reshapes output documents, renaming fields and omitting temporary calculation keys.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Revenue analytics per category
const salesStats = await Order.aggregate([
  // 1. Filter completed orders (uses index!)
  { $match: { status: 'completed' } },
  // 2. Unpack line items array
  { $unwind: '$items' },
  // 3. Group by product category & accumulate
  {
    $group: {
      _id: '$items.category',
      totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      orderCount: { $sum: 1 }
    }
  },
  // 4. Sort highest revenue first
  { $sort: { totalRevenue: -1 } }
])`,
      highlights: { 4: 'emerald', 6: 'amber', 9: 'rose', 10: 'rose', 16: 'emerald' },
    },
    terms: ['aggregation-pipeline', 'match', 'group', 'unwind', 'project', 'accumulators'],
    pitfalls: [
      'Placing $group or $unwind before $match forces MongoDB to process the entire collection instead of an indexed subset.',
      'Memory limit: aggregation stages have a 100MB RAM cap by default; heavy pipelines require allowDiskUse: true.',
      'Treating aggregation pipelines as simple queries — complex aggregations on large datasets should be cached in Redis.',
    ],
    interview: [
      'Why is it best practice to place the $match stage as early as possible in an aggregation pipeline?',
      'What is the purpose of the $unwind stage in MongoDB aggregation?',
    ],
    next: ['compound-index-esr-rule', 'populate-vs-lookup', 'cache-aside-pattern'],
  },

  // ─── 13. Hashing & Salting ──────────────────────────────────────────────────
  {
    id: 'hashing-and-salting',
    level: 2,
    order: 13,
    title: 'Hashing & Salting',
    oneLiner: 'Salting adds unique randomness before hashing to defeat precomputed rainbow table attacks.',
    mentalModel:
      'Hashing is baking a cake: easy to bake (one-way), impossible to turn back into flour and eggs. Salting is adding a unique secret spice to every cake so two cakes made from the same recipe look and taste completely different.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Plaintext password submitted',
          caption: 'User enters "supersecret" on registration. Plaintext must never be stored in database.',
          highlights: ['stage-0'],
        },
        {
          label: 'Cryptographic Salt generated',
          caption: 'bcrypt generates a cryptographically secure random salt (e.g. 16 random bytes).',
          highlights: ['stage-1'],
        },
        {
          label: 'Combined & hashed',
          caption: 'The salt is prepended to the password and hashed through thousands of key-stretching rounds.',
          highlights: ['stage-2'],
        },
        {
          label: 'Self-contained hash stored',
          caption: 'Result format: $2b$12$[salt][hash]. The salt is stored directly within the final hash string.',
          highlights: ['stage-3'],
        },
        {
          label: 'Verification on login',
          caption: 'bcrypt.compare() extracts the salt from the stored hash, hashes the input password, and compares output.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import bcrypt from 'bcrypt'

// Hash password with 12 salt rounds (cost factor)
export async function hashPassword(plain: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(plain, saltRounds)
}

// Compare password on login (constant-time comparison)
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}`,
      highlights: { 5: 'amber', 6: 'emerald', 11: 'emerald' },
    },
    terms: ['hashing', 'salting', 'bcrypt', 'rainbow-table', 'key-stretching', 'cost-factor'],
    pitfalls: [
      'Using fast hash functions (MD5, SHA256) for passwords — modern GPUs calculate billions of SHA256 hashes per second.',
      'Setting bcrypt cost factor too low (<10) makes brute force easy; setting it too high (>14) blocks the Node.js event loop.',
      'Re-inventing custom crypto algorithms instead of using standard proven libraries like bcrypt or argon2.',
    ],
    interview: [
      'Why is a slow algorithm like bcrypt preferred over fast hash algorithms like SHA-256 for password storage?',
      'How does salting prevent rainbow table attacks?',
    ],
    next: ['jwt-anatomy', 'sessions-vs-jwt', 'access-refresh-tokens'],
  },

  // ─── 14. Sessions vs JWT ─────────────────────────────────────────────────────
  {
    id: 'sessions-vs-jwt',
    level: 2,
    order: 14,
    title: 'Sessions vs JWT',
    oneLiner: 'Sessions are stateful and revocable; JWTs are stateless and self-contained.',
    mentalModel:
      'Sessions are a coat-check ticket: the ticket has just a number; the coat stays in the wardrobe (server memory). A JWT is a certified badge: all your credentials and permissions are stamped directly onto the badge you carry.',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'State location & Verification',
          caption: 'Sessions store state in server memory or Redis. JWTs store claims directly in the token payload verified by cryptographic signature.',
          highlights: [tpc({
            left: {
              title: 'Stateful Sessions',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Storage', value: 'Session ID in cookie; full session data in Redis' },
                { label: 'Revocation', value: 'Instant! Delete session key from Redis' },
                { label: 'Scalability', value: 'Requires shared Redis cluster across servers' },
                { label: 'Size', value: 'Tiny cookie payload (~32 bytes)' },
              ],
            },
            right: {
              title: 'Stateless JWTs',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Storage', value: 'Token stored in memory or httpOnly cookie' },
                { label: 'Revocation', value: 'Difficult before expiration without blacklist' },
                { label: 'Scalability', value: 'High — any server verifies signature with secret' },
                { label: 'Size', value: 'Large payload (~500+ bytes in HTTP headers)' },
              ],
            },
            badge: { side: 'left', text: 'Instant Revocation', color: 'emerald' },
          })],
        },
        {
          label: 'Tradeoffs and Use Cases',
          caption: 'Choose sessions when immediate logout and admin bans must take effect instantly. Choose JWTs for distributed microservices.',
          highlights: [tpc({
            left: {
              title: 'Use Sessions for:',
              color: 'emerald',
              activeRow: 1,
              rows: [
                { label: 'Monoliths', value: 'Single backend with fast Redis' },
                { label: 'High Security', value: 'Banking, admin dashboards requiring immediate kick' },
                { label: 'Simple Auth', value: 'Server handles rotation and expiry automatically' },
              ],
            },
            right: {
              title: 'Use JWT for:',
              color: 'amber',
              activeRow: 1,
              rows: [
                { label: 'Microservices', value: 'Services verify token without database calls' },
                { label: 'Mobile Apps', value: 'Non-browser API clients' },
                { label: 'Serverless', value: 'Stateless lambdas without database connections' },
              ],
            },
            badge: { side: 'right', text: 'Decentralized', color: 'amber' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// SESSION APPROACH (Express-session + Redis)
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 }
}))

// Instant revocation with sessions:
app.post('/logout', (req, res) => {
  req.session.destroy(err => res.sendStatus(204)) // deletes from Redis
})`,
      highlights: { 3: 'emerald', 7: 'rose', 12: 'emerald' },
    },
    terms: ['sessions', 'jwt', 'stateful', 'stateless', 'session-id', 'revocation', 'redis-store'],
    pitfalls: [
      'Believing JWTs are "faster" when the server still performs a database query on every request anyway.',
      'Storing sensitive data (passwords, credit cards) inside JWT payloads — JWTs are encoded Base64, not encrypted.',
      'Using in-memory session store in production: restarting your server logs out every active user.',
    ],
    interview: [
      'How does session invalidation differ fundamentally between server-side sessions and stateless JWTs?',
      'If you must use JWTs, how would you implement a mechanism to ban or revoke a compromised token?',
    ],
    next: ['jwt-anatomy', 'access-refresh-tokens', 'cookies-security-flags'],
  },

  // ─── 15. Access + Refresh Tokens ────────────────────────────────────────────
  {
    id: 'access-refresh-tokens',
    level: 2,
    order: 15,
    title: 'Access + Refresh Tokens',
    oneLiner: 'Short-lived access tokens minimize exposure; long-lived refresh tokens rotate on use.',
    mentalModel:
      'Hotel room key: the plastic room keycard (access token) expires every 15 minutes for security. When it expires, you show your passport at the concierge (refresh token) to get a new room key without re-entering your login password.',
    viz: {
      component: 'StateMachine',
      steps: [
        {
          label: 'Initial Login: Dual Tokens Issued',
          caption: 'Server validates credentials, issuing a 15-min Access Token (sent to client) and a 7-day Refresh Token (stored in httpOnly cookie & DB).',
          highlights: [sm({
            states: [
              { id: 'login', label: 'Issue Tokens', desc: '15m access / 7d refresh' },
              { id: 'active', label: 'Authenticated', desc: 'Access token valid' },
              { id: 'expired', label: 'Access Expired', desc: '401 Unauthorized' },
              { id: 'refresh', label: 'Token Rotated', desc: 'New pair issued' },
            ],
            activeState: 'login',
            transitionLabel: 'Credentials OK',
            status: 'success'
          })],
        },
        {
          label: 'Normal Requests: Access Token in use',
          caption: 'Client attaches Authorization: Bearer <access_token>. Server verifies signature in memory without querying the database.',
          highlights: [sm({
            activeState: 'active',
            transitionLabel: 'Access Valid',
            status: 'success'
          })],
        },
        {
          label: 'Access Token Expires',
          caption: 'After 15 minutes, verification fails with TokenExpiredError. Server returns HTTP 401 with code "TOKEN_EXPIRED".',
          highlights: [sm({
            activeState: 'expired',
            transitionLabel: '15 mins elapsed',
            status: 'warning'
          })],
        },
        {
          label: 'Silent Refresh & Token Rotation',
          caption: 'Client sends refresh token to /api/auth/refresh. Server checks DB, invalidates old refresh token, and issues a fresh pair.',
          highlights: [sm({
            activeState: 'refresh',
            transitionLabel: 'Rotate tokens',
            status: 'success'
          })],
        },
        {
          label: 'Theft Detection (Reuse Detection)',
          caption: 'If an already-rotated refresh token is used, server assumes theft, invalidates the entire refresh family, and forces re-login.',
          highlights: [sm({
            activeState: 'expired',
            transitionLabel: 'Reused token detected!',
            status: 'error'
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `export async function refresh(req: Request, res: Response) {
  const token = req.cookies.refreshToken
  if (!token) throw new UnauthorizedError('Missing token')

  const payload = jwt.verify(token, process.env.REFRESH_SECRET!) as { sub: string }
  const session = await SessionModel.findOne({ token })

  // REUSE DETECTION: Token was already used! Compromise suspected.
  if (!session) {
    await SessionModel.deleteMany({ userId: payload.sub }) // revoke all!
    throw new ForbiddenError('Compromised token reuse detected')
  }

  await session.deleteOne() // consume old token
  const newAccess = signAccessToken(payload.sub)
  const newRefresh = await createRefreshToken(payload.sub)
  res.cookie('refreshToken', newRefresh, cookieConfig).json({ accessToken: newAccess })
}`,
      highlights: { 5: 'emerald', 9: 'rose', 10: 'rose', 14: 'amber', 17: 'emerald' },
    },
    terms: ['access-token', 'refresh-token', 'token-rotation', 'reuse-detection', 'jwt-expiry', 'bearer-token'],
    pitfalls: [
      'Storing refresh tokens in localStorage, leaving them wide open to Cross-Site Scripting (XSS) extraction.',
      'Failing to implement token rotation — if a long-lived refresh token is permanent, stealing it compromises the account for months.',
      'Omitting refresh token reuse detection, leaving users unprotected when a token family is intercepted.',
    ],
    interview: [
      'Why is the access token lifetime intentionally kept very short (e.g. 15 minutes)?',
      'Explain how Refresh Token Rotation with Automatic Reuse Detection protects against token theft.',
    ],
    next: ['jwt-anatomy', 'sessions-vs-jwt', 'cookies-security-flags'],
  },

  // ─── 16. Cookies & Security Flags ────────────────────────────────────────────
  {
    id: 'cookies-security-flags',
    level: 2,
    order: 16,
    title: 'Cookies & Security Flags',
    oneLiner: 'Protect auth cookies against XSS and CSRF using httpOnly, Secure, and SameSite flags.',
    mentalModel:
      'httpOnly is a sealed envelope JavaScript cannot open; Secure requires delivery by armored car (HTTPS); SameSite ensures the envelope is only accepted when sent directly from your own bank.',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'The Critical Cookie Flags',
          caption: 'Every authentication cookie must combine httpOnly, Secure, and SameSite to defend against browser attack vectors.',
          highlights: [tpc({
            left: {
              title: 'Protective Flags',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'httpOnly', value: 'Blocks document.cookie access. Completely neutralizes XSS token theft.' },
                { label: 'Secure', value: 'Browser transmits cookie ONLY over encrypted HTTPS connections.' },
                { label: 'SameSite=Strict', value: 'Cookie never sent on cross-site requests. 100% blocks CSRF.' },
                { label: 'SameSite=Lax', value: 'Sent on top-level navigation (safe links), blocked on cross-origin POSTs.' },
              ],
            },
            right: {
              title: 'Attacks Defeated',
              color: 'rose',
              activeRow: 0,
              rows: [
                { label: 'XSS Theft', value: 'Malicious scripts cannot read tokens out of memory or storage' },
                { label: 'Man-in-Middle', value: 'Prevent sniffing of credentials on public Wi-Fi' },
                { label: 'CSRF Attack', value: 'Third-party sites cannot forge authenticated transactions' },
                { label: 'Clickjacking', value: 'Unauthorized actions embedded in iframes are blocked' },
              ],
            },
            badge: { side: 'left', text: 'Three-Layer Shield', color: 'emerald' },
          })],
        },
        {
          label: 'SameSite Lax vs Strict vs None',
          caption: 'SameSite controls when cookies are sent with cross-site requests. Most web applications use Lax for normal user flows.',
          highlights: [tpc({
            left: {
              title: 'SameSite=Lax (Recommended)',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Links', value: 'Cookie sent when user clicks external link to your site' },
                { label: 'Forms/POST', value: 'Cookie NOT sent on cross-site POST submissions' },
                { label: 'UX', value: 'User remains logged in when clicking search results' },
              ],
            },
            right: {
              title: 'SameSite=None (Third-Party)',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Cross-Site', value: 'Sent on all cross-origin requests (e.g. iframes, CDNs)' },
                { label: 'Requirement', value: 'MUST also have Secure=true' },
                { label: 'Risk', value: 'Vulnerable to CSRF unless protected by anti-CSRF tokens' },
              ],
            },
            badge: { side: 'left', text: 'Default in Browsers', color: 'emerald' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Express production cookie configuration
const isProd = process.env.NODE_ENV === 'production'

res.cookie('refreshToken', token, {
  httpOnly: true,                 // immune to document.cookie XSS
  secure: isProd,                 // HTTPS only in production
  sameSite: 'lax',                // CSRF defense
  path: '/api/v1/auth/refresh',   // scope to refresh route only!
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
})`,
      highlights: { 5: 'emerald', 6: 'amber', 7: 'emerald', 8: 'rose', 9: 'emerald' },
    },
    terms: ['cookies', 'http-only', 'secure-cookie', 'same-site', 'csrf', 'xss'],
    pitfalls: [
      'Setting Secure: true in local development without HTTPS causes the browser to silently drop the cookie.',
      'Missing the httpOnly flag, allowing any third-party npm package with an XSS bug to read auth tokens.',
      'Setting SameSite=None without Secure: true is rejected by modern browsers according to IETF spec.',
    ],
    interview: [
      'What specific security vulnerability does the httpOnly cookie flag mitigate, and what does it NOT prevent?',
      'How does the SameSite cookie attribute protect web applications against Cross-Site Request Forgery (CSRF)?',
    ],
    next: ['access-refresh-tokens', 'sessions-vs-jwt', 'auth-middleware-rbac'],
  },

  // ─── 17. Auth Middleware + RBAC ──────────────────────────────────────────────
  {
    id: 'auth-middleware-rbac',
    level: 2,
    order: 17,
    title: 'Auth Middleware + RBAC',
    oneLiner: 'Verify who the user is (Authentication), then verify what they are allowed to do (Authorization).',
    mentalModel:
      'Authentication is showing your passport at airport security (proves who you are). Authorization (RBAC) is your boarding pass: regular ticket gets economy; first-class ticket unlocks the private lounge.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Request arrives with Bearer token',
          caption: 'Client sends Authorization header on request to protected endpoint.',
          highlights: ['stage-0'],
        },
        {
          label: 'Authentication: Verify JWT',
          caption: 'Auth middleware verifies signature and expiry. If invalid, aborts with 401 Unauthorized.',
          highlights: ['stage-1'],
        },
        {
          label: 'Attach user to req.user',
          caption: 'Payload claims (id, role, permissions) attached to Express Request object for downstream handlers.',
          highlights: ['stage-2'],
        },
        {
          label: 'Authorization: RBAC check',
          caption: 'authorize("admin", "manager") checks if req.user.role matches allowed roles. Returns 403 Forbidden if not.',
          highlights: ['stage-3'],
        },
        {
          label: 'Route handler executes',
          caption: 'User is authenticated and authorized; privileged route handler executes business operation.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// 1. Authenticate: Verify token & attach user
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) throw new UnauthorizedError('Authentication token required')
  req.user = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser
  next()
}

// 2. Authorize: Role-Based Access Control (RBAC)
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You lack permission to perform this action')
    }
    next()
  }
}`,
      highlights: { 4: 'rose', 5: 'emerald', 12: 'rose', 14: 'emerald' },
    },
    terms: ['rbac', 'authentication', 'authorization', 'bearer-token', 'unauthorized', 'forbidden', 'claims'],
    pitfalls: [
      'Confusing 401 Unauthorized (not logged in) with 403 Forbidden (logged in, but lacking permission).',
      'Hardcoding role checks inside controller bodies instead of composable reusable middleware functions.',
      'Checking only roles instead of resource ownership (e.g. allowing user A to delete user B\'s post because both have role "user").',
    ],
    interview: [
      'What is the architectural difference between Authentication and Authorization?',
      'How would you implement resource-level ownership validation alongside role-based access control?',
    ],
    next: ['jwt-anatomy', 'cookies-security-flags', 'rate-limiting'],
  },

  // ─── 18. Rate Limiting ───────────────────────────────────────────────────────
  {
    id: 'rate-limiting',
    level: 2,
    order: 18,
    title: 'Rate Limiting',
    oneLiner: 'Throttle requests per IP or API key to protect servers from brute force and DoS attacks.',
    mentalModel:
      'A subway turnstile that only allows one passenger through every 5 seconds. If a crowd rushes the gate, the gate locks until the timer allows the next person through.',
    viz: {
      component: 'TokenBucket',
      steps: [
        {
          label: 'Bucket starts with full capacity',
          caption: 'Token bucket initialized with capacity of 5 tokens. Incoming requests are allowed.',
          highlights: [tb({ capacity: 5, tokens: 5, action: 'consume', requestAllowed: true, message: 'Bucket full (5/5 tokens)' })],
        },
        {
          label: 'Requests consume tokens',
          caption: 'Rapid burst requests arrive. Each request consumes 1 token. Requests are approved with 200 OK.',
          highlights: [tb({ capacity: 5, tokens: 2, action: 'consume', requestAllowed: true, message: '3 requests processed: 2 tokens left' })],
        },
        {
          label: 'Bucket depleted — 429 response',
          caption: 'Bucket reaches 0 tokens. Rate limit exceeded! Server rejects incoming request with HTTP 429 Too Many Requests.',
          highlights: [tb({ capacity: 5, tokens: 0, action: 'rejected', requestAllowed: false, message: '429 Rate Limit Exceeded' })],
        },
        {
          label: 'Refill tokens over time',
          caption: 'Tokens replenish at fixed refill rate (e.g. 1 token per second). Bucket refills back to steady state.',
          highlights: [tb({ capacity: 5, tokens: 3, action: 'refill', requestAllowed: true, message: 'Refill interval elapsed: +3 tokens restored' })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'

// Strict rate limit for authentication endpoints (prevent brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // limit each IP to 5 failed attempts per window
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,    // Return rate limit info in \`RateLimit-*\` headers
  legacyHeaders: false,
})

// Apply to sensitive routes
app.use('/api/v1/auth/login', authLimiter)`,
      highlights: { 6: 'amber', 7: 'rose', 8: 'rose', 9: 'emerald' },
    },
    terms: ['rate-limiting', 'token-bucket', 'ddos', 'brute-force', '429', 'redis-limiter', 'sliding-window'],
    pitfalls: [
      'Using in-memory rate limiting across multi-instance clusters: requests hit different servers, multiplying allowed quota.',
      'Rate-limiting exclusively by IP address behind reverse proxies (Cloudflare, AWS ALB) without trust proxy enabled.',
      'Applying the same loose rate limits to login endpoints as general public read endpoints.',
    ],
    interview: [
      'How does the Token Bucket algorithm handle bursty traffic compared to a Fixed Window algorithm?',
      'Why is using an in-memory rate limiter problematic in a containerized, horizontally scaled production environment?',
    ],
    next: ['security-headers-injection', 'auth-middleware-rbac', 'http-caching-etag'],
  },

  // ─── 19. Security Headers & Injection ────────────────────────────────────────
  {
    id: 'security-headers-injection',
    level: 2,
    order: 19,
    title: 'Security Headers & Injection',
    oneLiner: 'Harden Express with Helmet and sanitize input to defeat NoSQL injection and clickjacking.',
    mentalModel:
      'Bulletproofing your building: Helmet installs steel shutters (HSTS, CSP, X-Frame-Options), while input sanitization is a metal detector at the lobby confiscating concealed operator weapons ($gt, $ne, scripts).',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Malicious payload submitted',
          caption: 'Attacker submits NoSQL injection payload: { "email": "admin@x.com", "password": { "$gt": "" } }.',
          highlights: ['stage-0'],
        },
        {
          label: 'Sanitization middleware checks',
          caption: 'express-mongo-sanitize strips keys beginning with "$" or containing "." characters.',
          highlights: ['stage-1'],
        },
        {
          label: 'Payload stripped & defanged',
          caption: 'Malformed injection operators stripped out. Query degenerates to safe harmless string.',
          highlights: ['stage-2'],
        },
        {
          label: 'Helmet injects HTTP headers',
          caption: 'Helmet sets Content-Security-Policy, HSTS, X-Content-Type-Options: nosniff, and removes X-Powered-By.',
          highlights: ['stage-3'],
        },
        {
          label: 'Secure response delivered',
          caption: 'Browser strictly enforces frame protections, SSL upgrades, and XSS restrictions.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'

const app = express()

// 1. Set security HTTP headers
app.use(helmet())

// 2. Data sanitization against NoSQL query injection
// strips '$' and '.' from req.body, req.query, req.params
app.use(mongoSanitize())

// 3. Prevent parameter pollution
app.use(hpp({ whitelist: ['price', 'category'] }))`,
      highlights: { 7: 'emerald', 11: 'rose', 14: 'amber' },
    },
    terms: ['helmet', 'nosql-injection', 'security-headers', 'csp', 'hsts', 'sanitization', 'parameter-pollution'],
    pitfalls: [
      'Leaving X-Powered-By: Express header exposed, advertising your backend framework version to automated scanners.',
      'Passing unsanitized req.body straight into User.findOne(req.body) — allows authentication bypass using { "$gt": "" }.',
      'Disabling Content Security Policy (CSP) entirely when encountering cross-origin image or font loading errors.',
    ],
    interview: [
      'How does NoSQL injection work in MongoDB when an attacker submits an object instead of a string in req.body?',
      'What essential security headers are configured when using helmet() in an Express app?',
    ],
    next: ['rate-limiting', 'input-validation-zod', 'auth-middleware-rbac'],
  },

  // ─── 20. File Uploads ────────────────────────────────────────────────────────
  {
    id: 'file-uploads',
    level: 2,
    order: 20,
    title: 'File Uploads',
    oneLiner: 'Parse multipart/form-data with Multer, validate MIME types, and stream to cloud storage.',
    mentalModel:
      'A mail sorting facility receiving parcel packages. Standard envelopes (JSON) go through the letter slot; large boxes (multipart media) are routed through the parcel dock, weighed (size limit), inspected (magic bytes), and placed in storage.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Multipart request received',
          caption: 'Client sends Content-Type: multipart/form-data with binary file chunks and text fields.',
          highlights: ['stage-0'],
        },
        {
          label: 'Multer streams binary chunks',
          caption: 'Multer parses the boundary-separated stream without reading the entire file into Node.js heap memory.',
          highlights: ['stage-1'],
        },
        {
          label: 'MIME type & size validation',
          caption: 'Rejects executable extensions (.exe, .sh) and checks file limits (e.g. max 5MB).',
          highlights: ['stage-2'],
        },
        {
          label: 'Upload to Object Storage (S3)',
          caption: 'File stream is piped to AWS S3 or Cloudinary. Local server disk remains stateless.',
          highlights: ['stage-3'],
        },
        {
          label: 'URL saved to MongoDB',
          caption: 'Only the returned secure public image URL is saved to the database document.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import multer from 'multer'

// Use memoryStorage or stream directly to S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new AppError('Only images allowed', 400))
    }
  }
})

app.post('/profile/avatar', upload.single('avatar'), async (req, res) => {
  // req.file contains buffer; stream to S3 / Cloudinary
  const url = await uploadToS3(req.file!.buffer, req.file!.originalname)
  res.json({ url })
})`,
      highlights: { 5: 'amber', 7: 'emerald', 10: 'rose', 15: 'emerald', 17: 'emerald' },
    },
    terms: ['file-uploads', 'multer', 'multipart-form-data', 'mime-type', 's3-upload', 'streaming'],
    pitfalls: [
      'Storing uploaded user files directly on the local server container disk: files disappear when server restarts or scales.',
      'Validating only the file extension (.jpg) instead of checking the true MIME type and magic number file signature.',
      'Allowing unrestricted file sizes, making your server vulnerable to simple Denial of Service disk exhaustion.',
    ],
    interview: [
      'Why is storing user file uploads on the local server disk an anti-pattern in modern cloud architectures?',
      'How does multipart/form-data encoding work compared to application/json?',
    ],
    next: ['logging-and-config', 'security-headers-injection', 'input-validation-zod'],
  },

  // ─── 21. Logging & Config ───────────────────────────────────────────────────
  {
    id: 'logging-and-config',
    level: 2,
    order: 21,
    title: 'Logging & Config',
    oneLiner: 'Use structured JSON logging with levels and centralized schema-validated configuration.',
    mentalModel:
      'The black box flight recorder of an aircraft. It doesn\'t print messy conversational notes (console.log); it records timestamped, structured machine-readable events with severity flags (info, warn, error) so automated analysis tools can search it instantly.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Event occurs in application',
          caption: 'A database query fails or a payment webhook is received.',
          highlights: ['stage-0'],
        },
        {
          label: 'Logger receives event & context',
          caption: 'Pino/Winston logger called with level, message, and metadata (userId, requestId).',
          highlights: ['stage-1'],
        },
        {
          label: 'Structured JSON emitted',
          caption: 'Formats into structured JSON: {"level":50,"time":1710000000,"reqId":"...","msg":"DB timeout"}.',
          highlights: ['stage-2'],
        },
        {
          label: 'Streamed to stdout',
          caption: 'Logs are output to standard out (stdout). Zero file I/O blocking inside the Node.js process.',
          highlights: ['stage-3'],
        },
        {
          label: 'Ingested by Log Aggregator',
          caption: 'Log shippers (Datadog, CloudWatch, Grafana Loki) collect stdout streams for querying and alerting.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import pino from 'pino'

// Structured JSON logger (fastest in Node.js ecosystem)
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label.toUpperCase() })
  },
  timestamp: pino.stdTimeFunctions.isoTime
})

// Usage: attach contextual objects
logger.info({ userId: '123', ip: req.ip }, 'User logged in successfully')
logger.error({ err, orderId: '999' }, 'Payment processing failed')`,
      highlights: { 5: 'emerald', 10: 'amber', 14: 'emerald', 15: 'rose' },
    },
    terms: ['logging', 'pino', 'structured-logging', 'log-levels', 'stdout', 'winston'],
    pitfalls: [
      'Using console.log() in high-throughput production: console.log is synchronous and blocks the Node event loop.',
      'Logging sensitive personal data (passwords, credit cards, JWT tokens) violating privacy regulations (GDPR/HIPAA).',
      'Writing logs directly to files on disk inside Docker containers instead of streaming to standard output (stdout).',
    ],
    interview: [
      'Why is structured JSON logging preferred over plain text console.log statements in production?',
      'Why should applications log exclusively to stdout rather than writing directly to log files on the filesystem?',
    ],
    next: ['testing-unit-vs-integration', 'centralized-error-handling', 'operational-vs-programmer-errors'],
  },

  // ─── 22. HTTP Caching & ETag ─────────────────────────────────────────────────
  {
    id: 'http-caching-etag',
    level: 2,
    order: 22,
    title: 'HTTP Caching & ETag',
    oneLiner: 'Use Cache-Control headers and ETag hash tokens to eliminate unnecessary server payload transfers.',
    mentalModel:
      'ETag is a fingerprint of a document. You ask the librarian: "Has the book with fingerprint a1b2 changed?" The librarian checks the fingerprint and replies: "Nope, 304 Not Modified — keep reading your copy." No heavy book needs to be shipped.',
    viz: {
      component: 'CacheFlow',
      steps: [
        {
          label: 'Client makes initial GET request',
          caption: 'Client fetches /api/products without cached copy. Server computes hash of JSON body (ETag).',
          highlights: [cf({ stage: 'check', keyName: 'ETag calculation' })],
        },
        {
          label: 'Server responds with ETag & Cache-Control',
          caption: 'Returns 200 OK with ETag: "w/12345" and Cache-Control: no-cache (must revalidate before reuse).',
          highlights: [cf({ stage: 'fetch_db', cacheStatus: 'MISS', dbValue: 'Full payload (200 OK)' })],
        },
        {
          label: 'Subsequent request with If-None-Match',
          caption: 'Browser includes header If-None-Match: "w/12345" asking if document changed.',
          highlights: [cf({ stage: 'check', cacheStatus: 'HIT' })],
        },
        {
          label: 'ETag matches: 304 Not Modified',
          caption: 'Data unchanged! Server responds with empty body and status 304 Not Modified. Zero payload transferred.',
          highlights: [cf({ stage: 'hit', cacheStatus: 'HIT', cachedValue: '304 Not Modified (0 bytes)' })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `app.get('/api/articles/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)

  // Cache-Control headers
  res.set({
    'Cache-Control': 'public, max-age=300, must-revalidate',
    'ETag': \`"\${article.versionHash}"\`
  })

  // Conditional request check:
  if (req.fresh) {
    return res.status(304).end() // Not Modified — save bandwidth!
  }

  res.json({ article })
})`,
      highlights: { 5: 'emerald', 6: 'amber', 10: 'rose', 11: 'emerald' },
    },
    terms: ['http-caching', 'etag', 'cache-control', '304-not-modified', 'if-none-match', 'freshness'],
    pitfalls: [
      'Confusing no-cache (must revalidate with server before using) with no-store (never cache anywhere).',
      'Caching authenticated personalized user data with public header, allowing shared proxy caches to leak user data.',
      'Not providing proper cache invalidation headers on frequently updated API endpoints.',
    ],
    interview: [
      'What is the difference between Cache-Control: no-cache and Cache-Control: no-store?',
      'How does the ETag and If-None-Match validation handshake save network bandwidth?',
    ],
    next: ['cache-aside-pattern', 'rate-limiting', 'rest-principles'],
  },

  // ─── 23. Testing (Unit vs Integration) ───────────────────────────────────────
  {
    id: 'testing-unit-vs-integration',
    level: 2,
    order: 23,
    title: 'Testing (Unit vs Integration)',
    oneLiner: 'Unit tests verify isolated functions with mocks; integration tests verify real routes and databases.',
    mentalModel:
      'Unit testing is testing a lightbulb and switch independently on a workbench. Integration testing is screwing the bulb into the socket, flipping the wall switch, and verifying the entire room lights up.',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'Unit vs Integration focus',
          caption: 'Unit tests run fast in memory with mocked dependencies. Integration tests use Supertest and real in-memory MongoDB.',
          highlights: [tpc({
            left: {
              title: 'Unit Tests (Fast & Isolated)',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Scope', value: 'Single function, service method, or utility' },
                { label: 'Dependencies', value: 'Database & network calls are completely mocked' },
                { label: 'Execution', value: 'Milliseconds — thousands run in seconds' },
                { label: 'Tooling', value: 'Vitest, Jest, ts-jest, sinon' },
              ],
            },
            right: {
              title: 'Integration Tests (Realistic)',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Scope', value: 'Full HTTP route -> middleware -> DB query -> response' },
                { label: 'Dependencies', value: 'Real in-memory MongoDB (mongodb-memory-server)' },
                { label: 'Execution', value: 'Slower — tests real network sockets and indexes' },
                { label: 'Tooling', value: 'Supertest + Vitest / Jest' },
              ],
            },
            badge: { side: 'left', text: 'Fast Feedback Loop', color: 'emerald' },
          })],
        },
        {
          label: 'The Test Pyramid balance',
          caption: 'Maintain many unit tests at the base, a solid layer of API integration tests in the middle, and few high-level E2E tests at top.',
          highlights: [tpc({
            left: {
              title: 'When to write Unit',
              color: 'emerald',
              activeRow: 1,
              rows: [
                { label: 'Logic', value: 'Complex calculation algorithms & business rules' },
                { label: 'Validation', value: 'Zod schemas and edge-case regex matching' },
                { label: 'Error branches', value: 'Testing difficult-to-reproduce failure branches' },
              ],
            },
            right: {
              title: 'When to write Integration',
              color: 'amber',
              activeRow: 1,
              rows: [
                { label: 'API Routes', value: 'Testing status codes and JSON response bodies' },
                { label: 'Auth Middleware', value: 'Verifying protected routes block unauthenticated calls' },
                { label: 'DB Queries', value: 'Verifying complex MongoDB aggregations and indexes' },
              ],
            },
            badge: { side: 'right', text: 'High Confidence', color: 'amber' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Integration test with Supertest + in-memory DB
import request from 'supertest'
import { app } from '../app'

describe('POST /api/users', () => {
  it('creates user and returns 201 with sanitized data', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', password: 'Password123!' })

    expect(res.status).toBe(201)
    expect(res.body.user).toHaveProperty('id')
    expect(res.body.user).not.toHaveProperty('password') // no leak!
  })
})`,
      highlights: { 7: 'emerald', 10: 'emerald', 11: 'amber', 12: 'rose' },
    },
    terms: ['unit-testing', 'integration-testing', 'supertest', 'mocking', 'test-pyramid', 'vitest'],
    pitfalls: [
      'Running integration tests against a shared production or staging database instead of an isolated ephemeral database.',
      'Mocking so many internal implementation details in unit tests that the test passes even when the feature is broken.',
      'Not cleaning up database collections in beforeEach/afterEach hooks, causing test order dependencies.',
    ],
    interview: [
      'What is the difference between a unit test and an integration test in a MERN backend?',
      'Why is Supertest commonly used for testing Express REST APIs?',
    ],
    next: ['transactions-and-sessions', 'layered-architecture', 'logging-and-config'],
  },

  // ─── 24. Transactions & Sessions ─────────────────────────────────────────────
  {
    id: 'transactions-and-sessions',
    level: 2,
    order: 24,
    title: 'Transactions & Sessions',
    oneLiner: 'Execute multiple database writes as an atomic all-or-nothing unit using ACID sessions.',
    mentalModel:
      'Bank transfer: transferring \$100 from Alice to Bob. Step 1 subtracts \$100 from Alice; Step 2 adds \$100 to Bob. If the server crashes after Step 1, the transaction rolls back so Alice doesn\'t lose her money.',
    viz: {
      component: 'StateMachine',
      steps: [
        {
          label: '1. Start Transaction Session',
          caption: 'Client initiates a MongoDB client session: const session = await mongoose.startSession(); session.startTransaction().',
          highlights: [sm({
            states: [
              { id: 'start', label: 'Start Session', desc: 'Acquire lock' },
              { id: 'write1', label: 'Debit Account A', desc: '-$100 balance' },
              { id: 'write2', label: 'Credit Account B', desc: '+$100 balance' },
              { id: 'commit', label: 'Commit / Abort', desc: 'ACID finalized' },
            ],
            activeState: 'start',
            transitionLabel: 'Session opened',
            status: 'success'
          })],
        },
        {
          label: '2. Perform Write 1 (Debit)',
          caption: 'Deducts \$100 from Alice. Changes are staged in the transaction session and not visible to other queries yet.',
          highlights: [sm({
            activeState: 'write1',
            transitionLabel: 'Deduct Alice',
            status: 'success'
          })],
        },
        {
          label: '3. Perform Write 2 (Credit)',
          caption: 'Credits \$100 to Bob passing { session } option. Both operations are linked under the same session ID.',
          highlights: [sm({
            activeState: 'write2',
            transitionLabel: 'Credit Bob',
            status: 'success'
          })],
        },
        {
          label: '4. Commit Transaction (All-or-Nothing)',
          caption: 'session.commitTransaction() atomically writes all changes to the replica set oplog. Both updates become permanently visible.',
          highlights: [sm({
            activeState: 'commit',
            transitionLabel: 'commitTransaction()',
            status: 'success'
          })],
        },
        {
          label: '5. Rollback on Failure',
          caption: 'If any error occurs during write operations, session.abortTransaction() rolls back all staged changes cleanly.',
          highlights: [sm({
            activeState: 'commit',
            transitionLabel: 'abortTransaction()',
            status: 'error'
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `export async function transferMoney(fromId: string, toId: string, amount: number) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    await Account.findByIdAndUpdate(fromId, { $inc: { balance: -amount } }, { session })
    await Account.findByIdAndUpdate(toId, { $inc: { balance: amount } }, { session })

    await session.commitTransaction() // atomically commits both
  } catch (err) {
    await session.abortTransaction()   // rolls back both changes!
    throw err
  } finally {
    session.endSession()
  }
}`,
      highlights: { 2: 'emerald', 3: 'emerald', 6: 'amber', 7: 'amber', 9: 'emerald', 11: 'rose' },
    },
    terms: ['transactions', 'acid', 'sessions', 'rollback', 'commit', 'atomicity', 'replica-set'],
    pitfalls: [
      'MongoDB transactions require a Replica Set — attempting to run transactions on a standalone local MongoDB instance throws an error.',
      'Forgetting to pass { session } into Mongoose operations: any query called without { session } runs outside the transaction.',
      'Long-running transactions hold collection locks and can trigger write conflicts; keep transactions under a few seconds.',
    ],
    interview: [
      'What are the ACID guarantees provided by MongoDB multi-document transactions?',
      'Why is it essential to pass the { session } option to every Mongoose operation inside a transaction?',
    ],
    next: ['embedding-vs-referencing', 'centralized-error-handling', 'testing-unit-vs-integration'],
  },

  // ─── 25. JWT Anatomy (existing Level 2 concept) ─────────────────────────────
  {
    id: 'jwt-anatomy',
    level: 2,
    order: 25,
    title: 'JWT Anatomy',
    oneLiner: 'A JWT is a tamper-proof, self-contained ID card split into three Base64 parts.',
    mentalModel:
      'A JWT is like a wristband at a concert — it has your name (payload), was stamped by the venue (signature), and anyone with the right light can verify it\'s real without calling the box office. The server never needs to store it.',
    viz: {
      component: 'SequenceSwimlane',
      steps: [
        {
          label: 'User logs in',
          caption: 'Client sends credentials (email + password) to POST /auth/login.',
          highlights: ['client-to-server'],
        },
        {
          label: 'Server verifies credentials',
          caption: 'Server hashes the password and compares with DB. If valid, proceeds to sign a token.',
          highlights: ['server-to-db'],
        },
        {
          label: 'Server signs JWT',
          caption: 'jwt.sign({ sub: userId, role }, SECRET) creates header.payload.signature. Token is returned to client.',
          highlights: ['server'],
        },
        {
          label: 'Client sends token on next request',
          caption: 'Client stores JWT in memory (or httpOnly cookie) and sends Authorization: Bearer <token> on protected routes.',
          highlights: ['client-to-server'],
        },
        {
          label: 'Server verifies & trusts',
          caption: 'jwt.verify() checks the signature with SECRET. If valid, req.user is populated from payload — no DB lookup needed.',
          highlights: ['server'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET!

// SIGN — create token on login
export function signToken(userId: string, role: string) {
  return jwt.sign(
    { sub: userId, role },       // payload (claims)
    SECRET,
    { expiresIn: '7d' }          // exp claim
  )
}

// VERIFY — protect a route
export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) // throws if invalid/expired
}`,
      highlights: {
        7: 'emerald',
        9: 'amber',
        15: 'rose',
      },
    },
    terms: ['jwt', 'jwt-header', 'jwt-payload', 'jwt-signature', 'claim', 'bearer-token', 'secret-key'],
    pitfalls: [
      'JWTs are encoded (Base64), NOT encrypted — anyone can decode the payload. Never put passwords or sensitive data in it.',
      'You cannot invalidate a JWT before it expires without a server-side blocklist — keep expiry short (15m–7d) and use refresh tokens.',
      'Storing JWTs in localStorage exposes them to XSS. Prefer httpOnly cookies for sensitive apps.',
    ],
    interview: [
      'Why doesn\'t the server need to query the database on every authenticated request when using JWTs?',
      'What is the difference between a JWT being "invalid" versus "expired"?',
    ],
    next: ['middleware-pipeline', 'indexing-collscan-ixscan', 'cache-aside-pattern'],
  },

  // ─── 26. Indexing: COLLSCAN vs IXSCAN (existing Level 2 concept) ────────────
  {
    id: 'indexing-collscan-ixscan',
    level: 2,
    order: 26,
    title: 'Indexing: COLLSCAN vs IXSCAN',
    oneLiner: 'An index is a sorted shortcut that lets MongoDB skip reading millions of documents.',
    mentalModel:
      'A database without an index is like a physical library with no catalogue — you check every shelf (COLLSCAN). An index is the catalogue: look up "MongoDB" and the catalogue tells you exactly which shelf and row (IXSCAN). Same books, thousand times faster.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Query arrives',
          caption: 'db.users.find({ email: "alice@example.com" }) — MongoDB needs to find one document in a collection of 1 million.',
          highlights: ['stage-0'],
        },
        {
          label: 'COLLSCAN path (no index)',
          caption: 'Without an index, MongoDB reads every document one by one. On 1M docs, this is painfully slow — O(n).',
          highlights: ['stage-1'],
        },
        {
          label: 'Index lookup (IXSCAN)',
          caption: 'With an index on { email: 1 }, MongoDB walks the B-Tree in O(log n) steps to find the matching pointer.',
          highlights: ['stage-2'],
        },
        {
          label: 'Document fetch',
          caption: 'IXSCAN returns the document _id pointer. MongoDB fetches just that one document from disk.',
          highlights: ['stage-3'],
        },
        {
          label: 'Result returned',
          caption: 'Total reads: 1 document vs 1,000,000. Use .explain("executionStats") to confirm IXSCAN is used.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'js',
      code: `// Create an index on the email field
await db.collection('users').createIndex({ email: 1 })

// Compound index for multi-field queries
await db.collection('orders').createIndex(
  { userId: 1, createdAt: -1 }   // ascending + descending
)

// Check execution plan — look for IXSCAN vs COLLSCAN
const plan = await db.collection('users')
  .find({ email: 'alice@example.com' })
  .explain('executionStats')

console.log(plan.queryPlanner.winningPlan.stage)
// "IXSCAN" ✓  or  "COLLSCAN" ✗`,
      highlights: {
        2: 'emerald',
        6: 'amber',
        10: 'rose',
        14: 'emerald',
      },
    },
    terms: ['index', 'collscan', 'ixscan', 'b-tree', 'compound-index', 'explain'],
    pitfalls: [
      'Over-indexing hurts write performance — every insert/update must also update all indexes. Index only fields you actually query on.',
      'Index order matters in compound indexes: `{ userId: 1, date: -1 }` helps `find({userId}).sort({date:-1})` but not `find({date})` alone.',
      'Using `.explain()` only in dev — forgetting to check it means you discover COLLSCAN issues in production under load.',
    ],
    interview: [
      'What is a COLLSCAN and when does MongoDB fall back to it even when an index exists?',
      'Explain the concept of index selectivity and why it matters for query performance.',
    ],
    next: ['jwt-anatomy', 'cache-aside-pattern', 'event-loop-deep-dive'],
  },
]
