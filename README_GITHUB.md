# 📦 Boxinator - Shipping Management System

A modern full-stack shipping management application built with React, Node.js, and PostgreSQL. Boxinator provides comprehensive shipment tracking, user management, and administrative tools for shipping companies.

## 🚀 Features

### For Users
- **Account Management**: Registration, login, 2FA support
- **Shipment Creation**: Create shipments as guest or registered user
- **Shipment Tracking**: Track shipment status and history
- **Profile Management**: Update personal information and preferences

### For Administrators
- **Dashboard**: Comprehensive admin dashboard with analytics
- **Shipment Management**: Update shipment status, add notes
- **User Management**: View and manage user accounts
- **Country Management**: Manage shipping destinations and pricing

### Technical Features
- **Multi-tier Database**: Prisma + Supabase PostgreSQL with REST API fallback
- **Authentication**: JWT tokens with refresh support
- **Email Integration**: Welcome emails and notifications
- **Responsive Design**: Material-UI components optimized for all devices
- **Real-time Updates**: Live shipment status tracking

## 🏗️ Architecture

```
📁 Boxinator/
├── 📁 client/          # React.js Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/   # Reusable UI components
│   │   ├── 📁 contexts/     # React Context providers
│   │   ├── 📁 pages/        # Application pages
│   │   ├── 📁 services/     # API service layer
│   │   └── 📁 utils/        # Utility functions
│   └── 📁 public/      # Static assets
├── 📁 server/          # Node.js Backend
│   ├── 📁 src/
│   │   ├── 📁 routes/       # API endpoints
│   │   ├── 📁 middleware/   # Express middleware
│   │   ├── 📁 utils/        # Backend utilities
│   │   └── 📁 __tests__/    # Test files
│   └── 📁 prisma/      # Database schema and migrations
└── 📁 docs/           # Documentation
```

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Material-UI** - Component library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma ORM** - Database toolkit
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Winston** - Logging
- **Jest** - Testing framework

### Database & Infrastructure
- **Supabase PostgreSQL** - Primary database
- **Prisma migrations** - Database versioning
- **Three-tier fallback system** - Prisma → Supabase REST → Mock DB

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Supabase account (for database)
- Gmail account with App Password (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/boxinator.git
   cd boxinator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   DIRECT_URL="postgresql://user:password@host:port/database"
   SUPABASE_URL="your-supabase-url"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   JWT_SECRET="your-jwt-secret"
   GMAIL_USER="your-email@gmail.com"
   GMAIL_APP_PASSWORD="your-app-password"
   ```

4. **Run database migrations**
   ```bash
   cd server
   npm run migrate
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   cd ..
   npm run dev
   ```

   This starts:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## 📊 Database Schema

### Core Models
- **Users**: Account management with roles (Guest, Registered User, Administrator)
- **Countries**: Shipping destinations with pricing multipliers
- **Shipments**: Package tracking with status history
- **StatusHistory**: Audit trail of shipment status changes

### Key Features
- CUID-based primary keys for distributed systems
- Enum types for status and account types
- Comprehensive foreign key relationships
- Automated timestamps

## 🔐 Authentication & Security

- **JWT Authentication**: Secure token-based auth with configurable expiration
- **Two-Factor Authentication**: TOTP support using Google Authenticator
- **Role-based Access Control**: Guest, User, and Admin permissions
- **Rate Limiting**: Protection against brute force attacks
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configured for development and production

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Email verification

### Shipments
- `GET /api/shipments` - List shipments
- `POST /api/shipments` - Create shipment
- `PUT /api/shipments/:id` - Update shipment
- `GET /api/shipments/:id` - Get shipment details

### Countries
- `GET /api/countries` - List active countries
- `PUT /api/countries/:id` - Update country (admin only)

## 🚀 Deployment

### Environment Setup
1. Set production environment variables
2. Build the React application: `cd client && npm run build`
3. Set up database migrations on production
4. Configure reverse proxy (nginx recommended)

### Database Deployment
The application uses a three-tier database system:
1. **Primary**: Prisma + Supabase PostgreSQL
2. **Fallback**: Direct Supabase REST API
3. **Development**: Mock database for testing

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Check Supabase credentials and network connectivity
2. **Email Errors**: Verify Gmail App Password configuration
3. **Port Conflicts**: Ensure ports 3000 and 3001 are available
4. **CUID Generation**: ID generation handled automatically by the system

### Debug Commands
```bash
# Check database connection
cd server && node test-supabase-connection.js

# Verify authentication
cd server && node test-auth-flow.js

# Reset database
cd server && npm run db:reset
```

## 📈 Performance Features

- **Lazy Loading**: React components loaded on demand
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Response Caching**: Cached API responses for frequently accessed data
- **Error Boundaries**: Graceful error handling in React

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI for the component library
- Supabase for the database infrastructure
- Prisma for the excellent ORM
- React team for the amazing frontend framework

## 📞 Support

For support, email support@boxinator.com or create an issue in this repository.

---

**Built with ❤️ by the Boxinator Team**
