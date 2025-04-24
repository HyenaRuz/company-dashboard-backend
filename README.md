# 📊 Company Dashboard API

Backend for a company management app built with [NestJS](https://nestjs.com/), [Prisma ORM](https://www.prisma.io/), and [PostgreSQL](https://www.postgresql.org/).

---

## 🚀 Tech Stack

- **NestJS** — Node.js framework for scalable backend applications  
- **Prisma** — modern ORM for database access  
- **PostgreSQL** — relational database  
- **Docker** — containerization for consistent setup  
- **JWT** — authentication using access/refresh tokens  

---

## 📦 Installation

```bash
npm install
```

---

## ⚙️ Run Commands

### 🧪 Development

```bash
npm run start:dev
npx prisma db seed
```

### 🛠 Production

```bash
npm run start:prod
```

---

## 🐳 Docker

### 🔧 Build and run

```bash
docker-compose up --build
```

### 📦 Migrations and seeding inside container

```bash
docker exec -it company-dashboard-api npx prisma migrate deploy
docker exec -it company-dashboard-api npx prisma db seed
```

---

## 🧪 Testing

```bash
npm run test
npm run test:e2e
npm run test:cov
```

---

## 🗂 Static files

All uploaded images (avatars, logos) are saved to:

```
uploads/
├── avatars/
└── logo/
```

Make sure this volume is mounted in `docker-compose.yml`:

```yaml
volumes:
  - ./uploads:/usr/src/app/uploads
```

---

## 📄 Environment Variables

Create a `.env` file based on `.env.example`. Example:

```env
DATABASE_URL=postgresql://user:password@postgres:5432/db_name
PORT=3000
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

---

## ✨ Author

Developed by Novruz Babaiev  
🌐 [babaiev-novruz.com](https://babaiev-novruz.com)

---

---