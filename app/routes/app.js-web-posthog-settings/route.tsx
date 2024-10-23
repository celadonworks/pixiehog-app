import { useCallback, useEffect, useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Tabs,
  Divider,
  TextField,
  Icon,
  Box,
} from '@shopify/polaris';
import { authenticate } from '../../shopify.server';
import { SearchIcon } from '@shopify/polaris-icons';
import { queryCurrentAppInstallation } from 'app/common.server/queries/current-app-installation';
import MultiChoiceSelector from './MultiChoiceSelector';
import { json, useFetcher, useLoaderData } from '@remix-run/react';
import type { JsWebPosthogSettingChoice } from './interface/setting-row.interface';
import { metafieldsSet } from '../../common.server/mutations/metafields-set';
import { Constant } from '../../../common/constant';
import type { JsWebPosthogConfig } from '../../../common/dto/js-web-settings.dto';
import { defaultJsWebPosthogSettings } from './default-js-web-settings';
import { JsWebPosthogConfigSchema } from 'common/dto/js-web-settings.dto';
import { JsWebPosthogFeatureToggleSchema } from 'common/dto/js-web-feature-toggle.dto';
import JsWebPosthogHeader from './Header';
import { detailedDiff } from 'deep-object-diff';
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const currentAppInstallation = await queryCurrentAppInstallation(admin.graphql);
  return currentAppInstallation;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  //const formData = await request.formData();
  const payload = await request.json()
  //const payload = Object.fromEntries(formData.entries());

  const dtoResult = JsWebPosthogConfigSchema.merge(JsWebPosthogFeatureToggleSchema).safeParse(payload);
  if (!dtoResult.success) {
    const message = Object.entries(dtoResult.error.flatten().fieldErrors)
      .map(([key, errors]) => {
        return `${key}`;
      })
      .join(', ');
    return json({ ok: false, message: `Invalid keys: ${message}` }, { status: 400 });
  }
  
  const { admin } = await authenticate.admin(request);
  const currentAppInstallation = await queryCurrentAppInstallation(admin.graphql);

  const { js_web_posthog_feature_toggle, ...jsWebPosthogEventSettings } = dtoResult.data;
  const responseMetafieldsSet = await metafieldsSet(admin.graphql, 
    [
    {
      key: Constant.METAFIELD_KEY_JS_WEB_POSTHOG_FEATURE_TOGGLE,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: currentAppInstallation.id,
      type: 'json',
      value: js_web_posthog_feature_toggle.toString(),
    },
    {
      key: Constant.METAFIELD_KEY_JS_WEB_POSTHOG_CONFIG,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: currentAppInstallation.id,
      value: JSON.stringify(jsWebPosthogEventSettings),
      type: 'json',
    },
  ]);
  /*
  TODO: handle metafieldsSet error
  */
  return json({ ok: true, message: 'PostHog Javascript settings saved' }, { status: 200 });
};

export default function JsWebEvents() {
  const fetcher = useFetcher();
  const currentAppInstallation = useLoaderData<typeof loader>();
  const jsWebPosthogSettingsMetafieldValue = currentAppInstallation?.js_web_posthog_config?.jsonValue as
    | undefined
    | null
    | JsWebPosthogConfig;
    
  const jsWebPosthogSettingsInitialState = defaultJsWebPosthogSettings.map<JsWebPosthogSettingChoice>((entry) => {
    if(jsWebPosthogSettingsMetafieldValue?.[entry.key]){
      return {
        ...entry,
        value: jsWebPosthogSettingsMetafieldValue?.[entry.key],
      } as JsWebPosthogSettingChoice
    }

    return entry
 
  });

  const [jsWebPosthogSettings, setJsWebPosthogSettings] = useState(jsWebPosthogSettingsInitialState);

  const handleJsWebPosthogSettingChange = (key: string, value?: string | number | string[]) => {
    setJsWebPosthogSettings(
      jsWebPosthogSettings.map<JsWebPosthogSettingChoice>((entry) => {
        if (entry.key != key) {
          return entry;
        }
        if(entry.type === "Checkbox"){
          return {
            ...entry,
            value: !entry.value,
          }
        }
        return {
          ...entry,
          value: value,
        } as JsWebPosthogSettingChoice
      })
    );
  };
  const selectedJsWebPosthogSettings = jsWebPosthogSettings.filter((entry) => entry.type === "Checkbox" && entry.value);

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
      return
    }

    window.shopify.toast.show(data.message, {
      isError: false,
      duration: 2000,
    });
    return;
  }, [fetcher, fetcher.data, fetcher.state]);

  
  const jsWebPosthogFeatureEnabledInitialState = currentAppInstallation.js_web_posthog_feature_toggle?.jsonValue == true
  const [jsWebPosthogFeatureEnabled, setjsWebPosthogFeatureEnabled] = useState(
    jsWebPosthogFeatureEnabledInitialState
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
        encType: "application/json"
      }
    );
  };

  const handleJsWebPosthogFeatureEnabledToggle = useCallback(() => setjsWebPosthogFeatureEnabled((value) => !value), []);
  const formattedJsWebPosthogSettings = Object.fromEntries(jsWebPosthogSettings.map(({key, value}) => [key, value] ))
  const diff = detailedDiff(jsWebPosthogSettingsMetafieldValue || {}, formattedJsWebPosthogSettings)
  const dirty = Object.values(diff).some((changeType: object) => Object.keys(changeType).length != 0) || jsWebPosthogFeatureEnabled != jsWebPosthogFeatureToggleInitialState;
  return (
    <Page
      title="Web Pixel Settings"
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
              <JsWebPosthogHeader
                posthogApiKey={currentAppInstallation.posthog_api_key?.value}
                settings={jsWebPosthogSettings}
                featureEnabled={jsWebPosthogFeatureEnabled}
                handleFeatureEnabledToggle={handleJsWebPosthogFeatureEnabledToggle}
                dirty= {dirty}
              />
              <Divider />
              <Tabs disabled={!jsWebPosthogFeatureEnabled} tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
                <BlockStack gap="500">
                  <TextField
                    label=""
                    value={filter}
                    placeholder="Filter Events"
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
