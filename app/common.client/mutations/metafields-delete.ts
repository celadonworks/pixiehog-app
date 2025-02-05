import { ShopifyUserErrorException } from '../exceptions/shopify-user-error.exception'; 
import type { MetafieldIdentifierInput } from '../../types/admin.types';
import { clientGraphQL } from '../client-graphql-client';

export const metafieldsDelete = async (
  metafields: MetafieldIdentifierInput[]
) => {
  const response = await clientGraphQL(
    `#graphql
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

  if (response.data?.metafieldsDelete?.userErrors && response.data?.metafieldsDelete?.userErrors.length > 0) {
    throw new ShopifyUserErrorException(`metafieldsDelete encountered userErrors`, {
      metafields,
      userErrors: response.data?.metafieldsDelete.userErrors,
    });
  }

  return response;
};
