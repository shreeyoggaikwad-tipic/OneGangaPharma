// import {
//   mysqlTable,
//   text,
//   int,
//   boolean,
//   timestamp,
//   decimal,
//   varchar,
//   char,
//   json,
//   date,
//   index,
//   primaryKey
// } from "drizzle-orm/mysql-core";
// import { relations } from "drizzle-orm";
// import { createInsertSchema, createSelectSchema } from "drizzle-zod";
// import { z } from "zod";

// // Session storage table for authentication
// export const sessions = mysqlTable(
//   "sessions",
//   {
//     sid: varchar("sid", { length: 128 }).primaryKey(),
//     sess: json("sess").notNull(),
//     expire: timestamp("expire").notNull(),
//   },
//   (table) => [index("IDX_session_expire").on(table.expire)],
// );

// // Medical stores table for multi-tenant support
// export const stores = mysqlTable("stores", {
//   id: int("id").autoincrement().primaryKey(),
//   name: varchar("name", { length: 255 }).notNull(),
//   email: varchar("email", { length: 255 }).notNull().unique(),
//   phone: varchar("phone", { length: 20 }),
//   address: text("address"),
//   city: varchar("city", { length: 100 }),
//   state: varchar("state", { length: 100 }),
//   pincode: varchar("pincode", { length: 10 }),
//   licenseNumber: varchar("license_number", { length: 100 }),
//   gstNumber: varchar("gst_number", { length: 50 }),
//   logoUrl: varchar("logo_url", { length: 500 }),
//   isActive: boolean("is_active").default(true),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
//   slug: varchar("slug", { length: 255 }).notNull(), // ✅ Make sure this is here
// });

// // Users table with role-based access
// export const users = mysqlTable("users", {
//   id: int("id").autoincrement().primaryKey(),
//   email: varchar("email", { length: 255 }).notNull().unique(),
//   password: varchar("password", { length: 255 }).notNull(),
//   role: int("role").notNull().default(2), // 0: super_admin, 1: admin, 2: customer
//   storeId: int("store_id").references(() => stores.id),
//   firstName: varchar("first_name", { length: 100 }),
//   lastName: varchar("last_name", { length: 100 }),
//   phone: varchar("phone", { length: 20 }),
//   gender: varchar("gender", { length: 10 }),
//   dateOfBirth: date("date_of_birth"),
//   profileImageUrl: varchar("profile_image_url", { length: 500 }),
//   isActive: boolean("is_active").default(true),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
// });

// // Address book for shipping and billing
// export const addresses = mysqlTable("addresses", {
//   id: int("id").autoincrement().primaryKey(),
//   userId: int("user_id").notNull(),
//   type: varchar("type", { length: 20 }).notNull(), // billing, shipping
//   fullName: varchar("full_name", { length: 255 }).notNull(),
//   phone: varchar("phone", { length: 20 }).notNull(),
//   addressLine1: varchar("address_line_1", { length: 255 }).notNull(),
//   addressLine2: varchar("address_line_2", { length: 255 }),
//   city: varchar("city", { length: 100 }).notNull(),
//   state: varchar("state", { length: 100 }).notNull(),
//   postalCode: varchar("postal_code", { length: 20 }).notNull(),
//   isDefault: boolean("is_default").default(false),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// // Medicine categories
// export const medicineCategories = mysqlTable("medicine_categories", {
//   id: int("id").autoincrement().primaryKey(),
//   name: varchar("name", { length: 100 }).notNull().unique(),
//   description: text("description"),
//   isScheduleH: boolean("is_schedule_h").default(false),
// });

// // Medicines master table
// export const medicines = mysqlTable("medicines", {
//   id: int("id").autoincrement().primaryKey(),
//   storeId: int("store_id").references(() => stores.id).notNull(),
//   name: varchar("name", { length: 255 }).notNull(),
//   description: text("description"),
//   dosage: varchar("dosage", { length: 100 }),
//   mrp: decimal("mrp", { precision: 10, scale: 2 }).notNull(),
//   discount: decimal("discount", { precision: 5, scale: 2 }).notNull().default("0.00"), // percentage discount
//   discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }).notNull(),
//   categoryId: int("category_id").notNull(),
//   manufacturer: varchar("manufacturer", { length: 255 }),
//   requiresPrescription: boolean("requires_prescription").default(false),
//   frontImageUrl: varchar("front_image_url", { length: 500 }),
//   backImageUrl: varchar("back_image_url", { length: 500 }),
//   isActive: boolean("is_active").default(true),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
// });

// // Medicine inventory with batch tracking
// export const medicineInventory = mysqlTable("medicine_inventory", {
//   id: int("id").autoincrement().primaryKey(),
//   medicineId: int("medicine_id").notNull(),
//   batchNumber: varchar("batch_number", { length: 100 }).notNull(),
//   expiryDate: date("expiry_date").notNull(),
//   quantity: int("quantity").notNull().default(0),
//   isDisposed: boolean("is_disposed").default(false).notNull(),
//   disposalReason: text("disposal_reason"),
//   disposedAt: timestamp("disposed_at"),
//   disposedBy: int("disposed_by"),
//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
// });

// // Prescription uploads
// export const prescriptions = mysqlTable("prescriptions", {
//   id: int("id").autoincrement().primaryKey(),
//   userId: int("user_id").notNull(),
//   fileName: varchar("file_name", { length: 255 }).notNull(),
//   filePath: varchar("file_path", { length: 500 }).notNull(),
//   status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected
//   reviewedBy: int("reviewed_by"),
//   reviewedAt: timestamp("reviewed_at"),
//   reviewNotes: text("review_notes"),
//   uploadedAt: timestamp("uploaded_at").defaultNow(),
// });

// // Shopping cart
// export const cartItems = mysqlTable("cart_items", {
//   id: int("id").autoincrement().primaryKey(),
//   userId: int("user_id").notNull(),
//   medicineId: int("medicine_id").notNull(),
//   quantity: int("quantity").notNull(),
//   addedAt: timestamp("added_at").defaultNow(),
// });

// // Orders
// export const orders = mysqlTable("orders", {
//   id: int("id").autoincrement().primaryKey(),
//   userId: int("user_id").notNull(),
//   orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
//   status: varchar("status", { length: 50 }).notNull().default("placed"), // placed, confirmed, pending_prescription_review, out_for_delivery, delivered, cancelled
//   totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
//   paymentMethod: varchar("payment_method", { length: 20 }).notNull().default("cod"),
//   paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("pending"), // pending, paid, failed
//   prescriptionId: int("prescription_id"),
//   billingAddressId: int("billing_address_id").notNull(),
//   shippingAddressId: int("shipping_address_id").notNull(),
//   deliveryNotes: text("delivery_notes"),
//   placedAt: timestamp("placed_at").defaultNow(),
//   createdAt: timestamp("created_at").defaultNow(),
//   deliveredAt: timestamp("delivered_at"),
// });

// // Order items with batch tracking
// export const orderItems = mysqlTable("order_items", {
//   id: int("id").autoincrement().primaryKey(),
//   orderId: int("order_id").notNull(),
//   medicineId: int("medicine_id").notNull(),
//   batchId: int("batch_id"), // Reference to medicine_inventory batch
//   quantity: int("quantity").notNull(),
//   unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
//   totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
// });

// // Notifications
// export const notifications = mysqlTable("notifications", {
//   id: int("id").autoincrement().primaryKey(),
//   userId: int("user_id").notNull(),
//   type: varchar("type", { length: 50 }).notNull(), // order_update, prescription_status, low_stock, etc.
//   title: varchar("title", { length: 255 }).notNull(),
//   message: text("message").notNull(),
//   isRead: boolean("is_read").default(false),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// // Relations (remain the same)
// export const usersRelations = relations(users, ({ many }) => ({
//   addresses: many(addresses),
//   prescriptions: many(prescriptions),
//   cartItems: many(cartItems),
//   orders: many(orders),
//   notifications: many(notifications),
// }));

// export const addressesRelations = relations(addresses, ({ one }) => ({
//   user: one(users, { fields: [addresses.userId], references: [users.id] }),
// }));

// export const medicinesRelations = relations(medicines, ({ one, many }) => ({
//   category: one(medicineCategories, { fields: [medicines.categoryId], references: [medicineCategories.id] }),
//   inventory: many(medicineInventory),
//   cartItems: many(cartItems),
//   orderItems: many(orderItems),
// }));

// export const medicineInventoryRelations = relations(medicineInventory, ({ one }) => ({
//   medicine: one(medicines, { fields: [medicineInventory.medicineId], references: [medicines.id] }),
// }));

// export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
//   user: one(users, { fields: [prescriptions.userId], references: [users.id] }),
//   reviewer: one(users, { fields: [prescriptions.reviewedBy], references: [users.id] }),
//   orders: many(orders),
// }));

// export const cartItemsRelations = relations(cartItems, ({ one }) => ({
//   user: one(users, { fields: [cartItems.userId], references: [users.id] }),
//   medicine: one(medicines, { fields: [cartItems.medicineId], references: [medicines.id] }),
// }));

// export const ordersRelations = relations(orders, ({ one, many }) => ({
//   user: one(users, { fields: [orders.userId], references: [users.id] }),
//   prescription: one(prescriptions, { fields: [orders.prescriptionId], references: [prescriptions.id] }),
//   billingAddress: one(addresses, { fields: [orders.billingAddressId], references: [addresses.id] }),
//   shippingAddress: one(addresses, { fields: [orders.shippingAddressId], references: [addresses.id] }),
//   items: many(orderItems),
// }));

// export const orderItemsRelations = relations(orderItems, ({ one }) => ({
//   order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
//   medicine: one(medicines, { fields: [orderItems.medicineId], references: [medicines.id] }),
//   batch: one(medicineInventory, { fields: [orderItems.batchId], references: [medicineInventory.id] }),
// }));

// export const notificationsRelations = relations(notifications, ({ one }) => ({
//   user: one(users, { fields: [notifications.userId], references: [users.id] }),
// }));

// // Zod schemas for validation (remain the same)
// export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
// export const insertAddressSchema = createInsertSchema(addresses).omit({ id: true, createdAt: true });
// export const insertMedicineSchema = createInsertSchema(medicines).omit({ id: true, createdAt: true, updatedAt: true, storeId: true }).extend({
//   discountedPrice: z.string().optional(), // Make discountedPrice optional since it's auto-calculated
//   storeId: z.number().optional(), // Make storeId optional since it's added server-side
// });
// export const insertMedicineInventorySchema = createInsertSchema(medicineInventory, {
//   expiryDate: z.string().min(1, "Expiry date is required")
//     .transform((val) => new Date(val)) // converts to Date
// }).omit({ id: true, createdAt: true, updatedAt: true });
// export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({ id: true, uploadedAt: true });
// export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, addedAt: true });
// export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, orderNumber: true, placedAt: true });
// export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
// export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

// // Type exports (remain the same)
// export type User = typeof users.$inferSelect;
// export type InsertUser = z.infer<typeof insertUserSchema>;
// export type Address = typeof addresses.$inferSelect;
// export type InsertAddress = z.infer<typeof insertAddressSchema>;
// export type Medicine = typeof medicines.$inferSelect;
// export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
// export type MedicineInventory = typeof medicineInventory.$inferSelect;
// export type InsertMedicineInventory = z.infer<typeof insertMedicineInventorySchema>;
// export type Prescription = typeof prescriptions.$inferSelect;
// export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
// export type CartItem = typeof cartItems.$inferSelect;
// export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
// export type Order = typeof orders.$inferSelect;
// export type InsertOrder = z.infer<typeof insertOrderSchema>;
// export type OrderItem = typeof orderItems.$inferSelect;
// export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
// export type Notification = typeof notifications.$inferSelect;
// export type InsertNotification = z.infer<typeof insertNotificationSchema>;
// export type MedicineCategory = typeof medicineCategories.$inferSelect;

// // Batch management types
// export type Batch = typeof medicineInventory.$inferSelect;
// export type InsertBatch = z.infer<typeof insertMedicineInventorySchema>;
import {
  mysqlTable,
  text,
  int,
  boolean,
  timestamp,
  decimal,
  varchar,
  char,
  json,
  date,
  index,
  primaryKey
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
// export const sessions = mysqlTable(
//   "sessions",
//   {
//     sid: varchar("sid", { length: 128 }).primaryKey(),
//     sess: json("sess").notNull(),
//     expire: timestamp("expire").notNull(),
//   },
//   (table) => [index("IDX_session_expire").on(table.expire)],
// );
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 128 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: int("expire").notNull(),  // <-- FIXED
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);
// Medical stores table for multi-tenant support
export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 10 }),
  licenseNumber: varchar("license_number", { length: 100 }),
  gstNumber: varchar("gst_number", { length: 50 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  slug: varchar("slug", { length: 255 }).notNull(),
  qrCodeUrl: text("qr_code_url")
});

// Users table with role-based access
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: int("role").notNull().default(2), // 0: super_admin, 1: admin, 2: customer
  storeId: int("store_id").references(() => stores.id),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  gender: varchar("gender", { length: 10 }),
  dateOfBirth: date("date_of_birth"),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Address book for shipping and billing
export const addresses = mysqlTable("addresses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // billing, shipping
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  addressLine1: varchar("address_line_1", { length: 255 }).notNull(),
  addressLine2: varchar("address_line_2", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medicine categories
export const medicineCategories = mysqlTable("medicine_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isScheduleH: boolean("is_schedule_h").default(false),
    storeId: int("store_id").references(() => stores.id),
});

// Medicines master table
export const medicines = mysqlTable("medicines", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("store_id").references(() => stores.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  dosage: varchar("dosage", { length: 100 }),
  mrp: decimal("mrp", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 5, scale: 2 }).notNull().default("0.00"), // percentage discount
  discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }).notNull(),
  categoryId: int("category_id").notNull(),
  manufacturer: varchar("manufacturer", { length: 255 }),
  requiresPrescription: boolean("requires_prescription").default(false),
  frontImageUrl: varchar("front_image_url", { length: 500 }),
  backImageUrl: varchar("back_image_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  
});

// Medicine inventory with batch tracking
export const medicineInventory = mysqlTable("medicine_inventory", {
  id: int("id").autoincrement().primaryKey(),
  medicineId: int("medicine_id").notNull(),
  batchNumber: varchar("batch_number", { length: 100 }).notNull(),
  expiryDate: date("expiry_date").notNull(),
  quantity: int("quantity").notNull().default(0),
  isDisposed: boolean("is_disposed").default(false).notNull(),
  disposalReason: text("disposal_reason"),
  disposedAt: timestamp("disposed_at"),
  disposedBy: int("disposed_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
    storeId: int("store_id").references(() => stores.id),
});

// Prescription uploads
export const prescriptions = mysqlTable("prescriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected
  reviewedBy: int("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Shopping cart
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  medicineId: int("medicine_id").notNull(),
  quantity: int("quantity").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});


//working
export const createorder = mysqlTable("createorder", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  age: int("age"),
  district: varchar("district", { length: 255 }),
  place: varchar("place", { length: 255 }),
  pincode: varchar("pincode", { length: 20 }),
  mobileNo: varchar("mobile_no", { length: 20 }),
  medicines: json("medicines").notNull(), // store array of medicines as JSON
  status: varchar("status", { length: 50 }).default("confirmed"), // pending, confirmed, delivered
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Orders
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("placed"), // placed, confirmed, pending_prescription_review, out_for_delivery, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull().default("cod"),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("pending"), // pending, paid, failed
  prescriptionId: int("prescription_id"),
  billingAddressId: int("billing_address_id").notNull(),
  shippingAddressId: int("shipping_address_id").notNull(),
  deliveryNotes: text("delivery_notes"),
  placedAt: timestamp("placed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  deliveredAt: timestamp("delivered_at"),
    storeId: int("store_id").references(() => stores.id),
});

// Order items with batch tracking
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("order_id").notNull(),
  medicineId: int("medicine_id").notNull(),
  batchId: int("batch_id"), // Reference to medicine_inventory batch
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
    storeId: int("store_id").references(() => stores.id),
});

// Notifications
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // order_update, prescription_status, low_stock, etc.
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations (remain the same)
export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  prescriptions: many(prescriptions),
  cartItems: many(cartItems),
  orders: many(orders),
  notifications: many(notifications),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const medicinesRelations = relations(medicines, ({ one, many }) => ({
  category: one(medicineCategories, { fields: [medicines.categoryId], references: [medicineCategories.id] }),
  inventory: many(medicineInventory),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const medicineInventoryRelations = relations(medicineInventory, ({ one }) => ({
  medicine: one(medicines, { fields: [medicineInventory.medicineId], references: [medicines.id] }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  user: one(users, { fields: [prescriptions.userId], references: [users.id] }),
  reviewer: one(users, { fields: [prescriptions.reviewedBy], references: [users.id] }),
  orders: many(orders),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, { fields: [cartItems.userId], references: [users.id] }),
  medicine: one(medicines, { fields: [cartItems.medicineId], references: [medicines.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  prescription: one(prescriptions, { fields: [orders.prescriptionId], references: [prescriptions.id] }),
  billingAddress: one(addresses, { fields: [orders.billingAddressId], references: [addresses.id] }),
  shippingAddress: one(addresses, { fields: [orders.shippingAddressId], references: [addresses.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  medicine: one(medicines, { fields: [orderItems.medicineId], references: [medicines.id] }),
  batch: one(medicineInventory, { fields: [orderItems.batchId], references: [medicineInventory.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// Zod schemas for validation (remain the same)
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAddressSchema = createInsertSchema(addresses).omit({ id: true, createdAt: true });
export const insertMedicineSchema = createInsertSchema(medicines).omit({ id: true, createdAt: true, updatedAt: true, storeId: true }).extend({
  discountedPrice: z.string().optional(), // Make discountedPrice optional since it's auto-calculated
  storeId: z.number().optional(), // Make storeId optional since it's added server-side
});
export const insertMedicineInventorySchema = createInsertSchema(medicineInventory, {
  expiryDate: z.string().min(1, "Expiry date is required")
    .transform((val) => new Date(val)) // converts to Date
}).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({ id: true, uploadedAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, addedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, orderNumber: true, placedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

// Type exports (remain the same)
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Medicine = typeof medicines.$inferSelect;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type MedicineInventory = typeof medicineInventory.$inferSelect;
export type InsertMedicineInventory = z.infer<typeof insertMedicineInventorySchema>;
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type MedicineCategory = typeof medicineCategories.$inferSelect;

// Batch management types
export type Batch = typeof medicineInventory.$inferSelect;
export type InsertBatch = z.infer<typeof insertMedicineInventorySchema>;
