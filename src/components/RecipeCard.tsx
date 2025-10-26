import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Clock, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface RecipeCardProps {
  recipe: Recipe;
  onRatingUpdate?: () => void;
}

const RecipeCard = ({ recipe, onRatingUpdate }: RecipeCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedRating, setSelectedRating] = useState(recipe.userRating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOrder = () => {
    navigate(`/order/${recipe.id}`);
  };

  const handleRatingSubmit = async () => {
    if (selectedRating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to rate",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from("ratings")
      .upsert({
        user_id: user.id,
        recipe_id: recipe.id,
        rating: selectedRating,
      });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Rating submitted successfully!",
      });
      setShowRatingDialog(false);
      onRatingUpdate?.();
    }
  };

  return (
    <>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-hover">
        <div className="relative overflow-hidden">
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute right-2 top-2 rounded-full bg-background/90 px-3 py-1 text-sm font-semibold backdrop-blur">
            ${recipe.price.toFixed(2)}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="text-xl font-bold text-foreground line-clamp-1">{recipe.name}</h3>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold">{recipe.averageRating?.toFixed(1) || "N/A"}</span>
            </div>
          </div>
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {recipe.preparation_time} min
            </span>
            <span className="rounded-full bg-muted px-2 py-1">{recipe.category}</span>
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-2 p-4 pt-0">
          <Button onClick={() => setShowRatingDialog(true)} variant="outline" size="sm">
            <Star className="h-4 w-4" />
            Rate
          </Button>
          <Button onClick={handleOrder} size="sm">
            <ShoppingCart className="h-4 w-4" />
            Order
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate {recipe.name}</DialogTitle>
            <DialogDescription>
              How would you rate this recipe?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-2 py-6">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 ${
                    rating <= selectedRating
                      ? "fill-primary text-primary"
                      : "text-muted"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRatingSubmit} disabled={isSubmitting}>
              Submit Rating
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecipeCard;
