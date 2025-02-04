import { clientGraphQL } from "../client-graphql-client";

export async function webPixelDelete(id: string) {
  const response = await clientGraphQL(
    `#graphql
      mutation webPixelDelete($id: ID!) {
        webPixelDelete(id: $id) {
          userErrors {
            code
            field
            message
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

  const payload = await response
  return payload;
}
