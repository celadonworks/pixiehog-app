import { useCallback, useEffect, useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Layout, BlockStack, Card, TextField,Text, Link, Select, Box, Banner } from '@shopify/polaris';
import { authenticate } from '../shopify.server';
import { json, useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import { queryCurrentAppInstallation } from 'app/common.server/queries/current-app-installation';
import { Constant } from '../../common/constant/index';
import { metafieldsSet } from '../common.server/mutations/metafields-set';
import type { PosthogApiKey } from '../../common/dto/posthog-api-key.dto';
import { PosthogApiKeySchema } from '../../common/dto/posthog-api-key.dto';
import { WebPixelFeatureToggleSchema } from '../../common/dto/web-pixel-feature-toggle.dto';
import type { WebPixelFeatureToggle } from '../../common/dto/web-pixel-feature-toggle.dto';
import type { JsWebPosthogFeatureToggle } from '../../common/dto/js-web-feature-toggle.dto';
import { JsWebPosthogFeatureToggleSchema } from '../../common/dto/js-web-feature-toggle.dto';
import { recalculateWebPixel } from '../common.server/procedures/recalculate-web-pixel';
import { metafieldsDelete } from '../common.server/mutations/metafields-delete';
import FeatureStatusManager from 'common/components/FeatureStatusManager';
import type { WebPixelEventsSettings } from 'common/dto/web-pixel-events-settings.dto';
import type { WebPixelSettingChoice } from './app.web-pixel-settings/interface/setting-row.interface';
import { defaultWebPixelSettings } from './app.web-pixel-settings/default-web-pixel-settings';
import type { PosthogApiHost} from 'common/dto/posthog-api-host.dto';
import { PosthogApiHostSchema } from 'common/dto/posthog-api-host.dto';
import { appEmbedStatus } from '../common.server/procedures/app-embed-status';
import { APP_ENV } from '../../common/secret';
import { urlWithShopParam } from '../../common/utils';
import type { DataCollectionStrategy} from 'common/dto/data-collection-stratergy';
import { DataCollectionStrategySchema} from 'common/dto/data-collection-stratergy';

const apiHostOptions = [
  { label: "Posthog US Cloud", value:"https://us.i.posthog.com"},
  { label: "Posthog EU Cloud", value:"https://eu.i.posthog.com"},
  { label: "Reverse Proxy", value:"custom"}
]


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session: { shop } } = await authenticate.admin(request);
  const currentAppInstallation = await queryCurrentAppInstallation(admin.graphql);

  const currentPosthogJsWebAppEmbedStatus = await appEmbedStatus(
    admin.graphql,
    APP_ENV.APP_POSTHOG_JS_WEB_THEME_APP_UUID
  );

  const payload = {
    currentAppInstallation: currentAppInstallation,
    js_web_posthog_app_embed_status: currentPosthogJsWebAppEmbedStatus,
    js_web_posthog_app_embed_uuid: APP_ENV.APP_POSTHOG_JS_WEB_THEME_APP_UUID,
    shop,
    js_web_posthog_app_embed_handle: Constant.APP_POSTHOG_JS_WEB_THEME_APP_HANDLE,
  }
  return payload;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const payload = await request.json()

  const { admin } = await authenticate.admin(request);
  const currentAppInstallation = await queryCurrentAppInstallation(admin.graphql);
  const appId = currentAppInstallation.id;
  const dtoResultPosthogApiKey = PosthogApiKeySchema.safeParse({ posthog_api_key: payload.posthog_api_key } as PosthogApiKey);
  if (!dtoResultPosthogApiKey.success) {
    const message = dtoResultPosthogApiKey.error.flatten().fieldErrors.posthog_api_key?.join(' - ');
    return json({ ok: false, message: message }, { status: 400 });
  }

  const dtoResultPosthogApiHost = PosthogApiHostSchema.safeParse({posthog_api_host: payload.posthog_api_host} as PosthogApiHost)
  if(!dtoResultPosthogApiHost.success) {
    const message = dtoResultPosthogApiHost.error.flatten().fieldErrors.posthog_api_host?.join(' - ');
    return json({ ok: false, message: message }, { status: 400 });
  }

  const dtoResultDataCollectionStrategy = DataCollectionStrategySchema.safeParse({data_collection_strategy: payload.data_collection_strategy} as DataCollectionStrategy)
  if(!dtoResultDataCollectionStrategy.success) {
    const message = dtoResultDataCollectionStrategy.error.flatten().fieldErrors.data_collection_strategy?.join(' - ');
    return json({ ok: false, message: message }, { status: 400 });
  }
  
  const dtoResultWebPixelFeatureToggle = WebPixelFeatureToggleSchema.safeParse({ web_pixel_feature_toggle: payload.web_pixel_feature_toggle } as WebPixelFeatureToggle);
  if (!dtoResultWebPixelFeatureToggle.success) {
    const message = dtoResultWebPixelFeatureToggle.error.flatten().fieldErrors.web_pixel_feature_toggle?.join(' - ');
    return json({ ok: false, message: message }, { status: 400 });
  }

  const dtoResultJsWebPosthogFeatureToggle = JsWebPosthogFeatureToggleSchema.safeParse({ js_web_posthog_feature_toggle: payload.js_web_posthog_feature_toggle } as JsWebPosthogFeatureToggle);
  if (!dtoResultJsWebPosthogFeatureToggle.success) {
    const message = dtoResultJsWebPosthogFeatureToggle.error.flatten().fieldErrors.js_web_posthog_feature_toggle?.join(' - ');
    return json({ ok: false, message: message }, { status: 400 });
  }
  const metafieldsSetData = [
    {
      key: Constant.METAFIELD_KEY_JS_WEB_POSTHOG_FEATURE_TOGGLE,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: currentAppInstallation.id,
      type: 'boolean',
      value: dtoResultJsWebPosthogFeatureToggle.data.js_web_posthog_feature_toggle.toString(),
    },
    {
      key: Constant.METAFIELD_KEY_WEB_PIXEL_FEATURE_TOGGLE,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: currentAppInstallation.id,
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
    await metafieldsDelete(admin.graphql, [
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
    await metafieldsDelete(admin.graphql, [
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


  await metafieldsSet(admin.graphql, metafieldsSetData);
  

  const responseRecalculate = await recalculateWebPixel(admin.graphql);
  const message = (() => {
    if (!responseRecalculate?.status) {
      return 'saved successfully.';
    }
    return `saved & web pixel ${responseRecalculate.status}.`;
  })();
  return json({ ok: true, message: message }, { status: 200 });
};

export default function Index() {
  const {
    currentAppInstallation,
    js_web_posthog_app_embed_status: jsWebPosthogAppEmbedStatus,
    js_web_posthog_app_embed_uuid: jsWebPosthogAppEmbedUuid,
    js_web_posthog_app_embed_handle: jsWebPosthogAppEmbedHandle,
    shop,
  } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const navigate = useNavigate();
  const PosthogApiKeyInitialState = currentAppInstallation.posthog_api_key?.value || '';
  const [PostHogApiKey, setPostHogApiKey] = useState(PosthogApiKeyInitialState);
  const handleApiKeyChange = useCallback((newValue: string) => setPostHogApiKey(newValue), []);

  const PosthogApiHostInitialState = currentAppInstallation.posthog_api_host?.value || '';
  const isPosthogApiHostInitialStateCustom = PosthogApiHostInitialState == '' ? false : !apiHostOptions.some((option) => option.value == PosthogApiHostInitialState)
  const [posthogApiHost, setPosthogApiHost] = useState(isPosthogApiHostInitialStateCustom ? 'custom' : PosthogApiHostInitialState == '' ? 'https://us.i.posthog.com' : PosthogApiHostInitialState);
  // api host
  const handlePosthogApiHostChange = useCallback(
    (value: string) => setPosthogApiHost(value),
    [],
  );
  const [posthogApiHostCustom, setPosthogApiHostCustom] = useState(isPosthogApiHostInitialStateCustom ? PosthogApiHostInitialState : '' );
  const handlePosthogApiHostCustomChange = useCallback(
    (value: string) => setPosthogApiHostCustom(value),
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
  }, [fetcher, fetcher.data, fetcher.state, navigate]);


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



  const dirty = isPosthogApiHostInitialStateCustom ? PosthogApiHostInitialState != posthogApiHostCustom : PosthogApiHostInitialState != posthogApiHost || PosthogApiKeyInitialState != PostHogApiKey || jsWebPosthogFeatureEnabledInitialState != jsWebPosthogFeatureEnabled || webPixelFeatureToggleInitialState != webPixelFeatureEnabled || DataCollectionStrategyInitialState != dataCollectionStrategy

  const submitSettings = () => {
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
                    <Text 
                      variant='headingLg'
                      as='h3'
                    >
                    Start here
                    </Text>
                    <Text 
                      variant='bodyLg'
                      as='p'>This is all you need to be fully integrated with Posthog</Text>
                    <TextField
                      label="PostHog Project API Key"
                      labelAction= {{content: 'Where is my API key ?', url: urlWithShopParam(`https://pxhog.com/docs/getting-started#3-project-api-key-setup`, shop), target:'_blank'}}
                      inputMode='text'
                      value={PostHogApiKey}
                      onChange={handleApiKeyChange}
                      autoComplete="off"
                      placeholder="phc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    /> 
                  
                  <Select
                    label="API Host"
                    labelAction= {{content: 'What is this ?', url:urlWithShopParam(`https://pxhog.com/faqs/what-is-posthog-api-host`, shop), target:'_blank'}}
                    options={apiHostOptions}
                    onChange={handlePosthogApiHostChange}
                    value={posthogApiHost}
                    helpText= "We recommend using a Reverse Proxy for optimal data collection."
                  />
                  {posthogApiHost == "custom" && (
                    <TextField
                    label="Custom Reverse Proxy"
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
                      <Banner tone="warning" >This option <strong>bypasses customer privacy preferences</strong>. <Link url={urlWithShopParam(`https://pxhog.com/docs/data-collection-strategies#3-identified`, shop)} rel="noreferrer" target='_blank'>Read more.</Link></Banner>
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
