import type { z } from "zod";
import { PosthogApiKeySchema } from "./posthog-api-key.dto";
import { WebPixelEventsSettingsSchema } from "./web-pixel-events-settings.dto";

export const WebPixelSettingsSchema = WebPixelEventsSettingsSchema.merge(PosthogApiKeySchema);


export type WebPixelSettings = z.infer<typeof WebPixelSettingsSchema>;