import type { WebPixelSettingChoice } from "./interface/setting-row.interface";
import { WebPixelEventsSettingsSchema } from 'common/dto/web-pixel-events-settings.dto';


export const defaultWebPixelSettings: WebPixelSettingChoice[] = Object.entries(WebPixelEventsSettingsSchema.shape).map<WebPixelSettingChoice>(([key,item]) =>{
  let testingItem = item
  const defaultValue = testingItem._def.defaultValue()

  
  while( testingItem.isOptional() || testingItem.isNullable()){
    testingItem = testingItem._def.innerType
  }
  const types = {
    ZodEnum: "Select",
    ZodString: "Text",
    ZodNumber: "Number",
    ZodBoolean: "Checkbox",
    ZodArray: "List"
  }
  

  
  if(testingItem._def.typeName == "ZodEnum"){
    return {
      key: key,
      description: testingItem._def.description || '',
      filteredOut: false,
      type: types[testingItem._def.typeName],
      value: defaultValue,
      selectOptions: testingItem._def.values,
    }
  }
  return {
    key: key,
    description: testingItem._def.description || '',
    filteredOut: false,
    type: types[testingItem._def.typeName as 'ZodString' || 'ZodNumber' || 'ZodBoolean'],
    value: defaultValue,

  }
  }) as WebPixelSettingChoice[]
/* export const defaultWebPixelSettings: WebPixelSettingChoice[] = [
  {
    key: 'cart_viewed',
    description: 'event logs an instance where a customer visited the cart page.',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'checkout_address_info_submitted',
    description:
      'event logs an instance of a customer submitting their mailing address. This event is only available in checkouts where Checkout Extensibility for customizations is enabled',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'checkout_completed',
    description:
      "event logs when a visitor completes a purchase. It's triggered once for each checkout, typically on the Thank you page. However, for upsells and post purchases, the 'checkout_completed' event is triggered on the first upsell offer page instead. The event isn't triggered again on the Thank you page. If the page where the event is supposed to be triggered fails to load, then the 'checkout_completed' event isn't triggered at all.",
    selected: false,
    filteredOut: false,
  },
  {
    key: 'checkout_contact_info_submitted',
    description:
      'event logs an instance where a customer submits a checkout form. This event is only available in checkouts where Checkout Extensibility for customizations is enabled',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'checkout_shipping_info_submitted',
    description:
      'event logs an instance where the customer chooses a shipping rate. This event is only available in checkouts where Checkout Extensibility for customizations is enabled',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'checkout_started',
    description:
      'event logs an instance of a customer starting the checkout process. This event is available on the checkout page. For Checkout Extensibility, this event is triggered every time a customer enters checkout. For non-checkout extensible shops, this event is only triggered the first time a customer enters checkout.',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'collection_viewed',
    description:
      'event logs an instance where a customer visited a product collection index page. This event is available on the online store page.',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'page_viewed',
    description:
      'event logs an instance where a customer visited a page. This event is available on the online store, checkout, and Order status pages.',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'payment_info_submitted',
    description:
      'event logs an instance of a customer submitting their payment information. This event is available on the checkout page.',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'product_added_to_cart',
    description:
      'event logs an instance where a customer adds a product to their cart. This event is available on the online store page.',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'product_removed_from_cart',
    description:
      'event logs an instance where a customer removes a product from their cart. This event is available on the online store page.',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'product_viewed',
    description:
      'event logs an instance where a customer visited a product details page. This event is available on the product page.',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'search_submitted',
    description:
      'event logs an instance where a customer performed a search on the storefront. The products returned from the search query are in this event object (the first product variant for each product is listed in the array). This event is available on the online store page.',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'clicked',
    description: 'event logs an instance where a customer clicks on a page element.',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'form_submitted',
    description: 'event logs an instance where a form on a page is submitted.',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'input_blurred',
    description: 'event logs an instance where an input on a page loses focus.',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'input_changed',
    description: 'event logs an instance where an input value changes.',
    selected: false,
    filteredOut: false,
  },
  {
    key: 'input_focused',
    description: 'event logs an instance where an input on a page gains focus.',
    selected: false,
    filteredOut: false,
  },
]; */
