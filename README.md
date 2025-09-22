# Farm Records

A comprehensive farm management and record keeping application built with Next.js, Prisma, and PostgreSQL.

## Features

- User authentication with NextAuth.js
- Animal management and tracking
- Financial records (income/expenses)
- Category management
- Dashboard with analytics
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with:
   ```env
   # NextAuth Configuration
   NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
   NEXTAUTH_URL=http://localhost:3000

   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/farmrecords"
   ```

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication

The app uses NextAuth.js with credentials provider. Users can:
- Sign up for new accounts
- Log in with email/password
- Access protected routes only when authenticated

## Project Structure

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable UI components
- `src/providers/` - React Context and Zustand state management
- `src/prisma/` - Database schema and migrations
- `src/middleware.ts` - Authentication middleware

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **State Management**: React Context

## Updates to Database
- **isVerified**: Add to the User Model
- **Enumeration**: Add Enumeration to attributes where necessary, like categoryType and TransactionType
