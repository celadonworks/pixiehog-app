import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import prisma from "./db.server";
import { metafieldsSet } from "./common.server/mutations/metafields-set";
import { Constant } from "../common/constant";
import { queryCurrentAppInstallation } from "./common.server/queries/current-app-installation";
import type { WebPixelEventsSettings } from "../common/dto/web-pixel-events-settings.dto";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.July24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  isEmbeddedApp: true,
  hooks: {
    afterAuth: async ({ session, admin }) => {
            const currentAppInstallation = await queryCurrentAppInstallation(admin.graphql);
            // initiate Web Pixel state
            await metafieldsSet(admin.graphql, [
              {
                key: Constant.METAFIELD_KEY_WEB_PIXEL_EVENTS_SETTINGS,
                namespace: Constant.METAFIELD_NAMESPACE,
                ownerId: currentAppInstallation.id,
                type: 'json',
                value: JSON.stringify({
                  cart_viewed: 'false',
                  checkout_address_info_submitted: 'false',
                  checkout_completed: 'true',
                  checkout_contact_info_submitted: 'true',
                  checkout_shipping_info_submitted: 'false',
                  checkout_started: 'true',
                  clicked: 'true',
                  collection_viewed: 'false',
                  form_submitted: 'true',
                  input_blurred: 'false',
                  input_changed: 'false',
                  input_focused: 'false',
                  page_viewed: 'true',
                  payment_info_submitted: 'true',
                  product_added_to_cart: 'true',
                  product_removed_from_cart: 'true',
                  product_viewed: 'false',
                  search_submitted: 'false'
                } as WebPixelEventsSettings)
              }
            ])
      },
    },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.July24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
