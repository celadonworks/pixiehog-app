import { BlockStack, Box, Card, Checkbox, Icon, InlineGrid, Key, Scrollable, Text } from "@shopify/polaris"
import {SearchIcon} from '@shopify/polaris-icons';
interface WebPixelEventData {
  title: String;
  info:  String;
  isSelected: Boolean;
}
export interface WebPixelEvents {
  cart_viewed: WebPixelEventData,
  product_added_to_cart: WebPixelEventData,
  product_removed_from_cart: WebPixelEventData,
  checkout_address_info_submitted: WebPixelEventData,
  checkout_completed: WebPixelEventData,
  checkout_contact_info_submitted: WebPixelEventData,
  checkout_shipping_info_submitted: WebPixelEventData,
  checkout_started: WebPixelEventData,
  payment_info_submitted: WebPixelEventData,
  collection_viewed: WebPixelEventData,
  page_viewed: WebPixelEventData,
  product_viewed: WebPixelEventData,
  search_submitted: WebPixelEventData,
  clicked: WebPixelEventData,
  input_blurred: WebPixelEventData,
  input_changed: WebPixelEventData,
  input_focused: WebPixelEventData,
  form_submitted: WebPixelEventData
}
export interface MultiChoiceSelectorProps {
  events: WebPixelEvents,
  onChange: (key: keyof WebPixelEvents) => void;
}

export default function MultiChoiceSelector({events,onChange}:MultiChoiceSelectorProps){

  return (
    <Card>
        {
          Object.entries(events).length ? 
          (
            <Scrollable shadow style={{height: 'max-content', maxHeight:"500px"}}>
              <BlockStack gap="800">
                {
                  Object.entries(events).map(([key,value],index) => {
                    return (
                    <InlineGrid gap="1600" columns={2} key={index} alignItems="center">
                      <BlockStack gap="100">
                        <Text variant="headingSm" as="h2" >
                          {value.title}
                        </Text>
                        <Text variant="bodyMd" as="p" >
                          {value.info}
                        </Text>
                      </BlockStack>
                      <BlockStack gap="100">
                      <Checkbox
                        label={<code>{key}</code>}
                        checked={value.isSelected}
                        id={key}
                        onChange={() => onChange(key)}
                      />
                      </BlockStack>
                    </InlineGrid>
                    )
                  })
                }
              </BlockStack>
            </Scrollable> 
          )
          : 
          (  
            <Box padding="400">
              <BlockStack gap="500">
                <Icon source={SearchIcon} tone="base" />
                <Text variant="headingMd" as="h2" alignment="center">
                  You haven't selected any access scopes
                </Text>
              </BlockStack>
            </Box>
          )
        }
    </Card>
  )
}