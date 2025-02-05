import "@shopify/shopify-app-remix/adapters/node";
import type {
  ApiVersion} from "@shopify/shopify-app-remix/server";
import {
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";
import prisma from "./db.server";
import { metafieldsSet } from "./common.server/mutations/metafields-set";
import { Constant } from "../common/constant";
import { queryCurrentAppInstallation } from "./common.server/queries/current-app-installation";
import { WebPixelEventsSettingsSchema } from "../common/dto/web-pixel-events-settings.dto";
import { JsWebPosthogConfigSchema } from "../common/dto/js-web-settings.dto";
import { APP_ENV } from "../common/secret";

const shopify = shopifyApp({
  apiKey: APP_ENV.SHOPIFY_API_KEY,
  apiSecretKey: APP_ENV.SHOPIFY_API_SECRET || "",
  apiVersion: Constant.SHOPIFY_API_VERSION as ApiVersion.October24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: APP_ENV.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  isEmbeddedApp: true,
  hooks: {
    afterAuth: async ({ session, admin }) => {
      const currentAppInstallation = await queryCurrentAppInstallation(admin.graphql);
      // initiate Web Pixel state
      const defaultWebPixelSettings = WebPixelEventsSettingsSchema.parse({});
      const defaultJSWebConfig = JsWebPosthogConfigSchema.parse({});
      await metafieldsSet(admin.graphql, [
        ...(currentAppInstallation.js_web_posthog_feature_toggle
          ? []
          : [
              {
                key: Constant.METAFIELD_KEY_JS_WEB_POSTHOG_FEATURE_TOGGLE,
                namespace: Constant.METAFIELD_NAMESPACE,
                ownerId: currentAppInstallation.id,
                type: 'boolean',
                value: 'false',
              },
            ]),
        ...(currentAppInstallation.web_pixel_feature_toggle
          ? []
          : [
              {
                key: Constant.METAFIELD_KEY_WEB_PIXEL_FEATURE_TOGGLE,
                namespace: Constant.METAFIELD_NAMESPACE,
                ownerId: currentAppInstallation.id,
                type: 'boolean',
                value: 'true',
              },
            ]),
        ...(currentAppInstallation.web_pixel_settings
          ? []
          : [
              {
                key: Constant.METAFIELD_KEY_WEB_PIXEL_EVENTS_SETTINGS,
                namespace: Constant.METAFIELD_NAMESPACE,
                ownerId: currentAppInstallation.id,
                type: 'json',
                value: JSON.stringify(defaultWebPixelSettings),
              },
            ]),
        ...(currentAppInstallation.js_web_posthog_config
          ? []
          : [
              {
                key: Constant.METAFIELD_KEY_JS_WEB_POSTHOG_CONFIG,
                namespace: Constant.METAFIELD_NAMESPACE,
                ownerId: currentAppInstallation.id,
                type: 'json',
                value: JSON.stringify(defaultJSWebConfig),
              },
            ]),
      ]);
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
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
