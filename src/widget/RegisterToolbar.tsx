import React, { useState } from 'react';
import {
  Stack,
  Menu,
  MenuItem,
  TextField,
  ListItemIcon,
  Typography
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

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

function exportBlobAsCsv(filename: any, JSONData: any, ShowLabel: any) {
  //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
  var arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;
  var CSV = '';
  //This condition will generate the Label/Header
  if (ShowLabel) {
    var row = '';

    //This loop will extract the label from 1st index of on array
    for (var index in arrData[0]) {
      //Now convert each value to string and comma-seprated
      row += index + ',';
    }
    row = row.slice(0, -1);
    //append Label row with line break
    CSV += row + '\r\n';
  }

  //1st loop is to extract each row
  for (var i = 0; i < arrData.length; i++) {
    row = '';
    //2nd loop will extract each column and convert it in string comma-seprated
    for (var index1 in arrData[i]) {
      row += '"' + arrData[i][index1] + '",';
    }
    row.slice(0, row.length - 1);
    //add a line break after each row
    CSV += row + '\r\n';
  }

  if (CSV === '') {
    alert('Invalid data');
    return;
  }

  //this trick will generate a temp "a" tag
  var link = document.createElement('a');
  link.id = 'lnkDwnldLnk';

  //this part will append the anchor tag and remove it after automatic click
  document.body.appendChild(link);

  var csv = CSV;
  let blob = new Blob([csv], { type: 'text/csv' });

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  });
}

const exportBlobAsJson = (blob: Blob, filename: string) => {
  // Save the blob in a json file
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  });
};

interface IProps {
  data: any;
  open: any;
  onClose: any;
}

export const RenderMenu = (props: IProps) => {
  const [fileName, setFileName] = useState('webds_register_map');

  const FileFormat = {
    CSV: 1,
    JSON: 2
  };

  const menuId = 'primary-export-menu';
  const handleMenuClose = (format: any) => {
    let newData: any = [];
    switch (format) {
      case FileFormat.JSON:
        newData = props.data.map((r: any) => {
          let newRow: any = {};
          Object.assign(newRow, r);
          try {
            newRow['address'] = toHex(r['address']);
            newRow['value'] = toHex(r['value']);
            newRow['bits'] = JSON.parse(r['bits']);
            delete newRow['modified'];
          } catch {}
          return newRow;
        });
        const jsonString = JSON.stringify(newData, null, 2);
        const blob = new Blob([jsonString], {
          type: 'text/json'
        });
        exportBlobAsJson(blob, fileName + '.json');
        break;
      case FileFormat.CSV:
        newData = props.data.map((r: any) => {
          let newRow: any = {};
          Object.assign(newRow, r);
          try {
            newRow['address'] = toHex(r['address']);
            newRow['value'] = toHex(r['value']);
            let re = /,/gi;
            newRow['bits'] = r['bits'].replace(re, '...');
            delete newRow['modified'];
          } catch {}
          return newRow;
        });
        exportBlobAsCsv(fileName + '.csv', newData, true);
        break;
    }
    props.onClose();
  };

  return (
    <Menu
      anchorEl={props.open}
      id={menuId}
      keepMounted
      open={props.open !== null}
      onClose={handleMenuClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
    >
      <Stack alignItems="center">
        <TextField
          label="File Name"
          id="filled-size-small"
          value={fileName}
          variant="standard"
          size="small"
          sx={{ fontSize: 12, mx: 2, my: 1, width: 220 }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFileName(event.target.value);
          }}
        />
      </Stack>
      <MenuItem
        onClick={() => {
          handleMenuClose(FileFormat.CSV);
        }}
      >
        <ListItemIcon>
          <FileDownloadIcon fontSize="small" />
        </ListItemIcon>
        <Typography sx={{ fontSize: 14 }}>To CSV</Typography>
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleMenuClose(FileFormat.JSON);
        }}
      >
        <ListItemIcon>
          <FileDownloadIcon fontSize="small" />
        </ListItemIcon>
        <Typography sx={{ fontSize: 14 }}>To JSON</Typography>
      </MenuItem>
    </Menu>
  );
};
