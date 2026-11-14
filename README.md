# ExpenseTracker

A full-stack personal finance management application built with the MERN
stack. ExpenseTracker helps users record income and expenses, organize
transactions, monitor category-wise budgets, and understand their
spending through dashboard summaries and analytics.

> **Project status:** Core finance management features are implemented.
> In-app notifications are planned and are not yet included as a
> completed feature.

------------------------------------------------------------------------

## Table of Contents

-   [Overview](#overview)
-   [Features](#features)
-   [Technology Stack](#technology-stack)
-   [Application Architecture](#application-architecture)
-   [Project Structure](#project-structure)
-   [Getting Started](#getting-started)
-   [Environment Configuration](#environment-configuration)
-   [Running the Application](#running-the-application)
-   [API Overview](#api-overview)
-   [Validation and Security](#validation-and-security)
-   [Build and Verification](#build-and-verification)
-   [Known Limitations and Roadmap](#known-limitations-and-roadmap)
-   [Contributing](#contributing)
-   [License](#license)

------------------------------------------------------------------------

## Overview

ExpenseTracker is designed to make everyday personal finance tracking
straightforward. Users can manage their financial activity from a single
interface and review how their spending changes over time.

The application follows a client-server architecture:

1.  The React frontend provides the user interface.
2.  The Express backend exposes REST API endpoints.
3.  MongoDB stores user, transaction, budget, category, and daily-limit
    data.
4.  JWT-based authentication protects private API routes.

The project is organized into separate `client` and `server`
applications.

## Features

### Account and authentication

-   User registration and login.
-   JWT-protected API routes.
-   Profile information retrieval and update.
-   Password change.
-   User-specific data access.

### Transactions

-   Create, view, update, and delete income and expense records.
-   Store transaction title, amount, type, category, date, and optional
    notes.
-   Search and filter transactions.
-   Filter by transaction type, category, and date range.
-   Paginated transaction listing.
-   Input validation for required fields, amount, type, and transaction
    ID.

### Dashboard and analytics

-   Income, expense, and balance summaries.
-   Current-month income and expense totals.
-   Category-wise expense analytics.
-   Six-month income-versus-expense analytics.
-   Transaction activity overview.

### Budgets

-   Create budgets by category and month.
-   View spending against each budget.
-   Calculate remaining budget and percentage used.
-   Identify exceeded budgets.
-   Prevent duplicate budgets for the same user, category, and month.

### Categories

-   View default categories.
-   Create, update, and delete categories.
-   Separate income and expense category types.

### Daily spending guardrail

-   Configure a daily spending limit.
-   Track daily expense totals.
-   Calculate remaining daily allowance.
-   Show warning and exceeded states when spending approaches or passes
    the configured limit.

### Preferences

-   Currency display preference (INR, USD, EUR, and GBP).
-   Date display format preference.
-   Save and retrieve preferences from the backend.

**Currency note:** Changing the currency preference changes the
displayed currency format only. It does not perform live
foreign-exchange conversion.

------------------------------------------------------------------------

## Technology Stack

  Layer            Technologies
  ---------------- -----------------------------------
  Frontend         React 19, TypeScript, Vite
  Styling          Tailwind CSS
  Routing          React Router
  HTTP client      Axios
  Charts           Recharts
  Icons            Lucide React
  Backend          Node.js, Express.js 5, TypeScript
  Database         MongoDB, Mongoose
  Authentication   JSON Web Tokens (JWT), bcrypt

------------------------------------------------------------------------

## Application Architecture

``` text
                 Browser
                    |
                    v
        React + TypeScript Frontend
          (Vite / Tailwind CSS)
                    |
               HTTP / REST
                    |
                    v
          Express.js REST API
             (Port 5000)
                    |
          JWT Authentication
                    |
                    v
             Mongoose ODM
                    |
                    v
                MongoDB
```

The frontend communicates with the backend through REST endpoints.
Protected routes require a valid JWT. Data queries and mutations are
scoped to the authenticated user where applicable.

------------------------------------------------------------------------

## Project Structure

The repository is divided into two main applications:

``` text
ExpenseTracker/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── types/
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

The tree above shows the main application areas; individual files may
vary as the project evolves.

------------------------------------------------------------------------

## Getting Started

### Prerequisites

Install the following before running the project:

-   [Node.js](https://nodejs.org/) (a current LTS release is
    recommended).
-   npm (included with Node.js).
-   [MongoDB Community
    Server](https://www.mongodb.com/try/download/community), running
    locally or an accessible MongoDB instance.
-   [MongoDB Compass](https://www.mongodb.com/products/tools/compass)
    (optional, for inspecting the database).
-   Git.

### 1. Clone the repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ExpenseTracker
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the URL of your GitHub
repository.

### 2. Install backend dependencies

``` bash
cd server
npm install
```

### 3. Configure the backend environment

Create a `.env` file inside the `server` directory.

Add the environment variables required by the backend configuration. The
application uses a backend port of `5000`; set the MongoDB connection
string and a strong JWT signing secret as required by the server
configuration.

Example values (use the exact variable names expected by your
`server/src/config` and server startup files):

``` env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=replace_with_a_long_random_secret
```

> If your backend configuration uses a different MongoDB variable name
> (for example, `MONGODB_URI`), use the exact name referenced in the
> source code. Never commit `.env` or real secrets to Git.

### 4. Install frontend dependencies

Open a second terminal from the repository root:

``` bash
cd client
npm install
```

------------------------------------------------------------------------

## Running the Application

### Start the backend

From the `server` directory:

``` bash
npm run dev
```

The backend is configured to run on:

``` text
http://localhost:5000
```

Make sure MongoDB is running and the backend environment variables are
configured.

### Start the frontend

From the `client` directory, in a separate terminal:

``` bash
npm run dev
```

Vite will print the local development URL in the terminal. In the
current development setup, it is typically:

``` text
http://localhost:5173
```

Open that URL in your browser.

------------------------------------------------------------------------

## API Overview

All API routes are mounted under `/api`. Protected endpoints require an
authorization header:

``` http
Authorization: Bearer <JWT_TOKEN>
```

### Authentication --- `/api/auth`

  Method   Endpoint                      Purpose
  -------- ----------------------------- --------------------------------------
  POST     `/api/auth/register`          Register a user
  POST     `/api/auth/login`             Log in
  GET      `/api/auth/me`                Get the authenticated user's profile
  PUT      `/api/auth/me`                Update profile
  PUT      `/api/auth/change-password`   Change password
  GET      `/api/auth/preferences`       Get preferences
  PUT      `/api/auth/preferences`       Update preferences

### Transactions --- `/api/transactions`

  ----------------------------------------------------------------------------------------
  Method                  Endpoint                                 Purpose
  ----------------------- ---------------------------------------- -----------------------
  POST                    `/api/transactions`                      Create a transaction

  GET                     `/api/transactions`                      List transactions with
                                                                   search, filters, and
                                                                   pagination

  PUT                     `/api/transactions/:id`                  Update a transaction

  DELETE                  `/api/transactions/:id`                  Delete a transaction

  GET                     `/api/transactions/summary`              Get dashboard summary

  GET                     `/api/transactions/analytics/expenses`   Get category-wise
                                                                   expense analytics

  GET                     `/api/transactions/analytics/monthly`    Get six-month income
                                                                   and expense analytics
  ----------------------------------------------------------------------------------------

### Budgets --- `/api/budgets`

  -----------------------------------------------------------------------
  Method                  Endpoint                Purpose
  ----------------------- ----------------------- -----------------------
  POST                    `/api/budgets`          Create a budget

  GET                     `/api/budgets`          List the authenticated
                                                  user's budgets and
                                                  spending

  PUT                     `/api/budgets/:id`      Update a budget

  DELETE                  `/api/budgets/:id`      Delete a budget
  -----------------------------------------------------------------------

### Categories --- `/api/categories`

  Method   Endpoint                Purpose
  -------- ----------------------- -------------------
  GET      `/api/categories`       List categories
  POST     `/api/categories`       Create a category
  PUT      `/api/categories/:id`   Update a category
  DELETE   `/api/categories/:id`   Delete a category

### Daily spending limit --- `/api/daily-limit`

  -----------------------------------------------------------------------
  Method                  Endpoint                Purpose
  ----------------------- ----------------------- -----------------------
  GET                     `/api/daily-limit`      Get daily limit and
                                                  current spending status

  PUT                     `/api/daily-limit`      Configure or update the
                                                  daily limit
  -----------------------------------------------------------------------

> Request body fields and response formats are defined by the
> corresponding backend controllers. Check the route and controller
> files for the exact schema before integrating a new client.

------------------------------------------------------------------------

## Validation and Security

The backend includes the following protections and validation checks:

-   Authentication middleware protects private API routes.
-   JWT identity is used to scope user-owned data.
-   Transaction update and delete operations query by both document ID
    and authenticated user ID.
-   Budget update and delete operations are scoped to the authenticated
    user.
-   Transaction amounts must be finite positive numbers.
-   Transaction type is restricted to `income` or `expense`.
-   Required transaction fields are validated.
-   Invalid MongoDB document IDs are rejected for transaction and budget
    mutations.
-   Budget amount, month, and year are validated.
-   Duplicate budgets for the same user, category, and month are
    rejected by the database uniqueness constraint.

For production deployment, review CORS origin restrictions, rate
limiting, request-size limits, secret management, HTTPS, and logging
configuration.

------------------------------------------------------------------------

## Build and Verification

### Frontend production build

``` bash
cd client
npm run build
```

### Backend TypeScript build

``` bash
cd server
npm run build
```

### Start the compiled backend

After a successful backend build:

``` bash
npm start
```

The current project verification has included successful frontend and
backend production builds, API CRUD checks, authentication checks,
validation checks, and cross-user transaction access checks. This is not
a substitute for a complete automated test suite or a production
security audit.

------------------------------------------------------------------------

## Known Limitations and Roadmap

The following improvements are planned or require further verification:

-   [ ] In-app notification center with unread count and read status.
-   [ ] Budget threshold and exceeded notifications.
-   [ ] Daily spending warning notifications.
-   [ ] Notification preference controls.
-   [ ] Complete frontend end-to-end and responsive-device testing.
-   [ ] Production CORS and deployment security review.
-   [ ] Timezone consistency review for daily and monthly calculations.
-   [ ] Frontend bundle splitting and performance optimization.
-   [ ] Automated backend and frontend test suites.
-   [ ] Deployment documentation.

Features listed here should be marked complete only after implementation
and verification.

------------------------------------------------------------------------

## Contributing

Contributions and suggestions are welcome.

1.  Fork the repository.

2.  Create a feature branch:

    ``` bash
    git checkout -b feature/your-feature-name
    ```

3.  Make focused changes and test them.

4.  Commit your changes:

    ``` bash
    git add .
    git commit -m "feat: describe your change"
    ```

5.  Push the branch and open a Pull Request.

Please avoid committing `.env`, credentials, database dumps,
`node_modules`, or build output.

------------------------------------------------------------------------

## License

No license has been specified yet. Unless a license is added to this
repository, all rights remain with the copyright holder and reuse is not
automatically granted.
