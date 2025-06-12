# Medicine Image Upload Setup Guide

This guide ensures the medicine image upload functionality works seamlessly in local development environments.

## Quick Setup

Run the setup script to automatically configure all required directories and permissions:

```bash
node setup-uploads.js
```

## Manual Setup (if needed)

### 1. Create Upload Directories

```bash
mkdir -p uploads/medicine-images
mkdir -p uploads/prescriptions
mkdir -p uploads/temp
```

### 2. Set Proper Permissions (Unix/Linux/macOS)

```bash
chmod 755 uploads
chmod 755 uploads/medicine-images
chmod 755 uploads/prescriptions
chmod 755 uploads/temp
```

### 3. Windows Setup

On Windows, ensure the uploads directory has write permissions for the current user.

## Upload Functionality

### Individual Medicine Photo Upload

1. Navigate to Admin → Medicine Management
2. Click the camera icon for any medicine
3. Upload front and/or back images
4. Supported formats: JPG, JPEG, PNG
5. Maximum file size: 5MB per image

### Bulk Photo Upload (CSV + ZIP)

1. Navigate to Admin → Bulk Upload
2. First upload your CSV file with medicine data
3. Then upload a ZIP file containing medicine photos
4. Photo naming convention: `MedicineName-front.jpg` and `MedicineName-back.jpg`
5. Example: `Paracetamol 500mg-front.jpg`, `Paracetamol 500mg-back.jpg`

## File Structure

```
project-root/
├── uploads/
│   ├── medicine-images/     # Individual medicine photos
│   ├── prescriptions/       # Prescription uploads
│   └── temp/               # Temporary files during processing
├── server/
│   └── routes.ts           # Upload endpoints
└── client/
    └── src/
        └── pages/
            ├── Medicines.tsx           # Customer medicine view
            └── admin/
                ├── MedicineManagement.tsx  # Photo upload interface
                └── BulkUpload.tsx         # Bulk upload interface
```

## Environment Variables

No additional environment variables are required. The system automatically:
- Creates upload directories on startup
- Configures proper file permissions
- Handles cross-platform path differences

## Troubleshooting

### Permission Errors
- Run `node setup-uploads.js` to fix directory permissions
- Ensure the Node.js process has write access to the project directory

### File Upload Fails
- Check if uploads directory exists and is writable
- Verify file size is under 5MB
- Ensure file format is JPG, JPEG, or PNG

### Images Not Displaying
- Verify the image URLs in the database point to existing files
- Check that the uploads directory is being served by Express
- Ensure file paths use forward slashes in URLs

## Security Notes

- Uploaded files are stored locally in the uploads directory
- File types are strictly validated on upload
- File names are sanitized to prevent directory traversal
- Files are served through Express static middleware with proper headers

## Development Notes

- The uploads directory is excluded from git by default
- .gitkeep files preserve directory structure in version control
- File cleanup happens automatically for temporary files
- Error logging provides detailed upload failure information