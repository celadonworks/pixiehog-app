import { z } from 'zod';

export const WebPixelTrackedEventsSchema = z.object({
  tracked_events: z.string().describe('JSON array of events to be tracked by web pixel')
});

export type WebPixelTrackedEvents = z.infer<typeof WebPixelTrackedEventsSchema>;