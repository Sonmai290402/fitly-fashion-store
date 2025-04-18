import Image from "next/image";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserData } from "@/types/user.types";
import { formatDateTime } from "@/utils/formatDateTime";

export default function ProfileDetails({ user }: { user: UserData }) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-0">
        <div className="flex items-center space-x-4">
          <div className="relative size-20 rounded-full overflow-hidden border-2 border-primary">
            <Image
              src={user.avatar || "/images/default-avatar.png"}
              alt={user.username || "User"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <CardTitle className="text-2xl">{user.username}</CardTitle>
            <p className="text-muted-foreground">{user.email}</p>
            <Badge
              variant={user.role === "admin" ? "default" : "outline"}
              className="mt-1"
            >
              {user.role === "admin" ? "Administrator" : "Customer"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Joined
              </h3>
              <p>{formatDateTime(user.createdAt) || "Not available"}</p>
            </div>
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Last Updated
              </h3>
              <p>{formatDateTime(user.updatedAt) || "Not available"}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Account Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Username:</span>
                <span>{user.username || "Not set"}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
