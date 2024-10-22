import { BlockStack, Combobox, Listbox, Tag } from '@shopify/polaris';
import type {JsWebPosthogTypeListSettings } from "./interface/setting-row.interface"
import { useCallback, useState } from 'react';

export interface ListProps {
  entry: JsWebPosthogTypeListSettings;
  onChange: (key: string, value?: string | number | string[]) => void;
  featureEnabled: boolean;
}


export default function List({ entry, onChange, featureEnabled }: ListProps) {

  const [value, setValue] = useState('');
  const handleChange = useCallback(
    (newValue: string) =>{
      setValue(newValue)
    },
    []
  );
  return (
      <BlockStack gap="500">
      <Combobox
        allowMultiple
        activator={
          <Combobox.TextField
            autoComplete="off"
            label= "Add"
            labelHidden
            value= {value}
            id={entry.key}
            key={entry.key}
            name={entry.key}
            placeholder="Add tags"
            verticalContent={entry.value && entry.value.map((tag, index) => {
              return (
                <Tag key={`option-${tag}-${index}`}>
                  {tag}
                </Tag>
              )
            }) }
            onChange={(newValue)=>{handleChange(newValue)}}
            
          />
        }
      >
        { value && value != "" ?
        (
          <Listbox
            onSelect={(newValue)=>{
              onChange(entry.key,[...entry.value,newValue])
              handleChange("")
            }}
            onActiveOptionChange={()=>{}}  
          >
            <Listbox.Action  value={value}>{`Add "${value}"`}</Listbox.Action>

          </Listbox>
        ) : null
        }
        
      </Combobox>
      </BlockStack>
    )
}