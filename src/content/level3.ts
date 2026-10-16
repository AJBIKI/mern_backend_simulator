import type { Concept } from './types'

export const level3Concepts: Concept[] = [
  {
    id: 'event-loop-deep-dive',
    level: 3,
    order: 1,
    title: 'Event Loop Deep Dive',
    oneLiner: 'Node.js is single-threaded but handles thousands of requests via a phase-by-phase event loop.',
    mentalModel:
      'The event loop is like a chef with one pair of hands who manages multiple ovens. Instead of waiting in front of each oven, the chef sets timers, checks what\'s ready each round, and handles each dish in priority order — microtasks (urgent) before macrotasks (scheduled).',
    viz: {
      component: 'EventLoopClock',
      steps: [
        {
          label: 'Synchronous code runs',
          caption: 'All top-level synchronous code executes first, filling the call stack. The event loop hasn\'t started its cycle yet.',
          highlights: ['call-stack'],
        },
        {
          label: 'Microtask queue drains',
          caption: 'After each task, ALL microtasks (Promise.then, queueMicrotask) run to completion before moving on.',
          highlights: ['microtask-queue'],
        },
        {
          label: 'Timers phase',
          caption: 'setTimeout / setInterval callbacks whose delay has elapsed execute here. Delayed by at least 1ms minimum.',
          highlights: ['timers'],
        },
        {
          label: 'Poll phase',
          caption: 'The loop waits for I/O events (file reads, network) here. This is where most time is spent waiting.',
          highlights: ['poll'],
        },
        {
          label: 'Check phase (setImmediate)',
          caption: 'setImmediate() callbacks run after poll phase — always before the next timer tick.',
          highlights: ['check'],
        },
        {
          label: 'Microtasks again',
          caption: 'After EVERY phase transition, the microtask queue is fully drained. This is why Promises resolve before setTimeout.',
          highlights: ['microtask-queue'],
        },
      ],
    },
    snippet: {
      lang: 'js',
      code: `console.log('1 — sync')

setTimeout(() => console.log('4 — macrotask'), 0)

Promise.resolve()
  .then(() => console.log('2 — microtask'))
  .then(() => console.log('3 — microtask'))

setImmediate(() => console.log('5 — check phase'))

// Output order:
// 1 — sync
// 2 — microtask
// 3 — microtask
// 4 — macrotask
// 5 — check phase`,
      highlights: {
        3: 'amber',
        5: 'emerald',
        6: 'emerald',
        8: 'rose',
        12: 'rose',
        13: 'emerald',
        14: 'emerald',
        15: 'amber',
        16: 'rose',
      },
    },
    terms: ['event-loop', 'call-stack', 'microtask-queue', 'macrotask-queue', 'libuv', 'timers-phase', 'poll-phase'],
    pitfalls: [
      'CPU-heavy synchronous code blocks the event loop entirely — all incoming requests queue up until it finishes. Use worker threads for heavy compute.',
      'Assuming setTimeout(fn, 0) runs immediately — it always waits at least 1ms and executes after ALL microtasks.',
      'Chaining infinite .then() callbacks or creating Promise storms starves the macrotask queue, delaying I/O callbacks.',
    ],
    interview: [
      'Why does a Promise.then() callback always execute before a setTimeout(fn, 0) callback, even if the Promise resolves instantly?',
      'What is the difference between setImmediate() and setTimeout(fn, 0)?',
    ],
    next: ['middleware-pipeline', 'cache-aside-pattern'],
  },

  {
    id: 'cache-aside-pattern',
    level: 3,
    order: 2,
    title: 'Cache-Aside Pattern',
    oneLiner: 'Check the cache first; on miss, fetch from DB and fill the cache for next time.',
    mentalModel:
      'Cache-aside is like a personal assistant who remembers your coffee order. First visit, they ask the barista (DB). Every visit after, they just hand you your drink from their notes (cache). If the coffee shop changes the recipe (data update), you tell your assistant to forget the old note (invalidate).',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Request arrives',
          caption: 'Client requests GET /products/42. The application checks Redis before touching MongoDB.',
          highlights: ['stage-0'],
        },
        {
          label: 'Cache check (Redis GET)',
          caption: 'App calls redis.get("product:42"). If data exists → Cache Hit. Return immediately, skip DB entirely.',
          highlights: ['stage-1'],
        },
        {
          label: 'Cache miss → DB query',
          caption: 'Key not found in Redis. App falls back to MongoDB: Product.findById(42). This is the slow path.',
          highlights: ['stage-2'],
        },
        {
          label: 'Populate cache',
          caption: 'After DB returns data, app calls redis.set("product:42", data, { EX: 3600 }). TTL = 1 hour.',
          highlights: ['stage-3'],
        },
        {
          label: 'Return response',
          caption: 'Data is returned to client. Next request for the same product hits the cache (sub-millisecond).',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `async function getProduct(id: string) {
  const cacheKey = \`product:\${id}\`

  // 1. Check cache first
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)   // cache hit ✓

  // 2. Cache miss — go to DB
  const product = await Product.findById(id)
  if (!product) throw new Error('Not found')

  // 3. Populate cache with TTL
  await redis.set(cacheKey, JSON.stringify(product), {
    EX: 3600,   // expires in 1 hour
  })

  return product
}`,
      highlights: {
        5: 'emerald',
        6: 'emerald',
        9: 'amber',
        13: 'rose',
        14: 'rose',
      },
    },
    terms: ['cache', 'cache-aside', 'cache-hit', 'cache-miss', 'ttl', 'redis', 'stale-data'],
    pitfalls: [
      'Cache invalidation is the hard part — when you update a product, you must also delete the cached key (redis.del("product:42")).',
      'Setting TTL too long risks serving stale data; too short defeats the purpose. Tune based on how often data actually changes.',
      'Don\'t cache user-specific data under a shared key — mixing user A\'s response with user B\'s request is a security bug.',
    ],
    interview: [
      'What is the difference between Cache-Aside and Read-Through caching patterns?',
      'Describe a scenario where Cache-Aside could serve stale data, and how you would mitigate it.',
    ],
    next: ['jwt-anatomy', 'indexing-collscan-ixscan', 'event-loop-deep-dive'],
  },
]
