import type { WebPixelSettings } from '../../../common/dto/web-pixel-settings.dto';
import { ShopifyUserErrorException } from '../exceptions/shopify-user-error.exception';
import { clientGraphQL } from '../client-graphql-client';

export async function webPixelCreate( settings: WebPixelSettings) {
  const response = await clientGraphQL(
    `#graphql
      mutation webPixelCreate($webPixel: WebPixelInput!) {
        webPixelCreate(webPixel: $webPixel) {
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
        webPixel: {
          settings: JSON.stringify(settings),
        },
      },
    }
  );

  if (response.data?.webPixelCreate?.userErrors && response.data?.webPixelCreate?.userErrors.length > 0) {
    throw new ShopifyUserErrorException(`webPixelCreate encountered userErrors`, {
      settings,
      userErrors: response.data?.webPixelCreate.userErrors,
    });
  }
  return response;
}
