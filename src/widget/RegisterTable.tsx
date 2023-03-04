import React, { useEffect, useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';

import {
    Box,
    Paper,
    InputBase,
    Stack,
    TablePagination,
    TableRow,
    TableHead,
    TableContainer,
    TableSortLabel,
    TableCell,
    TableBody,
    IconButton,
    Checkbox,
    Table,
    Typography,
    Input,
    tableCellClasses
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ShowExport } from './RegisterToolbar';

interface IProps {
    rows: any;
    onRowClick: any;
    onRowSelect: any;
    onRowUpdate: any;
    isLoading: any;
}

interface Data {
    address: number;
    name: string;
    block: string;
    value: number;
    description: string;
    bits: string;
    modified: string;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key
): (
        a: { [key in Key]: number | string },
        b: { [key in Key]: number | string }
    ) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort<T>(
    array: readonly T[],
    comparator: (a: T, b: T) => number
) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
    disablePadding: boolean;
    id: keyof Data;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'address',
        label: 'Address',
        numeric: false,
        disablePadding: true
    },
    {
        id: 'name',
        label: 'Name',
        numeric: false,
        disablePadding: true
    },
    {
        id: 'block',
        label: 'Block',
        numeric: false,
        disablePadding: true
    },
    {
        id: 'value',
        label: 'Value',
        numeric: false,
        disablePadding: true
    }
    /*,
    {
      id: 'description',
      label: 'Description',
      numeric: false,
      disablePadding: true
    },
    {
      id: 'bits',
      label: 'Bits',
      numeric: false,
      disablePadding: true
    },
    {
      id: 'modified',
      label: 'Modified',
      numeric: false,
      disablePadding: true
    }
    */
];

interface EnhancedTableProps {
    numSelected: number;
    onRequestSort: (
        event: React.MouseEvent<unknown>,
        property: keyof Data
    ) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const {
        onSelectAllClick,
        order,
        orderBy,
        numSelected,
        rowCount,
        onRequestSort
    } = props;
    const createSortHandler = (property: keyof Data) => (
        event: React.MouseEvent<unknown>
    ) => {
        onRequestSort(event, property);
    };

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            //backgroundColor: '#f5f5f5',
            height: 40,
            //color: theme.palette.common.black
            borderColor: theme.palette.common.black
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 30
        }
    }));

    return (
        <TableHead>
            <TableRow>
                <StyledTableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            'aria-label': 'select all desserts'
                        }}
                    />
                </StyledTableCell>
                {headCells.map((headCell) => (
                    <StyledTableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </StyledTableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

/*
interface EnhancedTableToolbarProps {
  numSelected: number;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            )
        })
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        ></Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}
*/

export const RegisterTable = (props: IProps): JSX.Element => {
    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Data>('address');
    const [selected, setSelected] = useState<readonly number[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [filterText, setFilterText] = useState('');
    const [displayList, setDisplayList] = useState([]);
    const [valueList, setValueList] = useState<string[]>([]);
    const myRef = useRef<any>(null);
    const [searchIndex, setSearchIndex] = useState(0);
    const [currentRow, setCurrentRow] = useState<Data | undefined>(undefined);

    useEffect(() => {
        scrollToIndex(searchIndex);
    }, [page]);

    const updateSelected = (s: any) => {
        props.onRowSelect(s);
        setSelected(s);
    };

    const scrollToIndex = (index: any) => {
        if (index !== 0) {
            const rowRef = myRef.current?.querySelector(`[data-index="${index}"]`);

            if (rowRef) {
                rowRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
                rowRef.click();
            }
            setSearchIndex(0);
        }
    };

    const toHex = (value: number) => {
        try {
            if (!isNaN(value)) {
                let h = ('00000000' + value.toString(16).toUpperCase()).slice(-8);
                return `0x${h}`;
            } else {
                return '';
            }
        } catch {
            console.log('EXCEPTION TO HEX:', value);
            return '';
        }
    };

    function updateDisplayList(l: any) {
        setValueList(
            l.map((r: any) => {
                return toHex(r.value);
            })
        );
        setDisplayList(l);

        if (currentRow !== undefined) {
            const obj = l.find((r: any) => {
                return r.address === currentRow.address;
            });
            let newData: any = {};
            Object.assign(newData, obj);
            props.onRowClick(newData);
        }
    }

    useEffect(() => {
        updateDisplayList(props.rows);
        filterList(filterText);
    }, [props.rows]);

    useEffect(() => { }, []);

    function applyFilter(wordToCompare: any) {
        return function (value: any) {
            return (
                value.name.indexOf(wordToCompare) >= 0 ||
                value.block.indexOf(wordToCompare) >= 0 ||
                JSON.stringify(value.bits).indexOf(wordToCompare) >= 0 ||
                (value.description !== undefined &&
                    value.description.indexOf(wordToCompare) >= 0)
            );
        };
    }

    const filterList = (value: any) => {
        let newRows = props.rows.filter(applyFilter(value));
        updateDisplayList(newRows);
    };

    const handleFilterChange = (event: any) => {
        const value = event.target.value;
        setFilterText(value);
        filterList(value);
    };

    const handleValueUpdate = (value: any, row: any) => {
        if (Number(value) === row.value || value === '') {
            //same value, no need update
            return;
        }
        if (!isNaN(Number(value))) {
            row.value = Number(value);
            props.onRowUpdate(row);
        } else {
            console.log('handleValueChange error');
        }
    };

    const handleValueKeyPress = (event: any, row: any) => {
        if (event.key === 'Enter') {
            console.log('handleValueKeyPress - Enter');
            const value = event.target.value;
            handleValueUpdate(value, row);
        }
    };

    const handleValueBlur = (event: any, row: any) => {
        console.log('handleValueBlur');
        const value = event.target.value;
        handleValueUpdate(value, row);
    };

    const handleValueChange = (event: any, index: any) => {
        const value = event.target.value;

        let newData: any = [];

        Object.assign(newData, valueList);
        newData[index] = value;
        setValueList(newData);

        console.log('handleValueChange', value, index);
    };

    const handleSearchKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            console.log('handleSearchKeyPress - Enter');
            let index = Number(event.target.value);
            searchForIndex(index);
        }
    };

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof Data
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = displayList.map((n: any) => n.address);
            updateSelected(newSelected);
            return;
        }
        updateSelected([]);
    };

    const handleFocus = (event: React.MouseEvent<unknown>, row: any) => {
        if (props.isLoading) {
            return;
        }
        setCurrentRow(row);
        props.onRowClick(row);
    };

    const handleClick = (event: React.MouseEvent<unknown>, address: any) => {
        const selectedIndex = selected.indexOf(address);
        let newSelected: readonly number[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, address);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        updateSelected(newSelected);
    };

    const handleOnFilterFocus = (event: any) => {
        console.log('ON FOCUS');
        setPage(0);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isSelected = (address: number) => selected.indexOf(address) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - displayList.length) : 0;

    const searchForIndex = (index: any) => {
        setSearchIndex(index);

        let rindex = displayList.findIndex((r: any) => r.address === index);
        if (rindex === -1) {
            return;
        }
        let rpage = Math.floor(rindex / rowsPerPage);

        if (rpage === page) {
            scrollToIndex(index);
        } else {
            setPage(rpage);
        }
    };

    const handleSearchChange = (event: any) => {
        console.log(Number(event.target.value));
        let index = Number(event.target.value);
        searchForIndex(index);
    };

    function getSearchInput() {
        return (
            <Stack
                direction="row"
                sx={{ width: 130, color: 'primary.main', border: 1, borderRadius: 5 }}
            >
                <IconButton
                    type="button"
                    sx={{ p: '1px', ml: 1, color: 'primary.main', fontSize: 10 }}
                    aria-label="search"
                //onClick={onSearchClick}
                >
                    <SearchIcon />
                </IconButton>
                <InputBase
                    disabled={props.isLoading}
                    sx={{ fontSize: 12, flex: 1, pl: 1 }}
                    placeholder="Address"
                    inputProps={{ 'aria-label': 'search address' }}
                    onBlur={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                />
            </Stack>
        );
    }

    function getFilterInput() {
        return (
            <Stack
                direction="row"
                sx={{ width: 150, color: 'primary.main', border: 1, borderRadius: 5 }}
            >
                <IconButton
                    type="button"
                    sx={{ p: '1px', ml: 1, color: 'primary.main', fontSize: 10 }}
                    aria-label="search"
                //onClick={onSearchClick}
                >
                    <FilterListIcon />
                </IconButton>
                <InputBase
                    disabled={props.isLoading}
                    sx={{ fontSize: 12, flex: 1, pl: 1 }}
                    placeholder="Filter"
                    inputProps={{ 'aria-label': 'search address' }}
                    onChange={handleFilterChange}
                    onBlur={handleFilterChange}
                    value={filterText}
                    onFocus={handleOnFilterFocus}
                />
            </Stack>
        );
    }

    ///const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    ///  setPage(value);
    ///};

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ height: 30 }}
                >
                    {selected.length > 0 ? (
                        <Typography color="inherit" sx={{ fontSize: 12 }}>
                            {selected.length} selected
                        </Typography>
                    ) : (
                            <Typography></Typography>
                        )}
                    <Stack direction="row" spacing={1}>
                        {ShowExport(displayList, valueList)}
                        {getFilterInput()}
                        {getSearchInput()}
                    </Stack>
                </Stack>
                <TableContainer sx={{ height: 340, overflowY: 'auto' }}>
                    <Table
                        ref={myRef}
                        stickyHeader
                        sx={{ width: 505 }}
                        aria-labelledby="tableTitle"
                        size={'small'}
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={displayList.length}
                        />
                        <TableBody>
                            {stableSort(displayList, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row: any, index: any) => {
                                    const isItemSelected = isSelected(row.address);
                                    const labelId = `enhanced-table-checkbox-${index}`;

                                    return (
                                        <TableRow
                                            sx={{
                                                '&.MuiTableRow-hover': {
                                                    '&:hover': {
                                                        backgroundColor: '#dfeff7'
                                                    }
                                                }
                                                /*,
                                                '&.Mui-selected': {
                                                  '&:hover': {
                                                    backgroundColor: '#dfe999'
                                                  }
                                                }
                                                */
                                            }}
                                            key={row.address}
                                            data-index={row.address}
                                            onClick={(event: any) => handleFocus(event, row)}
                                            hover
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            selected={isItemSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    disabled={props.isLoading}
                                                    onClick={(event: any) =>
                                                        handleClick(event, row.address)
                                                    }
                                                    color="primary"
                                                    checked={isItemSelected}
                                                    inputProps={{
                                                        'aria-labelledby': labelId
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    width: 90,
                                                    fontSize: 10,
                                                    p: 0
                                                }}
                                                align="left"
                                            >
                                                {toHex(row.address)}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontSize: 10,
                                                    p: 0
                                                }}
                                                component="th"
                                                id={labelId}
                                                scope="row"
                                                padding="none"
                                            >
                                                <Input
                                                    sx={{ fontSize: 10, width: 150 }}
                                                    defaultValue={row.name}
                                                    disableUnderline={true}
                                                />
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontSize: 10,
                                                    p: 0
                                                }}
                                                align="left"
                                            >
                                                {row.block}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    width: 90,
                                                    fontSize: 10,
                                                    p: 0,
                                                    '&:focus-within': {
                                                        border: 0.1,
                                                        borderColor: 'primary.main'
                                                    }
                                                }}
                                                align="left"
                                            >
                                                <Input
                                                    sx={{
                                                        fontSize: 10,
                                                        width: 90,
                                                        ...(row.modified > 0 && {
                                                            bgcolor: 'primary.light'
                                                        }),
                                                        px: 1
                                                    }}
                                                    disableUnderline
                                                    value={valueList[page * rowsPerPage + index]}
                                                    onChange={(e) => {
                                                        handleValueChange(e, page * rowsPerPage + index);
                                                    }}
                                                    onKeyPress={(e) => handleValueKeyPress(e, row)}
                                                    onBlur={(e) => handleValueBlur(e, row)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: 33 * emptyRows
                                    }}
                                >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    //sx={{ backgroundColor: '#f5f5f5' }}
                    rowsPerPageOptions={[]}
                    component="div"
                    count={displayList.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
};
