import { z } from "zod";

const envSchema = z.object({
  APP_POSTHOG_JS_WEB_THEME_APP_UUID: z.string().readonly(),
  SHOPIFY_APP_URL: z.string().readonly(),
  SHOPIFY_API_KEY: z.string().readonly(),
  SHOPIFY_API_SECRET: z.string().readonly(),
})
export type SecretsSchema = z.infer<typeof envSchema>;

let initEnv: SecretsSchema = {
  APP_POSTHOG_JS_WEB_THEME_APP_UUID: (process.env.SHOPIFY_POSTHOG_JS_ID || process.env.APP_POSTHOG_WEB_JS_UUID) as string,
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY as string,
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET as string,
  SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL as string,
}

export const APP_ENV = envSchema.parse(initEnv)
