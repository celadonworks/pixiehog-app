export enum SettingType {
  Select = 'Select',
  Number = 'Number',
  Checkbox = 'Checkbox',
  Text = 'Text',
  List = 'List',
}
export interface SettingsBase<T = string> {
  key: T;
  description: string;
  filteredOut: boolean;
  type: SettingType;
}
export interface SettingsTypeSelect<T = string> extends SettingsBase<T> {
  type: SettingType.Select;
  selectOptions: string[];
  value: string;
}
export interface SettingsTypeNumber<T = string> extends SettingsBase<T> {
  type: SettingType.Number;
  value: number;
}
export interface SettingsTypeCheckbox<T = string> extends SettingsBase<T> {
  type: SettingType.Checkbox;
  value: boolean;
}
export interface SettingsTypeText<T = string> extends SettingsBase<T> {
  type: SettingType.Text;
  value: string;
}
export interface SettingsTypeList<T = string> extends SettingsBase<T> {
  type: SettingType.List;
  value: string[];
}

export type Settings<T = string> =
  | SettingsTypeSelect<T>
  | SettingsTypeNumber<T>
  | SettingsTypeCheckbox<T>
  | SettingsTypeText<T>
  | SettingsTypeList<T>;
