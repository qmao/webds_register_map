import React, { useEffect, useState, useRef } from 'react';

import { Canvas } from './mui_extensions/Canvas';
import { Content } from './mui_extensions/Content';
import { Controls } from './mui_extensions/Controls';

import { RegisterViewerContent } from './RegisterViewerContent';
import { EAction, RegisterViewerControl } from './RegisterViewerControl';
import {
    ReadRegisters,
    WriteRegisters,
    GetJson,
    TerminateSSE,
    CheckFWMode
} from './backend_api';
import { Alert, AlertColor, Snackbar } from '@mui/material';
//import { demo_data } from './demo_data';

const ELongTask = {
    Read: 0,
    Write: 1
};

interface IRegister {
    address: any;
    block: any;
    name: any;
    value: any;
    description: any;
    bits: any;
    modified: any;
}

interface IProgress {
    current: any;
    total: any;
}

export const Landing = (props: any): JSX.Element => {
    const [openAlert, setOpenAlert] = useState(false);
    const [alertType, setAlertType] = useState<AlertColor>('success');
    const [alertInfo, setAlertInfo] = useState('');
    const [rowData, setRowData] = useState<IRegister[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isPending, setPending] = useState(false);
    const [isInitDone, setInitDone] = useState(false);
    const [selected, setSelected] = useState<IRegister[]>([]);
    const [progress, setProgress] = useState<IProgress>({
        current: 0,
        total: 0
    });
    //const [selected, setSelected] = useState<IRegister[]>([]);

    const defaultList = useRef<IResponse[]>([]);
    const defaultRegisterValues = useRef([]);
    const sseResult = useRef<string[]>([]);
    const currentRow = useRef<IRegister | undefined>(undefined);

    interface IResponse {
        address: any;
        value: any;
    }

    // SSE START
    const eventSource = useRef<undefined | EventSource>(undefined);
    const eventError = useRef(false);
    const eventType = 'Register';
    const eventRoute = '/webds/register';
    const sseData = useRef<IResponse[]>([]);

    const removeEvent = () => {
        const SSE_CLOSED = 2;
        if (eventSource.current && eventSource.current!.readyState !== SSE_CLOSED) {
            eventSource.current!.removeEventListener(eventType, eventHandler, false);
            eventSource.current!.close();
            eventSource.current = undefined;
            console.log('SSE EVENT IS REMOVED');
        }
    };

    const updateToRow = (info: any) => {
        let rows: any = rowData;
        info.forEach((data: any) => {
            if (rowData.length === 0) {
                // during init, rowData not updated, use default list
                rows = defaultList.current;
            }
            let r = rows.find((i: any) => i.address === data.address);
            r!.value = data.value;
            r!.modified = false;
        });
        let newRows: any = [];
        Object.assign(newRows, rows);
        setRowData(newRows);
    };

    const eventHandler = (event: any) => {
        const data = JSON.parse(event.data);

        switch (data.status) {
            case 'run':
                sseData.current.push({ address: data.address, value: data.value });
                if (data.value === null) {
                    sseResult.current.push(data.address.toString(16));
                }
                if (data.index !== 0 && data.index % 50 === 0) {
                    setProgress({ current: data.index, total: data.total });
                    let info = sseData.current.splice(0, sseData.current.length);
                    updateToRow(info);
                }
                break;
            case 'done':
            case 'terminate':
                let info = sseData.current.splice(0, sseData.current.length);
                updateToRow(info);

                removeEvent();
                if (sseResult.current.length === 0) {
                    showMessage('success', data.status);
                } else {
                    showMessage('warning', sseResult.current.toString());
                }
                setLoading(false);
                break;
        }
    };

    const errorHandler = (error: any) => {
        eventError.current = true;
        removeEvent();
        console.error(`Error on GET ${eventRoute}\n${error}`);
    };

    const addEvent = () => {
        if (eventSource.current) {
            return;
        }
        eventError.current = false;
        eventSource.current = new window.EventSource(eventRoute);
        eventSource.current!.addEventListener(eventType, eventHandler, false);
        eventSource.current!.addEventListener('error', errorHandler, false);
    };
    // SSE END

    function showMessage(atype: any, info: any) {
        setAlertInfo(info);
        setAlertType(atype);
        setOpenAlert(true);
    }

    function startLongTask(task: any, data: any) {
        setLoading(true);
        sseResult.current = [];
        setProgress({ current: 0, total: data.length });

        // start sse event
        addEvent();

        switch (task) {
            case ELongTask.Read:
                ReadRegisters(data, true)
                    .then((ret) => {
                        console.log('STARTING SSE BACKEND READ', ret);
                        setPending(false);
                    })
                    .catch((e: any) => {
                        showMessage('error', e);
                        setPending(false);
                    });

                break;
            case ELongTask.Write:
                WriteRegisters(data, true)
                    .then((ret) => {
                        console.log('STARTING SSE BACKEND WRITE', ret);
                        setPending(false);
                    })
                    .catch((e: any) => {
                        showMessage('error', e);
                        setPending(false);
                    });
                break;
        }
    }

    function parseRegisterJson(data: any) {
        let registerList: IRegister[] = [];
        Object.keys(data).forEach(function (block) {
            console.log(block);
            Object.keys(data[block]['Register']).forEach(function (r) {
                let register: IRegister = {
                    address: undefined,
                    block: undefined,
                    name: undefined,
                    value: undefined,
                    description: undefined,
                    bits: undefined,
                    modified: false
                };
                let base_addr = Number(data[block]['Address']);
                register.address = base_addr + data[block]['Register'][r]['Offset'];
                register.block = block;
                register.name = r;
                register.value = undefined;
                register.description = data[block]['Register'][r]['Description'];
                register.bits = JSON.stringify(data[block]['Register'][r]['Bits']);

                registerList.push(register);
            });
        });

        // read and apply value
        let rd: any = registerList.map((d) => {
            return d.address;
        });
        // for testing purpose only read first page
        //rd = rd.slice(0, 20);

        sseData.current = [];
        defaultList.current = registerList;
        setRowData(registerList);

        return rd;
    }

    function onRowClick(r: any) {
        currentRow.current = r;
    }

    function onRowSelect(select: any) {
        setSelected(select);
    }

    function onRowUpdate(r: any) {
        let newData: any = [];
        Object.assign(newData, rowData);

        let target = newData.find((element: any) => {
            return element.address === r.address;
        });
        if (target) {
            target.address = r.address;
            target.name = r.name;
            target.modified = true;

            let newRow: any = [];
            Object.assign(newRow, target);
            currentRow.current = newRow;
            setRowData(newData);
            setLoading(false);
        } else {
            showMessage('error', 'target not found');
        }
    }

    /*
    function updateRow(r: any) {
      let newRow: any = {
        address: '',
        block: '',
        name: '',
        value: '',
        description: '',
        bits: '',
        modified: false
      };
      Object.assign(newRow, r);
      setCurrentRow(newRow);
    }
  */

    function onDataProccess(source: any, data: any) {
        let newData: any = [];
        let error: any = [];
        if (data) {
            Object.assign(newData, rowData);

            source.forEach((addr: any, index: any) => {
                let find = newData.find((r: any) => {
                    return r.address === addr;
                });
                if (data[index] === null) {
                    error.push('0x' + find.address.toString(16));
                }
                find.value = data[index];
                find.modified = false;
                currentRow.current = find;
            });
            setRowData(newData);
            if (error.length === 0) {
                showMessage('success', 'success');
            } else {
                showMessage('warning', error.toString());
            }
            setLoading(false);
        }
    }

    function onAction(action: any) {
        let rd: any = [];
        let wd: any = [];
        setPending(true);
        try {
            switch (action) {
                case EAction.ReadAll:
                    rd = rowData.map((d) => {
                        return d.address;
                    });
                    startLongTask(ELongTask.Read, rd);

                    break;
                case EAction.WriteAll:
                    wd = rowData.map((d) => {
                        return { address: d.address, value: Number(d.value) };
                    });

                    startLongTask(ELongTask.Write, wd);

                    break;
                case EAction.ReadRegister:
                    if (selected.length === 0) {
                        if (currentRow.current === undefined) {
                            showMessage('error', 'please select at least one register');
                            setPending(false);
                            setLoading(false);
                            return;
                        }
                        rd = [currentRow.current.address];
                    } else {
                        rd = selected;
                    }
                    setProgress({ current: 0, total: rd.length });
                    if (rd.length > 3) {
                        startLongTask(ELongTask.Read, rd);
                    } else {
                        ReadRegisters(rd, false)
                            .then((data) => {
                                onDataProccess(rd, data);
                                setPending(false);
                            })
                            .catch((e: any) => {
                                showMessage('error', e);
                                setPending(false);
                            });
                    }
                    break;
                case EAction.WriteRegister:
                    if (selected.length === 0) {
                        if (currentRow.current === undefined) {
                            showMessage('error', 'please select at least one register');
                            setPending(false);
                            setLoading(false);
                            return;
                        }

                        wd = [
                            {
                                address: currentRow.current.address,
                                value: Number(currentRow.current.value)
                            }
                        ];
                    } else {
                        let rs: any = rowData.filter((row) => {
                            return selected.find((s) => row.address === s);
                        });

                        wd = rs.map((r: any) => {
                            return { address: r.address, value: Number(r.value) };
                        });
                    }

                    setProgress({ current: 0, total: wd.length });

                    if (wd.length > 3) {
                        startLongTask(ELongTask.Write, wd);
                    } else {
                        WriteRegisters(wd, false)
                            .then((data) => {
                                let input = wd.map((w: any) => {
                                    return w.address;
                                });
                                onDataProccess(input, data);
                                setPending(false);
                            })
                            .catch((e: any) => {
                                showMessage('error', e);
                                setPending(false);
                            });
                    }
                    break;
                case EAction.Terminate:
                    TerminateSSE()
                        .then(() => {
                            setLoading(false);
                            setPending(false);
                        })
                        .catch((e: any) => {
                            setLoading(false);
                            setPending(false);
                        });
                    break;
            }
        } catch (e) {
            showMessage('error', e);
            setLoading(false);
        }
    }

    useEffect(() => {
        GetJson()
            .then((data) => {
                defaultRegisterValues.current = parseRegisterJson(JSON.parse(data));
                return CheckFWMode();
            })
            .then((mode: any) => {
                showMessage('success', mode);
                startLongTask(ELongTask.Read, defaultRegisterValues.current);
                setInitDone(true);
            })
            .catch((e: any) => {
                if (false) {
                    //DEBUG CODE START
                    /*
                    defaultRegisterValues.current = parseRegisterJson(demo_data);
                    defaultList.current.forEach((r: any) => {
                      r.value = r.address;
                    });
                    setRowData(defaultList.current);
                    */
                    //DEBUG CODE END
                }
                showMessage('error', e);
                setLoading(false);
                setInitDone(true);
            });
    }, []);

    const handleClose = (
        event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenAlert(false);
    };

    return (
        <Canvas title="Register Map" sx={{ width: 1200 }}>
            <Content>
                {isInitDone && (
                    <RegisterViewerContent
                        rows={rowData}
                        onRowSelect={onRowSelect}
                        onRowUpdate={onRowUpdate}
                        isLoading={isLoading}
                        progress={progress}
                        onRowClick={onRowClick}
                    />
                )}
            </Content>
            <Controls
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {isInitDone && (
                    <RegisterViewerControl
                        onAction={onAction}
                        isLoading={isLoading}
                        isPending={isPending}
                    />
                )}
            </Controls>
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={openAlert}
                autoHideDuration={3000}
                onClose={handleClose}
            >
                <Alert
                    onClose={handleClose}
                    severity={alertType}
                    sx={{ width: '100%' }}
                >
                    {alertInfo}
                </Alert>
            </Snackbar>
        </Canvas>
    );
};

export default Landing;
