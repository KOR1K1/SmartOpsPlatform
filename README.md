<div align="center">

https://github.com/user-attachments/assets/0c66003b-9b89-4692-9738-eed591458495

# 🚀 SmartOps Platform

**Enterprise-grade full-stack platform for operational analytics, event management, and knowledge management**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/KOR1K1/SmartOpsPlatform)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.1-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

**📊 Performance:** Lighthouse 90+ | **🔍 SEO:** 95+ | **♿ Accessibility:** WCAG 2.1 AA

---

**🌐 Language / Язык:** [English](#-smartops-platform) | [Русский](#-smartops-платформа)

---

</div>

---

## 📖 Table of Contents / Содержание

<details>
<summary><b>English</b></summary>

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [Project Structure](#-project-structure)
- [Performance Metrics](#-performance-metrics)
- [Learning Outcomes](#-learning-outcomes)

</details>

<details>
<summary><b>Русский</b></summary>

- [Обзор](#-обзор)
- [Возможности](#-возможности)
- [Технологический стек](#-технологический-стек)
- [Быстрый старт](#-быстрый-старт)
- [Настройка окружения](#-настройка-окружения)
- [Структура проекта](#-структура-проекта)
- [Метрики производительности](#-метрики-производительности)
- [Результаты обучения](#-результаты-обучения)

</details>

---

# 🇬🇧 SmartOps Platform

## 🎯 Overview

**SmartOps Platform** is a production-ready, enterprise-grade full-stack web application designed for operational analytics, event management, and knowledge base management.

### What It Does

- **📊 Analytics Dashboard**: Metrics, KPIs, and interactive charts for operational insights
- **📡 Event Management**: Event tracking and monitoring with filtering and search
- **📚 Knowledge Hub**: Document management system with version control and text search
- **🔐 Authentication**: JWT-based auth with Role-Based Access Control (Admin, Manager, User)

### Key Highlights

- **Server Components First**: Next.js App Router with Server Components for optimal performance
- **Type Safety**: Full TypeScript with strict mode across frontend and backend
- **Performance Optimized**: Lighthouse 90+, Core Web Vitals optimized
- **SEO Ready**: Dynamic metadata, sitemaps, and semantic HTML
- **Docker Ready**: One-command setup with Docker Compose

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-Based Access Control (RBAC): Admin, Manager, User
- Protected routes with middleware
- Secure session management

### 📊 Analytics Dashboard
- Metrics and KPIs with ISR (refreshed every 10 seconds)
- Interactive charts (Recharts)
- Task status distribution
- Recent events table

### 📡 Event System
- Task events tracking
- System events monitoring
- Event filtering and search
- Time-based event grouping

### 📚 Knowledge Hub
- Document management system
- Category organization
- Version control for documents
- Text search across titles and content

### 🎯 Performance & SEO
- Server Components for reduced bundle size
- Incremental Static Regeneration (ISR)
- Image optimization (WebP, AVIF)
- Dynamic metadata generation
- XML sitemap and robots.txt

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1** - React framework with App Router
- **TypeScript 5.9+** - Type safety
- **Tailwind CSS 4.x** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Recharts** - Data visualization
- **React Hook Form + Zod** - Form management and validation

### Backend
- **NestJS 11.1+** - Enterprise Node.js framework
- **Prisma 7.2+** - Type-safe ORM
- **PostgreSQL 16** - Relational database
- **JWT + Passport.js** - Authentication

### DevOps
- **Docker & Docker Compose** - Containerization and orchestration

---

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose**
- **Git**

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/KOR1K1/SmartOpsPlatform.git
cd SmartOpsPlatform

# 2. Create environment file
cp .env.docker.example .env

# 3. (Optional) Update JWT secrets in .env for production
# Default values work for development

# 4. Start all services
docker compose up --build

# 5. Access the application
# Web: http://localhost:3000
# API: http://localhost:4000
```

**That's it!** The database will be automatically initialized with:
- Schema migrations
- Initial roles (Admin, Manager, User)
- Seed data (100+ users, 5k+ tasks, 30k+ events, 100+ documents)

---

## ⚙️ Environment Setup

### Docker Environment (`.env`)

Create `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://smartops:smartops_password@postgres:5432/smartops?schema=public

# API Configuration
PORT=4000
NODE_ENV=production
FRONTEND_URL=http://web:3000

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Web Application Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### API Environment (`apps/api/.env`)

For local development without Docker:

```env
# Database
DATABASE_URL="postgresql://smartops:smartops_password@localhost:5432/smartops?schema=public"

# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d
```

### Web Environment (`apps/web/.env`)

For local development without Docker:

```env
# API URL
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Internal API URL (for Server Components in Docker)
API_URL="http://api:4000"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Environment
NODE_ENV=development
```

---

## 📁 Project Structure

```
SmartOpsPlatform/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/                # App Router pages
│   │   │   ├── (auth)/        # Auth route group
│   │   │   ├── dashboard/     # Analytics dashboard
│   │   │   ├── events/        # Event feed
│   │   │   ├── knowledge/     # Knowledge hub
│   │   │   ├── profile/       # User profile
│   │   │   └── layout.tsx     # Root layout
│   │   ├── components/        # React components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── charts/        # Chart components
│   │   │   ├── tables/        # Table components
│   │   │   └── ...            # Feature components
│   │   ├── lib/               # Utilities
│   │   ├── contexts/          # React contexts
│   │   └── middleware.ts      # Route protection
│   │
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── auth/          # Authentication module
│       │   ├── users/         # User management
│       │   ├── analytics/     # Analytics endpoints
│       │   ├── events/        # Event management
│       │   ├── knowledge/     # Knowledge base API
│       │   ├── tasks/         # Task management
│       │   ├── websocket/     # WebSocket gateway (backend only, not connected to frontend)
│       │   └── prisma/        # Prisma service
│       └── prisma/
│           ├── schema.prisma  # Database schema
│           └── seed.ts         # Seed script
│
├── docker-compose.yml          # Docker orchestration
└── README.md                   # This file
```

---

## 📊 Performance Metrics

### Lighthouse Scores (Target)
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+

### Core Web Vitals (Target)
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTFB** (Time to First Byte): < 200ms

### Bundle Size Optimization
- **Initial JS**: < 200KB (gzipped)
- **Code splitting**: Vendor chunks separated
- **Tree shaking**: Unused code eliminated
- **Image optimization**: WebP/AVIF formats

---

## 🎓 Learning Outcomes

This project demonstrates:

✅ **Full-stack development** with modern frameworks  
✅ **Type safety** with TypeScript strict mode  
✅ **Performance optimization** targeting Core Web Vitals  
✅ **SEO best practices** with dynamic metadata  
✅ **Security** with JWT, RBAC, and security headers  
✅ **Containerization** with Docker  
✅ **Database design** with Prisma and PostgreSQL  
✅ **Accessibility** with WCAG 2.1 compliance  
✅ **Developer experience** with clean architecture  

---

## 📝 License

This project is part of a portfolio and is available for review and learning purposes.

---

<div align="center">

**Built with ❤️ using Next.js, NestJS, and modern web technologies**

[⬆ Back to Top](#-smartops-platform)

</div>

---

# 🇷🇺 SmartOps Платформа

## 🎯 Обзор

**SmartOps Platform** — это готовое к продакшену, enterprise-уровня full-stack веб-приложение для операционной аналитики, управления событиями и управления базой знаний.

### Что это делает

- **📊 Аналитическая панель**: Метрики, KPI и интерактивные графики для операционных инсайтов
- **📡 Управление событиями**: Отслеживание и мониторинг событий с фильтрацией и поиском
- **📚 Хаб знаний**: Система управления документами с контролем версий и текстовым поиском
- **🔐 Аутентификация**: JWT-аутентификация с контролем доступа на основе ролей (Admin, Manager, User)

### Ключевые особенности

- **Server Components First**: Next.js App Router с Server Components для оптимальной производительности
- **Типобезопасность**: Полный TypeScript со строгим режимом на фронтенде и бэкенде
- **Оптимизация производительности**: Lighthouse 90+, оптимизация Core Web Vitals
- **SEO готовность**: Динамические метаданные, карты сайта и семантический HTML
- **Docker готовность**: Настройка одной командой с Docker Compose

---

## ✨ Возможности

### 🔐 Аутентификация и авторизация
- JWT-аутентификация с refresh-токенами
- Контроль доступа на основе ролей (RBAC): Admin, Manager, User
- Защищенные маршруты с middleware
- Безопасное управление сессиями

### 📊 Аналитическая панель
- Метрики и KPI с ISR (обновление каждые 10 секунд)
- Интерактивные графики (Recharts)
- Распределение статусов задач
- Таблица последних событий

### 📡 Система событий
- Отслеживание событий задач
- Мониторинг системных событий
- Фильтрация и поиск событий
- Группировка событий по времени

### 📚 Хаб знаний
- Система управления документами
- Организация по категориям
- Контроль версий документов
- Текстовый поиск по заголовкам и содержимому

### 🎯 Производительность и SEO
- Server Components для уменьшения размера бандла
- Incremental Static Regeneration (ISR)
- Оптимизация изображений (WebP, AVIF)
- Динамическая генерация метаданных
- XML sitemap и robots.txt

---

## 🛠️ Технологический стек

### Frontend
- **Next.js 16.1** - React-фреймворк с App Router
- **TypeScript 5.9+** - Типобезопасность
- **Tailwind CSS 4.x** - Utility-first стилизация
- **shadcn/ui** - Библиотека доступных компонентов
- **Recharts** - Визуализация данных
- **React Hook Form + Zod** - Управление формами и валидация

### Backend
- **NestJS 11.1+** - Enterprise Node.js-фреймворк
- **Prisma 7.2+** - Типобезопасный ORM
- **PostgreSQL 16** - Реляционная база данных
- **JWT + Passport.js** - Аутентификация

### DevOps
- **Docker & Docker Compose** - Контейнеризация и оркестрация

---

## 🚀 Быстрый старт

### Требования

- **Docker** и **Docker Compose**
- **Git**

### Настройка

```bash
# 1. Клонировать репозиторий
git clone https://github.com/KOR1K1/SmartOpsPlatform.git
cd SmartOpsPlatform

# 2. Создать файл окружения
cp .env.docker.example .env

# 3. (Опционально) Обновить JWT-секреты в .env для продакшена
# Значения по умолчанию работают для разработки

# 4. Запустить все сервисы
docker compose up --build

# 5. Открыть приложение
# Web: http://localhost:3000
# API: http://localhost:4000
```

**Всё!** База данных будет автоматически инициализирована с:
- Миграциями схемы
- Начальными ролями (Admin, Manager, User)
- Тестовыми данными (100+ пользователей, 5k+ задач, 30k+ событий, 100+ документов)

---

## ⚙️ Настройка окружения

### Docker окружение (`.env`)

Создать файл `.env` в корневой директории:

```env
# Конфигурация базы данных
DATABASE_URL=postgresql://smartops:smartops_password@postgres:5432/smartops?schema=public

# Конфигурация API
PORT=4000
NODE_ENV=production
FRONTEND_URL=http://web:3000

# JWT Аутентификация
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Конфигурация веб-приложения
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### API окружение (`apps/api/.env`)

Для локальной разработки без Docker:

```env
# База данных
DATABASE_URL="postgresql://smartops:smartops_password@localhost:5432/smartops?schema=public"

# Сервер
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# JWT Аутентификация
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d
```

### Web окружение (`apps/web/.env`)

Для локальной разработки без Docker:

```env
# API URL
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Внутренний API URL (для Server Components в Docker)
API_URL="http://api:4000"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Окружение
NODE_ENV=development
```

---

## 📁 Структура проекта

```
SmartOpsPlatform/
├── apps/
│   ├── web/                    # Next.js фронтенд
│   │   ├── app/                # App Router страницы
│   │   │   ├── (auth)/        # Группа маршрутов аутентификации
│   │   │   ├── dashboard/     # Аналитическая панель
│   │   │   ├── events/        # Лента событий
│   │   │   ├── knowledge/     # Хаб знаний
│   │   │   ├── profile/       # Профиль пользователя
│   │   │   └── layout.tsx     # Корневой layout
│   │   ├── components/        # React компоненты
│   │   │   ├── ui/            # shadcn/ui компоненты
│   │   │   ├── charts/        # Компоненты графиков
│   │   │   ├── tables/        # Компоненты таблиц
│   │   │   └── ...            # Компоненты функций
│   │   ├── lib/               # Утилиты
│   │   ├── contexts/          # React контексты
│   │   └── middleware.ts      # Защита маршрутов
│   │
│   └── api/                    # NestJS бэкенд
│       ├── src/
│       │   ├── auth/          # Модуль аутентификации
│       │   ├── users/         # Управление пользователями
│       │   ├── analytics/     # Эндпоинты аналитики
│       │   ├── events/        # Управление событиями
│       │   ├── knowledge/     # API базы знаний
│       │   ├── tasks/         # Управление задачами
│       │   ├── websocket/     # WebSocket gateway (только бэкенд, не подключен к фронтенду)
│       │   └── prisma/        # Prisma сервис
│       └── prisma/
│           ├── schema.prisma  # Схема базы данных
│           └── seed.ts        # Скрипт заполнения
│
├── docker-compose.yml          # Docker оркестрация
└── README.md                   # Этот файл
```

---

## 📊 Метрики производительности

### Lighthouse Scores (Цель)
- **Производительность**: 90+
- **Доступность**: 95+
- **Лучшие практики**: 95+
- **SEO**: 95+

### Core Web Vitals (Цель)
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTFB** (Time to First Byte): < 200ms

### Оптимизация размера бандла
- **Начальный JS**: < 200KB (gzipped)
- **Разделение кода**: Vendor-чанки разделены
- **Tree shaking**: Неиспользуемый код удален
- **Оптимизация изображений**: Форматы WebP/AVIF

---

## 🎓 Результаты обучения

Этот проект демонстрирует:

✅ **Full-stack разработку** с современными фреймворками  
✅ **Типобезопасность** со строгим режимом TypeScript  
✅ **Оптимизацию производительности** с фокусом на Core Web Vitals  
✅ **SEO best practices** с динамическими метаданными  
✅ **Безопасность** с JWT, RBAC и security headers  
✅ **Контейнеризацию** с Docker  
✅ **Дизайн базы данных** с Prisma и PostgreSQL  
✅ **Доступность** с соответствием WCAG 2.1  
✅ **Опыт разработчика** с чистой архитектурой  

---

## 📝 Лицензия

Этот проект является частью портфолио и доступен для просмотра и обучения.

---

<div align="center">

**Создано с ❤️ используя Next.js, NestJS и современные веб-технологии**

[⬆ Наверх](#-smartops-платформа)

</div>
