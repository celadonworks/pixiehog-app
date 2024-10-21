import type { JsWebPosthogConfig } from "../../../../common/dto/js-web-settings.dto";

export interface JsWebPosthogSettingChoiceBase {
  key: keyof JsWebPosthogConfig;
  description: string; 
  filteredOut: boolean,
  type: string
}
export interface JsWebPosthogTypeSelectSettings extends JsWebPosthogSettingChoiceBase {
  type: 'Select';
  selectOptions: string[];
  value: string
}
export interface JsWebPosthogTypeNumberSettings extends JsWebPosthogSettingChoiceBase {
  type: 'Number';
  value: number
}
export interface JsWebPosthogTypeCheckboxSettings extends JsWebPosthogSettingChoiceBase {
  type: 'Checkbox';
  value: boolean;
}
export interface JsWebPosthogTypeTextSettings extends JsWebPosthogSettingChoiceBase {
  type: 'Text';
  value: string
}
export interface JsWebPosthogTypeListSettings extends JsWebPosthogSettingChoiceBase {
  type: 'List';
  value: string[]
}

export type JsWebPosthogSettingChoice = JsWebPosthogTypeSelectSettings | JsWebPosthogTypeCheckboxSettings | JsWebPosthogTypeNumberSettings | JsWebPosthogTypeTextSettings | JsWebPosthogTypeListSettings;