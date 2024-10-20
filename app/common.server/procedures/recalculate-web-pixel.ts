import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';
import { queryCurrentAppInstallation } from '../queries/current-app-installation';
import { queryWebPixel } from '../queries/web-pixel';
import type { WebPixelSettings } from '../../../common/dto/web-pixel-settings.dto';
import { WebPixelSettingsSchema } from '../../../common/dto/web-pixel-settings.dto';
import { webPixelDelete } from '../mutations/web-pixel-delete';
import { webPixelUpdate } from '../mutations/web-pixel-update';
import { webPixelCreate } from '../mutations/web-pixel-create';

export async function recalculateWebPixel(graphq: AdminGraphqlClient): Promise<{
  status: 'disconnected' | 'connected' | 'updated';
} | null> {
  const currentAppInstallation = await queryCurrentAppInstallation(graphq);
  const shopifyWebPixel = await queryWebPixel(graphq);
  const metafieldWebPixelSettings = currentAppInstallation.web_pixel_settings?.jsonValue;
  const posthogApiKey = currentAppInstallation.posthog_api_key?.value;

  console.dir({
    currentAppInstallation,
    shopifyWebPixel,
  });
  const dtoResult = WebPixelSettingsSchema.safeParse({
    ...(posthogApiKey && {
      posthog_api_key: posthogApiKey,
    }),
    ...(metafieldWebPixelSettings && {
      ...metafieldWebPixelSettings,
    }),
  } as WebPixelSettings);
  if (!dtoResult.success) {
    // we do not have settings
    // this probably means posthog_api_key is not set or incorrect
    // delete webPixel if it exists
    if (!shopifyWebPixel?.id) {
      // no pixel already nothing to do
      return null;
    }
    await webPixelDelete(graphq, shopifyWebPixel?.id);
    return { status: 'disconnected' };
  }

  const { posthog_api_key, ...eventsSettings } = dtoResult.data;
  const eventsSettingsValues = Object.values(eventsSettings);
  const allEventsDisabled = eventsSettingsValues.every((value) => value === 'false');
  if (allEventsDisabled) {
    // delete web pixel
    if (!shopifyWebPixel?.id) {
      // no pixel already nothing to do
      return null;
    }
    await webPixelDelete(graphq, shopifyWebPixel?.id);
    return { status: 'disconnected'}
  }
  // if we have at least one event active and post_hog_api_key
  // update or enable webPixel

  if (shopifyWebPixel?.id) {
    // we already have a web pixel
    // update settings
    await webPixelUpdate(graphq, shopifyWebPixel.id, dtoResult.data);
    return { status: 'updated' };
  }
  // create web pixel
  await webPixelCreate(graphq, dtoResult.data);
  return { status: 'connected' };
}
