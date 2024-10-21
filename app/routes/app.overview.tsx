import { useCallback, useEffect, useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Layout, BlockStack, Card, TextField, Button } from '@shopify/polaris';
import { authenticate } from '../shopify.server';
import { json, useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import { useForm } from '@shopify/react-form';
import { queryCurrentAppInstallation } from 'app/common.server/queries/current-app-installation';
import { Constant } from '../../common/constant/index';
import { metafieldsSet } from '../common.server/mutations/metafields-set';
import type { PosthogApiKey } from '../../common/dto/posthog-api-key.dto';
import { PosthogApiKeySchema } from '../../common/dto/posthog-api-key.dto';
import { recalculateWebPixel } from '../common.server/procedures/recalculate-web-pixel';
import { metafieldsDelete } from '../common.server/mutations/metafields-delete';
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const currentAppInstallation = await queryCurrentAppInstallation(admin.graphql);

  return currentAppInstallation;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const currentAppInstallation = await queryCurrentAppInstallation(admin.graphql);
  const appId = currentAppInstallation.id;
  const formData: FormData = await request.formData();
  const postHogApiKey = formData.get('posthog_api_key')?.toString();
  const dtoResult = PosthogApiKeySchema.safeParse({ posthog_api_key: postHogApiKey } as PosthogApiKey);
  if (!dtoResult.success) {
    const message = dtoResult.error.flatten().fieldErrors.posthog_api_key?.join(' - ');
    return json({ ok: false, message: message }, { status: 400 });
  }

  if (dtoResult.data.posthog_api_key == '') {
    await metafieldsDelete(admin.graphql, [
      {
        key: Constant.METAFIELD_KEY_POSTHOG_API_KEY,
        namespace: Constant.METAFIELD_NAMESPACE,
        ownerId: appId,
      },
    ]);
  } else {
    await metafieldsSet(admin.graphql, [
      {
        key: Constant.METAFIELD_KEY_POSTHOG_API_KEY,
        namespace: Constant.METAFIELD_NAMESPACE,
        ownerId: appId,
        type: 'single_line_text_field',
        value: dtoResult.data.posthog_api_key,
      },
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
  const { submit } = useForm({
    fields: {},
    onSubmit: async () => {
      fetcher.submit({ posthog_api_key: PostHogApiKey }, { method: 'post' });
      return { status: 'success' };
    },
  });
  useEffect(() => {
    const data = fetcher.data as { ok: false; message: string } | { ok: true; message: string } | null;
    if (!data) {
      return;
    }
    console.log('data.ok');
    console.log(data.ok);

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

  return (
    <fetcher.Form onSubmit={submit} method="post">
      <Page
        title="Overview"
        primaryAction={
          (
            <Button
              loading={fetcher.state == 'loading'}
              disabled={fetcher.state != 'idle' || PostHogApiKeyInitialState === PostHogApiKey}
              variant="primary"
              submit={true}
            >
              Save
            </Button>
          )
        }
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
              </BlockStack>
            </Layout.Section>
          </Layout>
        </BlockStack>
      </Page>
    </fetcher.Form>
  );
}
