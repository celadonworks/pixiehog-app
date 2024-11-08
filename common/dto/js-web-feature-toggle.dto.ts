import { z } from "zod";

export const JsWebPosthogFeatureToggleSchema = z.object({
  js_web_posthog_feature_toggle: z.boolean().default(false),
});

export type JsWebPosthogFeatureToggle = z.infer<typeof JsWebPosthogFeatureToggleSchema>;
