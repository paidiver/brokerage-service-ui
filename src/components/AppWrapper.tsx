'use client';

import { BodcNavbar } from '@bodc/navbar';
import { Box, Container } from '@mui/material';
import { createTheme,ThemeProvider } from '@mui/material/styles';
import { ReactNode } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00b5ff'
    },
    secondary: {
      main: '#6c757d'
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif'
  }
});

export const AppWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <BodcNavbar
          content={
            <div
              style={{
                display: 'flex',
                marginTop: 'auto',
                marginBottom: 'auto',
                paddingRight: '15px',
                gap: '10px'
              }}
            >
            </div>
          }
        />
        <Container component="main" id="app-container" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </ThemeProvider>
  );
};
