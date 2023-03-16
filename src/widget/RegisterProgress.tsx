import React, { useEffect, useState } from 'react';
import { Stack, LinearProgress, Typography } from '@mui/material';

interface IProps {
  progress: any;
  total: any;
}

export const RegisterProgress = (props: IProps): JSX.Element => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress((props.progress * 100) / props.total);
  }, [props.progress, props.total]);

  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{ width: '100%', height: '100%' }}
      spacing={1}
    >
      <LinearProgress
        sx={{ width: '100%' }}
        variant="determinate"
        value={progress}
      />
      {props.total === 0 ? (
        <Typography sx={{ fontSize: 12 }}>Loading...</Typography>
      ) : (
        <Typography sx={{ fontSize: 12 }}>
          {props.progress} / {props.total}
        </Typography>
      )}
    </Stack>
  );
};
