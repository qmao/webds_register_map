import React, { useState, useEffect } from 'react';
import {
  Stack,
  Typography,
  Divider,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
  TableContainer,
  Table,
  Paper,
  Input
} from '@mui/material';

interface iContent {
  name: string | undefined;
  description: string;
  current: string;
  bits: string;
}

interface IProps {
  row: any;
  onRowUpdate: any;
}

const AREA_HEIGHT_MIN = 70;
export const RegisterData = (props: IProps): JSX.Element => {
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState<iContent>({
    name: undefined,
    description: '',
    current: '',
    bits: ''
  });

  useEffect(() => {
    setContent({
      name: props.row.name,
      description: props.row.description,
      current: props.row.value,
      bits: props.row.bits ? props.row.bits : ''
    });
    console.log(props.row);
  }, [props.row]);

  useEffect(() => {
    setContent({
      name: undefined,
      description: '',
      current: '',
      bits: ''
    });
  }, []);

  function disaplyBlock(title: any, data: any) {
    return (
      <Stack spacing={1} sx={{ minHeight: AREA_HEIGHT_MIN }}>
        <Typography sx={{ fontWeight: 'bold', fontSize: 14 }}>
          {title}
        </Typography>
        <Typography
          sx={{ fontSize: 14, display: 'inline-block', whiteSpace: 'pre-line' }}
        >
          {' '}
          {data}
        </Typography>
      </Stack>
    );
  }

  function getBitRange(n: number, a: number, b: number): number {
    const bin = '00000000000000000000000000000000';

    const binN = n.toString(2).padStart(bin.length, '0');

    const bitRange = binN.substr(bin.length - b - 1, b - a + 1);

    return parseInt(bitRange, 2);
  }

  function disaplyBits() {
    let data: any = {};
    if (content.bits) {
      data = JSON.parse(content.bits);
    }
    function createData(
      name: string,
      position: string,
      rw: string,
      value: number
    ) {
      return { name, position, rw, value };
    }

    const rows: any = [];

    Object.keys(data).forEach(function (key) {
      let position: string = '';
      let value: any = -1;
      let pdata = data[key]['Position'];

      if (pdata.length === 1) {
        position = pdata[0];
        value = getBitRange(Number(content.current), pdata[0], pdata[0]);
      } else {
        position = pdata[0] + '-' + pdata[1];
        value = getBitRange(Number(content.current), pdata[0], pdata[1]);
      }

      if (content.current === undefined) {
        value = undefined;
      }
      let d = createData(key, position, data[key]['Type'], value);
      rows.push(d);
      //console.log(
      //  'Key : ' + data[key]['Position'].toString() + ', Value : ' + data[key]
      //);
    });

    function updateBitValue(position: string, value: any) {
      let start: any;
      let end: any;

      let splitted: any;
      try {
        splitted = position.split('-');
        start = splitted[0];
        end = splitted[1];
      } catch {
        start = Number(position);
        end = start;
      }

      const str_len = end - start + 1;
      const bin_pos = Number(value).toString(2).padStart(str_len, '0');
      let bin_value = Number(props.row.value).toString(2).padStart(32, '0');

      if (bin_pos.length > end - start + 1) {
        console.log('invalid value');
        return;
      }

      let bin_new =
        bin_value.substring(0, bin_value.length - end - 1) +
        bin_pos +
        bin_value.substring(bin_value.length - start);
      let r: any = {};
      Object.assign(r, props.row);
      r.value = parseInt(bin_new, 2);
      props.onRowUpdate(r);
    }

    function onEditDone(value: any, row: any) {
      updateBitValue(row.position, value);
      setEditMode(false);
    }

    const handleValueKeyPress = (event: any, row: any) => {
      if (event.key === 'Enter') {
        const value = event.target.value;
        onEditDone(value, row);
      }
    };

    return (
      <Stack sx={{ width: '100%' }}>
        <TableContainer component={Paper}>
          <Table size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }} align="left">
                  Bits
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Position
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Type
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Value
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: any) => (
                <TableRow
                  key={row.name}
                  sx={{
                    height: 24,

                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell
                    sx={{ fontSize: 10, py: 0, fontWeight: 'bold' }}
                    component="th"
                    scope="row"
                  >
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ fontSize: 10, py: 0 }} align="center">
                    {row.position}
                  </TableCell>
                  <TableCell sx={{ fontSize: 10, py: 0 }} align="center">
                    {row.rw}
                  </TableCell>
                  <TableCell sx={{ fontSize: 10, py: 0 }} align="center">
                    <Stack sx={{ display: editMode ? 'none' : 'flex' }}>
                      <Input
                        onClick={(e) => {
                          setEditMode(true);
                        }}
                        value={row.value}
                        sx={{
                          fontSize: 10,
                          py: 0,
                          height: 20,
                          width: 30
                        }}
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                      />
                    </Stack>
                    <Stack sx={{ display: editMode ? 'flex' : 'none' }}>
                      <Input
                        onKeyPress={(e) => handleValueKeyPress(e, row)}
                        onBlur={(e) => onEditDone(e.currentTarget.value, row)}
                        defaultValue={row.value}
                        sx={{
                          fontSize: 10,
                          py: 0,
                          height: 20,
                          width: 30
                        }}
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                      />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  }

  function disaplyCurrentBlock(data: any) {
    const w = 50;
    const f = 12;

    let bitArray = Number(data).toString(2);
    bitArray =
      '00000000000000000000000000000000'.substr(bitArray.length) + bitArray;
    let bit4Binary = bitArray.match(/.{1,4}/g) || [];

    let bit4Value = bit4Binary.map((v: any) => {
      return parseInt(v, 2).toString(16).toUpperCase();
    });

    return (
      <Stack sx={{ minHeight: AREA_HEIGHT_MIN }}>
        <Typography sx={{ fontWeight: 'bold', fontSize: 14, mb: 1 }}>
          Current Value
        </Typography>
        {data !== undefined && (
          <>
            <Stack direction="row" spacing={1}>
              <Typography sx={{ fontSize: f, width: w }}> Decimal </Typography>
              <Typography sx={{ fontSize: f, width: 30, textAlign: 'center' }}>
                {Number(data)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Typography sx={{ fontSize: f, width: w }}> Hex </Typography>
              <Stack direction="row" spacing={1}>
                {bit4Value.map((e: any, index: any) => (
                  <Stack key={`stack-hex-${index}`} direction="row" spacing={1}>
                    <Typography
                      key={`stack-hex-text-${index}`}
                      sx={{ fontSize: f, width: 30, textAlign: 'center' }}
                    >
                      {e}
                    </Typography>
                    <Divider
                      key={`stack-hex-divider-${index}`}
                      orientation="vertical"
                      flexItem
                    />
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <Divider flexItem />
            <Stack direction="row" spacing={1}>
              <Typography sx={{ fontSize: f, width: w }}> Binary </Typography>
              <Stack direction="row" spacing={1}>
                {bit4Binary.map((e: any, index: any) => (
                  <Stack
                    key={`stack-binary-${index}`}
                    direction="row"
                    spacing={1}
                  >
                    <Typography
                      key={`stack-text-${index}`}
                      sx={{ fontSize: f, width: 30, textAlign: 'center' }}
                    >
                      {e}
                    </Typography>
                    <Divider
                      key={`stack-divider-${index}`}
                      orientation="vertical"
                      flexItem
                    />
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </>
        )}
      </Stack>
    );
  }

  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{ width: '100%', hieght: '100%' }}
      spacing={4}
    >
      <Typography sx={{ fontWeight: 'bold', minHeight: 40 }}>
        {' '}
        {content.name}
      </Typography>
      {content.name !== undefined && (
        <Stack
          sx={{ width: '100%', hieght: '100%', p: 2 }}
          justifyContent="flex-start"
          alignItems="flex-start"
          spacing={4}
        >
          {disaplyBlock('Description', content.description)}
          {disaplyCurrentBlock(content.current)}
          {disaplyBits()}
        </Stack>
      )}
    </Stack>
  );
};
