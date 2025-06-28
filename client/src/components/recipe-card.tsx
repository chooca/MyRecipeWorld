import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Heart } from "lucide-react";
import type { Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await apiRequest("DELETE", `/api/favorites/${recipe.id}`);
      } else {
        await apiRequest("POST", `/api/favorites/${recipe.id}`);
      }
    },
    onSuccess: () => {
      setIsFavorited(!isFavorited);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-50 text-recipe-green border-recipe-green";
      case "Medium":
        return "bg-orange-50 text-orange-700 border-orange-700";
      case "Hard":
        return "bg-red-50 text-red-700 border-red-700";
      default:
        return "bg-gray-50 text-gray-700 border-gray-700";
    }
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return "bg-gray-50 text-gray-700 border-gray-700";
    
    const colors = [
      "bg-blue-50 text-blue-700 border-blue-700",
      "bg-purple-50 text-purple-700 border-purple-700",
      "bg-green-50 text-green-700 border-green-700",
      "bg-pink-50 text-pink-700 border-pink-700",
    ];
    
    const hash = category.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <Link href={`/recipe/${recipe.id}`}>
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
        {recipe.imageUrl && (
          <div className="aspect-video overflow-hidden">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-lg recipe-slate line-clamp-2 flex-1 mr-2">
              {recipe.title}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              disabled={toggleFavoriteMutation.isPending}
              className={`p-1 h-auto ${
                isFavorited ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"
              }`}
            >
              <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
            </Button>
          </div>
          
          {recipe.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {recipe.description}
            </p>
          )}
          
          <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
            {recipe.cookTime && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{recipe.cookTime} min</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{recipe.servings} servings</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {recipe.difficulty && (
                <Badge variant="outline" className={getDifficultyColor(recipe.difficulty)}>
                  {recipe.difficulty}
                </Badge>
              )}
              {recipe.category && (
                <Badge variant="outline" className={getCategoryColor(recipe.category)}>
                  {recipe.category}
                </Badge>
              )}
            </div>
            
            {recipe.updatedAt && (
              <div className="text-xs text-gray-400">
                {new Date(recipe.updatedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
