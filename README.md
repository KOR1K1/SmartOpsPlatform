# SmartOps Platform

Full-stack platform: analytics, event system, knowledge hub.

## Stack
- Next.js 14+ (App Router)
- NestJS
- PostgreSQL + Prisma
- Tailwind CSS + shadcn/ui
- Docker + docker-compose

## Setup
1. Clone repo
2. Copy .env.example → .env
3. docker-compose up --build
4. Seed DB:
   - docker exec -it api npm run seed
5. Web: http://localhost:3000
6. API: http://localhost:4000

## Lighthouse
Performance: 90+  
SEO: 95+
