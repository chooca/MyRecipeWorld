import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, Shield, Users, History } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Utensils className="text-recipe-orange text-2xl mr-3" />
              <h1 className="text-2xl font-bold recipe-slate">RecipeVault</h1>
            </div>
            <Button onClick={handleLogin} className="bg-recipe-orange hover:bg-recipe-orange/90">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold recipe-slate mb-6">
            Your Personal Recipe Universe
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Store, organize, and discover amazing recipes. Keep your cooking history private while sharing your best creations with the community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="bg-recipe-orange hover:bg-recipe-orange/90 text-white px-8 py-4 rounded-full font-semibold"
            >
              Start Cooking
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-recipe-orange recipe-orange hover:bg-recipe-orange hover:text-white px-8 py-4 rounded-full font-semibold"
            >
              Explore Recipes
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold recipe-slate text-center mb-12">
            Why Choose RecipeVault?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-orange-100 text-recipe-orange rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils size={32} />
                </div>
                <h4 className="text-xl font-semibold mb-3">Recipe Management</h4>
                <p className="text-gray-600">Organize your recipes with photos, ingredients, and step-by-step instructions</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 text-recipe-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <History size={32} />
                </div>
                <h4 className="text-xl font-semibold mb-3">Cooking History</h4>
                <p className="text-gray-600">Track your cooking journey and see your favorite go-to recipes</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} />
                </div>
                <h4 className="text-xl font-semibold mb-3">Community Sharing</h4>
                <p className="text-gray-600">Share your best recipes with the community and discover new favorites</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={32} />
                </div>
                <h4 className="text-xl font-semibold mb-3">Privacy Focused</h4>
                <p className="text-gray-600">Your cooking history stays private while you can choose what to share</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-recipe-orange to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-6">Ready to Transform Your Cooking?</h3>
          <p className="text-xl mb-8 text-orange-100">
            Join thousands of home cooks who have organized their recipes and elevated their cooking game.
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="bg-white text-recipe-orange hover:bg-gray-100 px-8 py-4 rounded-full font-semibold"
          >
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-recipe-slate text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Utensils className="text-recipe-orange text-2xl mr-3" />
            <span className="text-xl font-bold">RecipeVault</span>
          </div>
          <p className="text-gray-300">
            Your secure, private recipe management platform. Cook with confidence, share with joy.
          </p>
        </div>
      </footer>
    </div>
  );
}
