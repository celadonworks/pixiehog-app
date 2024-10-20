import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';
import { ShopifyUserErrorException } from '../exception/shopify-user-error.exception';
import type { MetafieldIdentifierInput } from '../../types/admin.types';

export const metafieldsDelete = async (
  graphql: AdminGraphqlClient,
  metafields: MetafieldIdentifierInput[]
) => {
  const response = await graphql(
    `
      #graphql
      mutation metafieldsDelete($metafields: [MetafieldIdentifierInput!]!) {
        metafieldsDelete(metafields: $metafields) {
          deletedMetafields {
            key
            namespace
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        metafields,
      },
    }
  );

  const responseData = await response.json();
  if (responseData.data?.metafieldsDelete?.userErrors && responseData.data?.metafieldsDelete?.userErrors.length > 0) {
    throw new ShopifyUserErrorException(`metafieldsDelete encountered userErrors`, {
      metafields,
      userErrors: responseData.data?.metafieldsDelete.userErrors,
    });
  }

  return responseData;
};
