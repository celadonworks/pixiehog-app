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

  const removeTag = useCallback(
    (tag: string) => () => {
      if(entry?.value?.length){   
        onChange(entry.key, entry.value.filter((entryTag)=> entryTag != tag))
      }  
    },
    [onChange,entry],
  );
  return (
      <BlockStack gap="500">
      <Combobox
        allowMultiple
        activator={
          <Combobox.TextField
            autoComplete="off"
            label= {entry.key}
            value= {value}
            id={entry.key}
            key={entry.key}
            name={entry.key}
            placeholder={"Add " + entry.key}
            verticalContent={entry.value && entry.value.map((tag, index) => {
              return (
                <Tag 
                  key={`option-${tag}-${index}`}
                  onRemove={removeTag(tag)}
                  >
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