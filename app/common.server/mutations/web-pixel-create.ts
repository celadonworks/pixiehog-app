import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';
import type { WebPixelSettings } from '../../../../extensions/web-pixel/src/interface/interface';

export async function webPixelCreate(graphql: AdminGraphqlClient, settings: WebPixelSettings) {
  const resp = await graphql(
    `
      #graphql
      mutation webPixelCreate($webPixel: WebPixelInput!) {
        webPixelCreate(webPixel: $webPixel) {
          userErrors {
            code
            field
            code
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
  
  const payload = await resp.json();
  return payload;
}
