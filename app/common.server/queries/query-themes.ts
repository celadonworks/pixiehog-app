import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';
import type { ThemeRole } from '../../types/admin.types';

export const queryThemes = async (
  graphql: AdminGraphqlClient,
  payload: {
    first: number;
    files: string[];
    roles: ThemeRole[];
  }
) => {
  const response = await graphql(
    `
      #graphql
      query Themes($first: Int!, $files: [String!], $roles: [ThemeRole!]) {
        themes(first: $first, roles: $roles) {
          nodes {
            id
            name
            role
            files(filenames: $files) {
              nodes {
                filename
                body {
                  ... on OnlineStoreThemeFileBodyText {
                    content
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      variables: payload,
    }
  );

  const responseJson = await response.json();
  return responseJson.data?.themes?.nodes;
};
