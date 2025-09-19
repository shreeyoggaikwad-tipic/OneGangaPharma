
// import {
//   stores,
//   users,
//   addresses,
//   medicines,
//   medicineCategories,
//   medicineInventory,
//   prescriptions,
//   cartItems,
//   orders,
//   orderItems,
//   notifications,
//   type Store,
//   type InsertStore,
//   type User,
//   type InsertUser,
//   type Address,
//   type InsertAddress,
//   type Medicine,
//   type InsertMedicine,
//   type MedicineInventory,
//   type InsertMedicineInventory,
//   type Prescription,
//   type InsertPrescription,
//   type CartItem,
//   type InsertCartItem,
//   type Order,
//   type InsertOrder,
//   type OrderItem,
//   type InsertOrderItem,
//   type Notification,
//   type InsertNotification,
//   type MedicineCategory,
//   type Batch,
//   type InsertBatch,
//   createorder,
// } from "@shared/schema";
// import { db } from "./db";
// import { config, getShelfLifeInterval } from "./config";
// import { eq, and, desc, asc, count, sum, sql, gte, lte } from "drizzle-orm";
// import bcrypt from "bcrypt";
// import path from "path";
// import { alias } from "drizzle-orm/mysql-core";
// // const { createorder } = require('../shared/schema');
// const billingAddr = alias(addresses, "billing_addr");
// const shippingAddr = alias(addresses, "shipping_addr");
// import QRCode from "qrcode";
// import fs from "fs";
// import { QrCode } from "lucide-react";

// import { fileURLToPath } from "url";
// const InsertOrder = {
//   customer_name: String,
//   age: Number,
//   district: String,
//   place: String,
//   pincode: String,
//   mobile_no: String,
//   medicines: Object, // JSON-compatible object (array in this case)
//   status: String,
//   created_at: Date,
//   updated_at: Date
// };

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// export interface IStorage {
//  storeOrder(order: {
//     customer_name: string;
//     medicines: unknown;
//     district?: string;
//     place?: string;
//     pincode?: string;
//     mobile_no?: string;
//     status?: string;
//   }): Promise<CreateOrderType | undefined>;
//   getUser(id: number): Promise<User | undefined>;
//   getUserByEmail(email: string): Promise<User | undefined>;
//   getValidCompanyUser(slug: string,email: string): Promise<boolean>;
//   createUser(user: InsertUser): Promise<User>;
//   getSroreIdBySlug(slug: string): Promise<Store>;
//   getAllStores(): Promise<Store>;
//   updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
//   verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
//   getAddressesByUserId(userId: number): Promise<Address[]>;
//   createAddress(address: InsertAddress): Promise<Address>;
//   updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address>;
//   deleteAddress(id: number): Promise<void>;
//   syncUserPhoneToAddresses(userId: number, phone: string): Promise<void>;
//   getMedicines(): Promise<(Medicine & { category: MedicineCategory; totalStock: number })[]>;
//   getMedicineById(id: number): Promise<Medicine | undefined>;
//   searchMedicines(query: string): Promise<(Medicine & { category: MedicineCategory; totalStock: number })[]>;
//   createMedicine(medicine: InsertMedicine): Promise<Medicine>;
//   updateMedicine(id: number, medicine: Partial<InsertMedicine>): Promise<Medicine>;
//   deleteMedicine(id: number): Promise<void>;
//   getMedicineCategories(): Promise<MedicineCategory[]>;
//   createMedicineCategory(name: string, description?: string, isScheduleH?: boolean): Promise<MedicineCategory>;
//   getMedicineInventory(medicineId: number): Promise<MedicineInventory[]>;
//   createMedicineInventory(inventory: InsertMedicineInventory): Promise<MedicineInventory>;
//   updateMedicineInventory(id: number, inventory: Partial<InsertMedicineInventory>): Promise<MedicineInventory>;
//   getLowStockMedicines(): Promise<(Medicine & { totalStock: number })[]>;
//   getPrescriptionsByUserId(userId: number): Promise<Prescription[]>;
//   getPendingPrescriptions(): Promise<(Prescription & { user: User })[]>;
//   getAllPrescriptions(): Promise<(Prescription & { user: User })[]>;
//   createPrescription(prescription: InsertPrescription): Promise<Prescription>;
//   updatePrescriptionStatus(id: number, status: string, reviewedBy: number, notes?: string): Promise<Prescription>;
//   getCartItems(userId: number): Promise<(CartItem & { medicine: Medicine })[]>;
//   addToCart(cartItem: InsertCartItem): Promise<CartItem>;
//   updateCartItem(id: number, quantity: number): Promise<CartItem>;
//   removeFromCart(id: number): Promise<void>;
//   clearCart(userId: number): Promise<void>;
//   getOrdersByUserId(userId: number): Promise<(Order & { user: User; items: (OrderItem & { medicine: Medicine })[]; shippingAddress?: Address; billingAddress?: Address })[]>;
//   getAllOrders(): Promise<(Order & { user: User; items: (OrderItem & { medicine: Medicine })[]; prescription?: Prescription })[]>;
//   createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
//   updateOrderStatus(id: number, status: string): Promise<Order>;
//   getOrderById(id: number): Promise<(Order & { user: User; items: (OrderItem & { medicine: Medicine })[]; billingAddress: Address; shippingAddress: Address; prescription?: Prescription }) | undefined>;
//   getNotificationsByUserId(userId: number): Promise<Notification[]>;
//   createNotification(notification: InsertNotification): Promise<Notification>;
//   markNotificationAsRead(id: number): Promise<void>;
//   deleteNotification(id: number): Promise<void>;
//   getDashboardStats(): Promise<{
//     totalSales: number;
//     ordersToday: number;
//     lowStockCount: number;
//     pendingPrescriptions: number;
//   }>;
//   getSalesAnalytics(timePeriod: string): Promise<any[]>;
//   getCategoryAnalytics(): Promise<any[]>;
//   getSuperAdminStats(): Promise<{
//     totalStores: number;
//     activeStores: number;
//     totalAdmins: number;
//     totalCustomers: number;
//     totalOrders: number;
//     totalSales: number;
//   }>;
//   getPlatformAnalytics(): Promise<{
//     totalStores: number;
//     activeStores: number;
//     totalUsers: number;
//     totalOrders: number;
//     totalSales: number;
//     totalMedicines: number;
//     recentActivity: {
//       newStores: number;
//       newUsers: number;
//       ordersToday: number;
//       salesToday: number;
//     };
//   }>;
//   getAllUsers(): Promise<any[]>;
//   getStores(): Promise<Store[]>;
//   onboardStore(data: any): Promise<{ store: Store; admin: User }>;
//   updateStore(storeId: number, data: Partial<Store>): Promise<Store>;
//   activateStore(storeId: number): Promise<void>;
//   deactivateStore(storeId: number): Promise<void>;
//   getBatchesByMedicineId(medicineId: number): Promise<Batch[]>;
//   addBatch(batch: InsertBatch): Promise<Batch>;
//   updateBatch(id: number, batch: Partial<InsertBatch>): Promise<Batch>;
//   deleteBatch(id: number): Promise<void>;
//   getExpiringBatches(days: number): Promise<(Batch & { medicine: Medicine })[]>;
//   getExpiredBatches(): Promise<(Batch & { medicine: Medicine })[]>;
//   markBatchAsDisposed(batchId: number, reason: string): Promise<void>;
//   getBatchDisposalHistory(): Promise<any[]>;
//   allocateBatchesForOrder(medicineId: number, quantity: number): Promise<{ batchId: number; quantity: number }[]>;
//   initializeData(): Promise<void>;
// }

// export class DatabaseStorage implements IStorage {
//   storeOrder: any;
//   private calculateDiscountedPrice(mrp: number, discount: number): number {
//     return Number((mrp - (mrp * discount / 100)).toFixed(2));
//   }

//   private async getAvailableStock(medicineId: number): Promise<number> {
//     const [result] = await db
//       .select({
//         totalInventory: sql<number>`COALESCE(SUM(${medicineInventory.quantity}), 0)`,
//         cartReserved: sql<number>`COALESCE((
//           SELECT SUM(${cartItems.quantity}) 
//           FROM ${cartItems} 
//           WHERE ${cartItems.medicineId} = ${medicineId}
//         ), 0)`,
//       })
//       .from(medicineInventory)
//       .where(eq(medicineInventory.medicineId, medicineId));

//     return Math.max(0, (result?.totalInventory || 0) - (result?.cartReserved || 0));
//   }

//   private prepareMedicineData(medicine: Partial<InsertMedicine>): Partial<InsertMedicine> {
//     const prepared = { ...medicine };
//     if (prepared.mrp !== undefined || prepared.discount !== undefined) {
//       const mrp = Number(prepared.mrp || 0);
//       const discount = Number(prepared.discount || 0);
//       prepared.discountedPrice = this.calculateDiscountedPrice(mrp, discount).toString();
//     }
//     return prepared;
//   }

//   async getUser(id: number): Promise<User | undefined> {
//     const [user] = await db.select().from(users).where(eq(users.id, id));
//     return user;
//   }

//   async getValidCompanyUser(slug: string, email: string): Promise<boolean> {
//   // Fetch store by slug
//   const [store] = await db.select().from(stores).where(eq(stores.slug, slug));
//   // If store doesn't exist, it's not valid

//   if (!store) return false;
//   // Fetch user by email
//   const [user] = await db.select().from(users).where(eq(users.email, email));

//   // If user doesn't exist, it's not valid
//     console.log("user",user);
//   if (!user) return false;
//   // Compare store_id from user with id from store
//   return user.storeId === store.id;
// }


//   async getUserByEmail(email: string): Promise<User | undefined> {
//     const [user] = await db.select().from(users).where(eq(users.email, email));
//     return user;
//   }

//   async createUser(userData: InsertUser): Promise<User> {
//   // Hash password before storing
//   const hashedPassword = await bcrypt.hash(userData.password, 10);

//   // Insert the user
//   const result = await db.insert(users).values({
//     ...userData,
//     password: hashedPassword
//   });

//   // MySQL insert returns insertId
//   const insertedId = result[0].insertId;

//   // Fetch the inserted user
//   const [user] = await db
//     .select()
//     .from(users)
//     .where(eq(users.id, insertedId));

//   return user;
// }



//    async getAllStores(): Promise<string[]> {
//   const result = await db.select({ slug: stores.slug }).from(stores);
//   return result.map(store => store.slug); // ["store-1", "store-2"]
// }

//   async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
//     const updateData = { ...user };
//     if (updateData.password) {
//       updateData.password = await bcrypt.hash(updateData.password, 10);
//     }
//     await db.update(users).set({ ...updateData, updatedAt: new Date() }).where(eq(users.id, id));
//     const [updatedUser] = await db.select().from(users).where(eq(users.id, id));
//     return updatedUser;
//   }

//   async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
//     return bcrypt.compare(password, hashedPassword);
//   }

//   async getSroreIdBySlug(slug: string): Promise<Store>{
//      return db.select().from(stores).where(eq(stores.slug, slug)).limit(1);;
//   }
//   async getAddressesByUserId(userId: number): Promise<Address[]> {
//     return db.select().from(addresses).where(eq(addresses.userId, userId));
//   }

//   async createAddress(address: InsertAddress): Promise<Address> {
//     await db.insert(addresses).values(address);
//     const [newAddress] = await db.select().from(addresses).where(and(eq(addresses.userId, address.userId), eq(addresses.addressLine1, address.addressLine1)));
//     return newAddress;
//   }

//   async updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address> {
//     await db.update(addresses).set(address).where(eq(addresses.id, id));
//     const [updatedAddress] = await db.select().from(addresses).where(eq(addresses.id, id));
//     return updatedAddress;
//   }

//   async deleteAddress(id: number): Promise<void> {
//     await db.delete(addresses).where(eq(addresses.id, id));
//   }

//   async syncUserPhoneToAddresses(userId: number, phone: string): Promise<void> {
//     await db.update(addresses).set({ phone }).where(eq(addresses.userId, userId));
//   }


//   async searchMedicines(query: string): Promise<(Medicine & { category: MedicineCategory; totalStock: number })[]> {
//     return db
//       .select({
//         id: medicines.id,
//         name: medicines.name,
//         description: medicines.description,
//         dosage: medicines.dosage,
//         mrp: medicines.mrp,
//         discount: medicines.discount,
//         discountedPrice: medicines.discountedPrice,
//         categoryId: medicines.categoryId,
//         manufacturer: medicines.manufacturer,
//         requiresPrescription: medicines.requiresPrescription,
//         frontImageUrl: medicines.frontImageUrl,
//         backImageUrl: medicines.backImageUrl,
//         isActive: medicines.isActive,
//         createdAt: medicines.createdAt,
//         updatedAt: medicines.updatedAt,
//         category: medicineCategories,
//         totalStock: sql<number>`GREATEST(0, COALESCE(SUM(
//           CASE 
//             WHEN ${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL ${sql.raw(getShelfLifeInterval())} MONTH
//             THEN ${medicineInventory.quantity} 
//             ELSE 0 
//           END
//         ), 0) - COALESCE((
//           SELECT SUM(${cartItems.quantity}) 
//           FROM ${cartItems} 
//           WHERE ${cartItems.medicineId} = ${medicines.id}
//         ), 0))`,
//       })
//       .from(medicines)
//       .leftJoin(medicineCategories, eq(medicines.categoryId, medicineCategories.id))
//       .leftJoin(medicineInventory, eq(medicines.id, medicineInventory.medicineId))
//       .where(
//         and(
//           eq(medicines.isActive, true),
//           sql`LOWER(${medicines.name}) LIKE LOWER(${`%${query}%`})`
//         )
//       )
//       .groupBy(medicines.id, medicineCategories.id)
//       .orderBy(asc(medicines.name)) as any;
//   }

// async getMedicines(
//   storeId: number

// ): Promise<(Medicine & { category: MedicineCategory; totalStock: number })[]> {
//   return db
//     .select({
//       id: medicines.id,
//       storeId: medicines.storeId,
//       name: medicines.name,
//       description: medicines.description,
//       dosage: medicines.dosage,
//       mrp: medicines.mrp,
//       discount: medicines.discount,
//       discountedPrice: medicines.discountedPrice,
//       categoryId: medicines.categoryId,
//       manufacturer: medicines.manufacturer,
//       requiresPrescription: medicines.requiresPrescription,
//       frontImageUrl: medicines.frontImageUrl,
//       backImageUrl: medicines.backImageUrl,
//       isActive: medicines.isActive,
//       createdAt: medicines.createdAt,
//       updatedAt: medicines.updatedAt,
//       category: medicineCategories,
//       totalStock: sql<number>`
//         GREATEST(
//           0,
//           COALESCE(
//             SUM(
//               CASE
//                 WHEN ${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL ${sql.raw(
//                   getShelfLifeInterval()
//                 )} MONTH
//                 THEN ${medicineInventory.quantity}
//                 ELSE 0
//               END
//             ),
//             0
//           ) - COALESCE(
//             (SELECT SUM(${cartItems.quantity})
//              FROM ${cartItems}
//              WHERE ${cartItems.medicineId} = ${medicines.id}),
//             0
//           )
//         )
//       `,
//     })
//     .from(medicines)
//     .leftJoin(medicineCategories, eq(medicines.categoryId, medicineCategories.id))
//     .leftJoin(medicineInventory, eq(medicines.id, medicineInventory.medicineId))
//     .where(and(eq(medicines.isActive, true), eq(medicines.storeId, storeId))) // ✅ filter by store
//     .groupBy(medicines.id, medicineCategories.id)
//     .orderBy(asc(medicines.name)) as any;

// }




// async getMedicineById(id: number): Promise<Medicine | undefined> {
//   const [medicine] = await db
//     .select({
//       id: medicines.id,
//       name: medicines.name,
//       description: medicines.description,
//       dosage: medicines.dosage,
//       mrp: medicines.mrp,
//       discount: medicines.discount,
//       discountedPrice: medicines.discountedPrice,
//       categoryId: medicines.categoryId,
//       manufacturer: medicines.manufacturer,
//       requiresPrescription: medicines.requiresPrescription,
//       frontImageUrl: medicines.frontImageUrl,
//       backImageUrl: medicines.backImageUrl,
//       isActive: medicines.isActive,
//       createdAt: medicines.createdAt,
//       updatedAt: medicines.updatedAt,
//     })
//     .from(medicines)
//     .where(eq(medicines.id, id));
//   return medicine;
// }

// async searchMedicines(query: string): Promise<(Medicine & { category: MedicineCategory; totalStock: number })[]> {
//   return db
//     .select({
//       id: medicines.id,
//       name: medicines.name,
//       description: medicines.description,
//       dosage: medicines.dosage,
//       mrp: medicines.mrp,
//       discount: medicines.discount,
//       discountedPrice: medicines.discountedPrice,
//       categoryId: medicines.categoryId,
//       manufacturer: medicines.manufacturer,
//       requiresPrescription: medicines.requiresPrescription,
//       frontImageUrl: medicines.frontImageUrl,
//       backImageUrl: medicines.backImageUrl,
//       isActive: medicines.isActive,
//       createdAt: medicines.createdAt,
//       updatedAt: medicines.updatedAt,
//       category: medicineCategories,
//       totalStock: sql<number>`GREATEST(
//         0,
//         COALESCE(
//           SUM(
//             CASE 
//               WHEN ${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL ${sql.raw(getShelfLifeInterval())} MONTH
//               THEN ${medicineInventory.quantity} 
//               ELSE 0 
//             END
//           ),
//           0
//         ) - COALESCE(
//           (
//             SELECT SUM(${cartItems.quantity}) 
//             FROM ${cartItems} 
//             WHERE ${cartItems.medicineId} = ${medicines.id}
//           ),
//           0
//         )
//       )`,
//     })
//     .from(medicines)
//     .leftJoin(medicineCategories, eq(medicines.categoryId, medicineCategories.id))
//     .leftJoin(medicineInventory, eq(medicines.id, medicineInventory.medicineId))
//     .where(
//       and(
//         eq(medicines.isActive, true),
//         sql`${medicines.name} LIKE ${`%${query}%`}` // Removed LOWER() for MySQL case-insensitive search
//       )
//     )
//     .groupBy(medicines.id, medicineCategories.id)
//     .orderBy(asc(medicines.name)) as any;
// }



//   async getMedicineCategories(storeId: number): Promise<MedicineCategory[]> {
//   return db
//     .select()
//     .from(medicineCategories)
//     .where(eq(medicineCategories.storeId, storeId))
//     .orderBy(asc(medicineCategories.name));
// }
// async getAllOrders2() {
//   return db
//     .select({
//       order: {
//         id: orders.id,
//         orderNumber: orders.orderNumber,
//         status: orders.status,
//         total: orders.total,
//         createdAt: orders.createdAt,
//       },
//       user: {
//         id: users.id,
//         firstName: users.firstName,
//         lastName: users.lastName,
//         email: users.email,
//       },
//     })
//     .from(orders)
//     .leftJoin(users, eq(users.id, orders.userId));
// }

// async createMedicineCategory(
//   name: string,
//   description: string | undefined,
//   isScheduleH: boolean | undefined,
//   storeId: number
// ): Promise<MedicineCategory> {
//   await db.insert(medicineCategories).values({
//     name,
//     description,
//     isScheduleH: isScheduleH || false,
//     storeId
//   });

//   const [category] = await db
//     .select()
//     .from(medicineCategories)
//     .where(eq(medicineCategories.name, name))
//     .where(eq(medicineCategories.storeId, storeId));

//   return category;
// }


// async getOrdersByUserIdAndStore(userId: number, storeId: number) {
//   return db
//     .select()
//     .from(orders)
//     .where(
//       and(
//         eq(orders.userId, userId),
//         eq(orders.storeId, storeId) // assuming you already store storeId in orders table
//       )
//     );
// }

// async getOrdersByStoreId(storeId: number) {
//   return db
//     .select({
//       id: orders.id,
//       orderNumber: orders.orderNumber,
//       status: orders.status,
//       total: orders.total,
//       createdAt: orders.createdAt,
//       // 👇 nested user
//       user: {
//         id: users.id,
//         firstName: users.firstName,
//         lastName: users.lastName,
//         email: users.email,
//       },
//     })
//     .from(orders)
//     .leftJoin(users, eq(users.id, orders.userId))
//     .where(eq(orders.storeId, storeId));
// }


// async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
//   const preparedMedicine = this.prepareMedicineData(medicine);

//   await db.insert(medicines).values(preparedMedicine);

//   const [newMedicine] = await db
//     .select()
//     .from(medicines)
//     .where(
//       and(
//         eq(medicines.name, medicine.name),
//         eq(medicines.storeId, medicine.storeId) // ✅ only this store
//       )
//     );

//   return newMedicine;
// }
// async updateMedicine(id: number, medicine: Partial<InsertMedicine>, storeId: number): Promise<Medicine> {
//   const preparedMedicine = this.prepareMedicineData(medicine);

//   await db
//     .update(medicines)
//     .set({ ...preparedMedicine, updatedAt: new Date() })
//     .where(and(eq(medicines.id, id), eq(medicines.storeId, storeId))); // ✅ secure

//   const [updatedMedicine] = await db
//     .select()
//     .from(medicines)
//     .where(and(eq(medicines.id, id), eq(medicines.storeId, storeId)));

//   return updatedMedicine;
// }
// async deleteMedicine(id: number, storeId: number): Promise<void> {
//   await db
//     .update(medicines)
//     .set({ isActive: false })
//     .where(and(eq(medicines.id, id), eq(medicines.storeId, storeId))); // ✅ secure
// }
// async getMedicineInventory(medicineId: number, storeId: number): Promise<MedicineInventory[]> {
//   return db
//     .select()
//     .from(medicineInventory)
//     .where(and(eq(medicineInventory.medicineId, medicineId), eq(medicineInventory.storeId, storeId))) // ✅ secure
//     .orderBy(asc(medicineInventory.expiryDate));
// }
// async createMedicineInventory(inventory: InsertMedicineInventory, storeId: number): Promise<MedicineInventory> {
//   await db.insert(medicineInventory).values({
//     ...inventory,
//     storeId // ✅ link inventory to store
//   });

//   const [newInventory] = await db
//     .select()
//     .from(medicineInventory)
//     .where(
//       and(
//         eq(medicineInventory.medicineId, inventory.medicineId),
//         eq(medicineInventory.batchNumber, inventory.batchNumber),
//         eq(medicineInventory.storeId, storeId) // ✅ scoped
//       )
//     );

//   return newInventory;
// }
// async updateMedicineInventory(id: number, inventory: Partial<InsertMedicineInventory>, storeId: number): Promise<MedicineInventory> {
//   await db
//     .update(medicineInventory)
//     .set({ ...inventory, updatedAt: new Date() })
//     .where(and(eq(medicineInventory.id, id), eq(medicineInventory.storeId, storeId))); // ✅ secure

//   const [updatedInventory] = await db
//     .select()
//     .from(medicineInventory)
//     .where(and(eq(medicineInventory.id, id), eq(medicineInventory.storeId, storeId)));

//   return updatedInventory;
// }




//   async getLowStockMedicines(): Promise<(Medicine & { totalStock: number })[]> {
//     return db
//       .select({
//         id: medicines.id,
//         name: medicines.name,
//         description: medicines.description,
//         dosage: medicines.dosage,
//         mrp: medicines.mrp,
//         discount: medicines.discount,
//         discountedPrice: medicines.discountedPrice,
//         categoryId: medicines.categoryId,
//         manufacturer: medicines.manufacturer,
//         requiresPrescription: medicines.requiresPrescription,
//         isActive: medicines.isActive,
//         createdAt: medicines.createdAt,
//         updatedAt: medicines.updatedAt,
//         totalStock: sql<number>`GREATEST(0, COALESCE(SUM(
//           CASE 
//             WHEN ${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL ${sql.raw(getShelfLifeInterval())} MONTH

//             THEN ${medicineInventory.quantity} 
//             ELSE 0 
//           END
//         ), 0) - COALESCE((
//           SELECT SUM(${cartItems.quantity}) 
//           FROM ${cartItems} 
//           WHERE ${cartItems.medicineId} = ${medicines.id}
//         ), 0))`,
//       })
//       .from(medicines)
//       .leftJoin(medicineInventory, eq(medicines.id, medicineInventory.medicineId))
//       .where(eq(medicines.isActive, true))
//       .groupBy(medicines.id)
//       // .having(sql`GREATEST(0, COALESCE(SUM(
//       //   CASE 
//       //     WHEN ${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL '${sql.raw(getShelfLifeInterval())}' 
//       //     THEN ${medicineInventory.quantity} 
//       //     ELSE 0 
//       //   END
//       // ), 0) - COALESCE((
//       //   SELECT SUM(${cartItems.quantity}) 
//       //   FROM ${cartItems} 
//       //   WHERE ${cartItems.medicineId} = ${medicines.id}
//       // ), 0)) < 20`)
//       .having(sql`GREATEST(0, COALESCE(SUM(
//   CASE 
//     WHEN ${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL ${sql.raw(getShelfLifeInterval())} MONTH
//     THEN ${medicineInventory.quantity} 
//     ELSE 0 
//   END
// ), 0) - COALESCE((
//   SELECT SUM(${cartItems.quantity}) 
//   FROM ${cartItems} 
//   WHERE ${cartItems.medicineId} = ${medicines.id}
// ), 0)) < 20`)
//       // .orderBy(sql`GREATEST(0, COALESCE(SUM(
//       //   CASE 
//       //     WHEN ${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL '${sql.raw(getShelfLifeInterval())}' 
//       //     THEN ${medicineInventory.quantity} 
//       //     ELSE 0 
//       //   END
//       // ), 0) - COALESCE((
//       //   SELECT SUM(${cartItems.quantity}) 
//       //   FROM ${cartItems} 
//       //   WHERE ${cartItems.medicineId} = ${medicines.id}
//       // ), 0))`) as any;
//       .orderBy(sql`GREATEST(0, COALESCE(SUM(
//   CASE 
//     WHEN ${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL ${sql.raw(getShelfLifeInterval())} MONTH
//     THEN ${medicineInventory.quantity} 
//     ELSE 0 
//   END
// ), 0) - COALESCE((
//   SELECT SUM(${cartItems.quantity}) 
//   FROM ${cartItems} 
//   WHERE ${cartItems.medicineId} = ${medicines.id}
// ), 0))`)
//   }




//   async getPrescriptionsByUserId(userId: number): Promise<Prescription[]> {
//     return db
//       .select()
//       .from(prescriptions)
//       .where(eq(prescriptions.userId, userId))
//       .orderBy(desc(prescriptions.uploadedAt));
//   }

//   async getPendingPrescriptions(): Promise<(Prescription & { user: User })[]> {
//     return db
//       .select({
//         id: prescriptions.id,
//         userId: prescriptions.userId,
//         fileName: prescriptions.fileName,
//         filePath: prescriptions.filePath,
//         status: prescriptions.status,
//         reviewedBy: prescriptions.reviewedBy,
//         reviewedAt: prescriptions.reviewedAt,
//         reviewNotes: prescriptions.reviewNotes,
//         uploadedAt: prescriptions.uploadedAt,
//         user: users,
//       })
//       .from(prescriptions)
//       .leftJoin(users, eq(prescriptions.userId, users.id))
//       .where(eq(prescriptions.status, "pending"))
//       .orderBy(desc(prescriptions.uploadedAt)) as any;
//   }

//   async getAllPrescriptions(): Promise<(Prescription & { user: User })[]> {
//     return db
//       .select({
//         id: prescriptions.id,
//         userId: prescriptions.userId,
//         fileName: prescriptions.fileName,
//         filePath: prescriptions.filePath,
//         status: prescriptions.status,
//         reviewedBy: prescriptions.reviewedBy,
//         reviewedAt: prescriptions.reviewedAt,
//         reviewNotes: prescriptions.reviewNotes,
//         uploadedAt: prescriptions.uploadedAt,
//         user: users,
//       })
//       .from(prescriptions)
//       .leftJoin(users, eq(prescriptions.userId, users.id))
//       .orderBy(desc(prescriptions.uploadedAt)) as any;
//   }

//   async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
//     await db.insert(prescriptions).values(prescription);
//     const [newPrescription] = await db.select().from(prescriptions).where(and(eq(prescriptions.userId, prescription.userId), eq(prescriptions.filePath, prescription.filePath)));
//     return newPrescription;
//   }

//   async updatePrescriptionStatus(id: number, status: string, reviewedBy: number, notes?: string): Promise<Prescription> {
//     await db.update(prescriptions).set({ status, reviewedBy, reviewedAt: new Date(), reviewNotes: notes }).where(eq(prescriptions.id, id));
//     const [updatedPrescription] = await db.select().from(prescriptions).where(eq(prescriptions.id, id));
//     return updatedPrescription;
//   }

//   async getCartItems(userId: number): Promise<(CartItem & { medicine: Medicine })[]> {
//     return db
//       .select({
//         id: cartItems.id,
//         userId: cartItems.userId,
//         medicineId: cartItems.medicineId,
//         quantity: cartItems.quantity,
//         addedAt: cartItems.addedAt,
//         medicine: medicines,
//       })
//       .from(cartItems)
//       .leftJoin(medicines, eq(cartItems.medicineId, medicines.id))
//       .where(eq(cartItems.userId, userId)) as any;
//   }

//   async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
//     const availableStock = await this.getAvailableStock(cartItem.medicineId);
//     const [existingItem] = await db
//       .select()
//       .from(cartItems)
//       .where(and(eq(cartItems.userId, cartItem.userId), eq(cartItems.medicineId, cartItem.medicineId)));

//     if (existingItem) {
//       const newQuantity = existingItem.quantity + cartItem.quantity;
//       if (newQuantity > availableStock + existingItem.quantity) {
//         throw new Error(`Insufficient stock. Only ${availableStock + existingItem.quantity} available.`);
//       }
//       await db.update(cartItems).set({ quantity: newQuantity }).where(eq(cartItems.id, existingItem.id));
//       const [updatedItem] = await db.select().from(cartItems).where(eq(cartItems.id, existingItem.id));
//       return updatedItem;
//     } else {
//       if (cartItem.quantity > availableStock) {
//         throw new Error(`Insufficient stock. Only ${availableStock} available.`);
//       }
//       await db.insert(cartItems).values(cartItem);
//       const [newItem] = await db.select().from(cartItems).where(and(eq(cartItems.userId, cartItem.userId), eq(cartItems.medicineId, cartItem.medicineId)));
//       return newItem;
//     }
//   }

//   async updateCartItem(id: number, quantity: number): Promise<CartItem> {
//     const [cartItem] = await db.select().from(cartItems).where(eq(cartItems.id, id));
//     if (!cartItem) {
//       throw new Error("Cart item not found");
//     }
//     const availableStock = await this.getAvailableStock(cartItem.medicineId);
//     const currentCartQuantity = cartItem.quantity;
//     const stockAvailableForThisItem = availableStock + currentCartQuantity;
//     if (quantity > stockAvailableForThisItem) {
//       throw new Error(`Insufficient stock. Only ${stockAvailableForThisItem} available.`);
//     }
//     await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
//     const [updatedItem] = await db.select().from(cartItems).where(eq(cartItems.id, id));
//     return updatedItem;
//   }

//   async removeFromCart(id: number): Promise<void> {
//     await db.delete(cartItems).where(eq(cartItems.id, id));
//   }

//   async clearCart(userId: number): Promise<void> {
//     await db.delete(cartItems).where(eq(cartItems.userId, userId));
//   }


// async getOrdersByUserId(userId: number): Promise<(Order & { 
//   user: User; 
//   items: (OrderItem & { medicine: Medicine })[]; 
//   shippingAddress?: Address; 
//   billingAddress?: Address 
// })[]> {
//   const ordersData = await db
//     .select({
//       order: orders,
//       user: users,
//       item: orderItems,
//       medicine: medicines,
//       shippingAddress: {
//         id: sql`shipping_addr.id`,
//         userId: sql`shipping_addr.user_id`,
//         type: sql`shipping_addr.type`,
//         fullName: sql`shipping_addr.full_name`,
//         addressLine1: sql`shipping_addr.address_line_1`,
//         addressLine2: sql`shipping_addr.address_line_2`,
//         city: sql`shipping_addr.city`,
//         state: sql`shipping_addr.state`,
//         postalCode: sql`shipping_addr.postal_code`,
//         phone: sql`shipping_addr.phone`,
//         isDefault: sql`shipping_addr.is_default`,
//         createdAt: sql`shipping_addr.created_at`,
//       },
//       billingAddress: {
//         id: sql`billing_addr.id`,
//         userId: sql`billing_addr.user_id`,
//         type: sql`billing_addr.type`,
//         fullName: sql`billing_addr.full_name`,
//         addressLine1: sql`billing_addr.address_line_1`,
//         addressLine2: sql`billing_addr.address_line_2`,
//         city: sql`billing_addr.city`,
//         state: sql`billing_addr.state`,
//         postalCode: sql`billing_addr.postal_code`,
//         phone: sql`billing_addr.phone`,
//         isDefault: sql`billing_addr.is_default`,
//         createdAt: sql`billing_addr.created_at`,
//       },
//     })
//     .from(orders)
//     .innerJoin(users, eq(orders.userId, users.id)) 
//     .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
//     .leftJoin(medicines, eq(orderItems.medicineId, medicines.id))
//     .leftJoin(sql`${addresses} AS shipping_addr`, sql`shipping_addr.id = ${orders.shippingAddressId}`)
//     .leftJoin(sql`${addresses} AS billing_addr`, sql`billing_addr.id = ${orders.billingAddressId}`)
//     .where(eq(orders.userId, userId))
//     .orderBy(desc(orders.placedAt));

//   const orderMap = new Map();
//   ordersData.forEach(({ order, user, item, medicine, shippingAddress, billingAddress }) => {
//     if (!orderMap.has(order.id)) {
//       orderMap.set(order.id, { 
//         ...order, 
//         user, 
//         items: [], 
//         shippingAddress: shippingAddress?.id ? shippingAddress : undefined,
//         billingAddress: billingAddress?.id ? billingAddress : undefined,
//       });
//     }
//     if (item && medicine) {
//       orderMap.get(order.id).items.push({ ...item, medicine });
//     }
//   });

//   return Array.from(orderMap.values());
// }



// async getAllOrders(storeId: number): Promise<(Order & { 
//   user: User; 
//   items: (OrderItem & { medicine: Medicine })[]; 
//   prescription?: Prescription 
// })[]> {
//   const ordersData = await db
//     .select({
//       order: orders,
//       user: users,
//       item: orderItems,
//       medicine: medicines,
//       prescription: prescriptions,
//     })
//     .from(orders)
//     .innerJoin(users, eq(orders.userId, users.id)) 
//     .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
//     .leftJoin(medicines, eq(orderItems.medicineId, medicines.id))
//     .leftJoin(prescriptions, eq(orders.prescriptionId, prescriptions.id))
//     .where(eq(orders.storeId, storeId))   // ✅ filter store wise
//     .orderBy(desc(orders.placedAt));

//   const orderMap = new Map();
//   ordersData.forEach(({ order, user, item, medicine, prescription }) => {
//     if (!orderMap.has(order.id)) {
//       orderMap.set(order.id, {
//         ...order,
//         user,
//         items: [],
//         prescription: prescription?.id ? prescription : undefined,
//       });
//     }
//     if (item && medicine) {
//       orderMap.get(order.id).items.push({ ...item, medicine });
//     }
//   });

//   return Array.from(orderMap.values());
// }


// async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
//   const timestamp = Date.now().toString();
//   const orderNumber = `SMD${timestamp.slice(-8)}`;

//   let storeId: number | null = order.storeId ?? null;

//   const orderItemsWithBatches = [];

//   for (const item of items) {
//     const batchAllocations = await this.allocateBatchesForOrder(item.medicineId, item.quantity);

//     // derive storeId from the first allocated batch if not already set
//     if (!storeId && batchAllocations.length > 0) {
//       const [batchInfo] = await db
//         .select({ storeId: medicineInventory.storeId })
//         .from(medicineInventory)
//         .where(eq(medicineInventory.id, batchAllocations[0].batchId));
//       storeId = batchInfo?.storeId ?? null;
//     }

//     for (const allocation of batchAllocations) {
//       await db
//         .update(medicineInventory)
//         .set({ quantity: sql`${medicineInventory.quantity} - ${allocation.quantity}` })
//         .where(eq(medicineInventory.id, allocation.batchId));

//       const totalPrice = allocation.quantity * parseFloat(item.unitPrice.toString());

//       orderItemsWithBatches.push({
//         orderId: 0, // placeholder, will set after order insert
//         medicineId: item.medicineId,
//         quantity: allocation.quantity,
//         unitPrice: item.unitPrice,
//         totalPrice: totalPrice.toString(),
//         batchId: allocation.batchId,
//       });
//     }
//   }

//   // Insert order with storeId
//   await db.insert(orders).values({ ...order, orderNumber, storeId });
//   const [newOrder] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));

//   // Update orderId in items and insert
//   for (const item of orderItemsWithBatches) {
//     item.orderId = newOrder.id;
//   }
//   await db.insert(orderItems).values(orderItemsWithBatches);

//   return newOrder;
// }

//   async updateOrderStatus(id: number, status: string): Promise<Order> {
//     const updateData: any = { status };
//     if (status === "delivered") {
//       updateData.deliveredAt = new Date();
//     }
//     await db.update(orders).set(updateData).where(eq(orders.id, id));
//     const [updatedOrder] = await db.select().from(orders).where(eq(orders.id, id));
//     return updatedOrder;
//   }


// async getOrderById(id: number): Promise<(Order & {
//   user: User;
//   items: (OrderItem & { medicine: Medicine })[];
//   billingAddress: Address;
//   shippingAddress: Address;
//   prescription?: Prescription;
// }) | undefined> {
//   const orderData = await db
//     .select({
//       order: orders,
//       user: users,
//       item: orderItems,
//       medicine: medicines,
//       billingAddress: billingAddr,   // ✅ use alias
//       shippingAddress: shippingAddr, // ✅ use alias
//       prescription: prescriptions,
//     })
//     .from(orders)
//     .innerJoin(users, eq(orders.userId, users.id))
//     .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
//     .leftJoin(medicines, eq(orderItems.medicineId, medicines.id))
//     .leftJoin(billingAddr, eq(billingAddr.id, orders.billingAddressId))
//     .leftJoin(shippingAddr, eq(shippingAddr.id, orders.shippingAddressId))
//     .leftJoin(prescriptions, eq(orders.prescriptionId, prescriptions.id))
//     .where(eq(orders.id, id));

//   if (orderData.length === 0) return undefined;

//   const { order, user, billingAddress, shippingAddress, prescription } = orderData[0];

//   const items = orderData
//     .filter(({ item, medicine }) => item && medicine)
//     .map(({ item, medicine }) => ({ ...item, medicine }));

//   return {
//     ...order,
//     user,
//     items,
//     billingAddress: billingAddress as Address,
//     shippingAddress: shippingAddress as Address,
//     prescription: prescription || undefined,
//   } as any;
// }

//   async getNotificationsByUserId(userId: number): Promise<Notification[]> {
//     return db
//       .select()
//       .from(notifications)
//       .where(eq(notifications.userId, userId))
//       .orderBy(desc(notifications.createdAt));
//   }

//   async createNotification(notification: InsertNotification): Promise<Notification> {
//     await db.insert(notifications).values(notification);
//     const [newNotification] = await db.select().from(notifications).where(and(eq(notifications.userId, notification.userId), eq(notifications.message, notification.message)));
//     return newNotification;
//   }

//   async markNotificationAsRead(id: number): Promise<void> {
//     await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
//   }

//   async deleteNotification(id: number): Promise<void> {
//     await db.delete(notifications).where(eq(notifications.id, id));
//   }

//   async getDashboardStats(): Promise<{
//     totalSales: number;
//     ordersToday: number;
//     lowStockCount: number;
//     pendingPrescriptions: number;
//   }> {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const [salesResult] = await db.select({ totalSales: sum(orders.totalAmount) }).from(orders).where(eq(orders.paymentStatus, "paid"));
//     const [ordersTodayResult] = await db.select({ count: count() }).from(orders).where(sql`DATE(${orders.placedAt}) = DATE(${today})`);
//     const [lowStockResult] = await db
//       .select({ count: count() })
//       .from(medicines)
//       .leftJoin(medicineInventory, eq(medicines.id, medicineInventory.medicineId))
//       .where(eq(medicines.isActive, true))
//       .groupBy(medicines.id)
//       .having(sql`COALESCE(SUM(${medicineInventory.quantity}), 0) < 20`);
//     const [pendingPrescriptionsResult] = await db.select({ count: count() }).from(prescriptions).where(eq(prescriptions.status, "pending"));

//     return {
//       totalSales: Number(salesResult?.totalSales || 0),
//       ordersToday: ordersTodayResult?.count || 0,
//       lowStockCount: lowStockResult?.count || 0,
//       pendingPrescriptions: pendingPrescriptionsResult?.count || 0,
//     };
//   }

//   async getSalesAnalytics(timePeriod: string): Promise<any[]> {
//     const allOrders = await db.select().from(orders);
//     const today = new Date();
//     const data = [];

//     switch (timePeriod) {
//       case "weekly":
//         for (let i = 6; i >= 0; i--) {
//           const date = new Date(today);
//           date.setDate(date.getDate() - i);
//           const dayStart = new Date(date);
//           dayStart.setHours(0, 0, 0, 0);
//           const dayEnd = new Date(date);
//           dayEnd.setHours(23, 59, 59, 999);
//           const dayOrders = allOrders.filter(order => {
//             if (!order.placedAt) return false;
//             const orderDate = new Date(order.placedAt);
//             return orderDate >= dayStart && orderDate <= dayEnd;
//           });
//           const paidOrders = dayOrders.filter(order => order.paymentStatus === "paid");
//           const totalSales = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
//           data.push({
//             date: date.toISOString().split("T")[0],
//             sales: totalSales,
//             orders: dayOrders.length,
//             label: date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
//           });
//         }
//         break;
//       default:
//         const paidOrders = allOrders.filter(order => order.paymentStatus === "paid");
//         const totalSales = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
//         data.push({
//           date: today.toISOString().split("T")[0],
//           sales: totalSales,
//           orders: allOrders.length,
//           label: "Total",
//         });
//     }
//     return data;
//   }

//   async getCategoryAnalytics(): Promise<any[]> {
//     const categoryStats = await db
//       .select({
//         name: medicineCategories.name,
//         count: count(medicines.id),
//       })
//       .from(medicineCategories)
//       .leftJoin(medicines, eq(medicineCategories.id, medicines.categoryId))
//       .where(eq(medicines.isActive, true))
//       .groupBy(medicineCategories.id, medicineCategories.name);

//     const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];
//     return categoryStats.map((category, index) => ({
//       name: category.name,
//       value: category.count,
//       color: colors[index % colors.length],
//     }));
//   }

//   async getBatchesByMedicineId(medicineId: number): Promise<Batch[]> {
//     return db
//       .select({
//         id: medicineInventory.id,
//         medicineId: medicineInventory.medicineId,
//         batchNumber: medicineInventory.batchNumber,
//         quantity: medicineInventory.quantity,
//         expiryDate: medicineInventory.expiryDate,
//         isDisposed: medicineInventory.isDisposed,
//         disposalReason: medicineInventory.disposalReason,
//         disposedAt: medicineInventory.disposedAt,
//         createdAt: medicineInventory.createdAt,
//         updatedAt: medicineInventory.updatedAt,
//       })
//       .from(medicineInventory)
//       .where(eq(medicineInventory.medicineId, medicineId))
//       .orderBy(asc(medicineInventory.expiryDate));
//   }

//   async addBatch(batch: InsertBatch): Promise<Batch> {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const expiryDate = new Date(batch.expiryDate);
//     if (expiryDate < today) {
//       throw new Error("Cannot add batch with expiry date in the past");
//     }
//     await db.insert(medicineInventory).values(batch);
//     const [newBatch] = await db.select().from(medicineInventory).where(and(eq(medicineInventory.medicineId, batch.medicineId), eq(medicineInventory.batchNumber, batch.batchNumber)));
//     return newBatch;
//   }

//   async updateBatch(id: number, batch: Partial<InsertBatch>): Promise<Batch> {
//     if (batch.expiryDate) {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       const expiryDate = new Date(batch.expiryDate);
//       if (expiryDate < today) {
//         throw new Error("Cannot update batch with expiry date in the past");
//       }
//     }
//     await db.update(medicineInventory).set(batch).where(eq(medicineInventory.id, id));
//     const [updatedBatch] = await db.select().from(medicineInventory).where(eq(medicineInventory.id, id));
//     return updatedBatch;
//   }

//   async deleteBatch(id: number): Promise<void> {
//     await db.delete(medicineInventory).where(eq(medicineInventory.id, id));
//   }

//   async getExpiringBatches(days: number): Promise<(Batch & { medicine: Medicine })[]> {
//     const expiryThreshold = new Date();
//     expiryThreshold.setDate(expiryThreshold.getDate() + days);
//     return db
//       .select({
//         id: medicineInventory.id,
//         medicineId: medicineInventory.medicineId,
//         batchNumber: medicineInventory.batchNumber,
//         quantity: medicineInventory.quantity,
//         expiryDate: medicineInventory.expiryDate,
//         createdAt: medicineInventory.createdAt,
//         updatedAt: medicineInventory.updatedAt,
//         medicine: medicines,
//       })
//       .from(medicineInventory)
//       .innerJoin(medicines, eq(medicineInventory.medicineId, medicines.id))
//       .where(and(lte(medicineInventory.expiryDate, expiryThreshold), gte(medicineInventory.quantity, 1)))
//       .orderBy(asc(medicineInventory.expiryDate));
//   }

//   async getExpiredBatches(): Promise<(Batch & { medicine: Medicine })[]> {
//     const today = new Date();
//     return db
//       .select({
//         id: medicineInventory.id,
//         medicineId: medicineInventory.medicineId,
//         batchNumber: medicineInventory.batchNumber,
//         quantity: medicineInventory.quantity,
//         expiryDate: medicineInventory.expiryDate,
//         isDisposed: medicineInventory.isDisposed,
//         disposalReason: medicineInventory.disposalReason,
//         disposedAt: medicineInventory.disposedAt,
//         disposedBy: medicineInventory.disposedBy,
//         createdAt: medicineInventory.createdAt,
//         updatedAt: medicineInventory.updatedAt,
//         medicine: medicines,
//       })
//       .from(medicineInventory)
//       .innerJoin(medicines, eq(medicineInventory.medicineId, medicines.id))
//       .where(and(sql`${medicineInventory.expiryDate} < ${today}`, eq(medicineInventory.isDisposed, false), gte(medicineInventory.quantity, 1)))
//       .orderBy(asc(medicineInventory.expiryDate));
//   }

//   async markBatchAsDisposed(batchId: number, reason: string): Promise<void> {
//     await db
//       .update(medicineInventory)
//       .set({ isDisposed: true, disposalReason: reason, disposedAt: new Date(), quantity: 0 })
//       .where(eq(medicineInventory.id, batchId));
//   }

//   async getBatchDisposalHistory(): Promise<any[]> {
//     return db
//       .select({
//         id: medicineInventory.id,
//         medicineId: medicineInventory.medicineId,
//         medicineName: medicines.name,
//         batchNumber: medicineInventory.batchNumber,
//         expiryDate: medicineInventory.expiryDate,
//         disposalReason: medicineInventory.disposalReason,
//         disposedAt: medicineInventory.disposedAt,
//         disposedBy: medicineInventory.disposedBy,
//       })
//       .from(medicineInventory)
//       .innerJoin(medicines, eq(medicineInventory.medicineId, medicines.id))
//       .where(eq(medicineInventory.isDisposed, true))
//       .orderBy(desc(medicineInventory.disposedAt));
//   }

//   async allocateBatchesForOrder(medicineId: number, quantity: number): Promise<{ batchId: number; quantity: number }[]> {
//     const today = new Date();
//     const availableBatches = await db
//       .select()
//       .from(medicineInventory)
//       .where(
//         and(
//           eq(medicineInventory.medicineId, medicineId),
//           gte(medicineInventory.quantity, 1),
//           sql`${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL ${sql.raw(getShelfLifeInterval())} MONTH`

//         )
//       )
//       .orderBy(asc(medicineInventory.expiryDate));

//     const allocations: { batchId: number; quantity: number }[] = [];
//     let remainingQuantity = quantity;

//     for (const batch of availableBatches) {
//       if (remainingQuantity <= 0) break;
//       const allocateFromBatch = Math.min(batch.quantity, remainingQuantity);
//       allocations.push({ batchId: batch.id, quantity: allocateFromBatch });
//       remainingQuantity -= allocateFromBatch;
//     }

//     if (remainingQuantity > 0) {
//       throw new Error(`Insufficient stock with ${config.minimumShelfLifeMonths}+ months shelf life: ${remainingQuantity} units short for medicine ID ${medicineId}. Available stock: ${quantity - remainingQuantity} units.`);
//     }

//     return allocations;
//   }

//   async getSuperAdminStats(): Promise<{
//     totalStores: number;
//     activeStores: number;
//     totalAdmins: number;
//     totalCustomers: number;
//     totalOrders: number;
//     totalSales: number;
//   }> {
//     const [storesResult] = await db
//       .select({ total: count(), active: sql<number>`COUNT(CASE WHEN ${stores.isActive} = true THEN 1 END)` })
//       .from(stores);
//     const [adminsResult] = await db.select({ count: count() }).from(users).where(eq(users.role, 1));
//     const [customersResult] = await db.select({ count: count() }).from(users).where(eq(users.role, 2));
//     const [ordersResult] = await db.select({ count: count() }).from(orders);
//     const [salesResult] = await db.select({ totalSales: sum(orders.totalAmount) }).from(orders).where(eq(orders.paymentStatus, "paid"));

//     return {
//       totalStores: storesResult?.total || 0,
//       activeStores: Number(storesResult?.active || 0),
//       totalAdmins: adminsResult?.count || 0,
//       totalCustomers: customersResult?.count || 0,
//       totalOrders: ordersResult?.count || 0,
//       totalSales: Number(salesResult?.totalSales || 0),
//     };
//   }

//   async getPlatformAnalytics(): Promise<{
//     totalStores: number;
//     activeStores: number;
//     totalUsers: number;
//     totalOrders: number;
//     totalSales: number;
//     totalMedicines: number;
//     recentActivity: {
//       newStores: number;
//       newUsers: number;
//       ordersToday: number;
//       salesToday: number;
//     };
//   }> {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const [
//       totalStores,
//       activeStores,
//       totalUsers,
//       totalOrders,
//       totalMedicines,
//       paidOrders,
//       newStoresToday,
//       newUsersToday,
//       ordersTodayCount,
//       salesToday,
//     ] = await Promise.all([
//       db.select({ count: count() }).from(stores),
//       db.select({ count: count() }).from(stores).where(eq(stores.isActive, true)),
//       db.select({ count: count() }).from(users),
//       db.select({ count: count() }).from(orders),
//       db.select({ count: count() }).from(medicines),
//       db.select({ sum: sum(orders.totalAmount) }).from(orders).where(eq(orders.paymentStatus, "paid")),
//       db.select({ count: count() }).from(stores).where(gte(stores.createdAt, today)),
//       db.select({ count: count() }).from(users).where(gte(users.createdAt, today)),
//       db.select({ count: count() }).from(orders).where(gte(orders.createdAt, today)),
//       db.select({ sum: sum(orders.totalAmount) }).from(orders).where(and(eq(orders.paymentStatus, "paid"), gte(orders.createdAt, today))),
//     ]);

//     return {
//       totalStores: totalStores[0].count,
//       activeStores: activeStores[0].count,
//       totalUsers: totalUsers[0].count,
//       totalOrders: totalOrders[0].count,
//       totalSales: Number(paidOrders[0].sum) || 0,
//       totalMedicines: totalMedicines[0].count,
//       recentActivity: {
//         newStores: newStoresToday[0].count,
//         newUsers: newUsersToday[0].count,
//         ordersToday: ordersTodayCount[0].count,
//         salesToday: Number(salesToday[0].sum) || 0,
//       },
//     };
//   }

//   async getAllUsers(): Promise<any[]> {
//     return db
//       .select({
//         id: users.id,
//         email: users.email,
//         firstName: users.firstName,
//         lastName: users.lastName,
//         phone: users.phone,
//         role: users.role,
//         storeId: users.storeId,
//         storeName: stores.name,
//         isActive: users.isActive,
//         createdAt: users.createdAt,
//       })
//       .from(users)
//       .leftJoin(stores, eq(users.storeId, stores.id))
//       .orderBy(desc(users.createdAt));
//   }

//   async getStores(): Promise<Store[]> {
//     return db.select().from(stores).orderBy(desc(stores.createdAt));
//   }
//   async getStores2(): Promise<Store[]> {
//     return db.select().from(stores).orderBy(desc(stores.createdAt));
//   }


//  async updateOrderPaymentStatus(id: number, paymentStatus: string): Promise<void> {
//     await db
//       .update(orders)
//       .set({ paymentStatus })   // Drizzle maps TS -> `payment_status` column
//       .where(eq(orders.id, id))
//       .execute();               // ✅ required for MySQL
//   }

// async onboardStore(data: any): Promise<{ store: any; admin: any }> {
//   // Create slug from storeName
//   const slug = data.storeName
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "");

//   // ✅ Generate QR Code URL (link to store page or slug)
// const qrData = `http://localhost:5000/${slug}/customer/login`;
// const qrCodeUrl = await QRCode.toDataURL(qrData);

//   // Insert store
//   const [storeResult] = await db.insert(stores).values({
//     name: data.storeName,
//     slug,
//     email: data.storeEmail,
//     phone: data.storePhone,
//     address: data.address,
//     city: data.city,
//     state: data.state,
//     pincode: data.pincode,
//     licenseNumber: data.licenseNumber || null,
//     gstNumber: data.gstNumber || null,
//     logoUrl: data.logoUrl || null,
//     qrCodeUrl, // ✅ Save QR code in DB
//     isActive: 1,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   });

//   // Fetch inserted store
//   const [store] = await db
//     .select()
//     .from(stores)
//     .where(eq(stores.email, data.storeEmail))
//     .limit(1);

//   if (!store) {
//     throw new Error("Store creation failed");
//   }

//   // Hash admin password
//   const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

//   // Insert admin user linked to this store
//   await db.insert(users).values({
//     email: data.adminEmail,
//     password: hashedPassword,
//     role: 1, // Super admin = 1
//     storeId: store.id,
//     firstName: data.adminFirstName,
//     lastName: data.adminLastName,
//     phone: data.adminPhone,
//     isActive: 1,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   });

//   // Fetch inserted admin
//   const [admin] = await db
//     .select()
//     .from(users)
//     .where(eq(users.email, data.adminEmail))
//     .limit(1);

//   if (!admin) {
//     throw new Error("Admin creation failed");
//   }

//   return { store, admin };
// }
//   async updateStore(storeId: number, data: Partial<Store>): Promise<Store> {
//     await db.update(stores).set(data).where(eq(stores.id, storeId));
//     const [updatedStore] = await db.select().from(stores).where(eq(stores.id, storeId));
//     return updatedStore;
//   }

//   async activateStore(storeId: number): Promise<void> {
//     await db.update(stores).set({ isActive: true }).where(eq(stores.id, storeId));
//     await db.update(users).set({ isActive: true }).where(eq(users.storeId, storeId));
//   }

//   async deactivateStore(storeId: number): Promise<void> {
//     await db.update(stores).set({ isActive: false }).where(eq(stores.id, storeId));
//     await db.update(users).set({ isActive: false }).where(eq(users.storeId, storeId));
//   }

//   async initializeData(): Promise<void> {
//     const existingUsers = await db.select().from(users).limit(1);
//     if (existingUsers.length > 0) return;




//  async function storeOrder(order: {
//   customer_name: string;
//   medicines: unknown;
//   district?: string;
//   place?: string;
//   pincode?: string;
//   mobile_no?: string;
//   status?: string;
// }) {
//   // Validate required fields
//   if (!order.customer_name || !order.medicines) {
//     throw new Error('Customer name and medicines are required');
//   }

//   // Insert the order into the database
//   await db.insert(createorder).values({
//     customer_name: order.customer_name,
//     district: order.district || null,
//     place: order.place || null,
//     pincode: order.pincode || null,
//     mobile_no: order.mobile_no || null,
//     medicines: order.medicines, // Drizzle ORM handles JSON serialization
//     status: order.status || 'confirmed',
//     // created_at and updated_at are handled by schema defaults
//   });

//   // Retrieve the newly created order
//   const [newOrder] = await db
//     .select()
//     .from(createorder)
//     .where(
//       and(
//         eq(createorder.customer_name, order.customer_name),
//         eq(createorder.medicines, order.medicines)
//       )
//     );

//   if (!newOrder) {
//     throw new Error('Failed to retrieve newly created order');
//   }

//   return newOrder;
// }



//   }
// }

// export const storage = new DatabaseStorage();
import {
  stores,
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
  type Store,
  type InsertStore,
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
  createorder,
} from "@shared/schema";
import { db } from "./db";
import { config, getShelfLifeInterval } from "./config";
import { eq, and, desc, asc, count, sum, sql, gte, lte } from "drizzle-orm";
import bcrypt from "bcrypt";
import path from "path";
import { alias } from "drizzle-orm/mysql-core";
// const { createorder } = require('../shared/schema');
const billingAddr = alias(addresses, "billing_addr");
const shippingAddr = alias(addresses, "shipping_addr");
import QRCode from "qrcode";
import fs from "fs";
import { QrCode } from "lucide-react";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type CreateOrderType = typeof createorder.$inferInsert; // Infer from schema for type safety

export interface IStorage {
  getAllOrdersFromCreateOrder(): Promise<CreateOrderType[]>;
  storeOrder(order: {
    customer_name: string;
    medicines: unknown;
    district?: string;
    place?: string;
    pincode?: string;
    mobile_no?: string;
    status?: string;
    age?: string;
  }): Promise<CreateOrderType | undefined>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getValidCompanyUser(slug: string, email: string): Promise<boolean>;
  createUser(user: InsertUser): Promise<User>;
  getSroreIdBySlug(slug: string): Promise<Store>;
  getAllStores(): Promise<Store[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  getAddressesByUserId(userId: number): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address>;
  deleteAddress(id: number): Promise<void>;
  syncUserPhoneToAddresses(userId: number, phone: string): Promise<void>;
  getMedicines(): Promise<(Medicine & { category: MedicineCategory; totalStock: number })[]>;
  getMedicineById(id: number): Promise<Medicine | undefined>;
  searchMedicines(query: string): Promise<(Medicine & { category: MedicineCategory; totalStock: number })[]>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  updateMedicine(id: number, medicine: Partial<InsertMedicine>): Promise<Medicine>;
  deleteMedicine(id: number): Promise<void>;
  getMedicineCategories(): Promise<MedicineCategory[]>;
  createMedicineCategory(name: string, description?: string, isScheduleH?: boolean): Promise<MedicineCategory>;
  getMedicineInventory(medicineId: number): Promise<MedicineInventory[]>;
  createMedicineInventory(inventory: InsertMedicineInventory): Promise<MedicineInventory>;
  updateMedicineInventory(id: number, inventory: Partial<InsertMedicineInventory>): Promise<MedicineInventory>;
  getLowStockMedicines(): Promise<(Medicine & { totalStock: number })[]>;
  getPrescriptionsByUserId(userId: number): Promise<Prescription[]>;
  getPendingPrescriptions(): Promise<(Prescription & { user: User })[]>;
  getAllPrescriptions(): Promise<(Prescription & { user: User })[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescriptionStatus(id: number, status: string, reviewedBy: number, notes?: string): Promise<Prescription>;
  getCartItems(userId: number): Promise<(CartItem & { medicine: Medicine })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  getOrdersByUserId(userId: number): Promise<(Order & { user: User; items: (OrderItem & { medicine: Medicine })[]; shippingAddress?: Address; billingAddress?: Address })[]>;
  getAllOrders(): Promise<(Order & { user: User; items: (OrderItem & { medicine: Medicine })[]; prescription?: Prescription })[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  getOrderById(id: number): Promise<(Order & { user: User; items: (OrderItem & { medicine: Medicine })[]; billingAddress: Address; shippingAddress: Address; prescription?: Prescription }) | undefined>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  deleteNotification(id: number): Promise<void>;
  getDashboardStats(): Promise<{
    totalSales: number;
    ordersToday: number;
    lowStockCount: number;
    pendingPrescriptions: number;
  }>;
  getSalesAnalytics(timePeriod: string): Promise<any[]>;
  getCategoryAnalytics(): Promise<any[]>;
  getSuperAdminStats(): Promise<{
    totalStores: number;
    activeStores: number;
    totalAdmins: number;
    totalCustomers: number;
    totalOrders: number;
    totalSales: number;
  }>;
  getPlatformAnalytics(): Promise<{
    totalStores: number;
    activeStores: number;
    totalUsers: number;
    totalOrders: number;
    totalSales: number;
    totalMedicines: number;
    recentActivity: {
      newStores: number;
      newUsers: number;
      ordersToday: number;
      salesToday: number;
    };
  }>;
  getAllUsers(): Promise<any[]>;
  getStores(): Promise<Store[]>;
  onboardStore(data: any): Promise<{ store: Store; admin: User }>;
  updateStore(storeId: number, data: Partial<Store>): Promise<Store>;
  activateStore(storeId: number): Promise<void>;
  deactivateStore(storeId: number): Promise<void>;
  getBatchesByMedicineId(medicineId: number): Promise<Batch[]>;
  addBatch(batch: InsertBatch): Promise<Batch>;
  updateBatch(id: number, batch: Partial<InsertBatch>): Promise<Batch>;
  deleteBatch(id: number): Promise<void>;
  getExpiringBatches(days: number): Promise<(Batch & { medicine: Medicine })[]>;
  getExpiredBatches(): Promise<(Batch & { medicine: Medicine })[]>;
  markBatchAsDisposed(batchId: number, reason: string): Promise<void>;
  getBatchDisposalHistory(): Promise<any[]>;
  allocateBatchesForOrder(medicineId: number, quantity: number): Promise<{ batchId: number; quantity: number }[]>;
  initializeData(): Promise<void>;
}





export class DatabaseStorage implements IStorage {
  private calculateDiscountedPrice(mrp: number, discount: number): number {
    return Number((mrp - (mrp * discount / 100)).toFixed(2));
  }

  private async getAvailableStock(medicineId: number): Promise<number> {
    const [result] = await db
      .select({
        totalInventory: sql<number>`COALESCE(SUM(${medicineInventory.quantity}), 0)`,
        cartReserved: sql<number>`COALESCE((
          SELECT SUM(${cartItems.quantity}) 
          FROM ${cartItems} 
          WHERE ${cartItems.medicineId} = ${medicineId}
        ), 0)`,
      })
      .from(medicineInventory)
      .where(eq(medicineInventory.medicineId, medicineId));

    return Math.max(0, (result?.totalInventory || 0) - (result?.cartReserved || 0));
  }

  private prepareMedicineData(medicine: Partial<InsertMedicine>): Partial<InsertMedicine> {
    const prepared = { ...medicine };
    if (prepared.mrp !== undefined || prepared.discount !== undefined) {
      const mrp = Number(prepared.mrp || 0);
      const discount = Number(prepared.discount || 0);
      prepared.discountedPrice = this.calculateDiscountedPrice(mrp, discount).toString();
    }
    return prepared;
  }

  async getOrder(id: number): Promise<CreateOrderType | undefined> {
    const [order] = await db
      .select({
        id: createorder.id,
        customerName: createorder.customerName,
        age: createorder.age,
        district: createorder.district,
        place: createorder.place,
        pincode: createorder.pincode,
        mobile_no: createorder.mobile_no,
        medicines: createorder.medicines,
        totalPrice: createorder.totalPrice,
        status: createorder.status,
        createdAt: createorder.createdAt,
        updatedAt: createorder.updatedAt,
      })
      .from(createorder)
      .where(eq(createorder.id, id));

    return order;
  }



  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllOrdersFromCreateOrder(): Promise<CreateOrderType[]> {
    return db
      .select({
        id: createorder.id,
        customerName: createorder.customerName,
        age: createorder.age,
        district: createorder.district,
        place: createorder.place,
        pincode: createorder.pincode,
        mobile_no: createorder.mobile_no,
        medicines: createorder.medicines,
        totalPrice: createorder.totalPrice,
        status: createorder.status,
        createdAt: createorder.createdAt,
        updatedAt: createorder.updatedAt,
      })
      .from(createorder)
      .orderBy(desc(createorder.createdAt));
  }

  async storeOrder(order: {

    customer_name: string;
    medicines: unknown;
    district?: string;
    place?: string;
    pincode?: string;
    mobile_no?: string;
    status?: string;
    age?: string;
  }): Promise<CreateOrderType | undefined> {
    // Validate required fields
    if (!order.customer_name || !order.medicines) {
      throw new Error('Customer name and medicines are required');
    }

    // Insert the order into the database
    const insertResult = await db.insert(createorder).values({
      customerName: order.customer_name,
      district: order.district || null,
      place: order.place || null,
      pincode: order.pincode || null,
      mobile_no: order.mobile_no || null,
      medicines: order.medicines, // Drizzle ORM handles JSON serialization
      status: order.status || 'confirmed',
      age: order.age || null,
      // created_at and updated_at are handled by schema defaults
    });

    // Retrieve the newly created order using the insert ID (assuming MySQL returns insertId)
    const insertedId = insertResult[0]?.insertId;
    if (!insertedId) {
      throw new Error('Failed to insert order');
    }

    const [newOrder] = await db
      .select()
      .from(createorder)
      .where(eq(createorder.id, insertedId));

    if (!newOrder) {
      throw new Error('Failed to retrieve newly created order');
    }

    return newOrder;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getValidCompanyUser(slug: string, email: string): Promise<boolean> {
    // Fetch store by slug
    const [store] = await db.select().from(stores).where(eq(stores.slug, slug));
    // If store doesn't exist, it's not valid
    if (!store) return false;
    // Fetch user by email
    const [user] = await db.select().from(users).where(eq(users.email, email));

    // If user doesn't exist, it's not valid
    console.log("user", user);
    if (!user) return false;
    // Compare store_id from user with id from store
    return user.storeId === store.id;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Insert the user
    const result = await db.insert(users).values({
      ...userData,
      password: hashedPassword
    });

    // MySQL insert returns insertId
    const insertedId = result[0].insertId;

    // Fetch the inserted user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, insertedId));

    return user;
  }

  async getAllStores(): Promise<Store[]> {
    return db.select().from(stores);
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
    const updateData = { ...user };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    await db.update(users).set({ ...updateData, updatedAt: new Date() }).where(eq(users.id, id));
    const [updatedUser] = await db.select().from(users).where(eq(users.id, id));
    return updatedUser;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getSroreIdBySlug(slug: string): Promise<Store> {
    const [store] = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
    if (!store) throw new Error('Store not found');
    return store;
  }

  async getAddressesByUserId(userId: number): Promise<Address[]> {
    return db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    await db.insert(addresses).values(address);
    const [newAddress] = await db.select().from(addresses).where(and(eq(addresses.userId, address.userId), eq(addresses.addressLine1, address.addressLine1)));
    return newAddress;
  }

  async updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address> {
    await db.update(addresses).set(address).where(eq(addresses.id, id));
    const [updatedAddress] = await db.select().from(addresses).where(eq(addresses.id, id));
    return updatedAddress;
  }

  async deleteAddress(id: number): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }

  async syncUserPhoneToAddresses(userId: number, phone: string): Promise<void> {
    await db.update(addresses).set({ phone }).where(eq(addresses.userId, userId));
  }

  async getMedicines(storeId?: number): Promise<(Medicine & { category: MedicineCategory; totalStock: number })[]> {
    let query = db
      .select({
        id: medicines.id,
        storeId: medicines.storeId,
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
        totalStock: sql<number>`
          GREATEST(
            0,
            COALESCE(
              SUM(
                CASE
                  WHEN ${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL ${sql.raw(
          getShelfLifeInterval()
        )} MONTH
                  THEN ${medicineInventory.quantity}
                  ELSE 0
                END
              ),
              0
            ) - COALESCE(
              (SELECT SUM(${cartItems.quantity})
               FROM ${cartItems}
               WHERE ${cartItems.medicineId} = ${medicines.id}),
              0
            )
          )
        `,
      })
      .from(medicines)
      .leftJoin(medicineCategories, eq(medicines.categoryId, medicineCategories.id))
      .leftJoin(medicineInventory, eq(medicines.id, medicineInventory.medicineId))
      .where(eq(medicines.isActive, true))
      .groupBy(medicines.id, medicineCategories.id)
      .orderBy(asc(medicines.name));

    if (storeId) {
      query = query.where(eq(medicines.storeId, storeId));
    }

    return query as any;
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
        totalStock: sql<number>`GREATEST(
          0,
          COALESCE(
            SUM(
              CASE 
                WHEN ${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL ${sql.raw(getShelfLifeInterval())} MONTH
                THEN ${medicineInventory.quantity} 
                ELSE 0 
              END
            ),
            0
          ) - COALESCE(
            (
              SELECT SUM(${cartItems.quantity}) 
              FROM ${cartItems} 
              WHERE ${cartItems.medicineId} = ${medicines.id}
            ),
            0
          )
        )`,
      })
      .from(medicines)
      .leftJoin(medicineCategories, eq(medicines.categoryId, medicineCategories.id))
      .leftJoin(medicineInventory, eq(medicines.id, medicineInventory.medicineId))
      .where(
        and(
          eq(medicines.isActive, true),
          sql`${medicines.name} LIKE ${`%${query}%`}` // Removed LOWER() for MySQL case-insensitive search
        )
      )
      .groupBy(medicines.id, medicineCategories.id)
      .orderBy(asc(medicines.name)) as any;
  }

  async getMedicineCategories(storeId?: number): Promise<MedicineCategory[]> {
    let query = db
      .select()
      .from(medicineCategories)
      .orderBy(asc(medicineCategories.name));

    if (storeId) {
      query = query.where(eq(medicineCategories.storeId, storeId));
    }

    return query;
  }

  async createMedicineCategory(
    name: string,
    description?: string,
    isScheduleH?: boolean,
    storeId?: number
  ): Promise<MedicineCategory> {
    await db.insert(medicineCategories).values({
      name,
      description,
      isScheduleH: isScheduleH || false,
      storeId: storeId || null
    });

    const [category] = await db
      .select()
      .from(medicineCategories)
      .where(eq(medicineCategories.name, name));

    return category;
  }

  async getMedicineInventory(medicineId: number, storeId?: number): Promise<MedicineInventory[]> {
    let query = db
      .select()
      .from(medicineInventory)
      .where(eq(medicineInventory.medicineId, medicineId))
      .orderBy(asc(medicineInventory.expiryDate));

    if (storeId) {
      query = query.where(eq(medicineInventory.storeId, storeId));
    }

    return query;
  }

  async createMedicineInventory(inventory: InsertMedicineInventory, storeId?: number): Promise<MedicineInventory> {
    await db.insert(medicineInventory).values({
      ...inventory,
      storeId: storeId || null
    });

    const [newInventory] = await db
      .select()
      .from(medicineInventory)
      .where(
        and(
          eq(medicineInventory.medicineId, inventory.medicineId),
          eq(medicineInventory.batchNumber, inventory.batchNumber)
        )
      );

    return newInventory;
  }

  async updateMedicineInventory(id: number, inventory: Partial<InsertMedicineInventory>, storeId?: number): Promise<MedicineInventory> {
    let updateQuery = db
      .update(medicineInventory)
      .set({ ...inventory, updatedAt: new Date() })
      .where(eq(medicineInventory.id, id));

    if (storeId) {
      updateQuery = updateQuery.where(eq(medicineInventory.storeId, storeId));
    }

    await updateQuery;

    const [updatedInventory] = await db
      .select()
      .from(medicineInventory)
      .where(eq(medicineInventory.id, id));

    return updatedInventory;
  }

  async createMedicine(medicine: InsertMedicine, storeId?: number): Promise<Medicine> {
    const preparedMedicine = this.prepareMedicineData(medicine);

    await db.insert(medicines).values({
      ...preparedMedicine,
      storeId: storeId || null
    });

    const [newMedicine] = await db
      .select()
      .from(medicines)
      .where(
        and(
          eq(medicines.name, medicine.name),
          eq(medicines.storeId, storeId)
        )
      );

    return newMedicine;
  }

  async updateMedicine(id: number, medicine: Partial<InsertMedicine>, storeId?: number): Promise<Medicine> {
    const preparedMedicine = this.prepareMedicineData(medicine);

    let updateQuery = db
      .update(medicines)
      .set({ ...preparedMedicine, updatedAt: new Date() })
      .where(eq(medicines.id, id));

    if (storeId) {
      updateQuery = updateQuery.where(eq(medicines.storeId, storeId));
    }

    await updateQuery;

    const [updatedMedicine] = await db
      .select()
      .from(medicines)
      .where(and(eq(medicines.id, id), eq(medicines.storeId, storeId)));

    return updatedMedicine;
  }

  async deleteMedicine(id: number, storeId?: number): Promise<void> {
    let updateQuery = db
      .update(medicines)
      .set({ isActive: false })
      .where(eq(medicines.id, id));

    if (storeId) {
      updateQuery = updateQuery.where(eq(medicines.storeId, storeId));
    }

    await updateQuery;
  }

  async getLowStockMedicines(storeId?: number): Promise<(Medicine & { totalStock: number })[]> {
    let query = db
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
        totalStock: sql<number>`GREATEST(0, COALESCE(SUM(
          CASE 
            WHEN ${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL ${sql.raw(getShelfLifeInterval())} MONTH
            THEN ${medicineInventory.quantity} 
            ELSE 0 
          END
        ), 0) - COALESCE((
          SELECT SUM(${cartItems.quantity}) 
          FROM ${cartItems} 
          WHERE ${cartItems.medicineId} = ${medicines.id}
        ), 0))`,
      })
      .from(medicines)
      .leftJoin(medicineInventory, eq(medicines.id, medicineInventory.medicineId))
      .where(eq(medicines.isActive, true))
      .groupBy(medicines.id)
      .having(sql`GREATEST(0, COALESCE(SUM(
        CASE 
          WHEN ${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL ${sql.raw(getShelfLifeInterval())} MONTH
          THEN ${medicineInventory.quantity} 
          ELSE 0 
        END
      ), 0) - COALESCE((
        SELECT SUM(${cartItems.quantity}) 
        FROM ${cartItems} 
        WHERE ${cartItems.medicineId} = ${medicines.id}
      ), 0)) < 20`)
      .orderBy(sql`GREATEST(0, COALESCE(SUM(
        CASE 
          WHEN ${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL ${sql.raw(getShelfLifeInterval())} MONTH
          THEN ${medicineInventory.quantity} 
          ELSE 0 
        END
      ), 0) - COALESCE((
        SELECT SUM(${cartItems.quantity}) 
        FROM ${cartItems} 
        WHERE ${cartItems.medicineId} = ${medicines.id}
      ), 0))`);

    if (storeId) {
      query = query.where(eq(medicines.storeId, storeId));
    }

    return query as any;
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
    await db.insert(prescriptions).values(prescription);
    const [newPrescription] = await db.select().from(prescriptions).where(and(eq(prescriptions.userId, prescription.userId), eq(prescriptions.filePath, prescription.filePath)));
    return newPrescription;
  }

  async updatePrescriptionStatus(id: number, status: string, reviewedBy: number, notes?: string): Promise<Prescription> {
    await db.update(prescriptions).set({ status, reviewedBy, reviewedAt: new Date(), reviewNotes: notes }).where(eq(prescriptions.id, id));
    const [updatedPrescription] = await db.select().from(prescriptions).where(eq(prescriptions.id, id));
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
    const availableStock = await this.getAvailableStock(cartItem.medicineId);
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, cartItem.userId), eq(cartItems.medicineId, cartItem.medicineId)));

    if (existingItem) {
      const newQuantity = existingItem.quantity + cartItem.quantity;
      if (newQuantity > availableStock + existingItem.quantity) {
        throw new Error(`Insufficient stock. Only ${availableStock + existingItem.quantity} available.`);
      }
      await db.update(cartItems).set({ quantity: newQuantity }).where(eq(cartItems.id, existingItem.id));
      const [updatedItem] = await db.select().from(cartItems).where(eq(cartItems.id, existingItem.id));
      return updatedItem;
    } else {
      if (cartItem.quantity > availableStock) {
        throw new Error(`Insufficient stock. Only ${availableStock} available.`);
      }
      await db.insert(cartItems).values(cartItem);
      const [newItem] = await db.select().from(cartItems).where(and(eq(cartItems.userId, cartItem.userId), eq(cartItems.medicineId, cartItem.medicineId)));
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [cartItem] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    if (!cartItem) {
      throw new Error("Cart item not found");
    }
    const availableStock = await this.getAvailableStock(cartItem.medicineId);
    const currentCartQuantity = cartItem.quantity;
    const stockAvailableForThisItem = availableStock + currentCartQuantity;
    if (quantity > stockAvailableForThisItem) {
      throw new Error(`Insufficient stock. Only ${stockAvailableForThisItem} available.`);
    }
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
    const [updatedItem] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async getOrdersByUserId(userId: number): Promise<(Order & {
    user: User;
    items: (OrderItem & { medicine: Medicine })[];
    shippingAddress?: Address;
    billingAddress?: Address
  })[]> {
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
      .innerJoin(users, eq(orders.userId, users.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(medicines, eq(orderItems.medicineId, medicines.id))
      .leftJoin(sql`${addresses} AS shipping_addr`, sql`shipping_addr.id = ${orders.shippingAddressId}`)
      .leftJoin(sql`${addresses} AS billing_addr`, sql`billing_addr.id = ${orders.billingAddressId}`)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.placedAt));

    const orderMap = new Map();
    ordersData.forEach(({ order, user, item, medicine, shippingAddress, billingAddress }) => {
      if (!orderMap.has(order.id)) {
        orderMap.set(order.id, {
          ...order,
          user,
          items: [],
          shippingAddress: shippingAddress?.id ? shippingAddress : undefined,
          billingAddress: billingAddress?.id ? billingAddress : undefined,
        });
      }
      if (item && medicine) {
        orderMap.get(order.id).items.push({ ...item, medicine });
      }
    });

    return Array.from(orderMap.values());
  }

  async getAllOrders(storeId?: number): Promise<(Order & {
    user: User;
    items: (OrderItem & { medicine: Medicine })[];
    prescription?: Prescription
  })[]> {
    let query = db
      .select({
        order: orders,
        user: users,
        item: orderItems,
        medicine: medicines,
        prescription: prescriptions,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(medicines, eq(orderItems.medicineId, medicines.id))
      .leftJoin(prescriptions, eq(orders.prescriptionId, prescriptions.id))
      .orderBy(desc(orders.placedAt));

    if (storeId) {
      query = query.where(eq(orders.storeId, storeId));
    }

    const ordersData = await query;

    const orderMap = new Map();
    ordersData.forEach(({ order, user, item, medicine, prescription }) => {
      if (!orderMap.has(order.id)) {
        orderMap.set(order.id, {
          ...order,
          user,
          items: [],
          prescription: prescription?.id ? prescription : undefined,
        });
      }
      if (item && medicine) {
        orderMap.get(order.id).items.push({ ...item, medicine });
      }
    });

    return Array.from(orderMap.values());
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const timestamp = Date.now().toString();
    const orderNumber = `SMD${timestamp.slice(-8)}`;

    let storeId: number | null = order.storeId ?? null;

    const orderItemsWithBatches = [];

    for (const item of items) {
      const batchAllocations = await this.allocateBatchesForOrder(item.medicineId, item.quantity);

      // derive storeId from the first allocated batch if not already set
      if (!storeId && batchAllocations.length > 0) {
        const [batchInfo] = await db
          .select({ storeId: medicineInventory.storeId })
          .from(medicineInventory)
          .where(eq(medicineInventory.id, batchAllocations[0].batchId));
        storeId = batchInfo?.storeId ?? null;
      }

      for (const allocation of batchAllocations) {
        await db
          .update(medicineInventory)
          .set({ quantity: sql`${medicineInventory.quantity} - ${allocation.quantity}` })
          .where(eq(medicineInventory.id, allocation.batchId));

        const totalPrice = allocation.quantity * parseFloat(item.unitPrice.toString());

        orderItemsWithBatches.push({
          orderId: 0, // placeholder, will set after order insert
          medicineId: item.medicineId,
          quantity: allocation.quantity,
          unitPrice: item.unitPrice,
          totalPrice: totalPrice.toString(),
          batchId: allocation.batchId,
        });
      }
    }

    // Insert order with storeId
    await db.insert(orders).values({ ...order, orderNumber, storeId });
    const [newOrder] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));

    // Update orderId in items and insert
    for (const item of orderItemsWithBatches) {
      item.orderId = newOrder.id;
    }
    await db.insert(orderItems).values(orderItemsWithBatches);

    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const updateData: any = { status };
    if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }
    await db.update(orders).set(updateData).where(eq(orders.id, id));
    const [updatedOrder] = await db.select().from(orders).where(eq(orders.id, id));
    return updatedOrder;
  }

  async updateOrderStatuss(orderId, status) {
    try {
      console.log('🔄 Updating order status:', { orderId, status });
      
      // Validation
      if (!orderId || !status) {
        throw new Error('Order ID and status are required');
      }

      // Validate status
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
      }

      // Update using Drizzle ORM
      const updatedOrder = await this.db
        .update(createorder)
        .set({ 
          status: status, 
          updated_at: new Date() // MySQL uses Date objects
        })
        .where(eq(createorder.id, orderId))
        .returning();

      // Drizzle returns an array, so check length
      if (!updatedOrder || updatedOrder.length === 0) {
        console.log('❌ Order not found for ID:', orderId);
        return null;
      }

      const result = updatedOrder[0];
      console.log('✅ Order updated successfully:', result.id);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
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
        billingAddress: billingAddr,   // ✅ use alias
        shippingAddress: shippingAddr, // ✅ use alias
        prescription: prescriptions,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(medicines, eq(orderItems.medicineId, medicines.id))
      .leftJoin(billingAddr, eq(billingAddr.id, orders.billingAddressId))
      .leftJoin(shippingAddr, eq(shippingAddr.id, orders.shippingAddressId))
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
    await db.insert(notifications).values(notification);
    const [newNotification] = await db.select().from(notifications).where(and(eq(notifications.userId, notification.userId), eq(notifications.message, notification.message)));
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

    const [salesResult] = await db.select({ totalSales: sum(orders.totalAmount) }).from(orders).where(eq(orders.paymentStatus, "paid"));
    const [ordersTodayResult] = await db.select({ count: count() }).from(orders).where(sql`DATE(${orders.placedAt}) = DATE(${today})`);
    const [lowStockResult] = await db
      .select({ count: count() })
      .from(medicines)
      .leftJoin(medicineInventory, eq(medicines.id, medicineInventory.medicineId))
      .where(eq(medicines.isActive, true))
      .groupBy(medicines.id)
      .having(sql`COALESCE(SUM(${medicineInventory.quantity}), 0) < 20`);
    const [pendingPrescriptionsResult] = await db.select({ count: count() }).from(prescriptions).where(eq(prescriptions.status, "pending"));

    return {
      totalSales: Number(salesResult?.totalSales || 0),
      ordersToday: ordersTodayResult?.count || 0,
      lowStockCount: lowStockResult?.count || 0,
      pendingPrescriptions: pendingPrescriptionsResult?.count || 0,
    };
  }

  async getSalesAnalytics(timePeriod: string): Promise<any[]> {
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
            date: date.toISOString().split("T")[0],
            sales: totalSales,
            orders: dayOrders.length,
            label: date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
          });
        }
        break;
      default:
        const paidOrders = allOrders.filter(order => order.paymentStatus === "paid");
        const totalSales = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        data.push({
          date: today.toISOString().split("T")[0],
          sales: totalSales,
          orders: allOrders.length,
          label: "Total",
        });
    }
    return data;
  }

  async getCategoryAnalytics(): Promise<any[]> {
    const categoryStats = await db
      .select({
        name: medicineCategories.name,
        count: count(medicines.id),
      })
      .from(medicineCategories)
      .leftJoin(medicines, eq(medicineCategories.id, medicines.categoryId))
      .where(eq(medicines.isActive, true))
      .groupBy(medicineCategories.id, medicineCategories.name);

    const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];
    return categoryStats.map((category, index) => ({
      name: category.name,
      value: category.count,
      color: colors[index % colors.length],
    }));
  }

  async getBatchesByMedicineId(medicineId: number): Promise<Batch[]> {
    return db
      .select({
        id: medicineInventory.id,
        medicineId: medicineInventory.medicineId,
        batchNumber: medicineInventory.batchNumber,
        quantity: medicineInventory.quantity,
        expiryDate: medicineInventory.expiryDate,
        isDisposed: medicineInventory.isDisposed,
        disposalReason: medicineInventory.disposalReason,
        disposedAt: medicineInventory.disposedAt,
        createdAt: medicineInventory.createdAt,
        updatedAt: medicineInventory.updatedAt,
      })
      .from(medicineInventory)
      .where(eq(medicineInventory.medicineId, medicineId))
      .orderBy(asc(medicineInventory.expiryDate));
  }

  async addBatch(batch: InsertBatch): Promise<Batch> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(batch.expiryDate);
    if (expiryDate < today) {
      throw new Error("Cannot add batch with expiry date in the past");
    }
    await db.insert(medicineInventory).values(batch);
    const [newBatch] = await db.select().from(medicineInventory).where(and(eq(medicineInventory.medicineId, batch.medicineId), eq(medicineInventory.batchNumber, batch.batchNumber)));
    return newBatch;
  }

  async updateBatch(id: number, batch: Partial<InsertBatch>): Promise<Batch> {
    if (batch.expiryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiryDate = new Date(batch.expiryDate);
      if (expiryDate < today) {
        throw new Error("Cannot update batch with expiry date in the past");
      }
    }
    await db.update(medicineInventory).set(batch).where(eq(medicineInventory.id, id));
    const [updatedBatch] = await db.select().from(medicineInventory).where(eq(medicineInventory.id, id));
    return updatedBatch;
  }

  async deleteBatch(id: number): Promise<void> {
    await db.delete(medicineInventory).where(eq(medicineInventory.id, id));
  }

  async getExpiringBatches(days: number): Promise<(Batch & { medicine: Medicine })[]> {
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + days);
    return db
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
      .where(and(lte(medicineInventory.expiryDate, expiryThreshold), gte(medicineInventory.quantity, 1)))
      .orderBy(asc(medicineInventory.expiryDate));
  }

  async getExpiredBatches(): Promise<(Batch & { medicine: Medicine })[]> {
    const today = new Date();
    return db
      .select({
        id: medicineInventory.id,
        medicineId: medicineInventory.medicineId,
        batchNumber: medicineInventory.batchNumber,
        quantity: medicineInventory.quantity,
        expiryDate: medicineInventory.expiryDate,
        isDisposed: medicineInventory.isDisposed,
        disposalReason: medicineInventory.disposalReason,
        disposedAt: medicineInventory.disposedAt,
        disposedBy: medicineInventory.disposedBy,
        createdAt: medicineInventory.createdAt,
        updatedAt: medicineInventory.updatedAt,
        medicine: medicines,
      })
      .from(medicineInventory)
      .innerJoin(medicines, eq(medicineInventory.medicineId, medicines.id))
      .where(and(sql`${medicineInventory.expiryDate} < ${today}`, eq(medicineInventory.isDisposed, false), gte(medicineInventory.quantity, 1)))
      .orderBy(asc(medicineInventory.expiryDate));
  }

  async markBatchAsDisposed(batchId: number, reason: string): Promise<void> {
    await db
      .update(medicineInventory)
      .set({ isDisposed: true, disposalReason: reason, disposedAt: new Date(), quantity: 0 })
      .where(eq(medicineInventory.id, batchId));
  }

  async getBatchDisposalHistory(): Promise<any[]> {
    return db
      .select({
        id: medicineInventory.id,
        medicineId: medicineInventory.medicineId,
        medicineName: medicines.name,
        batchNumber: medicineInventory.batchNumber,
        expiryDate: medicineInventory.expiryDate,
        disposalReason: medicineInventory.disposalReason,
        disposedAt: medicineInventory.disposedAt,
        disposedBy: medicineInventory.disposedBy,
      })
      .from(medicineInventory)
      .innerJoin(medicines, eq(medicineInventory.medicineId, medicines.id))
      .where(eq(medicineInventory.isDisposed, true))
      .orderBy(desc(medicineInventory.disposedAt));
  }

  async allocateBatchesForOrder(medicineId: number, quantity: number): Promise<{ batchId: number; quantity: number }[]> {
    const today = new Date();
    const availableBatches = await db
      .select()
      .from(medicineInventory)
      .where(
        and(
          eq(medicineInventory.medicineId, medicineId),
          gte(medicineInventory.quantity, 1),
          sql`${medicineInventory.expiryDate} >= CURRENT_DATE + INTERVAL ${sql.raw(getShelfLifeInterval())} MONTH`
        )
      )
      .orderBy(asc(medicineInventory.expiryDate));

    const allocations: { batchId: number; quantity: number }[] = [];
    let remainingQuantity = quantity;

    for (const batch of availableBatches) {
      if (remainingQuantity <= 0) break;
      const allocateFromBatch = Math.min(batch.quantity, remainingQuantity);
      allocations.push({ batchId: batch.id, quantity: allocateFromBatch });
      remainingQuantity -= allocateFromBatch;
    }

    if (remainingQuantity > 0) {
      throw new Error(`Insufficient stock with ${config.minimumShelfLifeMonths}+ months shelf life: ${remainingQuantity} units short for medicine ID ${medicineId}. Available stock: ${quantity - remainingQuantity} units.`);
    }

    return allocations;
  }

  async getSuperAdminStats(): Promise<{
    totalStores: number;
    activeStores: number;
    totalAdmins: number;
    totalCustomers: number;
    totalOrders: number;
    totalSales: number;
  }> {
    const [storesResult] = await db
      .select({ total: count(), active: sql<number>`COUNT(CASE WHEN ${stores.isActive} = true THEN 1 END)` })
      .from(stores);
    const [adminsResult] = await db.select({ count: count() }).from(users).where(eq(users.role, 1));
    const [customersResult] = await db.select({ count: count() }).from(users).where(eq(users.role, 2));
    const [ordersResult] = await db.select({ count: count() }).from(orders);
    const [salesResult] = await db.select({ totalSales: sum(orders.totalAmount) }).from(orders).where(eq(orders.paymentStatus, "paid"));

    return {
      totalStores: storesResult?.total || 0,
      activeStores: Number(storesResult?.active || 0),
      totalAdmins: adminsResult?.count || 0,
      totalCustomers: customersResult?.count || 0,
      totalOrders: ordersResult?.count || 0,
      totalSales: Number(salesResult?.totalSales || 0),
    };
  }

  async getPlatformAnalytics(): Promise<{
    totalStores: number;
    activeStores: number;
    totalUsers: number;
    totalOrders: number;
    totalSales: number;
    totalMedicines: number;
    recentActivity: {
      newStores: number;
      newUsers: number;
      ordersToday: number;
      salesToday: number;
    };
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [
      totalStores,
      activeStores,
      totalUsers,
      totalOrders,
      totalMedicines,
      paidOrders,
      newStoresToday,
      newUsersToday,
      ordersTodayCount,
      salesToday,
    ] = await Promise.all([
      db.select({ count: count() }).from(stores),
      db.select({ count: count() }).from(stores).where(eq(stores.isActive, true)),
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(orders),
      db.select({ count: count() }).from(medicines),
      db.select({ sum: sum(orders.totalAmount) }).from(orders).where(eq(orders.paymentStatus, "paid")),
      db.select({ count: count() }).from(stores).where(gte(stores.createdAt, today)),
      db.select({ count: count() }).from(users).where(gte(users.createdAt, today)),
      db.select({ count: count() }).from(orders).where(gte(orders.createdAt, today)),
      db.select({ sum: sum(orders.totalAmount) }).from(orders).where(and(eq(orders.paymentStatus, "paid"), gte(orders.createdAt, today))),
    ]);

    return {
      totalStores: totalStores[0].count,
      activeStores: activeStores[0].count,
      totalUsers: totalUsers[0].count,
      totalOrders: totalOrders[0].count,
      totalSales: Number(paidOrders[0].sum) || 0,
      totalMedicines: totalMedicines[0].count,
      recentActivity: {
        newStores: newStoresToday[0].count,
        newUsers: newUsersToday[0].count,
        ordersToday: ordersTodayCount[0].count,
        salesToday: Number(salesToday[0].sum) || 0,
      },
    };
  }

  async getAllUsers(): Promise<any[]> {
    return db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        role: users.role,
        storeId: users.storeId,
        storeName: stores.name,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(stores, eq(users.storeId, stores.id))
      .orderBy(desc(users.createdAt));
  }

  async getStores(): Promise<Store[]> {
    return db.select().from(stores).orderBy(desc(stores.createdAt));
  }

  async updateOrderPaymentStatus(id: number, paymentStatus: string): Promise<void> {
    await db
      .update(orders)
      .set({ paymentStatus })   // Drizzle maps TS -> `payment_status` column
      .where(eq(orders.id, id))
      .execute();               // ✅ required for MySQL
  }

  async onboardStore(data: any): Promise<{ store: Store; admin: User }> {
    // Create slug from storeName
    const slug = data.storeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // ✅ Generate QR Code URL (link to store page or slug)
    const qrData = `http://localhost:5000/${slug}/customer/login`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    // Insert store
    const [storeResult] = await db.insert(stores).values({
      name: data.storeName,
      slug,
      email: data.storeEmail,
      phone: data.storePhone,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      licenseNumber: data.licenseNumber || null,
      gstNumber: data.gstNumber || null,
      logoUrl: data.logoUrl || null,
      qrCodeUrl, // ✅ Save QR code in DB
      isActive: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Fetch inserted store
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.email, data.storeEmail))
      .limit(1);

    if (!store) {
      throw new Error("Store creation failed");
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

    // Insert admin user linked to this store
    await db.insert(users).values({
      email: data.adminEmail,
      password: hashedPassword,
      role: 1, // Super admin = 1
      storeId: store.id,
      firstName: data.adminFirstName,
      lastName: data.adminLastName,
      phone: data.adminPhone,
      isActive: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Fetch inserted admin
    const [admin] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.adminEmail))
      .limit(1);

    if (!admin) {
      throw new Error("Admin creation failed");
    }

    return { store, admin };
  }

  async updateStore(storeId: number, data: Partial<Store>): Promise<Store> {
    await db.update(stores).set(data).where(eq(stores.id, storeId));
    const [updatedStore] = await db.select().from(stores).where(eq(stores.id, storeId));
    return updatedStore;
  }

  async activateStore(storeId: number): Promise<void> {
    await db.update(stores).set({ isActive: true }).where(eq(stores.id, storeId));
    await db.update(users).set({ isActive: true }).where(eq(users.storeId, storeId));
  }

  async deactivateStore(storeId: number): Promise<void> {
    await db.update(stores).set({ isActive: false }).where(eq(stores.id, storeId));
    await db.update(users).set({ isActive: false }).where(eq(users.storeId, storeId));
  }

  async initializeData(): Promise<void> {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) return;
  }
}

export const storage = new DatabaseStorage();