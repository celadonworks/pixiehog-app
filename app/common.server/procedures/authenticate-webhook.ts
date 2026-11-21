import '@shopify/shopify-api/adapters/web-api';
import { LogSeverity, shopifyApi, WebhookValidationErrorReason } from '@shopify/shopify-api';
import type { ApiVersion } from '@shopify/shopify-api';
import { APP_ENV } from '../../../common/secret';
import { Constant } from '../../../common/constant';

const api = shopifyApi({
  apiKey: APP_ENV.SHOPIFY_API_KEY,
  apiSecretKey: APP_ENV.SHOPIFY_API_SECRET,
  hostName: new URL(APP_ENV.SHOPIFY_APP_URL).host,
  apiVersion: Constant.SHOPIFY_API_VERSION as ApiVersion,
  isEmbeddedApp: true,
  logger: { level: LogSeverity.Warning },
});

export async function authenticateWebhook(request: Request) {
  if (request.method !== 'POST') throw new Response(null, { status: 405 });
  const rawBody = await request.text();
  // These handlers need verified payloads, not token refresh that can race admin login.
  const check = await api.webhooks.validate({ rawBody, rawRequest: request });
  if (!check.valid) {
    throw new Response(null, {
      status: check.reason === WebhookValidationErrorReason.InvalidHmac ? 401 : 400,
    });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw new Response(null, { status: 400 });
  }
  return { shop: check.domain, topic: check.topic, payload };
}
