import type { Shop, StandardEvents } from '@shopify/web-pixels-extension';

interface ProductAddedOrRemovedEvent {
  /**
   * Cart ID the product was removed from
   * @example '2249490906054e33aabc2983'
   */
  cart_id: string | null;

  /**
   * Database ID of the product
   * @example '101c66c0b37f47bc9c75561f'
   */
  product_id: string | null;

  /**
   * SKU (Stock Keeping Unit) of the product
   * @example '94839-23'
   */
  sku: string | null;

  /**
   * Product category
   * @example 'merch'
   */
  category: string | null;

  /**
   * Name of the product
   * @example 'Danger t-shirt'
   */
  name: string | null;

  /**
   * Brand associated with the product
   * @example 'PostHog'
   */
  brand: string | null;

  /**
   * Variant of the product
   * @example 'blue'
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
   * Position in the product list
   * @example 3
   */
  position: number | null;

  /**
   * URL of the product page
   * @example 'https://posthog.com/merch?product=danger-t-shirt'
   */
  url: string | null;

  /**
   * Image URL of the product
   * @example 'https://cdn.shopify.com/s/files/1/0452/0935/4401/files/cautiontee4_1000x1000_crop_center.jpg'
   */
  image_url: string | null;
}

export function productRemovedOrAddedSpec(
  shop: Shop,
  event: StandardEvents['product_added_to_cart'] | StandardEvents['product_removed_from_cart']
): ProductAddedOrRemovedEvent {
  //https://posthog.com/docs/data/event-spec/ecommerce-events#product-removed
  const cartLine = event.data.cartLine;

  return {
    brand: null,
    cart_id: null,
    category: null,
    coupon: null,
    position: null,
    image_url: cartLine?.merchandise.image?.src || null,
    name: cartLine?.merchandise.product.title || null,
    price: cartLine?.merchandise.price.amount || null,
    product_id: cartLine?.merchandise.product.id || null,
    quantity: cartLine?.quantity || null,
    sku: cartLine?.merchandise.sku || null,
    url: cartLine?.merchandise.product.url || null,
    variant: cartLine?.merchandise.title || null,
  };
}
