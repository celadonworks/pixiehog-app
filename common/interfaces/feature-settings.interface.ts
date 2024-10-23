export enum SettingType {
  Select = 'Select',
  Number = 'Number',
  Checkbox = 'Checkbox',
  Text = 'Text',
  List = 'List'
}
export interface SettingsBase {
  key: KeyType;
  description: string; 
  filteredOut: boolean,
  type: SettingType
}
export interface SettingsTypeSelect extends SettingsBase {
  type: SettingType.Select;
  selectOptions: string[];
  value: string
}
export interface SettingsTypeNumber extends SettingsBase {
  type: SettingType.Number;
  value: number
}
export interface SettingsTypeCheckbox extends SettingsBase {
  type: SettingType.Checkbox;
  value: boolean;
}
export interface SettingsTypeText extends SettingsBase{
  type: SettingType.Text;
  value: string
}
export interface SettingsTypeList extends SettingsBase {
  type: SettingType.List;
  value: string[]
}

export type Settings = SettingsTypeSelect | SettingsTypeNumber | SettingsTypeCheckbox | SettingsTypeText | SettingsTypeList;