import { CustomerPrivacyPayload, register } from '@shopify/web-pixels-extension';
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
  console.log('1.0.7');
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
    const WEB_PIXEL_POSTHOG_DISTINCT_ID_KEY = `web_pixel_ph_phc_${ph_project_api_key}_posthog_distinct_id`;
    const webPostHogPersisted = (await localStorage.getItem(`ph_phc_${ph_project_api_key}_posthog`)) as {
      distinct_id: string;
    } | null;

    const localStorageDistinctId = await localStorage.getItem(WEB_PIXEL_POSTHOG_DISTINCT_ID_KEY);

    if (webPostHogPersisted?.distinct_id && localStorageDistinctId) {
      posthog.alias({
        distinctId: webPostHogPersisted.distinct_id,
        alias: localStorageDistinctId,
      });
    }

    if (localStorageDistinctId) {
      return localStorageDistinctId;
    }

    if (webPostHogPersisted?.distinct_id) {
      await localStorage.setItem(WEB_PIXEL_POSTHOG_DISTINCT_ID_KEY, webPostHogPersisted?.distinct_id);
      return webPostHogPersisted?.distinct_id;
    }

    const distinct_id = uuidv7();
    await localStorage.setItem(WEB_PIXEL_POSTHOG_DISTINCT_ID_KEY, distinct_id);
    return distinct_id;
  };
  customerPrivacy.subscribe('visitorConsentCollected', (event) => {
    customerPrivacyStatus = event.customerPrivacy;
  });
  analytics.subscribe(
    'page_viewed',
    preprocessEvent(async (event) => {
      posthog.capture({
        distinctId: await resolveDistinctId(),
        event: event.name,
        properties: {
          ...event.data,
          url: event.context.document.location.href,
          $current_url: event.context.document.location.href,
        },
      });
    })
  );

  analytics.subscribe(
    'checkout_contact_info_submitted',
    preprocessEvent(async (event) => {
      if (event.data.checkout.email) {
        posthog.identify({
          distinctId: await resolveDistinctId(),
          properties: {
            email: event.data.checkout.email,
            url: event.context.document.location.href,
            $current_url: event.context.document.location.href,
          },
        });
      }
      await posthog.flush();
      posthog.capture({
        distinctId: await resolveDistinctId(),
        event: event.name,
        properties: {
          ...event.data.checkout,
          email: undefined,
          url: event.context.document.location.href,
          $current_url: event.context.document.location.href,
        },
      });
    })
  );
});
