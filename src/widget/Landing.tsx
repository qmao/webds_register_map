import React, { useEffect, useState } from 'react';

import { Canvas } from './mui_extensions/Canvas';
import { Content } from './mui_extensions/Content';
import { Controls } from './mui_extensions/Controls';

import { RegisterViewerContent } from './RegisterViewerContent';
import { EAction, RegisterViewerControl } from './RegisterViewerControl';
import { ReadRegisters, WriteRegisters, GetJson } from './backend_api';

interface IRegister {
    address: any;
    block: any;
    name: any;
    value: any;
    description: any;
    bits: any;
    modified: any;
}

export const Landing = (props: any): JSX.Element => {
    const [rowData, setRowData] = useState<IRegister[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [selected, setSelected] = useState<IRegister[]>([]);

    //const [selected, setSelected] = useState<IRegister[]>([]);
    const [currentRow, setCurrentRow] = useState<IRegister>({
        address: '',
        block: '',
        name: '',
        value: '',
        description: '',
        bits: '',
        modified: false
    });

    function resetFlag(data: any) {
        data.forEach(function (x: any) {
            x.modified = false;
        });
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
                register.value = 0;
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
        rd = rd.slice(0, 20);

        ReadRegisters(rd).then((data) => {
            if (data) {
                registerList.forEach((element: any, index: any) => {
                    element.value = data[index];
                });
                setRowData(registerList);
                setLoading(false);
            }
        });
    }

    function onRowClick(r: any) {
        setCurrentRow(r);
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

            setRowData(newData);
            setLoading(false);

            setCurrentRow(newRow);
        } else {
            alert('target not found');
        }
    }

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
        onRowClick(newRow);
    }

    function onAction(action: any) {
        let newData: any = [];
        let rd: any;
        let wd: any;
        setLoading(true);
        try {
            switch (action) {
                case EAction.ReadAll:
                    rd = rowData.map((d) => {
                        return d.address;
                    });
                    ReadRegisters(rd).then((data) => {
                        if (data) {
                            Object.assign(newData, rowData);
                            newData.forEach((element: any, index: any) => {
                                element.value = data[index];
                            });
                            resetFlag(newData);
                            setRowData(newData);
                            setLoading(false);
                        }
                    });

                    break;
                case EAction.WriteAll:
                    wd = rowData.map((d) => {
                        return { address: d.address, value: Number(d.value) };
                    });

                    WriteRegisters(wd).then((data) => {
                        if (data) {
                            Object.assign(newData, rowData);
                            newData.forEach((element: any, index: any) => {
                                element.value = data[index];
                            });
                            resetFlag(newData);
                            setRowData(newData);
                            setLoading(false);
                        }
                    });

                    break;
                case EAction.ReadRegister:
                    if (selected.length === 0) {
                        rd = [currentRow.address];
                    } else {
                        rd = selected;
                    }

                    ReadRegisters(rd).then((data) => {
                        if (data) {
                            Object.assign(newData, rowData);

                            rd.forEach((addr: any, index: any) => {
                                let find = newData.find((r: any) => {
                                    return r.address === addr;
                                });
                                find.value = data[index];
                                find.modified = false;
                                updateRow(find);
                            });

                            setRowData(newData);
                            setLoading(false);
                        }
                    });
                    break;
                case EAction.WriteRegister:
                    wd = [
                        { address: currentRow.address, value: Number(currentRow.value) }
                    ];

                    if (selected.length === 0) {
                        wd = [
                            { address: currentRow.address, value: Number(currentRow.value) }
                        ];
                    } else {
                        let rs: any = rowData.filter((row) => {
                            return selected.find((s) => row.address === s);
                        });

                        wd = rs.map((r: any) => {
                            return { address: r.address, value: Number(r.value) };
                        });
                    }

                    WriteRegisters(wd).then((data) => {
                        if (data) {
                            Object.assign(newData, rowData);
                            wd.forEach((w: any, index: any) => {
                                let find = newData.find((r: any) => {
                                    return r.address === w.address;
                                });
                                find.value = data[index];
                                find.modified = false;
                                updateRow(find);
                            });
                            setRowData(newData);
                            setLoading(false);
                        }
                    });

                    break;
            }
        } catch {
            alert('error');
            setLoading(false);
        }
    }

    useEffect(() => {
        GetJson().then((data) => {
            parseRegisterJson(JSON.parse(data));
        });
    }, []);

    return (
        <Canvas title="Register Map" sx={{ width: 1200 }}>
            <Content>
                <RegisterViewerContent
                    currentRow={currentRow}
                    rows={rowData}
                    onRowClick={onRowClick}
                    onRowSelect={onRowSelect}
                    onRowUpdate={onRowUpdate}
                    isLoading={isLoading}
                />
            </Content>
            <Controls
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <RegisterViewerControl onAction={onAction} />
            </Controls>
        </Canvas>
    );
};

export default Landing;
