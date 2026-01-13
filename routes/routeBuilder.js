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
  const originalRaw = reply.raw;

  // Create Restify-compatible request/response objects
  const req = Object.assign(request, {
    params: request.params,
    query: request.query,
    body: request.body,
    headers: request.headers,
  });

  // Create res as an object that extends originalRaw for full stream compatibility
  // This ensures pipe() works correctly with all event emitter methods
  const res = Object.create(originalRaw, {
    send: {
      value: (data) => {
        if (!reply.sent) {
          originalSend(data);
        }
      },
      writable: true,
      configurable: true,
    },
    status: {
      value: (code) => {
        originalCode(code);
        return res;
      },
      writable: true,
      configurable: true,
    },
    json: {
      value: (data) => {
        if (!reply.sent) {
          originalSend(data);
        }
      },
      writable: true,
      configurable: true,
    },
    set: {
      value: (header, value) => {
        originalHeader(header, value);
        return res;
      },
      writable: true,
      configurable: true,
    },
    header: {
      value: (header, value) => {
        originalHeader(header, value);
        return res;
      },
      writable: true,
      configurable: true,
    },
  });

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
