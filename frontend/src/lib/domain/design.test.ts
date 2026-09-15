import { describe, expect, it } from "vitest";
import { designInputSchema } from "./design";

const validDesign = {
  systemName: "Payment System",
  problemDescription: "Design a globally available payment processing platform.",
  dailyActiveUsers: 10_000_000,
  requestsPerUser: 20,
  peakMultiplier: 5,
  availability: "99.99%",
  expectedLatencyMs: 200,
  geographicScope: "Global",
  consistency: "Strong",
  dataRetention: "5 years",
  additionalRequirements: "Idempotency and refunds",
  difficulty: "FAANG-level",
};

describe("designInputSchema", () => {
  it("accepts the payment demo", () => {
    expect(designInputSchema.safeParse(validDesign).success).toBe(true);
  });

  it("rejects non-positive traffic", () => {
    const result = designInputSchema.safeParse({ ...validDesign, dailyActiveUsers: 0 });
    expect(result.success).toBe(false);
  });
});
