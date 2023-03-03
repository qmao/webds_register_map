import React, { useEffect, useState } from 'react';
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
            //backgroundColor: theme.palette.common.black,
            //color: theme.palette.common.white,
            //borderColor: theme.palette.common.grey,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 20
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
    const [rows, setRows] = useState(props.rows);
    const [searchText, setSearchText] = useState('');
    const [displayList, setDisplayList] = useState([]);
    const [valueList, setValueList] = useState<string[]>([]);

    useEffect(() => {
        props.onRowSelect(selected);
    }, [selected]);

    useEffect(() => {
        if (searchText === '') {
            setDisplayList(props.rows);
        }
    }, [searchText]);

    const toHex = (value: number) => {
        if (!isNaN(value)) {
            let h = ('00000000' + value.toString(16).toUpperCase()).slice(-8);
            return `0x${h}`;
        } else {
            return '';
        }
    };

    useEffect(() => {
        setValueList(
            displayList.map((r: any) => {
                return toHex(r.value);
            })
        );
    }, [displayList]);

    useEffect(() => {
        setRows(props.rows);
        setDisplayList(props.rows);
        setSearchText('');

        setValueList(
            props.rows.map((r: any) => {
                return toHex(r.value);
            })
        );
    }, [props.rows]);

    useEffect(() => { }, []);

    function isAddressOverThan(value: any) {
        return (
            value.name.indexOf(searchText) >= 0 ||
            value.block.indexOf(searchText) >= 0 ||
            JSON.stringify(value.bits).indexOf(searchText) >= 0
        );
    }

    const filterList = (searchText: any) => {
        let newRows = rows.filter(isAddressOverThan);
        setDisplayList(newRows);
    };

    const handleFilterChange = (event: any) => {
        const value = event.target.value;
        setSearchText(value);
        filterList(value);
    };

    const handleValueUpdate = (value: any, row: any) => {
        if (Number(value) === row.value) {
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
            const newSelected = rows.map((n: any) => n.address);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleFocus = (event: React.MouseEvent<unknown>, address: any) => {
        const obj = displayList.find((r: any) => {
            return r.address === address;
        });

        props.onRowClick(obj);
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

        setSelected(newSelected);
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

    function getSearchInput() {
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
                    <SearchIcon />
                </IconButton>
                <InputBase
                    sx={{ fontSize: 12, flex: 1 }}
                    placeholder="Search Address"
                    inputProps={{ 'aria-label': 'search address' }}
                    onChange={handleFilterChange}
                    value={searchText}
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
                    {getSearchInput()}
                </Stack>
                <TableContainer sx={{ height: 400, overflowY: 'auto' }}>
                    <Table
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
                                            onClick={(event: any) => handleFocus(event, row.address)}
                                            hover
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={row.name}
                                            selected={isItemSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
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
                                                    p: 0
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
                                                    defaultValue={toHex(row.value)}
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
