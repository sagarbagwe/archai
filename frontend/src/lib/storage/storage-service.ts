import { z } from "zod";
import { SavedDesign, savedDesignsSchema } from "@/lib/domain/design";

const DESIGNS_KEY = "archai:v1:designs";
const envelope = <T extends z.ZodTypeAny>(schema: T) => z.object({ schemaVersion: z.literal(1), updatedAt: z.string(), data: schema });

export interface StorageAdapter { getItem(key: string): string | null; setItem(key: string, value: string): void; }

export class MemoryStorageAdapter implements StorageAdapter {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

export class StorageService {
  private fallback = new MemoryStorageAdapter();
  constructor(private primary: StorageAdapter) {}

  private read<T>(key: string, schema: z.ZodType<T>, defaultValue: T): T {
    for (const source of [this.primary, this.fallback]) {
      try {
        const raw = source.getItem(key);
        if (raw) return envelope(schema).parse(JSON.parse(raw)).data;
      } catch { /* invalid or unavailable storage */ }
    }
    return defaultValue;
  }

  private write<T>(key: string, schema: z.ZodType<T>, value: T) {
    const data = schema.parse(value);
    const raw = JSON.stringify({ schemaVersion: 1, updatedAt: new Date().toISOString(), data });
    try { this.primary.setItem(key, raw); return true; }
    catch { this.fallback.setItem(key, raw); return false; }
  }

  getDesigns() { return this.read(DESIGNS_KEY, savedDesignsSchema, []); }
  getDesign(id: string) { return this.getDesigns().find((design) => design.id === id); }
  saveDesign(design: SavedDesign) {
    const designs = this.getDesigns();
    const index = designs.findIndex((item) => item.id === design.id);
    if (index >= 0) designs[index] = design; else designs.unshift(design);
    return this.write(DESIGNS_KEY, savedDesignsSchema, designs);
  }
}

export const browserStorage = () => new StorageService(window.localStorage);
