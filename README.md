# วันนี้ฝาก พรุ่งนี้ลืม
## วิธีการเปิดใช้งาน
### แบบ Development
การเปิด
``` bash
docker compose --profile dev up -d
```
การเปิด (กรณีลง package เพิ่มหรือจะ build image ใหม่)
``` bash
docker compose --profile dev up -d --build
```
การปิด
``` bash
docker compose --profile dev down
```
### แบบ Production
การเปิด
``` bash
docker compose --profile prod up -d
```
การเปิด (กรณี build image ใหม่)
``` bash
docker compose --profile prod up -d --build
```
การปิด
``` bash
docker compose --profile prod down
```
