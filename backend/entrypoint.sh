#!/bin/bash
set -e

# เพิ่ม .catch เพื่อลบ unhandled rejection และแสดง log ชัดเจน
node -e '
  import("/app/initadmin.js")
    .then(m => m.initadmin(process.env.ADMIN_USERNAME, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD, process.env.ADMIN_PHONE))
    .catch(err => { console.error("InitAdmin Error:", err); process.exit(1); })
'

exec npm start