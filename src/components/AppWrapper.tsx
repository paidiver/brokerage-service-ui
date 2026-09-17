'use client';

import { BodcNavbar } from '@bodc/navbar';
import { Box, Container } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { ReactNode } from 'react';
import { theme } from 'src/theme';

export const AppWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <BodcNavbar
          content={
            <Box
              sx={{
                display: 'flex',
                marginTop: 'auto',
                marginBottom: 'auto',
                paddingRight: '15px',
                gap: '10px'
              }}
            />
          }
        />
        <Container component="main" id="app-container" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </ThemeProvider>
  );
};
