import { z } from 'zod';

export const posthogApiHostPrimitive = z.string().describe('PostHog API Host.').trim().url().default('')

export const PosthogApiHostSchema = z.object({
  posthog_api_host: posthogApiHostPrimitive
});

export type PosthogApiHost = z.infer<typeof PosthogApiHostSchema>;
export type PosthogApiHostPrimitive = z.infer<typeof posthogApiHostPrimitive>;