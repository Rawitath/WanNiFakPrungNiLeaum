#!/bin/sh
set -e

# เพิ่ม .catch เพื่อลบ unhandled rejection และแสดง log ชัดเจน
node -e '
  import("/app/initadmin.js")
    .then(m => {
        return m.initadmin(
            process.env.ADMIN_USERNAME, 
            process.env.ADMIN_EMAIL, 
            process.env.ADMIN_PASSWORD, 
            process.env.ADMIN_PHONE
        );
    })
    .then(() => {
        console.log("InitAdmin completed successfully.");
        process.exit(0); // สำคัญมาก! บังคับจบ process เมื่อสำเร็จ
    })
    .catch(err => { 
        console.error("InitAdmin Error:", err); 
        process.exit(0); // จบ process ด้วย 0 เพื่อให้ container รันต่อได้แม้เจอ error
    })
'

exec npm start