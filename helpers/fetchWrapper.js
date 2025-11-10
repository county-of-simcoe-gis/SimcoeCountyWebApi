// Wrapper for node-fetch v3 to work with CommonJS
// node-fetch v3 is ESM-only, so we use dynamic import

let fetchPromise;

function getFetch() {
  if (!fetchPromise) {
    fetchPromise = import("node-fetch").then((module) => module.default);
  }
  return fetchPromise;
}

// Export a function that dynamically imports and calls fetch
module.exports = async function fetch(...args) {
  const fetchImpl = await getFetch();
  return fetchImpl(...args);
};

// Also export as default for consistency
module.exports.default = module.exports;
