import { z } from "zod";

export const WebPixelFeatureToggleSchema = z.object({
  web_pixel_feature_toggle: z.enum(['false', 'true']),
});

export type WebPixelFeatureToggle = z.infer<typeof WebPixelFeatureToggleSchema>;
