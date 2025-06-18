# Sharda Med - Online Pharmacy Management System

## Overview

Sharda Med is a comprehensive online pharmacy management system built with modern web technologies. The application serves both customers who want to order medicines online and administrators who manage the pharmacy operations. It features a complete e-commerce workflow with prescription support, inventory management, and order processing.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based authentication using express-session
- **File Upload**: Multer for handling medicine images and prescription files
- **Database Provider**: Neon serverless PostgreSQL

### Key Components

#### Authentication System
- Session-based authentication with PostgreSQL session store
- Role-based access control (admin/customer)
- Protected routes with middleware validation

#### Medicine Management
- Complete CRUD operations for medicines
- Category-based organization
- Inventory tracking with stock levels
- Image upload support for medicine photos
- Bulk upload via CSV and ZIP files

#### Prescription System
- Upload and review prescription documents
- Admin approval workflow
- Integration with order processing

#### Order Management
- Shopping cart functionality
- Multi-step checkout process
- Order status tracking
- Address management
- Payment processing interface

#### File Storage
- Local file storage for medicine images
- Prescription document uploads
- Organized directory structure in `/uploads`

## Data Flow

1. **Customer Journey**:
   - Browse medicines by category
   - Add items to cart
   - Upload prescriptions if required
   - Complete checkout with address selection
   - Track order status

2. **Admin Workflow**:
   - Manage medicine inventory
   - Review and approve prescriptions
   - Process orders and update status
   - Generate reports and analytics
   - Bulk upload medicines

3. **Data Persistence**:
   - All data stored in PostgreSQL database
   - Session data persisted for authentication
   - File uploads stored locally with database references

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **express-session**: Session management
- **bcrypt**: Password hashing
- **multer**: File upload handling
- **yauzl**: ZIP file processing for bulk uploads

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **@tanstack/react-query**: Server state management
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

## Deployment Strategy

### Development Environment
- **Setup Scripts**: Automated setup via `start.sh` (Unix) and `start.bat` (Windows)
- **Upload Directory**: Automatic creation of required upload directories
- **Database**: Schema migration with `npm run db:push`
- **Development Server**: Hot reload with Vite middleware integration

### Production Deployment
- **Build Process**: Vite builds client assets, esbuild bundles server code
- **Environment**: NODE_ENV=production with optimized configurations
- **Database**: Requires DATABASE_URL environment variable
- **File Storage**: Local storage with organized directory structure

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Port Configuration**: Internal port 5000, external port 80

## Changelog

- June 14, 2025. Initial setup
- June 14, 2025. Commented out multilingual routes and i18n functionality
  - Disabled language selector in navigation
  - Replaced translation function calls with static English text
  - Maintained single language (English) for simplified user experience
- June 14, 2025. Enhanced UI button visual feedback system
  - Added new "active" button variant with primary colors and enhanced styling
  - Improved Tabs component with stronger active state visual distinction
  - Enhanced Select component with better focus and selection indicators
  - Updated navigation buttons to use improved active states
  - Added enhanced card hover effects with scale and border animations
  - Improved Add to Cart buttons with gradient effects and disabled states
- June 14, 2025. Implemented scroll-to-search functionality on home page
  - Added automatic scroll back to search bar after adding items to cart
  - Enhanced user experience for continuous shopping workflow
  - Uses smooth scrolling animation with center positioning
- June 14, 2025. Fixed admin medicine management search functionality
  - Updated search query implementation to properly pass parameters to API
  - Search now correctly filters medicines by name, description, manufacturer, and category
  - Fixed frontend query function to handle search parameters correctly
- June 14, 2025. Fixed product image visibility in shopping cart
  - Updated cart component to display actual medicine images instead of placeholders
  - Added proper image handling with fallback for items without images
  - Improved cart visual consistency with medicine display pages
- June 14, 2025. Fixed order details product visibility issue
  - Added scrollable container for order items with max-height and overflow handling
  - Enhanced product display with images, dosage, and prescription badges
  - Improved layout with proper dividers and hover effects for better UX
  - Now displays all products in large orders instead of limiting visibility
  - Added prominent total amount display under order items with item count and payment method
- June 14, 2025. Fixed admin order management display issue
  - Restructured dialog layout with flexbox container and proper height constraints
  - Added scrollable container for order items in admin dialog view
  - Enhanced admin order details with product images and complete item information
  - Added total amount summary section for better order overview
  - Fixed JSX syntax errors and dialog structure
  - Resolved visibility problem when orders contain many products

## User Preferences

Preferred communication style: Simple, everyday language.