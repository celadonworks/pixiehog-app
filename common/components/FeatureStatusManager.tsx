import { Badge, Banner, Box, Button, InlineStack, Link, List, Text } from '@shopify/polaris';
import type { JsWebPosthogSettingChoice } from '../../app/routes/app.js-web-posthog-settings/interface/setting-row.interface';

export interface FeatureStatusManagerProps {
  posthogApiKey?: string;
  featureEnabled: boolean;
  settings: JsWebPosthogSettingChoice[];
  dirty: boolean,
  customAction?: CustomeAction,
  handleFeatureEnabledToggle: () => void;
}

interface CustomeAction {
  trigger: boolean,
  badgeText: string,
  badgeTone: BadgeTone
  badgeToneOnDirty: BadgeTone,
  bannerMessage: string | React.ReactNode
}
type BadgeTone = 'info' | 'success' | 'warning' | 'critical' | 'attention' | 'new' | 'magic' | 'info-strong' | 'success-strong' | 'warning-strong' | 'critical-strong' | 'attention-strong' | 'read-only' | 'enabled'


function StatusBadge({
  posthogApiKey,
  featureEnabled,
  settings,
  customAction,
  dirty
}: Pick<FeatureStatusManagerProps, 'posthogApiKey' | 'featureEnabled' | 'settings' | 'customAction'> & { dirty: boolean}) {
  if (!featureEnabled) {
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
  if(customAction?.trigger){
    return (
      <Badge size="large" tone={dirty ? customAction?.badgeToneOnDirty : customAction?.badgeTone}>
        {customAction.badgeText}
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
  featureEnabled,
  customAction,
  settings,
}: Pick<FeatureStatusManagerProps, 'posthogApiKey' | 'featureEnabled' | 'settings' | 'customAction'>) {
  if (!featureEnabled) {
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
          {customAction?.trigger && <List.Item>{customAction.bannerMessage}</List.Item>}
        </List>
      </Banner>
    </Box>
  );
}

export default function FeatureStatusManager({
  posthogApiKey,
  featureEnabled,
  settings,
  dirty,
  handleFeatureEnabledToggle,
}: FeatureStatusManagerProps) {
 
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
            featureEnabled={featureEnabled}
            settings={settings}
          />
        </InlineStack>

        <Box minWidth="fit-content">
          <InlineStack align="end">
            <Button
              role="switch"
              ariaChecked={featureEnabled ? 'true' : 'false'}
              onClick={handleFeatureEnabledToggle}
              size="slim"
            >
              {featureEnabled ? 'Turn off' : 'Turn on'}
            </Button>
          </InlineStack>
        </Box>
      </InlineStack>

      <RequiredActionsBanner
        posthogApiKey={posthogApiKey}
        featureEnabled={featureEnabled}
        settings={settings}
      />
    </Box>
  );
}
