import type { z } from "zod";
import { PosthogApiKeySchema } from "./posthog-api-key.dto";
import { PosthogApiHostSchema } from "./posthog-api-host.dto";
import { WebPixelEventsSettingsSchema } from "./web-pixel-events-settings.dto";
import { DataCollectionStrategySchema } from "./data-collection-stratergy";

export const WebPixelSettingsSchema = WebPixelEventsSettingsSchema.merge(PosthogApiKeySchema).merge(PosthogApiHostSchema).merge(DataCollectionStrategySchema);


export type WebPixelSettings = z.infer<typeof WebPixelSettingsSchema>;