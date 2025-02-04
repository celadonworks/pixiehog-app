import { GraphqlQueryError } from '@shopify/shopify-api';
import type { GraphQLClientResponse } from '@shopify/shopify-api';
import type { Maybe, WebPixel } from '../../types/admin.types';
import { clientGraphQL } from '../client-graphql-client';

export const queryWebPixel = async () => {
  try {
    const response = await clientGraphQL(
      `#graphql
        query webPixel {
          webPixel {
            id
            settings
          }
        }
      `
    );

    return response.data?.webPixel;
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
