import { RemixBrowser } from '@remix-run/react';
import { useAppBridge } from '@shopify/app-bridge-react';
import posthog from 'posthog-js';
import { startTransition, StrictMode, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
function PosthogInit() {
  const shopify = useAppBridge();
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
      bootstrap: {
        distinctID: shopify.config.shop
      }
    });
  }, []);

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
