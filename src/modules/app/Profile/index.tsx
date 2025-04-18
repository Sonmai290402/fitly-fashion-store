"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useAuthStore } from "@/store/authStore";

// import OrderHistory from "./components/OrderHistory";
import ProfileDetails from "./components/ProfileDetails";
import ProfileEdit from "./components/ProfileEdit";

type TabOption = {
  id: string;
  label: string;
  component: React.ReactNode;
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const tabs: TabOption[] = [
    {
      id: "details",
      label: "Profile Details",
      component: <ProfileDetails user={user!} />,
    },
    {
      id: "edit",
      label: "Edit Profile",
      component: <ProfileEdit user={user!} />,
    },
    {
      id: "orders",
      label: "Order History",
      component: <p>Comming soon</p>,
      // component: <OrderHistory userId={user!.uid || ""} />,
    },
    {
      id: "addresses",
      label: "Saved Addresses",
      component: (
        <div className="p-6 text-center bg-muted rounded-lg">
          <h3 className="text-lg font-medium">Coming Soon</h3>
          <p className="text-muted-foreground">
            Address management will be available soon.
          </p>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (hasHydrated && !user) {
      router.push("/login");
    }
  }, [hasHydrated, user, router]);

  if (!hasHydrated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeTabOption = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="w-full">
        <div className="md:hidden relative mb-6">
          <Button
            variant="outline"
            className="w-full flex justify-between items-center text-left "
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{activeTabOption.label}</span>
            <ChevronDown
              className={`transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </Button>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className="w-full justify-start rounded-none"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden md:flex mb-6 border-b gap-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={clsx(
                "rounded-md ",
                activeTab === tab.id && "border-b-2 border-primary"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="mt-6">{activeTabOption.component}</div>
      </div>
    </div>
  );
}
