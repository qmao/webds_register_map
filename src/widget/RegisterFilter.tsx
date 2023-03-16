import React, { useState } from 'react';
import {
  Stack,
  Button,
  Box,
  FormGroup,
  FormControlLabel,
  Switch
} from '@mui/material';
import { AutoCompleteFilter, FilterDataType } from './RegisterAutoComplete';

interface IProps {
  data: any;
  onClose?: any;
  onFilterUpdate: any;
}

const FILTERS = [
  FilterDataType.block,
  FilterDataType.name,
  FilterDataType.description,
  FilterDataType.bits,
  FilterDataType.modified
];

export const RegisterFilter = (props: IProps) => {
  const [checked, setChecked] = React.useState(false);
  const [filterValue, setFilterValue] = useState(FILTERS.map((f) => ''));

  function updateFilter(type: any, value: any) {
    let newArray = filterValue.map((m: any) => m);
    newArray[FILTERS.findIndex((f) => f === type)] = value;

    setFilterValue(newArray);
  }

  function handleModifyChange(event: any) {
    let c: any = event.target.checked;
    setChecked(c);
    if (c) {
      updateFilter('Modified', c);
    } else {
      updateFilter('Modified', '');
    }
  }

  return (
    <Stack sx={{ p: 2 }} spacing={2}>
      {FILTERS.map((type: any, index: any) => {
        return (
          <>
            {type === FilterDataType.modified ? (
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch checked={checked} onChange={handleModifyChange} />
                  }
                  label="Modified Value"
                />
              </FormGroup>
            ) : (
              <AutoCompleteFilter
                key={`filter-${index}`}
                data={props.data}
                type={type}
                input={filterValue[index]}
                onUpdate={(t: any, v: any) => updateFilter(t, v)}
              />
            )}
          </>
        );
      })}
      <Box sx={{ flexGrow: 1 }} />
      <Stack direction="row" spacing={5} justifyContent="flex-end">
        <Button
          sx={{ width: 100 }}
          onClick={() => {
            setChecked(false);
            setFilterValue(FILTERS.map((f: any) => ''));
            props.onFilterUpdate([]);
          }}
        >
          Reset
        </Button>
        <Button
          sx={{ width: 100 }}
          onClick={() => {
            let newFilter: any = [];
            filterValue.forEach((f: any, index: any) => {
              if (f !== '') {
                newFilter.push({ type: FILTERS[index], value: f });
              }
            });
            props.onFilterUpdate(newFilter);
            props.onClose();
          }}
        >
          {' '}
          Apply{' '}
        </Button>
      </Stack>
    </Stack>
  );
};
