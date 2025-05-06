import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DASHBOARD_COLORS } from "@/store/dashboardStore";

import { ChartDataPoint } from "../types";

interface OrderStatusChartProps {
  statusDistribution: ChartDataPoint[];
}

const OrderStatusChart = ({ statusDistribution }: OrderStatusChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status Distribution</CardTitle>
        <CardDescription>Number of orders by status</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statusDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8">
              {statusDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={DASHBOARD_COLORS[index % DASHBOARD_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default OrderStatusChart;
