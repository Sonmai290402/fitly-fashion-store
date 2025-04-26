import { Copy, Send } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/store/userStore";
import { OrderData } from "@/types/order.types";
import { UserData } from "@/types/user.types";

interface CustomerInfoProps {
  order: OrderData;
}

export default function CustomerInfo({ order }: CustomerInfoProps) {
  const { getUserById } = useUserStore();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (order.userId) {
        const userData = await getUserById(order.userId);
        setUser(userData);
      }
    };
    fetchUser();
  }, [order.userId, getUserById]);
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Customer Name
            </h3>
            <p>{order.shippingAddress.fullName}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Username
            </h3>
            <p>{user?.username}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Contact
            </h3>
            <p>{order.shippingAddress.phoneNumber}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Customer ID
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-xs truncate">{order.userId}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() =>
                  copyToClipboard(order.userId, "Customer ID copied")
                }
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => (window.location.href = `mailto:${order.userId}`)}
          >
            <Send className="mr-2 h-4 w-4" />
            Contact Customer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
