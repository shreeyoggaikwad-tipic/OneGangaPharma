import {
  users,
  addresses,
  medicines,
  medicineCategories,
  medicineInventory,
  prescriptions,
  cartItems,
  orders,
  orderItems,
  notifications,
  type User,
  type InsertUser,
  type Address,
  type InsertAddress,
  type Medicine,
  type InsertMedicine,
  type MedicineInventory,
  type InsertMedicineInventory,
  type Prescription,
  type InsertPrescription,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Notification,
  type InsertNotification,
  type MedicineCategory,
  type Batch,
  type InsertBatch,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sum, sql, gte, lte } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;

  // Address operations
  getAddressesByUserId(userId: number): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address>;
  deleteAddress(id: number): Promise<void>;
  syncUserPhoneToAddresses(userId: number, phone: string): Promise<void>;

  // Medicine operations
  getMedicines(): Promise<(Medicine & { category: MedicineCategory; totalStock: number })[]>;
  getMedicineById(id: number): Promise<Medicine | undefined>;
  searchMedicines(query: string): Promise<(Medicine & { category: MedicineCategory; totalStock: number })[]>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  updateMedicine(id: number, medicine: Partial<InsertMedicine>): Promise<Medicine>;
  deleteMedicine(id: number): Promise<void>;

  // Medicine categories
  getMedicineCategories(): Promise<MedicineCategory[]>;
  createMedicineCategory(name: string, description?: string, isScheduleH?: boolean): Promise<MedicineCategory>;

  // Medicine inventory operations
  getMedicineInventory(medicineId: number): Promise<MedicineInventory[]>;
  createMedicineInventory(inventory: InsertMedicineInventory): Promise<MedicineInventory>;
  updateMedicineInventory(id: number, inventory: Partial<InsertMedicineInventory>): Promise<MedicineInventory>;
  getLowStockMedicines(): Promise<(Medicine & { totalStock: number })[]>;

  // Prescription operations
  getPrescriptionsByUserId(userId: number): Promise<Prescription[]>;
  getPendingPrescriptions(): Promise<(Prescription & { user: User })[]>;
  getAllPrescriptions(): Promise<(Prescription & { user: User })[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescriptionStatus(id: number, status: string, reviewedBy: number, notes?: string): Promise<Prescription>;

  // Cart operations
  getCartItems(userId: number): Promise<(CartItem & { medicine: Medicine })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;

  // Order operations
  getOrdersByUserId(userId: number): Promise<(Order & { items: (OrderItem & { medicine: Medicine })[] })[]>;
  getAllOrders(): Promise<(Order & { user: User; items: (OrderItem & { medicine: Medicine })[]; prescription?: Prescription })[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  getOrderById(id: number): Promise<(Order & { 
    user: User; 
    items: (OrderItem & { medicine: Medicine })[];
    billingAddress: Address;
    shippingAddress: Address;
    prescription?: Prescription;
  }) | undefined>;

  // Notification operations
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  deleteNotification(id: number): Promise<void>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalSales: number;
    ordersToday: number;
    lowStockCount: number;
    pendingPrescriptions: number;
  }>;

  // Analytics
  getSalesAnalytics(timePeriod: string): Promise<any[]>;
  getCategoryAnalytics(): Promise<any[]>;

  // Batch management operations
  getBatchesByMedicineId(medicineId: number): Promise<Batch[]>;
  addBatch(batch: InsertBatch): Promise<Batch>;
  updateBatch(id: number, batch: Partial<InsertBatch>): Promise<Batch>;
  deleteBatch(id: number): Promise<void>;
  getExpiringBatches(days: number): Promise<(Batch & { medicine: Medicine })[]>;
  allocateBatchesForOrder(medicineId: number, quantity: number): Promise<{ batchId: number; quantity: number }[]>;

  // Initialize data
  initializeData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Helper function to calculate discounted price
  private calculateDiscountedPrice(mrp: number, discount: number): number {
    return Number((mrp - (mrp * discount / 100)).toFixed(2));
  }

  // Helper function to get available stock (total inventory - items in carts)
  private async getAvailableStock(medicineId: number): Promise<number> {
    const [result] = await db
      .select({
        totalInventory: sql<number>`COALESCE(SUM(${medicineInventory.quantity}), 0)`,
        cartReserved: sql<number>`COALESCE((
          SELECT SUM(${cartItems.quantity}) 
          FROM ${cartItems} 
          WHERE ${cartItems.medicineId} = ${medicineId}
        ), 0)`
      })
      .from(medicineInventory)
      .where(eq(medicineInventory.medicineId, medicineId));
    
    return Math.max(0, (result?.totalInventory || 0) - (result?.cartReserved || 0));
  }

  // Helper function to prepare medicine data with price calculation
  private prepareMedicineData(medicine: Partial<InsertMedicine>): Partial<InsertMedicine> {
    const prepared = { ...medicine };
    
    // Auto-calculate discounted price if MRP or discount is provided
    if (prepared.mrp !== undefined || prepared.discount !== undefined) {
      const mrp = Number(prepared.mrp || 0);
      const discount = Number(prepared.discount || 0);
      prepared.discountedPrice = this.calculateDiscountedPrice(mrp, discount).toString();
    }
    
    return prepared;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [newUser] = await db
      .insert(users)
      .values({ ...user, password: hashedPassword })
      .returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
    const updateData = { ...user };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const [updatedUser] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getAddressesByUserId(userId: number): Promise<Address[]> {
    return db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [newAddress] = await db.insert(addresses).values(address).returning();
    return newAddress;
  }

  async updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address> {
    const [updatedAddress] = await db
      .update(addresses)
      .set(address)
      .where(eq(addresses.id, id))
      .returning();
    return updatedAddress;
  }

  async deleteAddress(id: number): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }

  async syncUserPhoneToAddresses(userId: number, phone: string): Promise<void> {
    await db
      .update(addresses)
      .set({ phone })
      .where(eq(addresses.userId, userId));
  }

  async getMedicines(): Promise<(Medicine & { category: MedicineCategory; totalStock: number })[]> {
    return db
      .select({
        id: medicines.id,
        name: medicines.name,
        description: medicines.description,
        dosage: medicines.dosage,
        mrp: medicines.mrp,
        discount: medicines.discount,
        discountedPrice: medicines.discountedPrice,
        categoryId: medicines.categoryId,
        manufacturer: medicines.manufacturer,
        requiresPrescription: medicines.requiresPrescription,
        frontImageUrl: medicines.frontImageUrl,
        backImageUrl: medicines.backImageUrl,
        isActive: medicines.isActive,
        createdAt: medicines.createdAt,
        updatedAt: medicines.updatedAt,
        category: medicineCategories,
        totalStock: sql<number>`GREATEST(0, COALESCE(SUM(${medicineInventory.quantity}), 0) - COALESCE((
          SELECT SUM(${cartItems.quantity}) 
          FROM ${cartItems} 
          WHERE ${cartItems.medicineId} = ${medicines.id}
        ), 0))`,
      })
      .from(medicines)
      .leftJoin(medicineCategories, eq(medicines.categoryId, medicineCategories.id))
      .leftJoin(medicineInventory, eq(medicines.id, medicineInventory.medicineId))
      .where(eq(medicines.isActive, true))
      .groupBy(medicines.id, medicineCategories.id)
      .orderBy(asc(medicines.name)) as any;
  }

  async getMedicineById(id: number): Promise<Medicine | undefined> {
    const [medicine] = await db
      .select({
        id: medicines.id,
        name: medicines.name,
        description: medicines.description,
        dosage: medicines.dosage,
        mrp: medicines.mrp,
        discount: medicines.discount,
        discountedPrice: medicines.discountedPrice,
        categoryId: medicines.categoryId,
        manufacturer: medicines.manufacturer,
        requiresPrescription: medicines.requiresPrescription,
        frontImageUrl: medicines.frontImageUrl,
        backImageUrl: medicines.backImageUrl,
        isActive: medicines.isActive,
        createdAt: medicines.createdAt,
        updatedAt: medicines.updatedAt,
      })
      .from(medicines)
      .where(eq(medicines.id, id));
    return medicine;
  }

  async searchMedicines(query: string): Promise<(Medicine & { category: MedicineCategory; totalStock: number })[]> {
    return db
      .select({
        id: medicines.id,
        name: medicines.name,
        description: medicines.description,
        dosage: medicines.dosage,
        mrp: medicines.mrp,
        discount: medicines.discount,
        discountedPrice: medicines.discountedPrice,
        categoryId: medicines.categoryId,
        manufacturer: medicines.manufacturer,
        requiresPrescription: medicines.requiresPrescription,
        frontImageUrl: medicines.frontImageUrl,
        backImageUrl: medicines.backImageUrl,
        isActive: medicines.isActive,
        createdAt: medicines.createdAt,
        updatedAt: medicines.updatedAt,
        category: medicineCategories,
        totalStock: sql<number>`GREATEST(0, COALESCE(SUM(${medicineInventory.quantity}), 0) - COALESCE((
          SELECT SUM(${cartItems.quantity}) 
          FROM ${cartItems} 
          WHERE ${cartItems.medicineId} = ${medicines.id}
        ), 0))`,
      })
      .from(medicines)
      .leftJoin(medicineCategories, eq(medicines.categoryId, medicineCategories.id))
      .leftJoin(medicineInventory, eq(medicines.id, medicineInventory.medicineId))
      .where(
        and(
          eq(medicines.isActive, true),
          sql`LOWER(${medicines.name}) LIKE LOWER(${'%' + query + '%'})`
        )
      )
      .groupBy(medicines.id, medicineCategories.id)
      .orderBy(asc(medicines.name)) as any;
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    const preparedMedicine = this.prepareMedicineData(medicine);
    const [newMedicine] = await db.insert(medicines).values(preparedMedicine as InsertMedicine).returning();
    return newMedicine;
  }

  async updateMedicine(id: number, medicine: Partial<InsertMedicine>): Promise<Medicine> {
    const preparedMedicine = this.prepareMedicineData(medicine);
    const [updatedMedicine] = await db
      .update(medicines)
      .set({ ...preparedMedicine, updatedAt: new Date() })
      .where(eq(medicines.id, id))
      .returning();
    return updatedMedicine;
  }

  async deleteMedicine(id: number): Promise<void> {
    await db.update(medicines).set({ isActive: false }).where(eq(medicines.id, id));
  }

  async getMedicineCategories(): Promise<MedicineCategory[]> {
    return db.select().from(medicineCategories).orderBy(asc(medicineCategories.name));
  }

  async createMedicineCategory(name: string, description?: string, isScheduleH?: boolean): Promise<MedicineCategory> {
    const [category] = await db
      .insert(medicineCategories)
      .values({ name, description, isScheduleH: isScheduleH || false })
      .returning();
    return category;
  }

  async getMedicineInventory(medicineId: number): Promise<MedicineInventory[]> {
    return db
      .select()
      .from(medicineInventory)
      .where(eq(medicineInventory.medicineId, medicineId))
      .orderBy(asc(medicineInventory.expiryDate));
  }

  async createMedicineInventory(inventory: InsertMedicineInventory): Promise<MedicineInventory> {
    const [newInventory] = await db.insert(medicineInventory).values(inventory).returning();
    return newInventory;
  }

  async updateMedicineInventory(id: number, inventory: Partial<InsertMedicineInventory>): Promise<MedicineInventory> {
    const [updatedInventory] = await db
      .update(medicineInventory)
      .set({ ...inventory, updatedAt: new Date() })
      .where(eq(medicineInventory.id, id))
      .returning();
    return updatedInventory;
  }

  async getLowStockMedicines(): Promise<(Medicine & { totalStock: number })[]> {
    return db
      .select({
        id: medicines.id,
        name: medicines.name,
        description: medicines.description,
        dosage: medicines.dosage,
        mrp: medicines.mrp,
        discount: medicines.discount,
        discountedPrice: medicines.discountedPrice,
        categoryId: medicines.categoryId,
        manufacturer: medicines.manufacturer,
        requiresPrescription: medicines.requiresPrescription,
        isActive: medicines.isActive,
        createdAt: medicines.createdAt,
        updatedAt: medicines.updatedAt,
        totalStock: sql<number>`GREATEST(0, COALESCE(SUM(${medicineInventory.quantity}), 0) - COALESCE((
          SELECT SUM(${cartItems.quantity}) 
          FROM ${cartItems} 
          WHERE ${cartItems.medicineId} = ${medicines.id}
        ), 0))`,
      })
      .from(medicines)
      .leftJoin(medicineInventory, eq(medicines.id, medicineInventory.medicineId))
      .where(eq(medicines.isActive, true))
      .groupBy(medicines.id)
      .having(sql`GREATEST(0, COALESCE(SUM(${medicineInventory.quantity}), 0) - COALESCE((
        SELECT SUM(${cartItems.quantity}) 
        FROM ${cartItems} 
        WHERE ${cartItems.medicineId} = ${medicines.id}
      ), 0)) < 20`)
      .orderBy(sql`GREATEST(0, COALESCE(SUM(${medicineInventory.quantity}), 0) - COALESCE((
        SELECT SUM(${cartItems.quantity}) 
        FROM ${cartItems} 
        WHERE ${cartItems.medicineId} = ${medicines.id}
      ), 0))`) as any;
  }

  async getPrescriptionsByUserId(userId: number): Promise<Prescription[]> {
    return db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.userId, userId))
      .orderBy(desc(prescriptions.uploadedAt));
  }

  async getPendingPrescriptions(): Promise<(Prescription & { user: User })[]> {
    return db
      .select({
        id: prescriptions.id,
        userId: prescriptions.userId,
        fileName: prescriptions.fileName,
        filePath: prescriptions.filePath,
        status: prescriptions.status,
        reviewedBy: prescriptions.reviewedBy,
        reviewedAt: prescriptions.reviewedAt,
        reviewNotes: prescriptions.reviewNotes,
        uploadedAt: prescriptions.uploadedAt,
        user: users,
      })
      .from(prescriptions)
      .leftJoin(users, eq(prescriptions.userId, users.id))
      .where(eq(prescriptions.status, "pending"))
      .orderBy(desc(prescriptions.uploadedAt)) as any;
  }

  async getAllPrescriptions(): Promise<(Prescription & { user: User })[]> {
    return db
      .select({
        id: prescriptions.id,
        userId: prescriptions.userId,
        fileName: prescriptions.fileName,
        filePath: prescriptions.filePath,
        status: prescriptions.status,
        reviewedBy: prescriptions.reviewedBy,
        reviewedAt: prescriptions.reviewedAt,
        reviewNotes: prescriptions.reviewNotes,
        uploadedAt: prescriptions.uploadedAt,
        user: users,
      })
      .from(prescriptions)
      .leftJoin(users, eq(prescriptions.userId, users.id))
      .orderBy(desc(prescriptions.uploadedAt)) as any;
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const [newPrescription] = await db.insert(prescriptions).values(prescription).returning();
    return newPrescription;
  }

  async updatePrescriptionStatus(id: number, status: string, reviewedBy: number, notes?: string): Promise<Prescription> {
    const [updatedPrescription] = await db
      .update(prescriptions)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
        reviewNotes: notes,
      })
      .where(eq(prescriptions.id, id))
      .returning();
    return updatedPrescription;
  }

  async getCartItems(userId: number): Promise<(CartItem & { medicine: Medicine })[]> {
    return db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        medicineId: cartItems.medicineId,
        quantity: cartItems.quantity,
        addedAt: cartItems.addedAt,
        medicine: medicines,
      })
      .from(cartItems)
      .leftJoin(medicines, eq(cartItems.medicineId, medicines.id))
      .where(eq(cartItems.userId, userId)) as any;
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check available stock before adding to cart
    const availableStock = await this.getAvailableStock(cartItem.medicineId);
    
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.medicineId, cartItem.medicineId)
        )
      );

    if (existingItem) {
      // Check if new total quantity exceeds available stock
      const newQuantity = existingItem.quantity + cartItem.quantity;
      if (newQuantity > availableStock + existingItem.quantity) {
        throw new Error(`Insufficient stock. Only ${availableStock + existingItem.quantity} available.`);
      }
      
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Check if requested quantity exceeds available stock
      if (cartItem.quantity > availableStock) {
        throw new Error(`Insufficient stock. Only ${availableStock} available.`);
      }
      
      // Add new item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    // Get the cart item to check medicine ID
    const [cartItem] = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.id, id));
    
    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    // Check available stock
    const availableStock = await this.getAvailableStock(cartItem.medicineId);
    const currentCartQuantity = cartItem.quantity;
    const stockAvailableForThisItem = availableStock + currentCartQuantity;
    
    if (quantity > stockAvailableForThisItem) {
      throw new Error(`Insufficient stock. Only ${stockAvailableForThisItem} available.`);
    }

    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async getOrdersByUserId(userId: number): Promise<(Order & { user: User; items: (OrderItem & { medicine: Medicine })[]; shippingAddress?: Address; billingAddress?: Address })[]> {
    const ordersData = await db
      .select({
        order: orders,
        user: users,
        item: orderItems,
        medicine: medicines,
        shippingAddress: {
          id: sql`shipping_addr.id`,
          userId: sql`shipping_addr.user_id`,
          type: sql`shipping_addr.type`,
          fullName: sql`shipping_addr.full_name`,
          addressLine1: sql`shipping_addr.address_line_1`,
          addressLine2: sql`shipping_addr.address_line_2`,
          city: sql`shipping_addr.city`,
          state: sql`shipping_addr.state`,
          postalCode: sql`shipping_addr.postal_code`,
          phone: sql`shipping_addr.phone`,
          isDefault: sql`shipping_addr.is_default`,
          createdAt: sql`shipping_addr.created_at`,
        },
        billingAddress: {
          id: sql`billing_addr.id`,
          userId: sql`billing_addr.user_id`,
          type: sql`billing_addr.type`,
          fullName: sql`billing_addr.full_name`,
          addressLine1: sql`billing_addr.address_line_1`,
          addressLine2: sql`billing_addr.address_line_2`,
          city: sql`billing_addr.city`,
          state: sql`billing_addr.state`,
          postalCode: sql`billing_addr.postal_code`,
          phone: sql`billing_addr.phone`,
          isDefault: sql`billing_addr.is_default`,
          createdAt: sql`billing_addr.created_at`,
        },
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id)) // Always fetch current user data
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(medicines, eq(orderItems.medicineId, medicines.id))
      .leftJoin(sql`${addresses} AS shipping_addr`, sql`shipping_addr.id = ${orders.shippingAddressId}`)
      .leftJoin(sql`${addresses} AS billing_addr`, sql`billing_addr.id = ${orders.billingAddressId}`)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.placedAt));

    // Group by order
    const orderMap = new Map();
    ordersData.forEach(({ order, user, item, medicine, shippingAddress, billingAddress }) => {
      if (!orderMap.has(order.id)) {
        orderMap.set(order.id, { 
          ...order, 
          user, 
          items: [], 
          shippingAddress: shippingAddress?.id ? shippingAddress : undefined,
          billingAddress: billingAddress?.id ? billingAddress : undefined
        });
      }
      if (item && medicine) {
        orderMap.get(order.id).items.push({ ...item, medicine });
      }
    });

    return Array.from(orderMap.values());
  }

  async getAllOrders(): Promise<(Order & { user: User; items: (OrderItem & { medicine: Medicine })[]; prescription?: Prescription })[]> {
    const ordersData = await db
      .select({
        order: orders,
        user: users,
        item: orderItems,
        medicine: medicines,
        prescription: prescriptions,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id)) // Always fetch current user data
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(medicines, eq(orderItems.medicineId, medicines.id))
      .leftJoin(prescriptions, eq(orders.prescriptionId, prescriptions.id))
      .orderBy(desc(orders.placedAt));

    // Group by order
    const orderMap = new Map();
    ordersData.forEach(({ order, user, item, medicine, prescription }) => {
      if (!orderMap.has(order.id)) {
        orderMap.set(order.id, { ...order, user, items: [], prescription: prescription || undefined });
      }
      if (item && medicine) {
        orderMap.get(order.id).items.push({ ...item, medicine });
      }
    });

    return Array.from(orderMap.values());
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Generate shorter order number (SMD + 8 digits)
    const timestamp = Date.now().toString();
    const orderNumber = `SMD${timestamp.slice(-8)}`;
    
    const [newOrder] = await db
      .insert(orders)
      .values({ ...order, orderNumber })
      .returning();

    // Process each item with batch allocation
    const orderItemsWithBatches = [];
    
    for (const item of items) {
      // Allocate batches for this item using FIFO
      const batchAllocations = await this.allocateBatchesForOrder(item.medicineId, item.quantity);
      
      // Deduct inventory from allocated batches and create order items
      for (const allocation of batchAllocations) {
        await db
          .update(medicineInventory)
          .set({ 
            quantity: sql`${medicineInventory.quantity} - ${allocation.quantity}` 
          })
          .where(eq(medicineInventory.id, allocation.batchId));
        
        // Create order item entry for each batch allocation
        orderItemsWithBatches.push({
          orderId: newOrder.id,
          medicineId: item.medicineId,
          quantity: allocation.quantity,
          unitPrice: item.unitPrice,
          batchId: allocation.batchId,
        });
      }
    }

    // Add order items with batch information
    await db.insert(orderItems).values(orderItemsWithBatches);

    return newOrder;
  }



  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const updateData: any = { status };
    if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async updateOrderPaymentStatus(id: number, paymentStatus: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ paymentStatus })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async getOrderById(id: number): Promise<(Order & { 
    user: User; 
    items: (OrderItem & { medicine: Medicine })[];
    billingAddress: Address;
    shippingAddress: Address;
    prescription?: Prescription;
  }) | undefined> {
    const orderData = await db
      .select({
        order: orders,
        user: users,
        item: orderItems,
        medicine: medicines,
        billingAddress: sql`billing_addr`,
        shippingAddress: sql`shipping_addr`,
        prescription: prescriptions,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id)) // Always fetch current user data
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(medicines, eq(orderItems.medicineId, medicines.id))
      .leftJoin(sql`${addresses} AS billing_addr`, sql`billing_addr.id = ${orders.billingAddressId}`)
      .leftJoin(sql`${addresses} AS shipping_addr`, sql`shipping_addr.id = ${orders.shippingAddressId}`)
      .leftJoin(prescriptions, eq(orders.prescriptionId, prescriptions.id))
      .where(eq(orders.id, id));

    if (orderData.length === 0) return undefined;

    const { order, user, billingAddress, shippingAddress, prescription } = orderData[0];
    const items = orderData
      .filter(({ item, medicine }) => item && medicine)
      .map(({ item, medicine }) => ({ ...item, medicine }));

    return {
      ...order,
      user,
      items,
      billingAddress: billingAddress as Address,
      shippingAddress: shippingAddress as Address,
      prescription: prescription || undefined,
    } as any;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async getDashboardStats(): Promise<{
    totalSales: number;
    ordersToday: number;
    lowStockCount: number;
    pendingPrescriptions: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [salesResult] = await db
      .select({ totalSales: sum(orders.totalAmount) })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"));

    const [ordersTodayResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(sql`DATE(${orders.placedAt}) = DATE(${today})`);

    const [lowStockResult] = await db
      .select({ count: count() })
      .from(medicines)
      .leftJoin(medicineInventory, eq(medicines.id, medicineInventory.medicineId))
      .where(eq(medicines.isActive, true))
      .groupBy(medicines.id)
      .having(sql`COALESCE(SUM(${medicineInventory.quantity}), 0) < 20`);

    const [pendingPrescriptionsResult] = await db
      .select({ count: count() })
      .from(prescriptions)
      .where(eq(prescriptions.status, "pending"));

    return {
      totalSales: Number(salesResult?.totalSales || 0),
      ordersToday: ordersTodayResult?.count || 0,
      lowStockCount: lowStockResult?.count || 0,
      pendingPrescriptions: pendingPrescriptionsResult?.count || 0,
    };
  }

  async getSalesAnalytics(timePeriod: string): Promise<any[]> {
    // Get all orders for analytics
    const allOrders = await db.select().from(orders);
    
    const today = new Date();
    const data = [];
    
    switch (timePeriod) {
      case "weekly":
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);
          
          const dayOrders = allOrders.filter(order => {
            if (!order.placedAt) return false;
            const orderDate = new Date(order.placedAt);
            return orderDate >= dayStart && orderDate <= dayEnd;
          });
          
          const paidOrders = dayOrders.filter(order => order.paymentStatus === "paid");
          const totalSales = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
          
          data.push({
            date: date.toISOString().split('T')[0],
            sales: totalSales,
            orders: dayOrders.length,
            label: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })
          });
        }
        break;
      
      default:
        const paidOrders = allOrders.filter(order => order.paymentStatus === "paid");
        const totalSales = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        
        data.push({
          date: today.toISOString().split('T')[0],
          sales: totalSales,
          orders: allOrders.length,
          label: "Total"
        });
    }
    
    return data;
  }

  async getCategoryAnalytics(): Promise<any[]> {
    const categoryStats = await db
      .select({
        name: medicineCategories.name,
        count: count(medicines.id)
      })
      .from(medicineCategories)
      .leftJoin(medicines, eq(medicineCategories.id, medicines.categoryId))
      .where(eq(medicines.isActive, true))
      .groupBy(medicineCategories.id, medicineCategories.name);

    const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];
    
    return categoryStats.map((category, index) => ({
      name: category.name,
      value: category.count,
      color: colors[index % colors.length]
    }));
  }

  async initializeData(): Promise<void> {
    // Check if data already exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) return;

    // Create admin user
    const adminUser = await this.createUser({
      email: "admin@test.com",
      password: "admin123",
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      phone: "9876543210",
    });

    // Create customer user
    const customerUser = await this.createUser({
      email: "customer@test.com",
      password: "password123",
      role: "customer",
      firstName: "John",
      lastName: "Doe",
      phone: "9876543211",
      gender: "male",
      dateOfBirth: "1990-01-01",
    });

    // Create medicine categories
    const generalCategory = await this.createMedicineCategory("General", "General medicines", false);
    const scheduleHCategory = await this.createMedicineCategory("Schedule H", "Prescription required medicines", true);
    const ayurvedicCategory = await this.createMedicineCategory("Ayurvedic", "Traditional Indian medicines", false);

    // Create sample medicines with new pricing structure
    const medicines = [
      {
        name: "Paracetamol 500mg",
        description: "Pain relief and fever reducer",
        dosage: "500mg",
        mrp: "60.00",
        discount: "25.00", // 25% discount
        categoryId: scheduleHCategory.id,
        manufacturer: "Cipla Ltd",
        requiresPrescription: true,
      },
      {
        name: "Vitamin D3 Tablets",
        description: "Essential vitamin supplement",
        dosage: "60000 IU",
        mrp: "150.00",
        discount: "16.67", // 16.67% discount
        categoryId: generalCategory.id,
        manufacturer: "Sun Pharma",
        requiresPrescription: false,
      },
      {
        name: "Cough Syrup",
        description: "Cough relief formula",
        dosage: "100ml",
        mrp: "100.00",
        discount: "11.00", // 11% discount
        categoryId: generalCategory.id,
        manufacturer: "Dabur",
        requiresPrescription: false,
      },
      {
        name: "Antibiotic Tablets",
        description: "Bacterial infection treatment",
        dosage: "250mg",
        mrp: "220.00",
        discount: "15.68", // 15.68% discount
        categoryId: scheduleHCategory.id,
        manufacturer: "Dr. Reddy's",
        requiresPrescription: true,
      },
      {
        name: "Ashwagandha Capsules",
        description: "Stress relief and immunity booster",
        dosage: "300mg",
        mrp: "350.00",
        discount: "14.57", // 14.57% discount
        categoryId: ayurvedicCategory.id,
        manufacturer: "Himalaya",
        requiresPrescription: false,
      },
    ];

    for (const medicine of medicines) {
      const newMedicine = await this.createMedicine(medicine);
      
      // Add inventory
      await this.createMedicineInventory({
        medicineId: newMedicine.id,
        batchNumber: `BATCH${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        expiryDate: "2025-12-31",
        quantity: Math.floor(Math.random() * 100) + 50,
      });
    }

    // Create sample address for customer
    await this.createAddress({
      userId: customerUser.id,
      type: "billing",
      fullName: "John Doe",
      phone: "9876543211",
      addressLine1: "123 Main Street",
      addressLine2: "Apartment 4B",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      isDefault: true,
    });

    await this.createAddress({
      userId: customerUser.id,
      type: "shipping",
      fullName: "John Doe",
      phone: "9876543211",
      addressLine1: "123 Main Street",
      addressLine2: "Apartment 4B",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      isDefault: true,
    });
  }

  async getPaymentAnalytics(dateFilter: string = 'today'): Promise<any[]> {
    try {
      let dateCondition = sql`1=1`;
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          const startOfDay = new Date(now.setHours(0, 0, 0, 0));
          const endOfDay = new Date(now.setHours(23, 59, 59, 999));
          dateCondition = sql`${orders.createdAt} >= ${startOfDay} AND ${orders.createdAt} <= ${endOfDay}`;
          break;
        case 'week':
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          startOfWeek.setHours(0, 0, 0, 0);
          dateCondition = sql`${orders.createdAt} >= ${startOfWeek}`;
          break;
        case 'month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          dateCondition = sql`${orders.createdAt} >= ${startOfMonth}`;
          break;
        case 'all':
        default:
          dateCondition = sql`1=1`;
          break;
      }

      const paymentAnalytics = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          customerName: sql<string>`COALESCE(${addresses.fullName}, CONCAT(${users.firstName}, ' ', ${users.lastName}))`.as('customerName'),
          customerPhone: users.phone, // Always use current user phone, not historical address phone
          totalAmount: orders.totalAmount,
          paymentMethod: orders.paymentMethod,
          paymentStatus: orders.paymentStatus,
          orderDate: orders.createdAt,
          items: sql<number>`COUNT(${orderItems.id})`.as('items'),
        })
        .from(orders)
        .innerJoin(users, eq(orders.userId, users.id)) // Always fetch current user data
        .leftJoin(addresses, eq(orders.shippingAddressId, addresses.id))
        .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
        .where(dateCondition)
        .groupBy(orders.id, addresses.fullName, addresses.phone, users.firstName, users.lastName, users.phone)
        .orderBy(sql`${orders.createdAt} DESC`);

      return paymentAnalytics;
    } catch (error) {
      console.error("Error in getPaymentAnalytics:", error);
      throw error;
    }
  }

  // Batch management operations
  async getBatchesByMedicineId(medicineId: number): Promise<Batch[]> {
    return await db
      .select()
      .from(medicineInventory)
      .where(eq(medicineInventory.medicineId, medicineId))
      .orderBy(asc(medicineInventory.expiryDate));
  }

  async addBatch(batch: InsertBatch): Promise<Batch> {
    const [newBatch] = await db.insert(medicineInventory).values(batch).returning();
    return newBatch;
  }

  async updateBatch(id: number, batch: Partial<InsertBatch>): Promise<Batch> {
    const [updatedBatch] = await db
      .update(medicineInventory)
      .set(batch)
      .where(eq(medicineInventory.id, id))
      .returning();
    return updatedBatch;
  }

  async deleteBatch(id: number): Promise<void> {
    await db.delete(medicineInventory).where(eq(medicineInventory.id, id));
  }

  async getExpiringBatches(days: number): Promise<(Batch & { medicine: Medicine })[]> {
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + days);

    return await db
      .select({
        id: medicineInventory.id,
        medicineId: medicineInventory.medicineId,
        batchNumber: medicineInventory.batchNumber,
        quantity: medicineInventory.quantity,
        expiryDate: medicineInventory.expiryDate,
        createdAt: medicineInventory.createdAt,
        updatedAt: medicineInventory.updatedAt,
        medicine: medicines,
      })
      .from(medicineInventory)
      .innerJoin(medicines, eq(medicineInventory.medicineId, medicines.id))
      .where(
        and(
          lte(medicineInventory.expiryDate, expiryThreshold),
          gte(medicineInventory.quantity, 1)
        )
      )
      .orderBy(asc(medicineInventory.expiryDate));
  }

  async allocateBatchesForOrder(medicineId: number, quantity: number): Promise<{ batchId: number; quantity: number }[]> {
    // Get available batches ordered by expiry date (FIFO)
    const availableBatches = await db
      .select()
      .from(medicineInventory)
      .where(
        and(
          eq(medicineInventory.medicineId, medicineId),
          gte(medicineInventory.quantity, 1)
        )
      )
      .orderBy(asc(medicineInventory.expiryDate));

    const allocations: { batchId: number; quantity: number }[] = [];
    let remainingQuantity = quantity;

    for (const batch of availableBatches) {
      if (remainingQuantity <= 0) break;

      const allocateFromBatch = Math.min(batch.quantity, remainingQuantity);
      allocations.push({
        batchId: batch.id,
        quantity: allocateFromBatch,
      });

      remainingQuantity -= allocateFromBatch;
    }

    if (remainingQuantity > 0) {
      throw new Error(`Insufficient stock: ${remainingQuantity} units short for medicine ID ${medicineId}`);
    }

    return allocations;
  }
}

export const storage = new DatabaseStorage();
