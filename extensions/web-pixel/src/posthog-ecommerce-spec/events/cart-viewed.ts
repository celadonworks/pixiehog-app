import type { Shop, StandardEvents } from '@shopify/web-pixels-extension';
interface CartProduct {
  /**
   * Product ID displayed in the cart
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
   * @example 'BLACKFRIDAY'
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

interface CartViewedEvent {
  /**
   * Shopping cart ID
   * @example 'e1f17b1ed3ec47a298a05838'
   */
  cart_id: string | null;

  /**
   * Products displayed in the cart
   * @example See full example in interface usage below
   */
  products: CartProduct[];
}
export function cartViewedSpec(shop: Shop, event: StandardEvents['cart_viewed']): CartViewedEvent {
  //https://posthog.com/docs/data/event-spec/ecommerce-events#cart-viewed
  const cart = event.data.cart;
  return {
    cart_id: cart?.id || null,
    products: cart?.lines.length
      ? cart?.lines.map<CartProduct>((line, index) => {
          return {
            // if custom product things are is null
            brand: null,
            category: null,
            coupon: null,
            image_url: line.merchandise.image?.src || null,
            name: line.merchandise.title || null,
            position: index + 1,
            price: line.merchandise.price.amount,
            product_id: line.merchandise.product.id || null,
            quantity: line.quantity,
            sku: line.merchandise.sku || null,
            url: line.merchandise.product.url || null,
            variant: line.merchandise.title || null,
          };
        })
      : [],
  };
}
