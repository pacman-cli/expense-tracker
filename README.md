# Full-Stack Expense Tracker

A modern, production-grade Expense Tracker application built with Next.js, Spring Boot, and MySQL.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Shadcn UI, Zustand, Recharts, Axios.
- **Backend**: Spring Boot 3.x, Spring Security (JWT), Spring Data JPA, Hibernate.
- **Database**: MySQL 8.0 (Dockerized).

## Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose

## Getting Started

### 1. Database Setup

Start the MySQL database using Docker Compose:

```bash
docker-compose up -d
```

### 2. Backend Setup

Navigate to the backend directory and run the application:

```bash
cd backend
./mvnw spring-boot:run
```
(Note: If `mvnw` is missing, ensure you have Maven installed and run `mvn spring-boot:run`)

The backend API will run on `http://localhost:8080`.

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`.

## Features

- **Authentication**: Secure Login & Registration with JWT (Access + Refresh Tokens).
- **Dashboard**: Visual overview of expenses with charts.
- **Expense Management**: Add, View, and Delete expenses.
- **Categories**: Categorize your expenses (Backend support included).
- **Responsive Design**: Works on desktop and mobile.

## Environment Variables

### Backend (`backend/src/main/resources/application.properties`)
- `spring.datasource.url`: Database URL
- `app.jwtSecret`: Secret key for JWT
- `app.jwtExpirationMs`: Access token expiration
- `app.jwtRefreshExpirationMs`: Refresh token expiration

### Frontend
- `API_URL` is hardcoded to `http://localhost:8080/api` in `src/lib/api.ts`. Update if needed.
