import type { WebPixelEventsSettings } from "../../../../common/dto/web-pixel-events-settings.dto";
import type { Settings }  from "../../../../common/interfaces/feature-settings.interface"
export interface WebPixelSettingChoice extends Omit<Settings,'key'>{
  key: keyof WebPixelEventsSettings;
}