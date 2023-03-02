import {
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector
} from '@mui/x-data-grid';

import React from 'react';

import Pagination from '@mui/material/Pagination';

export const CustomPagination = (): JSX.Element => {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <Pagination
      color="primary"
      count={pageCount}
      page={page + 1}
      onChange={(event: any, value: any) => apiRef.current.setPage(value - 1)}
    />
  );
};
