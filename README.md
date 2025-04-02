# ResuMate

ResuMate is a modern web application built with Next.js that helps users create and manage professional resumes. The application features a beautiful UI with dark mode support, real-time updates, and a robust authentication system.

## Features

- 🎨 Modern UI with dark mode support
- 🔒 Secure authentication with NextAuth.js
- 📝 Resume creation and management
- 🎯 Real-time updates
- 📱 Responsive design
- 🔍 Advanced search and filtering
- 🎨 Beautiful UI components with Radix UI
- 📊 Interactive charts with Recharts

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Prisma with Neon Database
- **Authentication:** NextAuth.js
- **UI Components:** shadcn

## Prerequisites

- Node.js 18.x or later
- npm or yarn package manager
- Neon Database account (for the database)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/resu-mate.git
   cd resu-mate
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory and add the following variables:

   ```env
   DATABASE_URL="your-neon-database-url"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Set up the database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── actions/     # Server actions
├── app/         # Next.js app router pages
├── components/  # Reusable UI components
├── hooks/       # Custom React hooks
├── lib/         # Utility functions and configurations
└── middleware.ts # Next.js middleware
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.
