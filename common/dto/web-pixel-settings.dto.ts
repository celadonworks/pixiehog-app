import type { z } from 'zod';
import { PosthogApiKeySchema } from './posthog-api-key.dto';
import { PosthogApiHostSchema } from './posthog-api-host.dto';
import { DataCollectionStrategySchema } from './data-collection-stratergy';
import { WebPixelTrackedEventsSchema } from './web-pixel-tracked-events.dto';

export const WebPixelSettingsSchema = PosthogApiKeySchema.merge(PosthogApiHostSchema)
  .merge(DataCollectionStrategySchema)
  .merge(WebPixelTrackedEventsSchema);

export type WebPixelSettings = z.infer<typeof WebPixelSettingsSchema>;
