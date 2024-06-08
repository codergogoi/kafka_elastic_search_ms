import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  timestamp,
  varchar,
  numeric,
  integer,
} from "drizzle-orm/pg-core";

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(), // for db record
  customerId: integer("customer_id").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Cart = InferSelectModel<typeof carts>;
export type NewCart = InferInsertModel<typeof carts>;

export const cartLineItems = pgTable("cart_line_items", {
  id: serial("id").primaryKey(), // for db record
  productId: integer("product_id").notNull(),
  cartId: integer("cart_id")
    .references(() => carts.id, { onDelete: "cascade" })
    .notNull(),
  itemName: varchar("item_name").notNull(), // human readable
  variant: varchar("variant"), // Small // medium // big
  qty: integer("qty").notNull(),
  price: numeric("amount").notNull(), // amount in cents
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CartLineItem = InferSelectModel<typeof cartLineItems>;

export const cartRelations = relations(carts, ({ many }) => ({
  lineItems: many(cartLineItems),
}));

export const lineItemsRelations = relations(cartLineItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartLineItems.cartId],
    references: [carts.id],
  }),
}));
