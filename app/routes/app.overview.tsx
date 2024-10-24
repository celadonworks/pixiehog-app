import { useCallback, useEffect, useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Layout, BlockStack, Card, TextField, Button,Text, Link } from '@shopify/polaris';
import { authenticate } from '../shopify.server';
import { json, useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import { useForm } from '@shopify/react-form';
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

  if (dtoResultPosthogApiKey.data.posthog_api_key == '') {
    await metafieldsDelete(admin.graphql, [
      {
        key: Constant.METAFIELD_KEY_POSTHOG_API_KEY,
        namespace: Constant.METAFIELD_NAMESPACE,
        ownerId: appId,
      },
    ]);
    await metafieldsSet(admin.graphql, [
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
    ]);
  } else {
    await metafieldsSet(admin.graphql, [
      {
        key: Constant.METAFIELD_KEY_POSTHOG_API_KEY,
        namespace: Constant.METAFIELD_NAMESPACE,
        ownerId: appId,
        type: 'single_line_text_field',
        value: dtoResultPosthogApiKey.data.posthog_api_key,
      },
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
    ]);
  }

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
  let PostHogApiKeyInitialState = currentAppInstallation.posthog_api_key?.value || '';
  const [PostHogApiKey, setPostHogApiKey] = useState(PostHogApiKeyInitialState);
  const handleApiKeyChange = useCallback((newValue: string) => setPostHogApiKey(newValue), []);

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
      }
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



  const dirty = PostHogApiKeyInitialState != PostHogApiKey || jsWebPosthogFeatureEnabledInitialState != jsWebPosthogFeatureEnabled || webPixelFeatureToggleInitialState != webPixelFeatureEnabled

  const submitSettings = () => {
    fetcher.submit(
      {
        posthog_api_key: PostHogApiKey,
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
        title="Overview"
        primaryAction={{
          onAction: submitSettings,
          content: 'Save',
        loading: fetcher.state == 'loading',
        disabled: fetcher.state != 'idle' || !dirty,
        }}
        secondaryActions={
          PostHogApiKeyInitialState !== PostHogApiKey && (
            <Button onClick={() => setPostHogApiKey(PostHogApiKeyInitialState)}>Cancel</Button>
          )
        }
      >
        <BlockStack gap="500">
          <Layout>
            <Layout.Section>
              <BlockStack gap="500">
                <Card>
                  <BlockStack gap="500">
                    <TextField
                      label="Your PostHog API Key"
                      value={PostHogApiKey}
                      onChange={handleApiKeyChange}
                      autoComplete="off"
                      placeholder="phc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    /> 
                  </BlockStack>
                </Card>
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
                          badgeTone: "attention",
                          badgeToneOnDirty: "critical",
                          bannerMessage: "Setup Posthog project API key."
                        },
                        {
                          trigger : allEventsDisabled,
                          badgeText:"Action required",
                          badgeTone: "attention",
                          badgeToneOnDirty: "critical",
                          bannerMessage: <div>Select at least 1 event from the list below. <Link url="/app/web-pixel-settings"> Here </Link></div>
                        }
                    ]}
                    />
                  </BlockStack>
                </Card>
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
                          badgeTone: "attention",
                          badgeToneOnDirty: "critical",
                          bannerMessage: "Setup Posthog project API key."
                        },
                      ]}
                    />
                  </BlockStack>
                </Card>
              </BlockStack>
            </Layout.Section>
          </Layout>
        </BlockStack>
      </Page>
  );
}
