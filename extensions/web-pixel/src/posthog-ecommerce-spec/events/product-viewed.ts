import type { Shop, StandardEvents } from "@shopify/web-pixels-extension";

interface ProductViewedEvent {
  /**
   * Database ID of the product
   * @example '1bdfef47c9724b58b6831933'
   */
  product_id: string | null;

  /**
   * SKU (Stock Keeping Unit) of the product
   * @example '43431-18'
   */
  sku: string | null;

  /**
   * Product category
   * @example 'merch'
   */
  category: string | null;

  /**
   * Name of the product
   * @example 'Tactical black t-shirt'
   */
  name: string | null;

  /**
   * Brand associated with the product
   * @example 'PostHog'
   */
  brand: string | null;

  /**
   * Variant of the product
   * @example 'dark'
   */
  variant: string | null;

  /**
   * Price ($) of the product
   * @example 30
   */
  price: number | null;

  /**
   * Quantity of the product
   * @example 1
   */
  quantity: number | null;

  /**
   * Coupon code for the product
   * @example 'BLACKFRIDAY'
   */
  coupon: string | null;

  /**
   * Currency of the transaction
   * @example 'usd'
   */
  currency: string | null;

  /**
   * Position in the product list
   * @example 3
   */
  position: number | null;

  /**
   * Total value of the product
   * @example 30
   */
  value: number | null;

  /**
   * URL of the product page
   * @example 'https://posthog.com/merch?product=tactical-black-t-shirt'
   */
  url: string | null;

  /**
   * Image URL of the product
   * @example 'https://cdn.shopify.com/s/files/1/0452/0935/4401/files/darkmode_tee_5_1000x1000_crop_center.jpg'
   */
  image_url: string | null;
}

export function productViewedSpec(
  shop: Shop,
  event: StandardEvents['product_viewed']
): ProductViewedEvent {
  //https://posthog.com/docs/data/event-spec/ecommerce-events#product-viewed
  const productVariant = event.data.productVariant;

  return {
    brand: null,
    category: null,
    coupon: null,
    position: null,
    image_url: productVariant.image?.src || null,
    name: productVariant.product.title || null,
    price: productVariant.price.amount || null,
    value: productVariant.price.amount || null,
    product_id: productVariant.product.id || null,
    quantity: 1,
    sku: productVariant.sku || null,
    url: productVariant.product.url || null,
    variant: productVariant.title || null,
    currency: productVariant.price.currencyCode || null,
  };
}
