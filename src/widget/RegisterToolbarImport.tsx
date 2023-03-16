import React, { useState, useRef } from 'react';
import {
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  DialogContentText,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Stack,
  Divider
} from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

interface IProps {
  data: any;
  open: any;
  onClose: any;
  onRowUpdate: any;
}

export const RenderMenuImport = (props: IProps) => {
  const [fileName, setFileName] = useState('webds_register_map');
  const [openDialog, setOpenDialog] = useState(false);
  const modifiedInfo = useRef([]);

  const menuId = 'primary-import-menu';

  function displayDialog() {
    return (
      <div>
        <Dialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
          }}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">
            {modifiedInfo.current.length
              ? 'Updated Register(s)'
              : 'No Update Register'}
          </DialogTitle>
          <DialogContent>
            {modifiedInfo.current.map((r: any) => {
              return (
                <Stack key={`import-stack-root-${r.address}`}>
                  <Divider key={`import-divider-${r.address}`} />
                  <Stack
                    direction="row"
                    spacing={5}
                    key={`import-stack-sub-${r.address}`}
                  >
                    <DialogContentText
                      key={`import-dialog-content-${r.address}`}
                    >
                      {r.address}
                    </DialogContentText>
                    <Stack
                      direction="row"
                      spacing={1}
                      key={`import-stack-sub-sub-${r.address}`}
                    >
                      <DialogContentText
                        key={`import-dialog-content-old-${r.address}`}
                      >
                        {r.old} {`->`}
                      </DialogContentText>
                      <DialogContentText
                        sx={{ color: 'primary.main' }}
                        key={`import-dialog-content-new-${r.address}`}
                      >
                        {r.new}
                      </DialogContentText>
                    </Stack>
                  </Stack>
                </Stack>
              );
            })}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={(e: any) => {
                setOpenDialog(false);
              }}
              autoFocus
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  const handleFileUpload = (e: any) => {
    if (!e.target.files) {
      return;
    }
    const file = e.target.files[0];
    if (file === undefined) {
      props.onClose();
      return;
    }
    const { name } = file;
    setFileName(name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (!evt?.target?.result) {
        props.onClose();
        return;
      }
      let { result }: any = evt.target;

      try {
        let map: any = JSON.parse(result as string);
        let modified: any = [];

        map.forEach((reg: any) => {
          let r: any = props.data.find(
            (element: any) => element.address === Number(reg.address)
          );

          if (r === undefined) {
            console.log('[LOAD ERROR]:', reg.address);
          }
          if (reg.value === '') {
            //modified = false;
          } else {
            let v = Number(reg.value);
            if (r.value !== v) {
              modified.push({
                address: reg.address,
                old:
                  r.value === undefined
                    ? 'undefined'
                    : '0x' + r.value.toString(16).padStart(8, '0'),
                new: '0x' + v.toString(16).padStart(8, '0')
              });

              let new_reg: any = {};
              Object.assign(new_reg, r);
              new_reg.value = v;
              new_reg.modified = true;

              props.onRowUpdate(new_reg);
            }
          }
        });
        console.log('MODIFIED', modified);
        modifiedInfo.current = modified;
        setOpenDialog(true);
      } catch (e) {
        console.log('ERROR', e.toString());
        alert('Invalid File:' + fileName);
      }
      props.onClose();
    };
    reader.readAsBinaryString(file);
    console.log('File Info', file);
  };

  return (
    <>
      <Menu
        anchorEl={props.open}
        id={menuId}
        keepMounted
        onClose={() => {
          props.onClose();
        }}
        open={props.open !== null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <MenuItem component="label">
          <ListItemIcon>
            <ContentPasteIcon fontSize="small" />
          </ListItemIcon>
          <Typography sx={{ fontSize: 14 }}>Select File</Typography>
          <input
            type="file"
            accept=".json"
            hidden
            onChange={handleFileUpload}
            onClick={(event: any) => {
              event.target.value = null;
            }}
          />
        </MenuItem>
      </Menu>
      {displayDialog()}
    </>
  );
};
