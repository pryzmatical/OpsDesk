import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // All test files share one SQLite file (prisma/test.db) and setup.ts
    // truncates tables in beforeEach — running files in parallel would let
    // one file's cleanup race another file's in-flight assertions.
    fileParallelism: false,
    env: {
      DATABASE_URL: "file:./prisma/test.db",
      JWT_SECRET: "test-secret-not-for-production",
    },
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
