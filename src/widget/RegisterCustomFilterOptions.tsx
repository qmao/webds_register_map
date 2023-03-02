import React, { useState, useEffect } from 'react';

import {
  //InputAdornment,
  TextField
} from '@mui/material';
import {
  GridFilterInputValueProps,
  GridFilterItem,
  GridFilterOperator
} from '@mui/x-data-grid';

function AddressInputValue(props: GridFilterInputValueProps) {
  const [value, setValue] = useState();
  const { item, applyValue, focusElementRef } = props;

  const addressRef: React.Ref<any> = React.useRef(null);
  React.useImperativeHandle(focusElementRef, () => ({
    focus: () => {
      console.log('QQQQQQQ', item);
      //addressRef.current
      //  .querySelector(`input[value="${Number(item.value) || ''}"]`)
      //  .focus();
    }
  }));

  useEffect(() => {
    if (props.item.value !== undefined) {
      let v = props.item.value.toString(16);
      setValue(v);
    }
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    applyValue({ ...item, value: newValue });
  };

  return (
    <TextField
      {...props}
      label="Address"
      id="standard-start-adornment"
      sx={{ ml: 1, m: 0, width: '25ch' }}
      //InputProps={{
      //  startAdornment: <InputAdornment position="start">0x</InputAdornment>
      //}}
      value={value}
      variant="standard"
      onChange={handleChange}
      ref={addressRef}
    />
  );
}

export const addressFilterOperators: GridFilterOperator[] = [
  {
    label: '>',
    value: '>',
    getApplyFilterFn: (filterItem: GridFilterItem) => {
      if (
        !filterItem.columnField ||
        !filterItem.value ||
        !filterItem.operatorValue
      ) {
        return null;
      }

      return (params: any): boolean => {
        return Number(params.value) > Number(filterItem.value);
      };
    },
    InputComponent: AddressInputValue,
    getValueAsString: (value: number) => `> ${value}`
  },
  {
    label: '=',
    value: '=',
    getApplyFilterFn: (filterItem: GridFilterItem) => {
      if (
        !filterItem.columnField ||
        !filterItem.value ||
        !filterItem.operatorValue
      ) {
        return null;
      }

      return (params: any): boolean => {
        return Number(params.value) === Number(filterItem.value);
      };
    },
    InputComponent: AddressInputValue,
    getValueAsString: (value: number) => `= ${value}`
  },
  {
    label: '<',
    value: '<',
    getApplyFilterFn: (filterItem: GridFilterItem) => {
      if (
        !filterItem.columnField ||
        !filterItem.value ||
        !filterItem.operatorValue
      ) {
        return null;
      }

      return (params: any): boolean => {
        return Number(params.value) < Number(filterItem.value);
      };
    },
    InputComponent: AddressInputValue,
    getValueAsString: (value: number) => `< ${value}`
  }
];
