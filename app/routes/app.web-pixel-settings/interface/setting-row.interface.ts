import type { WebPixelEventsSettings } from "../../../../common/dto/web-pixel-events-settings.dto";

export interface WebPixelSettingChoice {
  key: keyof WebPixelEventsSettings;
  description: string;
  selected: boolean;
  filteredOut: boolean,
}