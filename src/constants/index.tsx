import {
  Boxes,
  ChartColumnIncreasing,
  Layers,
  LayoutDashboard,
  MapPin,
  Package,
  Receipt,
  Recycle,
  Search,
  Shirt,
  UserCog,
} from "lucide-react";

export const headerActionItems = [
  {
    title: "Search",
    icon: <Search />,
    url: "/",
  },
  {
    title: "Admin",
    icon: <LayoutDashboard />,
    url: "/admin",
  },
];

export const footerItems = [
  {
    title: "Account",
    list: ["Log In", "Sign up", "Redeem A Gift Card"],
  },
  {
    title: "Company",
    list: ["About", "Factories", "DEI", "Carrers"],
  },
  {
    title: "Get Help",
    list: ["Help Center", "Return Policy", "Shipping Info", "Bulk Orders"],
  },
  {
    title: "Connect",
    list: ["Facebook", "Instagram"],
  },
];

export const footerTerms = [
  "Privacy Policy",
  "Terms of Service",
  "Do Not Sell or Share My Personal Information",
  "CS Supply Chain Transparency",
  "Vendor Code of Conduct",
  "Sitemap Pages",
  "Sitemap Products",
];

export const highlightItems = [
  {
    icon: <Package size={80} />,
    title: "Complimentary Shipping",
    subTitle: "Enjoy free shipping on U.S. orders over $100.",
  },
  {
    icon: <Recycle size={80} />,
    title: "Consciously Crafted",
    subTitle: "Designed with you and the planet in mind.",
  },
  {
    icon: <MapPin size={80} />,
    title: "Come Say Hi",
    subTitle: "We have 11 stores across the U.S.",
  },
];

export const adminMenuItems = [
  {
    url: "/admin",
    title: "Dashboard",
    icon: (className?: string) => (
      <ChartColumnIncreasing className={className} />
    ),
  },
  {
    url: "/admin/orders",
    title: "Order Management",
    icon: (className?: string) => <Receipt className={className} />,
  },
  {
    url: "/admin/users",
    title: "User Management",
    icon: (className?: string) => <UserCog className={className} />,
  },
  {
    url: "/admin/products",
    title: "Product Management",
    icon: (className?: string) => <Shirt className={className} size={20} />,
  },

  {
    url: "/admin/categories",
    title: "Category Management",
    icon: (className?: string) => <Layers className={className} />,
  },
  {
    url: "/admin/collections",
    title: "Collection Management",
    icon: (className?: string) => <Boxes className={className} />,
  },
];

export const categoryOptionsByGender = {
  Men: [
    { option: "t-shirts", label: "T-shirts" },
    { option: "pants", label: "Pants" },
    { option: "sweater", label: "Sweater" },
  ],
  Women: [
    { option: "dresses", label: "Dresses" },
    { option: "skirt", label: "Skirt" },
    { option: "bra", label: "Bra" },
  ],
};

export const commonSizes = ["XS", "S", "M", "L", "XL", "XXL"];

export const commonColors = [
  { name: "Black", colorCode: "#000000" },
  { name: "White", colorCode: "#FFFFFF" },
  { name: "Blue", colorCode: "#0000FF" },
  { name: "Red", colorCode: "#FF0000" },
];

export const STORAGE_KEYS = {
  AUTH_USER: "auth_user_data",
  REVIEW_VOTES: "review-store",
  CART_ITEMS: "cart-items",
  CART_ITEMS_GUEST: "cart-items-guest",
};
