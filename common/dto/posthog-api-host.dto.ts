import { z } from 'zod';

export const PosthogApiHostSchema = z.object({
  posthog_api_host: z.string().describe('PostHog API Host.').trim().url().default('')
});

export type PosthogApiHost = z.infer<typeof PosthogApiHostSchema>;