import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Recipe {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
  preparation_time: number;
  averageRating?: number;
  userRating?: number;
}

const Home = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      fetchRecipes(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        fetchRecipes(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchRecipes = async (currentUserId: string) => {
    setIsLoading(true);
    
    const { data: recipesData, error: recipesError } = await supabase
      .from("recipes")
      .select("*")
      .order("name");

    if (recipesError) {
      console.error("Error fetching recipes:", recipesError);
      setIsLoading(false);
      return;
    }

    const { data: ratingsData } = await supabase
      .from("ratings")
      .select("recipe_id, rating, user_id");

    const recipesWithRatings = recipesData.map((recipe) => {
      const recipeRatings = ratingsData?.filter((r) => r.recipe_id === recipe.id) || [];
      const averageRating =
        recipeRatings.length > 0
          ? recipeRatings.reduce((sum, r) => sum + r.rating, 0) / recipeRatings.length
          : 0;
      const userRating = recipeRatings.find((r) => r.user_id === currentUserId)?.rating || 0;

      return {
        ...recipe,
        averageRating,
        userRating,
      };
    });

    setRecipes(recipesWithRatings);
    setIsLoading(false);
  };

  const handleRatingUpdate = () => {
    if (userId) {
      fetchRecipes(userId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar showAuthButtons />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-foreground">
            Discover Delicious Recipes
          </h1>
          <p className="text-lg text-muted-foreground">
            Order your favorite dishes and get them delivered hot and fresh
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-56 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">
              No recipes available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onRatingUpdate={handleRatingUpdate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
