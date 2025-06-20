import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertAddressSchema, 
  insertMedicineSchema,
  insertMedicineInventorySchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertPrescriptionSchema,
  notifications,
  prescriptions,
  orders,
  orderItems,
  users,
  addresses
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import yauzl from "yauzl";

// Session configuration
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "sharda-med-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// Authentication middleware
const isAuthenticated = async (req: any, res: Response, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  req.user = user;
  next();
};

// Admin middleware
const isAdmin = (req: any, res: Response, next: any) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// File upload configuration with cross-platform support
const uploadDir = path.resolve(process.cwd(), "uploads");
const medicineImagesDir = path.join(uploadDir, "medicine-images");
const prescriptionDir = path.join(uploadDir, "prescriptions");
const tempDir = path.join(uploadDir, "temp");

// Ensure upload directories exist with proper permissions
const ensureDirectoryExists = (dirPath: string) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
      console.log(`Created directory: ${dirPath}`);
    }
    // Verify directory is writable
    fs.accessSync(dirPath, fs.constants.W_OK);
  } catch (error) {
    console.error(`Failed to create/access directory ${dirPath}:`, error);
    throw new Error(`Upload directory not accessible: ${dirPath}`);
  }
};

// Initialize upload directories
ensureDirectoryExists(uploadDir);
ensureDirectoryExists(medicineImagesDir);
ensureDirectoryExists(prescriptionDir);

// Enhanced multer configuration with better error handling
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        // Ensure destination directory exists before upload
        ensureDirectoryExists(uploadDir);
        cb(null, uploadDir);
      } catch (error) {
        cb(error as Error, '');
      }
    },
    filename: (req, file, cb) => {
      try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        const sanitizedName = file.fieldname.replace(/[^a-zA-Z0-9]/g, '');
        cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
      } catch (error) {
        cb(error as Error, '');
      }
    }
  }),
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload JPEG, PNG, or PDF files only.'));
    }
  },
});

// ZIP file upload configuration for bulk photo uploads
const zipUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        ensureDirectoryExists(tempDir);
        cb(null, tempDir);
      } catch (error) {
        cb(error as Error, '');
      }
    },
    filename: (req, file, cb) => {
      try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `bulk-photos-${uniqueSuffix}.zip`);
      } catch (error) {
        cb(error as Error, '');
      }
    }
  }),
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB for ZIP files
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
    const allowedExtensions = ['.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload ZIP files only.'));
    }
  },
});

// Medicine image upload configuration with enhanced local environment support
const medicineImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        // Ensure medicine images directory exists before upload
        ensureDirectoryExists(medicineImagesDir);
        cb(null, medicineImagesDir);
      } catch (error) {
        cb(error as Error, '');
      }
    },
    filename: (req, file, cb) => {
      try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        const sanitizedFieldName = file.fieldname.replace(/[^a-zA-Z0-9]/g, '');
        cb(null, `medicine-${sanitizedFieldName}-${uniqueSuffix}${ext}`);
      } catch (error) {
        cb(error as Error, '');
      }
    }
  }),
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 2 // Support both front and back images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload JPEG, PNG, or JPG images only.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize upload system on server start
  try {
    console.log('🔧 Initializing medicine upload system...');
    ensureDirectoryExists(uploadDir);
    ensureDirectoryExists(medicineImagesDir);
    ensureDirectoryExists(prescriptionDir);
    console.log('✅ Upload system initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize upload system:', error);
    throw error;
  }

  // Session middleware
  app.use(getSession());

  // Serve uploaded files with proper headers
  app.use('/uploads', express.static(uploadDir, {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));

  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await storage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      (req.session as any).userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      (req.session as any).userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session?.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res: Response) => {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // User profile routes
  app.get("/api/profile", isAuthenticated, async (req: any, res: Response) => {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  app.put("/api/profile", isAuthenticated, async (req: any, res: Response) => {
    try {
      const updateData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Profile update failed" });
    }
  });

  // Get user by ID (for fresh user data in invoices)
  app.get("/api/user/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Address routes
  app.get("/api/addresses", isAuthenticated, async (req: any, res: Response) => {
    try {
      const addresses = await storage.getAddressesByUserId(req.user.id);
      res.json(addresses);
    } catch (error) {
      console.error("Get addresses error:", error);
      res.status(500).json({ message: "Failed to get addresses" });
    }
  });

  app.post("/api/addresses", isAuthenticated, async (req: any, res: Response) => {
    try {
      const addressData = insertAddressSchema.parse({ ...req.body, userId: req.user.id });
      const address = await storage.createAddress(addressData);
      res.json(address);
    } catch (error) {
      console.error("Create address error:", error);
      res.status(500).json({ message: "Failed to create address" });
    }
  });

  app.put("/api/addresses/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertAddressSchema.partial().parse(req.body);
      const address = await storage.updateAddress(id, updateData);
      res.json(address);
    } catch (error) {
      console.error("Update address error:", error);
      res.status(500).json({ message: "Failed to update address" });
    }
  });

  app.delete("/api/addresses/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAddress(id);
      res.json({ message: "Address deleted" });
    } catch (error) {
      console.error("Delete address error:", error);
      res.status(500).json({ message: "Failed to delete address" });
    }
  });

  // Medicine routes
  app.get("/api/medicines", async (req: Request, res: Response) => {
    try {
      const { search } = req.query;
      let medicines;
      
      if (search && typeof search === "string") {
        medicines = await storage.searchMedicines(search);
      } else {
        medicines = await storage.getMedicines();
      }
      
      res.json(medicines);
    } catch (error) {
      console.error("Get medicines error:", error);
      res.status(500).json({ message: "Failed to get medicines" });
    }
  });

  app.get("/api/medicines/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const medicine = await storage.getMedicineById(id);
      if (!medicine) {
        return res.status(404).json({ message: "Medicine not found" });
      }
      res.json(medicine);
    } catch (error) {
      console.error("Get medicine error:", error);
      res.status(500).json({ message: "Failed to get medicine" });
    }
  });

  app.get("/api/medicine-categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getMedicineCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Failed to get categories" });
    }
  });

  app.post("/api/admin/medicine-categories", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { name, description, isScheduleH } = req.body;
      
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: "Category name is required and must be at least 2 characters" });
      }

      const category = await storage.createMedicineCategory(
        name.trim(),
        description?.trim(),
        Boolean(isScheduleH)
      );
      
      res.status(201).json(category);
    } catch (error: any) {
      console.error("Create category error:", error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ message: "Category name already exists" });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  // Medicine photo upload route
  app.post("/api/admin/medicines/:id/photos", isAuthenticated, isAdmin, 
    medicineImageUpload.fields([
      { name: 'frontImage', maxCount: 1 },
      { name: 'backImage', maxCount: 1 }
    ]), 
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        const updateData: any = {};
        
        if (files.frontImage && files.frontImage[0]) {
          updateData.frontImageUrl = `/uploads/medicine-images/${files.frontImage[0].filename}`;
        }
        
        if (files.backImage && files.backImage[0]) {
          updateData.backImageUrl = `/uploads/medicine-images/${files.backImage[0].filename}`;
        }
        
        const medicine = await storage.updateMedicine(id, updateData);
        res.json(medicine);
      } catch (error) {
        console.error("Upload medicine photos error:", error);
        res.status(500).json({ message: "Failed to upload photos" });
      }
    }
  );

  // Bulk photo upload route
  app.post("/api/admin/medicines/bulk-photos", isAuthenticated, isAdmin, 
    zipUpload.single('photoZip'), 
    async (req: Request, res: Response) => {
      try {
        const zipFile = req.file;
        if (!zipFile) {
          return res.status(400).json({ message: "No ZIP file provided" });
        }

        const results = { success: 0, failed: 0, errors: [] as string[] };
        const medicines = await storage.getMedicines();
        
        // Create a map of medicine names to IDs for quick lookup
        const medicineMap = new Map();
        medicines.forEach((medicine: any) => {
          medicineMap.set(medicine.name.toLowerCase(), medicine.id);
        });

        await new Promise((resolve, reject) => {
          yauzl.open(zipFile.path, { lazyEntries: true }, (err, zipfile) => {
            if (err) {
              reject(err);
              return;
            }

            zipfile.readEntry();
            zipfile.on("entry", (entry) => {
              if (/\/$/.test(entry.fileName)) {
                // Directory entry, skip
                zipfile.readEntry();
                return;
              }

              // Extract file info
              const fileName = path.basename(entry.fileName);
              const ext = path.extname(fileName).toLowerCase();
              
              if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
                zipfile.readEntry();
                return;
              }

              // Parse filename: "MedicineName-front.jpg" or "MedicineName-back.jpg"
              const match = fileName.match(/^(.+)-(front|back)\.(jpg|jpeg|png)$/i);
              if (!match) {
                results.errors.push(`Invalid filename format: ${fileName}`);
                zipfile.readEntry();
                return;
              }

              const [, medicineName, imageType] = match;
              const medicineId = medicineMap.get(medicineName.toLowerCase());
              
              if (!medicineId) {
                results.errors.push(`Medicine not found: ${medicineName}`);
                zipfile.readEntry();
                return;
              }

              // Extract and save the image
              zipfile.openReadStream(entry, (err, readStream) => {
                if (err) {
                  results.errors.push(`Failed to extract ${fileName}: ${err.message}`);
                  zipfile.readEntry();
                  return;
                }

                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const outputFileName = `medicine-${imageType}-${uniqueSuffix}${ext}`;
                const outputPath = path.join(medicineImagesDir, outputFileName);
                const writeStream = fs.createWriteStream(outputPath);

                readStream.pipe(writeStream);
                writeStream.on('close', async () => {
                  try {
                    // Update medicine with image URL
                    const imageUrl = `/uploads/medicine-images/${outputFileName}`;
                    const updateData = imageType === 'front' 
                      ? { frontImageUrl: imageUrl }
                      : { backImageUrl: imageUrl };
                    
                    await storage.updateMedicine(medicineId, updateData);
                    results.success++;
                  } catch (error: any) {
                    results.errors.push(`Failed to update ${medicineName}: ${error.message}`);
                    results.failed++;
                  }
                  zipfile.readEntry();
                });

                writeStream.on('error', (error) => {
                  results.errors.push(`Failed to save ${fileName}: ${error.message}`);
                  results.failed++;
                  zipfile.readEntry();
                });
              });
            });

            zipfile.on("end", () => {
              // Clean up the uploaded ZIP file
              fs.unlinkSync(zipFile.path);
              resolve(results);
            });

            zipfile.on("error", (err) => {
              reject(err);
            });
          });
        });

        res.json(results);
      } catch (error) {
        console.error("Bulk photo upload error:", error);
        res.status(500).json({ message: "Failed to process photo upload" });
      }
    }
  );

  // Admin medicine management routes
  app.post("/api/admin/medicines", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const medicineData = insertMedicineSchema.parse(req.body);
      const medicine = await storage.createMedicine(medicineData);
      res.json(medicine);
    } catch (error) {
      console.error("Create medicine error:", error);
      res.status(500).json({ message: "Failed to create medicine" });
    }
  });

  app.put("/api/admin/medicines/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertMedicineSchema.partial().parse(req.body);
      const medicine = await storage.updateMedicine(id, updateData);
      res.json(medicine);
    } catch (error) {
      console.error("Update medicine error:", error);
      res.status(500).json({ message: "Failed to update medicine" });
    }
  });

  app.delete("/api/admin/medicines/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMedicine(id);
      res.json({ message: "Medicine deleted" });
    } catch (error) {
      console.error("Delete medicine error:", error);
      res.status(500).json({ message: "Failed to delete medicine" });
    }
  });

  app.get("/api/admin/low-stock", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const lowStockMedicines = await storage.getLowStockMedicines();
      res.json(lowStockMedicines);
    } catch (error) {
      console.error("Get low stock error:", error);
      res.status(500).json({ message: "Failed to get low stock medicines" });
    }
  });

  // Medicine inventory routes
  app.post("/api/admin/inventory", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const inventoryData = insertMedicineInventorySchema.parse(req.body);
      const inventory = await storage.createMedicineInventory(inventoryData);
      res.json(inventory);
    } catch (error) {
      console.error("Create inventory error:", error);
      res.status(500).json({ message: "Failed to create inventory" });
    }
  });

  app.get("/api/admin/inventory/:medicineId", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const medicineId = parseInt(req.params.medicineId);
      const inventory = await storage.getMedicineInventory(medicineId);
      res.json(inventory);
    } catch (error) {
      console.error("Get inventory error:", error);
      res.status(500).json({ message: "Failed to get inventory" });
    }
  });

  app.put("/api/admin/inventory/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertMedicineInventorySchema.partial().parse(req.body);
      const inventory = await storage.updateMedicineInventory(id, updateData);
      res.json(inventory);
    } catch (error) {
      console.error("Update inventory error:", error);
      res.status(500).json({ message: "Failed to update inventory" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req: any, res: Response) => {
    try {
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ message: "Failed to get cart" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req: any, res: Response) => {
    try {
      const cartData = insertCartItemSchema.parse({ ...req.body, userId: req.user.id });
      const cartItem = await storage.addToCart(cartData);
      res.json(cartItem);
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Update cart error:", error);
      res.status(500).json({ message: "Failed to update cart" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req: any, res: Response) => {
    try {
      await storage.clearCart(req.user.id);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req: any, res: Response) => {
    try {
      const orders = await storage.getOrdersByUserId(req.user.id);
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Failed to get orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user owns the order or is admin
      if (order.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "Failed to get order" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { items, billingAddressId, shippingAddressId, prescriptionId, totalAmount, hasScheduleH } = req.body;
      
      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one item" });
      }
      
      if (!totalAmount || parseFloat(totalAmount) <= 0) {
        return res.status(400).json({ message: "Invalid total amount" });
      }
      
      console.log("Creating order with data:", { 
        userId: req.user.id, 
        itemsCount: items.length, 
        totalAmount,
        billingAddressId,
        shippingAddressId
      });
      
      // Determine order status based on whether it contains Schedule H medicines and prescription status
      let orderStatus = "confirmed"; // Default for non-Schedule H orders
      let notificationMessage = `Your order has been confirmed and will be processed shortly.`;
      
      if (hasScheduleH) {
        if (prescriptionId) {
          try {
            // Check if the prescription is already approved
            const prescription = await db
              .select()
              .from(prescriptions)
              .where(eq(prescriptions.id, prescriptionId))
              .limit(1);
            
            if (prescription.length > 0 && prescription[0].status === "approved") {
              // If prescription is approved, confirm the order immediately
              orderStatus = "confirmed";
              notificationMessage = `Your Order will be confirmed and processed shortly. Approved prescription linked successfully.`;
            } else {
              // If prescription is pending or not found, wait for review
              orderStatus = "pending_prescription_review";
              notificationMessage = `Your Order has been placed and is awaiting prescription review. You'll be notified once approved.`;
            }
          } catch (prescError) {
            console.error("Error checking prescription:", prescError);
            // Continue with pending status if prescription check fails
            orderStatus = "pending_prescription_review";
            notificationMessage = `Your Order has been placed and is awaiting prescription review. You'll be notified once approved.`;
          }
        } else {
          // No prescription provided, wait for upload and review
          orderStatus = "pending_prescription_review";
          notificationMessage = `Your order has been placed and is awaiting prescription review. You'll be notified once approved.`;
        }
      }
      
      const orderData = {
        userId: req.user.id,
        totalAmount: totalAmount.toString(),
        billingAddressId: billingAddressId || null,
        shippingAddressId: shippingAddressId || null,
        prescriptionId: prescriptionId || null,
        paymentMethod: "cod",
        status: orderStatus,
      };

      console.log("Calling storage.createOrder with:", orderData);
      const order = await storage.createOrder(orderData, items);
      console.log("Order created successfully:", order.id);
      
      // Clear cart after successful order
      try {
        await storage.clearCart(req.user.id);
        console.log("Cart cleared successfully");
      } catch (cartError) {
        console.error("Error clearing cart:", cartError);
        // Don't fail the order if cart clearing fails
      }
      
      // Create notification for customer
      try {
        await storage.createNotification({
          userId: req.user.id,
          type: "order_update",
          title: "Order Placed Successfully",
          message: notificationMessage,
        });
        console.log("Customer notification created");
      } catch (notifError) {
        console.error("Error creating customer notification:", notifError);
        // Don't fail the order if notification fails
      }
      
      // If order has Schedule H medicines, notify admin for prescription review
      if (hasScheduleH) {
        try {
          const adminUsers = await storage.getUserByEmail("admin@test.com");
          if (adminUsers) {
            await storage.createNotification({
              userId: adminUsers.id,
              type: "order_prescription_review",
              title: "Order Needs Prescription Review",
              message: `Order #${order.orderNumber} contains Schedule H medicines and requires prescription approval.`,
            });
            console.log("Admin notification created");
          }
        } catch (adminNotifError) {
          console.error("Error creating admin notification:", adminNotifError);
          // Don't fail the order if admin notification fails
        }
      }
      
      res.json(order);
    } catch (error) {
      console.error("Create order error:", error);
      console.error("Error stack:", error.stack);
      
      // Provide more specific error messages
      if (error.message.includes("Insufficient stock")) {
        res.status(400).json({ message: error.message });
      } else if (error.message.includes("violates foreign key constraint")) {
        res.status(400).json({ message: "Invalid address or prescription reference" });
      } else {
        res.status(500).json({ message: "Failed to create order. Please try again." });
      }
    }
  });

  // Admin order management
  app.get("/api/admin/orders", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getAllOrders();
      // Debug: Log user data for first order
      if (orders.length > 0) {
        console.log("Admin orders - First order user data:", orders[0].user);
      }
      res.json(orders);
    } catch (error) {
      console.error("Get all orders error:", error);
      res.status(500).json({ message: "Failed to get orders" });
    }
  });

  app.put("/api/admin/orders/:id/status", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const order = await storage.updateOrderStatus(id, status);
      
      // Create notification for customer with formatted status
      const words = status.replace(/_/g, ' ').split(' ');
      const formattedStatus = words.map((word: string) => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      await storage.createNotification({
        userId: order.userId,
        type: "order_update",
        title: "Order Status Updated",
        message: `Your Order ${order.orderNumber} status has been **${formattedStatus}**.`,
      });
      
      res.json(order);
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.put("/api/admin/orders/:id/payment-status", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentStatus } = req.body;
      
      if (!["paid", "pending", "failed"].includes(paymentStatus)) {
        return res.status(400).json({ message: "Invalid payment status" });
      }
      
      // Get current order to check existing payment status
      const currentOrder = await storage.getOrderById(id);
      if (!currentOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Prevent changing from "paid" to any other status (irreversible)
      if (currentOrder.paymentStatus === "paid" && paymentStatus !== "paid") {
        return res.status(400).json({ 
          message: "Payment status cannot be changed from 'paid' to another status. Paid status is irreversible for security." 
        });
      }
      
      const order = await storage.updateOrderPaymentStatus(id, paymentStatus);
      
      // Create notification for customer
      await storage.createNotification({
        userId: order.userId,
        type: "payment_update",
        title: "Payment Status Updated",
        message: `Payment for Order ${order.orderNumber} has been marked as ${paymentStatus}.`,
      });
      
      res.json(order);
    } catch (error) {
      console.error("Update payment status error:", error);
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // Prescription routes
  app.get("/api/prescriptions", isAuthenticated, async (req: any, res: Response) => {
    try {
      const prescriptions = await storage.getPrescriptionsByUserId(req.user.id);
      res.json(prescriptions);
    } catch (error) {
      console.error("Get prescriptions error:", error);
      res.status(500).json({ message: "Failed to get prescriptions" });
    }
  });

  app.post("/api/prescriptions", isAuthenticated, upload.single("file"), async (req: any, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }

      const prescriptionData = {
        userId: req.user.id,
        fileName: req.file.filename,
        filePath: req.file.path,
        status: "pending",
      };

      const prescription = await storage.createPrescription(prescriptionData);
      
      // Create notification for admin
      const adminUsers = await storage.getUserByEmail("admin@test.com"); // You might want to get all admins
      if (adminUsers) {
        await storage.createNotification({
          userId: adminUsers.id,
          type: "prescription_upload",
          title: "New Prescription Upload",
          message: `A new prescription has been uploaded by ${req.user.firstName} ${req.user.lastName}.`,
        });
      }
      
      res.json(prescription);
    } catch (error) {
      console.error("Upload prescription error:", error);
      res.status(500).json({ message: "Failed to upload prescription" });
    }
  });

  // Admin prescription management
  app.get("/api/admin/prescriptions", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const prescriptions = await storage.getPendingPrescriptions();
      res.json(prescriptions);
    } catch (error) {
      console.error("Get pending prescriptions error:", error);
      res.status(500).json({ message: "Failed to get pending prescriptions" });
    }
  });

  app.get("/api/admin/prescriptions/all", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const prescriptions = await storage.getAllPrescriptions();
      res.json(prescriptions);
    } catch (error) {
      console.error("Get all prescriptions error:", error);
      res.status(500).json({ message: "Failed to get all prescriptions" });
    }
  });

  app.put("/api/admin/prescriptions/:id", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      
      const prescription = await storage.updatePrescriptionStatus(id, status, req.user.id, notes);
      
      // If prescription is approved, automatically approve any pending orders using this prescription
      if (status === "approved") {
        // Find orders that are pending prescription review with this prescription
        const allOrders = await storage.getAllOrders();
        const pendingOrders = allOrders.filter(order => 
          order.prescriptionId === prescription.id && 
          order.status === "pending_prescription_review"
        );
        
        // Approve all pending orders with this prescription
        for (const order of pendingOrders) {
          await storage.updateOrderStatus(order.id, "confirmed");
          
          // Notify customer that their order is now confirmed
          await storage.createNotification({
            userId: order.userId,
            type: "order_update",
            title: "Order Confirmed",
            message: `Your order #${order.orderNumber} has been confirmed and will be processed shortly.`,
          });
        }
      }
      
      // Create notification for customer about prescription status
      await storage.createNotification({
        userId: prescription.userId,
        type: "prescription_status",
        title: "Prescription Status Updated",
        message: `Your prescription has been ${status}.`,
      });
      
      res.json(prescription);
    } catch (error) {
      console.error("Update prescription status error:", error);
      res.status(500).json({ message: "Failed to update prescription status" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req: any, res: Response) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.put("/api/notifications/:id/read", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark notification as read error:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.delete("/api/notifications/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNotification(id);
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Delete notification error:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Dashboard stats
  app.get("/api/admin/dashboard-stats", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Failed to get dashboard stats" });
    }
  });

  // Sales Analytics endpoint
  app.get("/api/admin/sales-analytics", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const timePeriod = req.query.timePeriod as string || "weekly";
      const salesData = await storage.getSalesAnalytics(timePeriod);
      res.json(salesData);
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      res.status(500).json({ message: "Failed to fetch sales analytics" });
    }
  });

  // Category Analytics endpoint
  app.get("/api/admin/category-analytics", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const categoryData = await storage.getCategoryAnalytics();
      res.json(categoryData);
    } catch (error) {
      console.error("Error fetching category analytics:", error);
      res.status(500).json({ message: "Failed to fetch category analytics" });
    }
  });

  // Payment Analytics endpoint
  app.get("/api/admin/payment-analytics", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const paymentAnalytics = await storage.getPaymentAnalytics(req.query.dateFilter as string);
      res.json(paymentAnalytics);
    } catch (error) {
      console.error("Error fetching payment analytics:", error);
      res.status(500).json({ message: "Failed to fetch payment analytics" });
    }
  });

  // Serve prescription files with authentication
  app.get('/uploads/prescriptions/:filename', isAuthenticated, async (req: any, res: Response) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      // For admin users, allow access to any prescription
      if (req.user.role === 'admin') {
        return res.sendFile(filePath);
      }

      // For regular users, only allow access to their own prescriptions
      const prescription = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.fileName, filename))
        .limit(1);

      if (prescription.length === 0 || prescription[0].userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving prescription file:", error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  // Serve other uploaded files (non-sensitive)
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
