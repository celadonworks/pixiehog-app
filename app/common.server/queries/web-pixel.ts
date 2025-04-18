import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';
import { GraphqlQueryError } from '@shopify/shopify-api';
import type { GraphQLClientResponse } from '@shopify/shopify-api';
import type { Maybe, WebPixel } from '../../types/admin.types';

export const queryWebPixel = async (graphql: AdminGraphqlClient) => {
  try {
    const response = await graphql(
      `#graphql
        query webPixel {
          webPixel {
            id
            settings
          }
        }
      `
    );

    const responseJson = await response.json();
    return responseJson.data?.webPixel;
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      const body = error.body as GraphQLClientResponse<Maybe<WebPixel>>;
      const webPixelNotFound = body.errors?.graphQLErrors?.some((errorMessage) =>
        errorMessage?.message?.includes?.('No web pixel was found')
      );
      if (webPixelNotFound) {
        return body.data;
      }
    }
    throw error;
  }
};
