import { z } from "zod";

export const PosthogEventUUIDSchema = z.object({
  posthog_event_uuid: z.string().uuid()
});

export type PosthogEventUUIDType= z.infer<typeof PosthogEventUUIDSchema>;
