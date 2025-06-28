import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import RecipeForm from "@/components/recipe-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Users, ChefHat, Heart, Edit, Trash2, BookOpen, Calendar } from "lucide-react";
import type { Recipe } from "@shared/schema";

export default function RecipeDetail() {
  const { id } = useParams();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cookingNotes, setCookingNotes] = useState("");

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

  const { data: recipe, isLoading: recipeLoading } = useQuery({
    queryKey: ["/api/recipes", id],
    enabled: !!id && isAuthenticated,
  });

  const { data: isFavorited = false } = useQuery({
    queryKey: ["/api/favorites", id, "check"],
    queryFn: async () => {
      const favorites = await fetch("/api/favorites", { credentials: "include" }).then(r => r.json());
      return favorites.some((f: any) => f.id === parseInt(id!));
    },
    enabled: !!id && isAuthenticated,
  });

  const updateRecipeMutation = useMutation({
    mutationFn: async (recipeData: any) => {
      await apiRequest("PUT", `/api/recipes/${id}`, recipeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      setIsEditModalOpen(false);
      toast({
        title: "Success",
        description: "Recipe updated successfully!",
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
        description: "Failed to update recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/recipes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Success",
        description: "Recipe deleted successfully!",
      });
      window.location.href = "/";
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
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        await apiRequest("POST", `/api/favorites/${id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", id, "check"] });
      toast({
        title: "Success",
        description: isFavorited ? "Removed from favorites" : "Added to favorites",
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
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addCookingHistoryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cooking-history", {
        recipeId: parseInt(id!),
        notes: cookingNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cooking-history"] });
      setCookingNotes("");
      toast({
        title: "Success",
        description: "Cooking session recorded!",
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
        description: "Failed to record cooking session. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || isLoading) {
    return null;
  }

  if (recipeLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recipe not found</h3>
              <p className="text-gray-600">The recipe you're looking for doesn't exist or has been deleted.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isOwner = recipe.userId === user?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recipe Header */}
        <div className="mb-8">
          {recipe.imageUrl && (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold recipe-slate mb-2">{recipe.title}</h1>
              {recipe.description && (
                <p className="text-gray-600 text-lg">{recipe.description}</p>
              )}
            </div>
            
            <div className="flex space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleFavoriteMutation.mutate()}
                disabled={toggleFavoriteMutation.isPending}
                className={isFavorited ? "text-red-500 border-red-500" : ""}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
              </Button>
              
              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRecipeMutation.mutate()}
                    disabled={deleteRecipeMutation.isPending}
                    className="text-red-500 border-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Recipe Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            {recipe.prepTime && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Prep: {recipe.prepTime} min
              </div>
            )}
            {recipe.cookTime && (
              <div className="flex items-center">
                <ChefHat className="h-4 w-4 mr-1" />
                Cook: {recipe.cookTime} min
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Serves: {recipe.servings}
              </div>
            )}
          </div>

          {/* Tags and Category */}
          <div className="flex flex-wrap gap-2 mb-6">
            {recipe.difficulty && (
              <Badge variant="outline" className="bg-green-50 text-recipe-green border-recipe-green">
                {recipe.difficulty}
              </Badge>
            )}
            {recipe.category && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-700">
                {recipe.category}
              </Badge>
            )}
            {recipe.tags?.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recipe.ingredients?.map((ingredient, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-recipe-orange rounded-full mr-3 flex-shrink-0"></span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Cooking Log */}
            {isOwner && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Mark as Cooked
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add cooking notes (optional)..."
                    value={cookingNotes}
                    onChange={(e) => setCookingNotes(e.target.value)}
                    className="mb-4"
                  />
                  <Button
                    onClick={() => addCookingHistoryMutation.mutate()}
                    disabled={addCookingHistoryMutation.isPending}
                    className="w-full"
                  >
                    Record Cooking Session
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {recipe.instructions?.map((instruction, index) => (
                    <li key={index} className="flex">
                      <span className="bg-recipe-orange text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-4 flex-shrink-0 mt-1">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 leading-relaxed">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Recipe Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Recipe</DialogTitle>
          </DialogHeader>
          <RecipeForm
            recipe={recipe}
            onSubmit={(data) => updateRecipeMutation.mutate(data)}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={updateRecipeMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
