import { BlockStack, Box, Card, Checkbox, Icon, InlineCode, InlineGrid, Scrollable, Text } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import type { WebPixelSettingChoice } from './interface/setting-row.interface';
export interface MultiChoiceSelectorProps {
  webPixelSettings: WebPixelSettingChoice[];
  onChange: (key: string) => void;
  webPixelFeatureEnabled: boolean;
}

export default function MultiChoiceSelector({ webPixelSettings, onChange, webPixelFeatureEnabled }: MultiChoiceSelectorProps) {
  return (
    <Card>
      {Object.entries(webPixelSettings).length ? (
        <Scrollable disabled={true} shadow style={{ height: 'max-content', maxHeight: '500px' }}>
          <BlockStack gap="800">
            {webPixelSettings
              .filter((entry) => !entry.filteredOut)
              .map((entry, index: number) => {
                return (
                  <InlineGrid gap="1600" columns={2} key={entry.key} alignItems="center">
                    <BlockStack gap="100">
                      <Text tone={webPixelFeatureEnabled ? 'base' : 'disabled'} variant="headingSm" as="h2">
                      {entry.key}
                      </Text>
                      <Text variant="bodyMd" tone={webPixelFeatureEnabled ? 'base' : 'disabled'} as="p">
                        The <InlineCode>{entry.key}</InlineCode> {entry.description}
                      </Text>
                    </BlockStack>
                    <BlockStack  gap="100">
                      <Checkbox disabled={!webPixelFeatureEnabled}
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
