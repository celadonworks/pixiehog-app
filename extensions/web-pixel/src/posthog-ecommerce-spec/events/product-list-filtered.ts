import type { Shop, StandardEvents } from "@shopify/web-pixels-extension";
interface Filter {
  /**
   * ID of the filter type being used
   * @example 'department'
   */
  type: string;

  /**
   * ID of the selection that the customer chose
   * @example 'merch'
   */
  value: string;
}

interface Sort {
  /**
   * ID of the sort type being used
   * @example 'price'
   */
  type: string;

  /**
   * ID of the selection type being used (ascending, descending)
   * @example 'desc'
   */
  value: string;
}

interface Product {
  /**
   * Product ID displayed on the list
   * @example '17584e91ae1abff0d355e3f5'
   */
  product_id: string | null;

  /**
   * SKU (Stock Keeping Unit) of the product
   * @example '92849-15'
   */
  sku: string | null;

  /**
   * Product category
   * @example 'merch'
   */
  category: string | null;

  /**
   * Name of the product
   * @example 'Copy/pasta t-shirt'
   */
  name: string | null;

  /**
   * Brand associated with the product
   * @example 'PostHog'
   */
  brand?: string | null;

  /**
   * Variant of the product
   * @example 'dark'
   */
  variant?: string | null;

  /**
   * Price ($) of the product
   * @example 30
   */
  price: number | null;

  /**
   * Quantity of a product
   * @example 1
   */
  quantity?: number | null;

  /**
   * Coupon code for the product
   * @example 'MAY_DEALS_3'
   */
  coupon?: string | null;

  /**
   * Position in the product list
   * @example 1
   */
  position: number;

  /**
   * URL of the product page
   * @example 'https://posthog.com/merch?product=copy-pasta-t-shirt'
   */
  url: string | null;

  /**
   * Image URL of the product
   * @example 'https://cdn.shopify.com/s/files/1/0452/0935/4401/files/DSC07153_813x1219_crop_center.jpg'
   */
  image_url: string | null;
}

interface ProductListFilteredEvent {
  /**
   * Product list being viewed
   * @example 'list1'
   */
  list_id: string | null;

  /**
   * Product category being viewed
   * @example 'apparel'
   */
  category: string | null;

  /**
   * Product filters being used
   * @example [{ type: 'department', value: 'merch' }]
   */
  filters: Filter[];

  /**
   * Product sorting being used
   * @example [{ type: 'price', value: 'desc' }]
   */
  sorts: Sort[];

  /**
   * Products displayed in the filtered list
   * @example See product interface examples
   */
  products: Product[];
}
export function productListFilteredSpec(
  shop: Shop,
  event: StandardEvents['search_submitted']
): ProductListFilteredEvent {
  //https://posthog.com/docs/data/event-spec/ecommerce-events#product-list-filtered
  const searchResult = event.data.searchResult;

  return {
    list_id: null,
    category: null,
    filters: [
      {
        type: 'q',
        value: searchResult.query
      },
    ],
    sorts: [],
    products: searchResult.productVariants.map((productVariant, index) => {
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
