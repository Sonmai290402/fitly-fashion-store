"use client";

import Link from "next/link";

import { adminMenuItems } from "@/constants";
import { useHasHydrated } from "@/hooks/useHasHydrated";

import { Skeleton } from "../ui/skeleton";
import SidebarItem from "./SidebarItem";

const Sidebar = () => {
  const hasHydrated = useHasHydrated();

  return (
    <div className="p-5 border-r border-r-gray-200 dark:border-opacity-10 bg-white h-screen flex flex-col dark:bg-grayDarker">
      <Link href="/" className="logo cursor-pointer mb-5">
        <span className="font-bold text-3xl text-primary">FITLY</span>
      </Link>

      {!hasHydrated ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-14 w-full rounded-lg animate-pulse bg-gradient-to-r from-gray-200 to-gray-100"
            />
          ))}
        </div>
      ) : (
        <ul>
          {adminMenuItems.map((item, index) => (
            <SidebarItem
              key={index}
              url={item.url}
              title={item.title}
              icon={item.icon}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
