import { Copy, MoreHorizontal, Send } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/store/userStore";
import { OrderData } from "@/types/order.types";
import { UserData } from "@/types/user.types";

interface ActionHeaderProps {
  order: OrderData;
}

export default function ActionHeader({ order }: ActionHeaderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const { getUserById } = useUserStore();
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (order.userId) {
        const userData = await getUserById(order.userId);
        setUser(userData);
      }
    };
    fetchUser();
  }, [order.userId, getUserById]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            copyToClipboard(
              order.orderNumber,
              "Order Number copied to clipboard"
            )
          }
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy Order Number
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            (window.location.href = `mailto:${user?.username}?subject=Order ${order.orderNumber}`)
          }
        >
          <Send className="mr-2 h-4 w-4" />
          Email Customer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
