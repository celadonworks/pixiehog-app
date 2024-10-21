import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';
import type { MetafieldsSetMutationVariables } from '../../types/admin.generated';
import { ShopifyUserErrorException } from '../exception/shopify-user-error.exception';

export const metafieldsSet = async (
  graphql: AdminGraphqlClient,
  metafields: MetafieldsSetMutationVariables['metafields']
) => {
  const response = await graphql(
    `#graphql
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
            code
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
  if (responseData.data?.metafieldsSet?.userErrors && responseData.data?.metafieldsSet?.userErrors.length > 0) {
    throw new ShopifyUserErrorException(`metafieldsSet encountered userErrors`, {
      metafields,
      userErrors: responseData.data?.metafieldsSet.userErrors,
    });
  }

  return responseData;
};
