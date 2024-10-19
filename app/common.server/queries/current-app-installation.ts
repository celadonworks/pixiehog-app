import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';
import { json } from '@remix-run/node';
import type { Metafield } from '../interfaces/shopify-metafield-interface';

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
    query currentAppInstallation {
      currentAppInstallation {
        id
        app {
          id
        }
        ph_key: metafield(namespace: "ph_analytics", key: "apiKey") {
          key
          jsonValue
          value
          type
        }
        web_pixel_events: metafield(namespace: "ph_analytics", key: "webPixelEvents") {
          key
          jsonValue
          value
          type
        }
        
      }
    }
    `
  );
  const responseJson = (await response.json());
  return json(responseJson.data?.currentAppInstallation);
};
