# Pecora Negra - Multi-Location Restaurant Management System

A comprehensive restaurant management system built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔐 **Authentication**: Email/password login with Supabase Auth
- 🏢 **Multi-Location**: Support for multiple restaurant locations
- 📊 **Dashboard**: Real-time overview with revenue charts and task management
- 👥 **Staff Management**: Team member management and scheduling
- 📦 **Inventory**: Stock management and supplier orders
- ✅ **HACCP Compliance**: Food safety checklists and temperature monitoring
- 🔧 **Maintenance**: Equipment maintenance tracking
- 💬 **Communication**: Internal messaging system
- 📱 **Responsive**: Mobile-first design with desktop optimization

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Auth, Database, Storage)
- **Package Manager**: Bun
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pecora-negra
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Seed the admin user:
```bash
bun run seed
```

This creates the initial admin user:
- **Email**: matias@pecoranegra.fr
- **Password**: 1234
- **Name**: Matias Tonello
- **Role**: Admin

5. Start the development server:
```bash
bun run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication

### Login
Navigate to `/login` and use the admin credentials:
- Email: `matias@pecoranegra.fr`
- Password: `1234`

### Protected Routes
All routes under `/(protected)` require authentication. Unauthenticated users are automatically redirected to `/login`.

### Logout
Use the profile menu in the top-right corner to sign out.

## Project Structure

```
├── app/
│   ├── (public)/
│   │   └── login/              # Login page
│   ├── (protected)/            # Protected routes
│   │   ├── dashboard/          # Main dashboard
│   │   ├── orders/             # Order management
│   │   ├── staff/              # Staff management
│   │   ├── inventory/          # Inventory tracking
│   │   ├── haccp/              # HACCP compliance
│   │   ├── maintenance/        # Equipment maintenance
│   │   ├── chat/               # Internal messaging
│   │   └── settings/           # System settings
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── layout/                 # Layout components
├── lib/
│   ├── hooks/                  # Custom React hooks
│   ├── supabase/               # Supabase clients
│   └── utils.ts                # Utility functions
├── scripts/
│   └── seed-admin.js           # Admin user seeding script
└── middleware.ts               # Route protection middleware
```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run typecheck` - Run TypeScript type checking
- `bun run seed` - Seed admin user

## Design System

The application follows a consistent design system based on the provided mockup:

- **Colors**: Yellow/orange gradient sidebar, green active states
- **Typography**: Clean, modern font hierarchy
- **Components**: Rounded corners, subtle shadows, consistent spacing
- **Layout**: Responsive sidebar with collapsible navigation
- **Icons**: Lucide React icon set

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (for seeding)
```

## Deployment

The application is ready for deployment on Vercel:

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## License

This project is proprietary software for Pecora Negra restaurant management.

## Apply RBAC Migrations

```bash
bun node scripts/apply-migrations.js
```

The script will execute the SQL files in `supabase/migrations` against your Supabase project using the Service Role key.
