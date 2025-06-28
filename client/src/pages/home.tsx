import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import RecipeCard from "@/components/recipe-card";
import RecipeForm from "@/components/recipe-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Clock, Users, BookOpen, Heart } from "lucide-react";
import type { Recipe } from "@shared/schema";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: recipes = [], isLoading: recipesLoading } = useQuery({
    queryKey: ["/api/recipes"],
    enabled: isAuthenticated,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  const { data: cookingHistory = [] } = useQuery({
    queryKey: ["/api/cooking-history"],
    enabled: isAuthenticated,
  });

  const { data: searchResults = [], refetch: searchRecipes } = useQuery({
    queryKey: ["/api/recipes/search", searchQuery],
    enabled: false,
  });

  const createRecipeMutation = useMutation({
    mutationFn: async (recipeData: any) => {
      await apiRequest("POST", "/api/recipes", recipeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Recipe created successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchRecipes();
    }
  };

  const stats = {
    totalRecipes: recipes.length,
    cookedCount: cookingHistory.length,
    sharedRecipes: recipes.filter((r: Recipe) => r.isPublic).length,
    favorites: favorites.length,
  };

  const recentRecipes = recipes.slice(0, 8);
  const displayRecipes = searchQuery.trim() ? searchResults : recentRecipes;

  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-recipe-orange to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Welcome back, {user?.firstName || 'Chef'}!
              </h2>
              <p className="text-xl mb-8 text-orange-100 leading-relaxed">
                Your personal recipe collection awaits. What are you cooking today?
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-white text-recipe-orange hover:bg-gray-100 px-8 py-3 rounded-full font-semibold"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Recipe
                </Button>
                <div className="relative">
                  <Input
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-64 pl-10 pr-4 py-3 border-2 border-white rounded-full bg-white/10 text-white placeholder:text-white/70 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <Card className="p-6 bg-orange-50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-recipe-orange mb-2">{stats.totalRecipes}</div>
                <div className="text-gray-600 font-medium flex items-center justify-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Recipes
                </div>
              </CardContent>
            </Card>
            <Card className="p-6 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-recipe-green mb-2">{stats.cookedCount}</div>
                <div className="text-gray-600 font-medium flex items-center justify-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Times Cooked
                </div>
              </CardContent>
            </Card>
            <Card className="p-6 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.sharedRecipes}</div>
                <div className="text-gray-600 font-medium flex items-center justify-center">
                  <Users className="mr-2 h-4 w-4" />
                  Shared Recipes
                </div>
              </CardContent>
            </Card>
            <Card className="p-6 bg-purple-50">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.favorites}</div>
                <div className="text-gray-600 font-medium flex items-center justify-center">
                  <Heart className="mr-2 h-4 w-4" />
                  Favorites
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recipes Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h3 className="text-3xl font-bold recipe-slate mb-2">
                {searchQuery.trim() ? 'Search Results' : 'Recent Recipes'}
              </h3>
              <p className="text-gray-600">
                {searchQuery.trim() ? `Results for "${searchQuery}"` : 'Your latest culinary creations'}
              </p>
            </div>
            {!searchQuery.trim() && (
              <Button
                variant="ghost"
                className="text-recipe-orange hover:text-recipe-orange/80"
              >
                View All
              </Button>
            )}
          </div>

          {recipesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="h-80 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayRecipes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayRecipes.map((recipe: Recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery.trim() ? 'No recipes found' : 'No recipes yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery.trim() 
                    ? 'Try adjusting your search terms'
                    : 'Start building your recipe collection today!'}
                </p>
                {!searchQuery.trim() && (
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Recipe
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Recipe Creation Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Recipe</DialogTitle>
          </DialogHeader>
          <RecipeForm
            onSubmit={(data) => createRecipeMutation.mutate(data)}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={createRecipeMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
