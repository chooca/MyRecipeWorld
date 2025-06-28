# RecipeVault

A comprehensive recipe management web application that allows users to store, organize, and share their favorite recipes with a beautiful, modern interface.

## Features

### 🔐 Authentication & Security
- Secure user authentication via Replit OAuth
- Session-based authentication with PostgreSQL storage
- Route protection for authenticated users

### 📖 Recipe Management
- Create, read, update, and delete recipes
- Rich recipe details including:
  - Title, description, and ingredients
  - Step-by-step instructions
  - Prep time, cook time, and servings
  - Difficulty level and cuisine tags
  - Recipe images with drag-and-drop upload

### 🔒 Privacy Controls
- Keep recipes private or share them publicly
- Control who can see your recipes
- Browse public recipes from other users

### 📊 Personal Dashboard
- Track your recipe collection statistics
- View cooking history with personal notes
- Favorite recipes for quick access
- Search through your recipes

### 🎨 Modern UI/UX
- Beautiful orange-themed design
- Dark and light mode support
- Responsive design for all devices
- Smooth animations and transitions

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **TanStack Query** for data fetching
- **React Hook Form** with Zod validation
- **Wouter** for lightweight routing

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **PostgreSQL** with Neon serverless
- **Multer** for file uploads
- **Passport** for authentication

## Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- Environment variables:
  - `DATABASE_URL` - PostgreSQL connection string
  - `SESSION_SECRET` - Secret for session management
  - `REPL_ID` - Replit application ID
  - `REPLIT_DOMAINS` - Allowed domains for authentication

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/RecipeVault.git
cd RecipeVault
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables in a `.env` file (see `.env.example`)

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Database Schema

The application uses the following main tables:
- **users** - User profiles and authentication data
- **recipes** - Recipe information and metadata
- **cooking_history** - Track when users cook recipes
- **favorites** - User's favorite recipes
- **sessions** - Session storage for authentication

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout user

### Recipes
- `GET /api/recipes` - Get user's recipes
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/:id` - Get specific recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `GET /api/recipes/public` - Get public recipes
- `GET /api/recipes/search` - Search recipes

### File Upload
- `POST /api/upload` - Upload recipe images

### Favorites & History
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites/:id` - Add to favorites
- `DELETE /api/favorites/:id` - Remove from favorites
- `GET /api/cooking-history` - Get cooking history
- `POST /api/cooking-history` - Add cooking history

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Backend Express application
│   ├── db.ts             # Database configuration
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database operations
│   └── replitAuth.ts     # Authentication setup
├── shared/               # Shared TypeScript types
│   └── schema.ts         # Database schema and types
└── uploads/              # File upload directory
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Replit](https://replit.com) development environment
- UI components from [Shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)