import type { Shop, StandardEvents } from '@shopify/web-pixels-extension';
import { checkoutSequencing } from './utils/checkout-sequencing';
interface CheckoutStepCompletedEvent {
  /**
   * Checkout transaction ID
   * @example 'e461659ed1714b9ebc3299ae'
   */
  checkout_id: string | null;

  /**
   * Step number in the checkout process
   * @example 2
   */
  step: number;

  /**
   * Shipping method chosen
   * @example 'DHL'
   */
  shipping_method: string | null;

  /**
   * Payment method chosen
   * @example 'Visa'
   */
  payment_method: string | null;
}

export function checkoutStepCompletedSpec(
  shop: Shop,
  event:
    | StandardEvents['checkout_contact_info_submitted']
    | StandardEvents['checkout_address_info_submitted']
    | StandardEvents['checkout_shipping_info_submitted']
): CheckoutStepCompletedEvent {
  //https://posthog.com/docs/data/event-spec/ecommerce-events#checkout-step-completed
  const checkout = event.data.checkout;
  return {
    checkout_id: checkout.token!,
    payment_method: checkout.transactions.length
      ? checkout.transactions.map((transaction) => transaction.paymentMethod).join(',')
      : null,
    shipping_method: checkout.delivery?.selectedDeliveryOptions.length
      ? checkout.delivery?.selectedDeliveryOptions.map((option) => option.title).join('?')
      : null,
    step: checkoutSequencing.findIndex((sequence) => event.name == sequence) + 1,
  };
}
