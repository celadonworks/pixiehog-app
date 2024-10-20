/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type MetafieldsDeleteMutationVariables = AdminTypes.Exact<{
  metafields: Array<AdminTypes.MetafieldIdentifierInput> | AdminTypes.MetafieldIdentifierInput;
}>;


export type MetafieldsDeleteMutation = { metafieldsDelete?: AdminTypes.Maybe<{ deletedMetafields?: AdminTypes.Maybe<Array<AdminTypes.Maybe<Pick<AdminTypes.MetafieldIdentifier, 'key' | 'namespace'>>>>, userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>> }> };

export type MetafieldsSetMutationVariables = AdminTypes.Exact<{
  metafields: Array<AdminTypes.MetafieldsSetInput> | AdminTypes.MetafieldsSetInput;
}>;


export type MetafieldsSetMutation = { metafieldsSet?: AdminTypes.Maybe<{ metafields?: AdminTypes.Maybe<Array<Pick<AdminTypes.Metafield, 'key' | 'namespace' | 'value' | 'createdAt' | 'updatedAt'>>>, userErrors: Array<Pick<AdminTypes.MetafieldsSetUserError, 'field' | 'message' | 'code'>> }> };

export type WebPixelCreateMutationVariables = AdminTypes.Exact<{
  webPixel: AdminTypes.WebPixelInput;
}>;


export type WebPixelCreateMutation = { webPixelCreate?: AdminTypes.Maybe<{ userErrors: Array<Pick<AdminTypes.ErrorsWebPixelUserError, 'code' | 'field'>>, webPixel?: AdminTypes.Maybe<Pick<AdminTypes.WebPixel, 'id' | 'settings'>> }> };

export type WebPixelDeleteMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type WebPixelDeleteMutation = { webPixelDelete?: AdminTypes.Maybe<(
    Pick<AdminTypes.WebPixelDeletePayload, 'deletedWebPixelId'>
    & { userErrors: Array<Pick<AdminTypes.ErrorsWebPixelUserError, 'code' | 'field'>> }
  )> };

export type WebPixelUpdateMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
  webPixel: AdminTypes.WebPixelInput;
}>;


export type WebPixelUpdateMutation = { webPixelUpdate?: AdminTypes.Maybe<{ userErrors: Array<Pick<AdminTypes.ErrorsWebPixelUserError, 'code' | 'field'>>, webPixel?: AdminTypes.Maybe<Pick<AdminTypes.WebPixel, 'id' | 'settings'>> }> };

export type CurrentAppInstallationQueryVariables = AdminTypes.Exact<{
  namespace: AdminTypes.Scalars['String']['input'];
  posthogApiKeyKey: AdminTypes.Scalars['String']['input'];
  webPixelEventsSettingsKey: AdminTypes.Scalars['String']['input'];
}>;


export type CurrentAppInstallationQuery = { currentAppInstallation: (
    Pick<AdminTypes.AppInstallation, 'id'>
    & { app: Pick<AdminTypes.App, 'id'>, posthog_api_key?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'value' | 'type'>>, web_pixel_settings?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'jsonValue' | 'value' | 'type'>> }
  ) };

export type WebPixelQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type WebPixelQuery = { webPixel?: AdminTypes.Maybe<Pick<AdminTypes.WebPixel, 'id' | 'settings'>> };

interface GeneratedQueryTypes {
  "#graphql\n    query currentAppInstallation($namespace: String!, $posthogApiKeyKey: String!, $webPixelEventsSettingsKey: String!) {\n      currentAppInstallation {\n        id\n        app {\n          id\n        }\n        posthog_api_key: metafield(namespace: $namespace, key: $posthogApiKeyKey) {\n          key\n          value\n          type\n        }\n        web_pixel_settings: metafield(namespace: $namespace, key: $webPixelEventsSettingsKey) {\n          key\n          jsonValue\n          value\n          type\n        }\n        \n      }\n    }\n    ": {return: CurrentAppInstallationQuery, variables: CurrentAppInstallationQueryVariables},
  "\n      #graphql\n      query webPixel {\n        webPixel {\n          id\n          settings\n        }\n      }\n    ": {return: WebPixelQuery, variables: WebPixelQueryVariables},
}

interface GeneratedMutationTypes {
  "\n      #graphql\n      mutation metafieldsDelete($metafields: [MetafieldIdentifierInput!]!) {\n        metafieldsDelete(metafields: $metafields) {\n          deletedMetafields {\n            key\n            namespace\n          }\n          userErrors {\n            field\n            message\n          }\n        }\n      }\n    ": {return: MetafieldsDeleteMutation, variables: MetafieldsDeleteMutationVariables},
  "\n      #graphql\n      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {\n        metafieldsSet(metafields: $metafields) {\n          metafields {\n            key\n            namespace\n            value\n            createdAt\n            updatedAt\n          }\n          userErrors {\n            field\n            message\n            code\n          }\n        }\n      }\n    ": {return: MetafieldsSetMutation, variables: MetafieldsSetMutationVariables},
  "\n      #graphql\n      mutation webPixelCreate($webPixel: WebPixelInput!) {\n        webPixelCreate(webPixel: $webPixel) {\n          userErrors {\n            code\n            field\n            code\n          }\n          webPixel {\n            id\n            settings\n          }\n        }\n      }\n    ": {return: WebPixelCreateMutation, variables: WebPixelCreateMutationVariables},
  "\n      #graphql\n      mutation webPixelDelete($id: ID!) {\n        webPixelDelete(id: $id) {\n          userErrors {\n            code\n            field\n            code\n          }\n          deletedWebPixelId\n        }\n      }\n    ": {return: WebPixelDeleteMutation, variables: WebPixelDeleteMutationVariables},
  "\n      #graphql\n      mutation webPixelUpdate($id: ID!, $webPixel: WebPixelInput!) {\n        webPixelUpdate(id: $id, webPixel: $webPixel) {\n          userErrors {\n            code\n            field\n            code\n          }\n          webPixel {\n            id\n            settings\n          }\n        }\n      }\n    ": {return: WebPixelUpdateMutation, variables: WebPixelUpdateMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
