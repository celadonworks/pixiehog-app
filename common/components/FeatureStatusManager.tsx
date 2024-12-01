import { Badge, Banner, Box, Button, InlineStack, List, Text } from '@shopify/polaris';
export interface FeatureStatusManagerProps {
  featureEnabled: boolean;
  dirty: boolean,
  customActions?: CustomAction[],
  bannerTitle?: string,
  bannerTone?: 'success' | 'info' | 'warning' | 'critical',
  handleFeatureEnabledToggle: () => void;
}

interface CustomAction {
  trigger: boolean,
  badgeText: string,
  badgeTone: BadgeTone
  badgeToneOnDirty: BadgeTone,
  bannerMessage: string | React.ReactNode
}
type BadgeTone = 'info' | 'success' | 'warning' | 'critical' | 'attention' | 'new' | 'magic' | 'info-strong' | 'success-strong' | 'warning-strong' | 'critical-strong' | 'attention-strong' | 'read-only' | 'enabled'


function StatusBadge({
  featureEnabled,
  customActions,
  dirty
}: Pick<FeatureStatusManagerProps, 'featureEnabled' | 'customActions'> & { dirty: boolean}) {
  if (!featureEnabled) {
    return (
      <Badge size="large" tone="enabled">
        Disconnected
      </Badge>
    );
  }
  if(customActions?.length){
    for(const customAction of customActions){
      if(customAction?.trigger){
        return (
          <Badge size="large" tone={dirty ? customAction?.badgeToneOnDirty : customAction?.badgeTone}>
            {customAction.badgeText}
          </Badge>
        );
      }
    }
  }
  
 

  return (
    <Badge size="large" tone={dirty ? 'attention' : 'success'}>
      Connected
    </Badge>
  );
}

function RequiredActionsBanner({
  featureEnabled,
  customActions,
  bannerTitle,
  bannerTone
}: Pick<FeatureStatusManagerProps, 'featureEnabled' | 'customActions' | 'bannerTitle' | 'bannerTone'>) {
  if (!featureEnabled) {
    return;
  }
  if(!customActions?.length){
    return
  }
  const customActionsTriggerOn = customActions.filter((customAction) => customAction.trigger)
  if(!customActionsTriggerOn.length){
    return
  }

  return (
    <Box paddingBlockStart={'200'} width="100%">
      <Banner title={bannerTitle || "The following requirements need to be meet" } tone= { bannerTone || "warning"}>
        <List>
          {
            customActionsTriggerOn.map((customAction,index) => {
              return (<List.Item key={index}>{customAction.bannerMessage}</List.Item>)
            })
          }
        </List>
      </Banner>
    </Box>
  );
}

export default function FeatureStatusManager({
  featureEnabled,
  dirty,
  bannerTitle,
  bannerTone,
  customActions,
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
            featureEnabled={featureEnabled}
            customActions= {customActions}
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
        featureEnabled={featureEnabled}
        customActions={customActions}
        bannerTitle={bannerTitle}
        bannerTone={bannerTone}
      />
    </Box>
  );
}
