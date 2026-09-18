import 'maplibre-gl/dist/maplibre-gl.css';
import '../globals.css';

import type { Metadata } from 'next';
import Script from 'next/script';
import React, { Suspense } from 'react';
import { AppWrapper } from 'src/components/AppWrapper';

export const metadata: Metadata = {
  title: 'Brokerage Service'
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Suspense>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css"
            integrity="sha512-SzlrxWUlpfuzQ+pcUCosxcglQRNAq/DZjVsC0lE40xsADsfeQoEypE+enwcOiGjk/bSuGGKHEyjSoQ1zVisanQ=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </Suspense>
      </head>
      <body>
        <Script src={`${basePath}/runtime-config.js`} strategy="beforeInteractive" />
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
