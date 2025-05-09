import type { Shop, StandardEvents } from '@shopify/web-pixels-extension';
import { checkoutSequencing } from '../utils/checkout-sequencing';
interface PaymentInfoEnteredEvent {
  /**
   * Checkout transaction ID
   * @example 'e461659ed1714b9ebc3299ae'
   */
  checkout_id: string;

  /**
   * Order ID (optional)
   * @example 'f9300932fbc04887aa775997'
   */
  order_id: string | null;

  /**
   * Step number in checkout
   * @example 3
   */
  step: number;

  /**
   * Shipping method chosen
   * @example 'UPS Ground'
   */
  shipping_method: string | null;

  /**
   * Payment method chosen
   * @example 'MasterCard'
   */
  payment_method: string | null;
}
export function paymentInfoEnteredSpec(
  shop: Shop,
  event: StandardEvents['payment_info_submitted']
): PaymentInfoEnteredEvent {
  //https://posthog.com/docs/data/event-spec/ecommerce-events#payment-info-entered
  const checkout = event.data.checkout;
  return {
    checkout_id: checkout.token!,
    order_id: checkout.order?.id || null,
    payment_method: checkout.transactions.length
      ? checkout.transactions.map((transaction) => transaction.paymentMethod).join(',')
      : null,
    shipping_method: checkout.delivery?.selectedDeliveryOptions.length
      ? checkout.delivery?.selectedDeliveryOptions.map((option) => option.title).join('?')
      : null,
    step: checkoutSequencing.findIndex((sequence) => event.name == sequence) + 1,
  };
}
