import { Badge, Banner, Box, Button, InlineStack, Link, List, Text } from '@shopify/polaris';
import type { JsWebPosthogSettingChoice } from './interface/setting-row.interface';
import type { JsWebPosthogConfig } from '../../../common/dto/js-web-settings.dto';
export interface JsWebPosthogConfigHeaderProps {
  posthogApiKey?: string;
  jsWebPosthogFeatureEnabled: boolean;
  jsWebPosthogSettings: JsWebPosthogSettingChoice[];
  jsWebPosthogFeatureToggleInitialState: boolean;
  jsWebPosthogSettingsMetafieldValue: undefined | null | JsWebPosthogConfig;
  handleJsWebPosthogFeatureEnabledToggle: () => void;
}

function StatusBadge({
  posthogApiKey,
  jsWebPosthogFeatureEnabled,
  jsWebPosthogSettings,
  dirty
}: Pick<JsWebPosthogConfigHeaderProps, 'posthogApiKey' | 'jsWebPosthogFeatureEnabled' | 'jsWebPosthogSettings'> & { dirty: boolean}) {
  if (!jsWebPosthogFeatureEnabled) {
    return (
      <Badge size="large" tone={dirty ? 'attention' : 'enabled'}>
        Disconnected
      </Badge>
    );
  }
  if (!posthogApiKey) {
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
  jsWebPosthogFeatureEnabled,
  jsWebPosthogSettings,
}: Pick<JsWebPosthogConfigHeaderProps, 'posthogApiKey' | 'jsWebPosthogFeatureEnabled' | 'jsWebPosthogSettings'>) {
  if (!jsWebPosthogFeatureEnabled) {
    return;
  }
  if (posthogApiKey) {
    return;
  }
  return (
    <Box paddingBlockStart={'200'} width="100%">
      <Banner title="The following requirements need to be meet to finalize the Web Pixel setup:" tone="warning">
        <List>
          {!posthogApiKey && <List.Item>Setup Posthog project API key <Link url="/app/overview">Here</Link>.</List.Item>}
        </List>
      </Banner>
    </Box>
  );
}

export default function JsWebPosthogHeader({
  posthogApiKey,
  jsWebPosthogFeatureEnabled,
  jsWebPosthogSettings,
  jsWebPosthogFeatureToggleInitialState,
  jsWebPosthogSettingsMetafieldValue,
  handleJsWebPosthogFeatureEnabledToggle,
}: JsWebPosthogConfigHeaderProps) {
  const initiallyHasSelected = Object.values(jsWebPosthogSettingsMetafieldValue || {}).some((value) => value == 'true');
  const nowHasSelected = Object.values(jsWebPosthogSettings).some((entry) => entry.value == true);
  const dirty = jsWebPosthogFeatureToggleInitialState != jsWebPosthogFeatureEnabled || initiallyHasSelected != nowHasSelected;
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
            jsWebPosthogFeatureEnabled={jsWebPosthogFeatureEnabled}
            jsWebPosthogSettings={jsWebPosthogSettings}
          />
        </InlineStack>

        <Box minWidth="fit-content">
          <InlineStack align="end">
            <Button
              role="switch"
              ariaChecked={jsWebPosthogFeatureEnabled ? 'true' : 'false'}
              onClick={handleJsWebPosthogFeatureEnabledToggle}
              size="slim"
            >
              {jsWebPosthogFeatureEnabled ? 'Turn off' : 'Turn on'}
            </Button>
          </InlineStack>
        </Box>
      </InlineStack>

      <RequiredActionsBanner
        posthogApiKey={posthogApiKey}
        jsWebPosthogFeatureEnabled={jsWebPosthogFeatureEnabled}
        jsWebPosthogSettings={jsWebPosthogSettings}
      />
    </Box>
  );
}
