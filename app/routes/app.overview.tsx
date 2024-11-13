import { useCallback, useEffect, useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Layout, BlockStack, Card, TextField, Button,Text, Link, Select, Box } from '@shopify/polaris';
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

const apiHostOptions = [
  { label: "https://us.i.posthog.com", value:"https://us.i.posthog.com"},
  { label: "https://eu.i.posthog.com", value:"https://eu.i.posthog.com"},
  { label: "Custom API Host", value:"custom"}
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const currentAppInstallation = await queryCurrentAppInstallation(admin.graphql);

  return currentAppInstallation;
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
      type: 'json',
      value: dtoResultJsWebPosthogFeatureToggle.data.js_web_posthog_feature_toggle.toString(),
    },
    {
      key: Constant.METAFIELD_KEY_WEB_PIXEL_FEATURE_TOGGLE,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: currentAppInstallation.id,
      type: 'json',
      value: dtoResultWebPixelFeatureToggle.data.web_pixel_feature_toggle.toString(),
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
      return 'key saved successfully.';
    }
    return `key saved & web pixel ${responseRecalculate.status}.`;
  })();
  return json({ ok: true, message: message }, { status: 200 });
};

export default function Index() {
  const currentAppInstallation = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const navigate = useNavigate();
  let PosthogApiKeyInitialState = currentAppInstallation.posthog_api_key?.value || '';
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



  const dirty = isPosthogApiHostInitialStateCustom ? PosthogApiHostInitialState != posthogApiHostCustom : PosthogApiHostInitialState != posthogApiHost || PosthogApiKeyInitialState != PostHogApiKey || jsWebPosthogFeatureEnabledInitialState != jsWebPosthogFeatureEnabled || webPixelFeatureToggleInitialState != webPixelFeatureEnabled

  const submitSettings = () => {
    fetcher.submit(
      {
        posthog_api_key: PostHogApiKey,
        posthog_api_host: posthogApiHost == 'custom' ?  posthogApiHostCustom : posthogApiHost,
        js_web_posthog_feature_toggle: jsWebPosthogFeatureEnabled,
        web_pixel_feature_toggle: webPixelFeatureEnabled,
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
        secondaryActions={
          dirty && (
            <Button onClick={() => {
              setPostHogApiKey(PosthogApiKeyInitialState)
              setPosthogApiHost(PosthogApiHostInitialState == '' ? 'https://us.i.posthog.com' : PosthogApiHostInitialState)
              setWebPixelFeatureEnabled(webPixelFeatureToggleInitialState)
              setjsWebPosthogFeatureEnabled(jsWebPosthogFeatureEnabledInitialState)
            }}>Cancel</Button>
          )
        }
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
                      labelAction= {{content: 'Where is my API key ?', url:'https://google.com', target:'_blank'}}
                      inputMode='text'
                      value={PostHogApiKey}
                      onChange={handleApiKeyChange}
                      autoComplete="off"
                      placeholder="phc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    /> 
                  
                  <Select
                    label="API Host"
                    labelAction= {{content: 'What is this ?', url:'https://google.com', target:'_blank'}}
                    options={apiHostOptions}
                    onChange={handlePosthogApiHostChange}
                    value={posthogApiHost}
                    helpText= "We recommend using a custom API host for optimal data handling and compliance."
                  />
                  {posthogApiHost == "custom" && (
                    <TextField
                    label="Custom API Host"
                    labelAction= {{content: 'What is this , and how do I configure it ?', url:'https://google.com', target:'_blank'}}
                    inputMode='url'
                    type='url'
                    placeholder='https://example.com'
                    autoComplete='false'
                    onChange={handlePosthogApiHostCustomChange}
                    value={posthogApiHostCustom}
                  />
                  )}
                  
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
                        dirty= {false}
                        bannerTitle='The following requirements need to be meet to finalize the Web Pixel setup:'
                        bannerTone='warning'
                        customActions={[
                          {
                            trigger : !currentAppInstallation.posthog_api_key?.value,
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
                        dirty= {false}
                        bannerTitle='The following requirements need to be meet to finalize the Javascript Web setup:'
                        bannerTone='warning'
                        customActions={[
                          {
                            trigger : !currentAppInstallation.posthog_api_key?.value,
                            badgeText:"Action required",
                            badgeTone: "critical",
                            badgeToneOnDirty: "attention",
                            bannerMessage: "Setup Posthog project API key."
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
