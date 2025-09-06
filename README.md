# Boxinator - Mystery Box Shipping Calculator

A full-stack web application for calculating shipping costs and managing mystery box shipments worldwide.

## Team Members

- **Development Team**: SITER Academy Autumn 2025 Cohort
- **Project Lead**: [Team Lead Name]
- **Backend Developer**: [Backend Dev Name]
- **Frontend Developer**: [Frontend Dev Name]
- **Database Designer**: [DB Designer Name]

## Project Overview

Boxinator is a comprehensive shipping management system that allows users to:
- Calculate shipping costs for mystery boxes to various international destinations
- Track shipment status throughout the delivery process
- Manage user accounts with role-based access control
- Administrative portal for managing countries and shipment statuses

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Authentication**: JWT with 2FA support
- **Email**: Nodemailer for email notifications
- **Testing**: Jest for unit testing

### Frontend
- **Framework**: React.js
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: React Context API

## Features

### User Features
- **Registration & Authentication**: Email verification, 2FA support
- **Guest Shipments**: Send shipments without full registration
- **Shipment Creation**: Multiple weight tiers with dynamic pricing
- **Real-time Tracking**: Track shipment status with history
- **Account Management**: Update profile information
- **Responsive Design**: Mobile and desktop compatible

### Admin Features
- **Shipment Management**: Update shipment statuses
- **Country Configuration**: Manage shipping multipliers
- **User Management**: View and manage user accounts
- **Statistics Dashboard**: View shipping analytics

### Shipping Tiers
- **Basic**: 1kg box
- **Humble**: 2kg box
- **Deluxe**: 5kg box
- **Premium**: 8kg box

### Pricing Structure
- **Nordic Countries** (Norway, Sweden, Denmark): 200 Kr flat rate
- **International**: 200 Kr + (weight × country multiplier)

## Installation Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone [repository-url]
cd Boxinator2
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Supabase Database Setup

**Option A: Quick Setup with Supabase**
1. Follow the detailed [Supabase Setup Guide](./SUPABASE_SETUP.md)
2. Get your Supabase project URL and API keys
3. Configure your environment variables

**Option B: Local PostgreSQL (Alternative)**
```bash
# Create PostgreSQL database locally
createdb boxinator_db
```

### 4. Configure Environment Variables
```bash
# Copy environment file
cd server
cp .env.example .env
```

Edit `server/.env` with your Supabase configuration:
```env
NODE_ENV=development
PORT=3001

# Supabase Configuration (Recommended)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# Other Configuration
JWT_SECRET=your-super-secret-jwt-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@boxinator.com
FRONTEND_URL=http://localhost:3000
```

### 5. Database Migration and Seeding
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with initial data
npm run db:seed
```

### 6. Start the Application
```bash
# From the root directory, start both server and client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Test Accounts

After seeding the database, you can use these test accounts:

### Administrator Account
- **Email**: admin@boxinator.com
- **Password**: admin123456

### Regular User Account
- **Email**: user@boxinator.com
- **Password**: user123456

### Guest Account
- **Email**: guest@example.com
- **Note**: Guest accounts don't require passwords for creating shipments

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify-email/:token` - Email verification
- `POST /api/auth/setup-2fa` - Setup two-factor authentication
- `POST /api/auth/verify-2fa` - Verify 2FA token

### Shipment Endpoints
- `GET /api/shipments` - Get user shipments
- `POST /api/shipments` - Create new shipment
- `GET /api/shipments/:id` - Get shipment details
- `PUT /api/shipments/:id` - Update shipment status
- `DELETE /api/shipments/:id` - Delete shipment (admin only)

### Account Endpoints
- `GET /api/account/me/profile` - Get current user profile
- `PUT /api/account/:id` - Update account information
- `POST /api/account` - Create account (admin only)

### Settings Endpoints
- `GET /api/settings/countries` - Get all countries
- `POST /api/settings/countries` - Add new country (admin only)
- `PUT /api/settings/countries/:id` - Update country (admin only)
- `GET /api/settings/statistics` - Get shipping statistics (admin only)

## Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

### Run All Tests
```bash
# From root directory
npm test
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **2FA Support**: Optional two-factor authentication using TOTP
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Server-side validation for all inputs
- **HTTPS**: Enforced in production environment
- **Environment Variables**: Secure credential storage

## Development Guidelines

### Code Structure
- **Backend**: RESTful API following MVC pattern
- **Frontend**: Component-based React architecture
- **Database**: Normalized relational schema with Prisma ORM

### Coding Standards
- **JavaScript**: ES6+ features with modern syntax
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Logging**: Structured logging with Winston
- **Validation**: Client and server-side validation

## Deployment

### Production Environment
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up HTTPS certificates
4. Configure email service
5. Set secure JWT secrets
6. Build frontend for production:
   ```bash
   cd client
   npm run build
   ```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=secure-production-secret
SMTP_HOST=your-smtp-server
FRONTEND_URL=https://your-domain.com
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env file

2. **Email Not Sending**
   - Verify SMTP configuration
   - Check email service credentials

3. **Frontend Not Loading**
   - Ensure client dependencies are installed
   - Check if backend server is running

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For support and questions, please contact the development team or create an issue in the repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
