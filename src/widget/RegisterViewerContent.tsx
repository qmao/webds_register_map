import React, { useState } from 'react';

import { Divider, Stack, Container } from '@mui/material';
import { RegisterData } from './RegisterData';
import { MemoizeRegisterTable } from './RegisterTable';
import { RegisterProgress } from './RegisterProgress';
import { RegisterFilter } from './RegisterFilter';

interface IProps {
  rows: any;
  onRowSelect: any;
  onRowUpdate: any;
  isLoading: any;
  progress: any;
  onRowClick: any;
}

export const RegisterViewerContent = (props: IProps): JSX.Element => {
  const [isFilterPage, setFilterPage] = useState(false);
  const [currentRow, setCurrentRow] = useState({
    address: '',
    block: '',
    name: '',
    value: '',
    description: '',
    bits: '',
    modified: false
  });
  const [filter, setFilter] = useState([]);

  function onRowClick(row: any) {
    setCurrentRow(row);
    props.onRowClick(row);
  }

  function onRowSelect(select: any) {
    setFilterPage(false);
    props.onRowSelect(select);
  }

  function onRowUpdate(row: any) {
    props.onRowUpdate(row);
  }

  function onFilterClick() {
    setFilterPage(!isFilterPage);
  }

  function onFilterUpdate(filter: any) {
    setFilter(filter);
  }

  return (
    <Stack direction="row">
      <Container sx={{ width: '50%' }}>
        {true && (
          <MemoizeRegisterTable
            rows={props.rows}
            onRowClick={onRowClick}
            onRowSelect={onRowSelect}
            onRowUpdate={onRowUpdate}
            isLoading={props.isLoading}
            onFilterClick={onFilterClick}
            filter={filter}
          />
        )}
      </Container>
      <Divider orientation="vertical" sx={{ borderBottomWidth: 430 }} />
      <Container sx={{ width: '50%', height: 420, overflowY: 'auto' }}>
        <Stack sx={{ display: isFilterPage ? 'block' : 'none' }}>
          <RegisterFilter
            data={props.rows}
            onClose={() => {
              setFilterPage(false);
            }}
            onFilterUpdate={(filter: any) => onFilterUpdate(filter)}
          />
        </Stack>
        <Stack
          alignItems="center"
          sx={{
            height: '100%',
            display:
              !isFilterPage && props.isLoading && props.progress.total > 1
                ? 'block'
                : 'none'
          }}
        >
          <RegisterProgress
            progress={props.progress.current}
            total={props.progress.total}
          />
        </Stack>
        <Stack
          sx={{
            display: !isFilterPage && !props.isLoading ? 'block' : 'none'
          }}
        >
          <RegisterData row={currentRow} onRowUpdate={onRowUpdate} />
        </Stack>
      </Container>
    </Stack>
  );
};
