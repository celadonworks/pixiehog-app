import { Links, Meta, Outlet, Scripts, ScrollRestoration, json, useLoaderData, useLocation } from '@remix-run/react';
import posthog from 'posthog-js';
import { useEffect, useRef } from 'react';
import { APP_ENV } from '../common/secret';

export async function loader() {
  return json({
    ENV: {
      POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
      POSTOHG_API_HOST: process.env.POSTOHG_API_HOST,
      APP_POSTHOG_JS_WEB_THEME_APP_UUID: APP_ENV.APP_POSTHOG_JS_WEB_THEME_APP_UUID,
    },
  });
}

function PosthogInit() {
  const location = useLocation();
  useEffect(() => {
    if (!window.ENV.POSTHOG_API_KEY) {
      console.log('posthog disabled - no api key');
      return;
    }
    posthog.init(window.ENV.POSTHOG_API_KEY, {
      api_host: window.ENV.POSTOHG_API_HOST,
      person_profiles: 'always',
      capture_pageleave: false,
      enable_recording_console_log: true,
      persistence: 'localStorage',
    });
  });
  let lastUrl = useRef('');
  useEffect(() => {
    const url = window.origin + location.pathname;

    if (url == lastUrl.current) {
      return;
    }
    lastUrl.current = url;
    posthog.capture('$pageview', {
      $current_url: url,
    });
  }, [location.pathname]);
  return null;
}


export default function App() {
  const data = useLoaderData<typeof loader>();
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link rel="stylesheet" href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css" />
        <Meta />
        <Links />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <PosthogInit />
      </body>
    </html>
  );
}
