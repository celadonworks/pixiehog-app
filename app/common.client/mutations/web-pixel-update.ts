import type { WebPixelSettings } from '../../../common/dto/web-pixel-settings.dto';
import { clientGraphQL } from '../client-graphql-client';

export async function webPixelUpdate( id: string, settings: WebPixelSettings) {
  const response = await clientGraphQL(
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

  const payload = await response
  return payload;
}
