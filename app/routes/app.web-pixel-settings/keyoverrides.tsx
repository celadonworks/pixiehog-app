import { Badge, Icon, InlineStack, Text } from '@shopify/polaris';
import { defaultWebPixelSettings } from './default-web-pixel-settings';
import { shopifySvg } from './shopify.svg';
import { posthogSvg } from './posthog.svg';
import { webPixelToPostHogEcommerceSpecMap } from './event-map';

export const shopifyKeys = Object.fromEntries(
  defaultWebPixelSettings.map((entry) => {
    return [
      entry.key,
      <InlineStack key={entry.key} gap="200" align="start" blockAlign="center" wrap={false}>
        <Text as="span">{entry.key}</Text>
        <InlineStack gap="200" align="start" blockAlign="start" wrap={false}>
          <Icon source={shopifySvg} />
        </InlineStack>
      </InlineStack>,
    ];
  })
);

export const posthogKeys = Object.fromEntries(
  defaultWebPixelSettings.map((entry) => {
    const hasPostHogkey = !!webPixelToPostHogEcommerceSpecMap[entry.key];
    const keyed = hasPostHogkey ? webPixelToPostHogEcommerceSpecMap[entry.key] : entry.key;
    return [
      entry.key,
      <InlineStack key={entry.key} gap="200" align="start" blockAlign="center" wrap={false}>
        <Text as="span">{keyed}</Text>
        <InlineStack gap="200" align="start" blockAlign="start" wrap={false}>
          <Icon source={hasPostHogkey ? posthogSvg : shopifySvg} />
          {!hasPostHogkey && <Badge tone="warning">Shopify Only</Badge>}
        </InlineStack>
      </InlineStack>,
    ];
  })
);
