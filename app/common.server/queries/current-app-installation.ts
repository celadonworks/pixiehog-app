import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';
import type { Metafield } from '../interfaces/shopify-metafield-interface';
import { Constant } from '../../../common/constant';

export interface CurrentAppInstallationResponseDTO {
  currentAppInstallation: CurrentAppInstallation;
}

export interface CurrentAppInstallation {
  id: string;
  app: App;
  ph_key: Metafield;
  web_pixel_events: Metafield;
}

export interface App {
  id: string;
}

export const queryCurrentAppInstallation = async (graphql: AdminGraphqlClient) => {
  const response = await graphql(
    `#graphql
    query currentAppInstallation($namespace: String!, $posthogApiKeyKey: String!, $webPixelEventsSettingsKey: String!, $webPixelFeatureToggle: String!) {
      currentAppInstallation {
        id
        app {
          id
        }
        posthog_api_key: metafield(namespace: $namespace, key: $posthogApiKeyKey) {
          key
          value
          type
        }
        web_pixel_settings: metafield(namespace: $namespace, key: $webPixelEventsSettingsKey) {
          key
          jsonValue
          value
          type
        }
        web_pixel_feature_toggle: metafield(namespace: $namespace, key: $webPixelFeatureToggle) {
          key
          jsonValue
          value
          type
        }
      }
    }
    `,
    {
      variables: {
        namespace: Constant.METAFIELD_NAMESPACE,
        posthogApiKeyKey: Constant.METAFIELD_KEY_POSTHOG_API_KEY,
        webPixelEventsSettingsKey: Constant.METAFIELD_KEY_WEB_PIXEL_EVENTS_SETTINGS,
        webPixelFeatureToggle: Constant.METAFIELD_KEY_WEB_PIXEL_FEATURE_TOGGLE,
      }
    }
  );
  const responseJson = (await response.json());
  return responseJson.data!.currentAppInstallation;
};
