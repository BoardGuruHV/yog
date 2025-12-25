# Yog - Yoga Asana Library

A visual, card-based yoga asana inventory application with personalized program builder.

## Features

- **Visual Asana Library**: Browse 35+ yoga poses with SVG illustrations
- **Smart Filtering**: Filter by category, difficulty, and target body parts
- **Search**: Full-text search across pose names and descriptions
- **Program Builder**: Drag-and-drop interface to create custom yoga sequences
- **Duration Control**: Adjust hold time for each pose in your program
- **Contraindications**: View medical conditions warnings for each pose
- **Modifications**: Age and condition-specific pose variations

## Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: PostgreSQL + Prisma ORM
- **Drag & Drop**: @dnd-kit/core

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure database:**
   Update `.env` with your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/yog?schema=public"
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed the database:**
   ```bash
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:seed` - Seed database with asana data
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
yog/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── asana/[id]/        # Asana detail page
│   ├── program/           # Program builder page
│   └── page.tsx           # Home/Library page
├── components/            # React components
├── context/               # React Context (Program state)
├── lib/                   # Utilities (Prisma client)
├── prisma/                # Database schema & seed
├── public/asanas/         # SVG illustrations
└── types/                 # TypeScript types
```

## Database Schema

- **Asana**: Yoga poses with benefits, difficulty, and target body parts
- **Condition**: Medical conditions (pregnancy, back pain, etc.)
- **Contraindication**: Links poses to conditions with severity
- **Modification**: Age/condition-specific variations
- **Program**: User-created sequences
- **ProgramAsana**: Poses in a program with order and duration
