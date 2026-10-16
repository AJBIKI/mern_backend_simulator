import type { GlossaryTerm } from './types'

export const glossary: GlossaryTerm[] = [
  {
    "id": "16mb-limit",
    "term": "16MB Document Limit",
    "definition": "The maximum BSON document size enforced by MongoDB to prevent single documents from consuming excessive RAM during queries.",
    "concepts": [
      "embedding-vs-referencing"
    ]
  },
  {
    "id": "2xx",
    "term": "2xx Success",
    "definition": "Status code range indicating the client's request was successfully received, understood, and accepted by the server.",
    "concepts": [
      "http-response-status-codes"
    ]
  },
  {
    "id": "304-not-modified",
    "term": "304 Not Modified",
    "definition": "HTTP status code indicating the requested resource has not changed since the version specified in If-None-Match or If-Modified-Since.",
    "concepts": [
      "http-caching-etag"
    ]
  },
  {
    "id": "3xx",
    "term": "3xx Redirect",
    "definition": "Status code range telling the client that further action or following a new URI is needed to fulfill the request.",
    "concepts": [
      "http-response-status-codes"
    ]
  },
  {
    "id": "429",
    "term": "429 Too Many Requests",
    "definition": "HTTP status code sent when a client has exceeded their allowed rate limit quota within a designated time window.",
    "concepts": [
      "rate-limiting"
    ]
  },
  {
    "id": "4xx",
    "term": "4xx Client Error",
    "definition": "Status code range indicating a problem caused by the client, such as malformed syntax, unauthorized access, or missing resource.",
    "concepts": [
      "http-response-status-codes"
    ]
  },
  {
    "id": "5xx",
    "term": "5xx Server Error",
    "definition": "Status code range indicating the server failed to fulfill an apparently valid request due to an unhandled internal exception or outage.",
    "concepts": [
      "http-response-status-codes"
    ]
  },
  {
    "id": "access-control-headers",
    "term": "Access-Control-* Headers",
    "definition": "Response headers (such as Access-Control-Allow-Origin) sent by servers to instruct browsers whether cross-origin access is permitted.",
    "concepts": [
      "cors-preflight"
    ]
  },
  {
    "id": "access-token",
    "term": "Access Token",
    "definition": "A short-lived credential (typically a JWT) presented by clients in the Authorization header to access protected resources.",
    "concepts": [
      "access-refresh-tokens"
    ]
  },
  {
    "id": "accumulators",
    "term": "Aggregation Accumulators",
    "definition": "Operators such as $sum, $avg, and $push used within $group stages to compute summary metrics across document sets.",
    "concepts": [
      "aggregation-pipeline"
    ]
  },
  {
    "id": "acid",
    "term": "ACID Guarantees",
    "definition": "Atomicity, Consistency, Isolation, and Durability — properties ensuring database transactions process reliably without corruption.",
    "concepts": [
      "transactions-and-sessions"
    ]
  },
  {
    "id": "aggregation-pipeline",
    "term": "Aggregation Pipeline",
    "definition": "A multi-stage document processing framework in MongoDB that filters, reshapes, groups, and projects collection data.",
    "concepts": [
      "populate-vs-lookup",
      "aggregation-pipeline"
    ]
  },
  {
    "id": "app-error",
    "term": "AppError",
    "definition": "A custom operational error class extending standard Error, adding HTTP status codes and an isOperational boolean flag.",
    "concepts": [
      "centralized-error-handling",
      "operational-vs-programmer-errors"
    ]
  },
  {
    "id": "app-listen",
    "term": "app.listen()",
    "definition": "Express method that binds and listens for incoming connections on a specified network host and port number.",
    "concepts": [
      "express-bootstrapping"
    ]
  },
  {
    "id": "async-await",
    "term": "async/await",
    "definition": "Syntactic sugar over Promises enabling developers to write non-blocking asynchronous code in a clean, synchronous-looking style.",
    "concepts": [
      "callbacks-promises-async"
    ]
  },
  {
    "id": "atomicity",
    "term": "Atomicity",
    "definition": "The all-or-nothing transaction property guaranteeing that either all database modifications succeed, or none take effect.",
    "concepts": [
      "transactions-and-sessions"
    ]
  },
  {
    "id": "authentication",
    "term": "Authentication (AuthN)",
    "definition": "The verification process of confirming the identity of a client or user through credentials, tokens, or biometric proof.",
    "concepts": [
      "auth-middleware-rbac"
    ]
  },
  {
    "id": "authorization",
    "term": "Authorization (AuthZ)",
    "definition": "The security process of checking whether an authenticated user has the necessary permissions or roles to execute an action.",
    "concepts": [
      "auth-middleware-rbac"
    ]
  },
  {
    "id": "b-tree",
    "term": "B-Tree",
    "definition": "The balanced tree data structure MongoDB uses for indexes. Keeps data sorted and allows logarithmic-time lookups.",
    "concepts": [
      "compound-index-esr-rule",
      "indexing-collscan-ixscan"
    ]
  },
  {
    "id": "bad-request",
    "term": "400 Bad Request",
    "definition": "HTTP response code sent when the server cannot process a request due to client error, invalid syntax, or schema violations.",
    "concepts": [
      "input-validation-zod"
    ]
  },
  {
    "id": "bcrypt",
    "term": "bcrypt",
    "definition": "An adaptive, key-stretching password-hashing function based on the Blowfish cipher, designed to resist brute-force hardware attacks.",
    "concepts": [
      "hashing-and-salting"
    ]
  },
  {
    "id": "bearer-token",
    "term": "Bearer Token",
    "definition": "Auth scheme where the client sends `Authorization: Bearer <token>` in every request header.",
    "concepts": [
      "access-refresh-tokens",
      "auth-middleware-rbac",
      "jwt-anatomy"
    ]
  },
  {
    "id": "body",
    "term": "Body",
    "definition": "The payload data carried inside an HTTP request or response, commonly formatted as JSON, form data, or binary.",
    "concepts": [
      "http-request-anatomy"
    ]
  },
  {
    "id": "body-parser",
    "term": "Body Parser",
    "definition": "Middleware (like express.json) that buffers the incoming raw request stream and parses it into a usable JavaScript object.",
    "concepts": [
      "body-parsing-json"
    ]
  },
  {
    "id": "boilerplate",
    "term": "Boilerplate Code",
    "definition": "Repetitive sections of code that must be included in many places with little or no alteration, often reduced via wrappers.",
    "concepts": [
      "async-error-wrapper"
    ]
  },
  {
    "id": "brute-force",
    "term": "Brute-Force Attack",
    "definition": "An automated trial-and-error attack attempting thousands of credential combinations until the correct password or key is found.",
    "concepts": [
      "rate-limiting"
    ]
  },
  {
    "id": "bson",
    "term": "BSON",
    "definition": "Binary JSON — binary-encoded serialization format used by MongoDB to store documents and perform remote procedure calls.",
    "concepts": [
      "mongodb-basics"
    ]
  },
  {
    "id": "business-logic",
    "term": "Business Logic",
    "definition": "The core domain rules, computations, and workflows governing how application data is created, transformed, and exchanged.",
    "concepts": [
      "controller-vs-service-vs-model"
    ]
  },
  {
    "id": "cache",
    "term": "Cache",
    "definition": "A fast-access storage layer (usually in-memory, e.g. Redis) that stores results of expensive operations for quick re-use.",
    "concepts": [
      "cache-aside-pattern"
    ]
  },
  {
    "id": "cache-aside",
    "term": "Cache-Aside",
    "definition": "Read pattern: app checks cache first; on miss, fetches from DB and populates cache. Application controls cache population.",
    "concepts": [
      "cache-aside-pattern"
    ]
  },
  {
    "id": "cache-control",
    "term": "Cache-Control Header",
    "definition": "HTTP header defining caching policies (max-age, no-cache, no-store, public, private) for browsers and intermediary proxies.",
    "concepts": [
      "http-caching-etag"
    ]
  },
  {
    "id": "cache-hit",
    "term": "Cache Hit",
    "definition": "When the requested data is found in the cache — no DB query needed, response is instant.",
    "concepts": [
      "cache-aside-pattern"
    ]
  },
  {
    "id": "cache-miss",
    "term": "Cache Miss",
    "definition": "When data is NOT in cache — the app must fall back to the database and then store the result in cache.",
    "concepts": [
      "cache-aside-pattern"
    ]
  },
  {
    "id": "call-stack",
    "term": "Call Stack",
    "definition": "A Last-In-First-Out data structure tracking currently executing functions; JavaScript executes one stack frame at a time.",
    "concepts": [
      "event-loop-intro",
      "event-loop-deep-dive"
    ]
  },
  {
    "id": "callback",
    "term": "Callback",
    "definition": "A function passed into another function as an argument to be invoked once an asynchronous background operation completes.",
    "concepts": [
      "callbacks-promises-async"
    ]
  },
  {
    "id": "callback-hell",
    "term": "Callback Hell",
    "definition": "Anti-pattern of excessive deeply nested callbacks causing pyramid-shaped, unreadable code and complicated error handling.",
    "concepts": [
      "callbacks-promises-async"
    ]
  },
  {
    "id": "catch-async",
    "term": "catchAsync Utility",
    "definition": "A higher-order wrapper function wrapping async Express controllers to catch rejected promises and pipe them to next(err).",
    "concepts": [
      "async-error-wrapper"
    ]
  },
  {
    "id": "centralized-error",
    "term": "Centralized Error Handling",
    "definition": "An architectural pattern funneling all application exceptions into a single global middleware handler for consistent logging and responses.",
    "concepts": [
      "centralized-error-handling"
    ]
  },
  {
    "id": "cjs",
    "term": "CommonJS (CJS)",
    "definition": "Legacy module system in Node.js using synchronous require() calls and module.exports objects to import and expose functionality.",
    "concepts": [
      "modules-cjs-vs-esm"
    ]
  },
  {
    "id": "claim",
    "term": "Claim",
    "definition": "A key-value pair inside a JWT payload asserting something about the user or token, e.g. `{ \"role\": \"admin\" }`.",
    "concepts": [
      "jwt-anatomy"
    ]
  },
  {
    "id": "claims",
    "term": "JWT Claims",
    "definition": "Statements and pieces of metadata encoded inside a JWT payload asserting user identity, expiration times, or granted scopes.",
    "concepts": [
      "auth-middleware-rbac"
    ]
  },
  {
    "id": "client",
    "term": "Client",
    "definition": "The consuming device or software (such as a web browser or mobile app) that initiates requests to a remote server.",
    "concepts": [
      "client-server-model"
    ]
  },
  {
    "id": "collection",
    "term": "Collection",
    "definition": "A grouping of MongoDB documents inside a database, analogous to a table in a relational database but with dynamic schema support.",
    "concepts": [
      "mongodb-basics"
    ]
  },
  {
    "id": "collscan",
    "term": "COLLSCAN",
    "definition": "Collection Scan — MongoDB reads every document in a collection to find matches. O(n) and very slow on large collections.",
    "concepts": [
      "compound-index-esr-rule",
      "indexing-collscan-ixscan"
    ]
  },
  {
    "id": "commit",
    "term": "Transaction Commit",
    "definition": "The final step in a database transaction that saves all staged writes permanently into the database oplog and storage.",
    "concepts": [
      "transactions-and-sessions"
    ]
  },
  {
    "id": "compound-index",
    "term": "Compound Index",
    "definition": "An index on multiple fields, e.g. `{ email: 1, role: 1 }`. Useful when queries filter on multiple fields together.",
    "concepts": [
      "compound-index-esr-rule",
      "indexing-collscan-ixscan"
    ]
  },
  {
    "id": "config",
    "term": "Configuration",
    "definition": "Settings and parameters that define how an application executes across different deployment environments (dev, staging, prod).",
    "concepts": [
      "environment-variables"
    ]
  },
  {
    "id": "content-type",
    "term": "Content-Type",
    "definition": "HTTP header indicating the media type (MIME type) of the payload, informing the receiver how to parse the request body.",
    "concepts": [
      "body-parsing-json"
    ]
  },
  {
    "id": "controller",
    "term": "Controller",
    "definition": "The application component responsible for parsing incoming HTTP requests, validating inputs, and returning formatted HTTP responses.",
    "concepts": [
      "layered-architecture",
      "controller-vs-service-vs-model"
    ]
  },
  {
    "id": "cookies",
    "term": "HTTP Cookies",
    "definition": "Small packets of state data stored in client browsers and automatically sent along with subsequent requests to matching origins.",
    "concepts": [
      "cookies-security-flags"
    ]
  },
  {
    "id": "cors",
    "term": "CORS",
    "definition": "Cross-Origin Resource Sharing — HTTP header-based security mechanism allowing servers to specify which external origins can read resources.",
    "concepts": [
      "cors-preflight"
    ]
  },
  {
    "id": "cost-factor",
    "term": "Bcrypt Cost Factor",
    "definition": "An integer parameter (work factor) determining the number of hashing rounds (2^N), tuning computational difficulty over time.",
    "concepts": [
      "hashing-and-salting"
    ]
  },
  {
    "id": "crud",
    "term": "CRUD",
    "definition": "Create, Read, Update, Delete — the four fundamental persistent storage operations performed on database records.",
    "concepts": [
      "mongodb-basics"
    ]
  },
  {
    "id": "csp",
    "term": "Content Security Policy (CSP)",
    "definition": "An HTTP response header restricting the sources from which scripts, images, styles, and other resources can be loaded by browsers.",
    "concepts": [
      "security-headers-injection"
    ]
  },
  {
    "id": "csrf",
    "term": "Cross-Site Request Forgery (CSRF)",
    "definition": "An attack forcing an authenticated user's browser to send unauthorized forged requests to a vulnerable application via ambient cookies.",
    "concepts": [
      "cookies-security-flags"
    ]
  },
  {
    "id": "cursor-pagination",
    "term": "Cursor-Based Pagination",
    "definition": "A high-performance pagination technique utilizing unique, indexed pointers (_id or timestamp) rather than counting offset records.",
    "concepts": [
      "pagination-filter-sort-projection"
    ]
  },
  {
    "id": "ddos",
    "term": "DDoS Attack",
    "definition": "Distributed Denial of Service — an attack flooding server bandwidth or compute capacity from multiple distributed sources.",
    "concepts": [
      "rate-limiting"
    ]
  },
  {
    "id": "denormalization",
    "term": "Denormalization",
    "definition": "The database design strategy of duplicating or embedding data within parent documents to optimize read speed and eliminate joins.",
    "concepts": [
      "embedding-vs-referencing"
    ]
  },
  {
    "id": "dependency",
    "term": "Dependency",
    "definition": "A third-party library or package listed under dependencies that is strictly required for the application to function in production.",
    "concepts": [
      "npm-package-json"
    ]
  },
  {
    "id": "dev-dependency",
    "term": "DevDependency",
    "definition": "A package required solely for local development and build tooling (such as compilers, linters, and test runners).",
    "concepts": [
      "npm-package-json"
    ]
  },
  {
    "id": "dns",
    "term": "DNS",
    "definition": "Domain Name System — the distributed internet directory that translates human-readable hostnames into machine-routable IP addresses.",
    "concepts": [
      "dns-tcp-http-journey"
    ]
  },
  {
    "id": "document",
    "term": "Document",
    "definition": "A single record in a MongoDB collection composed of field-and-value pairs, analogous to a JSON object or a relational database row.",
    "concepts": [
      "mongodb-basics",
      "mongoose-schema-model"
    ]
  },
  {
    "id": "dotenv",
    "term": "dotenv",
    "definition": "Popular zero-dependency npm package that loads environment variables from a root .env file into the process.env runtime object.",
    "concepts": [
      "environment-variables"
    ]
  },
  {
    "id": "embed",
    "term": "Embedded Document",
    "definition": "Design pattern where related sub-documents or arrays are stored directly inside a parent document for fast single-query retrieval.",
    "concepts": [
      "mongodb-basics"
    ]
  },
  {
    "id": "embedding",
    "term": "Document Embedding",
    "definition": "Nesting related subdocuments or arrays directly inside a parent MongoDB document for single-query atomicity and performance.",
    "concepts": [
      "embedding-vs-referencing"
    ]
  },
  {
    "id": "endpoint",
    "term": "Endpoint",
    "definition": "A specific URL location on a web server combined with an HTTP method where an API client can access or manipulate a resource.",
    "concepts": [
      "rest-principles"
    ]
  },
  {
    "id": "env-var",
    "term": "Environment Variable",
    "definition": "Key-value variable set in the operating system environment used to configure application behavior and secrets without code changes.",
    "concepts": [
      "environment-variables"
    ]
  },
  {
    "id": "error-middleware",
    "term": "Error Middleware",
    "definition": "Special 4-parameter Express middleware (err, req, res, next) invoked whenever next(err) is called or an error is thrown.",
    "concepts": [
      "middleware-pipeline",
      "express-bootstrapping",
      "error-handling-101",
      "centralized-error-handling",
      "async-error-wrapper"
    ]
  },
  {
    "id": "esm",
    "term": "ES Modules (ESM)",
    "definition": "The ECMAScript official standard module system utilizing static import and export declarations allowing tree-shaking.",
    "concepts": [
      "modules-cjs-vs-esm"
    ]
  },
  {
    "id": "esr-rule",
    "term": "ESR Rule",
    "definition": "Equality, Sort, Range — the foundational rule of compound index key order ensuring queries satisfy filter and sort in index space.",
    "concepts": [
      "compound-index-esr-rule"
    ]
  },
  {
    "id": "etag",
    "term": "ETag (Entity Tag)",
    "definition": "An HTTP response header containing an identifier or checksum representing a specific version of a resource for cache revalidation.",
    "concepts": [
      "http-caching-etag"
    ]
  },
  {
    "id": "event-loop",
    "term": "Event Loop",
    "definition": "The core scheduling loop in Node.js coordinating callbacks, async events, and phase transitions on a single JavaScript thread.",
    "concepts": [
      "what-is-nodejs",
      "event-loop-intro",
      "event-loop-deep-dive"
    ]
  },
  {
    "id": "explain",
    "term": ".explain()",
    "definition": "MongoDB method that returns the query execution plan, showing whether MongoDB used COLLSCAN or IXSCAN.",
    "concepts": [
      "indexing-collscan-ixscan"
    ]
  },
  {
    "id": "export",
    "term": "export",
    "definition": "ESM keyword used to expose functions, objects, or primitive values from a module so other files can consume them.",
    "concepts": [
      "modules-cjs-vs-esm"
    ]
  },
  {
    "id": "express",
    "term": "Express",
    "definition": "Fast, minimalist web framework for Node.js providing a robust set of routing and middleware features for APIs.",
    "concepts": [
      "express-bootstrapping",
      "routing"
    ]
  },
  {
    "id": "fail-fast",
    "term": "Fail-Fast Principle",
    "definition": "A software design philosophy advocating immediate termination or throwing at the earliest sign of failure to prevent corrupted states.",
    "concepts": [
      "operational-vs-programmer-errors"
    ]
  },
  {
    "id": "fail-safe",
    "term": "Fail-Safe Design",
    "definition": "A system architecture pattern that gracefully degrades or defaults to a secure state when unexpected errors occur.",
    "concepts": [
      "centralized-error-handling"
    ]
  },
  {
    "id": "file-uploads",
    "term": "File Upload Handling",
    "definition": "The process of receiving multipart file streams over HTTP, validating binary types, and persisting to disk or cloud object storage.",
    "concepts": [
      "file-uploads"
    ]
  },
  {
    "id": "filtering",
    "term": "Query Filtering",
    "definition": "Specifying criteria (such as status: 'active') in database operations to limit results to a specific subset of matching documents.",
    "concepts": [
      "pagination-filter-sort-projection"
    ]
  },
  {
    "id": "forbidden",
    "term": "403 Forbidden",
    "definition": "HTTP status code indicating the client is authenticated, but their account role or scope does not permit performing the action.",
    "concepts": [
      "auth-middleware-rbac"
    ]
  },
  {
    "id": "freshness",
    "term": "Cache Freshness",
    "definition": "The determination of whether a cached HTTP response can be served directly without revalidating with the origin server.",
    "concepts": [
      "http-caching-etag"
    ]
  },
  {
    "id": "gitignore",
    "term": ".gitignore",
    "definition": "A configuration file telling Git which intentionally untracked files, directories, or secret files to ignore from version control.",
    "concepts": [
      "environment-variables"
    ]
  },
  {
    "id": "global-middleware",
    "term": "Global Middleware",
    "definition": "Middleware mounted with app.use() without path restrictions that executes on every single incoming HTTP request.",
    "concepts": [
      "express-bootstrapping"
    ]
  },
  {
    "id": "group",
    "term": "$group Stage",
    "definition": "MongoDB aggregation pipeline stage that separates documents into groups according to a specified identifier expression.",
    "concepts": [
      "aggregation-pipeline"
    ]
  },
  {
    "id": "handshake",
    "term": "Handshake",
    "definition": "An automated negotiation sequence (such as TCP SYN-ACK or TLS negotiation) establishing connection parameters before data transfer.",
    "concepts": [
      "dns-tcp-http-journey"
    ]
  },
  {
    "id": "hashing",
    "term": "Cryptographic Hashing",
    "definition": "A one-way mathematical function transforming arbitrary input data into a fixed-length string that cannot be reversed.",
    "concepts": [
      "hashing-and-salting"
    ]
  },
  {
    "id": "header",
    "term": "Header",
    "definition": "Key-value metadata attached to HTTP requests and responses controlling auth, content negotiation, caching, and compression.",
    "concepts": [
      "http-request-anatomy"
    ]
  },
  {
    "id": "helmet",
    "term": "Helmet.js",
    "definition": "Popular Express middleware package that secures applications by automatically configuring essential defensive HTTP response headers.",
    "concepts": [
      "security-headers-injection"
    ]
  },
  {
    "id": "higher-order-function",
    "term": "Higher-Order Function",
    "definition": "A function that accepts one or more functions as arguments or returns a new function as its result.",
    "concepts": [
      "async-error-wrapper"
    ]
  },
  {
    "id": "hsts",
    "term": "HTTP Strict Transport Security (HSTS)",
    "definition": "A security header instructing browsers to interact with the domain exclusively over encrypted HTTPS connections.",
    "concepts": [
      "security-headers-injection"
    ]
  },
  {
    "id": "http",
    "term": "HTTP",
    "definition": "HyperText Transfer Protocol — the standard protocol for sending requests and responses between client and server across the web.",
    "concepts": [
      "http-request-anatomy",
      "client-server-model",
      "dns-tcp-http-journey"
    ]
  },
  {
    "id": "http-caching",
    "term": "HTTP Caching",
    "definition": "The storage and reuse of HTTP response data by browsers, CDNs, and proxies to eliminate redundant network traffic.",
    "concepts": [
      "http-caching-etag"
    ]
  },
  {
    "id": "http-error",
    "term": "HTTP Error",
    "definition": "An operational or unexpected server error accompanied by an appropriate 4xx or 5xx status code and description.",
    "concepts": [
      "error-handling-101"
    ]
  },
  {
    "id": "http-only",
    "term": "httpOnly Flag",
    "definition": "A cookie attribute preventing client-side JavaScript (document.cookie) from accessing the cookie, neutralizing XSS token theft.",
    "concepts": [
      "cookies-security-flags"
    ]
  },
  {
    "id": "idempotency",
    "term": "Idempotency",
    "definition": "Property of an operation where making identical requests multiple times produces the exact same server state as a single request.",
    "concepts": [
      "idempotency-safe-methods"
    ]
  },
  {
    "id": "if-none-match",
    "term": "If-None-Match Header",
    "definition": "A conditional HTTP request header sent by clients carrying an ETag, asking the server to return 304 if the resource is unchanged.",
    "concepts": [
      "http-caching-etag"
    ]
  },
  {
    "id": "import",
    "term": "import",
    "definition": "ESM keyword used to statically or dynamically bring in exported bindings, components, or functions from other modules.",
    "concepts": [
      "modules-cjs-vs-esm"
    ]
  },
  {
    "id": "index",
    "term": "Index",
    "definition": "A sorted data structure (B-Tree) built alongside a collection to speed up queries without scanning every document.",
    "concepts": [
      "indexing-collscan-ixscan"
    ]
  },
  {
    "id": "input-validation",
    "term": "Input Validation",
    "definition": "Verifying that incoming user and client data conforms to expected data types, formats, lengths, and business constraints.",
    "concepts": [
      "input-validation-zod"
    ]
  },
  {
    "id": "integration-testing",
    "term": "Integration Testing",
    "definition": "Testing multiple software modules working together as a group, such as testing HTTP routes with live in-memory databases.",
    "concepts": [
      "testing-unit-vs-integration"
    ]
  },
  {
    "id": "ip-address",
    "term": "IP Address",
    "definition": "A unique numerical label (IPv4 or IPv6) assigned to every device connected to a computer network for routing and location.",
    "concepts": [
      "dns-tcp-http-journey"
    ]
  },
  {
    "id": "ixscan",
    "term": "IXSCAN",
    "definition": "Index Scan — MongoDB walks a B-Tree index to find matching document pointers. O(log n) — dramatically faster than COLLSCAN.",
    "concepts": [
      "compound-index-esr-rule",
      "indexing-collscan-ixscan"
    ]
  },
  {
    "id": "json",
    "term": "JSON",
    "definition": "JavaScript Object Notation — lightweight, language-agnostic text format widely used for structuring and exchanging API data.",
    "concepts": [
      "body-parsing-json"
    ]
  },
  {
    "id": "jwt",
    "term": "JWT",
    "definition": "JSON Web Token — a compact, self-contained string for transmitting claims between parties, split into header.payload.signature.",
    "concepts": [
      "sessions-vs-jwt",
      "jwt-anatomy"
    ]
  },
  {
    "id": "jwt-expiry",
    "term": "JWT Expiration (exp)",
    "definition": "The timestamp claim embedded within a token payload specifying when the token becomes invalid and must be refreshed.",
    "concepts": [
      "access-refresh-tokens"
    ]
  },
  {
    "id": "jwt-header",
    "term": "JWT Header",
    "definition": "Base64url-encoded JSON specifying the token type and signing algorithm, e.g. `{\"alg\":\"HS256\",\"typ\":\"JWT\"}`.",
    "concepts": [
      "jwt-anatomy"
    ]
  },
  {
    "id": "jwt-payload",
    "term": "JWT Payload",
    "definition": "Base64url-encoded JSON containing claims — data about the user like sub, role, iat (issued-at), exp (expiry).",
    "concepts": [
      "jwt-anatomy"
    ]
  },
  {
    "id": "jwt-signature",
    "term": "JWT Signature",
    "definition": "HMAC or RSA hash of header + payload using a secret key. Prevents tampering — changing the payload breaks the signature.",
    "concepts": [
      "jwt-anatomy"
    ]
  },
  {
    "id": "key-stretching",
    "term": "Key Stretching",
    "definition": "A cryptographic technique that repeatedly hashes a password across thousands of cycles to increase the cost of brute force.",
    "concepts": [
      "hashing-and-salting"
    ]
  },
  {
    "id": "layered-architecture",
    "term": "Layered Architecture",
    "definition": "Organizing an application into horizontal layers (routes, controllers, services, models) with strict separation of concerns.",
    "concepts": [
      "layered-architecture"
    ]
  },
  {
    "id": "lean",
    "term": "Mongoose .lean()",
    "definition": "A Mongoose query option returning plain JavaScript objects instead of full Mongoose document instances, boosting read performance.",
    "concepts": [
      "populate-vs-lookup"
    ]
  },
  {
    "id": "left-outer-join",
    "term": "Left Outer Join",
    "definition": "A relational join operation that returns all records from the left collection combined with matching records from the right collection.",
    "concepts": [
      "populate-vs-lookup"
    ]
  },
  {
    "id": "libuv",
    "term": "libuv",
    "definition": "A multi-platform C library providing asynchronous I/O abstractions, non-blocking network polling, and a background worker thread pool.",
    "concepts": [
      "what-is-nodejs",
      "event-loop-intro",
      "event-loop-deep-dive"
    ]
  },
  {
    "id": "lockfile",
    "term": "Lockfile",
    "definition": "package-lock.json — records the exact resolved dependency versions and integrity hashes for deterministic installs.",
    "concepts": [
      "npm-package-json"
    ]
  },
  {
    "id": "log-levels",
    "term": "Log Levels",
    "definition": "Standard severity classifications (fatal, error, warn, info, debug, trace) filtering which log messages are captured in environments.",
    "concepts": [
      "logging-and-config"
    ]
  },
  {
    "id": "logging",
    "term": "Application Logging",
    "definition": "Recording operational events, warnings, errors, and system metrics during application execution for auditing and monitoring.",
    "concepts": [
      "logging-and-config"
    ]
  },
  {
    "id": "lookup",
    "term": "$lookup Stage",
    "definition": "MongoDB aggregation operator performing a left outer join to an external collection in the same database to filter and combine data.",
    "concepts": [
      "populate-vs-lookup"
    ]
  },
  {
    "id": "macrotask-queue",
    "term": "Macrotask Queue",
    "definition": "Queue holding scheduled timer callbacks, setImmediate jobs, and external I/O events scheduled for subsequent loop cycles.",
    "concepts": [
      "event-loop-intro",
      "callbacks-promises-async",
      "event-loop-deep-dive"
    ]
  },
  {
    "id": "match",
    "term": "$match Stage",
    "definition": "MongoDB aggregation pipeline stage that filters documents to pass only those matching specified query conditions.",
    "concepts": [
      "aggregation-pipeline"
    ]
  },
  {
    "id": "method",
    "term": "HTTP Method",
    "definition": "The request verb specifying the desired action: GET (retrieve), POST (create), PUT (replace), PATCH (update), DELETE (remove).",
    "concepts": [
      "http-request-anatomy",
      "idempotency-safe-methods",
      "routing"
    ]
  },
  {
    "id": "microtask-queue",
    "term": "Microtask Queue",
    "definition": "High-priority queue containing Promise callbacks and queueMicrotask; completely drained after every stack frame or event phase.",
    "concepts": [
      "event-loop-intro",
      "callbacks-promises-async",
      "event-loop-deep-dive"
    ]
  },
  {
    "id": "middleware",
    "term": "Middleware",
    "definition": "Functions with access to req, res, and next that execute in a sequential pipeline to process, validate, or transform requests.",
    "concepts": [
      "middleware-pipeline",
      "body-parsing-json"
    ]
  },
  {
    "id": "mime-type",
    "term": "MIME Type",
    "definition": "A two-part identifier (e.g. image/png, application/json) indicating the format and nature of a file transmitted over the web.",
    "concepts": [
      "file-uploads"
    ]
  },
  {
    "id": "mocking",
    "term": "Mocking",
    "definition": "Replacing real dependencies (like database connections or external payment APIs) with simulated test doubles in unit tests.",
    "concepts": [
      "testing-unit-vs-integration"
    ]
  },
  {
    "id": "model",
    "term": "Model",
    "definition": "A compiled Mongoose constructor class based on a Schema providing an interface to query, create, update, and delete collection documents.",
    "concepts": [
      "mongoose-schema-model",
      "layered-architecture",
      "controller-vs-service-vs-model"
    ]
  },
  {
    "id": "module-exports",
    "term": "module.exports",
    "definition": "The special object in CommonJS files that determines what values or functions are exposed to other files calling require().",
    "concepts": [
      "modules-cjs-vs-esm"
    ]
  },
  {
    "id": "mongodb",
    "term": "MongoDB",
    "definition": "A scalable, distributed NoSQL document database storing records as flexible, JSON-like BSON data structures.",
    "concepts": [
      "mongodb-basics"
    ]
  },
  {
    "id": "mongoose",
    "term": "Mongoose",
    "definition": "An Object Data Modeling (ODM) library for MongoDB and Node.js providing strict schema validation, models, and middleware hooks.",
    "concepts": [
      "mongoose-schema-model",
      "mongoose-schema-deep-dive"
    ]
  },
  {
    "id": "multer",
    "term": "Multer",
    "definition": "Node.js middleware for handling multipart/form-data requests, primarily used for parsing and streaming file uploads.",
    "concepts": [
      "file-uploads"
    ]
  },
  {
    "id": "multipart-form-data",
    "term": "multipart/form-data",
    "definition": "An encoding format allowing binary files and text fields to be packaged together into boundary-delimited streams over HTTP.",
    "concepts": [
      "file-uploads"
    ]
  },
  {
    "id": "n-plus-one",
    "term": "N+1 Query Problem",
    "definition": "A performance pitfall where an application executes 1 initial query plus N secondary queries to fetch child data instead of a single join.",
    "concepts": [
      "populate-vs-lookup"
    ]
  },
  {
    "id": "next",
    "term": "next()",
    "definition": "The continuation callback passed to Express middleware that passes execution control to the next handler in the stack.",
    "concepts": [
      "middleware-pipeline",
      "error-handling-101"
    ]
  },
  {
    "id": "node-modules",
    "term": "node_modules",
    "definition": "The directory where npm places downloaded and extracted package files, binaries, and nested transitive dependencies.",
    "concepts": [
      "npm-package-json"
    ]
  },
  {
    "id": "nodejs",
    "term": "Node.js",
    "definition": "An open-source, cross-platform JavaScript runtime built on Chrome's V8 engine that runs JS outside browser environments.",
    "concepts": [
      "what-is-nodejs"
    ]
  },
  {
    "id": "nosql-injection",
    "term": "NoSQL Injection",
    "definition": "A vulnerability where unvalidated client input containing MongoDB query operators (such as $gt or $ne) alters query logic.",
    "concepts": [
      "security-headers-injection"
    ]
  },
  {
    "id": "npm",
    "term": "npm",
    "definition": "Node Package Manager — the default CLI tool and registry for publishing, installing, and managing JavaScript dependencies.",
    "concepts": [
      "npm-package-json"
    ]
  },
  {
    "id": "objectid",
    "term": "ObjectId",
    "definition": "A 12-byte BSON identifier used as the default unique primary key (`_id`) for every document created in MongoDB.",
    "concepts": [
      "mongodb-basics",
      "mongoose-schema-model"
    ]
  },
  {
    "id": "offset-pagination",
    "term": "Offset Pagination",
    "definition": "Paginating datasets using skip() and limit(), which degrades in performance on large collections due to scanning discarded rows.",
    "concepts": [
      "pagination-filter-sort-projection"
    ]
  },
  {
    "id": "one-to-many",
    "term": "1-to-Many Relationship",
    "definition": "A database relationship where a single parent document is associated with multiple child documents or embedded records.",
    "concepts": [
      "embedding-vs-referencing"
    ]
  },
  {
    "id": "operational-error",
    "term": "Operational Error",
    "definition": "A predictable runtime exception arising from external factors (invalid input, lost database connection) that applications handle gracefully.",
    "concepts": [
      "centralized-error-handling",
      "operational-vs-programmer-errors"
    ]
  },
  {
    "id": "options-method",
    "term": "OPTIONS Method",
    "definition": "An HTTP method used by clients to query the communication options and CORS policies permitted by a server for a target URL.",
    "concepts": [
      "cors-preflight"
    ]
  },
  {
    "id": "origin",
    "term": "Origin",
    "definition": "The combination of protocol scheme, domain hostname, and port number identifying the origin location of a web request.",
    "concepts": [
      "cors-preflight"
    ]
  },
  {
    "id": "package-json",
    "term": "package.json",
    "definition": "The manifest file defining metadata, executable scripts, dependencies, author details, and config for a Node.js project.",
    "concepts": [
      "npm-package-json"
    ]
  },
  {
    "id": "pagination",
    "term": "Pagination",
    "definition": "Dividing a massive dataset into discrete chunks or pages to improve network efficiency and user interface responsiveness.",
    "concepts": [
      "pagination-filter-sort-projection"
    ]
  },
  {
    "id": "parameter-pollution",
    "term": "HTTP Parameter Pollution (HPP)",
    "definition": "An attack technique supplying duplicate query parameters with the same name to confuse application parsing logic or bypass security.",
    "concepts": [
      "security-headers-injection"
    ]
  },
  {
    "id": "pino",
    "term": "Pino",
    "definition": "An extremely fast, low-overhead JSON logger for Node.js designed to stream structured events to standard output.",
    "concepts": [
      "logging-and-config"
    ]
  },
  {
    "id": "pipeline",
    "term": "Pipeline",
    "definition": "An ordered sequence of middleware handlers processing a request step-by-step from arrival through response generation.",
    "concepts": [
      "middleware-pipeline"
    ]
  },
  {
    "id": "poll-phase",
    "term": "Poll Phase",
    "definition": "Central event loop phase where Node.js retrieves new I/O events, executes blocking I/O callbacks, and pauses if idle.",
    "concepts": [
      "event-loop-intro",
      "event-loop-deep-dive"
    ]
  },
  {
    "id": "populate",
    "term": "populate()",
    "definition": "Mongoose method that automatically replaces referenced ObjectIds in a document with the actual populated documents from other collections.",
    "concepts": [
      "mongoose-schema-model",
      "embedding-vs-referencing",
      "populate-vs-lookup"
    ]
  },
  {
    "id": "port",
    "term": "Port",
    "definition": "A 16-bit numerical socket identifier routing incoming network packets to a specific application process on the host.",
    "concepts": [
      "client-server-model",
      "dns-tcp-http-journey",
      "express-bootstrapping"
    ]
  },
  {
    "id": "post",
    "term": "POST Method",
    "definition": "HTTP method used to submit data to the server to create a subordinate resource or trigger processing; neither safe nor idempotent.",
    "concepts": [
      "idempotency-safe-methods"
    ]
  },
  {
    "id": "pre-save-hook",
    "term": "Pre-Save Hook",
    "definition": "Mongoose middleware hook executed automatically before a document is validated and saved into the MongoDB collection.",
    "concepts": [
      "mongoose-schema-deep-dive"
    ]
  },
  {
    "id": "preflight",
    "term": "Preflight Request",
    "definition": "An automatic OPTIONS request sent by browsers prior to complex cross-origin requests to check permissions with the target server.",
    "concepts": [
      "cors-preflight"
    ]
  },
  {
    "id": "process-env",
    "term": "process.env",
    "definition": "A global object provided by Node.js exposing the user environment variables active for the current running process.",
    "concepts": [
      "environment-variables"
    ]
  },
  {
    "id": "process-exit",
    "term": "process.exit()",
    "definition": "Node.js core function that terminates the running process immediately with a designated numeric exit status code.",
    "concepts": [
      "operational-vs-programmer-errors"
    ]
  },
  {
    "id": "programmer-error",
    "term": "Programmer Error",
    "definition": "An unexpected defect or bug in software code (such as a TypeError or syntax mistake) requiring developer remediation.",
    "concepts": [
      "operational-vs-programmer-errors"
    ]
  },
  {
    "id": "project",
    "term": "$project Stage",
    "definition": "Aggregation pipeline stage reshaping output documents by including, excluding, renaming, or computing new derived fields.",
    "concepts": [
      "aggregation-pipeline"
    ]
  },
  {
    "id": "projection",
    "term": "Database Projection",
    "definition": "Selecting a specific subset of document fields to return from a database query, reducing memory usage and network transfer overhead.",
    "concepts": [
      "pagination-filter-sort-projection"
    ]
  },
  {
    "id": "promise",
    "term": "Promise",
    "definition": "An object representing the eventual completion (fulfillment) or failure (rejection) of an asynchronous operation and its value.",
    "concepts": [
      "callbacks-promises-async"
    ]
  },
  {
    "id": "promise-rejection",
    "term": "Unhandled Rejection",
    "definition": "An event triggered when a Promise is rejected without an attached .catch() handler or enclosing try/catch block.",
    "concepts": [
      "error-handling-101",
      "async-error-wrapper"
    ]
  },
  {
    "id": "protocol",
    "term": "Protocol",
    "definition": "A standardized system of rules and message formats enabling computers to communicate accurately across networks.",
    "concepts": [
      "client-server-model"
    ]
  },
  {
    "id": "put",
    "term": "PUT Method",
    "definition": "Idempotent HTTP method used to create or replace the entire target resource with the uploaded request payload.",
    "concepts": [
      "idempotency-safe-methods"
    ]
  },
  {
    "id": "query-string",
    "term": "Query String",
    "definition": "Key-value pairs appended after `?` in a URL used for optional parameters such as searching, filtering, and pagination.",
    "concepts": [
      "http-request-anatomy"
    ]
  },
  {
    "id": "rainbow-table",
    "term": "Rainbow Table",
    "definition": "A precomputed dictionary of cryptographic hashes used by attackers to instantly reverse password hashes that lack unique salts.",
    "concepts": [
      "hashing-and-salting"
    ]
  },
  {
    "id": "rate-limiting",
    "term": "Rate Limiting",
    "definition": "A defensive control restricting the number of API requests an individual client or IP address can submit within a time interval.",
    "concepts": [
      "rate-limiting"
    ]
  },
  {
    "id": "rbac",
    "term": "Role-Based Access Control (RBAC)",
    "definition": "A security framework restricting system access and operations according to defined roles (e.g. user, editor, admin) assigned to users.",
    "concepts": [
      "auth-middleware-rbac"
    ]
  },
  {
    "id": "redirect",
    "term": "Redirect",
    "definition": "The process where a server responds with a 3xx code and Location header telling the client to repeat the request at another URL.",
    "concepts": [
      "http-response-status-codes"
    ]
  },
  {
    "id": "redis",
    "term": "Redis",
    "definition": "In-memory key-value store commonly used as a cache, message broker, and session store in Node.js applications.",
    "concepts": [
      "cache-aside-pattern"
    ]
  },
  {
    "id": "redis-limiter",
    "term": "Redis Rate Limiter",
    "definition": "A distributed rate limiter utilizing Redis atomic counters or sliding window sorted sets across multiple backend instances.",
    "concepts": [
      "rate-limiting"
    ]
  },
  {
    "id": "redis-store",
    "term": "Redis Session Store",
    "definition": "An in-memory storage adapter persisting user session records in Redis rather than inside single-server Node.js process memory.",
    "concepts": [
      "sessions-vs-jwt"
    ]
  },
  {
    "id": "reference",
    "term": "Document Reference",
    "definition": "Design pattern where documents store ObjectIds pointing to documents in another collection, resolved via Mongoose populate().",
    "concepts": [
      "mongodb-basics"
    ]
  },
  {
    "id": "referencing",
    "term": "Document Referencing",
    "definition": "Normalizing data by storing foreign key ObjectIds in parent documents pointing to separate collection documents.",
    "concepts": [
      "embedding-vs-referencing"
    ]
  },
  {
    "id": "refresh-token",
    "term": "Refresh Token",
    "definition": "A secure, long-lived token stored in an httpOnly cookie used exclusively to obtain fresh short-lived access tokens.",
    "concepts": [
      "access-refresh-tokens"
    ]
  },
  {
    "id": "replica-set",
    "term": "MongoDB Replica Set",
    "definition": "A cluster of MongoDB instances hosting the same dataset, providing high availability, redundancy, and transaction oplog support.",
    "concepts": [
      "transactions-and-sessions"
    ]
  },
  {
    "id": "request",
    "term": "Request",
    "definition": "A message sent by a client to a server asking for data or triggering an action, containing a method, URL, headers, and optional body.",
    "concepts": [
      "http-request-anatomy"
    ]
  },
  {
    "id": "request-body",
    "term": "Request Body",
    "definition": "The data payload sent along with POST, PUT, or PATCH requests, accessible via req.body once parsed by middleware.",
    "concepts": [
      "body-parsing-json"
    ]
  },
  {
    "id": "require",
    "term": "require()",
    "definition": "The CommonJS function used to synchronously load and evaluate an external module file or npm package at runtime.",
    "concepts": [
      "modules-cjs-vs-esm"
    ]
  },
  {
    "id": "resource",
    "term": "Resource",
    "definition": "Any conceptual entity or object exposed by an API (e.g., /users, /orders) identifiable by a unique, stable URI.",
    "concepts": [
      "rest-principles"
    ]
  },
  {
    "id": "response",
    "term": "Response",
    "definition": "The message sent by the server back to the client containing an HTTP status code, headers, and optional payload.",
    "concepts": [
      "http-request-anatomy",
      "http-response-status-codes"
    ]
  },
  {
    "id": "rest",
    "term": "REST",
    "definition": "Representational State Transfer — an architectural style for networked hypermedia systems emphasizing statelessness and standard HTTP.",
    "concepts": [
      "rest-principles"
    ]
  },
  {
    "id": "reuse-detection",
    "term": "Token Reuse Detection",
    "definition": "A security mechanism that immediately revokes all family refresh tokens if an already-rotated refresh token is submitted again.",
    "concepts": [
      "access-refresh-tokens"
    ]
  },
  {
    "id": "revocation",
    "term": "Token / Session Revocation",
    "definition": "The invalidation of an authentication credential before its scheduled expiration, preventing further resource access.",
    "concepts": [
      "sessions-vs-jwt"
    ]
  },
  {
    "id": "rollback",
    "term": "Transaction Rollback",
    "definition": "Aborting a database transaction, cleanly undoing all pending changes made during the session to preserve consistency.",
    "concepts": [
      "transactions-and-sessions"
    ]
  },
  {
    "id": "route-handler",
    "term": "Route Handler",
    "definition": "The final middleware function attached to a route path responsible for generating and sending the HTTP response.",
    "concepts": [
      "middleware-pipeline",
      "routing",
      "layered-architecture"
    ]
  },
  {
    "id": "router",
    "term": "Router",
    "definition": "Express.Router instance acting as an isolated mini-app capable of performing routing and mounting middleware independently.",
    "concepts": [
      "express-bootstrapping",
      "routing"
    ]
  },
  {
    "id": "rpc",
    "term": "RPC",
    "definition": "Remote Procedure Call — an API design approach where clients call named action procedures (e.g., /createUser) instead of resource URIs.",
    "concepts": [
      "rest-principles"
    ]
  },
  {
    "id": "runtime",
    "term": "Runtime",
    "definition": "The execution environment providing system libraries, memory management, and APIs required to run programs during execution.",
    "concepts": [
      "what-is-nodejs"
    ]
  },
  {
    "id": "s3-upload",
    "term": "Amazon S3 Upload",
    "definition": "Streaming file objects directly to cloud object storage rather than writing files to local application server disk.",
    "concepts": [
      "file-uploads"
    ]
  },
  {
    "id": "safe-method",
    "term": "Safe Method",
    "definition": "An HTTP method (such as GET or HEAD) that only retrieves data and produces zero side effects on the server state.",
    "concepts": [
      "idempotency-safe-methods"
    ]
  },
  {
    "id": "salting",
    "term": "Password Salting",
    "definition": "Appending a unique cryptographically random string to passwords before hashing to ensure identical passwords generate unique hashes.",
    "concepts": [
      "hashing-and-salting"
    ]
  },
  {
    "id": "same-origin-policy",
    "term": "Same-Origin Policy",
    "definition": "Critical browser security model restricting scripts on one origin from accessing or reading resources loaded from a different origin.",
    "concepts": [
      "cors-preflight"
    ]
  },
  {
    "id": "same-site",
    "term": "SameSite Cookie Attribute",
    "definition": "A cookie configuration attribute (Strict, Lax, None) controlling whether cookies are sent with cross-site requests.",
    "concepts": [
      "cookies-security-flags"
    ]
  },
  {
    "id": "sanitization",
    "term": "Data Sanitization",
    "definition": "Cleaning and stripping dangerous operators, script tags, or unexpected fields from client input before database processing.",
    "concepts": [
      "input-validation-zod",
      "security-headers-injection"
    ]
  },
  {
    "id": "schema",
    "term": "Schema",
    "definition": "A Mongoose configuration object mapping out document fields, types, default values, validators, and custom instance methods.",
    "concepts": [
      "mongoose-schema-model",
      "controller-vs-service-vs-model",
      "mongoose-schema-deep-dive"
    ]
  },
  {
    "id": "schema-options",
    "term": "Mongoose Schema Options",
    "definition": "Configuration settings passed to Mongoose Schemas controlling automatic timestamps, virtual field serialization, and collection names.",
    "concepts": [
      "mongoose-schema-deep-dive"
    ]
  },
  {
    "id": "schema-validation",
    "term": "Schema Validation",
    "definition": "Enforcing defined schema constraints, custom error messages, and type checks on documents prior to database storage.",
    "concepts": [
      "input-validation-zod"
    ]
  },
  {
    "id": "secret",
    "term": "Secret",
    "definition": "Sensitive credentials such as private API keys, database connection strings, and encryption passwords requiring strict protection.",
    "concepts": [
      "environment-variables"
    ]
  },
  {
    "id": "secret-key",
    "term": "Secret Key",
    "definition": "A server-only string used to sign and verify JWTs. Must never be exposed to the client.",
    "concepts": [
      "jwt-anatomy"
    ]
  },
  {
    "id": "secure-cookie",
    "term": "Secure Cookie Flag",
    "definition": "A security directive instructing browsers to transmit the cookie exclusively over encrypted HTTPS network connections.",
    "concepts": [
      "cookies-security-flags"
    ]
  },
  {
    "id": "security-headers",
    "term": "Security HTTP Headers",
    "definition": "HTTP response headers (such as CSP, X-Frame-Options, HSTS) configured to harden web applications against common exploits.",
    "concepts": [
      "security-headers-injection"
    ]
  },
  {
    "id": "semver",
    "term": "SemVer",
    "definition": "Semantic Versioning (MAJOR.MINOR.PATCH) rules defining how breaking changes, new features, and bug fixes increment numbers.",
    "concepts": [
      "npm-package-json"
    ]
  },
  {
    "id": "server",
    "term": "Server",
    "definition": "A computer program or host that listens for incoming client requests, executes logic, accesses databases, and serves responses.",
    "concepts": [
      "client-server-model"
    ]
  },
  {
    "id": "service-layer",
    "term": "Service Layer",
    "definition": "The architectural layer encapsulating business logic, workflows, external API integrations, and transaction orchestration.",
    "concepts": [
      "layered-architecture",
      "controller-vs-service-vs-model"
    ]
  },
  {
    "id": "session-id",
    "term": "Session ID",
    "definition": "A unique, cryptographically random identifier stored in a client cookie matching an active session record in the database.",
    "concepts": [
      "sessions-vs-jwt"
    ]
  },
  {
    "id": "sessions",
    "term": "Server-Side Sessions",
    "definition": "A stateful authentication pattern where user state is stored on the server (in Redis or DB) and tracked via a cookie identifier.",
    "concepts": [
      "sessions-vs-jwt",
      "transactions-and-sessions"
    ]
  },
  {
    "id": "sliding-window",
    "term": "Sliding Window Rate Limiting",
    "definition": "An algorithm calculating client request frequency over a moving rolling time window to eliminate boundary burst vulnerabilities.",
    "concepts": [
      "rate-limiting"
    ]
  },
  {
    "id": "soc",
    "term": "Separation of Concerns (SoC)",
    "definition": "A software design principle separating computer programs into distinct sections where each section addresses a separate concern.",
    "concepts": [
      "layered-architecture",
      "controller-vs-service-vs-model"
    ]
  },
  {
    "id": "sort-memory-limit",
    "term": "32MB In-Memory Sort Limit",
    "definition": "MongoDB's limit aborting queries if a sort operation requires more than 32MB of RAM without supporting index coverage.",
    "concepts": [
      "compound-index-esr-rule"
    ]
  },
  {
    "id": "sorting",
    "term": "Query Sorting",
    "definition": "Ordering database query result sets in ascending (1) or descending (-1) order based on specified document keys.",
    "concepts": [
      "pagination-filter-sort-projection"
    ]
  },
  {
    "id": "stack-trace",
    "term": "Stack Trace",
    "definition": "A sequential report of active execution frames showing the file names, functions, and line numbers leading up to an error.",
    "concepts": [
      "error-handling-101",
      "centralized-error-handling"
    ]
  },
  {
    "id": "stale-data",
    "term": "Stale Data",
    "definition": "Cached data that no longer matches the source of truth (the database). Managed via TTL or explicit cache invalidation.",
    "concepts": [
      "cache-aside-pattern"
    ]
  },
  {
    "id": "stateful",
    "term": "Stateful Architecture",
    "definition": "A system design where servers retain client state, authentication data, or context across successive requests.",
    "concepts": [
      "sessions-vs-jwt"
    ]
  },
  {
    "id": "stateless",
    "term": "Stateless",
    "definition": "Core architectural constraint where the server stores no client session context; each request carries complete auth and state.",
    "concepts": [
      "rest-principles",
      "sessions-vs-jwt"
    ]
  },
  {
    "id": "status-code",
    "term": "Status Code",
    "definition": "A 3-digit standardized number communicating the outcome: 2xx success, 3xx redirect, 4xx client error, 5xx server error.",
    "concepts": [
      "http-request-anatomy",
      "http-response-status-codes"
    ]
  },
  {
    "id": "stdout",
    "term": "Standard Output (stdout)",
    "definition": "The default system stream where console output and structured JSON logs are emitted for capture by process managers.",
    "concepts": [
      "logging-and-config"
    ]
  },
  {
    "id": "streaming",
    "term": "Data Streaming",
    "definition": "Processing data sequentially chunk-by-chunk without buffering entire payloads into application process memory.",
    "concepts": [
      "file-uploads"
    ]
  },
  {
    "id": "structured-logging",
    "term": "Structured Logging",
    "definition": "Emitting application logs as standardized JSON objects rather than unstructured plain text for automated parsing and alerting.",
    "concepts": [
      "logging-and-config"
    ]
  },
  {
    "id": "supertest",
    "term": "Supertest",
    "definition": "A testing library for Node.js HTTP servers that simplifies simulating HTTP requests and asserting on responses in tests.",
    "concepts": [
      "testing-unit-vs-integration"
    ]
  },
  {
    "id": "tcp",
    "term": "TCP",
    "definition": "Transmission Control Protocol — a reliable, connection-oriented transport protocol ensuring ordered, loss-free byte transmission.",
    "concepts": [
      "client-server-model",
      "dns-tcp-http-journey"
    ]
  },
  {
    "id": "test-pyramid",
    "term": "Test Pyramid",
    "definition": "A testing strategy recommending a wide base of fast unit tests, a middle layer of integration tests, and few high-level E2E tests.",
    "concepts": [
      "testing-unit-vs-integration"
    ]
  },
  {
    "id": "thread-pool",
    "term": "Thread Pool",
    "definition": "A managed collection of background worker threads in libuv used to execute blocking operations like file I/O, DNS, and crypto.",
    "concepts": [
      "what-is-nodejs"
    ]
  },
  {
    "id": "timers-phase",
    "term": "Timers Phase",
    "definition": "The initial phase of the Node.js event loop executing callbacks scheduled by setTimeout and setInterval whose thresholds passed.",
    "concepts": [
      "event-loop-intro",
      "event-loop-deep-dive"
    ]
  },
  {
    "id": "timestamps",
    "term": "Mongoose Timestamps",
    "definition": "A schema option that automatically adds and manages createdAt and updatedAt date fields on documents.",
    "concepts": [
      "mongoose-schema-deep-dive"
    ]
  },
  {
    "id": "tls",
    "term": "TLS",
    "definition": "Transport Layer Security — cryptographic protocol securing communications over computer networks via encryption and server certificates.",
    "concepts": [
      "dns-tcp-http-journey"
    ]
  },
  {
    "id": "token-bucket",
    "term": "Token Bucket Algorithm",
    "definition": "A rate-limiting algorithm where tokens replenish at a steady rate in a reservoir and incoming requests consume tokens.",
    "concepts": [
      "rate-limiting"
    ]
  },
  {
    "id": "token-rotation",
    "term": "Refresh Token Rotation",
    "definition": "Issuing a brand new refresh token every time an existing refresh token is exchanged, invalidating the previous token.",
    "concepts": [
      "access-refresh-tokens"
    ]
  },
  {
    "id": "transactions",
    "term": "Database Transactions",
    "definition": "Sequences of database operations executed as an atomic unit with full ACID guarantees across documents and collections.",
    "concepts": [
      "transactions-and-sessions"
    ]
  },
  {
    "id": "tree-shaking",
    "term": "Tree-Shaking",
    "definition": "Static analysis optimization performed by bundlers that strips out unused code and unreferenced exports from final bundles.",
    "concepts": [
      "modules-cjs-vs-esm"
    ]
  },
  {
    "id": "try-catch",
    "term": "try/catch",
    "definition": "Control flow block used to catch and handle runtime exceptions and rejected promises without crashing the running process.",
    "concepts": [
      "error-handling-101"
    ]
  },
  {
    "id": "ttl",
    "term": "TTL",
    "definition": "Time To Live — how long a cached value stays valid before expiring. Prevents stale data from being served.",
    "concepts": [
      "cache-aside-pattern"
    ]
  },
  {
    "id": "type-inference",
    "term": "Type Inference",
    "definition": "The automatic deduction of TypeScript types from schema definitions (e.g. z.infer<typeof schema>) without duplicate typing.",
    "concepts": [
      "input-validation-zod"
    ]
  },
  {
    "id": "unauthorized",
    "term": "401 Unauthorized",
    "definition": "HTTP status code indicating the request lacks valid authentication credentials or the supplied token is expired.",
    "concepts": [
      "auth-middleware-rbac"
    ]
  },
  {
    "id": "uncaught-exception",
    "term": "uncaughtException Event",
    "definition": "A process-level Node.js event emitted when an unhandled JavaScript exception bubbles all the way back to the event loop.",
    "concepts": [
      "operational-vs-programmer-errors"
    ]
  },
  {
    "id": "uniform-interface",
    "term": "Uniform Interface",
    "definition": "REST constraint requiring standard methods, predictable URI conventions, and self-descriptive representations across endpoints.",
    "concepts": [
      "rest-principles"
    ]
  },
  {
    "id": "unit-testing",
    "term": "Unit Testing",
    "definition": "Testing isolated individual functions, units, or modules in isolation from external services by mocking dependencies.",
    "concepts": [
      "testing-unit-vs-integration"
    ]
  },
  {
    "id": "unwind",
    "term": "$unwind Stage",
    "definition": "MongoDB aggregation stage deconstructing an array field from input documents to output one document per array element.",
    "concepts": [
      "aggregation-pipeline"
    ]
  },
  {
    "id": "url",
    "term": "URL",
    "definition": "Uniform Resource Locator — the unique web address pinpointing a resource: protocol scheme, hostname, port, path, and query.",
    "concepts": [
      "http-request-anatomy"
    ]
  },
  {
    "id": "url-param",
    "term": "URL Parameter",
    "definition": "Named route segments denoted by a colon (e.g., :id) captured from the request path and made available on req.params.",
    "concepts": [
      "routing"
    ]
  },
  {
    "id": "urlencoded",
    "term": "URL-Encoded",
    "definition": "Data format typically sent by HTML forms where keys and values are encoded in key=value pairs joined with ampersands.",
    "concepts": [
      "body-parsing-json"
    ]
  },
  {
    "id": "v8",
    "term": "V8 Engine",
    "definition": "Google's high-performance open-source JavaScript and WebAssembly engine written in C++, compiling JS directly to native machine code.",
    "concepts": [
      "what-is-nodejs"
    ]
  },
  {
    "id": "validation",
    "term": "Validation",
    "definition": "Verification logic executed before saving documents into MongoDB ensuring required fields, data types, and custom constraints match.",
    "concepts": [
      "mongoose-schema-model"
    ]
  },
  {
    "id": "validators",
    "term": "Schema Validators",
    "definition": "Functions and rules checking document property values against constraints before saving into the database.",
    "concepts": [
      "mongoose-schema-deep-dive"
    ]
  },
  {
    "id": "virtuals",
    "term": "Mongoose Virtuals",
    "definition": "Computed document properties that can be read and set like regular fields but are not persisted into MongoDB storage.",
    "concepts": [
      "mongoose-schema-deep-dive"
    ]
  },
  {
    "id": "vitest",
    "term": "Vitest",
    "definition": "A fast, Vite-native TypeScript testing framework providing a modern alternative to Jest with native ESM support.",
    "concepts": [
      "testing-unit-vs-integration"
    ]
  },
  {
    "id": "wildcard",
    "term": "Wildcard Route",
    "definition": "A catch-all route pattern (such as *) that matches any path, typically placed last to serve 404 responses or fallback pages.",
    "concepts": [
      "routing"
    ]
  },
  {
    "id": "winston",
    "term": "Winston",
    "definition": "A popular, versatile logging library for Node.js supporting multiple storage transports and custom log formatting.",
    "concepts": [
      "logging-and-config"
    ]
  },
  {
    "id": "xss",
    "term": "Cross-Site Scripting (XSS)",
    "definition": "A vulnerability where an attacker injects malicious scripts into trusted websites, executing within victims' browsers.",
    "concepts": [
      "cookies-security-flags"
    ]
  },
  {
    "id": "zod",
    "term": "Zod",
    "definition": "A TypeScript-first schema declaration and validation library with static type inference for data parsing.",
    "concepts": [
      "input-validation-zod"
    ]
  }
]

export const glossaryMap = Object.fromEntries(glossary.map(t => [t.id, t]))
