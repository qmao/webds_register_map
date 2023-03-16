import React, { useEffect, useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';

import {
    Box,
    Paper,
    Stack,
    TableRow,
    TableHead,
    TableContainer,
    TableSortLabel,
    TableCell,
    TableBody,
    Checkbox,
    Table,
    Typography,
    Input,
    tableCellClasses,
    Pagination
} from '@mui/material';

import MemoizePrimarySearchAppBar from './RegisterAppBar';

interface IProps {
    rows: any;
    onRowClick: any;
    onRowSelect: any;
    onRowUpdate: any;
    isLoading: any;
    onFilterClick: any;
    filter: any;
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

export const RegisterTable = (props: IProps): JSX.Element => {
    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Data>('address');
    const [selected, setSelected] = useState<readonly number[]>([]);
    const [page, setPage] = useState(0);

    const [displayList, setDisplayList] = useState([]);
    const [pageCount, setPageCount] = useState(1);

    const myRef = useRef<any>(null);
    const [searchIndex, setSearchIndex] = useState(-1);

    const [showValueInput, setShowValueInput] = useState(-1);
    const [pageData, setPageData] = useState<[][]>([]);

    const currentRow = useRef<Data | undefined>(undefined);
    const rowsPerPage = useRef(20);

    useEffect(() => {
        scrollToIndex(searchIndex);
    }, [page]);

    const updateSelected = (s: any) => {
        props.onRowSelect(s);
        setSelected(s);
    };

    const scrollToIndex = (index: any) => {
        if (index !== -1) {
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
        setDisplayList(l);

        if (currentRow.current !== undefined) {
            const obj = l.find((r: any) => {
                return r.address === currentRow.current!.address;
            });
            let newData: any = {};
            Object.assign(newData, obj);
            props.onRowClick(newData);
        }
    }

    useEffect(() => {
        console.log('setPage 2');
        setPage(0);
    }, []);

    /*
      const applyFilter___ = (wordToCompare: any) => {
        return function (value: any) {
          return (
            value.name.indexOf(wordToCompare) >= 0 ||
            value.block.indexOf(wordToCompare) >= 0 ||
            JSON.stringify(value.bits).indexOf(wordToCompare) >= 0 ||
            (value.description !== undefined &&
              value.description.indexOf(wordToCompare) >= 0)
          );
        };
      };
    */

    const applyFilter = () => {
        //props.filter
        return function (value: any) {
            if (props.filter === undefined) {
                return true;
            }
            let result: any = props.filter.filter((f: any) => {
                // f is per filter
                switch (f.type) {
                    case 'Block':
                        return value.block.indexOf(f.value) >= 0;
                    case 'Name':
                        return value.name.indexOf(f.value) >= 0;
                    case 'Description':
                        if (value.description === undefined) {
                            return false;
                        }
                        return value.description.indexOf(f.value) >= 0;
                    case 'Bits':
                        return value.bits.indexOf(f.value) >= 0;
                    case 'Modified':
                        return value.modified === true;
                    default:
                        return false;
                }
            });

            if (result.length === props.filter.length) {
                return true;
            }
            return false;
        };
    };

    const filterList = () => {
        if (props.rows !== undefined) {
            let newRows = props.rows.filter(applyFilter());
            updateDisplayList(newRows);
            if (props.rows.length !== newRows.length) {
                setPage(0);
                console.log('setPage 0');
            }
            console.log('APPLY FILTER');
        }
    };

    useEffect(() => {
        updateDisplayList(props.rows);
        filterList();
    }, [props.rows]);

    useEffect(() => {
        filterList();
    }, [props.filter]);

    useEffect(() => {
        updatePageData();
    }, [displayList]);

    useEffect(() => {
        updatePageData();
    }, [orderBy, order]);

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
            console.log('QQQQQ', 'enter');
            console.log('handleValueKeyPress - Enter');
            const value = event.target.value;
            handleValueUpdate(value, row);
            setShowValueInput(-1);
        }
    };

    const handleValueBlur = (event: any, row: any) => {
        console.log('handleValueBlur');
        const value = event.target.value;
        handleValueUpdate(value, row);
        setShowValueInput(-1);
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
        currentRow.current = row;
        props.onRowClick(row);
    };

    function updatePageData() {
        let totalPage = Math.ceil(displayList.length / rowsPerPage.current);
        setPageCount(totalPage);

        let data: any = [];
        data = Array.from(Array(totalPage).keys()).map((p: any) => {
            let pdata: any = stableSort(displayList, getComparator(order, orderBy))
                .slice(
                    p * rowsPerPage.current,
                    p * rowsPerPage.current + rowsPerPage.current
                )
                .map((row: any, index: any) => {
                    return row;
                });
            return pdata;
        });
        setPageData(data);
    }

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

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage - 1);
    };

    const isSelected = (address: number) => selected.indexOf(address) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0
            ? Math.max(0, (1 + page) * rowsPerPage.current - displayList.length)
            : 0;

    const searchForIndex = (index: any) => {
        setSearchIndex(index);

        //let rindex = displayList.findIndex((r: any) => r.address === index);
        let iindex: any = -1;
        let ipage = pageData.findIndex((p: any) => {
            iindex = p.findIndex((r: any) => r.address === index);
            return iindex !== -1;
        });

        if (iindex === -1) {
            alert('index not found');
            return;
        }

        if (ipage === page) {
            scrollToIndex(iindex);
        } else {
            console.log('setPage 3');
            setPage(ipage);
        }
        console.log('searchForIndex done:', iindex, page);
    };

    function showTablePage(row: any) {
        const isItemSelected = isSelected(row.address);
        const labelId = `enhanced-table-checkbox-${row.address}`;
        return (
            <TableRow
                /*
                        sx={{
                          '&.MuiTableRow-hover': {
                            '&:hover': {
                              backgroundColor: 'canvas'
                            }
                          }
                          ,
                              '&.Mui-selected': {
                                '&:hover': {
                                  backgroundColor: '#dfe999'
                                }
                              }  
                        }}
                        */
                key={`register-table-row-${row.address}`}
                data-index={row.address}
                onClick={(event: any) => handleFocus(event, row)}
                hover
                role="checkbox"
                aria-checked={isItemSelected}
                tabIndex={-1}
                selected={isItemSelected}
            >
                <TableCell
                    key={`register-table-cell-checkbox-${row.address}`}
                    padding="checkbox"
                >
                    <Checkbox
                        key={`register-table-checkbox-${row.address}`}
                        disabled={props.isLoading}
                        onClick={(event: any) => handleClick(event, row.address)}
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                            'aria-labelledby': labelId
                        }}
                    />
                </TableCell>
                <TableCell
                    key={`register-table-cell-address-${row.address}`}
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
                    key={`register-table-cell-name-${row.address}`}
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
                        key={`register-table-cell-name-input-${row.address}`}
                        sx={{ fontSize: 10, width: 150 }}
                        defaultValue={row.name}
                        disableUnderline={true}
                    />
                </TableCell>
                <TableCell
                    key={`register-table-cell-block-${row.address}`}
                    sx={{
                        fontSize: 10,
                        p: 0
                    }}
                    align="left"
                >
                    {row.block}
                </TableCell>
                <TableCell
                    key={`register-table-cell-value-${row.address}`}
                    sx={{
                        width: 90,
                        fontSize: 10,
                        p: 0,
                        '&:focus-within': {
                            /* */
                        },
                        ...(row.modified > 0 && {
                            bgcolor: 'custom.progress'
                        })
                    }}
                    align="left"
                >
                    {showValueInput === row.address && (
                        <Input
                            disabled={props.isLoading}
                            key={`register-table-cell-value-input-${row.address}`}
                            sx={{
                                fontSize: 10,
                                width: '100%',
                                input: { textAlign: 'center' }
                            }}
                            defaultValue={toHex(row.value)}
                            onKeyPress={(e) => handleValueKeyPress(e, row)}
                            onBlur={(e) => handleValueBlur(e, row)}
                        />
                    )}

                    <Input
                        disabled={props.isLoading}
                        key={`register-table-cell-value-input-default-${row.address}`}
                        sx={{
                            fontSize: 10,
                            width: '100%',
                            input: { textAlign: 'center' },
                            display: showValueInput === row.address ? 'none' : 'block'
                        }}
                        value={toHex(row.value)}
                        onClick={(e) => {
                            setShowValueInput(row.address);
                        }}
                    />
                </TableCell>
            </TableRow>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <MemoizePrimarySearchAppBar
                    onSearch={(address: any) => {
                        searchForIndex(Number(address));
                    }}
                    onFilterClick={() => {
                        props.onFilterClick();
                    }}
                    rows={displayList}
                    filtered={props.filter.length}
                    onRowUpdate={(row: any) => props.onRowUpdate(row)}
                />

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
                            {pageData.length !== 0 &&
                                pageData[page].map((p: any) => {
                                    return showTablePage(p);
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
                <Stack direction="row">
                    <Typography
                        color="inherit"
                        sx={{
                            fontSize: 12,
                            display: selected.length === 0 ? 'none' : 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {selected.length} selected
          </Typography>

                    <Box sx={{ flexGrow: 1 }} />
                    <Pagination
                        page={page + 1}
                        onChange={handleChangePage}
                        count={pageCount}
                    />
                </Stack>
            </Paper>
        </Box>
    );
};

export const MemoizeRegisterTable = React.memo(RegisterTable);
