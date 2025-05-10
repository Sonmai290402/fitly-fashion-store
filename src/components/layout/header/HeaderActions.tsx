import clsx from "clsx";
import { LogOut, Package, Search, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";

import { headerActionItems } from "@/constants";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useAuthStore } from "@/store/authStore";
import { useSearchStore } from "@/store/searchStore";

import { ModeToggle } from "../../common/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import HeaderSearch from "./HeaderSearch";

const HeaderActions = () => {
  const { logout, user } = useAuthStore();
  const { isSearchOpen, toggleSearch } = useSearchStore();
  const pathname = usePathname();

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const hasHydrated = useHasHydrated();

  const filteredItems = headerActionItems.filter(
    (item) => item.title.toLowerCase() !== "search"
  );

  const displayedItems = isDesktop
    ? filteredItems.filter((item) => {
        if (user?.role !== "admin" && item.title.toLowerCase() === "admin") {
          return false;
        }
        return true;
      })
    : filteredItems.filter((item) => {
        const title = item.title.toLowerCase();
        if (user?.role !== "admin" && title === "admin") return false;
        return title === "cart";
      });

  if (!hasHydrated) return <div className="flex flex-1"></div>;

  const handleSearchToggle = () => {
    toggleSearch();
  };

  const loginUrl =
    pathname && pathname !== "/login" && pathname !== "/signup"
      ? `/login?return_to=${encodeURIComponent(pathname)}`
      : "/login";

  return (
    <nav className="flex flex-1 justify-end items-center gap-1 md:gap-3">
      <HeaderSearch isMobile={isMobile} />

      <button
        className={clsx("p-2 rounded-full transition-colors", {
          "bg-primary/10 text-primary": isSearchOpen,
          "hover:bg-gray-100 dark:hover:bg-gray-800": !isSearchOpen,
        })}
        onClick={handleSearchToggle}
        aria-label={isSearchOpen ? "Close search" : "Open search"}
      >
        <Search className="h-5 w-5" />
      </button>

      {displayedItems.map(({ icon, title, url }) => (
        <Link key={title} href={url}>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            {icon}
          </button>
        </Link>
      ))}

      <ModeToggle />

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar className="cursor-pointer border border-gray-200">
              <AvatarImage src={user.avatar || ""} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/fashion-store-f3b8b.firebasestorage.app/o/default-avatar.png?alt=media&token=d5cae13a-4bb2-4eb5-8bcf-7a3960faf6ba"
                  alt="avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 z-100">
            <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>

            <Link href="/orders">
              <DropdownMenuItem className="cursor-pointer">
                <Package className="mr-2 h-4 w-4" />
                <span>My Orders</span>
              </DropdownMenuItem>
            </Link>

            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href={loginUrl}>
          <Button className="px-4 py-2 rounded-md font-medium">Login</Button>
        </Link>
      )}
    </nav>
  );
};

export default HeaderActions;
