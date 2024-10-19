import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';
import { json } from '@remix-run/node';
import type { MetafieldsSetMutationVariables } from '../../types/admin.generated';

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

  
  const responseData = (await response.json()).data;
  return json(responseData);
};
