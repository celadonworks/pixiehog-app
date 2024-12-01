import { z } from 'zod';

export const posthogApiKeyPrimitive = z.string().trim().startsWith('phc_').or(z.literal(''))

export const PosthogApiKeySchema = z.object({
  posthog_api_key: posthogApiKeyPrimitive,
});

export type PosthogApiKey = z.infer<typeof PosthogApiKeySchema>;
export type posthogApiKeyPrimitive = z.infer<typeof posthogApiKeyPrimitive>;