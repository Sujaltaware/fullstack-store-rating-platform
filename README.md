# Store Rating Platform

A full-stack web application where users can register, browse stores, and submit ratings (1–5 stars). The platform supports three user roles — **System Administrator**, **Normal User**, and **Store Owner** — each with their own dashboard and permissions.

---

## Tech Stack

| Layer      | Technology        | Purpose                              |
|------------|-------------------|--------------------------------------|
| Frontend   | React 18 + Vite   | User interface                       |
| Backend    | Express.js        | REST API server                      |
| Database   | MySQL             | Data storage                         |
| Auth       | JWT + bcrypt      | Login sessions & password hashing    |

### Libraries Used

**Backend**
- `express` — Web server framework
- `mysql2` — MySQL database driver
- `bcryptjs` — Password hashing
- `jsonwebtoken` — JWT authentication tokens
- `express-validator` — Form validation
- `cors` — Cross-origin requests
- `dotenv` — Environment variables

**Frontend**
- `react` + `react-dom` — UI components
- `react-router-dom` — Page routing
- `axios` — HTTP requests to the API
- `vite` — Fast development build tool

---

## Project Structure

```
fullstack-store-rating-platform/
├── backend/                    # Express.js API server
│   ├── config/
│   │   └── db.js               # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js             # JWT authentication & role checks
│   ├── routes/
│   │   ├── auth.js             # Login, register, change password
│   │   ├── admin.js            # Admin dashboard & management
│   │   ├── stores.js           # Store listings & owner dashboard
│   │   └── ratings.js          # Submit & update ratings
│   ├── scripts/
│   │   └── seed.js             # Sample data seeder
│   ├── utils/
│   │   └── validation.js       # Shared form validation rules
│   ├── server.js               # App entry point
│   ├── package.json
│   └── .env.example            # Environment variables template
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js        # API client with auth headers
│   │   ├── components/
│   │   │   ├── Layout.jsx      # Navbar + page wrapper
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── SortableTable.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   └── StarRating.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ChangePassword.jsx
│   │   │   ├── admin/          # Admin pages
│   │   │   ├── user/           # Normal user pages
│   │   │   └── owner/          # Store owner pages
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   └── schema.sql              # MySQL database schema
│
└── README.md
```

---

## Features by Role

### System Administrator
- Dashboard with total users, stores, and ratings count
- Add new users (admin, normal user, store owner)
- Add new stores and assign store owners
- View all users and stores with filters (name, email, address, role)
- Sortable tables on all listings
- View individual user details (including store owner ratings)

### Normal User
- Self-registration with validation
- Browse all stores with search by name/address
- Submit ratings (1–5 stars) for stores
- Update previously submitted ratings
- Change password

### Store Owner
- View dashboard with average store rating
- See list of users who rated their store
- Change password

---

## Form Validation Rules

| Field    | Rules                                                    |
|----------|----------------------------------------------------------|
| Name     | 20–60 characters                                         |
| Email    | Valid email format                                       |
| Address  | Max 400 characters                                       |
| Password | 8–16 characters, 1 uppercase letter, 1 special character |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL](https://www.mysql.com/) (v8 or higher)

### Step 1: Set Up the Database

1. Start MySQL on your machine (MySQL Workbench).
2. Run the schema file to create the database and tables:

**Option A — MySQL Workbench**
- Open `database/schema.sql`
- Click **Execute** (⚡) — this creates `store_rating_db` and all tables

**Option B — Command line**
```bash
mysql -u root -p < database/schema.sql
```

### Step 2: Set Up the Backend

```bash
cd backend
npm install
```

Copy the environment file and update your MySQL credentials:

```bash
copy .env.example .env
```

Edit `.env` with your settings:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_db
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=24h
```

Seed the database with sample data:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

The API will run at `http://localhost:5000`.

### Step 3: Set Up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will open at `http://localhost:3000`.

---

## Test Accounts

After running the seed script, use these accounts to test:

| Role         | Email                        | Password    |
|--------------|------------------------------|-------------|
| Admin        | admin@storeplatform.com      | Admin@123   |
| Normal User  | john.anderson@email.com      | User@1234   |
| Store Owner  | robert.store@email.com       | Owner@123   |

---

## API Endpoints

### Authentication
| Method | Endpoint                  | Description           | Access  |
|--------|---------------------------|-----------------------|---------|
| POST   | `/api/auth/register`      | User signup           | Public  |
| POST   | `/api/auth/login`         | Login                 | Public  |
| PUT    | `/api/auth/change-password` | Change password     | Auth    |
| GET    | `/api/auth/me`            | Get current user      | Auth    |

### Admin
| Method | Endpoint                  | Description           | Access  |
|--------|---------------------------|-----------------------|---------|
| GET    | `/api/admin/dashboard`    | Dashboard stats       | Admin   |
| GET    | `/api/admin/users`        | List users (filter/sort) | Admin |
| POST   | `/api/admin/users`        | Create user           | Admin   |
| GET    | `/api/admin/users/:id`    | User details          | Admin   |
| GET    | `/api/admin/stores`       | List stores           | Admin   |
| POST   | `/api/admin/stores`       | Create store          | Admin   |
| GET    | `/api/admin/store-owners` | List store owners     | Admin   |

### Stores & Ratings
| Method | Endpoint                      | Description           | Access       |
|--------|-------------------------------|-----------------------|--------------|
| GET    | `/api/stores`                 | Browse stores         | User         |
| GET    | `/api/stores/owner/dashboard` | Owner dashboard      | Store Owner  |
| POST   | `/api/ratings`                | Submit rating         | User         |
| PUT    | `/api/ratings/:storeId`       | Update rating         | User         |

---

## Database Schema

### users
| Column     | Type         | Description                    |
|------------|--------------|--------------------------------|
| id         | INT (PK)     | Auto-increment ID              |
| name       | VARCHAR(60)  | User full name                 |
| email      | VARCHAR(255) | Unique email                   |
| password   | VARCHAR(255) | Hashed password                |
| address    | VARCHAR(400) | User address                   |
| role       | ENUM         | admin, user, store_owner       |

### stores
| Column     | Type         | Description                    |
|------------|--------------|--------------------------------|
| id         | INT (PK)     | Auto-increment ID              |
| name       | VARCHAR(255) | Store name                     |
| email      | VARCHAR(255) | Store contact email            |
| address    | VARCHAR(400) | Store address                  |
| owner_id   | INT (FK)     | References users.id            |

### ratings
| Column     | Type         | Description                    |
|------------|--------------|--------------------------------|
| id         | INT (PK)     | Auto-increment ID              |
| user_id    | INT (FK)     | References users.id            |
| store_id   | INT (FK)     | References stores.id           |
| rating     | TINYINT      | Rating value (1–5)             |

Each user can rate a store only once (enforced by unique constraint on user_id + store_id).

---

## How Authentication Works

1. User logs in with email and password.
2. Server verifies credentials and returns a **JWT token**.
3. Frontend stores the token in `localStorage`.
4. Every API request includes the token in the `Authorization: Bearer <token>` header.
5. Backend middleware verifies the token and checks user role before allowing access.

---

## Scripts

**Backend**
```bash
npm start       # Start production server
npm run dev     # Start with auto-reload (nodemon)
npm run seed    # Populate database with sample data
```

**Frontend**
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

---

## License

This project is for educational purposes.
