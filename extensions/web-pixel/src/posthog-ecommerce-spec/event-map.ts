export const webPixelToPostHogEcommerceSpecMap: Record<string, string | undefined> = {
  page_viewed: '$pageview',
  search_submitted: 'Product List Filtered',
  collection_viewed: 'Product List Viewed',
  product_viewed: 'Product Viewed',
  product_added_to_cart: 'Product Added',
  product_removed_from_cart: 'Product Removed',
  cart_viewed: 'Cart Viewed',
  checkout_started: 'Checkout Started',
  checkout_address_info_submitted: 'Checkout Step Completed',
  checkout_contact_info_submitted: 'Checkout Step Completed',
  checkout_shipping_info_submitted: 'Checkout Step Completed',
  payment_info_submitted: 'Payment Info Entered',
  checkout_completed: 'Order Completed',
};