import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { insertRecipeSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import ImageUpload from "./image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import type { Recipe, InsertRecipe } from "@shared/schema";
import { z } from "zod";

const formSchema = insertRecipeSchema.extend({
  ingredients: z.array(z.string().min(1, "Ingredient cannot be empty")).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string().min(1, "Instruction cannot be empty")).min(1, "At least one instruction is required"),
});

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: InsertRecipe) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function RecipeForm({ recipe, onSubmit, onCancel, isLoading }: RecipeFormProps) {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<string[]>(
    recipe?.ingredients || [""]
  );
  const [instructions, setInstructions] = useState<string[]>(
    recipe?.instructions || [""]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: recipe?.title || "",
      description: recipe?.description || "",
      imageUrl: recipe?.imageUrl || "",
      prepTime: recipe?.prepTime || undefined,
      cookTime: recipe?.cookTime || undefined,
      servings: recipe?.servings || undefined,
      difficulty: recipe?.difficulty || undefined,
      category: recipe?.category || "",
      ingredients: recipe?.ingredients || [""],
      instructions: recipe?.instructions || [""],
      tags: recipe?.tags || [],
      isPublic: recipe?.isPublic || false,
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const response = await apiRequest("POST", "/api/upload", formData);
      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadImageMutation.mutateAsync(file);
      form.setValue("imageUrl", result.imageUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const addIngredient = () => {
    const newIngredients = [...ingredients, ""];
    setIngredients(newIngredients);
    form.setValue("ingredients", newIngredients);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
    form.setValue("ingredients", newIngredients);
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
    form.setValue("ingredients", newIngredients);
  };

  const addInstruction = () => {
    const newInstructions = [...instructions, ""];
    setInstructions(newInstructions);
    form.setValue("instructions", newInstructions);
  };

  const removeInstruction = (index: number) => {
    const newInstructions = instructions.filter((_, i) => i !== index);
    setInstructions(newInstructions);
    form.setValue("instructions", newInstructions);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
    form.setValue("instructions", newInstructions);
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Image Upload */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipe Photo</FormLabel>
              <FormControl>
                <ImageUpload
                  onUpload={handleImageUpload}
                  imageUrl={field.value}
                  isLoading={uploadImageMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Basic Information */}
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipe Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter recipe title..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Briefly describe your recipe..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Recipe Details */}
        <div className="grid md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="prepTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prep Time (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="15"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cookTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cook Time (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="30"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="servings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servings</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="4"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category and Difficulty */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Main Course, Dessert, Appetizer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Ingredients */}
        <div>
          <FormLabel className="text-base font-medium">Ingredients</FormLabel>
          <div className="space-y-3 mt-2">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Input
                  placeholder="2 cups flour"
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  className="flex-1"
                />
                {ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              onClick={addIngredient}
              className="text-recipe-orange hover:text-recipe-orange/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </div>
        </div>

        <Separator />

        {/* Instructions */}
        <div>
          <FormLabel className="text-base font-medium">Instructions</FormLabel>
          <div className="space-y-3 mt-2">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="bg-recipe-orange text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mt-1 flex-shrink-0">
                  {index + 1}
                </span>
                <Textarea
                  placeholder="Preheat oven to 350°F..."
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                {instructions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                    className="text-red-500 hover:text-red-700 mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              onClick={addInstruction}
              className="text-recipe-orange hover:text-recipe-orange/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>
        </div>

        <Separator />

        {/* Privacy Settings */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-medium">Share with community</FormLabel>
                    <p className="text-sm text-gray-600">
                      Allow others to discover and save this recipe
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-recipe-orange hover:bg-recipe-orange/90">
            {isLoading ? "Saving..." : recipe ? "Update Recipe" : "Save Recipe"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
