# OFHAS – Organisational Financial Health Assessment System

A full-stack web application that provides a comprehensive financial health assessment based on the 7 Pillars of Financial Health framework.

![OFHAS Screenshot](https://via.placeholder.com/1200x630/0088cc/ffffff?text=OFHAS+Financial+Health+Assessment)

## Features

- **Complete Assessment**: Evaluate your organization's financial health across six key pillars
- **Personalized Reports**: Receive tailored recommendations based on your assessment results
- **Progress Tracking**: Save your progress and return to complete the assessment later
- **User Authentication**: Secure login and registration with email verification
- **PDF Reports**: Generate and download comprehensive PDF reports of your results

## Tech Stack

### Frontend
- **Vue 3**: Component-based UI framework
- **Vite**: Fast development and build tool
- **TailwindCSS**: Utility-first CSS framework
- **Vue Router**: Client-side routing
- **Chart.js**: Interactive charts and visualizations

### Backend
- **Express**: Node.js web framework
- **Supabase**: Backend-as-a-Service for authentication, database, and storage
- **PDFKit**: PDF generation library
- **Serverless**: Deployed as serverless functions on Vercel

## Project Structure

```
/
├── api/                # Express backend API
│   ├── .env.example    # Example environment variables
│   └── server.js       # Main server file
├── client/             # Vue 3 frontend
│   ├── public/         # Static files
│   └── src/
│       ├── assets/     # Images, styles, etc.
│       ├── components/ # Reusable Vue components
│       ├── router/     # Vue Router configuration
│       ├── services/   # API services and utilities
│       ├── views/      # Page components
│       ├── App.vue     # Root component
│       └── main.js     # Entry point
├── supabase/           # Supabase configuration and migrations
├── vercel.json         # Vercel deployment configuration
└── README.md           # This file
```

## Prerequisites

- Node.js 16+ installed
- npm or yarn
- A Supabase account ([Sign up here](https://supabase.com))
- Vercel account for deployment (optional)

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/ofhas.git
cd ofhas
```

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Get your Supabase URL and anon key from the API settings
3. Run the database schema setup (see `supabase-schema.sql` file)

### 3. Frontend Setup

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your Supabase credentials to .env
# Edit the file and add:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev
```

### 4. Backend Setup

```bash
# Navigate to the API directory
cd api

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your Supabase credentials to .env
# Edit the file and add:
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Start the API server
npm run dev
```

## Production Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Set up the environment variables in the Vercel project settings
4. Deploy!

### Manual Deployment

#### Frontend

```bash
cd client
npm run build
# Deploy the generated 'dist' folder to your web hosting
```

#### Backend

```bash
cd api
# Deploy as serverless functions or as an Express app
# depending on your hosting provider
```

## Environment Variables

### Frontend (.env)

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=your_api_url (in production)
```

### Backend (.env)

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
PORT=3000 (or your preferred port)
NODE_ENV=development (or production)
```

## Security Considerations

- **NEVER commit your .env files to version control**
- Make sure Supabase Row Level Security (RLS) is properly configured
- Use the Supabase service key only on the server side, never in the client
- Implement proper input validation and sanitization on both client and server

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/ofhas](https://github.com/yourusername/ofhas)