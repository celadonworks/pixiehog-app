import { Badge, Banner, Box, Button, InlineStack, List, Text } from '@shopify/polaris';
import type { WebPixelSettingChoice } from './interface/setting-row.interface';
import type { WebPixelSettings } from '../../../common/dto/web-pixel-settings.dto';
export interface WebPixelSettingsHeaderProps {
  posthogApiKey?: string;
  webPixelFeatureEnabled: boolean;
  webPixelSettings: WebPixelSettingChoice[];
  webPixelFeatureToggleInitialState: boolean;
  webPixelSettingsMetafieldValue: undefined | null | WebPixelSettings;
  handleWebPixelFeatureEnabledToggle: () => void;
}

function StatusBadge({
  posthogApiKey,
  webPixelFeatureEnabled,
  webPixelSettings,
  dirty
}: Pick<WebPixelSettingsHeaderProps, 'posthogApiKey' | 'webPixelFeatureEnabled' | 'webPixelSettings'> & { dirty: boolean}) {
  console.log({ xx_: webPixelSettings });
  if (!webPixelFeatureEnabled) {
    return (
      <Badge size="large" tone={dirty ? 'attention' : 'enabled'}>
        Disconnected
      </Badge>
    );
  }
  const allEventsDisabled = webPixelSettings.every((entry) => !entry.selected);
  if (!posthogApiKey || allEventsDisabled) {
    return (
      <Badge size="large" tone={dirty ? 'attention' : 'critical'}>
        Action required
      </Badge>
    );
  }

  return (
    <Badge size="large" tone={dirty ? 'attention' : 'success'}>
      Connected
    </Badge>
  );
}

function RequiredActionsBanner({
  posthogApiKey,
  webPixelFeatureEnabled,
  webPixelSettings,
}: Pick<WebPixelSettingsHeaderProps, 'posthogApiKey' | 'webPixelFeatureEnabled' | 'webPixelSettings'>) {
  const allEventsDisabled = webPixelSettings.every((entry) => !entry.selected);
  if (!webPixelFeatureEnabled) {
    return;
  }
  if (!allEventsDisabled && posthogApiKey) {
    return;
  }
  return (
    <Box paddingBlockStart={'200'} width="100%">
      <Banner title="The following requirements need to be meet to finalize the Web Pixel setup:" tone="warning">
        <List>
          {!posthogApiKey && <List.Item>Setup Posthog project API key.</List.Item>}
          {allEventsDisabled && <List.Item>Select at least 1 event from the list below.</List.Item>}
        </List>
      </Banner>
    </Box>
  );
}

export default function WebPixelSettingsHeader({
  posthogApiKey,
  webPixelFeatureEnabled,
  webPixelSettings,
  webPixelFeatureToggleInitialState,
  webPixelSettingsMetafieldValue,
  handleWebPixelFeatureEnabledToggle,
}: WebPixelSettingsHeaderProps) {
  const initiallyHasSelected = Object.values(webPixelSettingsMetafieldValue || {}).some((value) => value == 'true');
  const nowHasSelected = Object.values(webPixelSettings).some((entry) => entry.selected == true);
  const dirty = webPixelFeatureToggleInitialState != webPixelFeatureEnabled || initiallyHasSelected != nowHasSelected;
  return (
    <Box width="100%">
      <InlineStack gap="1200" align="space-between" blockAlign="start" wrap={false}>
        <InlineStack gap="200" align="start" blockAlign="start" wrap={false}>
          <Text as="h6" variant="bodyLg">
            Status:
          </Text>
          <StatusBadge
            dirty={dirty}
            posthogApiKey={posthogApiKey}
            webPixelFeatureEnabled={webPixelFeatureEnabled}
            webPixelSettings={webPixelSettings}
          />
        </InlineStack>

        <Box minWidth="fit-content">
          <InlineStack align="end">
            <Button
              role="switch"
              ariaChecked={webPixelFeatureEnabled ? 'true' : 'false'}
              onClick={handleWebPixelFeatureEnabledToggle}
              size="slim"
            >
              {webPixelFeatureEnabled ? 'Turn off' : 'Turn on'}
            </Button>
          </InlineStack>
        </Box>
      </InlineStack>

      <RequiredActionsBanner
        posthogApiKey={posthogApiKey}
        webPixelFeatureEnabled={webPixelFeatureEnabled}
        webPixelSettings={webPixelSettings}
      />
    </Box>
  );
}
