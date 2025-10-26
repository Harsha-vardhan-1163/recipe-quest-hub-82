import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface Recipe {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
}

const Order = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState({
    address: "",
    city: "",
    pincode: "",
    landmark: "",
    deliveryInstructions: "",
  });

  useEffect(() => {
    const checkAuthAndFetchRecipe = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      if (!recipeId) {
        navigate("/home");
        return;
      }

      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .single();

      if (error || !data) {
        toast({
          title: "Error",
          description: "Recipe not found",
          variant: "destructive",
        });
        navigate("/home");
        return;
      }

      setRecipe(data);
      setIsLoading(false);
    };

    checkAuthAndFetchRecipe();
  }, [recipeId, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !recipe) {
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      recipe_id: recipe.id,
      address: orderData.address,
      city: orderData.city,
      pincode: orderData.pincode,
      landmark: orderData.landmark || null,
      delivery_instructions: orderData.deliveryInstructions || null,
      status: "pending",
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate("/order/confirmed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar showAuthButtons />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar showAuthButtons />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Recipes
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <img
                  src={recipe.image_url}
                  alt={recipe.name}
                  className="h-64 w-full rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-2xl font-bold">{recipe.name}</h3>
                  <p className="text-muted-foreground">{recipe.description}</p>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${recipe.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your complete address"
                    value={orderData.address}
                    onChange={(e) =>
                      setOrderData({ ...orderData, address: e.target.value })
                    }
                    required
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={orderData.city}
                      onChange={(e) =>
                        setOrderData({ ...orderData, city: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="123456"
                      value={orderData.pincode}
                      onChange={(e) =>
                        setOrderData({ ...orderData, pincode: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    placeholder="Near..."
                    value={orderData.landmark}
                    onChange={(e) =>
                      setOrderData({ ...orderData, landmark: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">
                    Delivery Instructions (Optional)
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder="Any special instructions for delivery"
                    value={orderData.deliveryInstructions}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        deliveryInstructions: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                  variant="success"
                >
                  {isSubmitting ? "Placing Order..." : "Confirm Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Order;
