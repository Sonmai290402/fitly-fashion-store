import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { Fragment } from "react";

import { ProductData, ProductFilters } from "@/types/flashsale.types";

interface BreadcrumbProps {
  filters?: ProductFilters;
  product?: ProductData;
  className?: string;
}

const Breadcrumb = ({ filters, product, className = "" }: BreadcrumbProps) => {
  const crumbs = [];

  crumbs.push({
    label: "Home",
    href: "/",
  });

  if (product) {
    if (product.gender) {
      crumbs.push({
        label: product.gender.charAt(0).toUpperCase() + product.gender.slice(1),
        href: `/products/${product.gender.toLowerCase()}`,
      });
    }

    if (product.category) {
      crumbs.push({
        label:
          product.category.charAt(0).toUpperCase() + product.category.slice(1),
        href: `/products/${product.gender.toLowerCase()}/${product.category.toLowerCase()}`,
      });
    }

    crumbs.push({
      label: product.title,
      href: "",
      current: true,
    });
  } else if (filters) {
    if (filters.gender) {
      crumbs.push({
        label: filters.gender.charAt(0).toUpperCase() + filters.gender.slice(1),
        href: `/products/${filters.gender.toLowerCase()}`,
      });
    }

    if (filters.category) {
      crumbs.push({
        label:
          filters.category.charAt(0).toUpperCase() + filters.category.slice(1),
        href: filters.gender
          ? `/products/${filters.gender.toLowerCase()}/${filters.category.toLowerCase()}`
          : `/products?category=${filters.category.toLowerCase()}`,
      });
    }
  }

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 text-sm text-gray-500">
        {crumbs.map((crumb, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="mx-1 size-4 text-gray-400" />
            )}
            <li>
              {crumb.current ? (
                <p className="font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[300px] md:max-w-[500px]">
                  {crumb.label}
                </p>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-primary transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
