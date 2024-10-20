import { useCallback, useEffect, useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Layout, Card, BlockStack, Tabs, Text, Divider, TextField, Icon } from '@shopify/polaris';
import { authenticate } from '../../shopify.server';
import { SearchIcon } from '@shopify/polaris-icons';
import { queryCurrentAppInstallation } from 'app/common.server/queries/current-app-installation';
import MultiChoiceSelector from './MultiChoiceSelector';
import { json, useFetcher, useLoaderData } from '@remix-run/react';
import type { WebPixelSettingChoice } from './interface/setting-row.interface';
import { WebPixelEventsSettingsSchema } from '../../../common/dto/web-pixel-events-settings.dto';
import { metafieldsSet } from '../../common.server/mutations/metafields-set';
import { Constant } from '../../../common/constant';
import type { WebPixelSettings } from '../../../common/dto/web-pixel-settings.dto';
import { recalculateWebPixel } from '../../common.server/procedures/recalculate-web-pixel';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const currentAppInstallation = await queryCurrentAppInstallation(admin.graphql);
  return currentAppInstallation;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const payload = Object.fromEntries(formData.entries());
  const dtoResult = WebPixelEventsSettingsSchema.safeParse(payload);
  if (!dtoResult.success) {
    const message = Object.entries(dtoResult.error.flatten().fieldErrors)
      .map(([key, errors]) => {
        return `${key}: ${errors.join(' & ')}`;
      })
      .join('|\n');
    return json({ ok: false, message }, { status: 400 });
  }
  const currentAppInstallation = await queryCurrentAppInstallation(admin.graphql);

  const responseMetafieldsSet = await metafieldsSet(admin.graphql, [
    {
      key: Constant.METAFIELD_KEY_WEB_PIXEL_EVENTS_SETTINGS,
      namespace: Constant.METAFIELD_NAMESPACE,
      ownerId: currentAppInstallation.id,
      value: JSON.stringify(dtoResult.data),
      type: 'json',
    },
  ]);
  console.dir(
    { responseMetafieldsSet },
    {
      depth: 4,
    }
  );

  const responseRecalculate = await recalculateWebPixel(admin.graphql);
  if (!responseRecalculate) {
    return json({ ok: true, message: 'Web pixel setting saved' }, { status: 200 });
  }
  return json({ ok: true, message: `Web pixel ${responseRecalculate.status}` }, { status: 200 });
};

export default function WebPixelEvents() {
  const fetcher = useFetcher();
  const currentAppInstallation = useLoaderData<typeof loader>();
  const webPixelSettingsMetafieldValue = currentAppInstallation?.web_pixel_settings?.jsonValue as
    | undefined
    | null
    | WebPixelSettings;
  const defaultSettings: WebPixelSettingChoice[] = [
    {
      key: 'cart_viewed',
      description: "event logs an instance where a customer visited the cart page.",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'checkout_address_info_submitted',
      description:
        "event logs an instance of a customer submitting their mailing address. This event is only available in checkouts where Checkout Extensibility for customizations is enabled",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'checkout_completed',
      description:
        "event logs when a visitor completes a purchase. It's triggered once for each checkout, typically on the Thank you page. However, for upsells and post purchases, the 'checkout_completed' event is triggered on the first upsell offer page instead. The event isn't triggered again on the Thank you page. If the page where the event is supposed to be triggered fails to load, then the 'checkout_completed' event isn't triggered at all.",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'checkout_contact_info_submitted',
      description:
        "event logs an instance where a customer submits a checkout form. This event is only available in checkouts where Checkout Extensibility for customizations is enabled",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'checkout_shipping_info_submitted',
      description:
        "event logs an instance where the customer chooses a shipping rate. This event is only available in checkouts where Checkout Extensibility for customizations is enabled",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'checkout_started',
      description:
        "event logs an instance of a customer starting the checkout process. This event is available on the checkout page. For Checkout Extensibility, this event is triggered every time a customer enters checkout. For non-checkout extensible shops, this event is only triggered the first time a customer enters checkout.",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'collection_viewed',
      description:
        "event logs an instance where a customer visited a product collection index page. This event is available on the online store page.",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'page_viewed',
      description:
        "event logs an instance where a customer visited a page. This event is available on the online store, checkout, and Order status pages.",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'payment_info_submitted',
      description:
        "event logs an instance of a customer submitting their payment information. This event is available on the checkout page.",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'product_added_to_cart',
      description:
        "event logs an instance where a customer adds a product to their cart. This event is available on the online store page.",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'product_removed_from_cart',
      description:
        "event logs an instance where a customer removes a product from their cart. This event is available on the online store page.",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'product_viewed',
      description:
        "event logs an instance where a customer visited a product details page. This event is available on the product page.",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'search_submitted',
      description:
        "event logs an instance where a customer performed a search on the storefront. The products returned from the search query are in this event object (the first product variant for each product is listed in the array). This event is available on the online store page.",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'clicked',
      description: "event logs an instance where a customer clicks on a page element.",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'form_submitted',
      description: "event logs an instance where a form on a page is submitted.",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'input_blurred',
      description: "event logs an instance where an input on a page loses focus.",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'input_changed',
      description: "event logs an instance where an input value changes.",
      selected: false,
      filteredOut: false,
    },
    {
      key: 'input_focused',
      description: "event logs an instance where an input on a page gains focus.",
      selected: false,
      filteredOut: false,
    },
  ];
  const webPixelSettingsState = defaultSettings.map<WebPixelSettingChoice>((entry) => {
    return {
      ...entry,
      selected: webPixelSettingsMetafieldValue?.[entry.key] === 'true',
    };
  });
  const [webPixelSettings, setWebPixelSettings] = useState(webPixelSettingsState);

  const handleWebPixelSettingChange = (key: string) => {
    setWebPixelSettings(
      webPixelSettings.map<WebPixelSettingChoice>((entry) => {
        console.log({ clickedKey: key, elementKey: entry.key });
        if (entry.key != key) {
          return entry;
        }
        return {
          ...entry,
          selected: !entry.selected,
        };
      })
    );
  };

  const selectedWebPixelSettings = webPixelSettings.filter((entry) => entry.selected);

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

  const submitSettings = () => {
    fetcher.submit(
      Object.fromEntries(
        webPixelSettings.map(({ key, selected }) => {
          return [key, selected];
        })
      ),
      {
        method: 'POST',
      }
    );
  };

  useEffect(() => {
    const data = fetcher.data as { ok: false; message: string } | { ok: true; message: string } | null;
    if (!data) {
      return;
    }
    console.log('data.ok');
    console.log(data.ok);

    if (!data.ok) {
      window.shopify.toast.show(data.message, {
        isError: true,
        duration: 2000,
      });
    }

    window.shopify.toast.show(data.message, {
      isError: false,
      duration: 2000,
    });
    return;
  }, [fetcher, fetcher.data, fetcher.state]);

  return (
    <Page
      title="Web Pixel Settings"
      primaryAction={{
        onAction: submitSettings,
        content: 'Save',
        loading: fetcher.state != 'idle',
        disabled: fetcher.state != 'idle',
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text variant="headingMd" as="h2">
                Pick the events ( Web Pixel Events ) you want to track to better understand your customers and improve
                their shopping experience.
              </Text>
              <Divider />
              <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
                <BlockStack gap="500">
                  <TextField
                    label=""
                    value={filter}
                    placeholder="Filter Events"
                    onChange={handleFilterChange}
                    autoComplete="off"
                    prefix={<Icon source={SearchIcon}></Icon>}
                  />
                  <MultiChoiceSelector
                    webPixelSettings={tabs[selectedTab].id === 'all' ? webPixelSettings : selectedWebPixelSettings}
                    onChange={handleWebPixelSettingChange}
                  ></MultiChoiceSelector>
                </BlockStack>
              </Tabs>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
