import type { ThemeRole } from '../../types/admin.types';
import { clientGraphQL } from '../client-graphql-client';

export const queryThemes = async (
  payload: {
    first: number;
    files: string[];
    roles: ThemeRole[];
  }
) => {
  const response = await clientGraphQL(
    `#graphql
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

  return response.data?.themes?.nodes;
};
