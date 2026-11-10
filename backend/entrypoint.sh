#!/bin/bash
set -e

node -e 'import("/app/initadmin.js").then(m => m.initadmin(process.env.ADMIN_USERNAME, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD, process.env.ADMIN_PHONE))'

exec npm start