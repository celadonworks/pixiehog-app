import type { Shop, StandardEvents } from "@shopify/web-pixels-extension";
interface Product {
  /**
   * Database ID of the product
   * @example 'c6e74d89b70b4972b867eb62'
   */
  product_id: string | null;

  /**
   * SKU (Stock Keeping Unit) of the product
   * @example '18499-12'
   */
  sku: string | null;

  /**
   * Product category
   * @example 'merch'
   */
  category: string | null;

  /**
   * Name of the product
   * @example 'Data warehouse t-shirt'
   */
  name: string | null;

  /**
   * Brand associated with the product
   * @example 'PostHog'
   */
  brand: string | null;

  /**
   * Variant of the product
   * @example 'light'
   */
  variant: string | null;

  /**
   * Price ($) of the product
   * @example 30
   */
  price: number | null;

  /**
   * Quantity of a product
   * @example 1
   */
  quantity: number | null;

  /**
   * Coupon code for the product
   * @example 'SUMMER_SALE'
   */
  coupon?: string | null;

  /**
   * Position in the product list
   * @example 3
   */
  position: number;

  /**
   * URL of the product page
   * @example 'https://posthog.com/merch?product=data-warehouse-t-shirt'
   */
  url: string | null;

  /**
   * Image URL of the product
   * @example 'https://cdn.shopify.com/s/files/1/0452/0935/4401/files/DSC07095_1017x1526_crop_center.jpg'
   */
  image_url: string | null;
}

interface OrderCompletedEvent {
  /**
   * Checkout ID
   * @example 'e461659ed1714b9ebc3299ae'
   */
  checkout_id: string | null;

  /**
   * Order/transaction ID
   * @example '3e94e72c0a7443e9b51155a3'
   */
  order_id: string | null;

  /**
   * Store or affiliation from which this transaction occurred
   * @example 'Shopify'
   */
  affiliation: string | null;

  /**
   * Order total after discounts but before taxes and shipping
   * @example 75
   */
  subtotal: number | null;

  /**
   * Total with shipping and taxes
   * @example 80
   */
  total: number | null;

  /**
   * Revenue (including discounts, excluding shipping/taxes)
   * @example 90.00
   */
  revenue: number | null;

  /**
   * Shipping cost
   * @example 3
   */
  shipping: number | null;

  /**
   * Total tax
   * @example 2
   */
  tax: number | null;

  /**
   * Total discount
   * @example 15
   */
  discount: number | null;

  /**
   * Transaction coupon redeemed
   * @example 'BLACKFRIDAY'
   */
  coupon: string | null;

  /**
   * Currency code
   * @example 'USD'
   */
  currency: string | null;

  /**
   * Products in the order
   * @example See Product interface examples
   */
  products: Product[];
}
export function orderCompletedSpec(
  shop: Shop,
  event: StandardEvents['checkout_completed']
): OrderCompletedEvent {
  //https://posthog.com/docs/data/event-spec/ecommerce-events#payment-info-entered
  const checkout = event.data.checkout;
  return {
    checkout_id: checkout.token || null,
    order_id: checkout.order?.id || null,
    affiliation: shop.myshopifyDomain,
    subtotal: checkout.subtotalPrice?.amount || null,
    total: checkout.totalPrice?.amount || null,
    revenue: checkout.subtotalPrice?.amount || null,
    shipping: checkout.shippingLine?.price.amount || null,
    tax: checkout.totalTax.amount || null,
    discount: checkout.discountsAmount?.amount || null,
    coupon:
      checkout.discountApplications.length > 0
        ? checkout.discountApplications.map((discount) => discount.title).join(',')
        : null,
    currency: checkout.currencyCode,
    products: checkout.lineItems.map((lineItem, index) => {
      return {
        product_id: lineItem.id,
        sku: lineItem.variant?.sku || null,
        category: null,
        name: lineItem.title,
        brand: null,
        variant: lineItem.variant?.untranslatedTitle || lineItem.variant?.title || null,
        price: lineItem.finalLinePrice.amount,
        quantity: lineItem.quantity,
        coupon:
          lineItem.discountAllocations.length > 0
            ? lineItem.discountAllocations.map((discount) => discount.discountApplication.title).join(',')
            : null,
        position: index + 1,
        url: lineItem.variant?.product.url || null,
        image_url: lineItem.variant?.image?.src || null,
      }
    })
  };
}