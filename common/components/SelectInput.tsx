import { Select } from '@shopify/polaris';
import type { SettingsTypeSelect } from '../interfaces/feature-settings.interface'
import { useCallback, useState } from 'react';

export interface SelectProps {
  entry:  SettingsTypeSelect;
  onChange: (key: string, value?: string | number | string[]) => void;
  featureEnabled: boolean;
}


export default function SelectInput({ entry, onChange, featureEnabled }: SelectProps) {

  const [value, setValue] = useState(entry.value);
  const handleChange = useCallback(
    (newValue: string) =>{
      setValue(newValue)
    },
    []
  );
  return (
    <Select 
      disabled={!featureEnabled}
      label={<code>{entry.key}</code>}
      options={entry.selectOptions}
      value= {value}
      id={entry.key}
      key={entry.key}
      name={entry.key}
      onChange={(newValue) => {
        handleChange(newValue)
        onChange(entry.key, newValue)}}
    />
  )
}