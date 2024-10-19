/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type MetafieldsSetMutationVariables = AdminTypes.Exact<{
  metafields: Array<AdminTypes.MetafieldsSetInput> | AdminTypes.MetafieldsSetInput;
}>;


export type MetafieldsSetMutation = { metafieldsSet?: AdminTypes.Maybe<{ metafields?: AdminTypes.Maybe<Array<Pick<AdminTypes.Metafield, 'key' | 'namespace' | 'value' | 'createdAt' | 'updatedAt'>>>, userErrors: Array<Pick<AdminTypes.MetafieldsSetUserError, 'field' | 'message' | 'code'>> }> };

export type WebPixelCreateMutationVariables = AdminTypes.Exact<{
  webPixel: AdminTypes.WebPixelInput;
}>;


export type WebPixelCreateMutation = { webPixelCreate?: AdminTypes.Maybe<{ userErrors: Array<Pick<AdminTypes.ErrorsWebPixelUserError, 'code' | 'field'>>, webPixel?: AdminTypes.Maybe<Pick<AdminTypes.WebPixel, 'id' | 'settings'>> }> };

export type CurrentAppInstallationQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type CurrentAppInstallationQuery = { currentAppInstallation: (
    Pick<AdminTypes.AppInstallation, 'id'>
    & { app: Pick<AdminTypes.App, 'id'>, ph_key?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'jsonValue' | 'value' | 'type'>>, web_pixel_events?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'jsonValue' | 'value' | 'type'>> }
  ) };

interface GeneratedQueryTypes {
  "#graphql\n    query currentAppInstallation {\n      currentAppInstallation {\n        id\n        app {\n          id\n        }\n        ph_key: metafield(namespace: \"ph_analytics\", key: \"apiKey\") {\n          key\n          jsonValue\n          value\n          type\n        }\n        web_pixel_events: metafield(namespace: \"ph_analytics\", key: \"webPixelEvents\") {\n          key\n          jsonValue\n          value\n          type\n        }\n        \n      }\n    }\n    ": {return: CurrentAppInstallationQuery, variables: CurrentAppInstallationQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {\n        metafieldsSet(metafields: $metafields) {\n          metafields {\n            key\n            namespace\n            value\n            createdAt\n            updatedAt\n          }\n          userErrors {\n            field\n            message\n            code\n          }\n        }\n      }": {return: MetafieldsSetMutation, variables: MetafieldsSetMutationVariables},
  "\n      #graphql\n      mutation webPixelCreate($webPixel: WebPixelInput!) {\n        webPixelCreate(webPixel: $webPixel) {\n          userErrors {\n            code\n            field\n            code\n          }\n          webPixel {\n            id\n            settings\n          }\n        }\n      }\n    ": {return: WebPixelCreateMutation, variables: WebPixelCreateMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
