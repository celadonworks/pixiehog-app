import { z } from "zod";

export const WebPixelEventsSettingsSchema = z.object({
  cart_viewed: z.enum(['false', 'true']),
  checkout_address_info_submitted: z.enum(['false', 'true']),
  checkout_completed: z.enum(['false', 'true']),
  checkout_contact_info_submitted: z.enum(['false', 'true']),
  checkout_shipping_info_submitted: z.enum(['false', 'true']),
  checkout_started: z.enum(['false', 'true']),
  collection_viewed: z.enum(['false', 'true']),
  page_viewed: z.enum(['false', 'true']),
  payment_info_submitted: z.enum(['false', 'true']),
  product_added_to_cart: z.enum(['false', 'true']),
  product_removed_from_cart: z.enum(['false', 'true']),
  product_viewed: z.enum(['false', 'true']),
  search_submitted: z.enum(['false', 'true']),
  clicked: z.enum(['false', 'true']),
  form_submitted: z.enum(['false', 'true']),
  input_blurred: z.enum(['false', 'true']),
  input_changed: z.enum(['false', 'true']),
  input_focused: z.enum(['false', 'true']),
});

export type WebPixelEventsSettings = z.infer<typeof WebPixelEventsSettingsSchema>;
