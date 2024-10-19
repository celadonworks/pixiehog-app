import { useCallback, useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  BlockStack,
  Card,
  TextField,
  Button,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import {
  json,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useForm } from "@shopify/react-form";
import { queryCurrentAppInstallation } from "app/common.server/queries/current-app-installation";
import { Constant } from "../../common/constant/index"
import { metafieldsSet } from "../common.server/mutations/metafield-set";
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const data = await (await queryCurrentAppInstallation(admin.graphql)).json()
  if(!data?.ph_key){
    return null
  }

  return json(data.ph_key.value);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const currentAppInstallation = await (await queryCurrentAppInstallation(admin.graphql)).json()
  const appId = currentAppInstallation!.id
  const formData:FormData = await request.formData();
  const postHogApiKey = formData.get("posthog_api_key") as string
  if(!postHogApiKey){
    return json({ message: 'The PostHog API key is required.' }, { status: 400 });
  } 
  const metafields =[
    {
      key: Constant.POSTHOG_METAFIELD_KEY,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: appId,
      type: "json",
      value: postHogApiKey
    }
  ]
  await (await metafieldsSet(admin.graphql,metafields)).json()

  return json({ ok:true ,message: 'PostHog API key saved successfully.' }, { status: 200 });

};

export default function Index() {
  const ph_key = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const navigate = useNavigate();
  let PostHogApiKeyInitialState = ph_key ? ph_key : ''
  const [PostHogApiKey, setPostHogApiKey] = useState(PostHogApiKeyInitialState);
  const handleApiKeyChange = useCallback(
    (newValue: string) => setPostHogApiKey(newValue),
    [],
  );
  const { submit } = useForm({
    fields:{},
    onSubmit: async () => {
      fetcher.submit({posthog_api_key:PostHogApiKey}, { method: "post" ,});
      return { status: "success" };
    }
  })
  useEffect(() => {
    const data = fetcher.data as { ok : false, message: string} | {ok: true, message: string} | null
    if (!data) {
      return
    }
    console.log('data.ok');
    console.log(data.ok);
    
    if (data.ok) {
      window.shopify.toast.show(data.message, {
        isError: false,
        duration: 2000,
      })
      return;
    }
    window.shopify.toast.show(data.message, {
      isError: true,
      duration: 2000,
    })
    
  }, [fetcher, fetcher.data, fetcher.state, navigate]);

  return (
  <fetcher.Form onSubmit={submit} method="post">
    <Page
      title="Posthog Analytics"
      primaryAction={
        PostHogApiKeyInitialState !== PostHogApiKey && 
        <Button 
          loading={fetcher.state == 'loading'}
          disabled={fetcher.state != 'idle'} 
          variant="primary"
          submit= {true}
        >
          Save
        </Button>}
      secondaryActions = {
        PostHogApiKeyInitialState !== PostHogApiKey && 
        <Button
        onClick={()=>setPostHogApiKey(PostHogApiKeyInitialState)}
        >
          Cancel
        </Button>}
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
                        placeholder="phc_pO2qo4XkzmJkWrr03pgCtIM5me1u25uRyehJlChAnpU"
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

