import type { MetafieldsSetMutationVariables } from '../../types/admin.generated';
import { clientGraphQL } from '../client-graphql-client';
import { ShopifyUserErrorException } from '../exceptions/shopify-user-error.exception'; 

export const metafieldsSet = async (
  metafields: MetafieldsSetMutationVariables['metafields']
) => {
  const response = await clientGraphQL(
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

  if (response.data?.metafieldsSet?.userErrors && response.data?.metafieldsSet?.userErrors.length > 0) {
    throw new ShopifyUserErrorException(`metafieldsSet encountered userErrors`, {
      metafields,
      userErrors: response.data?.metafieldsSet.userErrors,
    });
  }

  return response;
};
