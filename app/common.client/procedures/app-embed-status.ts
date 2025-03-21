import type { ThemeRole } from '../../types/admin.types';
import { queryThemes } from '../queries/query-themes';
import  JSON5 from "json5"

export async function appEmbedStatus(appEmbedUuid: string) {
  const themes = await queryThemes({
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
  /**current can be a string for example "DEFAULT" for new theme installations */
  const { current } = JSON5.parse(settingsData) as { current?: {blocks: Record<string, { type: string; disabled?: boolean }>} | string };

  if (typeof current === 'string' || current instanceof String || current === undefined) {
    return false;
  }

  return Object.values(current.blocks).some((payload) => {
    return payload.type.includes(appEmbedUuid) && !payload.disabled
  })
}
