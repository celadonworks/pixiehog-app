import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';
import type { WebPixelSettings } from '../../../common/dto/web-pixel-settings.dto';

export async function webPixelUpdate(graphql: AdminGraphqlClient, id: string, settings: WebPixelSettings) {
  const resp = await graphql(
    `#graphql
      mutation webPixelUpdate($id: ID!, $webPixel: WebPixelInput!) {
        webPixelUpdate(id: $id, webPixel: $webPixel) {
          userErrors {
            code
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
        id,
        webPixel: {
          settings: JSON.stringify(settings),
        },
      },
    }
  );

  const payload = await resp.json();
  return payload;
}
