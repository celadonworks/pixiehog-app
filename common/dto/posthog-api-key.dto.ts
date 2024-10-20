import { z } from 'zod';

export const PosthogApiKeySchema = z.object({
  posthog_api_key: z.string().trim().startsWith('phc_').or(z.literal('')),
});

export type PosthogApiKey = z.infer<typeof PosthogApiKeySchema>;