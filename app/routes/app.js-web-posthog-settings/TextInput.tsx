import { TextField } from '@shopify/polaris';
import type {JsWebPosthogTypeTextSettings, JsWebPosthogTypeNumberSettings } from "./interface/setting-row.interface"
import { useCallback, useState } from 'react';

export interface TextFieldProps {
  entry: JsWebPosthogTypeTextSettings | JsWebPosthogTypeNumberSettings;
  onChange: (key: string, value?: string | number | string[]) => void;
  featureEnabled: boolean;
  type: "number" | "text"
}


export default function TextInput({ entry, onChange, featureEnabled , type}: TextFieldProps) {

  const [value, setValue] = useState(entry.value as string);
  const handleChange = useCallback(
    (newValue: string) =>{
      setValue(newValue)
    },
    []
  );
  return (
    <TextField
      disabled={!featureEnabled}
      label={<code>{entry.key}</code>}
      value={value}
      id={entry.key}
      key={entry.key}
      name={entry.key}
      autoComplete="off"
      min={0}
      type= {type}
      onChange={(newValue) => {
        handleChange(newValue)
        if(entry.type === "Number"){
          onChange(entry.key, Number(newValue))
          return
        }
        onChange(entry.key, newValue)
      }}
    />
    )
}