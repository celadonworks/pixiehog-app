import type { AdminGraphqlClient } from '@shopify/shopify-app-remix/server';
import type { ThemeRole } from '../../types/admin.types';
import { queryThemes } from '../queries/query-themes';

export async function appEmbedStatus(graphq: AdminGraphqlClient, appEmbedUuid: string) {
  const themes = await queryThemes(graphq, {
    files: ['config/settings_data.json'],
    first: 1,
    roles: ['MAIN' as ThemeRole],
  });

  if (!themes) {
    return false;
  }
  const mainTheme = themes[0];

  if (!mainTheme) {
    return false;
  }

  if (!mainTheme.files) {
    return false;
  }

  const settingsData = mainTheme.files.nodes?.[0]?.body?.content;

  if (!settingsData) {
    return false;
  }

  const parsed = JSON.parse(settingsData) as { current: {blocks: Record<string, { type: string; disabled?: boolean }>} };

  return Object.values(parsed.current.blocks).some((payload) => {
    return payload.type.includes(appEmbedUuid) && !payload.disabled
  })
}
