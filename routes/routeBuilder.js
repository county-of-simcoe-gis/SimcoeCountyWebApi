module.exports = (server, defaultRoute = "") => {
  const routeFiles = getAllFiles(require("path").join(__dirname));

  routeFiles.forEach((file) => {
    if (file.name === "routeBuilder.js") return;
    let route = `${file.path.replace(require("path").join(__dirname), "")}${file.name !== "index.js" ? "/" + file.name.replace(".js", "") : ""}`;
    route = route.split("\\").join("/");
    console.log("Building Routes", require("path").join(file.path, file.name.replace(".js", "")), defaultRoute + route);

    // Create a Fastify-compatible router wrapper
    const routerWrapper = {
      get: (path, middleware, handler) => {
        server.get(path, async (request, reply) => {
          await executeRoute(request, reply, middleware, handler);
        });
      },
      post: (path, middleware, handler) => {
        server.post(path, async (request, reply) => {
          await executeRoute(request, reply, middleware, handler);
        });
      },
      put: (path, middleware, handler) => {
        server.put(path, async (request, reply) => {
          await executeRoute(request, reply, middleware, handler);
        });
      },
      delete: (path, middleware, handler) => {
        server.delete(path, async (request, reply) => {
          await executeRoute(request, reply, middleware, handler);
        });
      },
    };

    let middleWare = (req, res, next) => {
      return next();
    };
    require(require("path").join(file.path, file.name.replace(".js", "")))(defaultRoute + route, middleWare, routerWrapper);
  });
};

// Helper function to execute routes with Restify-style middleware compatibility
async function executeRoute(request, reply, middleware, handler) {
  // Store original Fastify methods
  const originalSend = reply.send.bind(reply);
  const originalCode = reply.code.bind(reply);
  const originalHeader = reply.header.bind(reply);
  const originalType = reply.type.bind(reply);
  const rawResponse = reply.raw;

  // Create Restify-compatible request/response objects
  const req = Object.assign(request, {
    params: request.params,
    query: request.query,
    body: request.body,
    headers: request.headers,
  });

  // Track if response has been sent
  let responseSent = false;
  let isHijacked = false;

  // Track headers set before hijacking so we can apply them to raw response
  const pendingHeaders = {};
  let pendingStatusCode = 200;

  // Function to hijack the response for streaming
  const hijackForStreaming = () => {
    if (!isHijacked) {
      isHijacked = true;
      reply.hijack();
      // Apply any headers that were set before hijacking
      rawResponse.statusCode = pendingStatusCode;
      for (const [header, value] of Object.entries(pendingHeaders)) {
        rawResponse.setHeader(header, value);
      }
    }
  };

  const res = {
    send: (data) => {
      if (!responseSent && !reply.sent && !isHijacked) {
        responseSent = true;
        originalSend(data);
      } else if (isHijacked && !rawResponse.writableEnded) {
        rawResponse.end(data);
      }
    },
    status: (code) => {
      if (!isHijacked) {
        pendingStatusCode = code;
        originalCode(code);
      } else {
        rawResponse.statusCode = code;
      }
      return res;
    },
    json: (data) => {
      if (!responseSent && !reply.sent && !isHijacked) {
        responseSent = true;
        // Ensure proper JSON serialization like Restify did
        // Restify's res.json() would JSON.stringify strings to include quotes
        originalHeader("Content-Type", "application/json");
        originalSend(JSON.stringify(data));
      }
    },
    set: (header, value) => {
      if (!isHijacked) {
        pendingHeaders[header] = value;
        originalHeader(header, value);
      } else {
        rawResponse.setHeader(header, value);
      }
      return res;
    },
    header: (header, value) => {
      if (!isHijacked) {
        pendingHeaders[header] = value;
        originalHeader(header, value);
      } else {
        rawResponse.setHeader(header, value);
      }
      return res;
    },
    setHeader: (header, value) => {
      if (!isHijacked) {
        pendingHeaders[header] = value;
        originalHeader(header, value);
      } else {
        rawResponse.setHeader(header, value);
      }
      return res;
    },
    type: (contentType) => {
      originalType(contentType);
      return res;
    },
    // For binary data like images
    end: (data) => {
      if (!responseSent && !reply.sent && !isHijacked) {
        responseSent = true;
        originalSend(data);
      } else if (isHijacked) {
        rawResponse.end(data);
      }
    },
    // Check if headers have been sent
    get headersSent() {
      return reply.sent || responseSent || rawResponse.headersSent;
    },
    // Stream support - hijack response and delegate to raw response
    on: (event, listener) => {
      hijackForStreaming();
      rawResponse.on(event, listener);
      return res;
    },
    once: (event, listener) => {
      hijackForStreaming();
      rawResponse.once(event, listener);
      return res;
    },
    emit: (event, ...args) => {
      rawResponse.emit(event, ...args);
      return res;
    },
    write: (chunk, encoding, callback) => {
      hijackForStreaming();
      return rawResponse.write(chunk, encoding, callback);
    },
    // Handle being piped to (writable stream interface)
    pipe: (destination, options) => {
      return rawResponse.pipe(destination, options);
    },
    removeListener: (event, listener) => {
      rawResponse.removeListener(event, listener);
      return res;
    },
    addListener: (event, listener) => {
      hijackForStreaming();
      rawResponse.addListener(event, listener);
      return res;
    },
    // Mark as writable for stream detection
    writable: true,
    get writableEnded() {
      return rawResponse.writableEnded;
    },
  };

  // Execute middleware and handler
  try {
    await new Promise((resolve) => {
      middleware(req, res, () => {
        handler(req, res, () => {
          resolve();
        });
      });
    });
  } catch (error) {
    console.error(error);
    if (!reply.sent) {
      originalCode(500);
      originalSend();
    }
  }
}

const getAllFiles = function (dirPath, arrayOfFiles) {
  let files = require("fs").readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function (file) {
    if (
      require("fs")
        .statSync(dirPath + "/" + file)
        .isDirectory()
    ) {
      arrayOfFiles = getAllFiles(require("path").join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push({ path: dirPath, name: file });
    }
  });
  return arrayOfFiles;
};
