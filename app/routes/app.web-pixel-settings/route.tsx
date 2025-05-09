import { useCallback, useEffect, useMemo, useState } from 'react';
import { Page, Layout, Card, BlockStack, Tabs, Divider, TextField, Icon, Box, Link, InlineStack, Checkbox } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { queryCurrentAppInstallation as clientQueryCurrentAppInstallation } from 'app/common.client/queries/current-app-installation';
import MultiChoiceSelector from '../../../common/components/MultiChoiceSelector';
import type { ClientActionFunctionArgs, ClientLoaderFunctionArgs } from '@remix-run/react';
import { json, useFetcher, useLoaderData } from '@remix-run/react';
import type { WebPixelSettingChoice } from './interface/setting-row.interface';
import { WebPixelEventsSettingsSchema } from '../../../common/dto/web-pixel-events-settings.dto';
import { metafieldsSet as clientMetafieldsSet } from '../../common.client/mutations/metafields-set';
import { Constant } from '../../../common/constant';
import type { WebPixelEventsSettings } from '../../../common/dto/web-pixel-events-settings.dto';
import { recalculateWebPixel as clientRecalculateWebPixel } from '../../common.client/procedures/recalculate-web-pixel';
import { defaultWebPixelSettings } from './default-web-pixel-settings';
import { WebPixelFeatureToggleSchema } from '../../../common/dto/web-pixel-feature-toggle.dto';
import FeatureStatusManager from 'common/components/FeatureStatusManager';
import { detailedDiff } from 'deep-object-diff';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import { queryWebPixel } from '../../common.client/queries/web-pixel';
import type { WebPixelSettings } from '../../../common/dto/web-pixel-settings.dto';
import { WebPixelPostHogEcommerceSpecSchema } from '../../../common/dto/web-pixel-posthog-ecommerce-spec';
import { posthogSvg } from './posthog.svg';
import { urlWithShopParam } from '../../../common/utils';
import { posthogKeys, shopifyKeys } from './keyoverrides';

export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  const response = await clientQueryCurrentAppInstallation();
  const webPixel = await queryWebPixel() || null;
  
  return { currentAppInstallation: response.currentAppInstallation, webPixel, shop: shopify.config.shop, };
};

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const payload = await request.json();
  const dtoResult = WebPixelEventsSettingsSchema.merge(WebPixelFeatureToggleSchema).merge(WebPixelPostHogEcommerceSpecSchema).safeParse(payload);
  if (!dtoResult.success) {
    const message = Object.entries(dtoResult.error.flatten().fieldErrors)
      .map(([key, errors]) => {
        return `${key}`;
      })
      .join(', ');
    return json({ ok: false, message: `Invalid keys: ${message}` }, { status: 400 });
  }
  const response = await clientQueryCurrentAppInstallation();

  const { web_pixel_feature_toggle, posthog_ecommerce_spec, ...webPixelEventSettings } = dtoResult.data;

  await clientMetafieldsSet([
    {
      key: Constant.METAFIELD_KEY_WEB_PIXEL_FEATURE_TOGGLE,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: response.currentAppInstallation.id,
      type: 'boolean',
      value: web_pixel_feature_toggle.toString(),
    },
    {
      key: Constant.METAFIELD_KEY_WEB_PIXEL_EVENTS_SETTINGS,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: response.currentAppInstallation.id,
      value: JSON.stringify(webPixelEventSettings),
      type: 'json',
    },
    {
      key: Constant.METAFIELD_KEY_WEB_PIXEL_TRACKED_EVENTS,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: response.currentAppInstallation.id,
      value: JSON.stringify(Object.entries(webPixelEventSettings).filter(([key, value]) => value).map(([key, value]) => key)),
      type: 'json',
    },
    {
      key: Constant.METAFIELD_KEY_POSTHOG_ECOMMERCE_SPEC,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: response.currentAppInstallation.id,
      value: JSON.stringify(posthog_ecommerce_spec),
      type: 'json',
    },
  ]);

  const responseRecalculate = await clientRecalculateWebPixel();
  if (!responseRecalculate) {
    return json({ ok: true, message: 'Web pixel settings saved' }, { status: 200 });
  }
  if (responseRecalculate.status == 'error') {
    return json({ ok: false, message: responseRecalculate.message }, { status: 422 });
  }
  return json({ ok: true, message: `Web pixel ${responseRecalculate.status}` }, { status: 200 });
};

export function HydrateFallback() {
  return <LoadingSpinner />;
}
export default function WebPixelEvents() {
  const fetcher = useFetcher();
  const { currentAppInstallation, webPixel, shop } = useLoaderData<typeof clientLoader>();
  const webPixelActualSettings = (webPixel?.settings as WebPixelSettings | undefined) || null
  const trackedEvents = (() =>  {
    try {
      return JSON.parse(webPixelActualSettings?.tracked_events || '[]') as string[]
    } catch (error) {
      return [];
    }
  })();

  const metafieldTrackedEvents = currentAppInstallation.web_pixel_tracked_events?.jsonValue as string[] | null | undefined
  const mergedTrackedEvents = [...new Set([...(Array.isArray(metafieldTrackedEvents) ? metafieldTrackedEvents : []), ...trackedEvents])]
   
  const webPixelSettingsMetafieldValue = currentAppInstallation?.web_pixel_settings?.jsonValue as
    | undefined
    | null
    | WebPixelEventsSettings;

  const postHogEcommerceSpecMetafiledValue = currentAppInstallation.web_pixel_posthog_ecommerce_spec?.jsonValue == true;


  const webPixelSettingsInitialState = defaultWebPixelSettings.map<WebPixelSettingChoice>((entry) => {
    
    return {
      ...entry,
      value: webPixelSettingsMetafieldValue?.[entry.key] === true || (webPixelActualSettings as any)?.[entry.key] === true || mergedTrackedEvents.includes(entry.key),
    } as WebPixelSettingChoice;
  });

  const [webPixelSettings, setWebPixelSettings] = useState(webPixelSettingsInitialState);

  const handleWebPixelSettingChange = (key: string, value?: string | number | string[]) => {
    setWebPixelSettings(
      webPixelSettings.map<WebPixelSettingChoice>((entry) => {
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
        } as WebPixelSettingChoice;
      })
    );
  };

  const selectedWebPixelSettings = webPixelSettings.filter((entry) => entry.type === 'Checkbox' && entry.value);

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

  const [checkedEcommerceSpec, setCheckedEcommerceSpec] = useState(!!postHogEcommerceSpecMetafiledValue);
  const handleChangeEcommerceSpec = useCallback(
    (newChecked: boolean) => setCheckedEcommerceSpec(newChecked),
    [],
  );

  useEffect(() => {
    if (fetcher.state == 'loading' || fetcher.state == 'submitting') {
      return;
    }
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

  const webPixelFeatureToggleInitialState = currentAppInstallation.web_pixel_feature_toggle?.jsonValue == true;
  const [webPixelFeatureEnabled, setWebPixelFeatureEnabled] = useState(webPixelFeatureToggleInitialState);
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
        posthog_ecommerce_spec: checkedEcommerceSpec,
      },
      {
        method: 'POST',
        encType: 'application/json',
      }
    );
  };

  const dirty = useMemo(() => {
    const diff = detailedDiff(webPixelSettingsInitialState || {}, webPixelSettings);
    if (Object.values(diff).some((changeType: object) => Object.keys(changeType).length != 0)) {
      return true;
    }
    if (webPixelFeatureEnabled != webPixelFeatureToggleInitialState) {
      return true;
    };
    if (postHogEcommerceSpecMetafiledValue != checkedEcommerceSpec) {
      return true;
    }
    return false;
  }, [webPixelSettings, webPixelFeatureEnabled, webPixelFeatureToggleInitialState, webPixelSettingsInitialState, postHogEcommerceSpecMetafiledValue, checkedEcommerceSpec]);

  const allEventsDisabled = webPixelSettings.every((entry) => !entry.value);
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
                dirty={dirty}
                bannerTitle="The following requirements need to be meet to finalize the Web Pixel setup:"
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
                    trigger: allEventsDisabled,
                    badgeText: 'Action required',
                    badgeTone: 'critical',
                    badgeToneOnDirty: 'attention',
                    bannerMessage: 'Select at least 1 event from the list below.',
                  },
                ]}
              />
              <Divider />
              <InlineStack gap="200" align="space-between"  blockAlign="center" wrap={false}>
                <InlineStack gap="200" align="start"  blockAlign="center" wrap={false}>
                  <Checkbox
                    label="Toggle PostHog Ecommerce Spec"
                    checked={checkedEcommerceSpec}
                    onChange={handleChangeEcommerceSpec}
                  />
                  <InlineStack gap="200" align="start"  blockAlign="start" wrap={false}>
                    <Icon source={posthogSvg} />
                  </InlineStack>
                </InlineStack>
                <InlineStack gap="200" align="start"  blockAlign="start" wrap={false}>
                  <Link url={urlWithShopParam(`https://pixiehog.com/faqs/introduction`, shop)}>Learn more</Link>

                </InlineStack>
              </InlineStack>
              
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
                    settings={tabs[selectedTab].id === 'all' ? webPixelSettings : selectedWebPixelSettings}
                    onChange={handleWebPixelSettingChange}
                    featureEnabled={webPixelFeatureEnabled}
                    keyOverride={checkedEcommerceSpec ? posthogKeys : shopifyKeys}
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
