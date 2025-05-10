import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DASHBOARD_COLORS } from "@/store/dashboardStore";
import { ChartDataPoint } from "@/types/dashboard.types";
import { formatCurrency } from "@/utils/formatCurrency";

interface RevenueByCategoryChartProps {
  revenueByCategory: ChartDataPoint[];
}

const RevenueByCategoryChart = ({
  revenueByCategory,
}: RevenueByCategoryChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Category</CardTitle>
        <CardDescription>
          Distribution of sales across product categories
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={revenueByCategory}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {revenueByCategory.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={DASHBOARD_COLORS[index % DASHBOARD_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueByCategoryChart;
