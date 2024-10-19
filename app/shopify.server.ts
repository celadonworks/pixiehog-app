import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import prisma from "./db.server";
import { webPixelCreate } from "./common.server/mutations/web-pixel-create";

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
            console.log('after auth') ;
            await webPixelCreate(admin.graphql, {
              ph_project_api_key: 'phc_pO8qo4XkzmJkWrr08pgCtIX5me8u48uRxenJpChBnpU',
              payment_info_submitted: 'true',
              cart_viewed: 'true',
              checkout_address_info_submitted: 'true',
              checkout_completed: 'true',
              checkout_contact_info_submitted: 'true',
              checkout_shipping_info_submitted: 'true',
              checkout_started: 'true',
              clicked: 'true',
              collection_viewed: 'true',
              input_blurred: 'true',
              input_changed: 'true',
              input_focused: 'true',
              page_viewed: 'true',
              product_added_to_cart: 'true',
              product_removed_from: 'true',
              product_viewed: 'true',
              search_submitted: 'true'
            })
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
