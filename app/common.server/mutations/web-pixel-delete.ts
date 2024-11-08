import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';

export async function webPixelDelete(graphql: AdminGraphqlClient, id: string) {
  const resp = await graphql(
    `#graphql
      mutation webPixelDelete($id: ID!) {
        webPixelDelete(id: $id) {
          userErrors {
            code
            field
            code
          }
          deletedWebPixelId
        }
      }
    `,
    {
      variables: {
        id,
      },
    }
  );

  const payload = await resp.json();
  return payload;
}
