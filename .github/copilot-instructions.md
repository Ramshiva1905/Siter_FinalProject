<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Boxinator AI Coding Agent Instructions

## Critical Database Architecture
This project uses a **three-tier database fallback system** in `/server/src/utils/databaseConnection.js`:
1. **Primary**: Prisma + Supabase PostgreSQL
2. **Secondary**: Direct Supabase REST API via `SupabaseAdapter` 
3. **Fallback**: Mock database for development

**Always use `getDatabase()` for database operations** - never instantiate clients directly. Check connection type with `getConnectionType()` and handle each accordingly:
```javascript
const db = await getDatabase();
const connectionType = getConnectionType();
if (connectionType === 'prisma') {
  // Use Prisma syntax: db.user.findUnique()
} else {
  // Use adapter methods: db.getUsers()
}
```

## Authentication Pattern
- JWT tokens stored in localStorage with automatic Axios interceptors
- Multi-layer auth middleware: `authenticateToken`, `requireAdmin`, `optionalAuth`
- 2FA support with TOTP (speakeasy library)
- Role-based access: `ADMINISTRATOR`, `REGISTERED_USER`, `GUEST`

## Development Workflow
**Start development servers:**
```bash
npm run dev  # Starts both frontend (3000) and backend (3001)
```

**Database operations:**
```bash
cd server
npm run migrate    # Run Prisma migrations
npm run db:seed    # Seed with test data
npm run db:reset   # Reset database
```

**Test accounts (seeded):**
- Admin: `admin@boxinator.com` / `admin123456`
- User: `user@boxinator.com` / `user123456`

## Key Patterns
- **API Routes**: Follow `/server/src/routes/` structure with express-validator
- **Frontend Services**: Use `/client/src/services/api.js` with automatic token injection
- **Error Handling**: Global error handler in `/server/src/middleware/errorHandler.js`
- **Logging**: Winston logger with file + console outputs in development
- **Email**: Nodemailer with Gmail SMTP (requires App Password, not regular password)

## Critical Files to Understand
- `/server/src/utils/databaseConnection.js` - Database abstraction layer
- `/server/src/middleware/auth.js` - JWT authentication middleware
- `/client/src/contexts/AuthContext.js` - Frontend auth state management
- `/server/src/routes/shipments.js` - Main business logic with guest user support

## Testing Strategy
- Backend: Jest with mocked email/logger in `/server/src/__tests__/setup.js`
- Frontend: React Testing Library with Create React App
- Database connections tested via dedicated test scripts in `/server/`

## Environment Dependencies
- Requires `.env` with Supabase credentials and Gmail App Password
- Handles missing connections gracefully via database fallback system
- Rate limiting and CORS configured for localhost development
