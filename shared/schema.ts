import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  prepTime: integer("prep_time"), // in minutes
  cookTime: integer("cook_time"), // in minutes
  servings: integer("servings"),
  difficulty: varchar("difficulty", { enum: ["Easy", "Medium", "Hard"] }),
  category: text("category"),
  ingredients: jsonb("ingredients").$type<string[]>().notNull(),
  instructions: jsonb("instructions").$type<string[]>().notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cookingHistory = pgTable("cooking_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id),
  cookedAt: timestamp("cooked_at").defaultNow(),
  notes: text("notes"),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
  cookingHistory: many(cookingHistory),
  favorites: many(favorites),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  user: one(users, {
    fields: [recipes.userId],
    references: [users.id],
  }),
  cookingHistory: many(cookingHistory),
  favorites: many(favorites),
}));

export const cookingHistoryRelations = relations(cookingHistory, ({ one }) => ({
  user: one(users, {
    fields: [cookingHistory.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [cookingHistory.recipeId],
    references: [recipes.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [favorites.recipeId],
    references: [recipes.id],
  }),
}));

// Insert schemas
export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCookingHistorySchema = createInsertSchema(cookingHistory).omit({
  id: true,
  userId: true,
  cookedAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  userId: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type CookingHistory = typeof cookingHistory.$inferSelect;
export type InsertCookingHistory = z.infer<typeof insertCookingHistorySchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
