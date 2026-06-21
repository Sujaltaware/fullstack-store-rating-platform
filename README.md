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

---
## Getting Started

### Step 1: Set Up the Database

1. Start MySQL on your machine (MySQL Workbench).
2. Run the schema file to create the database and tables:

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
