import type { Shop, StandardEvents } from "@shopify/web-pixels-extension";

interface Product {
  /**
   * Product ID displayed on the list
   * @example 'dc2046c33b104932851dbcf4'
   */
  product_id: string | null;

  /**
   * SKU (Stock Keeping Unit) of the product
   * @example '37890-12'
   */
  sku: string | null;

  /**
   * Product category being viewed
   * @example 'merch'
   */
  category: string | null;

  /**
   * Name of the product being viewed
   * @example 'Dark mode PostHog hoodie'
   */
  name: string | null;

  /**
   * Brand associated with the product
   * @example 'PostHog'
   */
  brand: string | null;

  /**
   * Variant of the product
   * @example 'black'
   */
  variant: string | null;

  /**
   * Price ($) of the product
   * @example 80
   */
  price: number;

  /**
   * Quantity of a product
   * @example 1
   */
  quantity: number;

  /**
   * Coupon code for the product
   * @example 'MAY_DEALS_3'
   */
  coupon: string | null;

  /**
   * Position in the product list
   * @example 1
   */
  position: number;

  /**
   * URL of the product page
   * @example 'https://posthog.com/merch?product=black-posthog-hoodie'
   */
  url: string | null;

  /**
   * Image URL of the product
   * @example 'https://cdn.shopify.com/s/files/1/0452/0935/4401/files/DSC05606_1500x1000_crop_center.jpg'
   */
  image_url: string | null;
}

interface ProductListViewedEvent {
  /**
   * Product list being viewed
   * @example 'list1'
   */
  list_id: string;

  /**
   * Product category being viewed
   * @example 'merch'
   */
  category: string | null;

  /**
   * Products displayed in the list
   * @example See Product interface examples
   */
  products: Product[];
}

export function productListViewedSpec(
  shop: Shop,
  event: StandardEvents['collection_viewed']
): ProductListViewedEvent {
  //https://posthog.com/docs/data/event-spec/ecommerce-events#product-list-viewed
  const collection = event.data.collection;

  return {
    list_id: collection.id,
    category: null,
    products: collection.productVariants.map((productVariant, index) => {
      return {
        category: null,
        brand: null,
        coupon: null,
        name: productVariant.product.title || null,
        image_url: productVariant.image?.src || null,
        position: index + 1,
        price: productVariant.price.amount,
        product_id: productVariant.id,
        sku: productVariant.sku || null,
        url: productVariant.product.url || null,
        quantity: 1,
        variant: productVariant.title || null
      }
    })
  };
}