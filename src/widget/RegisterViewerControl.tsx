import React from 'react';

import { styled } from '@mui/material/styles';
import { Button, Stack } from '@mui/material';

interface IProps {
  onAction: any;
}

export const RegisterButton = styled(Button)((props) => ({
  width: 140,
  borderRadius: 6
}));

export const EAction = {
  ReadRegister: 0,
  WriteRegister: 1,
  ReadAll: 2,
  WriteAll: 3
};

export const RegisterViewerControl = (props: IProps): JSX.Element => {
  const writeRegister = () => {
    console.log('Write Register');
    props.onAction(EAction.WriteRegister);
  };

  const writeAll = () => {
    console.log('Write All');
    props.onAction(EAction.WriteAll);
  };

  const readRegister = () => {
    console.log('Read Register');
    props.onAction(EAction.ReadRegister);
  };

  const readAll = () => {
    console.log('Read All');
    props.onAction(EAction.ReadAll);
  };

  return (
    <Stack direction="row" spacing={3}>
      <RegisterButton onClick={readRegister}>Read Register</RegisterButton>
      <RegisterButton onClick={writeRegister}>Write Register</RegisterButton>
      <RegisterButton onClick={readAll}>Read All</RegisterButton>
      <RegisterButton onClick={writeAll}>Write All</RegisterButton>
    </Stack>
  );
};