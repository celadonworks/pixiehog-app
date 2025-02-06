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

  async function resetPosthog() {
    const POSTHOG_KEY = `ph_${posthog_api_key}_posthog`;
    const distinct_id = uuidv7();
    await localStorage.setItem(POSTHOG_KEY, JSON.stringify({ distinct_id }));
  }
  const posthog = new PostHog(posthog_api_key, {
    fetch: fetch,
    host: posthog_api_host,
    persistence: 'memory',
    flushAt: 10,
    flushInterval: 100,
    bootstrap: {
      distinctId: await resolveDistinctId(),
      isIdentifiedId: false,
    },
  });
  type ValueOf<T> = T[keyof T];
  function preprocessEvent<T extends ValueOf<StandardEvents>>(fn: (t: T, u: string | undefined, p: boolean) => void) {
    return async (event: T) => {
      // if event is disabled by merchant skip
      if (settings[event.name as keyof WebPixelSettings] === 'false') {
        return;
      }
      const uuid: string | undefined = event.id;
      const validateEventUUID: string | undefined = extractEventUUID(uuid);
      const anonymous: boolean = (() =>{

        if(settings.data_collection_strategy == 'anonymized') {
          return true
        }
        if(settings.data_collection_strategy == 'non-anonymized') {
          return false
        }
        if(settings.data_collection_strategy == 'non-anonymized-by-consent') {
          return  !customerPrivacyStatus.analyticsProcessingAllowed
        }
        return true
      })()
    
      const PXHOG_ANONYMOUS_KEY = 'pxhog_anonymous_key';

      const localStorageAnonymous = await localStorage.getItem(PXHOG_ANONYMOUS_KEY) as 'true' | 'false' | null;
      if (localStorageAnonymous === null) {
        await localStorage.setItem(PXHOG_ANONYMOUS_KEY, anonymous);
      }
      if (
        localStorageAnonymous !== null &&
        localStorageAnonymous != String(anonymous) && anonymous == true) {
        await resetPosthog();
      }
      if (
        localStorageAnonymous !== null &&
        localStorageAnonymous != String(anonymous)) {
        await localStorage.setItem(PXHOG_ANONYMOUS_KEY, anonymous);
      }
      
      fn(event, validateEventUUID, anonymous);
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
      preprocessEvent(async (event, uuid, anonymous) => {
        const distinctId = await resolveDistinctId();

        posthog.capture({
          ...(uuid ? { uuid: uuid } : {}),
          distinctId,
          event: event.name,
          timestamp: new Date(event.timestamp),
          properties: {
            ...{
              ...initProperties,
              ...(anonymous == true && {
                customer: undefined,
                purchasingCompany: undefined,
              }),
              cart: undefined,
            },
            client_id: event.clientId,
            url: event.context.document.location.href,
            $current_url: event.context.document.location.href,
            ...{
              ...event.data.checkout,
              ...(anonymous == true && {
                billingAddress: undefined,
                email: undefined,
                order: {
                  ...event.data.checkout.order,
                  customer: {
                    ...event.data.checkout.order?.customer,
                    id: undefined,
                  },
                  id: undefined,
                },
                phone: undefined,
                shippingAddress: undefined,
                smsMarketingPhone: undefined,
              }),
            },
            ...(event.name == 'checkout_contact_info_submitted' &&
              event.data.checkout.email &&
              anonymous == false && {
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
      preprocessEvent(async (event, uuid, anonymous) => {
        const distinctId = await resolveDistinctId();
        posthog.capture({
          ...(uuid ? { uuid: uuid } : {}),
          distinctId,
          event: event.name,
          timestamp: new Date(event.timestamp),
          properties: {
            ...{
              ...initProperties,
              ...(anonymous == true && {
                customer: undefined,
                purchasingCompany: undefined,
              }),
            },
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

  const mouseEventsKeys = ['clicked', 'input_blurred', 'input_changed'] as const;
  for (const key of mouseEventsKeys) {
    analytics.subscribe(
      key,
      preprocessEvent(async (event, uuid, anonymous) => {
        // DOM events do not have window/document context
        // cannot set URL
        const distinctId = await resolveDistinctId();
        posthog.capture({
          ...(uuid ? { uuid: uuid } : {}),
          distinctId,
          event: event.name,
          timestamp: new Date(event.timestamp),
          properties: {
            ...{
              ...initProperties,
              ...(anonymous == true && {
                customer: undefined,
                purchasingCompany: undefined,
              }),
            },
            client_id: event.clientId,
            ...event.data.element,
          },
        });
      })
    );
  }

  analytics.subscribe(
    'page_viewed',
    preprocessEvent(async (event, uuid, anonymous) => {
      const distinctId = await resolveDistinctId();
      posthog.capture({
        ...(uuid ? { uuid: uuid } : {}),
        distinctId,
        event: event.name,
        timestamp: new Date(event.timestamp),
        properties: {
          ...{
            ...initProperties,
            ...(anonymous == true && {
              customer: undefined,
              purchasingCompany: undefined,
              $process_person_profile: false,
            }),
          },
          client_id: event.clientId,
          url: event.context.document.location.href,
          $current_url: event.context.document.location.href,
          ...event.data,
          /**set person properties in 1 call, this is most frequent event */
          ...(init.data.customer &&
            anonymous == false && {
              $set: init.data.customer,
            }),
        },
      });
    })
  );

  analytics.subscribe(
    'collection_viewed',
    preprocessEvent(async (event, uuid, anonymous) => {
      const distinctId = await resolveDistinctId();
      posthog.capture({
        ...(uuid ? { uuid: uuid } : {}),
        distinctId,
        event: event.name,
        timestamp: new Date(event.timestamp),
        properties: {
          ...{
            ...initProperties,
            ...(anonymous == true && {
              customer: undefined,
              purchasingCompany: undefined,
            }),
          },
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
    preprocessEvent(async (event, uuid, anonymous) => {
      const distinctId = await resolveDistinctId();
      posthog.capture({
        ...(uuid ? { uuid: uuid } : {}),
        distinctId,
        event: event.name,
        timestamp: new Date(event.timestamp),
        properties: {
          ...{
            ...initProperties,
            ...(anonymous == true && {
              customer: undefined,
              purchasingCompany: undefined,
            }),
          },
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
    preprocessEvent(async (event, uuid, anonymous) => {
      const distinctId = await resolveDistinctId();

      posthog.capture({
        ...(uuid ? { uuid: uuid } : {}),
        distinctId,
        event: event.name,
        timestamp: new Date(event.timestamp),
        properties: {
          ...{
            ...initProperties,
            ...(anonymous == true && {
              customer: undefined,
              purchasingCompany: undefined,
            }),
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
    preprocessEvent(async (event, uuid, anonymous) => {
      const distinctId = await resolveDistinctId();
      posthog.capture({
        ...(uuid ? { uuid: uuid } : {}),
        distinctId,
        event: event.name,
        timestamp: new Date(event.timestamp),
        properties: {
          ...{
            ...initProperties,
            ...(anonymous == true && {
              customer: undefined,
              purchasingCompany: undefined,
            }),
          },
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
    preprocessEvent(async (event, uuid, anonymous) => {
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
        ...(uuid ? { uuid: uuid } : {}),
        distinctId,
        event: event.name,
        timestamp: new Date(event.timestamp),
        properties: {
          ...{
            ...initProperties,
            ...(anonymous == true && {
              customer: undefined,
              purchasingCompany: undefined,
            }),
          },
          client_id: event.clientId,
          form: event.data.element.elements,
          form_body: formBody,
          action: event.data.element.action,
          ...(email &&
            anonymous == false && {
              $set: {
                email: email,
              },
            }),
        },
      });
    })
  );
});
