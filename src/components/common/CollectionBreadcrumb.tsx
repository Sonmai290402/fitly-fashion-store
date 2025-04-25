import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { Fragment } from "react";

import { CollectionData } from "@/types/collection.types";
import { ProductData } from "@/types/product.types";

interface CollectionBreadcrumbProps {
  collection?: CollectionData | null;
  product?: ProductData | null;
  className?: string;
}

const CollectionBreadcrumb = ({
  collection,
  product,
  className = "",
}: CollectionBreadcrumbProps) => {
  const crumbs = [];

  crumbs.push({
    label: "Home",
    href: "/",
  });

  crumbs.push({
    label: "Collections",
    href: "/collections",
  });

  if (collection) {
    crumbs.push({
      label: collection.title,
      href: `/collections/${collection.slug}`,
      current: !product,
    });
  }

  if (product && collection) {
    crumbs.push({
      label: product.title,
      href: `/product/${product.id}`,
      current: true,
    });
  }

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap space-x-1 text-sm text-gray-500">
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

export default CollectionBreadcrumb;
