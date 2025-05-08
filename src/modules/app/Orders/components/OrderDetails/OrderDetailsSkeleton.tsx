"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";

const OrderDetailsSkeleton = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link
        href="/orders"
        className="flex items-center gap-1 text-gray-500 mb-6 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Orders</span>
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="relative mb-8">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-gray-200 dark:bg-gray-700" />
        <div className="relative grid grid-cols-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-2 ring-gray-300 dark:ring-gray-600">
                <Skeleton className="h-3 w-3 rounded-full" />
              </div>
              <Skeleton className="mt-2 h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border rounded-lg overflow-hidden dark:border-gray-700">
        <h2 className="bg-gray-50 dark:bg-gray-800 p-4 font-semibold">
          Order Items
        </h2>
        <div className="divide-y dark:divide-gray-700">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-4 flex gap-4">
              <Skeleton className="w-16 h-16 flex-shrink-0 rounded" />
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <div className="flex gap-2 mt-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border rounded-lg overflow-hidden dark:border-gray-700">
        <h2 className="bg-gray-50 dark:bg-gray-800 p-4 font-semibold">
          Order Summary
        </h2>
        <div className="p-4 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between pt-2 border-t dark:border-gray-700">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <div className="border rounded-lg overflow-hidden dark:border-gray-700">
          <h2 className="bg-gray-50 dark:bg-gray-800 p-4 font-semibold">
            Shipping Address
          </h2>
          <div className="p-4">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-full max-w-xs mb-1" />
            <Skeleton className="h-4 w-40 mb-1" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
      </div>

      <div className="mt-6 border rounded-lg overflow-hidden dark:border-gray-700">
        <h2 className="bg-gray-50 dark:bg-gray-800 p-4 font-semibold">
          Order History
        </h2>
        <div className="p-4">
          <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <li key={index} className="mb-6 ml-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-white dark:bg-gray-900 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900">
                  <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                </span>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsSkeleton;
