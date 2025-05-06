import { CheckCircle, Package, PackageCheck, Truck } from "lucide-react";
import { Fragment } from "react";

import { OrderData } from "@/types/order.types";

export function OrderTrackingProgress({ order }: { order: OrderData }) {
  if (order.status === "cancelled") {
    return null;
  }

  const steps = [
    { key: "pending", label: "Ordered", icon: Package },
    { key: "processing", label: "Processing", icon: PackageCheck },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === order.status);
  const currentStep = currentStepIndex !== -1 ? currentStepIndex : 0;

  return (
    <div className="w-full py-6">
      <div className="flex items-center">
        {steps.map((step, i) => {
          const StepIcon = step.icon;
          const completed = i <= currentStep;
          const isLast = i === steps.length - 1;

          return (
            <Fragment key={step.key}>
              <div className="relative flex flex-col items-center">
                <div
                  className={`rounded-full transition duration-500 ease-in-out h-12 w-12 flex items-center justify-center ${
                    completed
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted dark:bg-muted/50"
                  }`}
                >
                  <StepIcon className="h-6 w-6" />
                </div>
                <div
                  className={`text-xs text-center mt-2 ${
                    completed ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </div>
              </div>

              {!isLast && (
                <div
                  className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
                    i < currentStep
                      ? "border-primary"
                      : "border-muted dark:border-muted/50"
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </div>

      {order.trackingNumber && (
        <div className="mt-6 text-center text-sm">
          <p className="font-medium text-foreground">
            Tracking Number: {order.trackingNumber}
          </p>
          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline hover:text-primary/90"
            >
              Track Package
            </a>
          )}
        </div>
      )}
    </div>
  );
}
