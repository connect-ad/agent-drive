import { defineConfig } from "vitest/config";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";

/**
 * Tests run inside the real Workers runtime against a real (Miniflare-backed)
 * D1, not a mock. Doc 08 is explicit that tenant-isolation tests must prove
 * behaviour against actual D1 - a mocked query layer would happily "prove" an
 * isolation guarantee the real SQL does not provide.
 *
 * Migrations are read here, in Node, because the Workers runtime has no
 * filesystem. They are the same .sql files the deploy applies: a separately
 * maintained test schema is how a migration bug survives a green suite.
 */
export default defineConfig(async () => {
  const migrations = await readD1Migrations("./migrations");

  return {
    plugins: [
      cloudflareTest({
        singleWorker: true,
        wrangler: { configPath: "./wrangler.toml", environment: "dev" },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations,
            // POST /v1/workspaces refuses to run without this, by design. The
            // value is irrelevant - every test stubs the siteverify call - but
            // it has to be present or the route fails closed before its gates.
            TURNSTILE_SECRET_KEY: "test-turnstile-secret",
          },
        },
      }),
    ],
    test: {
      setupFiles: ["./test/apply-migrations.ts"],
    },
  };
});
