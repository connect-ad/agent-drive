import { describe, expect, it } from "vitest";
import { buildHealth } from "../src/index";

describe("buildHealth", () => {
  it("reports the environment it was given", () => {
    const report = buildHealth({ ENVIRONMENT: "dev" }, new Date("2026-01-01T00:00:00Z"));
    expect(report.status).toBe("ok");
    expect(report.environment).toBe("dev");
    expect(report.timestamp).toBe("2026-01-01T00:00:00.000Z");
  });

  it("does not crash when ENVIRONMENT is missing", () => {
    const report = buildHealth({ ENVIRONMENT: undefined as unknown as string }, new Date());
    expect(report.environment).toBe("unknown");
  });
});
