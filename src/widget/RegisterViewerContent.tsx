import React from 'react';

import { Divider, Stack, Container } from '@mui/material';
import { RegisterData } from './RegisterData';
import { RegisterTable } from './RegisterTable';
import { RegisterProgress } from './RegisterProgress';

interface IProps {
    rows: any;
    currentRow: any;
    onRowClick: any;
    onRowSelect: any;
    onRowUpdate: any;
    isLoading: any;
    progress: any;
}

export const RegisterViewerContent = (props: IProps): JSX.Element => {
    function onRowClick(row: any) {
        props.onRowClick(row);
    }

    function onRowSelect(select: any) {
        props.onRowSelect(select);
    }

    function onRowUpdate(row: any) {
        props.onRowUpdate(row);
    }

    return (
        <Stack direction="row">
            <Container sx={{ width: '50%' }}>
                <RegisterTable
                    rows={props.rows}
                    onRowClick={onRowClick}
                    onRowSelect={onRowSelect}
                    onRowUpdate={onRowUpdate}
                    isLoading={props.isLoading}
                />
            </Container>
            <Divider orientation="vertical" sx={{ borderBottomWidth: 430 }} />
            <Container sx={{ width: '50%', height: 420, overflowY: 'auto' }}>
                {props.isLoading ? (
                    <RegisterProgress
                        progress={props.progress.current}
                        total={props.progress.total}
                    />
                ) : (
                        <RegisterData row={props.currentRow} />
                    )}
            </Container>
        </Stack>
    );
};
