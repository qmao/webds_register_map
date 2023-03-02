import React from 'react';

import { Box } from '@mui/material';
import { CustomPagination } from './RegisterPagination';

import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridCellParams,
  GridFilterModel
} from '@mui/x-data-grid';

import { CustomToolbar } from './RegisterToolbar';
/*
function getFullName(params: any) {
  return `${params.row.value.toString(16)}`;
}
*/

import { addressFilterOperators } from './RegisterCustomFilterOptions';

const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'Address',
    width: 120,
    //type: 'address',
    headerAlign: 'center',
    align: 'center',
    valueFormatter: ({ id }: any) => {
      let value = ('00000000' + id.toString(16).toUpperCase()).slice(-8);
      return `0x${value}`;
    },
    filterOperators: addressFilterOperators
  },
  {
    field: 'name',
    headerName: 'Name',
    width: 250,
    editable: true,
    headerAlign: 'center',
    align: 'center'
  },
  {
    field: 'block',
    headerName: 'Block',
    hide: true,
    editable: false,
    headerAlign: 'center',
    align: 'center'
  },
  {
    field: 'value',
    headerName: 'Value',
    width: 110,
    editable: true,
    headerAlign: 'center',
    align: 'center',
    valueFormatter: ({ value }: any) => {
      if (value == null || isNaN(Number(value))) {
        return '';
      }

      let v = ('00000000' + Number(value).toString(16).toUpperCase()).slice(-8);
      return `0x${v}`;
    },
    cellClassName: (params: GridCellParams<number>) => {
      if (params.row.modified) {
        return 'register-viewer-modified';
      } else {
        return '';
      }
    } /*,
    //// preProcessEditCellProps check may cause mising input
    preProcessEditCellProps: (params) => {
      const n = Number(params.props.value);
      const hasError = isNaN(n);
      return { ...params.props, error: hasError };
    }*/
  },
  {
    field: 'description',
    headerName: 'Description',
    hide: true,
    disableColumnMenu: true
  },
  {
    field: 'bits',
    headerName: 'Bits',
    hide: true
  },
  {
    field: 'modified',
    headerName: 'Modified',
    hide: true
  }
];

/*
function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <Stack direction={'row'} spacing={2}>
        <GridToolbarFilterButton variant="outlined" />
        <GridToolbarExport variant="outlined" />
      </Stack>
    </GridToolbarContainer>
  );
}


function MyCheckbox(props: any) {
  return (
    <Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }} {...props} />
  );
}
*/

interface IProps {
  rows: any;
  onRowClick: any;
  onRowSelect: any;
  isLoading: any;
}

export const RegisterGrid = (props: IProps): JSX.Element => {
  const gridRef = React.useRef(null);

  const processRowUpdate = (newRow: any, oldRow: any) => {
    // check if value is in range here
    const updatedRow = { ...newRow, isNew: false };
    console.log('[NEW]', newRow);
    console.log('[OLD]', oldRow);
    let valueUpdated = false;
    if (Number(newRow.value) !== Number(oldRow.value)) {
      valueUpdated = true;
    }

    updatedRow.modified = valueUpdated;
    props.onRowClick(updatedRow);
    //handle send data to api
    return updatedRow;
  };

  const handleRowClick: GridEventListener<'rowClick'> = (params: any) => {
    props.onRowClick(params.row);
  };

  const onRowsSelectionHandler = (ids: any) => {
    console.log('QQQQQQ SELECT');
    const selectedRowsData = ids.map((id: any) =>
      props.rows.find((row: any) => row.id === id)
    );
    props.onRowSelect(selectedRowsData);
  };

  const onFilterChange = React.useCallback((filterModel: GridFilterModel) => {
    // Here you save the data you need from the filter model
    // console.log('QQQQQ1', apiRef.current.getVisibleColumns);
  }, []);

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        '& .register-viewer-modified': {
          backgroundColor: 'rgba(157, 255, 118, 0.49)',
          color: '#1a3e72',
          fontWeight: '600'
        },
        '& .register-viewer-committed': {
          backgroundColor: 'rgba(157, 255, 118, 0.49)',
          color: '#777777',
          fontWeight: '600'
        }
      }}
    >
      <DataGrid
        ref={gridRef}
        sx={{
          fontSize: 10,
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#ebf5fa',
            color: 'primary.light'
          },
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
            width: '1.2em'
          },
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track': {
            background: '#f1f1f1'
          },
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
            backgroundColor: '#888'
          },
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover': {
            background: '#555'
          }
        }}
        components={{
          Toolbar: CustomToolbar,
          Pagination: CustomPagination
          //BaseCheckbox: MyCheckbox
        }}
        rows={props.rows}
        columns={columns}
        rowHeight={20}
        //autoPageSize={true}
        pageSize={100}
        //checkboxSelection
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
        disableColumnMenu
        experimentalFeatures={{ newEditingApi: true }}
        processRowUpdate={processRowUpdate}
        onRowClick={handleRowClick}
        onSelectionModelChange={(ids: any) => onRowsSelectionHandler(ids)}
        onFilterModelChange={(m: any) => onFilterChange(m)}
        loading={props.isLoading}
      />
    </Box>
  );
};
