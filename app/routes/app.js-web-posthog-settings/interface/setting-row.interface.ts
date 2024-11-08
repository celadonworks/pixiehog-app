import type { JsWebPosthogConfig } from '../../../../common/dto/js-web-settings.dto';
import type { Settings } from '../../../../common/interfaces/feature-settings.interface';
export type JsWebPosthogSettingChoice = Settings<keyof JsWebPosthogConfig>;
