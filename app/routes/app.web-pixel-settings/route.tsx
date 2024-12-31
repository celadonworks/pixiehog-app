import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Link
} from '@shopify/polaris';
import { authenticate } from '../../shopify.server';
import { SearchIcon } from '@shopify/polaris-icons';
import { queryCurrentAppInstallation } from 'app/common.server/queries/current-app-installation';
import MultiChoiceSelector from '../../../common/components/MultiChoiceSelector';
import { json, useFetcher, useLoaderData } from '@remix-run/react';
import type { WebPixelSettingChoice } from './interface/setting-row.interface';
import { WebPixelEventsSettingsSchema } from '../../../common/dto/web-pixel-events-settings.dto';
import { metafieldsSet } from '../../common.server/mutations/metafields-set';
import { Constant } from '../../../common/constant';
import type { WebPixelEventsSettings } from '../../../common/dto/web-pixel-events-settings.dto';
import { recalculateWebPixel } from '../../common.server/procedures/recalculate-web-pixel';
import { defaultWebPixelSettings } from './default-web-pixel-settings';
import { WebPixelFeatureToggleSchema } from '../../../common/dto/web-pixel-feature-toggle.dto';
import FeatureStatusManager from 'common/components/FeatureStatusManager';
import { detailedDiff } from 'deep-object-diff';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const currentAppInstallation = await queryCurrentAppInstallation(admin.graphql);
  return currentAppInstallation;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const payload = await request.json()
  const dtoResult = WebPixelEventsSettingsSchema.merge(WebPixelFeatureToggleSchema).safeParse(payload);
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

  const { web_pixel_feature_toggle, ...webPixelEventSettings } = dtoResult.data;
 
  await metafieldsSet(admin.graphql, 
    [
    {
      key: Constant.METAFIELD_KEY_WEB_PIXEL_FEATURE_TOGGLE,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: currentAppInstallation.id,
      type: 'boolean',
      value: web_pixel_feature_toggle.toString(),
    },
    {
      key: Constant.METAFIELD_KEY_WEB_PIXEL_EVENTS_SETTINGS,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: currentAppInstallation.id,
      value: JSON.stringify(webPixelEventSettings),
      type: 'json',
    },
  ]);

  const responseRecalculate = await recalculateWebPixel(admin.graphql);
  if (!responseRecalculate) {
    return json({ ok: true, message: 'Web pixel settings saved' }, { status: 200 });
  }
  return json({ ok: true, message: `Web pixel ${responseRecalculate.status}` }, { status: 200 });
};

export default function WebPixelEvents() {
  const fetcher = useFetcher();
  const currentAppInstallation = useLoaderData<typeof loader>();
  const webPixelSettingsMetafieldValue = currentAppInstallation?.web_pixel_settings?.jsonValue as
    | undefined
    | null
    | WebPixelEventsSettings;

  const webPixelSettingsInitialState = defaultWebPixelSettings.map<WebPixelSettingChoice>((entry) => {
      return {
        ...entry,
        value: webPixelSettingsMetafieldValue?.[entry.key] === true,
      } as WebPixelSettingChoice

    }
    
  );
  
  const [webPixelSettings, setWebPixelSettings] = useState(webPixelSettingsInitialState);

  const handleWebPixelSettingChange = (key: string,value?: string | number | string[]) => {
    setWebPixelSettings(
      webPixelSettings.map<WebPixelSettingChoice>((entry) => {
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
        } as WebPixelSettingChoice;
      })
    );
  };

  const selectedWebPixelSettings = webPixelSettings.filter((entry) => entry.type === "Checkbox" && entry.value);

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
      badge: `${Object.entries(selectedWebPixelSettings).length}`,
      accessibilityLabel: 'Selected Events',
      panelID: 'selected-events',
    },
  ];

  const [filter, setFilter] = useState('');
  const handleFilterChange = useCallback(
    (newValue: string) => {
      const WebPixelsFiltered = webPixelSettings.map<WebPixelSettingChoice>((entry) => {
        return {
          ...entry,
          filteredOut: ![entry.key, entry.description].some((item) => item.includes(newValue)),
        };
      });

      setWebPixelSettings(WebPixelsFiltered);
      setFilter(newValue);
    },
    [webPixelSettings]
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

  const webPixelFeatureToggleInitialState = currentAppInstallation.web_pixel_feature_toggle?.jsonValue == true
  const [webPixelFeatureEnabled, setWebPixelFeatureEnabled] = useState(
    webPixelFeatureToggleInitialState
  );
  const handleWebPixelFeatureEnabledToggle = useCallback(() => setWebPixelFeatureEnabled((value) => !value), []);


  const submitSettings = () => {
    fetcher.submit(
      {
        ...Object.fromEntries(
          webPixelSettings.map(({ key, value }) => {
            return [key, value];
          })
        ),
        web_pixel_feature_toggle: webPixelFeatureEnabled,
      },
      {
        method: 'POST',
        encType: "application/json"
      }
    );
  };

  const dirty = useMemo(() => {
    console.dir({
      webPixelSettings,
      webPixelSettingsInitialState
    })
    console.dir({
      webPixelFeatureEnabled,
      webPixelFeatureToggleInitialState,
    })
    const diff = detailedDiff(webPixelSettingsInitialState || {}, webPixelSettings);
    console.dir(diff)
    if (Object.values(diff).some((changeType: object) => Object.keys(changeType).length != 0)) {
      return true;
    }
    return webPixelFeatureEnabled != webPixelFeatureToggleInitialState
  }, [webPixelSettings, webPixelFeatureEnabled, webPixelFeatureToggleInitialState, webPixelSettingsInitialState]);

  const allEventsDisabled = webPixelSettings.every((entry) => !entry.value)
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

              <FeatureStatusManager
                featureEnabled={webPixelFeatureEnabled}
                handleFeatureEnabledToggle={handleWebPixelFeatureEnabledToggle}
                dirty= {dirty}
                bannerTitle='The following requirements need to be meet to finalize the Web Pixel setup:'
                bannerTone='warning'
                customActions={[
                  {
                    trigger : !currentAppInstallation.posthog_api_key?.value,
                    badgeText:"Action required",
                    badgeTone: "critical",
                    badgeToneOnDirty: "attention",
                    bannerMessage: <div>Setup Posthog project API key <Link url="/app">Here</Link>.</div>
                  },
                  {
                    trigger : !currentAppInstallation.posthog_api_host?.value,
                    badgeText:"Action required",
                    badgeTone: "critical",
                    badgeToneOnDirty: "attention",
                    bannerMessage: <div>Setup Posthog API host <Link url="/app">Here</Link>.</div>
                  },
                  {
                    trigger : allEventsDisabled,
                    badgeText:"Action required",
                    badgeTone: "critical",
                    badgeToneOnDirty: "attention",
                    bannerMessage: "Select at least 1 event from the list below."
                  }
              ]}
              />
              <Divider />
              <Tabs disabled={!webPixelFeatureEnabled} tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
                <BlockStack gap="500">
                  <TextField
                    label=""
                    value={filter}
                    placeholder="Filter events"
                    onChange={handleFilterChange}
                    autoComplete="off"
                    disabled={!webPixelFeatureEnabled}
                    prefix={<Icon source={SearchIcon}></Icon>}
                  />
                  <MultiChoiceSelector
                    settings={tabs[selectedTab].id === 'all' ? webPixelSettings  : selectedWebPixelSettings}
                    onChange={handleWebPixelSettingChange}
                    featureEnabled={webPixelFeatureEnabled}
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
