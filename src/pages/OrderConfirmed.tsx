import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";

const OrderConfirmed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar showAuthButtons />
      
      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md text-center shadow-hover">
          <CardContent className="pt-8">
            <div className="mx-auto mb-6 w-fit rounded-full bg-success/10 p-4">
              <CheckCircle2 className="h-16 w-16 text-success" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              Order Confirmed!
            </h1>
            <p className="mb-8 text-muted-foreground">
              Thank you for your order! Your delicious meal will be prepared and delivered soon.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/home")}
                size="lg"
                className="w-full"
              >
                Back to Home
              </Button>
              <Button
                onClick={() => navigate("/profile")}
                variant="outline"
                size="lg"
                className="w-full"
              >
                View My Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OrderConfirmed;
