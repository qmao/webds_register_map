import React from 'react';
import { Stack, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const exportBlob = (blob: Blob, filename: string) => {
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

export const ShowExport = (data: any, value: any) => {
    const fileName = 'RegisterMapExport';
    return (
        <Stack>
            <Button
                startIcon={<FileDownloadIcon />}
                variant="outlined"
                sx={{ fontSize: '14px' }}
                onClick={() => {
                    let newData: any = data.map((r: any, index: any) => {
                        try {
                            r['address'] = value[index].toString(16);
                            r['value'] = value[index];
                            r['bits'] = JSON.parse(r['bits']);
                        } catch { }
                        return r;
                    });
                    const jsonString = JSON.stringify(newData, null, 2);
                    const blob = new Blob([jsonString], {
                        type: 'text/json'
                    });
                    exportBlob(blob, fileName + '.json');
                }}
            >
                Export
      </Button>
        </Stack>
    );
};
