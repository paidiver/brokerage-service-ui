'use client';

import { Button, Card, CardContent, Stack, Typography } from '@mui/material';

import { Submission } from 'src/models/submission';

interface SubmissionDetailsProps {
  submission: Submission;
  close: () => void;
}

export const SubmissionDetails = ({ submission, close }: SubmissionDetailsProps) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Submission details</Typography>
          <Typography variant="body2" color="text.secondary">
            {JSON.stringify(submission, null, 2)}
          </Typography>
          <Button variant="outlined" onClick={close} sx={{ alignSelf: 'flex-start' }}>
            Close
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
