import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const planEnum = pgEnum("plan", ["free", "indie", "pro"]);
export const testimonialSourceEnum = pgEnum("testimonial_source", [
  "widget",
  "email",
  "manual",
]);
export const testimonialStatusEnum = pgEnum("testimonial_status", [
  "pending",
  "approved",
  "rejected",
]);
export const widgetTypeEnum = pgEnum("widget_type", ["wall", "slider", "card"]);

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workspaces
export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  apiKey: uuid("api_key").notNull().defaultRandom(),
  plan: planEnum("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Testimonials
export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  role: text("role"),
  rating: integer("rating").notNull().default(5),
  text: text("text").notNull(),
  videoUrl: text("video_url"),
  avatarUrl: text("avatar_url"),
  source: testimonialSourceEnum("source").notNull().default("widget"),
  status: testimonialStatusEnum("status").notNull().default("pending"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Widgets
export const widgets = pgTable("widgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: widgetTypeEnum("type").notNull().default("wall"),
  config: jsonb("config").$type<{
    theme?: string;
    accentColor?: string;
    maxCount?: number;
    showRating?: boolean;
    showCompany?: boolean;
  }>().default({}),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  stripeSubscriptionId: text("stripe_subscription_id").notNull(),
  stripePriceId: text("stripe_price_id").notNull(),
  status: text("status").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Testimonial Tokens (for email collection)
export const testimonialTokens = pgTable("testimonial_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  token: uuid("token").notNull().defaultRandom().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  user: one(users, {
    fields: [workspaces.userId],
    references: [users.id],
  }),
  testimonials: many(testimonials),
  widgets: many(widgets),
  subscriptions: many(subscriptions),
  testimonialTokens: many(testimonialTokens),
}));

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [testimonials.workspaceId],
    references: [workspaces.id],
  }),
}));

export const widgetsRelations = relations(widgets, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [widgets.workspaceId],
    references: [workspaces.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [subscriptions.workspaceId],
    references: [workspaces.id],
  }),
}));

export const testimonialTokensRelations = relations(
  testimonialTokens,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [testimonialTokens.workspaceId],
      references: [workspaces.id],
    }),
  })
);
