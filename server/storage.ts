import {
  users,
  recipes,
  cookingHistory,
  favorites,
  type User,
  type UpsertUser,
  type Recipe,
  type InsertRecipe,
  type CookingHistory,
  type InsertCookingHistory,
  type Favorite,
  type InsertFavorite,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Recipe operations
  getRecipe(id: number): Promise<Recipe | undefined>;
  getRecipesByUser(userId: string): Promise<Recipe[]>;
  getPublicRecipes(): Promise<Recipe[]>;
  searchRecipes(query: string, userId?: string): Promise<Recipe[]>;
  createRecipe(userId: string, recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: number, userId: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: number, userId: string): Promise<boolean>;
  
  // Cooking history operations
  getCookingHistory(userId: string): Promise<CookingHistory[]>;
  addCookingHistory(userId: string, history: InsertCookingHistory): Promise<CookingHistory>;
  
  // Favorites operations
  getFavorites(userId: string): Promise<Recipe[]>;
  addFavorite(userId: string, recipeId: number): Promise<Favorite>;
  removeFavorite(userId: string, recipeId: number): Promise<boolean>;
  isFavorite(userId: string, recipeId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Recipe operations
  async getRecipe(id: number): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe;
  }

  async getRecipesByUser(userId: string): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, userId))
      .orderBy(desc(recipes.updatedAt));
  }

  async getPublicRecipes(): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .where(eq(recipes.isPublic, true))
      .orderBy(desc(recipes.createdAt));
  }

  async searchRecipes(query: string, userId?: string): Promise<Recipe[]> {
    const searchCondition = or(
      like(recipes.title, `%${query}%`),
      like(recipes.description, `%${query}%`),
      like(recipes.category, `%${query}%`)
    );

    const conditions = userId 
      ? and(
          searchCondition,
          or(
            eq(recipes.userId, userId),
            eq(recipes.isPublic, true)
          )
        )
      : and(searchCondition, eq(recipes.isPublic, true));

    return await db
      .select()
      .from(recipes)
      .where(conditions)
      .orderBy(desc(recipes.updatedAt));
  }

  async createRecipe(userId: string, recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db
      .insert(recipes)
      .values({ 
        ...recipe, 
        userId,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        tags: recipe.tags || []
      })
      .returning();
    return newRecipe;
  }

  async updateRecipe(id: number, userId: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const updateData: any = { ...recipe, updatedAt: new Date() };
    
    // Ensure arrays are proper arrays, not array-like objects
    if (updateData.ingredients) {
      updateData.ingredients = Array.isArray(updateData.ingredients) 
        ? updateData.ingredients 
        : Array.from(updateData.ingredients);
    }
    if (updateData.instructions) {
      updateData.instructions = Array.isArray(updateData.instructions) 
        ? updateData.instructions 
        : Array.from(updateData.instructions);
    }
    if (updateData.tags) {
      updateData.tags = Array.isArray(updateData.tags) 
        ? updateData.tags 
        : Array.from(updateData.tags);
    }
    
    const [updatedRecipe] = await db
      .update(recipes)
      .set(updateData)
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)))
      .returning();
    return updatedRecipe;
  }

  async deleteRecipe(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Cooking history operations
  async getCookingHistory(userId: string): Promise<CookingHistory[]> {
    return await db
      .select()
      .from(cookingHistory)
      .where(eq(cookingHistory.userId, userId))
      .orderBy(desc(cookingHistory.cookedAt));
  }

  async addCookingHistory(userId: string, history: InsertCookingHistory): Promise<CookingHistory> {
    const [newHistory] = await db
      .insert(cookingHistory)
      .values({ ...history, userId })
      .returning();
    return newHistory;
  }

  // Favorites operations
  async getFavorites(userId: string): Promise<Recipe[]> {
    return await db
      .select({
        id: recipes.id,
        userId: recipes.userId,
        title: recipes.title,
        description: recipes.description,
        imageUrl: recipes.imageUrl,
        prepTime: recipes.prepTime,
        cookTime: recipes.cookTime,
        servings: recipes.servings,
        difficulty: recipes.difficulty,
        category: recipes.category,
        ingredients: recipes.ingredients,
        instructions: recipes.instructions,
        tags: recipes.tags,
        isPublic: recipes.isPublic,
        createdAt: recipes.createdAt,
        updatedAt: recipes.updatedAt,
      })
      .from(favorites)
      .innerJoin(recipes, eq(favorites.recipeId, recipes.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  async addFavorite(userId: string, recipeId: number): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({ userId, recipeId })
      .returning();
    return favorite;
  }

  async removeFavorite(userId: string, recipeId: number): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.recipeId, recipeId)));
    return (result.rowCount || 0) > 0;
  }

  async isFavorite(userId: string, recipeId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.recipeId, recipeId)));
    return !!favorite;
  }
}

export const storage = new DatabaseStorage();
