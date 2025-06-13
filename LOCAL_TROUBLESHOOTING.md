# Local Environment Troubleshooting Guide

## Quick Setup Commands

Run these commands in your project directory:

```bash
# 1. Set up directories and database
node setup-local-environment.js

# 2. Apply database migrations
npm run db:push

# 3. Start the application
npm run dev
```

## Common Issues & Solutions

### Issue 1: "Invalid file type" error for ZIP uploads
**Cause**: Old multer configuration being cached
**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue 2: Database schema out of sync
**Cause**: Local PostgreSQL missing image URL columns
**Solution**:
```bash
# Run the migration SQL script
psql -d your_database_name -f migrate-local-db.sql

# Or manually run drizzle push
npm run db:push
```

### Issue 3: Upload directories not found
**Cause**: Missing upload directories
**Solution**:
```bash
mkdir -p uploads/medicine-images uploads/prescriptions uploads/temp
chmod 755 uploads uploads/medicine-images uploads/prescriptions uploads/temp
```

### Issue 4: Orders page not loading properly
**Cause**: Database query issues or missing data
**Check**:
- Ensure orders table exists in your database
- Check console logs for specific errors
- Verify user authentication is working

## Files Modified for Your Reference

1. **server/routes.ts**
   - Added `tempDir` variable (line 76)
   - Created `zipUpload` multer configuration for ZIP files
   - Updated bulk photo upload route to use `zipUpload.single('photoZip')`

2. **client/src/pages/Orders.tsx**
   - Complete rewrite with order categorization
   - Added responsive design for mobile
   - Separated Active Orders and Delivered Orders tabs

## Database Requirements

Your PostgreSQL database must have these columns in the medicines table:
- `front_image_url` VARCHAR(500)
- `back_image_url` VARCHAR(500)
- `is_active` BOOLEAN DEFAULT true
- `created_at` TIMESTAMP DEFAULT NOW()
- `updated_at` TIMESTAMP DEFAULT NOW()

## Testing Bulk Upload

1. Login as admin
2. Go to Admin → Bulk Upload
3. Create a ZIP file with images named: "MedicineName-front.jpg"
4. Upload the ZIP file
5. Check console logs for success/failure messages

## Environment Variables Required

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
NODE_ENV=development
```

## Contact Points

If issues persist, check:
- PostgreSQL service is running
- Database connection string is correct
- Upload directory permissions are set properly
- All dependencies are installed correctly