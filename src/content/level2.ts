import type { Concept } from './types'

export const level2Concepts: Concept[] = [
  {
    id: 'jwt-anatomy',
    level: 2,
    order: 1,
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

  {
    id: 'indexing-collscan-ixscan',
    level: 2,
    order: 2,
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
