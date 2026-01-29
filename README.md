# 💰 antigravitydemo - Personal Finance Management System

A full-stack expense tracking application with AI-powered insights, receipt scanning, shared expenses, and comprehensive financial analytics.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [License](#license)

---

## Overview

antigravitydemo is a modern expense tracking application designed to help users manage their personal finances effectively. It combines traditional expense management with AI-powered predictions, smart nudges, and collaborative features for shared expenses.

---

## Features

### Core Features

- **Expense & Income Tracking** - Track all your financial transactions with categories
- **Multi-Wallet Support** - Manage Cash, Bank, Mobile Banking, Credit Cards
- **Budget Management** - Set and monitor category-based budgets
- **Analytics Dashboard** - Visual spending trends and insights
- **Recurring Expenses** - Automate regular transactions

### Advanced Features

- **🤖 AI Predictions** - Forecast future expenses using machine learning algorithms
- **📸 Receipt OCR** - Scan receipts and auto-extract expense data using Gemini AI
- **👥 Shared Expenses** - Split bills with friends (Equal, Percentage, Exact Amount, Shares)
- **🔔 Smart Nudges** - Personalized financial notifications and alerts
- **💳 Debt & Loan Tracking** - Manage loans with interest calculations
- **📊 Lifestyle Reports** - Comprehensive spending analysis
- **📑 Tax Export** - Generate tax-ready reports

---

## Tech Stack

### Backend

- **Java 17**
- **Spring Boot 3.2**
- **Spring Security** with JWT Authentication
- **Spring Data JPA** with Hibernate
- **MySQL 8.0**
- **Lombok**
- **SpringDoc OpenAPI** (Swagger UI)
- **WebFlux** (for Gemini API integration)

### Frontend

- **Next.js 16**
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Framer Motion** (animations)
- **Recharts** (data visualization)
- **Zustand** (state management)
- **Radix UI** (component primitives)
- **TensorFlow.js** (client-side ML)

### DevOps

- **Docker & Docker Compose**
- **Maven**

---

## Project Structure

```
antigravitydemo/
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/com/expensetracker/
│   │   ├── config/                   # Security & app configuration
│   │   ├── controller/               # REST API controllers
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── entity/                   # JPA entities
│   │   ├── exception/                # Custom exceptions
│   │   ├── features/                 # Feature modules
│   │   │   ├── analytics/            # Analytics & reports
│   │   │   ├── budget/               # Budget management
│   │   │   ├── category/             # Expense categories
│   │   │   ├── debt/                 # Debt & loan tracking
│   │   │   ├── expense/              # Core expense tracking
│   │   │   ├── income/               # Income management
│   │   │   ├── lifestyle/            # Lifestyle reports
│   │   │   ├── nudge/                # Smart notifications
│   │   │   ├── prediction/           # AI predictions
│   │   │   ├── receipt/              # Receipt OCR
│   │   │   ├── recurring/            # Recurring transactions
│   │   │   ├── shared/               # Shared expenses
│   │   │   ├── tax/                  # Tax export
│   │   │   └── wallet/               # Wallet management
│   │   ├── repository/               # Data access layer
│   │   ├── security/                 # JWT & authentication
│   │   ├── service/                  # Business logic
│   │   └── util/                     # Utilities
│   └── pom.xml                       # Maven dependencies
│
├── frontend/                         # Next.js Frontend
│   ├── src/
│   │   ├── app/                      # App router pages
│   │   │   ├── (app)/                # Authenticated routes
│   │   │   │   ├── dashboard/        # Main dashboard
│   │   │   │   ├── expenses/         # Expense management
│   │   │   │   ├── income/           # Income tracking
│   │   │   │   ├── wallets/          # Wallet management
│   │   │   │   ├── budgets/          # Budget management
│   │   │   │   ├── analytics/        # Analytics & charts
│   │   │   │   ├── ai-predictions/   # AI forecasting
│   │   │   │   ├── receipt-ocr/      # Receipt scanning
│   │   │   │   ├── shared-expenses/  # Bill splitting
│   │   │   │   ├── nudges/           # Smart notifications
│   │   │   │   ├── debt-loans/       # Debt tracking
│   │   │   │   ├── savings-goals/    # Savings targets
│   │   │   │   ├── tax-export/       # Tax reports
│   │   │   │   ├── lifestyle-reports/# Spending analysis
│   │   │   │   ├── recurring/        # Recurring expenses
│   │   │   │   └── settings/         # User settings
│   │   │   ├── login/                # Login page
│   │   │   └── register/             # Registration page
│   │   ├── components/               # Reusable UI components
│   │   └── lib/                      # Utilities & helpers
│   └── package.json                  # NPM dependencies
│
└── docker-compose.yml                # Docker configuration
```

---

## Prerequisites

- **Java 17** or higher
- **Node.js 18** or higher
- **MySQL 8.0** (or use Docker)
- **Maven 3.8+**
- **Docker & Docker Compose** (optional)

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd antigravitydemo
```

### 2. Start the Database

**Option A: Using Docker (Recommended)**

```bash
docker-compose up -d
```

This starts MySQL on port `3307`.

**Option B: Local MySQL**
Create a database named `expensetracker` and update `application.properties` with your credentials.

### 3. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html

---

## Configuration

### Backend (`backend/src/main/resources/application.properties`)

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3307/expensetracker
spring.datasource.username=expenseuser
spring.datasource.password=expensepassword

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000

# Gemini API (for Receipt OCR)
gemini.api.key=your-gemini-api-key
```

### Frontend Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## API Documentation

### Authentication

| Method | Endpoint            | Description          |
| ------ | ------------------- | -------------------- |
| POST   | `/api/auth/signup`  | Register new user    |
| POST   | `/api/auth/signin`  | Login user           |
| POST   | `/api/auth/refresh` | Refresh access token |

### Expenses

| Method | Endpoint             | Description      |
| ------ | -------------------- | ---------------- |
| GET    | `/api/expenses`      | Get all expenses |
| POST   | `/api/expenses`      | Create expense   |
| PUT    | `/api/expenses/{id}` | Update expense   |
| DELETE | `/api/expenses/{id}` | Delete expense   |

### Wallets

| Method | Endpoint            | Description     |
| ------ | ------------------- | --------------- |
| GET    | `/api/wallets`      | Get all wallets |
| POST   | `/api/wallets`      | Create wallet   |
| PUT    | `/api/wallets/{id}` | Update wallet   |
| DELETE | `/api/wallets/{id}` | Delete wallet   |

### AI Predictions

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | `/api/predictions`          | Get expense predictions  |
| POST   | `/api/predictions/generate` | Generate new predictions |

### Shared Expenses

| Method | Endpoint                                           | Description           |
| ------ | -------------------------------------------------- | --------------------- |
| GET    | `/api/shared-expenses`                             | Get shared expenses   |
| POST   | `/api/shared-expenses`                             | Create shared expense |
| POST   | `/api/shared-expenses/{id}/participants/{pid}/pay` | Mark payment          |
| POST   | `/api/shared-expenses/{id}/settle`                 | Settle expense        |

### Nudges

| Method | Endpoint                | Description     |
| ------ | ----------------------- | --------------- |
| GET    | `/api/nudges`           | Get all nudges  |
| POST   | `/api/nudges/generate`  | Generate nudges |
| PUT    | `/api/nudges/{id}/read` | Mark as read    |
| DELETE | `/api/nudges/{id}`      | Dismiss nudge   |

### Receipt OCR

| Method | Endpoint             | Description        |
| ------ | -------------------- | ------------------ |
| POST   | `/api/receipts/scan` | Scan receipt image |

For complete API documentation, visit the Swagger UI at `http://localhost:8080/swagger-ui.html` when the backend is running.

---

## License

This project is licensed under the MIT License.
