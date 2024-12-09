import { RemixBrowser, useNavigation } from '@remix-run/react';
import { useAppBridge } from '@shopify/app-bridge-react';
import posthog from 'posthog-js';
import { startTransition, StrictMode, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
function PosthogInit() {
  const shopify = useAppBridge();
  const navigation = useNavigation();
  useEffect(() => {
    if (!window.ENV.POSTHOG_API_KEY) {
      console.log('posthog disabled - no api key')
      return;
    }
    posthog.init(window.ENV.POSTHOG_API_KEY, {
      api_host: window.ENV.POSTOHG_API_HOST,
      person_profiles: 'always',
      capture_pageleave: false,
      enable_recording_console_log: true,
      persistence: 'localStorage',
    });
    posthog.identify(
      posthog.get_distinct_id(),  // Replace 'distinct_id' with your user's unique identifier
      { shop: shopify.config.shop, } // optional: set additional person properties
    );
  });

  useEffect(() => {
    if (navigation.state != 'idle') {
      return
    }
    posthog.capture(
      '$pageview',
      {
        '$current_url': window.location.href,
      }
    )
  }, [navigation.state])

  return null;
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
      <PosthogInit />
    </StrictMode>
  );
});
