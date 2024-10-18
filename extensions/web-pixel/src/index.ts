import type { CustomerPrivacyPayload} from '@shopify/web-pixels-extension';
import { register } from '@shopify/web-pixels-extension';
import type { WebPixelSettings } from './interface/interface';
import { PostHog } from 'posthog-node';
import { v7 as uuidv7 } from 'uuid';

register(async (extensionApi) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    analytics,
    browser: { localStorage },
    init,
    customerPrivacy,
  } = extensionApi;

  const { ph_project_api_key } = extensionApi.settings as WebPixelSettings;
  if (!ph_project_api_key) {
    throw new Error('ph_project_api_key is undefined');
  }

  let customerPrivacyStatus: CustomerPrivacyPayload['customerPrivacy'] = init.customerPrivacy;
  const hostname = init.context.document.location.hostname;
  const posthogHost = `https://${hostname}/tools/ph-analytics`;
  const posthog = new PostHog(ph_project_api_key, {
    fetch: fetch,
    host: 'https://eu.i.posthog.com',
    persistence: 'memory',
    flushAt: 1,
    flushInterval: 0,
  });

  function preprocessEvent<T>(fn: (t: T) => void) {
    return (event: T) => {
      if (customerPrivacyStatus.analyticsProcessingAllowed == false) {
        return;
      }
      fn(event);
    };
  }
  async function resolveDistinctId() {
    const POSTHOG_KEY = `ph_${ph_project_api_key}_posthog`;
    const webPostHogPersistedString = await localStorage.getItem(POSTHOG_KEY);
    const webPostHogPersisted: {
      distinct_id: string;
    } | null = webPostHogPersistedString ? JSON.parse(webPostHogPersistedString) : null;

    if (webPostHogPersisted?.distinct_id) {
      return webPostHogPersisted?.distinct_id;
    }

    const distinct_id = uuidv7();
    await localStorage.setItem(POSTHOG_KEY, JSON.stringify({ distinct_id }));
    return distinct_id;
  }
  

  const events = {
    cart_viewed: 'cart',
    checkout_address_info_submitted: 'checkout',
    checkout_completed: 'checkout',
    checkout_contact_info_submitted: 'checkout',
    checkout_shipping_info_submitted: 'checkout',
    checkout_started: 'checkout',
    collection_viewed: 'collection',
    page_viewed: null ,
    payment_info_submitted: 'checkout',
    product_added_to_cart: 'cartLine',
    product_removed_from_cart: 'cartLine',
    product_viewed: 'productVariant',
    search_submitted: 'searchResult',
  } ;
  customerPrivacy.subscribe('visitorConsentCollected', (event) => {
    customerPrivacyStatus = event.customerPrivacy;
  });
  for (const [key,value] of Object.entries(events)) {
    analytics.subscribe(key,preprocessEvent(async(event ) => {
      const distinct_id = await resolveDistinctId()
      if (value == "checkout" && event.data[value].email) {
        posthog.identify({
          distinctId: distinct_id,
          properties: {
            email: event.data[value].email,
            url: event.context.document.location.href,
            $current_url: event.context.document.location.href,
          }
        })
      }else{
        posthog.identify({
          distinctId: distinct_id,
          properties: {
            email: event.init.data?.customer?.email,
            url: event.context.document.location.href,
            $current_url: event.context.document.location.href,
          }
        })
      }
      posthog.capture({
        distinctId: distinct_id,
        event: event.name,
        properties: {
          ...(event.data[value] ? event.data[value] :  event.data),
          url: event.context.document.location.href,
          $current_url: event.context.document.location.href,
        },
      });
    }));
  }

});
