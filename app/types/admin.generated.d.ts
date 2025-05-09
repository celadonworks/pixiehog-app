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


export type WebPixelCreateMutation = { webPixelCreate?: AdminTypes.Maybe<{ userErrors: Array<Pick<AdminTypes.ErrorsWebPixelUserError, 'code' | 'field' | 'message'>>, webPixel?: AdminTypes.Maybe<Pick<AdminTypes.WebPixel, 'id' | 'settings'>> }> };

export type WebPixelDeleteMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type WebPixelDeleteMutation = { webPixelDelete?: AdminTypes.Maybe<(
    Pick<AdminTypes.WebPixelDeletePayload, 'deletedWebPixelId'>
    & { userErrors: Array<Pick<AdminTypes.ErrorsWebPixelUserError, 'code' | 'field' | 'message'>> }
  )> };

export type WebPixelUpdateMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
  webPixel: AdminTypes.WebPixelInput;
}>;


export type WebPixelUpdateMutation = { webPixelUpdate?: AdminTypes.Maybe<{ userErrors: Array<Pick<AdminTypes.ErrorsWebPixelUserError, 'code' | 'field' | 'message'>>, webPixel?: AdminTypes.Maybe<Pick<AdminTypes.WebPixel, 'id' | 'settings'>> }> };

export type CurrentAppInstallationQueryVariables = AdminTypes.Exact<{
  namespace: AdminTypes.Scalars['String']['input'];
  posthogApiKeyKey: AdminTypes.Scalars['String']['input'];
  posthogApiHostKey: AdminTypes.Scalars['String']['input'];
  webPixelEventsSettingsKey: AdminTypes.Scalars['String']['input'];
  webPixelFeatureToggle: AdminTypes.Scalars['String']['input'];
  jsWebPosthogConfig: AdminTypes.Scalars['String']['input'];
  jsWebPosthogFeatureToggle: AdminTypes.Scalars['String']['input'];
  dataCollectionStrategyKey: AdminTypes.Scalars['String']['input'];
  webPixelTrackedEvents: AdminTypes.Scalars['String']['input'];
  webPixelPostHogEcommerceSpecKey: AdminTypes.Scalars['String']['input'];
}>;


export type CurrentAppInstallationQuery = { currentAppInstallation: (
    Pick<AdminTypes.AppInstallation, 'id'>
    & { app: Pick<AdminTypes.App, 'id' | 'title' | 'handle'>, posthog_api_key?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'value' | 'type'>>, posthog_api_host?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'value' | 'type'>>, data_collection_strategy?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'value' | 'type'>>, web_pixel_settings?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'jsonValue' | 'type'>>, web_pixel_feature_toggle?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'jsonValue' | 'value' | 'type'>>, web_pixel_posthog_ecommerce_spec?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'jsonValue' | 'value' | 'type'>>, web_pixel_tracked_events?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'jsonValue' | 'value' | 'type'>>, js_web_posthog_config?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'jsonValue' | 'value' | 'type'>>, js_web_posthog_feature_toggle?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'jsonValue' | 'value' | 'type'>> }
  ) };

export type ThemesQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
  files?: AdminTypes.InputMaybe<Array<AdminTypes.Scalars['String']['input']> | AdminTypes.Scalars['String']['input']>;
  roles?: AdminTypes.InputMaybe<Array<AdminTypes.ThemeRole> | AdminTypes.ThemeRole>;
}>;


export type ThemesQuery = { themes?: AdminTypes.Maybe<{ nodes: Array<(
      Pick<AdminTypes.OnlineStoreTheme, 'id' | 'name' | 'role'>
      & { files?: AdminTypes.Maybe<{ nodes: Array<(
          Pick<AdminTypes.OnlineStoreThemeFile, 'filename'>
          & { body: Pick<AdminTypes.OnlineStoreThemeFileBodyText, 'content'> }
        )> }> }
    )> }> };

export type WebPixelQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type WebPixelQuery = { webPixel?: AdminTypes.Maybe<Pick<AdminTypes.WebPixel, 'id' | 'settings'>> };

export type ServerCurrentAppInstallationQueryVariables = AdminTypes.Exact<{
  namespace: AdminTypes.Scalars['String']['input'];
  posthogApiKeyKey: AdminTypes.Scalars['String']['input'];
  posthogApiHostKey: AdminTypes.Scalars['String']['input'];
  webPixelEventsSettingsKey: AdminTypes.Scalars['String']['input'];
  webPixelFeatureToggle: AdminTypes.Scalars['String']['input'];
  jsWebPosthogConfig: AdminTypes.Scalars['String']['input'];
  jsWebPosthogFeatureToggle: AdminTypes.Scalars['String']['input'];
  dataCollectionStrategyKey: AdminTypes.Scalars['String']['input'];
  webPixelTrackedEvents: AdminTypes.Scalars['String']['input'];
}>;


export type ServerCurrentAppInstallationQuery = { currentAppInstallation: (
    Pick<AdminTypes.AppInstallation, 'id'>
    & { app: Pick<AdminTypes.App, 'id' | 'title' | 'handle'>, posthog_api_key?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'value' | 'type'>>, posthog_api_host?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'value' | 'type'>>, data_collection_strategy?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'value' | 'type'>>, web_pixel_settings?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'jsonValue' | 'type'>>, web_pixel_feature_toggle?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'jsonValue' | 'value' | 'type'>>, web_pixel_tracked_events?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'jsonValue' | 'value' | 'type'>>, js_web_posthog_config?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'jsonValue' | 'value' | 'type'>>, js_web_posthog_feature_toggle?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'key' | 'jsonValue' | 'value' | 'type'>> }
  ) };

interface GeneratedQueryTypes {
  "#graphql\n      query currentAppInstallation(\n        $namespace: String!\n        $posthogApiKeyKey: String!\n        $posthogApiHostKey: String!,\n        $webPixelEventsSettingsKey: String!\n        $webPixelFeatureToggle: String!\n        $jsWebPosthogConfig: String!\n        $jsWebPosthogFeatureToggle: String!\n        $dataCollectionStrategyKey: String!\n        $webPixelTrackedEvents: String!\n        $webPixelPostHogEcommerceSpecKey: String!\n      ) {\n        currentAppInstallation {\n          id\n          \n          app {\n            id\n            title\n            handle\n          }\n          posthog_api_key: metafield(namespace: $namespace, key: $posthogApiKeyKey) {\n            key\n            value\n            type\n          }\n          posthog_api_host: metafield(namespace: $namespace, key: $posthogApiHostKey) {\n            key\n            value\n            type\n          }\n          data_collection_strategy: metafield(namespace: $namespace, key: $dataCollectionStrategyKey) {\n            key\n            value\n            type\n          }\n          web_pixel_settings: metafield(namespace: $namespace, key: $webPixelEventsSettingsKey) {\n            key\n            jsonValue\n            type\n          }\n          web_pixel_feature_toggle: metafield(namespace: $namespace, key: $webPixelFeatureToggle) {\n            key\n            jsonValue\n            value\n            type\n          }\n          web_pixel_posthog_ecommerce_spec: metafield(namespace: $namespace, key: $webPixelPostHogEcommerceSpecKey) {\n            key\n            jsonValue\n            value\n            type\n          }\n          web_pixel_tracked_events: metafield(namespace: $namespace, key: $webPixelTrackedEvents) {\n            key\n            jsonValue\n            value\n            type\n          }\n          js_web_posthog_config: metafield(namespace: $namespace, key: $jsWebPosthogConfig) {\n            key\n            jsonValue\n            value\n            type\n          },\n          js_web_posthog_feature_toggle: metafield(namespace: $namespace, key: $jsWebPosthogFeatureToggle) {\n            key\n            jsonValue\n            value\n            type\n          },\n        }\n      }\n    ": {return: CurrentAppInstallationQuery, variables: CurrentAppInstallationQueryVariables},
  "#graphql\n      query Themes($first: Int!, $files: [String!], $roles: [ThemeRole!]) {\n        themes(first: $first, roles: $roles) {\n          nodes {\n            id\n            name\n            role\n            files(filenames: $files) {\n              nodes {\n                filename\n                body {\n                  ... on OnlineStoreThemeFileBodyText {\n                    content\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ": {return: ThemesQuery, variables: ThemesQueryVariables},
  "#graphql\n        query webPixel {\n          webPixel {\n            id\n            settings\n          }\n        }\n      ": {return: WebPixelQuery, variables: WebPixelQueryVariables},
  "#graphql\n      query serverCurrentAppInstallation(\n        $namespace: String!\n        $posthogApiKeyKey: String!\n        $posthogApiHostKey: String!,\n        $webPixelEventsSettingsKey: String!\n        $webPixelFeatureToggle: String!\n        $jsWebPosthogConfig: String!\n        $jsWebPosthogFeatureToggle: String!\n        $dataCollectionStrategyKey: String!\n        $webPixelTrackedEvents: String!\n      ) {\n        currentAppInstallation {\n          id\n          \n          app {\n            id\n            title\n            handle\n          }\n          posthog_api_key: metafield(namespace: $namespace, key: $posthogApiKeyKey) {\n            key\n            value\n            type\n          }\n          posthog_api_host: metafield(namespace: $namespace, key: $posthogApiHostKey) {\n            key\n            value\n            type\n          }\n          data_collection_strategy: metafield(namespace: $namespace, key: $dataCollectionStrategyKey) {\n            key\n            value\n            type\n          }\n          web_pixel_settings: metafield(namespace: $namespace, key: $webPixelEventsSettingsKey) {\n            key\n            jsonValue\n            type\n          }\n          web_pixel_feature_toggle: metafield(namespace: $namespace, key: $webPixelFeatureToggle) {\n            key\n            jsonValue\n            value\n            type\n          }\n          web_pixel_tracked_events: metafield(namespace: $namespace, key: $webPixelTrackedEvents) {\n            key\n            jsonValue\n            value\n            type\n          }\n          js_web_posthog_config: metafield(namespace: $namespace, key: $jsWebPosthogConfig) {\n            key\n            jsonValue\n            value\n            type\n          },\n          js_web_posthog_feature_toggle: metafield(namespace: $namespace, key: $jsWebPosthogFeatureToggle) {\n            key\n            jsonValue\n            value\n            type\n          },\n        }\n      }\n    ": {return: ServerCurrentAppInstallationQuery, variables: ServerCurrentAppInstallationQueryVariables},
  "\n      #graphql\n      query Themes($first: Int!, $files: [String!], $roles: [ThemeRole!]) {\n        themes(first: $first, roles: $roles) {\n          nodes {\n            id\n            name\n            role\n            files(filenames: $files) {\n              nodes {\n                filename\n                body {\n                  ... on OnlineStoreThemeFileBodyText {\n                    content\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ": {return: ThemesQuery, variables: ThemesQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n      mutation metafieldsDelete($metafields: [MetafieldIdentifierInput!]!) {\n        metafieldsDelete(metafields: $metafields) {\n          deletedMetafields {\n            key\n            namespace\n          }\n          userErrors {\n            field\n            message\n          }\n        }\n      }\n    ": {return: MetafieldsDeleteMutation, variables: MetafieldsDeleteMutationVariables},
  "#graphql\n      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {\n        metafieldsSet(metafields: $metafields) {\n          metafields {\n            key\n            namespace\n            value\n            createdAt\n            updatedAt\n          }\n          userErrors {\n            field\n            message\n            code\n          }\n        }\n      }\n    ": {return: MetafieldsSetMutation, variables: MetafieldsSetMutationVariables},
  "#graphql\n      mutation webPixelCreate($webPixel: WebPixelInput!) {\n        webPixelCreate(webPixel: $webPixel) {\n          userErrors {\n            code\n            field\n            message\n          }\n          webPixel {\n            id\n            settings\n          }\n        }\n      }\n    ": {return: WebPixelCreateMutation, variables: WebPixelCreateMutationVariables},
  "#graphql\n      mutation webPixelDelete($id: ID!) {\n        webPixelDelete(id: $id) {\n          userErrors {\n            code\n            field\n            message\n          }\n          deletedWebPixelId\n        }\n      }\n    ": {return: WebPixelDeleteMutation, variables: WebPixelDeleteMutationVariables},
  "#graphql\n      mutation webPixelUpdate($id: ID!, $webPixel: WebPixelInput!) {\n        webPixelUpdate(id: $id, webPixel: $webPixel) {\n          userErrors {\n            code\n            field\n            message\n          }\n          webPixel {\n            id\n            settings\n          }\n        }\n      }\n    ": {return: WebPixelUpdateMutation, variables: WebPixelUpdateMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
