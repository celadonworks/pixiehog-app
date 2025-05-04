import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ClientLoaderFunctionArgs} from "@remix-run/react";
import { isRouteErrorResponse, Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu, useAppBridge } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { useEffect } from "react";
import posthog from "posthog-js";
import { BlockStack, Box, Button, Card, InlineStack, Layout, Page, Text } from "@shopify/polaris";
import { serializeError } from "serialize-error";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  return { apiKey: window.shopify.config.apiKey || "" };
};

function PosthogInit() {
  const shopify = useAppBridge();
  useEffect(() => {
    posthog.identify(
      posthog.get_distinct_id(), // Replace 'distinct_id' with your user's unique identifier
      { shop: shopify.config.shop } // optional: set additional person properties
    );
  }, []);
  return null;
}

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Overview
        </Link>
        <Link to="/app/web-pixel-settings">
          Web Pixel Events
        </Link>
        <Link to="/app/js-web-posthog-settings">
          JS Web Config
        </Link>
      </NavMenu>
      <Outlet />
      <PosthogInit/>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  const error = useRouteError();
  useEffect(() => {
    if (!window.ENV.POSTHOG_API_KEY) {
      console.log('posthog disabled - no api key');
      return;
    }
    if (!posthog.__loaded) {
      posthog.init(window.ENV.POSTHOG_API_KEY, {
        api_host: window.ENV.POSTOHG_API_HOST,
        person_profiles: 'always',
        capture_pageleave: false,
        enable_recording_console_log: true,
        persistence: 'localStorage',
      });
    }
    if (error instanceof Error) {
      posthog.captureException(error, serializeError(error, {maxDepth: 4}))
    } else {
      posthog.captureException(Error('unknown error type'), serializeError(error, {maxDepth: 4}));
    }
  });

  const resolveError = (error:unknown) => {
    if (isRouteErrorResponse(error)) {
      return (
        <BlockStack>
           <Text 
            variant='bodyLg'
            as='p'>{error.status} {error.statusText}</Text>

            <Text 
            variant='bodyMd'
            as='p'>{error.data} {error.statusText}</Text>
        </BlockStack>
       
      );
    } else if (error instanceof Error) {
      return (
        <BlockStack>
          <Text 
          variant='bodyLg'
          as='p'>{error.name}</Text>

          <Text 
          variant='bodyMd'
          as='p'>{error.message}</Text>
          <Text 
          variant='bodySm'
          as='p'>{error.stack}</Text>
      </BlockStack>
      );
    } else {
      return (
        <BlockStack>
          <Text 
          variant='bodyLg'
          as='p'>Unknown Error</Text>

          <Text 
          variant='bodyMd'
          as='p'>{JSON.stringify(serializeError(error))}</Text>
      </BlockStack>
      )
    }
  }
  return (
    <AppProvider isEmbeddedApp apiKey={''}>
        <Page
          title="Error"
        >
          <BlockStack gap="500">
            <Layout>
              <Layout.Section>
                <BlockStack gap="500">
                  <Card>
                    <BlockStack gap="500">
                    <InlineStack  align='space-between'>
                      <Text 
                        variant='headingLg'
                        as='h1'
                      >
                      An Error ocurred
                      </Text>
                    </InlineStack>

                      
                     {resolveError(error)}
             
                 
                    
                      <InlineStack  align='space-between'>
                        <Button variant='primary' url={'https://github.com/celadonworks/pixiehog-app'} target='_blank'>Submit GitHub Issue</Button>
                      </InlineStack>
                    </BlockStack>
                  </Card>
                  
                </BlockStack>
              </Layout.Section>
            </Layout>
          </BlockStack>
          <Box paddingBlockEnd={'800'}></Box>
        </Page>
        </AppProvider>
    );
  
}
export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};


