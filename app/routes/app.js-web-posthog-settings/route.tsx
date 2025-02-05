import type { ClientActionFunctionArgs, ClientLoaderFunctionArgs} from '@remix-run/react';
import type { JsWebPosthogSettingChoice } from './interface/setting-row.interface';
import type { JsWebPosthogConfig } from '../../../common/dto/js-web-settings.dto';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Page, Layout, Card, BlockStack, Tabs, Divider, TextField, Icon, Box, Link } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { queryCurrentAppInstallation as clientQueryCurrentAppInstallation } from 'app/common.client/queries/current-app-installation';
import MultiChoiceSelector from '../../../common/components/MultiChoiceSelector';
import { metafieldsSet as clientMetafieldsSet } from '../../common.client/mutations/metafields-set';
import { Constant } from '../../../common/constant';
import { defaultJsWebPosthogSettings } from './default-js-web-settings';
import { JsWebPosthogConfigSchema } from 'common/dto/js-web-settings.dto';
import { JsWebPosthogFeatureToggleSchema } from 'common/dto/js-web-feature-toggle.dto';
import FeatureStatusManager from '../../../common/components/FeatureStatusManager';
import { detailedDiff } from 'deep-object-diff';
import { appEmbedStatus as clientAppEmbedStatus } from '../../common.client/procedures/app-embed-status';
import { SettingType } from '../../../common/interfaces/feature-settings.interface';
import LoadingSpinner from '../../../common/components/LoadingSpinner';


export const clientLoader = async ({
  request,
  params,
}: ClientLoaderFunctionArgs) => {

  const response = await clientQueryCurrentAppInstallation();
  const currentPosthogJsWebAppEmbedStatus = await clientAppEmbedStatus(window.ENV.APP_POSTHOG_JS_WEB_THEME_APP_UUID);
  const payload = {
    currentAppInstallation: response.currentAppInstallation,
    js_web_posthog_app_embed_status: currentPosthogJsWebAppEmbedStatus,
    js_web_posthog_app_embed_uuid: window.ENV.APP_POSTHOG_JS_WEB_THEME_APP_UUID,
    shop: shopify.config.shop,
    js_web_posthog_app_embed_handle: Constant.APP_POSTHOG_JS_WEB_THEME_APP_HANDLE,
  }
  return payload;
}
export const clientAction = async ({
  request,
  params,
}: ClientActionFunctionArgs) => {
  const payload = await request.json();
  const dtoResult = JsWebPosthogConfigSchema.merge(JsWebPosthogFeatureToggleSchema).safeParse(payload);
  if (!dtoResult.success) {
    const message = Object.entries(dtoResult.error.flatten().fieldErrors)
      .map(([key, errors]) => {
        return `${key}`;
      })
      .join(', ');
    return { ok: false, message: `Invalid keys: ${message}` }
  }
  const response = await clientQueryCurrentAppInstallation();
  const { js_web_posthog_feature_toggle, ...jsWebPosthogEventSettings } = dtoResult.data;
  await clientMetafieldsSet([
    {
      key: Constant.METAFIELD_KEY_JS_WEB_POSTHOG_FEATURE_TOGGLE,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: response.currentAppInstallation.id,
      type: 'boolean',
      value: js_web_posthog_feature_toggle.toString(),
    },
    {
      key: Constant.METAFIELD_KEY_JS_WEB_POSTHOG_CONFIG,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: response.currentAppInstallation.id,
      value: JSON.stringify(jsWebPosthogEventSettings),
      type: 'json',
    },
  ]);
  /*
  TODO: handle metafieldsSet error
  */
  return { ok: true, message: 'PostHog Javascript settings saved' }
}

export function HydrateFallback() {
  return <LoadingSpinner />
}

export default function JsWebEvents() {
  const fetcher = useFetcher();
  const {
    currentAppInstallation,
    js_web_posthog_app_embed_status: jsWebPosthogAppEmbedStatus,
    js_web_posthog_app_embed_uuid: jsWebPosthogAppEmbedUuid,
    js_web_posthog_app_embed_handle: jsWebPosthogAppEmbedHandle,
    shop,
  } = useLoaderData<typeof clientLoader>();
  const jsWebPosthogSettingsMetafieldValue = currentAppInstallation?.js_web_posthog_config?.jsonValue as
    | undefined
    | null
    | JsWebPosthogConfig;

  const jsWebPosthogSettingsInitialState = defaultJsWebPosthogSettings.map<JsWebPosthogSettingChoice>((entry) => {
    return {
      ...entry,
      ...(entry.key == 'ui_host' && entry.type == SettingType.Select && {
        selectOptions: entry.selectOptions.map((v) => {
          const label = (() => {
            if (v == 'https://eu.posthog.com') {
              return 'Posthog EU'
            }
            return 'Posthog US'
          })();
          return {
            label: label,
            value: v,
          }
        })
      }),
      value: jsWebPosthogSettingsMetafieldValue?.[entry.key],
    } as JsWebPosthogSettingChoice;

  });

  const [jsWebPosthogSettings, setJsWebPosthogSettings] = useState(jsWebPosthogSettingsInitialState);

  const handleJsWebPosthogSettingChange = (key: string, value?: string | number | string[]) => {
    setJsWebPosthogSettings(
      jsWebPosthogSettings.map<JsWebPosthogSettingChoice>((entry) => {
        if (entry.key != key) {
          return entry;
        }
        if (entry.type === 'Checkbox') {
          return {
            ...entry,
            value: !entry.value,
          };
        }
        return {
          ...entry,
          value: value,
        } as JsWebPosthogSettingChoice;
      })
    );
  };
  const selectedJsWebPosthogSettings = jsWebPosthogSettings.filter((entry) => entry.type === 'Checkbox' && entry.value);

  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = useCallback((selectedTabIndex: number) => setSelectedTab(selectedTabIndex), []);
  const tabs = [
    {
      id: 'all',
      content: 'All',
      accessibilityLabel: 'All Events',
      panelID: 'all-events',
    },
    {
      id: 'selected',
      content: 'Selected',
      badge: `${Object.entries(selectedJsWebPosthogSettings).length}`,
      accessibilityLabel: 'Selected Events',
      panelID: 'selected-events',
    },
  ];

  const [filter, setFilter] = useState('');
  const handleFilterChange = useCallback(
    (newValue: string) => {
      const JsWebFiltered = jsWebPosthogSettings.map<JsWebPosthogSettingChoice>((entry) => {
        return {
          ...entry,
          filteredOut: ![entry.key, entry.description].some((item) => item.includes(newValue)),
        };
      });

      setJsWebPosthogSettings(JsWebFiltered);
      setFilter(newValue);
    },
    [jsWebPosthogSettings]
  );

  useEffect(() => {
    const data = fetcher.data as { ok: false; message: string } | { ok: true; message: string } | null;
    if (!data) {
      return;
    }
    if (!data.ok) {
      window.shopify.toast.show(data.message, {
        isError: true,
        duration: 2000,
      });
      return;
    }

    window.shopify.toast.show(data.message, {
      isError: false,
      duration: 2000,
    });
    return;
  }, [fetcher, fetcher.data, fetcher.state]);

  const jsWebPosthogFeatureEnabledInitialState =
    currentAppInstallation.js_web_posthog_feature_toggle?.jsonValue == true;
  const [jsWebPosthogFeatureEnabled, setjsWebPosthogFeatureEnabled] = useState(jsWebPosthogFeatureEnabledInitialState);
  const handleJsWebPosthogFeatureEnabledToggle = useCallback(
    () => setjsWebPosthogFeatureEnabled((value) => !value),
    []
  );

  const submitSettings = () => {
    fetcher.submit(
      {
        ...Object.fromEntries(
          jsWebPosthogSettings.map(({ key, value }) => {
            return [key, value];
          })
        ),
        js_web_posthog_feature_toggle: jsWebPosthogFeatureEnabled,
      },
      {
        method: 'POST',
        encType: 'application/json',
      }
    );
  };

  const dirty = useMemo(() => {
   
    const diff = detailedDiff(jsWebPosthogSettingsInitialState || {}, jsWebPosthogSettings);

    if (Object.values(diff).some((changeType: object) => Object.keys(changeType).length != 0)) {
      return true;
    }
    return jsWebPosthogFeatureEnabled != jsWebPosthogFeatureEnabledInitialState
  }, [jsWebPosthogSettings, jsWebPosthogSettingsInitialState, jsWebPosthogFeatureEnabledInitialState, jsWebPosthogFeatureEnabled]);
  return (
    <Page
      title="JS Web Config"
      primaryAction={{
        onAction: submitSettings,
        content: 'Save',
        loading: fetcher.state != 'idle',
        disabled: fetcher.state != 'idle' || !dirty,
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <FeatureStatusManager
                featureEnabled={jsWebPosthogFeatureEnabled}
                handleFeatureEnabledToggle={handleJsWebPosthogFeatureEnabledToggle}
                dirty={dirty}
                bannerTitle="The following requirements need to be meet to finalize the Javascript Web setup:"
                bannerTone="warning"
                customActions={[
                  {
                    trigger: !currentAppInstallation.posthog_api_key?.value,
                    badgeText: 'Action required',
                    badgeTone: 'critical',
                    badgeToneOnDirty: 'attention',
                    bannerMessage: (
                      <div>
                        Setup Posthog project API key <Link url="/app">Here</Link>.
                      </div>
                    ),
                  },
                  {
                    trigger: !currentAppInstallation.posthog_api_host?.value,
                    badgeText: 'Action required',
                    badgeTone: 'critical',
                    badgeToneOnDirty: 'attention',
                    bannerMessage: (
                      <div>
                        Setup Posthog API host <Link url="/app">Here</Link>.
                      </div>
                    ),
                  },
                  {
                    trigger: !jsWebPosthogAppEmbedStatus,
                    badgeText: 'Action required',
                    badgeTone: 'critical',
                    badgeToneOnDirty: 'attention',
                    bannerMessage: (
                      <div>
                        Toggle Posthog JS web app embed on. <Link target='_blank'  url={`https://${shop}/admin/themes/current/editor?context=apps&activateAppId=${jsWebPosthogAppEmbedUuid}/${jsWebPosthogAppEmbedHandle}`}>Click Here</Link>. ensure changes are saved.
                      </div>
                    ),
                  },
                ]}
              />
              <Divider />
              <Tabs
                disabled={!jsWebPosthogFeatureEnabled}
                tabs={tabs}
                selected={selectedTab}
                onSelect={handleTabChange}
              >
                <BlockStack gap="500">
                  <TextField
                    label=""
                    value={filter}
                    placeholder="Filter properties"
                    onChange={handleFilterChange}
                    autoComplete="off"
                    disabled={!jsWebPosthogFeatureEnabled}
                    prefix={<Icon source={SearchIcon}></Icon>}
                  />
                  <MultiChoiceSelector
                    settings={tabs[selectedTab].id === 'all' ? jsWebPosthogSettings : selectedJsWebPosthogSettings}
                    onChange={handleJsWebPosthogSettingChange}
                    featureEnabled={jsWebPosthogFeatureEnabled}
                  ></MultiChoiceSelector>
                </BlockStack>
              </Tabs>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
      <Box paddingBlockEnd={'800'}></Box>
    </Page>
  );
}
