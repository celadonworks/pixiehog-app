import { z } from 'zod';

export const WebPixelPostHogEcommerceSpecSchema = z.object({
  posthog_ecommerce_spec: z.boolean(),
});

export type WebPixelTrackedEvents = z.infer<typeof WebPixelPostHogEcommerceSpecSchema>;