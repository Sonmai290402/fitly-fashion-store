import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type AdminSidebarProps = {
  url: string;
  title: string;
  icon: (className?: string) => React.JSX.Element;
};

const SidebarItem = ({ url = "/", title = "", icon }: AdminSidebarProps) => {
  const pathname = usePathname();
  const isActive = pathname === url;
  return (
    <li
      className={clsx(
        "hover:bg-gray-300 rounded-lg",
        isActive && "bg-gray-300"
      )}
    >
      <Link href={url} className="flex gap-2 py-4 px-2">
        {icon(`w-5 h-5 ${isActive && "svg-animate"}`)} {title}
      </Link>
    </li>
  );
};

export default SidebarItem;
