import type { Shop } from '@shopify/web-pixels-extension';
import { cartViewedSpec } from './events/cart-viewed';
import { checkoutStartedSpec } from './events/checkout-started';
import { checkoutStepCompletedSpec } from './events/checkout-step-completed';
import { paymentInfoEnteredSpec } from './events/payment-info-entered';
import { productRemovedOrAddedSpec } from './events/product-added-removed';
import { productListFilteredSpec } from './events/product-list-filtered';
import { productListViewedSpec } from './events/product-list-viewed';
import { productViewedSpec } from './events/product-viewed';

export const webPixelToPostHogEcommerceSpecTransformerMap: {[key: string]: ((shop: Shop, event: any) => Record<string, any>) | undefined} = {
  search_submitted: productListFilteredSpec,
  collection_viewed: productListViewedSpec,
  product_viewed: productViewedSpec,
  product_added_to_cart: productRemovedOrAddedSpec,
  product_removed_from_cart: productRemovedOrAddedSpec,
  cart_viewed: cartViewedSpec,
  checkout_started: checkoutStartedSpec,
  checkout_address_info_submitted: checkoutStepCompletedSpec,
  checkout_contact_info_submitted: checkoutStepCompletedSpec,
  checkout_shipping_info_submitted: checkoutStepCompletedSpec,
  checkout_completed: paymentInfoEnteredSpec,
}
