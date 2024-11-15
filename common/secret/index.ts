import { z } from "zod";

const envSchema = z.object({
  APP_POSTHOG_JS_WEB_THEME_APP_UUID: z.string().readonly()
})
export type SecretsSchema = z.infer<typeof envSchema>;

export const APP_ENV = envSchema.parse({
  APP_POSTHOG_JS_WEB_THEME_APP_UUID: process.env.SHOPIFY_POSTHOG_JS_ID || process.env.APP_POSTHOG_WEB_JS_UUID,
} as SecretsSchema)
