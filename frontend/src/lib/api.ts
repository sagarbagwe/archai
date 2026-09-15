import { DesignInput, GeneratedDesign, estimateSchema, generatedDesignSchema, generationEventSchema } from "@/lib/domain/design";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function calculateEstimate(input: { dailyActiveUsers: number; requestsPerUser: number; peakMultiplier: number }, signal?: AbortSignal) {
  const response = await fetch(`${API_URL}/api/estimation/calculate`, {
    method: "POST", headers: { "Content-Type": "application/json" }, signal,
    body: JSON.stringify({ ...input, readRatio: 0.8, averagePayloadBytes: 1024 }),
  });
  if (!response.ok) throw new Error("Capacity estimation is temporarily unavailable.");
  return estimateSchema.parse(await response.json());
}

export async function streamDesignGeneration(
  input: DesignInput,
  onEvent: (event: ReturnType<typeof generationEventSchema.parse>) => void,
  signal?: AbortSignal,
): Promise<GeneratedDesign> {
  const response = await fetch(`${API_URL}/api/design/generate/stream`, {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "text/event-stream" }, signal,
    body: JSON.stringify({
      systemName: input.systemName, problemDescription: input.problemDescription,
      dailyActiveUsers: input.dailyActiveUsers, requestsPerUser: input.requestsPerUser,
      peakMultiplier: input.peakMultiplier, readRatio: 0.8, averagePayloadBytes: 1024,
      additionalRequirements: input.additionalRequirements,
    }),
  });
  if (!response.ok || !response.body) throw new Error("Unable to start AI generation.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed: GeneratedDesign | undefined;
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replaceAll("\r\n", "\n");
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const data = frame.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n");
      if (!data) continue;
      const event = generationEventSchema.parse(JSON.parse(data));
      onEvent(event);
      if (event.type === "stage.failed") throw new Error(typeof event.data === "string" ? event.data : "AI generation failed.");
      if (event.type === "generation.completed") completed = generatedDesignSchema.parse(event.data);
    }
    if (done) break;
  }
  if (!completed) throw new Error("AI generation ended without a valid design.");
  return completed;
}
