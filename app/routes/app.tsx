import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ClientLoaderFunctionArgs} from "@remix-run/react";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu, useAppBridge } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { useEffect } from "react";
import posthog from "posthog-js";

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
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
