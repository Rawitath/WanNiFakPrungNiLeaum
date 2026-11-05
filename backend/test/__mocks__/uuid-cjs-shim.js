// Jest CJS shim for uuid v14 (pure ESM)
// Provides uuid functions as CommonJS exports during test runs.
const crypto = require('crypto');

function v4() {
  return crypto.randomUUID();
}

module.exports = { v4 };
