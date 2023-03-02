import React from 'react';

import {
  GridToolbarContainer,
  GridToolbarContainerProps,
  GridToolbarExportContainer,
  GridCsvExportMenuItem,
  GridCsvExportOptions,
  GridExportMenuItemProps,
  //GridToolbarColumnsButton,
  useGridApiContext,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector,
  GridApi,
  GridToolbarFilterButton
} from '@mui/x-data-grid';
import MenuItem from '@mui/material/MenuItem';
import { ButtonProps } from '@mui/material/Button';
import { Stack, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const fileName = 'PR3318382-register_map';
const getJson = (apiRef: React.MutableRefObject<GridApi>) => {
  // Select rows and columns
  const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
  const visibleColumnsField = gridVisibleColumnFieldsSelector(apiRef);

  // Format the data. Here we only keep the value
  const data = filteredSortedRowIds.map((id: any) => {
    const row: Record<string, any> = {};
    visibleColumnsField.forEach((field: any) => {
      row[field] = apiRef.current.getCellParams(id, field).value;
    });
    return row;
  });

  // Stringify with some indentation
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#parameters
  return JSON.stringify(data, null, 2);
};

const exportBlob = (blob: Blob, filename: string) => {
  // Save the blob in a json file
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  });
};

const JsonExportMenuItem = (props: GridExportMenuItemProps<{}>) => {
  const apiRef = useGridApiContext();

  const { hideMenu } = props;

  return (
    <MenuItem
      sx={{ fontSize: '14px' }}
      onClick={() => {
        const jsonString = getJson(apiRef);
        const blob = new Blob([jsonString], {
          type: 'text/json'
        });
        exportBlob(blob, fileName + '.json');

        // Hide the export menu after the export
        hideMenu?.();
      }}
    >
      Export JSON
    </MenuItem>
  );
};

const csvOptions: GridCsvExportOptions = {
  delimiter: ';',
  fileName: fileName
};

const CustomExportButton = (props: ButtonProps) => (
  <GridToolbarExportContainer {...props}>
    <GridCsvExportMenuItem sx={{ fontSize: '14px' }} options={csvOptions} />
    <JsonExportMenuItem />
  </GridToolbarExportContainer>
);

const onSearchClick = () => {
  console.log('on search');
};

export const CustomToolbar = (props: GridToolbarContainerProps) => (
  <GridToolbarContainer {...props}>
    <Stack direction={'row'} spacing={2}>
      <GridToolbarFilterButton variant="outlined" />
      <CustomExportButton variant="outlined" />
      <Stack
        direction="row"
        sx={{ color: 'primary.main', border: 1, borderRadius: 5 }}
      >
        <IconButton
          type="button"
          sx={{ p: '1px', ml: 1, color: 'primary.main', fontSize: 10 }}
          aria-label="search"
          onClick={onSearchClick}
        >
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ fontSize: 12, flex: 1 }}
          placeholder="Search Address"
          inputProps={{ 'aria-label': 'search address' }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            console.log(event.target.value);
            const id = Number(event.target.value);
            //const row = document.querySelector(`[data-id="${id}"]`);
            const row = document.querySelector(`[aria-rowindex="${100 + 1}"]`);

            console.log('RRRR', id, row);
            if (row !== null) {
              row.scrollIntoView();
            }
          }}
        />
      </Stack>
    </Stack>
  </GridToolbarContainer>
);

/*
export const CustomToolbar = (props: GridToolbarContainerProps) => (
  <GridToolbarContainer {...props}>
    <Stack direction={'row'} spacing={2}>
      <GridToolbarColumnsButton variant="outlined" />
      <GridToolbarFilterButton variant="outlined" />
      <CustomExportButton variant="outlined" />
    </Stack>
  </GridToolbarContainer>
);
*/
