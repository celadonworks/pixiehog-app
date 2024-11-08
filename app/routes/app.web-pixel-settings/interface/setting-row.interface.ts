import type { WebPixelEventsSettings } from '../../../../common/dto/web-pixel-events-settings.dto';
import type { Settings } from '../../../../common/interfaces/feature-settings.interface';
export type WebPixelSettingChoice = Settings<keyof WebPixelEventsSettings>;
