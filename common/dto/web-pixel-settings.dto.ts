import type { z } from "zod";
import { PosthogApiKeySchema } from "./posthog-api-key.dto";
import { PosthogApiHostSchema } from "./posthog-api-host.dto";
import { WebPixelEventsSettingsSchema } from "./web-pixel-events-settings.dto";

export const WebPixelSettingsSchema = WebPixelEventsSettingsSchema.merge(PosthogApiKeySchema).merge(PosthogApiHostSchema);


export type WebPixelSettings = z.infer<typeof WebPixelSettingsSchema>;