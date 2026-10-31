FROM node:24-alpine3.24 AS builder

WORKDIR /app

# ติดตั้ง dependencies ที่จำเป็นสำหรับ Alpine (ถ้ามี native build)
RUN apk add --no-cache libstdc++

# ก๊อปปี้ไฟล์ package เพื่อลง dependencies ก่อน (เพื่อใช้ Docker Cache)
COPY my-app/package*.json ./

# ใช้ npm install หรือ yarn install / pnpm install ตามที่คุณใช้
RUN npm ci

# ก๊อปปี้ไฟล์ทั้งหมดในโปรเจกต์
COPY my-app/ .

RUN npm test --if-present

RUN npx expo export --platform web --output-dir dist

FROM node:24-alpine3.24 AS runtime
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist .
RUN npm prune --omit=dev
# เปิด พอร์ตสำหรับ Expo Web (8081 หรือ 19006 แล้วแต่เวอร์ชัน)
EXPOSE 8081

# กำหนดให้ Listening บนทุก Network Interface (0.0.0.0)
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# สั่งรัน Expo Web
CMD ["npx", "serve", "-p", "8081"]