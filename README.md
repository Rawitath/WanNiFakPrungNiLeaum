# วันนี้ฝาก พรุ่งนี้ลืม
## วิธีการเปิดใช้งาน
### แบบ Development
การเปิด
``` bash
docker compose --profile dev up -d
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
การปิด
``` bash
docker compose --profile prod down
```