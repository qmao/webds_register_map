import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField } from '@mui/material';

export const FilterDataType = {
    address: 'Address',
    block: 'Block',
    name: 'Name',
    value: 'Value',
    description: 'Description',
    bits: 'Bits'
};

export interface IData {
    address: any;
    block: string;
    name: any;
    value: any;
    description: any;
    bits: any;
}

interface IProps {
    data: any;
    type: any;
    input: any;
    onUpdate: any;
}

export const AutoCompleteFilter = (props: IProps) => {
    const [data, setData] = useState([]);

    function onUpdate(value: any) {
        props.onUpdate(props.type, value);
    }

    useEffect(() => {
        console.log('TYPE', props.type);
        let l: string[] = props.data.map((r: any) => {
            switch (props.type) {
                case FilterDataType.name:
                    return r.name;
                case FilterDataType.block:
                    return r.block;
                case FilterDataType.value:
                    return r.value;
                case FilterDataType.address:
                    return r.address;
                case FilterDataType.description:
                    if (r.description === undefined) return 'undefined';
                    return r.description;
                case FilterDataType.bits:
                    return r.bits;
                default:
                    return undefined;
            }
        });

        let arr: any = l.filter(function (item, pos) {
            return l.indexOf(item) === pos;
        });
        setData(arr);
    }, [props.data]);

    return (
        <Autocomplete
            key={`autocomplete-${props.type}`}
            freeSolo
            options={data}
            inputValue={props.input}
            onInputChange={(event, newInputValue) => {
                onUpdate(newInputValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    fullWidth
                    label={props.type}
                    variant="outlined"
                    size="small"
                />
            )}
        />
    );
};
