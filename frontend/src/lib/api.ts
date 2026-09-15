import { z } from "zod";
import { estimateSchema } from "@/lib/domain/design";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function calculateEstimate(input: { dailyActiveUsers: number; requestsPerUser: number; peakMultiplier: number }, signal?: AbortSignal) {
  const response = await fetch(`${API_URL}/api/estimation/calculate`, {
    method: "POST", headers: { "Content-Type": "application/json" }, signal,
    body: JSON.stringify({ ...input, readRatio: 0.8, averagePayloadBytes: 1024 }),
  });
  if (!response.ok) throw new Error("Capacity estimation is temporarily unavailable.");
  return estimateSchema.parse(await response.json());
}
