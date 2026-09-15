import { z } from "zod";

export const designInputSchema = z.object({
  systemName: z.string().trim().min(3).max(120),
  problemDescription: z.string().trim().min(20).max(5000),
  dailyActiveUsers: z.number().int().positive().max(2_000_000_000),
  requestsPerUser: z.number().int().positive().max(1_000_000),
  peakMultiplier: z.number().min(1).max(1000),
  availability: z.enum(["99%", "99.9%", "99.99%", "99.999%"]),
  expectedLatencyMs: z.number().int().positive().max(60_000),
  geographicScope: z.enum(["Single Region", "Multi Region", "Global"]),
  consistency: z.enum(["Strong", "Eventual", "Mixed", "Let AI decide"]),
  dataRetention: z.string().trim().min(1).max(100),
  additionalRequirements: z.string().max(3000),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced", "FAANG-level"]),
});
export type DesignInput = z.infer<typeof designInputSchema>;

export const estimateSchema = z.object({
  dailyRequests: z.number(), averageRps: z.number(), peakRps: z.number(),
  readRps: z.number(), writeRps: z.number(), peakBandwidthBytesPerSecond: z.number(),
  formulas: z.record(z.string(), z.string()),
});
const requirementsSchema = z.object({
  functional: z.array(z.string()), nonFunctional: z.array(z.string()),
  assumptions: z.array(z.string()), constraints: z.array(z.string()),
});
export const architectureNodeSchema = z.object({
  id: z.string(), name: z.string(), type: z.string(), technology: z.string(),
  description: z.string(), responsibilities: z.array(z.string()), scalingStrategy: z.string(),
});
export type ArchitectureComponent = z.infer<typeof architectureNodeSchema> & Record<string, unknown>;
export const architectureEdgeSchema = z.object({ id: z.string(), source: z.string(), target: z.string(), label: z.string() });
export type ArchitectureConnection = z.infer<typeof architectureEdgeSchema>;
export const architectureSchema = z.object({ nodes: z.array(architectureNodeSchema), edges: z.array(architectureEdgeSchema) });
export const generatedDesignSchema = z.object({
  title: z.string(), requirements: requirementsSchema, estimation: estimateSchema, architecture: architectureSchema,
});
export type GeneratedDesign = z.infer<typeof generatedDesignSchema>;

export const diagramSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(), type: z.literal("architecture"),
    position: z.object({ x: z.number(), y: z.number() }), data: architectureNodeSchema,
  })),
  edges: z.array(z.object({ id: z.string(), source: z.string(), target: z.string(), label: z.string().optional() })),
});
export type DiagramState = z.infer<typeof diagramSchema>;

export const savedDesignSchema = z.object({
  id: z.string(), createdAt: z.string(), updatedAt: z.string(),
  status: z.enum(["draft", "generated"]), input: designInputSchema,
  estimate: estimateSchema.optional(), generatedDesign: generatedDesignSchema.optional(), diagram: diagramSchema.optional(),
});
export type SavedDesign = z.infer<typeof savedDesignSchema>;
export const savedDesignsSchema = z.array(savedDesignSchema);

export const generationEventSchema = z.object({ type: z.string(), stage: z.string(), data: z.unknown().nullable() });
export type GenerationEvent = z.infer<typeof generationEventSchema>;
