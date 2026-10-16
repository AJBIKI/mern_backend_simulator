import type { GlossaryTerm } from './types'

export const glossary: GlossaryTerm[] = [
  // HTTP & Request / Response Basics
  {
    id: 'http',
    term: 'HTTP',
    definition: 'HyperText Transfer Protocol — the standard protocol for sending requests and responses between client and server across the web.',
  },
  {
    id: 'request',
    term: 'Request',
    definition: 'A message sent by a client to a server asking for data or triggering an action, containing a method, URL, headers, and optional body.',
  },
  {
    id: 'response',
    term: 'Response',
    definition: 'The message sent by the server back to the client containing an HTTP status code, headers, and optional payload.',
  },
  {
    id: 'method',
    term: 'HTTP Method',
    definition: 'The request verb specifying the desired action: GET (retrieve), POST (create), PUT (replace), PATCH (update), DELETE (remove).',
  },
  {
    id: 'status-code',
    term: 'Status Code',
    definition: 'A 3-digit standardized number communicating the outcome: 2xx success, 3xx redirect, 4xx client error, 5xx server error.',
  },
  {
    id: 'header',
    term: 'Header',
    definition: 'Key-value metadata attached to HTTP requests and responses controlling auth, content negotiation, caching, and compression.',
  },
  {
    id: 'body',
    term: 'Body',
    definition: 'The payload data carried inside an HTTP request or response, commonly formatted as JSON, form data, or binary.',
  },
  {
    id: 'url',
    term: 'URL',
    definition: 'Uniform Resource Locator — the unique web address pinpointing a resource: protocol scheme, hostname, port, path, and query.',
  },
  {
    id: 'query-string',
    term: 'Query String',
    definition: 'Key-value pairs appended after `?` in a URL used for optional parameters such as searching, filtering, and pagination.',
  },
  {
    id: '2xx',
    term: '2xx Success',
    definition: 'Status code range indicating the client\'s request was successfully received, understood, and accepted by the server.',
  },
  {
    id: '3xx',
    term: '3xx Redirect',
    definition: 'Status code range telling the client that further action or following a new URI is needed to fulfill the request.',
  },
  {
    id: '4xx',
    term: '4xx Client Error',
    definition: 'Status code range indicating a problem caused by the client, such as malformed syntax, unauthorized access, or missing resource.',
  },
  {
    id: '5xx',
    term: '5xx Server Error',
    definition: 'Status code range indicating the server failed to fulfill an apparently valid request due to an unhandled internal exception or outage.',
  },
  {
    id: 'redirect',
    term: 'Redirect',
    definition: 'The process where a server responds with a 3xx code and Location header telling the client to repeat the request at another URL.',
  },
  {
    id: 'idempotency',
    term: 'Idempotency',
    definition: 'Property of an operation where making identical requests multiple times produces the exact same server state as a single request.',
  },
  {
    id: 'safe-method',
    term: 'Safe Method',
    definition: 'An HTTP method (such as GET or HEAD) that only retrieves data and produces zero side effects on the server state.',
  },
  {
    id: 'post',
    term: 'POST Method',
    definition: 'HTTP method used to submit data to the server to create a subordinate resource or trigger processing; neither safe nor idempotent.',
  },
  {
    id: 'put',
    term: 'PUT Method',
    definition: 'Idempotent HTTP method used to create or replace the entire target resource with the uploaded request payload.',
  },

  // Client-Server Architecture & Networking
  {
    id: 'client',
    term: 'Client',
    definition: 'The consuming device or software (such as a web browser or mobile app) that initiates requests to a remote server.',
  },
  {
    id: 'server',
    term: 'Server',
    definition: 'A computer program or host that listens for incoming client requests, executes logic, accesses databases, and serves responses.',
  },
  {
    id: 'protocol',
    term: 'Protocol',
    definition: 'A standardized system of rules and message formats enabling computers to communicate accurately across networks.',
  },
  {
    id: 'tcp',
    term: 'TCP',
    definition: 'Transmission Control Protocol — a reliable, connection-oriented transport protocol ensuring ordered, loss-free byte transmission.',
  },
  {
    id: 'port',
    term: 'Port',
    definition: 'A 16-bit numerical socket identifier routing incoming network packets to a specific application process on the host.',
  },
  {
    id: 'dns',
    term: 'DNS',
    definition: 'Domain Name System — the distributed internet directory that translates human-readable hostnames into machine-routable IP addresses.',
  },
  {
    id: 'ip-address',
    term: 'IP Address',
    definition: 'A unique numerical label (IPv4 or IPv6) assigned to every device connected to a computer network for routing and location.',
  },
  {
    id: 'tls',
    term: 'TLS',
    definition: 'Transport Layer Security — cryptographic protocol securing communications over computer networks via encryption and server certificates.',
  },
  {
    id: 'handshake',
    term: 'Handshake',
    definition: 'An automated negotiation sequence (such as TCP SYN-ACK or TLS negotiation) establishing connection parameters before data transfer.',
  },

  // Node.js & Asynchronous Execution
  {
    id: 'nodejs',
    term: 'Node.js',
    definition: 'An open-source, cross-platform JavaScript runtime built on Chrome\'s V8 engine that runs JS outside browser environments.',
  },
  {
    id: 'runtime',
    term: 'Runtime',
    definition: 'The execution environment providing system libraries, memory management, and APIs required to run programs during execution.',
  },
  {
    id: 'v8',
    term: 'V8 Engine',
    definition: 'Google\'s high-performance open-source JavaScript and WebAssembly engine written in C++, compiling JS directly to native machine code.',
  },
  {
    id: 'libuv',
    term: 'libuv',
    definition: 'A multi-platform C library providing asynchronous I/O abstractions, non-blocking network polling, and a background worker thread pool.',
  },
  {
    id: 'thread-pool',
    term: 'Thread Pool',
    definition: 'A managed collection of background worker threads in libuv used to execute blocking operations like file I/O, DNS, and crypto.',
  },
  {
    id: 'event-loop',
    term: 'Event Loop',
    definition: 'The core scheduling loop in Node.js coordinating callbacks, async events, and phase transitions on a single JavaScript thread.',
  },
  {
    id: 'call-stack',
    term: 'Call Stack',
    definition: 'A Last-In-First-Out data structure tracking currently executing functions; JavaScript executes one stack frame at a time.',
  },
  {
    id: 'microtask-queue',
    term: 'Microtask Queue',
    definition: 'High-priority queue containing Promise callbacks and queueMicrotask; completely drained after every stack frame or event phase.',
  },
  {
    id: 'macrotask-queue',
    term: 'Macrotask Queue',
    definition: 'Queue holding scheduled timer callbacks, setImmediate jobs, and external I/O events scheduled for subsequent loop cycles.',
  },
  {
    id: 'timers-phase',
    term: 'Timers Phase',
    definition: 'The initial phase of the Node.js event loop executing callbacks scheduled by setTimeout and setInterval whose thresholds passed.',
  },
  {
    id: 'poll-phase',
    term: 'Poll Phase',
    definition: 'Central event loop phase where Node.js retrieves new I/O events, executes blocking I/O callbacks, and pauses if idle.',
  },
  {
    id: 'callback',
    term: 'Callback',
    definition: 'A function passed into another function as an argument to be invoked once an asynchronous background operation completes.',
  },
  {
    id: 'callback-hell',
    term: 'Callback Hell',
    definition: 'Anti-pattern of excessive deeply nested callbacks causing pyramid-shaped, unreadable code and complicated error handling.',
  },
  {
    id: 'promise',
    term: 'Promise',
    definition: 'An object representing the eventual completion (fulfillment) or failure (rejection) of an asynchronous operation and its value.',
  },
  {
    id: 'async-await',
    term: 'async/await',
    definition: 'Syntactic sugar over Promises enabling developers to write non-blocking asynchronous code in a clean, synchronous-looking style.',
  },
  {
    id: 'try-catch',
    term: 'try/catch',
    definition: 'Control flow block used to catch and handle runtime exceptions and rejected promises without crashing the running process.',
  },
  {
    id: 'promise-rejection',
    term: 'Unhandled Rejection',
    definition: 'An event triggered when a Promise is rejected without an attached .catch() handler or enclosing try/catch block.',
  },
  {
    id: 'stack-trace',
    term: 'Stack Trace',
    definition: 'A sequential report of active execution frames showing the file names, functions, and line numbers leading up to an error.',
  },

  // JavaScript Modules & Package Management
  {
    id: 'cjs',
    term: 'CommonJS (CJS)',
    definition: 'Legacy module system in Node.js using synchronous require() calls and module.exports objects to import and expose functionality.',
  },
  {
    id: 'esm',
    term: 'ES Modules (ESM)',
    definition: 'The ECMAScript official standard module system utilizing static import and export declarations allowing tree-shaking.',
  },
  {
    id: 'require',
    term: 'require()',
    definition: 'The CommonJS function used to synchronously load and evaluate an external module file or npm package at runtime.',
  },
  {
    id: 'module-exports',
    term: 'module.exports',
    definition: 'The special object in CommonJS files that determines what values or functions are exposed to other files calling require().',
  },
  {
    id: 'import',
    term: 'import',
    definition: 'ESM keyword used to statically or dynamically bring in exported bindings, components, or functions from other modules.',
  },
  {
    id: 'export',
    term: 'export',
    definition: 'ESM keyword used to expose functions, objects, or primitive values from a module so other files can consume them.',
  },
  {
    id: 'tree-shaking',
    term: 'Tree-Shaking',
    definition: 'Static analysis optimization performed by bundlers that strips out unused code and unreferenced exports from final bundles.',
  },
  {
    id: 'npm',
    term: 'npm',
    definition: 'Node Package Manager — the default CLI tool and registry for publishing, installing, and managing JavaScript dependencies.',
  },
  {
    id: 'package-json',
    term: 'package.json',
    definition: 'The manifest file defining metadata, executable scripts, dependencies, author details, and config for a Node.js project.',
  },
  {
    id: 'node-modules',
    term: 'node_modules',
    definition: 'The directory where npm places downloaded and extracted package files, binaries, and nested transitive dependencies.',
  },
  {
    id: 'lockfile',
    term: 'Lockfile',
    definition: 'package-lock.json — records the exact resolved dependency versions and integrity hashes for deterministic installs.',
  },
  {
    id: 'dependency',
    term: 'Dependency',
    definition: 'A third-party library or package listed under dependencies that is strictly required for the application to function in production.',
  },
  {
    id: 'dev-dependency',
    term: 'DevDependency',
    definition: 'A package required solely for local development and build tooling (such as compilers, linters, and test runners).',
  },
  {
    id: 'semver',
    term: 'SemVer',
    definition: 'Semantic Versioning (MAJOR.MINOR.PATCH) rules defining how breaking changes, new features, and bug fixes increment numbers.',
  },

  // Express Framework & Middleware
  {
    id: 'express',
    term: 'Express',
    definition: 'Fast, minimalist web framework for Node.js providing a robust set of routing and middleware features for APIs.',
  },
  {
    id: 'app-listen',
    term: 'app.listen()',
    definition: 'Express method that binds and listens for incoming connections on a specified network host and port number.',
  },
  {
    id: 'middleware',
    term: 'Middleware',
    definition: 'Functions with access to req, res, and next that execute in a sequential pipeline to process, validate, or transform requests.',
  },
  {
    id: 'global-middleware',
    term: 'Global Middleware',
    definition: 'Middleware mounted with app.use() without path restrictions that executes on every single incoming HTTP request.',
  },
  {
    id: 'next',
    term: 'next()',
    definition: 'The continuation callback passed to Express middleware that passes execution control to the next handler in the stack.',
  },
  {
    id: 'pipeline',
    term: 'Pipeline',
    definition: 'An ordered sequence of middleware handlers processing a request step-by-step from arrival through response generation.',
  },
  {
    id: 'route-handler',
    term: 'Route Handler',
    definition: 'The final middleware function attached to a route path responsible for generating and sending the HTTP response.',
  },
  {
    id: 'router',
    term: 'Router',
    definition: 'Express.Router instance acting as an isolated mini-app capable of performing routing and mounting middleware independently.',
  },
  {
    id: 'error-middleware',
    term: 'Error Middleware',
    definition: 'Special 4-parameter Express middleware (err, req, res, next) invoked whenever next(err) is called or an error is thrown.',
  },
  {
    id: 'http-error',
    term: 'HTTP Error',
    definition: 'An operational or unexpected server error accompanied by an appropriate 4xx or 5xx status code and description.',
  },
  {
    id: 'url-param',
    term: 'URL Parameter',
    definition: 'Named route segments denoted by a colon (e.g., :id) captured from the request path and made available on req.params.',
  },
  {
    id: 'wildcard',
    term: 'Wildcard Route',
    definition: 'A catch-all route pattern (such as *) that matches any path, typically placed last to serve 404 responses or fallback pages.',
  },

  // Body Parsing & Content Types
  {
    id: 'body-parser',
    term: 'Body Parser',
    definition: 'Middleware (like express.json) that buffers the incoming raw request stream and parses it into a usable JavaScript object.',
  },
  {
    id: 'content-type',
    term: 'Content-Type',
    definition: 'HTTP header indicating the media type (MIME type) of the payload, informing the receiver how to parse the request body.',
  },
  {
    id: 'json',
    term: 'JSON',
    definition: 'JavaScript Object Notation — lightweight, language-agnostic text format widely used for structuring and exchanging API data.',
  },
  {
    id: 'urlencoded',
    term: 'URL-Encoded',
    definition: 'Data format typically sent by HTML forms where keys and values are encoded in key=value pairs joined with ampersands.',
  },
  {
    id: 'request-body',
    term: 'Request Body',
    definition: 'The data payload sent along with POST, PUT, or PATCH requests, accessible via req.body once parsed by middleware.',
  },

  // REST API Principles & Architecture
  {
    id: 'rest',
    term: 'REST',
    definition: 'Representational State Transfer — an architectural style for networked hypermedia systems emphasizing statelessness and standard HTTP.',
  },
  {
    id: 'resource',
    term: 'Resource',
    definition: 'Any conceptual entity or object exposed by an API (e.g., /users, /orders) identifiable by a unique, stable URI.',
  },
  {
    id: 'stateless',
    term: 'Stateless',
    definition: 'Core architectural constraint where the server stores no client session context; each request carries complete auth and state.',
  },
  {
    id: 'uniform-interface',
    term: 'Uniform Interface',
    definition: 'REST constraint requiring standard methods, predictable URI conventions, and self-descriptive representations across endpoints.',
  },
  {
    id: 'rpc',
    term: 'RPC',
    definition: 'Remote Procedure Call — an API design approach where clients call named action procedures (e.g., /createUser) instead of resource URIs.',
  },
  {
    id: 'endpoint',
    term: 'Endpoint',
    definition: 'A specific URL location on a web server combined with an HTTP method where an API client can access or manipulate a resource.',
  },

  // Configuration & Security
  {
    id: 'env-var',
    term: 'Environment Variable',
    definition: 'Key-value variable set in the operating system environment used to configure application behavior and secrets without code changes.',
  },
  {
    id: 'dotenv',
    term: 'dotenv',
    definition: 'Popular zero-dependency npm package that loads environment variables from a root .env file into the process.env runtime object.',
  },
  {
    id: 'process-env',
    term: 'process.env',
    definition: 'A global object provided by Node.js exposing the user environment variables active for the current running process.',
  },
  {
    id: 'gitignore',
    term: '.gitignore',
    definition: 'A configuration file telling Git which intentionally untracked files, directories, or secret files to ignore from version control.',
  },
  {
    id: 'config',
    term: 'Configuration',
    definition: 'Settings and parameters that define how an application executes across different deployment environments (dev, staging, prod).',
  },
  {
    id: 'secret',
    term: 'Secret',
    definition: 'Sensitive credentials such as private API keys, database connection strings, and encryption passwords requiring strict protection.',
  },
  {
    id: 'cors',
    term: 'CORS',
    definition: 'Cross-Origin Resource Sharing — HTTP header-based security mechanism allowing servers to specify which external origins can read resources.',
  },
  {
    id: 'preflight',
    term: 'Preflight Request',
    definition: 'An automatic OPTIONS request sent by browsers prior to complex cross-origin requests to check permissions with the target server.',
  },
  {
    id: 'origin',
    term: 'Origin',
    definition: 'The combination of protocol scheme, domain hostname, and port number identifying the origin location of a web request.',
  },
  {
    id: 'access-control-headers',
    term: 'Access-Control-* Headers',
    definition: 'Response headers (such as Access-Control-Allow-Origin) sent by servers to instruct browsers whether cross-origin access is permitted.',
  },
  {
    id: 'same-origin-policy',
    term: 'Same-Origin Policy',
    definition: 'Critical browser security model restricting scripts on one origin from accessing or reading resources loaded from a different origin.',
  },
  {
    id: 'options-method',
    term: 'OPTIONS Method',
    definition: 'An HTTP method used by clients to query the communication options and CORS policies permitted by a server for a target URL.',
  },

  // MongoDB & Mongoose
  {
    id: 'mongodb',
    term: 'MongoDB',
    definition: 'A scalable, distributed NoSQL document database storing records as flexible, JSON-like BSON data structures.',
  },
  {
    id: 'document',
    term: 'Document',
    definition: 'A single record in a MongoDB collection composed of field-and-value pairs, analogous to a JSON object or a relational database row.',
  },
  {
    id: 'collection',
    term: 'Collection',
    definition: 'A grouping of MongoDB documents inside a database, analogous to a table in a relational database but with dynamic schema support.',
  },
  {
    id: 'bson',
    term: 'BSON',
    definition: 'Binary JSON — binary-encoded serialization format used by MongoDB to store documents and perform remote procedure calls.',
  },
  {
    id: 'objectid',
    term: 'ObjectId',
    definition: 'A 12-byte BSON identifier used as the default unique primary key (`_id`) for every document created in MongoDB.',
  },
  {
    id: 'crud',
    term: 'CRUD',
    definition: 'Create, Read, Update, Delete — the four fundamental persistent storage operations performed on database records.',
  },
  {
    id: 'embed',
    term: 'Embedded Document',
    definition: 'Design pattern where related sub-documents or arrays are stored directly inside a parent document for fast single-query retrieval.',
  },
  {
    id: 'reference',
    term: 'Document Reference',
    definition: 'Design pattern where documents store ObjectIds pointing to documents in another collection, resolved via Mongoose populate().',
  },
  {
    id: 'mongoose',
    term: 'Mongoose',
    definition: 'An Object Data Modeling (ODM) library for MongoDB and Node.js providing strict schema validation, models, and middleware hooks.',
  },
  {
    id: 'schema',
    term: 'Schema',
    definition: 'A Mongoose configuration object mapping out document fields, types, default values, validators, and custom instance methods.',
  },
  {
    id: 'model',
    term: 'Model',
    definition: 'A compiled Mongoose constructor class based on a Schema providing an interface to query, create, update, and delete collection documents.',
  },
  {
    id: 'validation',
    term: 'Validation',
    definition: 'Verification logic executed before saving documents into MongoDB ensuring required fields, data types, and custom constraints match.',
  },
  {
    id: 'populate',
    term: 'populate()',
    definition: 'Mongoose method that automatically replaces referenced ObjectIds in a document with the actual populated documents from other collections.',
  },

  // JWT & Authentication (from Level 2)
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
    definition: 'Base64url-encoded JSON containing claims — data about the user like sub, role, iat (issued-at), exp (expiry).',
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

  // Database Indexing (from Level 2)
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

  // Caching & Redis (from Level 3)
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
