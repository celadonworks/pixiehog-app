import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';
import type { WebPixelSettings } from '../../../../extensions/web-pixel/src/interface/interface';

import type { ClientResponse } from '@shopify/graphql-client/'
import type { WebPixelCreateResponseData } from './interface';


export async function webPixelCreate(graphql: AdminGraphqlClient, settings: WebPixelSettings): Promise<ClientResponse<WebPixelCreateResponseData>> {
  const resp = await graphql(
    `
      #graphql
      mutation webPixelCreate($webPixel: WebPixelInput!) {
        webPixelCreate(webPixel: $webPixel) {
          userErrors {
            field
            message
          }
          webPixel {
            id
            settings
          }
        }
      }
    `,
    {
      variables: {
        webPixel: {
          settings: JSON.stringify(settings),
        },
      },
    }
  );
  
  const payload = await resp.json() as ClientResponse<WebPixelCreateResponseData>;
  return payload;
}
