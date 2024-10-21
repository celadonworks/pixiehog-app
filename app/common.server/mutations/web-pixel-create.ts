import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';
import type { WebPixelSettings } from '../../../common/dto/web-pixel-settings.dto';
import { ShopifyUserErrorException } from '../exception/shopify-user-error.exception';

export async function webPixelCreate(graphql: AdminGraphqlClient, settings: WebPixelSettings) {
  const resp = await graphql(
    `#graphql
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

  const responseData = await resp.json();
  if (responseData.data?.webPixelCreate?.userErrors && responseData.data?.webPixelCreate?.userErrors.length > 0) {
    throw new ShopifyUserErrorException(`webPixelCreate encountered userErrors`, {
      settings,
      userErrors: responseData.data?.webPixelCreate.userErrors,
    });
  }
  return responseData;
}
