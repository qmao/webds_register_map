import React, { useEffect, useState } from 'react';

import { Canvas } from './mui_extensions/Canvas';
import { Content } from './mui_extensions/Content';
import { Controls } from './mui_extensions/Controls';

import { RegisterViewerContent } from './RegisterViewerContent';
import { EAction, RegisterViewerControl } from './RegisterViewerControl';
import { ReadRegisters, WriteRegisters, GetJson } from './backend_api';

interface IRegister {
  id: any;
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

  //const [selected, setSelected] = useState<IRegister[]>([]);
  const [currentRow, setCurrentRow] = useState<IRegister>({
    id: '',
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
          id: undefined,
          block: undefined,
          name: undefined,
          value: undefined,
          description: undefined,
          bits: undefined,
          modified: false
        };
        let base_addr = Number(data[block]['Address']);
        register.id = base_addr + data[block]['Register'][r]['Offset'];
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
      return d.id;
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
    //setSelected(select);
    console.log(select);
  }

  function updateRow(r: any) {
    let newRow: any = {
      id: '',
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
            return d.id;
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
            return { address: d.id, value: Number(d.value) };
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
          //fixme
          //r = rowData.find((element: any) => element.id === currentRow.id);
          //currentRow.value = r.value;

          rd = [currentRow.id];
          ReadRegisters(rd).then((data) => {
            console.log('READ DONE', currentRow, data);
            currentRow.value = data![0];
            currentRow.modified = false;
            updateRow(currentRow);
            setLoading(false);
            //Object.assign(newData, rowData);
            //setRowData(newData);
          });
          break;
        case EAction.WriteRegister:
          //fixme
          //r = rowData.find((element: any) => element.id === currentRow.id);
          //r.value = currentRow.value;
          wd = [{ address: currentRow.id, value: Number(currentRow.value) }];
          WriteRegisters(wd).then((data) => {
            console.log('WRITE DONE', currentRow);
            currentRow.value = data![0];
            currentRow.modified = false;
            updateRow(currentRow);
            setLoading(false);
            //Object.assign(newData, rowData);
            //setRowData(newData);
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
