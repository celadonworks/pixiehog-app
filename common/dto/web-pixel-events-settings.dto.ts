import { z } from "zod";

export const WebPixelEventsSettingsSchema = z.object({
  cart_viewed: z.boolean()
  .describe(
    `event logs an instance where a customer visited the cart page.`
  )
  .default(true),

  checkout_address_info_submitted: z.boolean()
  .describe(
    `event logs an instance of a customer submitting their mailing address. This event is only available in checkouts where Checkout Extensibility for customizations is enabled`
  )
  .default(false),

  checkout_completed: z.boolean()
  .describe(
    `event logs when a visitor completes a purchase. It's triggered once for each checkout, typically on the Thank you page. However, for upsells and post purchases, the 'checkout_completed' event is triggered on the first upsell offer page instead. The event isn't triggered again on the Thank you page. If the page where the event is supposed to be triggered fails to load, then the 'checkout_completed' event isn't triggered at all.`
  )
  .default(true),

  checkout_contact_info_submitted: z.boolean()
    .describe(
      `event logs an instance where a customer submits a checkout form. This event is only available in checkouts where Checkout Extensibility for customizations is enabled`
    )
    .default(true),

  checkout_shipping_info_submitted: z.boolean()
    .describe(
      `event logs an instance where the customer chooses a shipping rate. This event is only available in checkouts where Checkout Extensibility for customizations is enabled`
    )
    .default(false),

  checkout_started: z.boolean()
    .describe(
      `event logs an instance of a customer starting the checkout process. This event is available on the checkout page. For Checkout Extensibility, this event is triggered every time a customer enters checkout. For non-checkout extensible shops, this event is only triggered the first time a customer enters checkout.`
    )
    .default(true),

  collection_viewed: z.boolean()
    .describe(
      `event logs an instance where a customer visited a product collection index page. This event is available on the online store page.`
    )
    .default(false),

  page_viewed: z.boolean()
    .describe(
      `event logs an instance where a customer visited a page. This event is available on the online store, checkout, and Order status pages.`
    )
    .default(true),

  payment_info_submitted: z.boolean()
    .describe(
      `event logs an instance of a customer submitting their payment information. This event is available on the checkout page.`
    )
    .default(false),

  product_added_to_cart: z.boolean()
    .describe(
      `event logs an instance where a customer adds a product to their cart. This event is available on the online store page.`
    )
    .default(true),

  product_removed_from_cart: z.boolean()
    .describe(
      `event logs an instance where a customer removes a product from their cart. This event is available on the online store page.`
    )
    .default(true),

  product_viewed: z.boolean()
    .describe(
      `event logs an instance where a customer visited a product details page. This event is available on the product page.`
    )
    .default(false),

  search_submitted: z.boolean()
    .describe(
      `event logs an instance where a customer performed a search on the storefront. The products returned from the search query are in this event object (the first product variant for each product is listed in the array). This event is available on the online store page.`
    )
    .default(false),

  clicked: z.boolean()
    .describe(
      `event logs an instance where a customer clicks on a page element.`
    )
    .default(false),
  form_submitted: z.boolean()
    .describe(
      `event logs an instance where a form on a page is submitted.`
    )
    .default(false),

  /** 
    input_blurred: z.boolean()
    .describe(
      `event logs an instance where an input on a page loses focus.`
    )
    .default(false),
    */
    /**
  input_changed: z.boolean()
    .describe(
      `event logs an instance where an input value changes.`
    )
    .default(false),
     */
    /**
     * 
    input_focused: z.boolean()
    .describe(
      `event logs an instance where an input on a page gains focus.`
    )
    .default(false),
    */

});

export type WebPixelEventsSettings = z.infer<typeof WebPixelEventsSettingsSchema>;
