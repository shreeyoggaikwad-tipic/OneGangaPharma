import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertAddressSchema, 
  insertMedicineSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertPrescriptionSchema 
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

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

// File upload configuration
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(getSession());

  // Initialize data
  await storage.initializeData();

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
      const { items, billingAddressId, shippingAddressId, prescriptionId, totalAmount } = req.body;
      
      const orderData = {
        userId: req.user.id,
        totalAmount: totalAmount.toString(),
        billingAddressId,
        shippingAddressId,
        prescriptionId: prescriptionId || null,
        paymentMethod: "cod",
        status: "placed",
      };

      const order = await storage.createOrder(orderData, items);
      
      // Clear cart after successful order
      await storage.clearCart(req.user.id);
      
      // Create notification
      await storage.createNotification({
        userId: req.user.id,
        type: "order_update",
        title: "Order Placed",
        message: `Your order ${order.orderNumber} has been placed successfully.`,
      });
      
      res.json(order);
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Admin order management
  app.get("/api/admin/orders", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getAllOrders();
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
      
      // Create notification for customer
      await storage.createNotification({
        userId: order.userId,
        type: "order_update",
        title: "Order Status Updated",
        message: `Your order ${order.orderNumber} status has been updated to ${status}.`,
      });
      
      res.json(order);
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ message: "Failed to update order status" });
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
        fileName: req.file.originalname,
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

  app.put("/api/admin/prescriptions/:id", isAuthenticated, isAdmin, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      
      const prescription = await storage.updatePrescriptionStatus(id, status, req.user.id, notes);
      
      // Create notification for customer
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

  const httpServer = createServer(app);
  return httpServer;
}
