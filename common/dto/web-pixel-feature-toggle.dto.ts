import { z } from "zod";

export const WebPixelFeatureToggleSchema = z.object({
  web_pixel_feature_toggle: z.boolean().default(false),
});

export type WebPixelFeatureToggle = z.infer<typeof WebPixelFeatureToggleSchema>;
