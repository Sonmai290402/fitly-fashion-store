"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useDashboardStore from "@/store/dashboardStore";
import { formatCurrency } from "@/utils/formatCurrency";

import {
  OrderStatusChart,
  RecentOrdersList,
  RevenueByCategoryChart,
  SalesOverviewChart,
  StatsCard,
  TopProductsChart,
  UserGrowthChart,
} from "./components";

const AdminDashboard = () => {
  const {
    loading,
    stats,
    recentOrders,
    salesData,
    statusDistribution,
    topProducts,
    revenueByCategory,
    userGrowth,
    fetchDashboardData,
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Rendering the full dashboard structure, with loading states for content
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboardData}
          className="gap-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          // Skeleton loading state for stats cards
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="h-4 w-24 animate-pulse rounded bg-muted mb-4"></div>
                <div className="h-8 w-20 animate-pulse rounded bg-muted"></div>
              </div>
            ))
        ) : (
          <>
            <StatsCard
              title="Total Orders"
              value={stats.totalOrders.toString()}
              description="All time orders"
            />
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              description="All time revenue"
            />
            <StatsCard
              title="Total Products"
              value={stats.totalProducts.toString()}
              description="Products in inventory"
            />
            <StatsCard
              title="Total Users"
              value={stats.totalUsers.toString()}
              description="Registered users"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-80 rounded-lg border bg-card shadow-sm flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
              <div className="h-80 rounded-lg border bg-card shadow-sm flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <SalesOverviewChart salesData={salesData} />
              <RevenueByCategoryChart revenueByCategory={revenueByCategory} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-80 rounded-lg border bg-card shadow-sm flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
              <div className="h-80 rounded-lg border bg-card shadow-sm flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <OrderStatusChart statusDistribution={statusDistribution} />
              <RecentOrdersList recentOrders={recentOrders} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          {loading ? (
            <div className="h-80 rounded-lg border bg-card shadow-sm flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TopProductsChart topProducts={topProducts} />
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {loading ? (
            <div className="h-80 rounded-lg border bg-card shadow-sm flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <UserGrowthChart userGrowth={userGrowth} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
