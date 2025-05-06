import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TopProductData } from "../types";

interface TopProductsChartProps {
  topProducts: TopProductData[];
}

const TopProductsChart = ({ topProducts }: TopProductsChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Products with highest sales volume</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topProducts}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="title"
              tickFormatter={(value) =>
                value.length > 20 ? value.substring(0, 20) + "..." : value
              }
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#0088FE" name="Units Sold" />
            <Bar dataKey="revenue" fill="#00C49F" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/admin/products">Manage Products</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TopProductsChart;
