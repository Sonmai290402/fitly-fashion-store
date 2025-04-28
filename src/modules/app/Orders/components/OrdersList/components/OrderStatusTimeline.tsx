import { Check, X } from "lucide-react";
import { Fragment } from "react";

import { OrderStatus } from "@/types/order.types";

export const OrderStatusTimeline = ({ status }: { status: OrderStatus }) => {
  const statuses: OrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
  ];

  if (status === "cancelled") {
    return (
      <div className="mt-4 border-l-2 border-red-500 pl-4 py-2">
        <p className="text-sm text-red-600 font-medium flex items-center">
          <X className="h-4 w-4 mr-2" />
          This order has been cancelled
        </p>
      </div>
    );
  }

  const currentStatusIndex = statuses.indexOf(status);

  return (
    <div className="mt-4">
      <div className="flex items-center">
        {statuses.map((step, index) => (
          <Fragment key={step}>
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full z-10
                  ${
                    index <= currentStatusIndex
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
            >
              {index < currentStatusIndex ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>

            {index < statuses.length - 1 && (
              <div
                className={`flex-1 h-0.5 
                    ${
                      index < currentStatusIndex ? "bg-primary" : "bg-gray-200"
                    }`}
              />
            )}
          </Fragment>
        ))}
      </div>

      <div className="flex justify-between mt-2">
        <div className="text-xs text-gray-600">Pending</div>
        <div className="text-xs text-gray-600 ml-2">Processing</div>
        <div className="text-xs text-gray-600">Shipped</div>
        <div className="text-xs text-gray-600">Delivered</div>
      </div>
    </div>
  );
};
