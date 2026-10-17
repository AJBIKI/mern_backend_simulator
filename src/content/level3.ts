import type { Concept } from './types'

// Helper for TwoPanelCompare step data
function tpc(data: object): string {
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

// Helper for ProducerQueue step data
function pq(data: object): string {
  return JSON.stringify(data)
}

// Helper for ReplicaSwimlane step data
function rs(data: object): string {
  return JSON.stringify(data)
}

// Helper for ConnectionPool step data
function cp(data: object): string {
  return JSON.stringify(data)
}

// Helper for ProcessTree step data
function pt(data: object): string {
  return JSON.stringify(data)
}

export const level3Concepts: Concept[] = [
  // ─── 1. Event Loop Phases Deep Dive ─────────────────────────────────────────
  {
    id: 'event-loop-phases-deep-dive',
    level: 3,
    order: 1,
    title: 'Event Loop Phases Deep Dive',
    oneLiner: 'libuv cycles through 6 distinct phases, draining microtasks between every single step.',
    mentalModel:
      'A city transit train moving sequentially through 6 numbered stations. At every single stop, an emergency evacuation team (microtasks) clears out any waiting passengers before the train is allowed to move forward.',
    viz: {
      component: 'EventLoopClock',
      steps: [
        {
          label: 'Timers Phase',
          caption: 'Executes callbacks scheduled by elapsed setTimeout() and setInterval(). Thresholds are minimum guarantees, not exact times.',
          highlights: ['timers'],
        },
        {
          label: 'Pending Callbacks Phase',
          caption: 'Executes deferred I/O callbacks from previous loop iterations (e.g. TCP system errors like ECONNREFUSED).',
          highlights: ['pending'],
        },
        {
          label: 'Poll Phase (The Engine)',
          caption: 'Retrieves new I/O events from the OS kernel (epoll/kqueue). If queues are empty, the loop blocks here waiting for network activity.',
          highlights: ['poll'],
        },
        {
          label: 'Check Phase',
          caption: 'setImmediate() callbacks run here exclusively. Always executes right after the poll phase completes its I/O round.',
          highlights: ['check'],
        },
        {
          label: 'Close Callbacks Phase',
          caption: 'Executes cleanup handlers when sockets or handles abruptly emit "close" (e.g. socket.on("close", cb)).',
          highlights: ['close'],
        },
        {
          label: 'Microtask Starvation Warning',
          caption: 'process.nextTick() and Promise microtasks drain after every phase transition. Chaining nextTicks starves the entire event loop.',
          highlights: ['microtask-queue'],
        },
      ],
    },
    snippet: {
      lang: 'js',
      code: `const fs = require('fs')

// Inside an I/O callback, setImmediate ALWAYS beats setTimeout(0)
fs.readFile(__filename, () => {
  setTimeout(() => console.log('3: Timers Phase'), 0)
  setImmediate(() => console.log('1: Check Phase (Wins!)'))
  process.nextTick(() => console.log('0: Microtask (Instant)'))
})

// Starvation trap:
function starve() {
  process.nextTick(starve) // Event loop never reaches Poll phase!
}`,
      highlights: { 5: 'amber', 6: 'emerald', 7: 'rose', 12: 'rose' },
    },
    terms: ['event-loop', 'timers-phase', 'poll-phase', 'check-phase', 'pending-phase', 'close-phase', 'microtask-queue', 'process-nexttick', 'starvation'],
    pitfalls: [
      'Using process.nextTick() recursively: it runs before the event loop continues, starving all I/O and timers.',
      'Assuming setTimeout(fn, 0) executes immediately in 0ms: OS timer granularity imposes a minimum 1ms–4ms delay.',
      'Expecting setImmediate and setTimeout order to be deterministic at the top level outside an I/O callback.',
    ],
    interview: [
      'Why does setImmediate always execute before setTimeout(fn, 0) when called inside an I/O callback?',
      'What happens under the hood when process.nextTick is invoked compared to Promise.resolve().then()?',
    ],
    next: ['blocking-the-loop', 'event-loop-deep-dive', 'worker-threads-child-process'],
  },

  // ─── 2. Blocking the Loop ───────────────────────────────────────────────────
  {
    id: 'blocking-the-loop',
    level: 3,
    order: 2,
    title: 'Blocking the Loop',
    oneLiner: 'Synchronous CPU operations starve the single thread, freezing all concurrent requests.',
    mentalModel:
      'A single grocery cashier: if a customer with 10,000 items insists on scanning them one by one without stepping aside, every other customer in the store must wait in agony.',
    viz: {
      component: 'QueueLanes',
      steps: [
        {
          label: 'Normal non-blocking traffic',
          caption: 'Multiple HTTP requests arrive. Async I/O tasks delegate to the kernel, and the call stack remains clear.',
          highlights: ['call-stack'],
        },
        {
          label: 'Heavy synchronous task begins',
          caption: 'A route executes JSON.parse(hugeString) or runs an unoptimized regex over large text. The stack is locked.',
          highlights: ['call-stack'],
        },
        {
          label: 'Incoming requests queue up',
          caption: 'New requests pile up in the OS TCP socket backlog. No new connections can be accepted.',
          highlights: ['macrotask-queue'],
        },
        {
          label: 'Loop stalled & latency explodes',
          caption: 'Timers drift and health check pings fail. Monitoring alerts fire for high request latency.',
          highlights: ['call-stack'],
        },
        {
          label: 'Remedy: Offload to worker threads',
          caption: 'Moving CPU-bound cryptography or image compression to worker_threads leaves the main event loop responsive.',
          highlights: ['microtask-queue'],
        },
      ],
    },
    snippet: {
      lang: 'js',
      code: `// BAD: Blocks entire server for 2 seconds!
app.get('/hash', (req, res) => {
  const hash = crypto.pbkdf2Sync('password', 'salt', 500000, 64, 'sha512')
  res.json({ hash: hash.toString('hex') }) // all other users wait!
})

// GOOD: Async version uses libuv thread pool
app.get('/hash-safe', (req, res) => {
  crypto.pbkdf2('password', 'salt', 500000, 64, 'sha512', (err, hash) => {
    res.json({ hash: hash.toString('hex') }) // non-blocking!
  })
})`,
      highlights: { 3: 'rose', 4: 'rose', 9: 'emerald', 10: 'emerald' },
    },
    terms: ['blocking-loop', 'call-stack', 'event-loop', 'cpu-bound', 'redos', 'libuv-threadpool'],
    pitfalls: [
      'Running catastrophic backtracking regular expressions (ReDoS) on user input, freezing Node processes at 100% CPU.',
      'Parsing multi-megabyte JSON payloads with synchronous JSON.parse() on the main thread.',
      'Using synchronous file system methods (fs.readFileSync) in request handlers instead of stream or promise equivalents.',
    ],
    interview: [
      'What are the primary causes of event loop blocking in high-traffic Node.js backends?',
      'How does Regular Expression Denial of Service (ReDoS) freeze a Node.js process?',
    ],
    next: ['event-loop-phases-deep-dive', 'worker-threads-child-process', 'clustering-and-pm2'],
  },

  // ─── 3. worker_threads & child_process ───────────────────────────────────────
  {
    id: 'worker-threads-child-process',
    level: 3,
    order: 3,
    title: 'worker_threads & child_process',
    oneLiner: 'Use worker_threads to share memory for CPU tasks; use child_process for isolated OS binaries.',
    mentalModel:
      'child_process is launching a separate contractor with their own office (separate memory space and V8 engine). worker_threads is hiring another assistant at your desk who can share your whiteboard (SharedArrayBuffer).',
    viz: {
      component: 'ProcessTree',
      steps: [
        {
          label: 'Main JS Thread running',
          caption: 'Main thread handles HTTP connections and API routing via the standard non-blocking event loop.',
          highlights: [pt({ mode: 'worker_threads', masterStatus: 'healthy', workers: [
            { id: 't1', pid: 101, cpuUsage: 12, status: 'online', activeTask: 'Express Router' },
          ] })],
        },
        {
          label: 'Spawning Worker Thread',
          caption: 'CPU-intensive work (image resizing, ML inference) dispatches to new Worker("./heavy.js").',
          highlights: [pt({ mode: 'worker_threads', masterStatus: 'healthy', workers: [
            { id: 't1', pid: 101, cpuUsage: 15, status: 'online', activeTask: 'Express Router' },
            { id: 't2', pid: 102, cpuUsage: 95, status: 'busy', activeTask: 'Worker: Image Resizing' },
          ] })],
        },
        {
          label: 'Memory Sharing via SharedArrayBuffer',
          caption: 'Worker threads share memory directly without serialization overhead, communicating via MessageChannel.',
          highlights: [pt({ mode: 'worker_threads', masterStatus: 'healthy', workers: [
            { id: 't1', pid: 101, cpuUsage: 10, status: 'online', activeTask: 'Handling HTTP' },
            { id: 't2', pid: 102, cpuUsage: 99, status: 'busy', activeTask: 'SharedArrayBuffer lock' },
          ] })],
        },
        {
          label: 'Task Complete & Thread Reused',
          caption: 'Worker posts result back to parent thread via parentPort.postMessage(result) and returns to thread pool.',
          highlights: [pt({ mode: 'worker_threads', masterStatus: 'healthy', workers: [
            { id: 't1', pid: 101, cpuUsage: 8, status: 'online', activeTask: 'Response sent' },
            { id: 't2', pid: 102, cpuUsage: 2, status: 'online', activeTask: 'Idle in pool' },
          ] })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads'

if (isMainThread) {
  // Main thread: spawn worker and await result
  export function runHeavyTask(data: number[]) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: data })
      worker.on('message', resolve)
      worker.on('error', reject)
    })
  }
} else {
  // Worker thread: perform intensive computation
  const result = workerData.reduce((acc: number, n: number) => acc + Math.sqrt(n), 0)
  parentPort?.postMessage(result)
}`,
      highlights: { 3: 'emerald', 7: 'emerald', 8: 'amber', 14: 'rose', 15: 'emerald' },
    },
    terms: ['worker-threads', 'child-process', 'shared-array-buffer', 'message-channel', 'ipc', 'thread-pool'],
    pitfalls: [
      'Creating a new Worker thread on every incoming HTTP request: thread creation overhead is expensive; use a thread pool (Piscina).',
      'Using worker_threads for I/O operations (like database queries) where native Node async primitives are already superior.',
      'Assuming worker threads bypass Node\'s memory caps: each worker has its own heap limit unless configured.',
    ],
    interview: [
      'When should you choose worker_threads over the cluster module or child_process in Node.js?',
      'How does communication and memory sharing differ between child processes and worker threads?',
    ],
    next: ['clustering-and-pm2', 'blocking-the-loop', 'streams-and-buffers'],
  },

  // ─── 4. Clustering & PM2 ─────────────────────────────────────────────────────
  {
    id: 'clustering-and-pm2',
    level: 3,
    order: 4,
    title: 'Clustering & PM2',
    oneLiner: 'Scale Node across all CPU cores by running multiple worker processes on a shared port.',
    mentalModel:
      'A multi-lane highway tollbooth: one manager distributes approaching cars across 8 open booths (one worker process per CPU core), all listening on the same entrance road (port 3000).',
    viz: {
      component: 'ProcessTree',
      steps: [
        {
          label: 'Master process binds port 3000',
          caption: 'Primary process forks N worker processes matching available CPU cores via node:cluster or PM2 runtime.',
          highlights: [pt({ mode: 'cluster', masterStatus: 'spawning', portShared: 3000, workers: [
            { id: 'w1', pid: 2001, cpuUsage: 10, status: 'online', activeTask: 'Port 3000 listener' },
            { id: 'w2', pid: 2002, cpuUsage: 10, status: 'online', activeTask: 'Port 3000 listener' },
          ] })],
        },
        {
          label: 'Round-robin connection load balancing',
          caption: 'Master process accepts incoming TCP sockets and distributes connections round-robin across worker processes.',
          highlights: [pt({ mode: 'cluster', masterStatus: 'healthy', portShared: 3000, workers: [
            { id: 'w1', pid: 2001, cpuUsage: 45, status: 'busy', activeTask: 'Req #101' },
            { id: 'w2', pid: 2002, cpuUsage: 48, status: 'busy', activeTask: 'Req #102' },
          ] })],
        },
        {
          label: 'Worker process crashes',
          caption: 'Worker 1 encounters an unhandled fatal error and exits. Zero downtime occurs because other workers continue serving traffic.',
          highlights: [pt({ mode: 'cluster', masterStatus: 'healthy', portShared: 3000, workers: [
            { id: 'w1', pid: 2001, cpuUsage: 0, status: 'crashed', activeTask: 'SIGSEGV exit' },
            { id: 'w2', pid: 2002, cpuUsage: 65, status: 'busy', activeTask: 'Handling overflow' },
          ] })],
        },
        {
          label: 'Instant automatic respawn',
          caption: 'Master detects worker death (cluster.on("exit")) and immediately spawns a replacement worker process.',
          highlights: [pt({ mode: 'cluster', masterStatus: 'healthy', portShared: 3000, workers: [
            { id: 'w1-new', pid: 2009, cpuUsage: 5, status: 'respawning', activeTask: 'Cluster auto-healed' },
            { id: 'w2', pid: 2002, cpuUsage: 35, status: 'online', activeTask: 'Serving traffic' },
          ] })],
        },
      ],
    },
    snippet: {
      lang: 'json',
      code: `// ecosystem.config.cjs for PM2 clustering
module.exports = {
  apps: [{
    name: 'api-server',
    script: './dist/server.js',
    instances: 'max',       // spawn 1 worker per CPU core
    exec_mode: 'cluster',   // enable cluster mode
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}`,
      highlights: { 6: 'emerald', 7: 'emerald', 8: 'amber', 10: 'rose' },
    },
    terms: ['clustering', 'pm2', 'round-robin', 'zero-downtime', 'process-manager', 'so-reuseport'],
    pitfalls: [
      'Storing session state or user tokens in in-memory variables: successive requests hit different cluster workers and lose state.',
      'Over-provisioning worker instances (e.g. 16 workers on a 2-core machine), causing massive CPU context-switching overhead.',
      'Forgetting that cluster workers do not share memory: WebSockets require a Redis Pub/Sub adapter to sync across workers.',
    ],
    interview: [
      'How does the Node.js cluster module share a single HTTP port across multiple operating system processes?',
      'Why must an application be strictly stateless when deployed using PM2 cluster mode?',
    ],
    next: ['worker-threads-child-process', 'zero-downtime-deploy-migrations', 'horizontal-scaling-load-balancing'],
  },

  // ─── 5. Streams & Buffers ───────────────────────────────────────────────────
  {
    id: 'streams-and-buffers',
    level: 3,
    order: 5,
    title: 'Streams & Buffers',
    oneLiner: 'Process data in small continuous chunks to achieve constant memory usage on gigabyte files.',
    mentalModel:
      'A movie streaming service: instead of forcing you to wait 2 hours to download a 20GB video file into memory before playing, it downloads 5MB chunks continuously as you watch.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Readable Stream opened',
          caption: 'fs.createReadStream() opens file descriptor. Data is pulled from disk in discrete 64KB chunks.',
          highlights: ['stage-0'],
        },
        {
          label: 'Buffer memory allocated',
          caption: 'Raw binary octets stored temporarily in Node.js Buffer instances allocated outside V8 heap memory.',
          highlights: ['stage-1'],
        },
        {
          label: 'Transform Stream processing',
          caption: 'zlib.createGzip() compresses chunks on-the-fly as they pass through the streaming pipeline.',
          highlights: ['stage-2'],
        },
        {
          label: 'Piped to Writable destination',
          caption: 'Data stream is piped straight into HTTP response (res) or destination file descriptor.',
          highlights: ['stage-3'],
        },
        {
          label: 'Stream complete & memory freed',
          caption: 'Stream emits "finish". Total memory consumption remained under 30MB even for a 5GB file.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import { createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { createGzip } from 'node:zlib'

// Stream a massive CSV export without memory spikes
app.get('/export-large', async (req, res) => {
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Encoding', 'gzip')

  const readStream = createReadStream('/data/10gb-dump.csv')
  const gzip = createGzip()

  // pipeline handles auto-cleanup, error forwarding, and backpressure!
  await pipeline(readStream, gzip, res)
})`,
      highlights: { 10: 'emerald', 11: 'amber', 14: 'emerald' },
    },
    terms: ['streams', 'buffers', 'readable-stream', 'writable-stream', 'transform-stream', 'pipe', 'pipeline'],
    pitfalls: [
      'Using fs.readFile() for user downloads, loading multi-gigabyte files into V8 heap memory and crashing with Out of Memory (OOM).',
      'Using legacy stream.pipe() instead of stream/promises pipeline(), which leaks file descriptors when connections abort.',
      'Converting raw binary buffers to strings with .toString("utf-8") during binary streaming, corrupting non-text bytes.',
    ],
    interview: [
      'What are the 4 fundamental types of streams in Node.js and what purpose does each serve?',
      'Why is using stream/promises pipeline() safer than the traditional stream.pipe() method?',
    ],
    next: ['backpressure', 'worker-threads-child-process', 'file-uploads'],
  },

  // ─── 6. Backpressure ─────────────────────────────────────────────────────────
  {
    id: 'backpressure',
    level: 3,
    order: 6,
    title: 'Backpressure',
    oneLiner: 'Signal the data producer to pause when the consumer buffer is filled to capacity.',
    mentalModel:
      'A water funnel: if you pour water from a bucket into a narrow funnel faster than the spout drains, the funnel overflows. Backpressure is pausing your pour until the funnel empties out.',
    viz: {
      component: 'ProducerQueue',
      steps: [
        {
          label: 'Fast Producer, Slow Consumer',
          caption: 'Fast SSD disk reads data at 500MB/s; slow mobile client over 3G network reads at 200KB/s.',
          highlights: [pq({ action: 'produce', producerActive: true, queueItems: ['chunk:1', 'chunk:2'], workerStatus: 'working' })],
        },
        {
          label: 'Internal buffer hits highWaterMark',
          caption: 'The stream internal buffer exceeds highWaterMark (default 64KB or 16 objects). write() returns false.',
          highlights: [pq({ action: 'queue', producerActive: false, queueItems: ['chunk:1', 'chunk:2', 'chunk:3', 'chunk:4'], workerStatus: 'working' })],
        },
        {
          label: 'Producer paused',
          caption: 'Readable stream calls stream.pause(). Disk reading halts to prevent memory explosion.',
          highlights: [pq({ action: 'queue', producerActive: false, queueItems: ['buffer full (64KB cap)'], workerStatus: 'working' })],
        },
        {
          label: 'Drain event emitted',
          caption: 'Consumer finishes transmitting pending chunks over network. Writable stream emits "drain".',
          highlights: [pq({ action: 'process', queueItems: ['chunk:4'], activeJob: 'drained buffer', workerStatus: 'working' })],
        },
        {
          label: 'Producer resumes flow',
          caption: 'Producer hears "drain" event and resumes reading chunks from disk. Memory usage stays constant.',
          highlights: [pq({ action: 'success', queueItems: [], workerStatus: 'success', stats: { completed: 10, failed: 0 } })],
        },
      ],
    },
    snippet: {
      lang: 'js',
      code: `// Manual backpressure handling without pipeline
function writeData(writer, data, encoding, callback) {
  let i = data.length
  function write() {
    let ok = true
    do {
      i--
      if (i === 0) {
        writer.write(data[i], encoding, callback) // last chunk
      } else {
        ok = writer.write(data[i], encoding) // returns false when buffer full!
      }
    } while (i > 0 && ok)
    if (i > 0) {
      // PAUSE: Buffer full! Wait for consumer to catch up
      writer.once('drain', write)
    }
  }
  write()
}`,
      highlights: { 11: 'rose', 15: 'amber', 16: 'emerald' },
    },
    terms: ['backpressure', 'highwatermark', 'drain-event', 'streams', 'flow-control', 'buffer-overflow'],
    pitfalls: [
      'Ignoring the false return value of writable.write(), continuously buffering data until Node crashes with FATAL ERROR: Ineffective mark-compacts.',
      'Manual event-listener soup: forgetting to clean up once("drain") listeners creates severe memory leaks.',
      'Configuring highWaterMark excessively high in stream constructors to "go faster", causing huge RAM allocations.',
    ],
    interview: [
      'What is backpressure in Node.js streams and what problem does it solve?',
      'What happens when writable.write() returns false, and which event tells the readable stream to resume?',
    ],
    next: ['streams-and-buffers', 'message-queues-jobs', 'connection-pooling'],
  },

  // ─── 7. Connection Pooling ───────────────────────────────────────────────────
  {
    id: 'connection-pooling',
    level: 3,
    order: 7,
    title: 'Connection Pooling',
    oneLiner: 'Reuse a bounded pool of open database sockets to eliminate expensive TCP/TLS handshakes.',
    mentalModel:
      'A fleet of corporate taxis on standby outside headquarters. Employees borrow an available taxi for a quick trip and return it to the lot. Nobody has to buy and register a brand new car for each errand.',
    viz: {
      component: 'ConnectionPool',
      steps: [
        {
          label: 'Cold Start Pool Creation',
          caption: 'Driver creates minPoolSize pre-warmed TCP sockets connected and authenticated to MongoDB.',
          highlights: [cp({ poolSize: 5, activeSockets: 0, idleSockets: 5, waitingQueue: 0, action: 'checkin' })],
        },
        {
          label: 'Requests Checkout Sockets',
          caption: 'Incoming queries borrow available idle sockets from pool. Handshake latency is 0ms.',
          highlights: [cp({ poolSize: 5, activeSockets: 3, idleSockets: 2, waitingQueue: 0, action: 'checkout' })],
        },
        {
          label: 'Peak Load: Sockets Exhausted',
          caption: 'Traffic spike checks out all 5 sockets. Next query cannot get a connection and enters waitQueue.',
          highlights: [cp({ poolSize: 5, activeSockets: 5, idleSockets: 0, waitingQueue: 4, action: 'exhausted' })],
        },
        {
          label: 'Query finishes & socket checked in',
          caption: 'Query completes; socket is released back to the pool. Waiting query immediately claims it.',
          highlights: [cp({ poolSize: 5, activeSockets: 4, idleSockets: 1, waitingQueue: 1, action: 'checkin' })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import mongoose from 'mongoose'

// Production connection pool tuning
await mongoose.connect(process.env.MONGO_URI!, {
  maxPoolSize: 50,          // maintain up to 50 concurrent socket connections
  minPoolSize: 10,          // keep 10 pre-warmed connections alive
  maxIdleTimeMS: 30000,     // close idle connections after 30s
  serverSelectionTimeoutMS: 5000,
  waitQueueTimeoutMS: 10000 // fail fast if pool exhausted for >10s
})

mongoose.connection.on('connected', () => console.log('Pool ready'))`,
      highlights: { 5: 'emerald', 6: 'emerald', 7: 'amber', 9: 'rose' },
    },
    terms: ['connection-pooling', 'max-pool-size', 'socket-exhaustion', 'wait-queue', 'handshake-overhead', 'tcp-socket'],
    pitfalls: [
      'Setting maxPoolSize too high across multiple server instances: 10 server pods x 100 maxPoolSize = 1,000 connections, exhausting DB memory.',
      'Setting waitQueueTimeoutMS too high, causing client HTTP requests to hang for minutes before failing.',
      'Connecting to the database on every HTTP request in serverless functions (AWS Lambda) without connection reuse caching.',
    ],
    interview: [
      'Why is connection pooling critical for high-throughput database interactions in Node.js?',
      'How should you calculate the optimal maxPoolSize for an application running in 20 container replicas?',
    ],
    next: ['replica-sets-read-write-concern', 'redis-caching', 'sharding'],
  },

  // ─── 8. Redis Caching ────────────────────────────────────────────────────────
  {
    id: 'redis-caching',
    level: 3,
    order: 8,
    title: 'Redis Caching',
    oneLiner: 'Store frequently read objects in RAM with TTLs to reduce database load by 90%.',
    mentalModel:
      'A RAM desk notepad next to your physical filing cabinet. You write today\'s top 10 lookups on the notepad for instant access, saving thousands of trips to the basement archives.',
    viz: {
      component: 'CacheFlow',
      steps: [
        {
          label: 'App checks Redis cache',
          caption: 'Client requests user profile. App executes redis.get("user:42") over sub-millisecond in-memory lookup.',
          highlights: [cf({ stage: 'check', keyName: 'user:42' })],
        },
        {
          label: 'Cache Hit: Instant Response',
          caption: 'Key exists in Redis memory! Result is parsed from JSON and returned in 1ms without touching MongoDB.',
          highlights: [cf({ stage: 'hit', cacheStatus: 'HIT', cachedValue: 'User 42 JSON' })],
        },
        {
          label: 'Cache Miss: Fallback to Mongo',
          caption: 'Key missing or expired. App executes User.findById(42) in MongoDB (15ms).',
          highlights: [cf({ stage: 'fetch_db', cacheStatus: 'MISS', dbValue: 'User 42 BSON' })],
        },
        {
          label: 'Populate Redis with TTL',
          caption: 'App calls redis.set("user:42", data, { EX: 3600 }). Next 50,000 requests will hit the cache.',
          highlights: [cf({ stage: 'store_cache', cacheStatus: 'HIT', cachedValue: 'Stored with TTL 3600s' })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import { createClient } from 'redis'
const redis = createClient({ url: process.env.REDIS_URL })
await redis.connect()

export async function getCachedUser(id: string) {
  const key = \`users:\${id}\`
  
  // 1. Try cache
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached) // Cache HIT

  // 2. Fallback to DB
  const user = await UserModel.findById(id).lean()
  if (!user) return null

  // 3. Populate cache with TTL (1 hour)
  await redis.set(key, JSON.stringify(user), { EX: 3600 })
  return user
}`,
      highlights: { 9: 'emerald', 10: 'emerald', 13: 'amber', 17: 'rose' },
    },
    terms: ['redis', 'cache-aside', 'cache-hit', 'cache-miss', 'ttl', 'in-memory-datastore', 'cache-stampede'],
    pitfalls: [
      'Omitting TTL (expiration) on cache keys: Redis memory will continuously grow until the process crashes or evicts random keys.',
      'Cache Stampede: when a hot key expires, 10,000 concurrent requests all miss and hammer MongoDB simultaneously.',
      'Caching sensitive user-specific data under a generic shared key, causing cross-account data leaks.',
    ],
    interview: [
      'What is a Cache Stampede (or Dogpiling) and how do you protect your database against it?',
      'How does Redis achieve sub-millisecond read/write latency compared to disk-based databases?',
    ],
    next: ['cache-invalidation-strategies', 'connection-pooling', 'cache-aside-pattern'],
  },

  // ─── 9. Cache Invalidation Strategies ────────────────────────────────────────
  {
    id: 'cache-invalidation-strategies',
    level: 3,
    order: 9,
    title: 'Cache Invalidation Strategies',
    oneLiner: 'Keep cache and database synchronized using write-through, write-behind, or explicit deletion.',
    mentalModel:
      '"There are only two hard things in Computer Science: cache invalidation and naming things." When the master record changes, you must immediately cross out the sticky note on your desk, or risk serving stale data.',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'Strategy Comparison',
          caption: 'Write-Through updates cache and database synchronously. Cache-Aside invalidates (deletes) the key on write.',
          highlights: [tpc({
            left: {
              title: 'Cache-Aside + Eviction',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Write Path', value: 'Write to DB -> redis.del(key)' },
                { label: 'Read Path', value: 'Read cache; on miss, fetch DB & set cache' },
                { label: 'Consistency', value: 'High — next read repopulates fresh state' },
                { label: 'Complexity', value: 'Simple & most common in MERN apps' },
              ],
            },
            right: {
              title: 'Write-Through',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Write Path', value: 'Write to cache -> Cache plugin writes to DB' },
                { label: 'Read Path', value: 'Always read cache (data always pre-warmed)' },
                { label: 'Consistency', value: 'Strict consistency at the cost of write latency' },
                { label: 'Complexity', value: 'Higher — cache handles DB writes' },
              ],
            },
            badge: { side: 'left', text: 'Delete on Write', color: 'emerald' },
          })],
        },
        {
          label: 'Why Delete Beats Update',
          caption: 'Deleting the cached key on update is safer than updating it, preventing race conditions between concurrent updates.',
          highlights: [tpc({
            left: {
              title: 'Delete Key on Update (Best)',
              color: 'emerald',
              activeRow: 1,
              rows: [
                { label: 'Race Safety', value: 'Immune to out-of-order write races' },
                { label: 'Wasted RAM', value: 'Zero — only re-cached if someone reads it' },
                { label: 'Code', value: 'await redis.del(`product:${id}`)' },
              ],
            },
            right: {
              title: 'Set Key on Update (Risky)',
              color: 'rose',
              activeRow: 1,
              rows: [
                { label: 'Race Hazard', value: 'Update A can overwrite Update B if out of order' },
                { label: 'Wasted RAM', value: 'Caches data that might never be read again' },
                { label: 'Code', value: 'await redis.set(`product:${id}`, newData)' },
              ],
            },
            badge: { side: 'left', text: 'Race-Condition Proof', color: 'emerald' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Safe Cache Invalidation: Delete key after DB mutation
export async function updateProduct(id: string, updates: Partial<Product>) {
  // 1. Update database source of truth
  const updated = await Product.findByIdAndUpdate(id, updates, { new: true })

  // 2. Invalidate cache key (DO NOT redis.set to avoid race conditions!)
  await redis.del(\`products:\${id}\`)

  // 3. Invalidate related collection lists
  await redis.del('products:featured')

  return updated
}`,
      highlights: { 4: 'emerald', 7: 'rose', 10: 'amber' },
    },
    terms: ['cache-invalidation', 'write-through', 'write-behind', 'cache-aside', 'stale-data', 'eventual-consistency'],
    pitfalls: [
      'Updating the cache object on write instead of deleting it: concurrent writes can cause stale data races.',
      'Deleting the cache before the database write commits: another query immediately repopulates old data from the DB.',
      'Forgetting to invalidate paginated list caches when a single item inside the collection is edited.',
    ],
    interview: [
      'Why is it generally safer to delete a cache key on update rather than overwriting it with new data?',
      'What is the difference between Write-Through and Write-Behind (Write-Back) caching?',
    ],
    next: ['redis-caching', 'idempotency-keys', 'message-queues-jobs'],
  },

  // ─── 10. Message Queues & Jobs ───────────────────────────────────────────────
  {
    id: 'message-queues-jobs',
    level: 3,
    order: 10,
    title: 'Message Queues & Jobs',
    oneLiner: 'Offload long-running tasks to background job workers so HTTP responses remain under 100ms.',
    mentalModel:
      'A dry cleaners ticket: you drop off your winter coats; the clerk gives you a ticket (202 Accepted, jobId) and you walk away immediately. The heavy cleaning happens in the back room over the next 2 hours.',
    viz: {
      component: 'ProducerQueue',
      steps: [
        {
          label: 'Producer enqueues job',
          caption: 'HTTP controller receives PDF generation request. Enqueues job in Redis queue and returns 202 Accepted.',
          highlights: [pq({ action: 'produce', producerActive: true, queueItems: ['pdf:user_42'], workerStatus: 'idle' })],
        },
        {
          label: 'Job waits in Redis FIFO queue',
          caption: 'BullMQ orchestrates priority, delays, and concurrency across queue workers in Redis.',
          highlights: [pq({ action: 'queue', producerActive: false, queueItems: ['pdf:user_42', 'email:user_10'], workerStatus: 'idle' })],
        },
        {
          label: 'Worker picks up job',
          caption: 'Dedicated background worker process picks up job and begins resource-intensive headless Chrome rendering.',
          highlights: [pq({ action: 'process', queueItems: ['email:user_10'], activeJob: 'pdf:user_42', workerStatus: 'working' })],
        },
        {
          label: 'Retry on transient failure',
          caption: 'If an external mail API throws 503, BullMQ automatically schedules an exponential backoff retry.',
          highlights: [pq({ action: 'retry', queueItems: ['email:user_10'], activeJob: 'pdf:user_42 (Attempt 2/3)', workerStatus: 'failed' })],
        },
        {
          label: 'Completed & event emitted',
          caption: 'Job finishes. Worker emits "completed" event and stores the generated asset URL in MongoDB.',
          highlights: [pq({ action: 'success', queueItems: [], workerStatus: 'success', stats: { completed: 1, failed: 0 } })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import { Queue, Worker } from 'bullmq'

const connection = { host: 'localhost', port: 6379 }
export const emailQueue = new Queue('emails', { connection })

// 1. PRODUCER: Fast HTTP route
app.post('/send-welcome', async (req, res) => {
  await emailQueue.add('welcomeEmail', { email: req.body.email }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  })
  res.status(202).json({ message: 'Email queued for delivery' })
})

// 2. CONSUMER / WORKER (Separate process)
new Worker('emails', async (job) => {
  await sendgrid.send(job.data)
}, { connection, concurrency: 5 })`,
      highlights: { 4: 'emerald', 8: 'amber', 10: 'rose', 12: 'emerald', 16: 'emerald' },
    },
    terms: ['bullmq', 'message-queue', 'job-worker', 'exponential-backoff', 'dead-letter-queue', 'redis-queue'],
    pitfalls: [
      'Executing heavy background tasks (video encoding, mass emails) synchronously in HTTP controllers, timing out clients.',
      'Not configuring exponential backoff retries, causing failed jobs to hammer failing third-party APIs repeatedly in milliseconds.',
      'Non-idempotent workers: if a job retries after a network blip, sending the customer three duplicate invoice emails.',
    ],
    interview: [
      'Why is returning HTTP 202 Accepted preferred when submitting tasks to a background message queue?',
      'How does exponential backoff with jitter protect downstream services during system outages?',
    ],
    next: ['idempotency-keys', 'backpressure', 'redis-caching'],
    simple: {
      oneLiner: 'A conveyor belt holding to-do notes for busy helpers.',
      mentalModel: 'Like dropping letters into a postbox; the mailman picks them up whenever he arrives.',
    },
  },

  // ─── 11. Idempotency Keys ───────────────────────────────────────────────────
  {
    id: 'idempotency-keys',
    level: 3,
    order: 11,
    title: 'Idempotency Keys',
    oneLiner: 'Use unique client-provided keys to safely retry mutating requests without double-charging.',
    mentalModel:
      'A check voucher number: if the bank receives two deposit slips bearing the exact same check voucher number (Idempotency-Key), it executes the payment once and simply hands you back the receipt for the second attempt.',
    viz: {
      component: 'StateMachine',
      steps: [
        {
          label: '1. Request arrives with Idempotency-Key',
          caption: 'Client sends POST /checkout with header Idempotency-Key: "uuid-987". Server checks Redis.',
          highlights: [sm({
            states: [
              { id: 'check', label: 'Check Key', desc: 'Redis GET key' },
              { id: 'lock', label: 'Acquire Lock', desc: 'SETNX key' },
              { id: 'execute', label: 'Run Mutation', desc: 'Charge credit card' },
              { id: 'saved', label: 'Save Result', desc: 'Cache response 24h' },
            ],
            activeState: 'check',
            transitionLabel: 'New key detected',
            status: 'success'
          })],
        },
        {
          label: '2. Acquire distributed mutex lock',
          caption: 'Server sets Redis lock (SETNX) with status "in-progress" to prevent concurrent duplicate requests.',
          highlights: [sm({
            activeState: 'lock',
            transitionLabel: 'Lock acquired',
            status: 'warning'
          })],
        },
        {
          label: '3. Execute critical payment',
          caption: 'Charges Stripe API and inserts Order into MongoDB. Operation takes 800ms.',
          highlights: [sm({
            activeState: 'execute',
            transitionLabel: 'Stripe API 200 OK',
            status: 'success'
          })],
        },
        {
          label: '4. Cache final response payload',
          caption: 'Status updated to "completed". Response body { orderId: 42 } is cached under the key for 24 hours.',
          highlights: [sm({
            activeState: 'saved',
            transitionLabel: 'Response cached',
            status: 'success'
          })],
        },
        {
          label: '5. Retried request returns cached response',
          caption: 'Network drops and client retries same key. Server detects completed state and returns cached 200 OK without re-charging!',
          highlights: [sm({
            activeState: 'saved',
            transitionLabel: 'Replay cached result',
            status: 'success'
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `app.post('/charges', async (req, res) => {
  const key = req.headers['idempotency-key'] as string
  if (!key) return res.status(400).json({ error: 'Idempotency-Key header required' })

  // 1. Check if operation already completed
  const cached = await redis.get(\`idemp:\${key}\`)
  if (cached) return res.status(200).json(JSON.parse(cached)) // Replay!

  // 2. Lock to prevent in-flight race condition
  const locked = await redis.set(\`idemp:\${key}\`, 'IN_FLIGHT', { NX: true, EX: 120 })
  if (!locked) return res.status(409).json({ error: 'Request in flight' })

  // 3. Perform mutation & save result
  const charge = await stripe.charges.create(req.body)
  await redis.set(\`idemp:\${key}\`, JSON.stringify(charge), { EX: 86400 })
  res.status(201).json(charge)
})`,
      highlights: { 2: 'emerald', 6: 'emerald', 7: 'emerald', 10: 'amber', 15: 'rose', 16: 'emerald' },
    },
    terms: ['idempotency-key', 'distributed-lock', 'replay-attack', 'stripe-pattern', 'setnx', 'deduplication'],
    pitfalls: [
      'Not locking in-flight requests: two concurrent requests with the same key both miss the cache and execute twice.',
      'Setting idempotency key TTL too short: retries occurring after 5 minutes could execute a duplicate transaction.',
      'Allowing clients to change the request payload while keeping the same idempotency key (must hash payload to verify match).',
    ],
    interview: [
      'How do idempotency keys prevent duplicate payments in distributed systems when network timeouts occur?',
      'What should your server do if a duplicate request arrives while the original operation is still in-flight?',
    ],
    next: ['message-queues-jobs', 'transactions-and-sessions', 'api-gateway-retries-circuit-breaker'],
  },

  // ─── 12. Replica Sets & Read/Write Concern ───────────────────────────────────
  {
    id: 'replica-sets-read-write-concern',
    level: 3,
    order: 12,
    title: 'Replica Sets & Read/Write Concern',
    oneLiner: 'Tune data durability and consistency using MongoDB Write Concern and Read Preference.',
    mentalModel:
      'Writing a contract: w:1 is having one notary stamp it (fast, but what if they lose it?); w:majority is waiting for a majority of 3 notaries to stamp it before you leave the room (durable, zero data loss).',
    viz: {
      component: 'ReplicaSwimlane',
      steps: [
        {
          label: 'Client writes with w:majority',
          caption: 'Client issues insert with { writeConcern: { w: "majority" } }. Primary member receives write and logs to oplog.',
          highlights: [rs({ operation: 'write_primary', writeConcern: 'w:majority', primaryStatus: 'writing', secondaries: [
            { id: 's1', label: 'Secondary A', lagMs: 0, state: 'synced' },
            { id: 's2', label: 'Secondary B', lagMs: 0, state: 'synced' },
          ] })],
        },
        {
          label: 'Oplog replication to secondaries',
          caption: 'Secondaries tail the primary oplog and apply mutations. Primary waits for majority acknowledgement.',
          highlights: [rs({ operation: 'oplog_replicate', writeConcern: 'w:majority', primaryStatus: 'writing', secondaries: [
            { id: 's1', label: 'Secondary A', lagMs: 2, state: 'replicating' },
            { id: 's2', label: 'Secondary B', lagMs: 4, state: 'replicating' },
          ] })],
        },
        {
          label: 'Majority reached & ACK returned',
          caption: 'Secondary A acknowledges. 2 out of 3 members have persisted write. Primary returns success to client.',
          highlights: [rs({ operation: 'sync_complete', writeConcern: 'w:majority', primaryStatus: 'committed', secondaries: [
            { id: 's1', label: 'Secondary A', lagMs: 0, state: 'synced' },
            { id: 's2', label: 'Secondary B', lagMs: 15, state: 'lagging' },
          ] })],
        },
        {
          label: 'Read Preference: Secondary',
          caption: 'Analytics read query configured with readPref="secondary" routes to Secondary A, offloading the Primary.',
          highlights: [rs({ operation: 'read_secondary', readPreference: 'secondary', primaryStatus: 'idle', secondaries: [
            { id: 's1', label: 'Secondary A', lagMs: 0, state: 'reading' },
            { id: 's2', label: 'Secondary B', lagMs: 0, state: 'synced' },
          ] })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// High durability financial transaction:
const order = await Order.create([{ amount: 100, user: '42' }], {
  writeConcern: {
    w: 'majority',  // acknowledged by majority of replica nodes
    j: true,        // committed to disk journal
    wtimeout: 5000  // fail if replication takes >5s
  }
})

// Offload heavy report queries to secondary replicas:
const report = await Order.find()
  .read('secondaryPreferred') // reads from secondary if available
  .lean()`,
      highlights: { 4: 'emerald', 5: 'emerald', 6: 'amber', 12: 'rose' },
    },
    terms: ['replica-set', 'write-concern', 'read-preference', 'oplog', 'journaling', 'replication-lag', 'w-majority'],
    pitfalls: [
      'Reading from secondaries with readPreference="secondary" can return stale data due to replication lag.',
      'Using default w:1 for mission-critical writes: if the primary dies before oplog replication, the write is rolled back and lost.',
      'Omitting wtimeout on majority writes: if network partitions prevent majority quorum, queries hang indefinitely.',
    ],
    interview: [
      'What is the difference between Write Concern w:1 and w:majority in MongoDB?',
      'Why can reading from MongoDB secondaries result in dirty or stale reads?',
    ],
    next: ['sharding', 'cap-theorem-acid-vs-base', 'connection-pooling'],
    simple: {
      oneLiner: 'Multiple copies of your notebook kept by trusty friends.',
      mentalModel: 'You write in the master notebook, and three friends instantly copy your sentences in case you lose yours.',
    },
  },

  // ─── 13. Sharding ────────────────────────────────────────────────────────────
  {
    id: 'sharding',
    level: 3,
    order: 13,
    title: 'Sharding',
    oneLiner: 'Distribute collection documents horizontally across multiple server clusters using a shard key.',
    mentalModel:
      'An encyclopedia set: instead of trying to bind a 100,000-page book into a single spine (vertical scaling limit), you publish 26 volumes labeled A–Z (sharding by shard key), routing readers directly to the volume they need.',
    viz: {
      component: 'ReplicaSwimlane',
      steps: [
        {
          label: 'Client sends query to mongos router',
          caption: 'App connects to mongos query router, which consults Config Servers to find where data lives.',
          highlights: [rs({ operation: 'mongos_route', readPreference: 'mongos', primaryStatus: 'idle', secondaries: [
            { id: 'shard-1', label: 'Shard 1 [users A-M]', lagMs: 0, state: 'synced' },
            { id: 'shard-2', label: 'Shard 2 [users N-Z]', lagMs: 0, state: 'synced' },
          ] })],
        },
        {
          label: 'Targeted Shard Query (Best)',
          caption: 'Query includes shard key: find({ username: "bob" }). mongos routes request directly to Shard 1 only.',
          highlights: [rs({ operation: 'targeted_route', writeConcern: 'Shard 1 only', primaryStatus: 'writing', secondaries: [
            { id: 'shard-1', label: 'Shard 1 (Hit)', lagMs: 0, state: 'reading' },
            { id: 'shard-2', label: 'Shard 2 (Untouched)', lagMs: 0, state: 'synced' },
          ] })],
        },
        {
          label: 'Scatter-Gather Query (Avoid)',
          caption: 'Query lacks shard key: find({ age: 30 }). mongos must broadcast query to every single shard and merge results.',
          highlights: [rs({ operation: 'scatter_gather', writeConcern: 'All Shards Broadcast', primaryStatus: 'writing', secondaries: [
            { id: 'shard-1', label: 'Shard 1 (Broadcast)', lagMs: 0, state: 'reading' },
            { id: 'shard-2', label: 'Shard 2 (Broadcast)', lagMs: 0, state: 'reading' },
          ] })],
        },
      ],
    },
    snippet: {
      lang: 'js',
      code: `// Enable sharding on database & collection
sh.enableSharding('ecommerce')

// Shard collection using a hashed or compound shard key:
sh.shardCollection('ecommerce.orders', {
  customerId: 1,    // High cardinality + evenly distributed
  orderId: 1
})

// Targeted Query: Uses shard key -> hits 1 shard (FAST)
db.orders.find({ customerId: 'cust_101', orderId: 'ord_999' })

// Scatter-Gather: Missing shard key -> hits ALL shards (SLOW)
db.orders.find({ totalAmount: { $gt: 500 } })`,
      highlights: { 5: 'emerald', 6: 'emerald', 10: 'emerald', 13: 'rose' },
    },
    terms: ['sharding', 'shard-key', 'mongos', 'config-servers', 'scatter-gather', 'horizontal-partitioning'],
    pitfalls: [
      'Selecting a low-cardinality shard key (e.g. status: "active"), causing all documents to route to a single jumbo chunk.',
      'Using a monotonically increasing shard key (e.g. auto-increment ID or ObjectId), routing 100% of writes to the last shard.',
      'Running scatter-gather queries frequently, negating the throughput benefits of sharding.',
    ],
    interview: [
      'What characteristics make a good shard key in MongoDB, and what keys should you avoid?',
      'What is a scatter-gather query in a sharded cluster and why is it detrimental to performance?',
    ],
    next: ['replica-sets-read-write-concern', 'cap-theorem-acid-vs-base', 'horizontal-scaling-load-balancing'],
    simple: {
      oneLiner: 'Splitting a giant library across three different buildings.',
      mentalModel: 'Putting books A-H in Room 1, I-P in Room 2, and Q-Z in Room 3 so crowds do not jam.',
    },
  },

  // ─── 14. CAP Theorem & ACID vs BASE ──────────────────────────────────────────
  {
    id: 'cap-theorem-acid-vs-base',
    level: 3,
    order: 14,
    title: 'CAP Theorem & ACID vs BASE',
    oneLiner: 'In a network partition, you must choose between Consistency (CP) or Availability (AP).',
    mentalModel:
      'Two branch banks when telephone lines are cut: CP banks refuse all cash withdrawals because they cannot verify balance updates across branches. AP banks let customers withdraw anyway, accepting that balances will reconcile later.',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'The CAP Triangle Choice',
          caption: 'Consistency (C), Availability (A), and Partition Tolerance (P). Networks will partition; you must choose CP or AP.',
          highlights: [tpc({
            left: {
              title: 'CP System (Consistency over Availability)',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Rule', value: 'Every read receives the most recent write or an error' },
                { label: 'Partition', value: 'If nodes cannot reach quorum, writes are REJECTED' },
                { label: 'Examples', value: 'MongoDB (w:majority), PostgreSQL, Redis Sentinel' },
                { label: 'Use Case', value: 'Banking, inventory, booking systems' },
              ],
            },
            right: {
              title: 'AP System (Availability over Consistency)',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Rule', value: 'Every request receives a response, possibly stale' },
                { label: 'Partition', value: 'All nodes accept reads/writes; reconcile later' },
                { label: 'Examples', value: 'Cassandra, DynamoDB, CouchDB' },
                { label: 'Use Case', value: 'Social media feeds, DNS, shopping carts' },
              ],
            },
            badge: { side: 'left', text: 'Partition Occurs', color: 'rose' },
          })],
        },
        {
          label: 'ACID vs BASE Models',
          caption: 'ACID provides immediate strict consistency. BASE provides Basic Availability, Soft state, and Eventual consistency.',
          highlights: [tpc({
            left: {
              title: 'ACID (Pessimistic / Strict)',
              color: 'emerald',
              activeRow: 1,
              rows: [
                { label: 'A', value: 'Atomicity: all writes commit or all rollback' },
                { label: 'C', value: 'Consistency: invariants preserved across state' },
                { label: 'I', value: 'Isolation: concurrent transactions don\'t interfere' },
                { label: 'D', value: 'Durability: committed data survives server restart' },
              ],
            },
            right: {
              title: 'BASE (Optimistic / Eventual)',
              color: 'amber',
              activeRow: 1,
              rows: [
                { label: 'BA', value: 'Basically Available: guaranteed uptime availability' },
                { label: 'S', value: 'Soft State: state may drift without input' },
                { label: 'E', value: 'Eventual Consistency: systems converge over time' },
                { label: 'Focus', value: 'Massive scale and zero-downtime tolerance' },
              ],
            },
            badge: { side: 'right', text: 'Eventual Convergence', color: 'amber' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// MongoDB allows configuring CP vs AP behaviour:

// 1. CP Behaviour: Strict consistency (refuse write if partition)
await Order.create([data], {
  writeConcern: { w: 'majority', wtimeout: 5000 }
})

// 2. AP Behaviour: Eventual consistency (fast, accept stale reads)
const feed = await Post.find()
  .read('nearest') // read closest replica, tolerate 1-2s lag
  .lean()`,
      highlights: { 4: 'emerald', 5: 'emerald', 9: 'amber', 10: 'amber' },
    },
    terms: ['cap-theorem', 'acid', 'base', 'eventual-consistency', 'network-partition', 'quorum'],
    pitfalls: [
      'Believing a system can be "CA" (Consistent + Available): network cables will fail; Partition Tolerance (P) is non-negotiable.',
      'Expecting immediate consistency when reading from eventual-consistency secondary nodes or read replicas.',
      'Designing financial account transfers using a pure BASE eventually consistent architecture without reconciliation safeguards.',
    ],
    interview: [
      'According to the CAP theorem, why is it impossible to have a CA distributed system in the real world?',
      'How does the BASE model differ from traditional relational ACID database guarantees?',
    ],
    next: ['replica-sets-read-write-concern', 'sharding', 'microservices-vs-monolith'],
    simple: {
      oneLiner: 'Pick two: always right, always answering, or survives cuts.',
      mentalModel: 'When phone lines break between two offices, you either stay silent or risk telling two different stories.',
    },
  },

  // ─── 15. Horizontal Scaling & Load Balancing ────────────────────────────────
  {
    id: 'horizontal-scaling-load-balancing',
    level: 3,
    order: 15,
    title: 'Horizontal Scaling & Load Balancing',
    oneLiner: 'Scale by adding more stateless server instances behind an NGINX or cloud load balancer.',
    mentalModel:
      'Vertical scaling is buying a bigger truck. Horizontal scaling is hiring 10 regular delivery vans led by a traffic dispatcher (load balancer) who distributes delivery boxes across drivers.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Client traffic arrives',
          caption: 'Thousands of concurrent requests hit the public IP of NGINX or AWS Application Load Balancer (ALB).',
          highlights: ['stage-0'],
        },
        {
          label: 'Health checks evaluate nodes',
          caption: 'Load balancer polls /healthz endpoints. Instances failing 3 consecutive checks are removed from rotation.',
          highlights: ['stage-1'],
        },
        {
          label: 'Load balancing algorithm',
          caption: 'Distributes traffic using Round Robin, Least Connections, or IP Hash algorithms.',
          highlights: ['stage-2'],
        },
        {
          label: 'Forwarded to stateless worker pod',
          caption: 'Request reaches one of 10 identical Node.js container pods. No session state is held on pod disk.',
          highlights: ['stage-3'],
        },
        {
          label: 'Auto-scaling trigger',
          caption: 'CPU utilization exceeds 70%. Cloud auto-scaler automatically provisions 4 additional pods in 60 seconds.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'bash',
      code: `# NGINX Load Balancer configuration
upstream backend_nodes {
    least_conn; # route to server with fewest active connections
    server 10.0.0.1:3000 max_fails=3 fail_timeout=10s;
    server 10.0.0.2:3000 max_fails=3 fail_timeout=10s;
    server 10.0.0.3:3000 max_fails=3 fail_timeout=10s;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend_nodes;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}`,
      highlights: { 3: 'emerald', 4: 'amber', 5: 'amber', 11: 'emerald' },
    },
    terms: ['horizontal-scaling', 'load-balancing', 'nginx', 'stateless', 'health-check', 'auto-scaling'],
    pitfalls: [
      'Storing user sessions in local server memory: subsequent requests hit different nodes and log out the user.',
      'Saving uploaded files to local disk instead of S3, meaning file downloads fail when routed to sibling servers.',
      'Configuring round-robin when request processing times vary by orders of magnitude (use least_conn instead).',
    ],
    interview: [
      'What requirements must an Express application meet to scale horizontally across hundreds of instances?',
      'What is the difference between Round Robin and Least Connections load balancing algorithms?',
    ],
    next: ['clustering-and-pm2', 'docker-ci-cd', 'microservices-vs-monolith'],
  },

  // ─── 16. WebSockets vs SSE vs Polling ────────────────────────────────────────
  {
    id: 'websockets-vs-sse-vs-polling',
    level: 3,
    order: 16,
    title: 'WebSockets vs SSE vs Polling',
    oneLiner: 'Use WebSockets for bi-directional chat/gaming; use SSE for server-to-client streaming.',
    mentalModel:
      'Polling is asking "Are we there yet?" every 5 seconds. SSE is listening to a radio broadcast (one-way stream from station). WebSockets is a continuous telephone phone call where both parties can talk simultaneously.',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'Protocol & Directionality',
          caption: 'WebSockets provide full-duplex TCP communication. Server-Sent Events (SSE) provide lightweight unidirectional HTTP streaming.',
          highlights: [tpc({
            left: {
              title: 'WebSockets (Full-Duplex)',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Direction', value: 'Bi-directional (Client <==> Server)' },
                { label: 'Protocol', value: 'ws:// upgrades from HTTP to TCP socket' },
                { label: 'Overhead', value: 'Minimal 2-byte framing per message' },
                { label: 'Best for', value: 'Chat apps, multiplayer games, collaborative docs' },
              ],
            },
            right: {
              title: 'Server-Sent Events (SSE)',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Direction', value: 'Unidirectional (Server ===> Client only)' },
                { label: 'Protocol', value: 'Standard HTTP (Content-Type: text/event-stream)' },
                { label: 'Reconnection', value: 'Built-in auto-reconnection in browsers' },
                { label: 'Best for', value: 'Stock tickers, live notifications, LLM token streams' },
              ],
            },
            badge: { side: 'left', text: 'Two-Way Sockets', color: 'emerald' },
          })],
        },
        {
          label: 'Architecture & Scaling',
          caption: 'WebSockets require stateful sticky sessions or Redis Pub/Sub backplanes. SSE works over standard HTTP/2 multiplexing.',
          highlights: [tpc({
            left: {
              title: 'WebSocket Scaling',
              color: 'emerald',
              activeRow: 1,
              rows: [
                { label: 'Multiplexing', value: 'Requires separate TCP connection per client' },
                { label: 'Cluster', value: 'Requires Redis Pub/Sub adapter to sync servers' },
                { label: 'Proxies', value: 'Can be blocked by corporate firewalls' },
              ],
            },
            right: {
              title: 'SSE Scaling',
              color: 'amber',
              activeRow: 1,
              rows: [
                { label: 'Multiplexing', value: 'Reuses existing HTTP/2 connection seamlessly' },
                { label: 'Cluster', value: 'Runs on standard stateless HTTP servers' },
                { label: 'Proxies', value: 'Passes through corporate proxies without issue' },
              ],
            },
            badge: { side: 'right', text: 'HTTP/2 Native', color: 'amber' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Lightweight Server-Sent Events (SSE) stream in Express
app.get('/api/live-feed', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  // Stream updates to client continuously
  const interval = setInterval(() => {
    res.write(\`data: \${JSON.stringify({ price: Math.random() })}\\n\\n\`)
  }, 1000)

  req.on('close', () => clearInterval(interval))
})`,
      highlights: { 4: 'emerald', 5: 'emerald', 6: 'emerald', 10: 'amber', 13: 'rose' },
    },
    terms: ['websockets', 'sse', 'polling', 'full-duplex', 'text-event-stream', 'heartbeat'],
    pitfalls: [
      'Using WebSockets when your feature only sends updates from server to client (SSE is simpler, cheaper, and auto-reconnects).',
      'Forgetting heartbeat / ping-pong frames: firewalls and load balancers terminate idle TCP connections after 60 seconds.',
      'Broadcasting WebSocket messages across multi-server clusters without a Redis Pub/Sub message broker.',
    ],
    interview: [
      'What are the advantages of Server-Sent Events (SSE) over WebSockets for AI chatbot streaming responses?',
      'How do you scale WebSockets horizontally across multiple Express server instances?',
    ],
    next: ['pubsub-and-fanout', 'horizontal-scaling-load-balancing', 'redis-caching'],
  },

  // ─── 17. Pub/Sub & Fan-out ───────────────────────────────────────────────────
  {
    id: 'pubsub-and-fanout',
    level: 3,
    order: 17,
    title: 'Pub/Sub & Fan-out',
    oneLiner: 'Broadcast messages to multiple independent subscriber channels without coupling publishers to consumers.',
    mentalModel:
      'A podcast publisher: the podcaster uploads one episode to the feed (publish). Millions of subscribers automatically receive the download in their podcast apps without the podcaster knowing who they are.',
    viz: {
      component: 'ProducerQueue',
      steps: [
        {
          label: 'Publisher emits event',
          caption: 'Order Service publishes event order.created to Redis topic or Kafka exchange.',
          highlights: [pq({ action: 'produce', producerActive: true, queueItems: ['event:order.created'], workerStatus: 'idle' })],
        },
        {
          label: 'Fan-out to multiple queues',
          caption: 'Broker fans out the single event to 3 independent subscriber queues simultaneously.',
          highlights: [pq({ action: 'queue', producerActive: false, queueItems: ['emailQueue:job1', 'inventoryQueue:job2', 'analyticsQueue:job3'], workerStatus: 'idle' })],
        },
        {
          label: 'Subscribers process concurrently',
          caption: 'Email Service sends receipt, Inventory reserves items, and Analytics records purchase in parallel.',
          highlights: [pq({ action: 'process', queueItems: ['inventoryQueue:job2'], activeJob: 'email:job1', workerStatus: 'working' })],
        },
        {
          label: 'Decoupled completion',
          caption: 'If Email Service is down, Inventory and Analytics complete independently without blocking the order.',
          highlights: [pq({ action: 'success', queueItems: [], workerStatus: 'success', stats: { completed: 3, failed: 0 } })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import { createClient } from 'redis'

const pub = createClient({ url: process.env.REDIS_URL })
const sub = pub.duplicate()
await Promise.all([pub.connect(), sub.connect()])

// 1. SUBSCRIBER: Listens for notifications
await sub.subscribe('user-notifications', (message) => {
  const event = JSON.parse(message)
  sendPushNotification(event.userId, event.text)
})

// 2. PUBLISHER: Emits event to all subscribers
export async function notifyUser(userId: string, text: string) {
  await pub.publish('user-notifications', JSON.stringify({ userId, text }))
}`,
      highlights: { 4: 'emerald', 8: 'amber', 10: 'emerald', 15: 'rose' },
    },
    terms: ['pubsub', 'fan-out', 'event-driven', 'decoupling', 'message-broker', 'redis-pubsub'],
    pitfalls: [
      'Using standard Redis Pub/Sub for critical data: standard Redis Pub/Sub has NO message persistence; if a subscriber is offline, messages are lost.',
      'Creating circular pub/sub event loops where Service A\'s event triggers Service B, which triggers Service A again.',
      'Over-coupling events by embedding entire database entities inside payloads instead of clean minimal event schemas.',
    ],
    interview: [
      'What is the fundamental difference between a Message Queue (Point-to-Point) and Pub/Sub (Publish-Subscribe)?',
      'What happens if a Redis Pub/Sub subscriber is offline when a message is published?',
    ],
    next: ['websockets-vs-sse-vs-polling', 'message-queues-jobs', 'microservices-vs-monolith'],
  },

  // ─── 18. Microservices vs Monolith ───────────────────────────────────────────
  {
    id: 'microservices-vs-monolith',
    level: 3,
    order: 18,
    title: 'Microservices vs Monolith',
    oneLiner: 'Monoliths share code and database; microservices split by domain with independent deployments.',
    mentalModel:
      'Monolith is a smartphone containing camera, phone, and GPS in one chassis (easy to carry, but battery dies = everything dies). Microservices is a modular home theater system with separate speakers, receiver, and screen connected via cables.',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'Architecture & Boundary Tradeoffs',
          caption: 'Monoliths prioritize development velocity and simple transactions. Microservices prioritize team autonomy and independent scaling.',
          highlights: [tpc({
            left: {
              title: 'Modular Monolith (Default)',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Database', value: 'Single shared database schema' },
                { label: 'Calls', value: 'In-memory function calls (0ms latency, zero network failure)' },
                { label: 'Deploy', value: 'Atomic single-click CI/CD deployment' },
                { label: 'ACID', value: 'Full ACID transactions across entire application' },
              ],
            },
            right: {
              title: 'Microservices (Scale & Autonomy)',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Database', value: 'Database-per-service (no direct cross-service queries)' },
                { label: 'Calls', value: 'Network RPC / HTTP (latency, retries, circuit breakers)' },
                { label: 'Deploy', value: 'Independent team CI/CD pipelines' },
                { label: 'ACID', value: 'Eventual consistency (Sagas / Outbox pattern)' },
              ],
            },
            badge: { side: 'left', text: 'Start with Monolith', color: 'emerald' },
          })],
        },
        {
          label: 'The Hidden Operational Cost',
          caption: 'Microservices solve organizational scaling bottlenecks at the cost of distributed systems complexity, tracing, and network failures.',
          highlights: [tpc({
            left: {
              title: 'Monolith Complexities',
              color: 'emerald',
              activeRow: 1,
              rows: [
                { label: 'Scaling', value: 'Must scale entire app even if only 1 route is hot' },
                { label: 'Coupling', value: 'Risk of spaghetti code without strict boundaries' },
                { label: 'Deploys', value: 'Bad deploy takes down all services' },
              ],
            },
            right: {
              title: 'Microservice Complexities',
              color: 'rose',
              activeRow: 1,
              rows: [
                { label: 'Failures', value: 'Partial network failures, cascaded outages' },
                { label: 'Dev Ops', value: 'Kubernetes, distributed tracing, service mesh' },
                { label: 'Data Joins', value: 'Cannot do SQL/Mongo joins across services' },
              ],
            },
            badge: { side: 'right', text: 'Distributed Complexity', color: 'rose' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Modular Monolith: Clean boundaries via modules, NOT network hops
// src/modules/orders/orders.service.ts
import { InventoryService } from '../inventory/inventory.service'

export class OrderService {
  async checkout(orderId: string) {
    // Direct in-memory function call! (0ms latency, no HTTP failure)
    await InventoryService.reserveStock(orderId)
    await db.transaction(async (session) => {
      // Native ACID transaction across tables
    })
  }
}`,
      highlights: { 2: 'emerald', 7: 'emerald', 8: 'amber' },
    },
    terms: ['microservices', 'monolith', 'database-per-service', 'distributed-systems', 'saga-pattern', 'bounded-context'],
    pitfalls: [
      'Premature microservices: splitting a 5-person startup into 15 microservices creates devastating deployment overhead.',
      'Shared Database anti-pattern: microservices querying each other\'s database tables directly destroys service boundaries.',
      'Ignoring distributed transaction failures: trying to maintain two-phase commits across HTTP services.',
    ],
    interview: [
      'What are the primary operational challenges introduced when transitioning from a Monolith to Microservices?',
      'Why is the Database-per-Service rule considered essential in microservices architecture?',
    ],
    next: ['api-gateway-retries-circuit-breaker', 'observability-tracing', 'cap-theorem-acid-vs-base'],
  },

  // ─── 19. API Gateway, Retries, Circuit Breaker ───────────────────────────────
  {
    id: 'api-gateway-retries-circuit-breaker',
    level: 3,
    order: 19,
    title: 'API Gateway, Retries, Circuit Breaker',
    oneLiner: 'Trip the circuit breaker when an upstream dependency fails to prevent cascading outages.',
    mentalModel:
      'A household electrical fuse: when a downstream heater draws dangerous current (third-party payment API errors out), the fuse trips open instantly, cutting the connection before the entire house wiring burns down.',
    viz: {
      component: 'StateMachine',
      steps: [
        {
          label: '1. CLOSED State (Normal Traffic)',
          caption: 'Circuit is CLOSED. All requests pass through to payment gateway. Failure rate is 0%.',
          highlights: [sm({
            states: [
              { id: 'closed', label: 'CLOSED (Normal)', desc: 'Failures < 50%' },
              { id: 'open', label: 'OPEN (Tripped)', desc: 'Fail fast / fallback' },
              { id: 'half_open', label: 'HALF-OPEN (Probe)', desc: 'Canary test request' },
            ],
            activeState: 'closed',
            transitionLabel: 'Healthy requests',
            status: 'success'
          })],
        },
        {
          label: '2. Consecutive Failures Trip Breaker',
          caption: 'Upstream payment API times out repeatedly. Failure threshold (50%) exceeded: circuit trips OPEN!',
          highlights: [sm({
            activeState: 'open',
            transitionLabel: '5 timeouts in 10s',
            status: 'error'
          })],
        },
        {
          label: '3. OPEN: Fast Fallback (Zero Network Calls)',
          caption: 'Circuit is OPEN. Requests immediately return cached data or error without hitting the dead API.',
          highlights: [sm({
            activeState: 'open',
            transitionLabel: 'Fast fail 503 / fallback',
            status: 'error'
          })],
        },
        {
          label: '4. HALF-OPEN: Canary Probe',
          caption: 'Cooldown timer (30s) elapses. Breaker enters HALF-OPEN, allowing 1 test request through to check recovery.',
          highlights: [sm({
            activeState: 'half_open',
            transitionLabel: 'Cooldown elapsed',
            status: 'warning'
          })],
        },
        {
          label: '5. Canary Succeeds -> Reset to CLOSED',
          caption: 'Test request succeeds! Circuit resets to CLOSED and regular traffic resumes normally.',
          highlights: [sm({
            activeState: 'closed',
            transitionLabel: 'Upstream healthy',
            status: 'success'
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import CircuitBreaker from 'opossum'

// Wrap external API call in a Circuit Breaker
const breaker = new CircuitBreaker(callPaymentGateway, {
  timeout: 3000,              // trip if request takes >3s
  errorThresholdPercentage: 50, // trip if 50% of requests fail
  resetTimeout: 30000         // wait 30s before testing half-open
})

// Fallback when circuit is OPEN
breaker.fallback(() => ({ status: 'queued', message: 'Payment deferred' }))

app.post('/pay', async (req, res) => {
  const result = await breaker.fire(req.body)
  res.json(result)
})`,
      highlights: { 4: 'emerald', 5: 'amber', 6: 'rose', 10: 'rose', 13: 'emerald' },
    },
    terms: ['circuit-breaker', 'api-gateway', 'retry-pattern', 'cascading-failure', 'fail-fast', 'opossum'],
    pitfalls: [
      'Retrying without exponential backoff or jitter, creating a "retry storm" that prevents recovering services from booting.',
      'Omitting timeouts on external HTTP requests: slow dependencies consume all Node sockets and freeze your backend.',
      'Not providing a graceful fallback response when the circuit breaker trips open.',
    ],
    interview: [
      'Describe the three states of the Circuit Breaker pattern (Closed, Open, Half-Open).',
      'What is a retry storm and how does adding jitter to backoff intervals mitigate it?',
    ],
    next: ['observability-tracing', 'microservices-vs-monolith', 'rate-limiting'],
  },

  // ─── 20. Observability & Tracing ─────────────────────────────────────────────
  {
    id: 'observability-tracing',
    level: 3,
    order: 20,
    title: 'Observability & Tracing',
    oneLiner: 'Pass correlation IDs across microservices to trace a request journey through distributed logs.',
    mentalModel:
      'A courier tracking barcode stamped on a package at pickup. Every warehouse, delivery van, and customs checkpoint scans the exact same barcode so you can see every hop on a single timeline.',
    viz: {
      component: 'SequenceSwimlane',
      steps: [
        {
          label: 'Client generates trace ID',
          caption: 'Request arrives at API Gateway with header x-request-id: "req-abc-123" (or generated at gateway).',
          highlights: ['client'],
        },
        {
          label: 'Propagated to Auth Service',
          caption: 'Gateway forwards request to Auth Service, preserving the trace ID in HTTP headers.',
          highlights: ['client-to-server'],
        },
        {
          label: 'Propagated to Order Service',
          caption: 'Auth calls Order Service via gRPC/HTTP passing traceparent OpenTelemetry context.',
          highlights: ['server'],
        },
        {
          label: 'Database query tagged',
          caption: 'Order Service writes to MongoDB with trace ID tagged in query comment ($comment: "req-abc-123").',
          highlights: ['server-to-db'],
        },
        {
          label: 'Logs unified in Jaeger / Datadog',
          caption: 'Searching "req-abc-123" in log collector shows exact waterfall timeline across all 3 services.',
          highlights: ['server-to-client'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `import { v4 as uuidv4 } from 'uuid'

// 1. Correlation ID Middleware
app.use((req, res, next) => {
  const correlationId = (req.headers['x-request-id'] as string) || uuidv4()
  req.id = correlationId
  res.setHeader('x-request-id', correlationId)
  next()
})

// 2. Propagate downstream in HTTP calls
async function callOrderService(req: Request, data: object) {
  return fetch('http://order-svc/orders', {
    method: 'POST',
    headers: { 'x-request-id': req.id, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}`,
      highlights: { 5: 'emerald', 6: 'emerald', 7: 'amber', 14: 'rose' },
    },
    terms: ['observability', 'distributed-tracing', 'correlation-id', 'opentelemetry', 'waterfall', 'jaeger'],
    pitfalls: [
      'Failing to propagate correlation headers to downstream fetch/Axios requests, severing the distributed trace.',
      'Logging trace IDs only on success and forgetting to attach them to unhandled exception logs.',
      'High sampling rates in high-throughput systems: tracing 100% of 100,000 req/s will overwhelm log storage (use 1-5% sampling).',
    ],
    interview: [
      'What are the Three Pillars of Observability and how do they work together?',
      'How does correlation ID propagation work across asynchronous microservice communication boundaries?',
    ],
    next: ['api-gateway-retries-circuit-breaker', 'logging-and-config', 'owasp-api-top-10'],
  },

  // ─── 21. OWASP API Top 10 ────────────────────────────────────────────────────
  {
    id: 'owasp-api-top-10',
    level: 3,
    order: 21,
    title: 'OWASP API Top 10',
    oneLiner: 'Defend against BOLA, broken authentication, mass assignment, and SSRF vulnerabilities.',
    mentalModel:
      'A comprehensive home security inspection: checking not just the front door deadbolt (auth), but window latches (BOLA), garage passcodes (mass assignment), and ensuring the smart speaker doesn\'t unlock the door for strangers (SSRF).',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'BOLA Attack Attempted',
          caption: 'User 101 requests GET /api/documents/999 (User 999\'s private document). Token is valid for User 101.',
          highlights: ['stage-0'],
        },
        {
          label: 'Ownership check executed',
          caption: 'Backend queries Document.findOne({ _id: docId, ownerId: req.user.id }) instead of findById(docId).',
          highlights: ['stage-1'],
        },
        {
          label: 'BOLA Defeated (404/403)',
          caption: 'Query yields null. Controller returns 404 Not Found, preventing unauthorized horizontal privilege escalation.',
          highlights: ['stage-2'],
        },
        {
          label: 'Mass Assignment Filter',
          caption: 'User submits { "role": "admin" } on profile update. Zod schema strips unpermitted property.',
          highlights: ['stage-3'],
        },
        {
          label: 'SSRF URL Validation',
          caption: 'User submits webhook URL "http://169.254.169.254" (AWS metadata). Whitelist blocks private IP ranges.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Defeating BOLA (Broken Object Level Authorization):
app.get('/invoices/:id', requireAuth, async (req, res) => {
  // CRITICAL: Always scope by logged-in user id!
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    userId: req.user.id // BOLA shield: Prevents viewing other users' invoices
  })

  if (!invoice) return res.status(404).json({ error: 'Invoice not found' })
  res.json({ invoice })
})`,
      highlights: { 5: 'emerald', 6: 'rose', 9: 'amber' },
    },
    terms: ['owasp-api', 'bola', 'mass-assignment', 'ssrf', 'privilege-escalation', 'broken-auth'],
    pitfalls: [
      'Relying solely on authentication and forgetting object-level authorization: letting any logged-in user fetch /orders/123.',
      'Allowing direct Object.assign(user, req.body), enabling users to escalate their own role to "admin".',
      'Permitting user-supplied URLs to be fetched by the server without blocking internal IP addresses (127.0.0.1, 169.254.169.254).',
    ],
    interview: [
      'What is BOLA (Broken Object Level Authorization) and why is it ranked #1 on the OWASP API Security Top 10?',
      'How does Server-Side Request Forgery (SSRF) allow attackers to steal cloud instance metadata credentials?',
    ],
    next: ['oauth2-sso-flows', 'security-headers-injection', 'input-validation-zod'],
  },

  // ─── 22. OAuth2 / SSO Flows ──────────────────────────────────────────────────
  {
    id: 'oauth2-sso-flows',
    level: 3,
    order: 22,
    title: 'OAuth2 / SSO Flows',
    oneLiner: 'Use the Authorization Code flow with PKCE to securely delegate authentication to third parties.',
    mentalModel:
      'Valet key for your car: the valet key lets the parking attendant start the engine and park (read profile), but it locks the glove compartment and trunk (cannot access billing or change passwords).',
    viz: {
      component: 'SequenceSwimlane',
      steps: [
        {
          label: '1. User clicks "Login with Google"',
          caption: 'Client redirects to Google OAuth endpoint with client_id, redirect_uri, scope, and PKCE code_challenge.',
          highlights: ['client'],
        },
        {
          label: '2. User consents & logs in at Google',
          caption: 'Google verifies credentials and displays consent screen ("Allow app to read your email?").',
          highlights: ['client-to-server'],
        },
        {
          label: '3. Auth code returned via redirect',
          caption: 'Google redirects browser back to /api/auth/callback with short-lived authorization code (?code=xyz123).',
          highlights: ['server'],
        },
        {
          label: '4. Backend exchanges code for token',
          caption: 'Backend makes server-to-server POST to Google token endpoint with code and client_secret (hidden from browser).',
          highlights: ['server-to-db'],
        },
        {
          label: '5. Google returns tokens & user profile',
          caption: 'Backend receives ID token (JWT) & Access token. Finds or creates User in MongoDB, and issues app session.',
          highlights: ['server-to-client'],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// OAuth2 Authorization Code Exchange in Express
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query

  // 1. Exchange temporary auth code for tokens (Server-to-Server!)
  const { tokens } = await oauth2Client.getToken(code as string)
  oauth2Client.setCredentials(tokens)

  // 2. Fetch verified profile from Google UserInfo endpoint
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
  const { data } = await oauth2.userinfo.get()

  // 3. Find or create user in local database
  const user = await UserModel.findOrCreateFromOAuth(data.email!, data.name!)
  const sessionToken = signAccessToken(user.id)
  res.cookie('token', sessionToken, cookieConfig).redirect('/dashboard')
})`,
      highlights: { 6: 'emerald', 7: 'emerald', 11: 'amber', 14: 'rose', 16: 'emerald' },
    },
    terms: ['oauth2', 'pkce', 'authorization-code', 'sso', 'id-token', 'client-secret'],
    pitfalls: [
      'Exposing client_secret in client-side React code: anyone can inspect your bundle and steal your OAuth credentials.',
      'Omitting the state parameter in OAuth URLs, leaving authentication vulnerable to Cross-Site Request Forgery (CSRF).',
      'Trusting the email address returned by OAuth providers without checking if email_verified is true.',
    ],
    interview: [
      'Explain the step-by-step handshake in the OAuth 2.0 Authorization Code Flow with PKCE.',
      'Why is the client_secret exchanged from the backend server rather than directly in the client browser?',
    ],
    next: ['jwt-anatomy', 'sessions-vs-jwt', 'cookies-security-flags'],
  },

  // ─── 23. Docker & CI/CD ──────────────────────────────────────────────────────
  {
    id: 'docker-ci-cd',
    level: 3,
    order: 23,
    title: 'Docker & CI/CD',
    oneLiner: 'Package Node.js into multi-stage OCI containers and automate testing and deployments.',
    mentalModel:
      'Standardized international shipping containers: regardless of what is packed inside (Node, Python, binaries), every cargo crane, train, and ship (Docker, Kubernetes) can lift, transport, and run it identically anywhere.',
    viz: {
      component: 'AnimatedPipeline',
      steps: [
        {
          label: 'Code pushed to GitHub',
          caption: 'Developer pushes commit to main branch. GitHub Actions workflow triggers automatically.',
          highlights: ['stage-0'],
        },
        {
          label: 'Automated CI pipeline runs',
          caption: 'Linter, TypeScript type-check, and Vitest unit/integration test suites execute in parallel.',
          highlights: ['stage-1'],
        },
        {
          label: 'Multi-stage Docker build',
          caption: 'Stage 1 compiles TypeScript; Stage 2 copies only dist/ and production node_modules to trim image to 100MB.',
          highlights: ['stage-2'],
        },
        {
          label: 'Image pushed to Registry',
          caption: 'Signed container image is pushed to Amazon ECR or Docker Hub with git commit SHA tag.',
          highlights: ['stage-3'],
        },
        {
          label: 'Deploy to Kubernetes / Cloud',
          caption: 'K8s pulls new image and performs zero-downtime rolling update across container pods.',
          highlights: ['stage-4'],
        },
      ],
    },
    snippet: {
      lang: 'bash',
      code: `# Multi-stage Dockerfile for production Node.js
# STAGE 1: Build & compile TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

# STAGE 2: Minimalist production runtime (no compilers)
FROM node:20-alpine
WORKDIR /app
USER node
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]`,
      highlights: { 3: 'amber', 7: 'amber', 10: 'emerald', 12: 'rose', 13: 'emerald', 14: 'emerald' },
    },
    terms: ['docker', 'ci-cd', 'multi-stage-build', 'alpine', 'containerization', 'github-actions'],
    pitfalls: [
      'Running containers as the root user: always include USER node in your Dockerfile to mitigate container breakout attacks.',
      'Shipping devDependencies and source TypeScript files in the production container image, bloating image size to 1GB+.',
      'Using npm install instead of npm ci in CI pipelines, leading to non-deterministic dependency versions.',
    ],
    interview: [
      'Why are multi-stage Docker builds recommended for Node.js production container images?',
      'Why should you never run Node.js applications as the root user inside Docker containers?',
    ],
    next: ['zero-downtime-deploy-migrations', 'horizontal-scaling-load-balancing', 'logging-and-config'],
  },

  // ─── 24. Zero-Downtime Deploy & Migrations ───────────────────────────────────
  {
    id: 'zero-downtime-deploy-migrations',
    level: 3,
    order: 24,
    title: 'Zero-Downtime Deploy & Migrations',
    oneLiner: 'Deploy new code without dropped connections using rolling updates and expand/contract database schemas.',
    mentalModel:
      'Replacing an engine while the airplane is flying: you start the new engine alongside the old one, verify it is generating thrust (health check passes), gradually transfer power, and only then shut off the old engine.',
    viz: {
      component: 'StateMachine',
      steps: [
        {
          label: '1. Version 1 (Current) Healthy',
          caption: '3 pods running Version 1 serve 100% of production traffic through the load balancer.',
          highlights: [sm({
            states: [
              { id: 'v1', label: 'V1 Live (100%)', desc: 'Old code' },
              { id: 'overlap', label: 'V1 + V2 Overlap', desc: 'Rolling rollout' },
              { id: 'cutover', label: 'V2 Live (100%)', desc: 'V1 decommissioned' },
            ],
            activeState: 'v1',
            transitionLabel: 'Steady state',
            status: 'success'
          })],
        },
        {
          label: '2. Deploy Expand Phase (Schema)',
          caption: 'Database schema is updated with backward-compatible expansion (adds new optional column/field).',
          highlights: [sm({
            activeState: 'v1',
            transitionLabel: 'Schema expanded',
            status: 'success'
          })],
        },
        {
          label: '3. Rolling update spawns V2 pods',
          caption: 'New V2 pod launches. K8s waits for readinessProbe HTTP 200 before routing traffic.',
          highlights: [sm({
            activeState: 'overlap',
            transitionLabel: 'V2 readiness probe OK',
            status: 'warning'
          })],
        },
        {
          label: '4. Graceful shutdown of V1 (SIGTERM)',
          caption: 'V1 pods receive SIGTERM. They stop accepting new traffic, finish in-flight requests, and exit cleanly.',
          highlights: [sm({
            activeState: 'overlap',
            transitionLabel: 'Draining V1 connections',
            status: 'warning'
          })],
        },
        {
          label: '5. V2 Complete & Contract Phase',
          caption: '100% of traffic on V2. Old deprecated database fields are removed in Contract phase.',
          highlights: [sm({
            activeState: 'cutover',
            transitionLabel: '100% V2 active',
            status: 'success'
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Graceful Shutdown handling in Express
const server = app.listen(3000)

function shutdown(signal: string) {
  logger.info(\`Received \${signal}. Draining connections...\`)
  server.close(async () => {
    logger.info('HTTP server closed. Closing DB connections...')
    await mongoose.connection.close()
    await redisClient.quit()
    process.exit(0)
  })

  // Force close after 10 seconds if connections refuse to drain
  setTimeout(() => {
    logger.error('Forced shutdown timeout!')
    process.exit(1)
  }, 10000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))`,
      highlights: { 6: 'emerald', 8: 'amber', 9: 'amber', 14: 'rose', 20: 'emerald' },
    },
    terms: ['zero-downtime', 'graceful-shutdown', 'sigterm', 'rolling-update', 'expand-contract', 'readiness-probe'],
    pitfalls: [
      'Performing breaking database column renames in a single migration step, immediately breaking all live V1 instances.',
      'Killing the Node process immediately with process.exit(0) on SIGTERM instead of waiting for in-flight requests to drain.',
      'Failing to configure a readiness probe in Kubernetes, causing the router to send traffic before database connections are ready.',
    ],
    interview: [
      'Explain the Expand and Contract pattern (Parallel Run) for zero-downtime database migrations.',
      'What steps must a Node.js process take upon receiving a SIGTERM signal during a rolling deployment?',
    ],
    next: ['docker-ci-cd', 'horizontal-scaling-load-balancing', 'clustering-and-pm2'],
  },

  // ─── 25. GraphQL vs REST vs gRPC ─────────────────────────────────────────────
  {
    id: 'graphql-vs-rest-vs-grpc',
    level: 3,
    order: 25,
    title: 'GraphQL vs REST vs gRPC',
    oneLiner: 'Use REST for public resources; GraphQL for flexible frontend queries; gRPC for high-speed microservices.',
    mentalModel:
      'REST is ordering a set combo meal (#1 burger + fries); GraphQL is an open salad buffet where you pick exact ingredients on your plate; gRPC is a pneumatic tube delivering compressed binary capsules at supersonic speed between internal offices.',
    viz: {
      component: 'TwoPanelCompare',
      steps: [
        {
          label: 'REST vs GraphQL comparison',
          caption: 'REST exposes fixed resource endpoints. GraphQL lets clients declare exact shape and fields in a single query.',
          highlights: [tpc({
            left: {
              title: 'REST (Resource Endpoints)',
              color: 'emerald',
              activeRow: 0,
              rows: [
                { label: 'Payload', value: 'Fixed schema per endpoint (over/under-fetching risk)' },
                { label: 'Caching', value: 'Simple native HTTP URL & ETag caching' },
                { label: 'Tooling', value: 'Universal browser support, curl, Postman' },
                { label: 'Best for', value: 'Public developer APIs, standard CRUD web services' },
              ],
            },
            right: {
              title: 'GraphQL (Declarative Query)',
              color: 'amber',
              activeRow: 0,
              rows: [
                { label: 'Payload', value: 'Client requests exact fields (zero over-fetching)' },
                { label: 'Requests', value: 'Multiple resources fetched in single round trip' },
                { label: 'Caching', value: 'Complex — all POSTs hit single /graphql endpoint' },
                { label: 'Best for', value: 'Complex mobile & dashboard apps with nested relations' },
              ],
            },
            badge: { side: 'left', text: 'HTTP Cacheable', color: 'emerald' },
          })],
        },
        {
          label: 'gRPC for Internal Microservices',
          caption: 'gRPC uses Protocol Buffers binary serialization over HTTP/2 for ultra-fast, strictly typed microservice RPC.',
          highlights: [tpc({
            left: {
              title: 'GraphQL / REST (Text-based)',
              color: 'amber',
              activeRow: 1,
              rows: [
                { label: 'Serialization', value: 'JSON text parsing (high CPU on large payloads)' },
                { label: 'Transport', value: 'HTTP/1.1 or HTTP/2' },
                { label: 'Typing', value: 'Schema or TypeScript types maintained in code' },
              ],
            },
            right: {
              title: 'gRPC (Binary Protocol Buffers)',
              color: 'rose',
              activeRow: 1,
              rows: [
                { label: 'Serialization', value: 'Protobuf binary — 7–10x faster than JSON' },
                { label: 'Transport', value: 'HTTP/2 multiplexed streaming natively' },
                { label: 'Typing', value: 'Strict .proto contract compiled to any language' },
              ],
            },
            badge: { side: 'right', text: '7x Faster Serialization', color: 'rose' },
          })],
        },
      ],
    },
    snippet: {
      lang: 'ts',
      code: `// Comparison of query paradigms:

// 1. REST (Over-fetches: returns 50 unused fields)
// GET /api/users/42

// 2. GraphQL (Queries exact fields in 1 round trip)
/*
  query {
    user(id: "42") {
      name
      orders(limit: 5) { id total }
    }
  }
*/

// 3. gRPC (Compile-time protobuf contract over HTTP/2)
// const user = await userClient.getUser({ id: '42' })`,
      highlights: { 4: 'emerald', 9: 'amber', 10: 'amber', 16: 'rose' },
    },
    terms: ['graphql', 'rest', 'grpc', 'protobuf', 'over-fetching', 'under-fetching', 'http2-transport'],
    pitfalls: [
      'Adopting GraphQL to "be modern" without DataLoader, triggering devastating N+1 database queries on nested fields.',
      'Allowing arbitrary nested GraphQL queries without query complexity depth limiting, leaving server open to DoS.',
      'Trying to use gRPC directly in standard web browsers without an intermediate envoy gRPC-web proxy layer.',
    ],
    interview: [
      'What are over-fetching and under-fetching, and how does GraphQL address them?',
      'Why is gRPC significantly faster than REST over JSON for internal inter-service communication?',
    ],
    next: ['rest-principles', 'microservices-vs-monolith', 'api-gateway-retries-circuit-breaker'],
  },

  // ─── 26. Event Loop Deep Dive (Original Phase 1 concept) ────────────────────
  {
    id: 'event-loop-deep-dive',
    level: 3,
    order: 26,
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
    next: ['event-loop-phases-deep-dive', 'blocking-the-loop', 'cache-aside-pattern'],
    simple: {
      oneLiner: 'One waiter rapidly taking orders while the kitchen cooks.',
      mentalModel: 'A busy chef handles food while a buzzer notifies the waiter when a dish is ready.',
      snippet: {
        lang: 'js',
        code: `console.log('1: Order food')
setTimeout(() => console.log('3: Food ready!'), 0)
console.log('2: Pour glass of water')`,
        highlights: { 1: 'emerald', 2: 'amber', 3: 'emerald' },
      },
    },
  },

  // ─── 27. Cache-Aside Pattern (Original Phase 1 concept) ──────────────────────
  {
    id: 'cache-aside-pattern',
    level: 3,
    order: 27,
    title: 'Cache-Aside Pattern',
    oneLiner: 'Query cache first; on miss, read database and populate cache for subsequent requests.',
    mentalModel:
      'Cache-aside is like a personal assistant who remembers your coffee order. First visit, they ask the barista (DB). Every visit after, they just hand you your drink from their notes (cache). If the coffee shop changes the recipe (data update), you tell your assistant to forget the old note (invalidate).',
    viz: {
      component: 'CacheFlow',
      steps: [
        {
          label: 'Request arrives',
          caption: 'Client requests GET /products/42. The application checks Redis before touching MongoDB.',
          highlights: [cf({ stage: 'check', keyName: 'product:42' })],
        },
        {
          label: 'Cache check (Redis GET)',
          caption: 'App calls redis.get("product:42"). If data exists → Cache Hit. Return immediately, skip DB entirely.',
          highlights: [cf({ stage: 'hit', cacheStatus: 'HIT', cachedValue: 'Product 42 JSON' })],
        },
        {
          label: 'Cache miss → DB query',
          caption: 'Key not found in Redis. App falls back to MongoDB: Product.findById(42). This is the slow path.',
          highlights: [cf({ stage: 'fetch_db', cacheStatus: 'MISS', dbValue: 'Product 42 Doc' })],
        },
        {
          label: 'Populate cache',
          caption: 'After DB returns data, app calls redis.set("product:42", data, { EX: 3600 }). TTL = 1 hour.',
          highlights: [cf({ stage: 'store_cache', cacheStatus: 'HIT', cachedValue: 'Saved in Redis' })],
        },
        {
          label: 'Return response',
          caption: 'Data is returned to client. Next request for the same product hits the cache (sub-millisecond).',
          highlights: [cf({ stage: 'hit', cacheStatus: 'HIT', cachedValue: 'Sub-millisecond read' })],
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
    next: ['redis-caching', 'cache-invalidation-strategies', 'event-loop-deep-dive'],
    simple: {
      oneLiner: 'Check your pocket first before walking to the bookstore.',
      mentalModel: "Keep your favorite pen on your desk so you don't go to the supply closet every time.",
      snippet: {
        lang: 'js',
        code: `// Check pocket first
let item = cache.get(id)
if (!item) {
  item = database.find(id) // closet (slow)
  cache.set(id, item)      // keep in pocket
}`,
        highlights: { 2: 'emerald', 4: 'amber', 5: 'emerald' },
      },
    },
  },
]
