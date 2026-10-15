const nextJest = require("next/jest");

// Konfigurasi Jest bawaan Next.js (materi BE Live 5).
const createJestConfig = nextJest({ dir: "./" });

module.exports = createJestConfig({
  testEnvironment: "node",
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
});
