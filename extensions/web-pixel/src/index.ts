import { register } from '@shopify/web-pixels-extension';
import type { WebPixelSettings } from './interface/interface';

register(async (extensionApi) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { analytics, browser, init, customerPrivacy } = extensionApi;


  const { ph_project_api_key } = extensionApi.settings as WebPixelSettings;
  if (!ph_project_api_key) {
    throw new Error('ph_project_api_key is undefined');
  }
  


  // Sample subscribe to page view
  analytics.subscribe('page_viewed', async (event) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    var window = event.context.window;
    const { PostHog } = await import('posthog-js-lite');
    const posthog = new PostHog(ph_project_api_key, {
      host: 'https://eu.i.posthog.com',
    });
    posthog.capture(event.name, {
        title: event.context.document.title,
        url: event.context.document.location.href,
    })
  });
});
