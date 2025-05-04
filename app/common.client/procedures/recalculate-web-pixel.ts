import { queryCurrentAppInstallation as clientQueryCurrentAppInstallation } from '../queries/current-app-installation';
import { queryWebPixel } from '../../common.client/queries/web-pixel';
import type { WebPixelSettings } from '../../../common/dto/web-pixel-settings.dto';
import { WebPixelSettingsSchema } from '../../../common/dto/web-pixel-settings.dto';
import { webPixelDelete } from '../mutations/web-pixel-delete';
import { webPixelUpdate } from '../mutations/web-pixel-update';
import { webPixelCreate } from '../mutations/web-pixel-create';
import type { DataCollectionStrategy } from '../../../common/dto/data-collection-stratergy';
import posthog from 'posthog-js';
export async function recalculateWebPixel(): Promise<
  | {
      status: 'disconnected' | 'connected' | 'updated';
    }
  | { status: 'error'; message: string }
  | null
> {
  const response = await clientQueryCurrentAppInstallation();
  const shopifyWebPixel = await queryWebPixel();
  const posthogApiKey = response.currentAppInstallation.posthog_api_key?.value;
  const posthogApihost = response.currentAppInstallation.posthog_api_host?.value;
  const trackedEvents = response.currentAppInstallation.web_pixel_tracked_events?.jsonValue as
    | string[]
    | null
    | undefined;
  type ValueOf<T> = T[keyof T];
  const dataCollectionStrategyKey = response.currentAppInstallation.data_collection_strategy
    ?.value as ValueOf<DataCollectionStrategy>;

  const webPixelFeatureToggle = response.currentAppInstallation.web_pixel_feature_toggle?.jsonValue == true;
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
    ...(trackedEvents && {
      tracked_events: JSON.stringify(trackedEvents),
    }),
  } as WebPixelSettings);

  if (!webPixelFeatureToggle) {
    if (!shopifyWebPixel?.id) {
      // no pixel already nothing to do
      return null;
    }
    await webPixelDelete(shopifyWebPixel.id);
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
    await webPixelDelete(shopifyWebPixel?.id);
    return { status: 'disconnected' };
  }

  const allEventsDisabled = (trackedEvents || []).length === 0;
  if (allEventsDisabled) {
    // delete web pixel
    if (!shopifyWebPixel?.id) {
      // no pixel already nothing to do
      return null;
    }
    const response = await webPixelDelete(shopifyWebPixel?.id);
    if (response.data.webPixelDelete?.userErrors?.length) {
      posthog.captureException(new Error('webPixelDeletefailed', { cause: response.data.webPixelDelete?.userErrors }), response.data);
      return { status: 'error', message: response.data.webPixelDelete?.userErrors[0].message };
    }
    return { status: 'disconnected' };
  }
  // if we have at least one event active and post_hog_api_key
  // update or enable webPixel

  const convertedDtoResultData = Object.fromEntries(
    Object.entries(dtoResult.data).map(([key, value]) => [key, String(value)])
  ) as unknown as WebPixelSettings;
  if (shopifyWebPixel?.id) {
    // we already have a web pixel
    // update settings

    const response = await webPixelUpdate(shopifyWebPixel.id, convertedDtoResultData);
    if (response.data.webPixelUpdate?.userErrors?.length) {
      posthog.captureException(new Error('webPixelUpdate failed', { cause: response.data.webPixelUpdate?.userErrors }), response.data);
      return { status: 'error', message: response.data.webPixelUpdate?.userErrors[0].message };
    }
    return { status: 'updated' };
  }

  // create web pixel
  const responseCreate = await webPixelCreate(convertedDtoResultData);
  if (responseCreate.data.webPixelCreate?.userErrors?.length) {
    posthog.captureException(new Error('webPixelCreate failed', { cause: responseCreate.data.webPixelCreate?.userErrors }), responseCreate.data);
    return { status: 'error', message: responseCreate.data.webPixelCreate?.userErrors[0].message };
  }
  return { status: 'connected' };
}
