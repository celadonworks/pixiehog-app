import type { Shop, StandardEvents } from '@shopify/web-pixels-extension';
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
  price: number;

  /**
   * Quantity of a product
   * @example 1
   */
  quantity: number;

  /**
   * Coupon code for the product
   * @example 'SUMMER_SALE'
   */
  coupon: string | null;

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

interface CheckoutStartedEvent {
  /**
   * Order ID or transaction ID
   * @example '3e94e72c0a7443e9b51155a3'
   */
  order_id: string;

  /**
   * Store or affiliation from which this transaction occurred
   * @example 'Shopify'
   */
  affiliation: string;

  /**
   * Revenue ($) with discounts and coupons added in
   * @example 80
   */
  value: number | null;

  /**
   * Revenue ($) excluding shipping and tax
   * @example 90.00
   */
  revenue: number | null;

  /**
   * Shipping cost associated with the transaction
   * @example 3
   */
  shipping: number | null;

  /**
   * Total tax associated with the transaction
   * @example 2
   */
  tax: number | null;

  /**
   * Total discount associated with the transaction
   * @example 15
   */
  discount: number | null;

  /**
   * Transaction coupon redeemed
   * @example 'BLACKFRIDAY'
   */
  coupon: string | null;

  /**
   * Currency code for the transaction
   * @example 'USD'
   */
  currency: string | null;

  /**
   * Products in the order
   * @example [{ product_id: 'gid://shopify/Product/4444', ... }, ...]
   */
  products: Product[];
}
export function checkoutStartedSpec(shop: Shop, event: StandardEvents['checkout_started']): CheckoutStartedEvent {
  //https://posthog.com/docs/data/event-spec/ecommerce-events#checkout-started
  const checkout = event.data.checkout;
  return {
    order_id: checkout.token!,
    affiliation: shop.myshopifyDomain,
    value: checkout.totalPrice?.amount || null,
    revenue: checkout.subtotalPrice?.amount || null,
    shipping: checkout.shippingLine?.price.amount || null,
    tax: checkout.totalTax.amount || null,
    discount: checkout.discountsAmount?.amount || null,
    coupon:
      checkout.discountApplications.length > 0
        ? checkout.discountApplications.map((discount) => discount.title).join(',')
        : null,
    currency: checkout.currencyCode,
    products: checkout.lineItems.map<Product>((lineItem, index) => {
      return {
        // if custom product things are is null
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
      };
    }),
  };
}
