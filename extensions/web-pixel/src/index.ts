import type { CustomerPrivacyPayload, PixelEvents, StandardEvents } from '@shopify/web-pixels-extension';
import { register } from '@shopify/web-pixels-extension';
import { v7 as uuidv7 } from 'uuid';
import type { WebPixelSettings } from '../../../common/dto/web-pixel-settings.dto';
import { extractEventUUID } from './validate-uuid';
import { isNumber } from './type-utils';
import type { WebPixelEventsSettings } from '../../../common/dto/web-pixel-events-settings.dto';
import { calculateCampaignParams } from './campaign-params';
import { UAParser } from 'ua-parser-js';
import { getSearchEngine } from './utils';
import { PixieHogPostHog } from './pixiehog-posthog';
import { webPixelToPostHogEcommerceSpecTransformerMap } from './posthog-ecommerce-spec/transformer-map';
import { webPixelToPostHogEcommerceSpecMap } from './posthog-ecommerce-spec/event-map';

register(async (extensionApi) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    analytics,
    browser: { localStorage, sessionStorage },
    init,
    customerPrivacy,
  } = extensionApi;
  const settings = extensionApi.settings as WebPixelSettings & Partial<WebPixelEventsSettings>;
  /**
   * Web Pixel settings can only be strings
   */
  const posthogEcommerceSpecEnabled = String(settings?.posthog_ecommerce_spec || '') == 'true'
  console.log({posthogEcommerceSpecEnabled})
  const possibleEvents: (keyof PixelEvents)[] = [
    'cart_viewed',
    'checkout_address_info_submitted',
    'checkout_completed',
    'checkout_contact_info_submitted',
    'checkout_shipping_info_submitted',
    'checkout_started',
    'clicked',
    'collection_viewed',
    'form_submitted',
    'input_blurred',
    'input_focused',
    'page_viewed',
    'payment_info_submitted',
    'product_added_to_cart',
    'product_removed_from_cart',
    'product_viewed',
    'search_submitted',
  ] as const;
  const settingObjectEvents = possibleEvents.filter((event) => (settings as any)[event] == 'true');
  const trackedEventsSetting = (() => {
    try {
      const events = JSON.parse(settings?.tracked_events || '[]') as string[]
      if (!Array.isArray(events)) {
        throw Error('must be array')
      }
      return events;
    } catch (error) {
        return [] as string[]
    }
  })();

  const activeEvents = [...new Set([...settingObjectEvents, ...trackedEventsSetting])];
  const { posthog_api_key, posthog_api_host } = settings;
  if (!posthog_api_key) {
    throw new Error('ph_project_api_key is undefined');
  }
  const { firstTouchCampaignParams, lastTouchCampaignParams } = calculateCampaignParams(init.context.document.location.href)
  let customerPrivacyStatus: CustomerPrivacyPayload['customerPrivacy'] = init.customerPrivacy;
  const POSTHOG_WINDOW_KEY = `ph_${posthog_api_key}_window_id`;
  const POSTHOG_KEY = `ph_${posthog_api_key}_posthog`;

  async function getPostHogLocalStorage(): Promise<string | null> { 
    const webPostHogPersistedString = await localStorage.getItem(POSTHOG_KEY);
    return webPostHogPersistedString
  }
  async function resolveDistinctId(): Promise<string> {
    const webPostHogPersistedString = await getPostHogLocalStorage()
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

  async function getWindowId(): Promise<string | null> {
    const windowPostHogPersistedString = await sessionStorage.getItem(POSTHOG_WINDOW_KEY);
    const windowPostHogPersisted: string | null = windowPostHogPersistedString ? windowPostHogPersistedString : null;
    if(windowPostHogPersisted) {
      return windowPostHogPersisted
    }
    return null
  }

  async function getSessionId(): Promise<[number, string | null, number]> {
    const webPostHogPersistedString = await getPostHogLocalStorage()
    const webPostHogPersisted: {
      $sesid: [
        sessionActivityTimestamp: number | 0,
        sessionId: string | null,
        sessionStartTimestamp: number | 0
      ]
    } | null = webPostHogPersistedString ? JSON.parse(webPostHogPersistedString) : null;

    if(!webPostHogPersisted || !webPostHogPersisted?.$sesid ||  !webPostHogPersisted?.$sesid[0] && !webPostHogPersisted?.$sesid[1] && !webPostHogPersisted?.$sesid[2] ) {
      return [0, null, 0]
    }
    
    return webPostHogPersisted.$sesid
  }

  async function updateSessionId(sessionActivityTimestamp: number | null, sessionId: string | null, sessionStartTimestamp: number | null) {
    const webPostHogPersistedString = await getPostHogLocalStorage()
    const webPostHogPersisted: {
      $sesid: [
        sessionActivityTimestamp: number | 0,
        sessionId: string | null,
        sessionStartTimestamp: number | 0
      ]
    } | null = webPostHogPersistedString ? JSON.parse(webPostHogPersistedString) : null;

    if(webPostHogPersisted) {
      await localStorage.setItem(POSTHOG_KEY, JSON.stringify({...webPostHogPersisted,
        $sesid:[sessionActivityTimestamp,sessionId,sessionStartTimestamp]}));
    }
  }
  const MAX_SESSION_IDLE_TIMEOUT = 30 * 60; // 30 minutes
  const MIN_SESSION_IDLE_TIMEOUT = 60; // 1 minute
  const SESSION_LENGTH_LIMIT = 24 * 3600; // 24 hours

  const sessionTimeoutMs = Math.min(Math.max(MAX_SESSION_IDLE_TIMEOUT, MIN_SESSION_IDLE_TIMEOUT), MAX_SESSION_IDLE_TIMEOUT) * 1000;

  async function resolveSessionId(): Promise<{sessionId: string, windowId: string, sessionStartTimestamp: number}> {


    const timestamp = new Date().getTime();
    let [lastTimestamp, sessionId, startTimestamp] = await getSessionId();
    let windowId = await getWindowId();
    const sessionPastMaximumLength = isNumber(startTimestamp) && startTimestamp > 0 && Math.abs(timestamp - startTimestamp) > SESSION_LENGTH_LIMIT * 1000;
    
    const activityTimeout = Math.abs(timestamp - lastTimestamp) > sessionTimeoutMs;
    
    if (!sessionId || activityTimeout || sessionPastMaximumLength) {
      sessionId = uuidv7();
      windowId = uuidv7();
      startTimestamp = timestamp;
    } else if (!windowId) {
      windowId =  uuidv7();
    }
    const newTimestamp = timestamp;
    const sessionStartTimestamp = startTimestamp === 0 ? new Date().getTime() : startTimestamp;

    await sessionStorage.setItem(POSTHOG_WINDOW_KEY, windowId);
    await updateSessionId(newTimestamp,sessionId, sessionStartTimestamp);
    return {
      sessionId,
      windowId,
      sessionStartTimestamp
    }
  }

  async function resetPosthog() {
    const distinct_id = uuidv7();
    await localStorage.setItem(POSTHOG_KEY, JSON.stringify({ distinct_id }));
  }
  const posthog = new PixieHogPostHog(posthog_api_key, {
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
  const userAgent = (() => {
    try {
      return UAParser(init.context.navigator.userAgent);
    } catch (error) {
      console.error(error)
      return null
    }
  })();
  const currentURLObject = (() => {
    try {
      return new URL(init.context.document.location.href);
    } catch (error) {
      console.error(error)
      return null
    }
  })();
  const referringURLObject = (() => {
    try {
      if (!init?.context?.document?.referrer) {
        return null
      }
      return new URL(init.context.document.referrer);
    } catch (error) {
      console.error(error)
      return null
    }
  })();
  //https://posthog.com/docs/data/events;
  const initProperties = {
    $os: userAgent?.os.name || null,
    $os_version: userAgent?.os.version || null,
    $browser: userAgent?.browser.name || null,
    $browser_version: userAgent?.browser.version ? String(userAgent.browser.version) : null,
    $device_type: userAgent?.device.type,
    $current_url: init.context.document.location.href,
    $host: currentURLObject?.host || null,
    $pathname: currentURLObject?.pathname || null,
    $screen_height: init.context.window.screen.height,
    $screen_width: init.context.window.screen.width,
    $viewport_height: init.context.window.innerHeight,
    $viewport_width: init.context.window.innerWidth,
    $search_engine: getSearchEngine(init?.context?.document?.referrer || null),
    $referrer: init.context.document.referrer,
    $referring_domain: referringURLObject?.host || null,
    /** how to calculate active_feature_flags */
    //$active_feature_flags: null,
    shop: init.data.shop,
    ...(init.data.customer && {
      customer: init.data.customer,
    }),
    // this might be out of date if the store uses side-cart
    ...(init.data.cart && {
      cart: init.data.cart,
    }),
    //https://posthog.com/docs/product-analytics/person-properties
    $set: {
      ...lastTouchCampaignParams,
      ...init.data.customer,
      $browser: userAgent?.browser.name || null,
      $browser_version: userAgent?.browser.version || null,
      $os: userAgent?.os.name || null,
      $os_version: userAgent?.os.version || null,
      $device_type: userAgent?.device.type,
      $current_url: init.context.document.location.href,
      $pathname: currentURLObject?.pathname || null,
      $referrer: init.context.document.referrer,
      $referring_domain: referringURLObject?.host || null,
    },
    $set_once: {
      ...firstTouchCampaignParams,
      $initial_browser: userAgent?.browser.name || null,
      $initial_browser_version: userAgent?.browser.version || null,
      $initial_os: userAgent?.os.name || null,
      $initial_os_version: userAgent?.os.version || null,
      $initial_device_type: userAgent?.device.type,
      $initial_current_url: init.context.document.location.href,
      $initial_pathname: currentURLObject?.pathname || null,
      $initial_referrer: init.context.document.referrer,
      $initial_referring_domain: referringURLObject?.host || null,
    },
    ...lastTouchCampaignParams,
  } as const;

  const resolveEventEcommerceName = (name: string) => {
    if (!posthogEcommerceSpecEnabled) {
      return name
    }
    const mapped = webPixelToPostHogEcommerceSpecMap[name]
    if (!mapped) {
      return name;
    }
    return mapped
  }

  const resolveEventEcommerceSpecBody = (event: PixelEvents[keyof PixelEvents]) => {
    console.log({posthogEcommerceSpecEnabled, event})
    if (!posthogEcommerceSpecEnabled) {
      return {};
    }
    const transformer = webPixelToPostHogEcommerceSpecTransformerMap[event.name]
    console.log({transformer})
    if (!transformer) {
      return {}
    }
    const transformed = transformer(init.data.shop, event)
    console.log({transformed})

    return transformed;

  }

  const checkoutKeys = [
    'checkout_started',
    'checkout_completed',
    'checkout_shipping_info_submitted',
    'checkout_contact_info_submitted',
    'checkout_address_info_submitted',
    'payment_info_submitted',
  ] as const;

  const trackedCheckoutKeys = checkoutKeys.filter((key) => activeEvents.includes(key));
  for (const key of trackedCheckoutKeys) {
    analytics.subscribe(
      key,
      preprocessEvent(async (event, uuid, anonymous) => {
        const distinctId = await resolveDistinctId();
        const {sessionId,windowId} = await resolveSessionId();

        posthog.capture({
          ...(uuid ? { uuid: uuid } : {}),
          distinctId,
          event: resolveEventEcommerceName(event.name),
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
            $session_id : sessionId,
            $configured_session_timeout_ms: sessionTimeoutMs,
            $window_id: windowId,
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
            ...resolveEventEcommerceSpecBody(event)
          },
        });
      })
    );
  }

  const productCartKeys = ['product_added_to_cart', 'product_removed_from_cart'] as const;
  const trackedProductCartKeys = productCartKeys.filter((key) => activeEvents.includes(key));
  for (const key of trackedProductCartKeys ) {
    analytics.subscribe(
      key,
      preprocessEvent(async (event, uuid, anonymous) => {
        const distinctId = await resolveDistinctId();
        const {sessionId,windowId} = await resolveSessionId()
        posthog.capture({
          ...(uuid ? { uuid: uuid } : {}),
          distinctId,
          event: resolveEventEcommerceName(event.name),
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
            $session_id : sessionId,
            $configured_session_timeout_ms: sessionTimeoutMs,
            $window_id: windowId,
            ...(event.data.cartLine && {
              ...{
                ...event.data.cartLine.merchandise,
              },
              ...{
                cost: event.data.cartLine.cost,
                quantity: event.data.cartLine.quantity,
              },
            }),
            ...resolveEventEcommerceSpecBody(event)
          },
        });
      })
    );
  }

  const mouseEventsKeys = ['clicked', 'input_blurred', 'input_changed'] as const;
  const trackedMouseEventsKeys = mouseEventsKeys.filter((key) => activeEvents.includes(key));
  for (const key of trackedMouseEventsKeys) {
    analytics.subscribe(
      key,
      preprocessEvent(async (event, uuid, anonymous) => {
        // DOM events do not have window/document context
        // cannot set URL
        const distinctId = await resolveDistinctId();
        const {sessionId,windowId} = await resolveSessionId()
        posthog.capture({
          ...(uuid ? { uuid: uuid } : {}),
          distinctId,
          event: resolveEventEcommerceName(event.name),
          timestamp: new Date(event.timestamp),
          properties: {
            $session_id : sessionId,
            $configured_session_timeout_ms: sessionTimeoutMs,
            $window_id: windowId,
            ...{
              ...initProperties,
              ...(anonymous == true && {
                customer: undefined,
                purchasingCompany: undefined,
              }),
            },
            client_id: event.clientId,
            ...event.data.element,
            ...resolveEventEcommerceSpecBody(event)
          },
        });
      })
    );
  }

  activeEvents.includes('page_viewed') && analytics.subscribe(
    'page_viewed',
    preprocessEvent(async (event, uuid, anonymous) => {
      const distinctId = await resolveDistinctId();
      const {sessionId,windowId} = await resolveSessionId()
      posthog.capture({
        ...(uuid ? { uuid: uuid } : {}),
        distinctId,
        event: resolveEventEcommerceName(event.name),
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
          $session_id : sessionId,
          $configured_session_timeout_ms: sessionTimeoutMs,
          $window_id: windowId,
          ...event.data,
          /**set person properties in 1 call, this is most frequent event */
          ...(init.data.customer &&
            anonymous == false && {
              $set: init.data.customer,
            }),
            ...resolveEventEcommerceSpecBody(event)
        },
      });
    })
  );

  activeEvents.includes('collection_viewed') && analytics.subscribe(
    'collection_viewed',
    preprocessEvent(async (event, uuid, anonymous) => {
      const distinctId = await resolveDistinctId();
      const {sessionId,windowId} = await resolveSessionId()
      posthog.capture({
        ...(uuid ? { uuid: uuid } : {}),
        distinctId,
        event: resolveEventEcommerceName(event.name),
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
          $session_id : sessionId,
          $configured_session_timeout_ms: sessionTimeoutMs,
          $window_id: windowId,
          ...event.data.collection,
          ...resolveEventEcommerceSpecBody(event)
        },
      });
    })
  );

  activeEvents.includes('product_viewed') && analytics.subscribe(
    'product_viewed',
    preprocessEvent(async (event, uuid, anonymous) => {
      const distinctId = await resolveDistinctId();
      const {sessionId,windowId} = await resolveSessionId()
      posthog.capture({
        ...(uuid ? { uuid: uuid } : {}),
        distinctId,
        event: resolveEventEcommerceName(event.name),
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
          $session_id : sessionId,
          $configured_session_timeout_ms: sessionTimeoutMs,
          $window_id: windowId,
          ...event.data.productVariant,
          ...resolveEventEcommerceSpecBody(event)
        },
      });
    })
  );

  activeEvents.includes('cart_viewed') && analytics.subscribe(
    'cart_viewed',
    preprocessEvent(async (event, uuid, anonymous) => {
      const distinctId = await resolveDistinctId();
      const {sessionId,windowId} = await resolveSessionId()
      posthog.capture({
        ...(uuid ? { uuid: uuid } : {}),
        distinctId,
        event: resolveEventEcommerceName(event.name),
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
          $session_id : sessionId,
          $configured_session_timeout_ms: sessionTimeoutMs,
          $window_id: windowId,
          ...event.data.cart,
          ...resolveEventEcommerceSpecBody(event)
        },
      });
    })
  );

  activeEvents.includes('search_submitted') && analytics.subscribe(
    'search_submitted',
    preprocessEvent(async (event, uuid, anonymous) => {
      const distinctId = await resolveDistinctId();
      const {sessionId,windowId} = await resolveSessionId()
      posthog.capture({
        ...(uuid ? { uuid: uuid } : {}),
        distinctId,
        event: resolveEventEcommerceName(event.name),
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
          $session_id : sessionId,
          $configured_session_timeout_ms: sessionTimeoutMs,
          $window_id: windowId,
          ...event.data.searchResult,
          ...resolveEventEcommerceSpecBody(event)
        },
      });
    })
  );

  activeEvents.includes('form_submitted') && analytics.subscribe(
    'form_submitted',
    preprocessEvent(async (event, uuid, anonymous) => {
      const distinctId = await resolveDistinctId();
      const {sessionId,windowId} = await resolveSessionId()
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
        event: resolveEventEcommerceName(event.name),
        timestamp: new Date(event.timestamp),
        properties: {
          $session_id : sessionId,
          $configured_session_timeout_ms: sessionTimeoutMs,
          $window_id: windowId,
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
          ...resolveEventEcommerceSpecBody(event)
        },
      });
    })
  );
});
