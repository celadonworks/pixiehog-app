import { BlockStack, Box, Card, Checkbox, Icon, InlineCode, InlineGrid, Scrollable, Text } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import type { WebPixelSettingChoice } from './interface/setting-row.interface';
interface WebPixelEventData {
  title: string;
  info: string;
  isSelected: boolean;
}
export interface WebPixelEvents {
  cart_viewed: WebPixelEventData;
  product_added_to_cart: WebPixelEventData;
  product_removed_from_cart: WebPixelEventData;
  checkout_address_info_submitted: WebPixelEventData;
  checkout_completed: WebPixelEventData;
  checkout_contact_info_submitted: WebPixelEventData;
  checkout_shipping_info_submitted: WebPixelEventData;
  checkout_started: WebPixelEventData;
  payment_info_submitted: WebPixelEventData;
  collection_viewed: WebPixelEventData;
  page_viewed: WebPixelEventData;
  product_viewed: WebPixelEventData;
  search_submitted: WebPixelEventData;
  clicked: WebPixelEventData;
  input_blurred: WebPixelEventData;
  input_changed: WebPixelEventData;
  input_focused: WebPixelEventData;
  form_submitted: WebPixelEventData;
}
export interface MultiChoiceSelectorProps {
  webPixelSettings: WebPixelSettingChoice[];
  onChange: (key: string) => void;
}

export default function MultiChoiceSelector({ webPixelSettings, onChange }: MultiChoiceSelectorProps) {
  return (
    <Card>
      {Object.entries(webPixelSettings).length ? (
        <Scrollable shadow style={{ height: 'max-content', maxHeight: '500px' }}>
          <BlockStack gap="800">
            {webPixelSettings
              .filter((entry) => !entry.filteredOut)
              .map((entry, index: number) => {
                return (
                  <InlineGrid gap="1600" columns={2} key={entry.key} alignItems="center">
                    <BlockStack gap="100">
                      <Text variant="headingSm" as="h2">
                      {entry.key}
                      </Text>
                      <Text variant="bodyMd" as="p">
                        The <InlineCode>{entry.key}</InlineCode> {entry.description}
                      </Text>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Checkbox
                        label={<code>{entry.key}</code>}
                        checked={entry.selected}
                        id={entry.key}
                        key={entry.key}
                        name={entry.key}
                        onChange={() => onChange(entry.key)}
                      />
                    </BlockStack>
                  </InlineGrid>
                );
              })}
          </BlockStack>
        </Scrollable>
      ) : (
        <Box padding="400">
          <BlockStack gap="500">
            <Icon source={SearchIcon} tone="base" />
            <Text variant="headingMd" as="h2" alignment="center">
              You haven't selected any access scopes
            </Text>
          </BlockStack>
        </Box>
      )}
    </Card>
  );
}
