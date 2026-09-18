#!/bin/sh
set -eu

node -e '
  const fs = require("node:fs");
  const config = {
    brokerageServiceApiUrl: process.env.NEXT_PUBLIC_BROKERAGE_SERVICE_API
  };
  fs.writeFileSync(
    "/app/public/runtime-config.js",
    `window.__BROKERAGE_SERVICE_CONFIG__ = ${JSON.stringify(config)};\n`
  );
'

exec node server.js

