import React, { useState } from 'react';
import { Stack, Button, Box } from '@mui/material';
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
  FilterDataType.bits
];

export const RegisterFilter = (props: IProps) => {
  const [filterValue, setFilterValue] = useState(FILTERS.map((f) => ''));

  function updateFilter(type: any, value: any) {
    let newArray = filterValue.map((m: any) => m);
    newArray[FILTERS.findIndex((f) => f === type)] = value;
    setFilterValue(newArray);
  }

  return (
    <Stack sx={{ p: 2 }} spacing={2}>
      {FILTERS.map((type: any, index: any) => {
        return (
          <AutoCompleteFilter
            key={`filter-${index}`}
            data={props.data}
            type={type}
            input={filterValue[index]}
            onUpdate={(t: any, v: any) => updateFilter(t, v)}
          />
        );
      })}
      <Box sx={{ flexGrow: 1 }} />
      <Stack direction="row" spacing={5} justifyContent="flex-end">
        <Button
          sx={{ width: 100 }}
          onClick={() => {
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
