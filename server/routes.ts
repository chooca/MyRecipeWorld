import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertRecipeSchema, insertCookingHistorySchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Setup multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded images
  app.use('/uploads', express.static(uploadDir));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Recipe routes
  app.get('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recipes = await storage.getRecipesByUser(userId);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.get('/api/recipes/public', async (req, res) => {
    try {
      const recipes = await storage.getPublicRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching public recipes:", error);
      res.status(500).json({ message: "Failed to fetch public recipes" });
    }
  });

  app.get('/api/recipes/search', async (req: any, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const userId = req.user?.claims?.sub;
      const recipes = await storage.searchRecipes(q, userId);
      res.json(recipes);
    } catch (error) {
      console.error("Error searching recipes:", error);
      res.status(500).json({ message: "Failed to search recipes" });
    }
  });

  app.get('/api/recipes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }

      const recipe = await storage.getRecipe(id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  app.post('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertRecipeSchema.parse(req.body);
      
      const recipe = await storage.createRecipe(userId, validatedData);
      res.status(201).json(recipe);
    } catch (error: any) {
      console.error("Error creating recipe:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  app.put('/api/recipes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }

      const validatedData = insertRecipeSchema.partial().parse(req.body);
      const recipe = await storage.updateRecipe(id, userId, validatedData);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found or not authorized" });
      }

      res.json(recipe);
    } catch (error: any) {
      console.error("Error updating recipe:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  app.delete('/api/recipes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }

      const success = await storage.deleteRecipe(id, userId);
      if (!success) {
        return res.status(404).json({ message: "Recipe not found or not authorized" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  // Image upload route
  app.post('/api/upload', isAuthenticated, upload.single('image'), (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Favorites routes
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites/:recipeId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recipeId = parseInt(req.params.recipeId);
      
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }

      const favorite = await storage.addFavorite(userId, recipeId);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites/:recipeId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recipeId = parseInt(req.params.recipeId);
      
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }

      const success = await storage.removeFavorite(userId, recipeId);
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Cooking history routes
  app.get('/api/cooking-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getCookingHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching cooking history:", error);
      res.status(500).json({ message: "Failed to fetch cooking history" });
    }
  });

  app.post('/api/cooking-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCookingHistorySchema.parse(req.body);
      
      const history = await storage.addCookingHistory(userId, validatedData);
      res.status(201).json(history);
    } catch (error: any) {
      console.error("Error adding cooking history:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid history data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add cooking history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
