import { useCallback, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Tabs,
  Text,
  Divider,
  TextField,
  Icon,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import MultiChoiceSelector from "app/components/MultiChoiceSelector";
import type {WebPixelEvents} from "app/components/MultiChoiceSelector";
import {SearchIcon} from '@shopify/polaris-icons';
import { queryCurrentAppInstallation } from "app/common.server/queries/current-app-installation";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const {admin} = await authenticate.admin(request);
  queryCurrentAppInstallation(admin.graphql)
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
};

export default function WebPixelEvents() {
  const eventsInitialState:WebPixelEvents  = {
    cart_viewed:{
      title: "Cart Viewed",
      info: "The 'cart_viewed' event logs an instance where a customer visited the cart page.",
      isSelected: false,
    },
    product_added_to_cart:{
      title: "Product Added To Cart",
      info: "The 'product_added_to_cart' event logs an instance where a customer adds a product to their cart. This event is available on the online store page.",
      isSelected: false,
    },
    product_removed_from_cart:{
      title: "Product Removed From Cart",
      info: "The 'product_removed_from_cart' event logs an instance where a customer removes a product from their cart. This event is available on the online store page.",
      isSelected: false,
    },
    checkout_address_info_submitted:{
      title: "Checkout Address Info Submitted",
      info: "The 'checkout_address_info_submitted' event logs an instance of a customer submitting their mailing address. This event is only available in checkouts where Checkout Extensibility for customizations is enabled",
      isSelected: false,
    },
    checkout_completed:{
      title: "Checkout Completed",
      info: "The 'checkout_completed' event logs when a visitor completes a purchase. It's triggered once for each checkout, typically on the Thank you page. However, for upsells and post purchases, the 'checkout_completed' event is triggered on the first upsell offer page instead. The event isn't triggered again on the Thank you page. If the page where the event is supposed to be triggered fails to load, then the 'checkout_completed' event isn't triggered at all.",
      isSelected: false,
    },
    checkout_contact_info_submitted:{
      title: "Checkout Contact Info Submitted",
      info: "The 'checkout_contact_info_submitted' event logs an instance where a customer submits a checkout form. This event is only available in checkouts where Checkout Extensibility for customizations is enabled",
      isSelected: false,
    },
    checkout_shipping_info_submitted:{
      title: "Checkout Shipping Info Submitted",
      info: "The 'checkout_shipping_info_submitted' event logs an instance where the customer chooses a shipping rate. This event is only available in checkouts where Checkout Extensibility for customizations is enabled",
      isSelected: false,
    },
    checkout_started:{
      title: "Checkout Started",
      info: "The 'checkout_started' event logs an instance of a customer starting the checkout process. This event is available on the checkout page. For Checkout Extensibility, this event is triggered every time a customer enters checkout. For non-checkout extensible shops, this event is only triggered the first time a customer enters checkout.",
      isSelected: false,
    },
    payment_info_submitted:{
      title: "Payment Info Submitted",
      info: "The 'payment_info_submitted' event logs an instance of a customer submitting their payment information. This event is available on the checkout page.",
      isSelected: false,
    },
    collection_viewed:{
      title: "Collection Viewed",
      info: "The 'collection_viewed' event logs an instance where a customer visited a product collection index page. This event is available on the online store page.",
      isSelected: false,
    },
    page_viewed:{
      title: "Page Viewed",
      info: "The 'page_viewed' event logs an instance where a customer visited a page. This event is available on the online store, checkout, and Order status pages.",
      isSelected: false,
    },
    product_viewed:{
      title: "Product Viewed",
      info: "The 'product_viewed' event logs an instance where a customer visited a product details page. This event is available on the product page.",
      isSelected: false,
    },
    search_submitted:{
      title: "Search Submitted",
      info: "The 'search_submitted' event logs an instance where a customer performed a search on the storefront. The products returned from the search query are in this event object (the first product variant for each product is listed in the array). This event is available on the online store page.",
      isSelected: false,
    },
    clicked:{
      title: "Clicked",
      info: "The 'clicked' event logs an instance where a customer clicks on a page element.",
      isSelected: false,
    },
    input_blurred:{
      title: "Input Blurred",
      info: "The 'input_blurred' event logs an instance where an input on a page loses focus.",
      isSelected: false,
    },
    input_changed:{
      title: "Input Changed",
      info: "The 'input_changed' event logs an instance where an input value changes.",
      isSelected: false,
    },
    input_focused:{
      title: "Input Focused",
      info: "The 'input_focused' event logs an instance where an input on a page gains focus.",
      isSelected: false,
    },
    form_submitted:{
      title: "Form Submitted",
      info: "The 'form_submitted' event logs an instance where a form on a page is submitted.",
      isSelected: false,
    },
  }
  const [events, setEvents] = useState(eventsInitialState);
  const handleEventsChange = (key:keyof WebPixelEvents) => {
    events[key].isSelected = !events[key].isSelected
    setEvents({
      ...events
    })
  }

  const selectedEvents = Object.fromEntries(
    Object.entries(events).filter(([key, value]) => value.isSelected === true)
  ) as WebPixelEvents

  const [selected, setSelected] = useState(0);
  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );
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
      badge: `${Object.entries(selectedEvents).length}`,
      accessibilityLabel: 'Selected Events',
      panelID: 'selected-events',
    },
  ];

  const [filter, setFilter] = useState('');
  const handleFilterChange = useCallback(
    (newValue: string) => {
      const eventsFiltered = Object.entries(events).filter(([key,value])=>{
        return value.title.includes(newValue) || value.info.includes(newValue)
      })
      const eventsInitialStateFiltered = Object.entries(eventsInitialState).filter(([key,value])=>{
        return value.title.includes(newValue) || value.info.includes(newValue)
      })
      setEvents({
        ...Object.fromEntries(eventsInitialStateFiltered) as WebPixelEvents,
        ...Object.fromEntries(eventsFiltered) as WebPixelEvents
      })
      setFilter(newValue)},
    [],
  );
  
  return (
    <Page
      title="Web Pixel Events"
    >
      <Layout>
        <Layout.Section>
              <Card >              
                <BlockStack gap="500">
                  <Text variant="headingMd" as="h2">
                    Pick the events ( Web Pixel Events ) you want to track to better understand your customers and improve their shopping experience.
                  </Text>
                  <Divider/>
                  <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}> 
                    <BlockStack gap="500">
                      <TextField
                        label=""
                        value= {filter}
                        placeholder="Filter Events"
                        onChange={handleFilterChange}
                        autoComplete="off"
                        prefix= {<Icon source={SearchIcon}></Icon>}                      
                      />
                      {
                      tabs[selected].id === "all" ? 
                      (<MultiChoiceSelector
                        events = {events}
                        onChange = {handleEventsChange}
                      ></MultiChoiceSelector>) : 
                      (<MultiChoiceSelector
                        events = {selectedEvents}
                        onChange = {handleEventsChange}
                      ></MultiChoiceSelector>) 
                      }
                    </BlockStack>
                  </Tabs>
                </BlockStack>
              </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
