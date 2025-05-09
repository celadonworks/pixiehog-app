import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Page,
  Layout,
  BlockStack,
  Card,
  TextField,
  Text,
  Link,
  Select,
  Box,
  Banner,
  type SelectOption,
  InlineStack,
  Button,
} from '@shopify/polaris';
import type { ClientActionFunctionArgs, ClientLoaderFunctionArgs} from '@remix-run/react';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { Constant } from '../../common/constant/index';
import { metafieldsSet as clientMetafieldsSet } from '../common.client/mutations/metafields-set';
import { metafieldsDelete as clientMetafieldsDelete } from '../common.client/mutations/metafields-delete';
import type { PosthogApiKey } from '../../common/dto/posthog-api-key.dto';
import { PosthogApiKeySchema, posthogApiKeyPrimitive } from '../../common/dto/posthog-api-key.dto';
import { WebPixelFeatureToggleSchema } from '../../common/dto/web-pixel-feature-toggle.dto';
import type { WebPixelFeatureToggle } from '../../common/dto/web-pixel-feature-toggle.dto';
import type { JsWebPosthogFeatureToggle } from '../../common/dto/js-web-feature-toggle.dto';
import { JsWebPosthogFeatureToggleSchema } from '../../common/dto/js-web-feature-toggle.dto';
import { recalculateWebPixel as clientRecalculateWebPixel } from '../common.client/procedures/recalculate-web-pixel';
import FeatureStatusManager from 'common/components/FeatureStatusManager';
import type { WebPixelEventsSettings } from 'common/dto/web-pixel-events-settings.dto';
import type { WebPixelSettingChoice } from './app.web-pixel-settings/interface/setting-row.interface';
import { defaultWebPixelSettings } from './app.web-pixel-settings/default-web-pixel-settings';
import type { PosthogApiHost} from 'common/dto/posthog-api-host.dto';
import { PosthogApiHostSchema, posthogApiHostPrimitive } from 'common/dto/posthog-api-host.dto';
import { urlWithShopParam } from '../../common/utils';
import type { DataCollectionStrategy} from 'common/dto/data-collection-stratergy';
import { DataCollectionStrategySchema} from 'common/dto/data-collection-stratergy';
import { queryCurrentAppInstallation as clientQueryCurrentAppInstallation } from '../common.client/queries/current-app-installation';
import { appEmbedStatus as clientAppEmbedStatus  } from '../common.client/procedures/app-embed-status'; 
import LoadingSpinner from '../../common/components/LoadingSpinner';
type StrictOptions = Extract<SelectOption, {label: string}>

const apiHostOptions: StrictOptions[] = [
  { label: 'Select API Host', value: '', disabled: true},
  { label: "Posthog US Cloud", value:"https://us.i.posthog.com"},
  { label: "Posthog EU Cloud", value:"https://eu.i.posthog.com"},
  { label: "Reverse Proxy", value:"custom"},
]


export const clientLoader = async ({
  request,
}: ClientLoaderFunctionArgs) => {
  // call the server loader
  //const serverData = await serverLoader();
  const response = await clientQueryCurrentAppInstallation();
  const currentPosthogJsWebAppEmbedStatus = await clientAppEmbedStatus(window.ENV.APP_POSTHOG_JS_WEB_THEME_APP_UUID)
  const payload = {
    currentAppInstallation: response.currentAppInstallation,
    js_web_posthog_app_embed_status: currentPosthogJsWebAppEmbedStatus,
    js_web_posthog_app_embed_uuid: window.ENV.APP_POSTHOG_JS_WEB_THEME_APP_UUID,
    shop: shopify.config.shop,
    js_web_posthog_app_embed_handle: Constant.APP_POSTHOG_JS_WEB_THEME_APP_HANDLE,
  }

  return payload;
};


export const clientAction = async ({
  request,
  params,
}: ClientActionFunctionArgs) => {

  const payload = await request.json()
  const response = await clientQueryCurrentAppInstallation();
  const appId = response.currentAppInstallation.id;
  const dtoResultPosthogApiKey = PosthogApiKeySchema.safeParse({ posthog_api_key: payload.posthog_api_key } as PosthogApiKey);
  if (!dtoResultPosthogApiKey.success) {
    const message = dtoResultPosthogApiKey.error.flatten().fieldErrors.posthog_api_key?.join(' - ');
    return { ok: false, message: message };
  }
  const dtoResultPosthogApiHost = PosthogApiHostSchema.safeParse({posthog_api_host: payload.posthog_api_host} as PosthogApiHost)
  if(!dtoResultPosthogApiHost.success) {
    const message = dtoResultPosthogApiHost.error.flatten().fieldErrors.posthog_api_host?.join(' - ');
    return { ok: false, message: message };
  }

  const dtoResultDataCollectionStrategy = DataCollectionStrategySchema.safeParse({data_collection_strategy: payload.data_collection_strategy} as DataCollectionStrategy)
  if(!dtoResultDataCollectionStrategy.success) {
    const message = dtoResultDataCollectionStrategy.error.flatten().fieldErrors.data_collection_strategy?.join(' - ');
    return { ok: false, message: message };
  }
  
  const dtoResultWebPixelFeatureToggle = WebPixelFeatureToggleSchema.safeParse({ web_pixel_feature_toggle: payload.web_pixel_feature_toggle } as WebPixelFeatureToggle);
  if (!dtoResultWebPixelFeatureToggle.success) {
    const message = dtoResultWebPixelFeatureToggle.error.flatten().fieldErrors.web_pixel_feature_toggle?.join(' - ');
    return { ok: false, message: message };
  }

  const dtoResultJsWebPosthogFeatureToggle = JsWebPosthogFeatureToggleSchema.safeParse({ js_web_posthog_feature_toggle: payload.js_web_posthog_feature_toggle } as JsWebPosthogFeatureToggle);
  if (!dtoResultJsWebPosthogFeatureToggle.success) {
    const message = dtoResultJsWebPosthogFeatureToggle.error.flatten().fieldErrors.js_web_posthog_feature_toggle?.join(' - ');
    return { ok: false, message: message };
  }
  const metafieldsSetData = [
    {
      key: Constant.METAFIELD_KEY_JS_WEB_POSTHOG_FEATURE_TOGGLE,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: response.currentAppInstallation.id,
      type: 'boolean',
      value: dtoResultJsWebPosthogFeatureToggle.data.js_web_posthog_feature_toggle.toString(),
    },
    {
      key: Constant.METAFIELD_KEY_WEB_PIXEL_FEATURE_TOGGLE,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: response.currentAppInstallation.id,
      type: 'boolean',
      value: dtoResultWebPixelFeatureToggle.data.web_pixel_feature_toggle.toString(),
    },
    {
      key: Constant.METAFIELD_KEY_DATA_COLLECTION_STRATEGY,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: appId,
      type: 'single_line_text_field',
      value: dtoResultDataCollectionStrategy.data.data_collection_strategy.toString(),
    }
  ]

  // posthog api key
  if (dtoResultPosthogApiKey.data.posthog_api_key == '') {
    await clientMetafieldsDelete([
      {
        key: Constant.METAFIELD_KEY_POSTHOG_API_KEY,
        namespace: Constant.METAFIELD_NAMESPACE,
        ownerId: appId,
      },
    ]);
  } else {
    metafieldsSetData.push({
      key: Constant.METAFIELD_KEY_POSTHOG_API_KEY,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: appId,
      type: 'single_line_text_field',
      value: dtoResultPosthogApiKey.data.posthog_api_key,
    })
  }

  // posthog api host
  if (dtoResultPosthogApiHost.data.posthog_api_host == '') {
    await clientMetafieldsDelete([
      {
        key: Constant.METAFIELD_KEY_POSTHOG_API_HOST,
        namespace: Constant.METAFIELD_NAMESPACE,
        ownerId: appId,
      },
    ]);
  }else{
    metafieldsSetData.push({
      key: Constant.METAFIELD_KEY_POSTHOG_API_HOST,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: appId,
      type: 'single_line_text_field',
      value: dtoResultPosthogApiHost.data.posthog_api_host?.toString(),
    })
  }
  await clientMetafieldsSet(metafieldsSetData);
  

  const responseRecalculate = await clientRecalculateWebPixel();
  const message = (() => {
    if (responseRecalculate?.status == 'error') {
      return responseRecalculate.message;
    }
    if (!responseRecalculate?.status) {
      return 'saved successfully.';
    }
    return `saved & web pixel ${responseRecalculate.status}.`;
  })();
  return { ok: true, message: message }
};

export function HydrateFallback() {
  return <LoadingSpinner />
}

export default function Index() {
  const {
    currentAppInstallation,
    js_web_posthog_app_embed_status: jsWebPosthogAppEmbedStatus,
    js_web_posthog_app_embed_uuid: jsWebPosthogAppEmbedUuid,
    js_web_posthog_app_embed_handle: jsWebPosthogAppEmbedHandle,
    shop,
  } = useLoaderData<typeof clientLoader>();

  const fetcher = useFetcher();
  const PosthogApiKeyInitialState = currentAppInstallation.posthog_api_key?.value || '';
  const [PostHogApiKey, setPostHogApiKey] = useState(PosthogApiKeyInitialState);
  const handleApiKeyChange = useCallback((newValue: string) => setPostHogApiKey(newValue), []);

  const PosthogApiHostInitialState = currentAppInstallation.posthog_api_host?.value || '';
  const isPosthogApiHostInitialStateCustom = PosthogApiHostInitialState == '' ? false : !apiHostOptions.some((option) => option.value == PosthogApiHostInitialState)
  const [posthogApiHost, setPosthogApiHost] = useState(isPosthogApiHostInitialStateCustom ? 'custom' : PosthogApiHostInitialState == '' ? '' : PosthogApiHostInitialState);
  const [posthogApiKeyError, setPosthogApiKeyError] = useState<string>('');
  const [posthogApiHostError, setPosthogApiHostError] = useState<string>('');
  const [posthogCustomApiHostError, setCustomPosthogApiHostError] = useState<string>('');
  // api host
  const handlePosthogApiHostChange = useCallback(
    (value: string) => {
      setPosthogApiHostError('')
      setPosthogApiHost(value)
    },
    [],
  );
  const [posthogApiHostCustom, setPosthogApiHostCustom] = useState(isPosthogApiHostInitialStateCustom ? PosthogApiHostInitialState : '' );
  const handlePosthogApiHostCustomChange = useCallback(
    (value: string) => {
      setCustomPosthogApiHostError('')
      setPosthogApiHostCustom(value)
    },
    [],
  );

  //data collection strategry
  type ValueOf<T> = T[keyof T];
  const DataCollectionStrategyInitialState: ValueOf<DataCollectionStrategy> = currentAppInstallation.data_collection_strategy?.value as ValueOf<DataCollectionStrategy> || 'anonymized';
  const [dataCollectionStrategy, setDataCollectionStrategy] = useState(DataCollectionStrategyInitialState);
  const handleDataCollectionStrategyChange = useCallback(
    (value: ValueOf<DataCollectionStrategy>) => setDataCollectionStrategy(value),
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

    if (data.ok) {
      window.shopify.toast.show(data.message, {
        isError: false,
        duration: 2000,
      });
      return;
    }
    window.shopify.toast.show(data.message, {
      isError: true,
      duration: 2000,
    });
  }, [fetcher.data]);


  // web pixels
  
  const webPixelSettingsMetafieldValue = currentAppInstallation?.web_pixel_settings?.jsonValue as
  | undefined
  | null
  | WebPixelEventsSettings;

  const webPixelSettingsInitialState = defaultWebPixelSettings.map<WebPixelSettingChoice>((entry) => {
    if(webPixelSettingsMetafieldValue?.[entry.key]){
      return {
        ...entry,
        value: webPixelSettingsMetafieldValue?.[entry.key] === true,
      } as WebPixelSettingChoice
    }
    return entry
  });
  const webPixelFeatureToggleInitialState = currentAppInstallation.web_pixel_feature_toggle?.jsonValue == true
  const [webPixelFeatureEnabled, setWebPixelFeatureEnabled] = useState(
    webPixelFeatureToggleInitialState
  );
  const handleWebPixelFeatureEnabledToggle = useCallback(() => setWebPixelFeatureEnabled((value) => !value), []);
  const allEventsDisabled = webPixelSettingsInitialState.every((entry) => !entry.value)

  // JS web events

  const jsWebPosthogFeatureEnabledInitialState = currentAppInstallation.js_web_posthog_feature_toggle?.jsonValue == true
  const [jsWebPosthogFeatureEnabled, setjsWebPosthogFeatureEnabled] = useState(
    jsWebPosthogFeatureEnabledInitialState
  );
  const handleJsWebPosthogFeatureEnabledToggle = useCallback(() => setjsWebPosthogFeatureEnabled((value) => !value), []);


  const dirty = useMemo(() => {
    if (PosthogApiKeyInitialState != PostHogApiKey) {
      return true;
    }
    if (jsWebPosthogFeatureEnabledInitialState != jsWebPosthogFeatureEnabled) {
      return true
    }
    if (webPixelFeatureToggleInitialState != webPixelFeatureEnabled) {
      return true
    }
    if (DataCollectionStrategyInitialState != dataCollectionStrategy) {
      return true
    }
    if (posthogApiHost == "custom" && PosthogApiHostInitialState != posthogApiHostCustom) {
      return true
    }
    if (posthogApiHost != "custom" && PosthogApiHostInitialState != posthogApiHost) {
      return true
    }
    return false
  }, [
    PosthogApiKeyInitialState,
    PostHogApiKey,
    jsWebPosthogFeatureEnabledInitialState,
    jsWebPosthogFeatureEnabled,
    webPixelFeatureToggleInitialState,
    webPixelFeatureEnabled,
    DataCollectionStrategyInitialState,
    dataCollectionStrategy,
    posthogApiHost,
    PosthogApiHostInitialState,
    posthogApiHostCustom
  ])


  const submitSettings = () => {
    let errors: string[] = [];

    const parsedApiKey = posthogApiKeyPrimitive.safeParse(PostHogApiKey)
    if (!parsedApiKey.success) {
      const message = parsedApiKey.error.flatten().formErrors.join(' - ')
      setPosthogApiKeyError(message)
      errors.push(message);
    }

    if (posthogApiHost == '') {
      const errorMessage = 'Select API host'
      setPosthogApiHostError(errorMessage)
      errors.push(errorMessage)
    }

    if (posthogApiHost == 'custom') {
      const parsedUrl = posthogApiHostPrimitive.safeParse(posthogApiHostCustom)
      if (!parsedUrl.success) {
        const message = parsedUrl.error.flatten().formErrors.join(' - ') || 'invalid url';
        setCustomPosthogApiHostError(message)
        errors.push(message)
      }
    }

    if (errors.length > 0) {
      if (errors.length == 1) {
        window.shopify.toast.show(errors[0], {
          isError: true,
          duration: 2000,
        });
      } else {
        window.shopify.toast.show('invalid settings', {
          isError: true,
          duration: 2000,
        });
      }
      return
    }

    fetcher.submit(
      {
        posthog_api_key: PostHogApiKey,
        posthog_api_host: posthogApiHost == 'custom' ?  posthogApiHostCustom : posthogApiHost,
        js_web_posthog_feature_toggle: jsWebPosthogFeatureEnabled,
        web_pixel_feature_toggle: webPixelFeatureEnabled,
        data_collection_strategy: dataCollectionStrategy,

      },
      {
        method: 'POST',
        encType: "application/json"
      }
    );
  };

  const posthogDashboardUrl = useMemo(() => {
    if (posthogApiHost == 'https://us.i.posthog.com') {
      return 'https://us.posthog.com';
    }
    
    if (posthogApiHost == 'https://eu.i.posthog.com') {
      return 'https://eu.posthog.com';
    }

    return 'https://app.posthog.com';
  }, [
    posthogApiHost
  ]);


  return (
      <Page
        title="Account setup"
        primaryAction={{
          onAction: submitSettings,
          content: 'Save',
        loading: fetcher.state == 'loading',
        disabled: fetcher.state != 'idle' || !dirty,
        }}
      >
        <BlockStack gap="500">
          <Layout>
            <Layout.Section>
              <BlockStack gap="500">
                <Card>
                  <BlockStack gap="500">
                  <InlineStack  align='space-between'>
                    <Text 
                      variant='headingLg'
                      as='h3'
                    >
                    Start here
                    </Text>
                    <Button variant='primary' url={posthogDashboardUrl} target='_blank'>My Posthog Dashboard</Button>
                  </InlineStack>
                    <Text 
                      variant='bodyLg'
                      as='p'>This is all you need to be fully integrated with Posthog</Text>
                    <TextField
                      label="PostHog Project API Key"
                      error={posthogApiKeyError}
                      labelAction= {{content: 'Where is my API key ?', url: urlWithShopParam(`https://pxhog.com/docs/getting-started#3-project-api-key-setup`, shop), target:'_blank'}}
                      inputMode='text'
                      value={PostHogApiKey}
                      onChange={handleApiKeyChange}
                      autoComplete="off"
                      placeholder="phc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    /> 
                  
                  <Select
                    label="API Host"
                    error={posthogApiHostError}
                    labelAction= {{content: 'What is this ?', url:urlWithShopParam(`https://pxhog.com/faqs/what-is-posthog-api-host`, shop), target:'_blank'}}
                    options={apiHostOptions}
                    onChange={handlePosthogApiHostChange}
                    value={posthogApiHost}
                    helpText= "We recommend using a Reverse Proxy for optimal data collection."
                  />
                  {posthogApiHost == "custom" && (
                    <TextField
                    label="Custom Reverse Proxy"
                    error={posthogCustomApiHostError}
                    labelAction= {{content: 'What is this , and how do I configure it ?', url:urlWithShopParam(`https://pxhog.com/faqs/what-is-custom-reverse-proxy`, shop), target:'_blank'}}
                    inputMode='url'
                    type='url'
                    placeholder='https://example.com'
                    autoComplete='false'
                    onChange={handlePosthogApiHostCustomChange}
                    value={posthogApiHostCustom}
                  />
                  )}

                  <Select
                    label="Data Collection Strategy"
                    labelAction= {{content: 'What is this ?', url:urlWithShopParam(`https://pxhog.com/docs/data-collection-strategies`, shop), target:'_blank'}}
                    options={[
                      { label: "Anonymized", value:"anonymized"},
                      { label: "Identified By Consent", value:"non-anonymized-by-consent"},
                      { label: "Identified", value:"non-anonymized"},
                    ]}
                    onChange={handleDataCollectionStrategyChange}
                    value={dataCollectionStrategy}
                    helpText= {<p>We recommend using <strong>Anonymized</strong> or <strong>Identified By Consent</strong> data collection strategy to help with GDPR compliance.</p>}
                  />
                  {
                    dataCollectionStrategy === 'non-anonymized' && 
                    (
                      <Banner tone="warning" >This option <strong>bypasses customer privacy preferences</strong>. <Link url={urlWithShopParam(`https://pxhog.com/docs/data-collection-strategies#3-identified`, shop)} target='_blank'>Read more.</Link></Banner>
                    )
                  }
                  
                  </BlockStack>
                </Card>
                {PosthogApiKeyInitialState !="" && PosthogApiKeyInitialState && 
                (
                  <Card>
                    <BlockStack gap="500">
                    <Text as='h3' variant='headingMd'>Web Pixels Events</Text>
                      <FeatureStatusManager
                        featureEnabled={webPixelFeatureEnabled}
                        handleFeatureEnabledToggle={handleWebPixelFeatureEnabledToggle}
                        dirty= {webPixelFeatureToggleInitialState != webPixelFeatureEnabled || !!PostHogApiKey != !!PosthogApiKeyInitialState}
                        bannerTitle='The following requirements need to be meet to finalize the Web Pixel setup:'
                        bannerTone='warning'
                        customActions={[
                          {
                            trigger : !PostHogApiKey,
                            badgeText:"Action required",
                            badgeTone: "critical",
                            badgeToneOnDirty: "attention",
                            bannerMessage: "Setup Posthog project API key."
                          },
                          {
                            trigger : !posthogApiHost,
                            badgeText:"Action required",
                            badgeTone: "critical",
                            badgeToneOnDirty: "attention",
                            bannerMessage: "Setup Posthog API Host."
                          },
                          {
                            trigger : allEventsDisabled,
                            badgeText:"Action required",
                            badgeTone: "critical",
                            badgeToneOnDirty: "attention",
                            bannerMessage: <div>Select at least 1 event from the list below. <Link url="/app/web-pixel-settings"> Here </Link></div>
                          }
                      ]}
                      />
                      <Link url='/app/web-pixel-settings'>Configure Web Pixel Settings</Link>
                    </BlockStack>
                  </Card>
                )}
                {PosthogApiKeyInitialState !="" && PosthogApiKeyInitialState && 
                (
                  <Card>
                    <BlockStack gap="500">
                      <Text as='h3' variant='headingMd'>Javascript Web Config</Text>
                      <FeatureStatusManager
                        featureEnabled={jsWebPosthogFeatureEnabled}
                        handleFeatureEnabledToggle={handleJsWebPosthogFeatureEnabledToggle}
                        dirty= {jsWebPosthogFeatureEnabledInitialState != jsWebPosthogFeatureEnabled || !!PostHogApiKey != !!PosthogApiKeyInitialState}
                        bannerTitle='The following requirements need to be meet to finalize the Javascript Web setup:'
                        bannerTone='warning'
                        customActions={[
                          {
                            trigger : !PostHogApiKey,
                            badgeText:"Action required",
                            badgeTone: "critical",
                            badgeToneOnDirty: "attention",
                            bannerMessage: "Setup Posthog project API key."
                          },
                          {
                            trigger : !posthogApiHost,
                            badgeText:"Action required",
                            badgeTone: "critical",
                            badgeToneOnDirty: "attention",
                            bannerMessage: "Setup Posthog API Host."
                          },
                          {
                            trigger: !jsWebPosthogAppEmbedStatus,
                            badgeText: 'Action required',
                            badgeTone: 'critical',
                            badgeToneOnDirty: 'attention',
                            bannerMessage: (
                              <div>
                                Toggle Posthog JS web app embed on. <Link target='_top' url={`https://${shop}/admin/themes/current/editor?context=apps&activateAppId=${jsWebPosthogAppEmbedUuid}/${jsWebPosthogAppEmbedHandle}`}>Click Here</Link>. ensure changes are saved.
                              </div>
                            ),
                          },
                        ]}
                      />
                      <Link url='/app/js-web-posthog-settings'>Configure JS Web Posthog Settings</Link>
                    </BlockStack>
                  </Card>
                )}
              </BlockStack>
            </Layout.Section>
          </Layout>
        </BlockStack>
        <Box paddingBlockEnd={'800'}></Box>
      </Page>
  );
}
