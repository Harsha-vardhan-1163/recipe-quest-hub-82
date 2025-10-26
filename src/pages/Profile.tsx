import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Package } from "lucide-react";

interface Profile {
  full_name: string;
  email: string;
  phone_number: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  address: string;
  city: string;
  recipes: {
    name: string;
    price: number;
    image_url: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      const { data: ordersData } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          status,
          address,
          city,
          recipes (
            name,
            price,
            image_url
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (ordersData) {
        setOrders(ordersData);
      }

      setIsLoading(false);
    };

    checkAuthAndFetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-primary";
      case "delivered":
        return "bg-success";
      case "cancelled":
        return "bg-destructive";
      default:
        return "bg-muted";
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

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar showAuthButtons />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">My Profile</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile && (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-semibold">{profile.full_name}</p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        Email
                      </p>
                      <p className="font-semibold">{profile.email}</p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        Phone
                      </p>
                      <p className="font-semibold">{profile.phone_number}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No orders yet. Start ordering from our delicious menu!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex gap-4 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
                      >
                        <img
                          src={order.recipes.image_url}
                          alt={order.recipes.name}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold">{order.recipes.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {order.city}, {order.address}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="font-semibold text-primary">
                              ${order.recipes.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
