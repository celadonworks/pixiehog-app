import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';
import { queryCurrentAppInstallation } from '../queries/current-app-installation';
import { queryWebPixel } from '../queries/web-pixel';
import type { WebPixelSettings } from '../../../common/dto/web-pixel-settings.dto';
import { WebPixelSettingsSchema } from '../../../common/dto/web-pixel-settings.dto';
import { webPixelDelete } from '../mutations/web-pixel-delete';
import { webPixelUpdate } from '../mutations/web-pixel-update';
import { webPixelCreate } from '../mutations/web-pixel-create';
import type { DataCollectionStrategy } from 'common/dto/data-collection-stratergy';
export async function recalculateWebPixel(graphq: AdminGraphqlClient): Promise<{
  status: 'disconnected' | 'connected' | 'updated';
} | null> {
  const currentAppInstallation = await queryCurrentAppInstallation(graphq);
  const shopifyWebPixel = await queryWebPixel(graphq);
  const metafieldWebPixelSettings = currentAppInstallation.web_pixel_settings?.jsonValue;
  const posthogApiKey = currentAppInstallation.posthog_api_key?.value;
  const posthogApihost = currentAppInstallation.posthog_api_host?.value;
  type ValueOf<T> = T[keyof T];
  const dataCollectionStrategyKey = currentAppInstallation.data_collection_strategy?.value as ValueOf<DataCollectionStrategy>
  
  const webPixelFeatureToggle = currentAppInstallation.web_pixel_feature_toggle?.jsonValue == true
  const dtoResult = WebPixelSettingsSchema.safeParse({
    ...(posthogApiKey && {
      posthog_api_key: posthogApiKey,
    }),
    ...(posthogApihost && {
       posthog_api_host: posthogApihost,
    }),
    ...(dataCollectionStrategyKey && {
      data_collection_strategy: dataCollectionStrategyKey,
    }),
    ...(metafieldWebPixelSettings && {
      ...metafieldWebPixelSettings,
    }),
  } as WebPixelSettings);
  if (!webPixelFeatureToggle) {
    if (!shopifyWebPixel?.id) {
      // no pixel already nothing to do
      return null;
    }
    await webPixelDelete(graphq, shopifyWebPixel.id);
    return { status: 'disconnected' };
  }

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
  const allEventsDisabled = eventsSettingsValues.every((value) => value == 'false');
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

  const convertedDtoResultData = Object.fromEntries(
    Object.entries(dtoResult.data).map(([key, value]) => [key, String(value)])
  ) as unknown as WebPixelSettings;
  if (shopifyWebPixel?.id) {
    // we already have a web pixel
    // update settings

    await webPixelUpdate(graphq, shopifyWebPixel.id, convertedDtoResultData);
    return { status: 'updated' };
  }

  // create web pixel
  await webPixelCreate(graphq, convertedDtoResultData);

  
  return { status: 'connected' };
}
