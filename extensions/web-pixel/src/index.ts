import type { CustomerPrivacyPayload, StandardEvents } from '@shopify/web-pixels-extension';
import { register } from '@shopify/web-pixels-extension';
import { PostHog } from 'posthog-node';
import { v7 as uuidv7 } from 'uuid';
import type { WebPixelSettings } from '../../../common/dto/web-pixel-settings.dto';
import { extractEventUUID } from './validate-uuid';

register(async (extensionApi) => {  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    analytics,
    browser: { localStorage },
    init,
    customerPrivacy,
  } = extensionApi;
  const settings = extensionApi.settings as WebPixelSettings;
  const { posthog_api_key, posthog_api_host } = settings;
  if (!posthog_api_key) {
    throw new Error('ph_project_api_key is undefined');
  }

  let customerPrivacyStatus: CustomerPrivacyPayload['customerPrivacy'] = init.customerPrivacy;

  async function resolveDistinctId() {
    const POSTHOG_KEY = `ph_${posthog_api_key}_posthog`;
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

  const posthog = new PostHog(posthog_api_key, {
    fetch: fetch,
    host: posthog_api_host,
    persistence: 'memory',
    flushAt: 1,
    flushInterval: 0,
    bootstrap: {
      distinctId: await resolveDistinctId(),
      isIdentifiedId: false,
    },
    

  });


  type ValueOf<T> = T[keyof T];
  function preprocessEvent<T extends ValueOf<StandardEvents>>(fn: (t: T, u: string | undefined) => void) {
    return (event: T) => {
      if (customerPrivacyStatus.analyticsProcessingAllowed == false) {
        return;
      }
      // if event is disabled by merchant skip
      if (settings[event.name as keyof WebPixelSettings] === 'false') {
        return;
      }
      const uuid: string | undefined = event.id
      const validateEventUUID: string | undefined = extractEventUUID(uuid)

      fn(event, validateEventUUID);
    };
  }

  customerPrivacy.subscribe('visitorConsentCollected', (event) => {
    customerPrivacyStatus = event.customerPrivacy;
  });

  const initProperties = {
    shop: init.data.shop,
    ...(init.data.customer && {
      customer: init.data.customer,
    }),
    // this might be out of date if the store uses side-cart
    ...(init.data.cart && {
      cart: init.data.cart,
    }),
  } as const;
  const checkoutKeys = [
    'checkout_started',
    'checkout_completed',
    'checkout_shipping_info_submitted',
    'checkout_contact_info_submitted',
    'checkout_address_info_submitted',
    'payment_info_submitted',
  ] as const;
  for (const key of checkoutKeys) {
    analytics.subscribe(
      key,
      preprocessEvent(async (event,uuid) => {
        const distinctId = await resolveDistinctId();
        
        posthog.capture({
          ...(uuid ? {uuid: uuid} : {}),
          distinctId,
          event: event.name,  
          properties: {
            ...{
              ...initProperties,
              cart: undefined,
            },
            client_id: event.clientId,
            url: event.context.document.location.href,
            $current_url: event.context.document.location.href,
            timestamp: event.timestamp,
            ...event.data.checkout,
            ...(event.name == 'checkout_contact_info_submitted' &&
              event.data.checkout.email && {
                $set: {
                  email: event.data.checkout.email,
                },
              }),
          },
        });
      })
    );
  }

  const productCartKeys = ['product_added_to_cart', 'product_removed_from_cart'] as const;
  for (const key of productCartKeys) {
    analytics.subscribe(
      key,
      preprocessEvent(async (event, uuid) => {
        const distinctId = await resolveDistinctId();
        posthog.capture({
          ...(uuid ? {uuid: uuid} : {}),
          distinctId,
          event: event.name,
          timestamp: new Date(event.timestamp),
          properties: {
            ...initProperties,
            client_id: event.clientId,
            url: event.context.document.location.href,
            $current_url: event.context.document.location.href,
            ...(event.data.cartLine && {
              ...{
                ...event.data.cartLine.merchandise,
              },
              ...{
                cost: event.data.cartLine.cost,
                quantity: event.data.cartLine.quantity,
              },
            }),
          },
        });
      })
    );
  }

  const mouseEventsKeys = ['clicked', 'input_blurred', 'input_focused', 'input_changed'] as const;
  for (const key of mouseEventsKeys) {
    analytics.subscribe(
      key,
      preprocessEvent(async (event,uuid) => {
        // DOM events do not have window/document context
        // cannot set URL
        const distinctId = await resolveDistinctId();
        posthog.capture({
          ...(uuid ? {uuid: uuid} : {}),
          distinctId,
          event: event.name,
          timestamp: new Date(event.timestamp),
          properties: {
            ...initProperties,
            client_id: event.clientId,
            ...event.data.element,
          },
        });
      })
    );
  }

  analytics.subscribe(
    'page_viewed',
    preprocessEvent(async (event,uuid) => {
      const distinctId = await resolveDistinctId();
      posthog.capture({
        ...(uuid ? {uuid: uuid} : {}),
        distinctId,
        event: event.name,
        timestamp: new Date(event.timestamp),
        properties: {
          ...initProperties,
          client_id: event.clientId,
          url: event.context.document.location.href,
          $current_url: event.context.document.location.href,
          ...event.data,
          /**set person properties in 1 call, this is most frequent event */
          ...(init.data.customer && {
            $set: init.data.customer,
          }),
        },
      });
    })
  );

  analytics.subscribe(
    'collection_viewed',
    preprocessEvent(async (event,uuid) => {
      const distinctId = await resolveDistinctId();
      posthog.capture({
        ...(uuid ? {uuid: uuid} : {}),
        distinctId,
        event: event.name,
        timestamp: new Date(event.timestamp),
        properties: {
          ...initProperties,
          client_id: event.clientId,
          url: event.context.document.location.href,
          $current_url: event.context.document.location.href,
          ...event.data.collection,
        },
      });
    })
  );

  analytics.subscribe(
    'product_viewed',
    preprocessEvent(async (event,uuid) => {
      const distinctId = await resolveDistinctId();
      posthog.capture({
        ...(uuid ? {uuid: uuid} : {}),
        distinctId,
        event: event.name,
        timestamp: new Date(event.timestamp),
        properties: {
          ...initProperties,
          client_id: event.clientId,
          url: event.context.document.location.href,
          $current_url: event.context.document.location.href,
          ...event.data.productVariant,
        },
      });
    })
  );

  analytics.subscribe(
    'cart_viewed',
    preprocessEvent(async (event,uuid) => {
      const distinctId = await resolveDistinctId();
      posthog.capture({
        ...(uuid ? {uuid: uuid} : {}),
        distinctId,
        event: event.name,
        timestamp: new Date(event.timestamp),
        properties: {
          ...{
            ...initProperties,
            cart: undefined,
          },
          client_id: event.clientId,
          url: event.context.document.location.href,
          $current_url: event.context.document.location.href,
          ...event.data.cart,
        },
      });
    })
  );

  analytics.subscribe(
    'search_submitted',
    preprocessEvent(async (event,uuid) => {
      const distinctId = await resolveDistinctId();
      posthog.capture({
        ...(uuid ? {uuid: uuid} : {}),
        distinctId,
        event: event.name,
        timestamp: new Date(event.timestamp),
        properties: {
          ...initProperties,
          client_id: event.clientId,
          url: event.context.document.location.href,
          $current_url: event.context.document.location.href,
          ...event.data.searchResult,
        },
      });
    })
  );

  analytics.subscribe(
    'form_submitted',
    preprocessEvent(async (event,uuid) => {
      const distinctId = await resolveDistinctId();
      const emailRegex = /email/i;
      const [email] = event.data.element.elements
        .filter((item) => emailRegex.test(item.id || '') || emailRegex.test(item.name || ''))
        .map((item) => item.value);

      const formBody = Object.fromEntries(
        event.data.element.elements
          .map<[string, string] | undefined>(({ name, value }) => {
            // inputs with no name will be ignored
            if (!name) {
              return undefined;
            }
            return [name, value || ''] as [string, string];
          })
          .filter((el): el is [string, string] => !!el)
      );
      posthog.capture({
        ...(uuid ? {uuid: uuid} : {}),
        distinctId,
        event: event.name,
        timestamp: new Date(event.timestamp),
        properties: {
          ...initProperties,
          client_id: event.clientId,
          form: event.data.element.elements,
          form_body: formBody,
          action: event.data.element.action,
          ...(email && {
            $set: {
              email: email,
            },
          }),
        },
      });
    })
  );
});
