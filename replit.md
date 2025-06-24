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
- June 18, 2025. Fixed admin order management display issue  
  - Restructured dialog layout with flexbox container and proper height constraints
  - Added scrollable container for order items in admin dialog view
  - Enhanced admin order details with product images and complete item information
  - Added total amount summary section for better order overview
  - Fixed JSX syntax errors and dialog structure
  - Resolved visibility problem when orders contain many products
  - Implemented scrollable Order Items section in correct Orders.tsx file with 192px height container
  - Separated scrollable items area from fixed total amount display for better UX
- June 18, 2025. Made admin order management pages fully responsive
  - Enhanced OrderManagement.tsx and Orders.tsx with mobile-first design
  - Added responsive breakpoints for all screen sizes (mobile, tablet, desktop)
  - Implemented adaptive text sizing and spacing throughout admin interfaces
  - Created mobile-friendly tab layouts with condensed text for small screens
  - Enhanced dialog responsiveness with proper viewport sizing and scrollable content
- June 18, 2025. Implemented search bar auto-clear after adding to cart
  - Added automatic search query clearing when items are added to cart on Home page
  - Extended same functionality to Medicines page for consistent user experience
  - Improves shopping workflow by eliminating manual search bar clearing
  - Allows users to immediately search for next product after adding items
  - Combined with existing scroll-to-search feature for optimal shopping flow
- June 18, 2025. Implemented comprehensive discount pricing system
  - Replaced single `price` column with `mrp`, `discount`, and `discountedPrice` structure
  - Added auto-calculation logic: discountedPrice = mrp - (mrp × discount / 100)
  - Frontend displays MRP with strikethrough when discount > 0%
  - Shows prominent discounted price as main price
  - Added "X% OFF" badges for products with discount ≥ 5%
  - Updated all price references across frontend (Medicines, Cart, Orders pages)
  - Enhanced visual appeal with discount indicators and savings display
  - Maintained backward compatibility with existing order data
  - Updated CSV template and bulk upload functionality for new pricing structure
  - CSV now includes MRP and discount columns instead of single price column
  - Bulk upload automatically calculates discounted prices on import
  - Changed "X% OFF" discount badges to light bright green color across all pages
  - Enhanced visual appeal with attractive green badges that highlight savings
  - Added smooth pulsing animation to discount badges for better attention-grabbing effect
- June 18, 2025. Implemented dynamic stock tracking system
  - Real-time stock calculation: total inventory minus items in carts
  - Stock validation prevents overselling when adding to cart
  - Automatic inventory deduction during order processing using FIFO method
  - Updated medicine queries to show actual available stock
  - Enhanced cart and order management with stock availability checks
  - Admin low-stock alerts now account for reserved cart items
  - Changed strikethrough MRP prices to red color for better visual distinction
- June 19, 2025. Fixed NaN pricing issues and order creation failures
  - Resolved cart subtotal calculation errors by using discountedPrice with proper fallbacks
  - Fixed checkout order creation by mapping unitPrice correctly from discountedPrice field
  - Updated all pricing references from deprecated 'price' field to 'discountedPrice'
  - Added comprehensive error logging and validation for order creation process
  - Enhanced order creation with detailed debugging and proper error handling
- June 19, 2025. Implemented comprehensive responsive invoice system
  - Made invoice popup fully responsive for all screen sizes (mobile, tablet, desktop)
  - Added mobile-first design with adaptive layouts and proper breakpoints
  - Implemented dual-layout system: responsive table for desktop, card layout for mobile
  - Enhanced PDF generation with proper scaling, margins, and QR code integration
  - Fixed QR code generation using qrcode library with proper data encoding
  - Replaced all currency symbols with INR (₹) throughout invoice system
  - Added comprehensive order summary with MRP, discounts, taxes, and totals
  - Optimized PDF output with centered positioning and improved readability
  - Enhanced WhatsApp sharing with formatted invoice details
- June 19, 2025. Enhanced invoice order details section with professional layout
  - Redesigned order details section with professional card-based layout
  - Added comprehensive information grid displaying order/invoice numbers, dates, and times
  - Implemented order summary cards showing subtotal, tax (18%), and total amount
  - Enhanced typography with color-coded status badges and proper visual hierarchy
  - Added monospace fonts for order/invoice numbers for better readability
  - Integrated INR currency symbols throughout for consistent Indian market branding
  - Fixed QR code styling and content to include essential order verification information
  - Simplified CSS to ensure reliable PDF generation across all browsers
- June 20, 2025. Implemented comprehensive Payment Analytics with WhatsApp integration
  - Added complete Payment Analytics dashboard accessible via Total Sales card click
  - Integrated WhatsApp payment reminder system with professional message templates
  - Added payment status tracking (Paid/Pending) with real-time filtering capabilities
  - Implemented search functionality by order number, customer name, or phone
  - Added date range filtering (Today/Week/Month/All) and CSV export functionality
  - Enhanced database schema with paymentStatus and createdAt fields for orders
  - Fixed decimal number conversion errors in PaymentAnalytics component display
  - Added bulk WhatsApp reminder sending for efficient payment follow-ups
- June 20, 2025. Implemented manual payment status management system
  - Added Payment Status Management UI in admin Orders.tsx for delivered orders
  - Payment status controls appear when order status is set to "delivered"
  - Blue highlighted section with "Mark as Paid" and "Mark as Pending" buttons
  - Available in both "Completed/Done" and "All Orders" sections
  - Separate payment status tracking independent of order delivery status
  - Real payment data integration with Payment Analytics dashboard
  - Fixed sales calculation logic: Total sales now based on paymentStatus="paid" instead of delivery status
  - Delivery confirmation no longer automatically adds to sales amount
  - Only orders marked as "paid" contribute to total sales and analytics calculations
  - Implemented irreversible payment status: "paid" status cannot be changed back to "pending"
  - Added frontend UI restrictions and backend API validation for payment status security
  - Enhanced UI with warning messages and visual indicators for payment status permanence
- June 20, 2025. Implemented automatic phone field population in checkout address form
  - Phone number field auto-populates with user's current profile phone during checkout
  - Added visual indicator showing "✓ Auto-filled from your profile" when phone is populated
  - Full name field also auto-populates with firstName + lastName from profile
  - Prevents phone number inconsistency between profile and order billing addresses
  - Enhanced user experience with pre-filled checkout forms and proper form reset handling
- June 20, 2025. Streamlined prescription approval workflow in admin panel
  - Moved prescription approval functionality directly into order details eye menu
  - Added inline prescription approval section with required reason field for admin decisions
  - Integrated approve/reject buttons with mandatory review notes within Prescription Details
  - Removed separate "Review Prescriptions" card from admin dashboard for simplified workflow
  - Enhanced UX by consolidating prescription management into single order management interface
  - Prescription approval now occurs contextually within order processing for better admin efficiency
- June 24, 2025. Implemented Complete Enhanced Batch Management System with FIFO inventory rotation and 3-month minimum shelf life policy
  - Enhanced database schema with batch tracking including batch numbers, expiry dates, and quantities
  - Added batchId column to order_items table for complete inventory traceability
  - Implemented FIFO (First In, First Out) allocation logic for automatic stock deduction from earliest expiry batches
  - Created comprehensive batch management API with CRUD operations and expiry alerts
  - Added Enhanced Batch Management admin page with professional analytics dashboard
  - Integrated batch allocation into order processing for proper pharmaceutical inventory control
  - Updated createOrder method to use batch allocation system instead of simple stock deduction
  - Added expiring batches alert system with 30-day advance warnings for better inventory management
  - Enhanced expired batch handling: excludes expired batches from stock calculations and order allocation
  - Added validation to prevent adding/updating batches with past expiry dates
  - Frontend displays clear expired status with red badges and prevents future date selection before today
  - Implemented comprehensive Expired Medicine Management system with disposal tracking
  - Added disposal workflow with reason recording for regulatory compliance
  - Created disposal history tracking with complete audit trail for disposed batches
  - Added estimated loss value calculations and expired inventory summary dashboard
  - Completed Enhanced Batch Management with comprehensive features:
    * Statistics dashboard with total, active, expiring, and expired batch counts
    * Advanced search functionality by batch number with real-time filtering
    * Status filtering (all, active, expiring soon, expired) and sorting options
    * Estimated value calculations for individual batches and totals
    * CSV export functionality for compliance reporting
    * Enhanced table with days until expiry calculation and color-coded indicators
    * Batch summary section with filtered results, totals, and averages
    * Professional UI with responsive design and comprehensive analytics
  - Implemented 3-month minimum shelf life policy for customer protection
    * Only medicines with 3+ months remaining shelf life are available for purchase
    * Short-expiry batches (under 3 months) are excluded from customer-facing inventory
    * FIFO allocation updated to respect minimum shelf life requirements
    * Enhanced error messaging for insufficient stock scenarios
    * Fixed order creation issues with proper totalPrice calculation for batch allocations
  - Added configurable shelf life management system for easy policy adjustments
    * Created admin System Configuration page for managing minimum shelf life requirements
    * Centralized configuration in server/config.ts with validation and helper functions
    * API endpoints for reading and updating shelf life policy (1-12 months range)
    * Real-time policy updates that immediately affect customer-facing inventory
    * Professional UI with visual policy impact explanations and current system status
- June 24, 2025. Implemented Multi-Tenant Super Admin System with Role-Based Access Control
  - Enhanced database schema with stores table for multi-tenant medical store management
  - Updated user roles to numeric system: 0 (super_admin), 1 (admin), 2 (customer)
  - Added storeId foreign key to users and medicines tables for tenant isolation
  - Created comprehensive Super Admin Dashboard with platform-wide analytics
  - Implemented Store Onboarding workflow with 2-step process (store info + admin creation)
  - Added Store Management interface with search, filtering, and deactivation capabilities
  - Moved System Configuration to Super Admin only for platform-wide policy control
  - Enhanced role-based routing and access control throughout application
  - Added super admin user creation and authentication flow
  - Ensures proper data isolation between different medical stores on the platform

## User Preferences

Preferred communication style: Simple, everyday language.