import { BlockStack, Box, Card, Checkbox, Icon, InlineGrid, Scrollable, Text } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import List from './List';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import type { Settings } from 'common/interfaces/feature-settings.interface';

export interface MultiChoiceSelectorProps {
  settings: Settings[];
  onChange: (key: string, value?: string | number | string[]) => void;
  featureEnabled: boolean;
}



export default function MultiChoiceSelector({ settings, onChange, featureEnabled }: MultiChoiceSelectorProps) {
  return (
    <Card>
      {Object.entries(settings).length ? (
        <Scrollable disabled={true} shadow style={{ height: 'max-content', maxHeight: '500px' }}>
          <BlockStack gap="800">
            {settings
              .filter((entry) => !entry.filteredOut)
              .map((entry, index: number) => {
                return (
                  <InlineGrid gap="1600" columns={2} key={entry.key} alignItems="center">
                    <BlockStack gap="100">
                      <Text tone={featureEnabled ? 'base' : 'disabled'} variant="headingSm" as="h2">
                      {entry.key}
                      </Text>
                      <Text variant="bodyMd" tone={featureEnabled ? 'base' : 'disabled'} as="p">
                        {entry.description}
                      </Text>
                    </BlockStack>
                    <BlockStack  gap="100">
                      {
                        entry.type === "Checkbox" && (
                        <Checkbox 
                          disabled={!featureEnabled}
                          label={<code>{entry.key}</code>}
                          checked={entry.value as boolean}
                          id={entry.key}
                          key={entry.key}
                          name={entry.key}
                          onChange={() => onChange(entry.key)}
                        />
                        ) 
                      }
                      {
                        entry.type === "Text" && (
                        <TextInput
                          entry={entry}
                          onChange={onChange}
                          featureEnabled={featureEnabled}
                          type='text'
                        />
                        ) 
                      }
                      {
                        entry.type === "Number" && (
                          <TextInput
                            entry={entry}
                            onChange={onChange}
                            featureEnabled={featureEnabled}
                            type='number'
                          />
                        ) 
                      }
                      {
                        entry.type === "Select" && (
                        <SelectInput
                          entry={entry}
                          onChange={onChange}
                          featureEnabled={featureEnabled}
                        />
                        ) 
                      }
                      {
                        entry.type === "List" &&
                        (
                          <List
                          entry={entry}
                          onChange={onChange}
                          featureEnabled= {featureEnabled}
                          />
                        )
                      }
                     
                      
                    </BlockStack>
                  </InlineGrid>
                );
              })}
              <Box paddingBlockEnd={'025'}></Box>
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
