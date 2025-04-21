"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import CollectionBreadcrumb from "@/components/common/CollectionBreadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollectionStore } from "@/store/collectionStore";
import { CollectionData } from "@/types/collection.types";

export default function Collections() {
  const { collections, loading, fetchCollections } = useCollectionStore();
  const [activeCollections, setActiveCollections] = useState<CollectionData[]>(
    []
  );

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    if (collections) {
      const sorted = [...collections]
        .filter((c) => c.isActive)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      setActiveCollections(sorted);
    }
  }, [collections]);

  return (
    <div className="container py-8 max-w-7xl mx-auto px-4 sm:px-6">
      <CollectionBreadcrumb />
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="w-full aspect-[3/2] rounded-lg" />
                <Skeleton className="h-8 w-2/3 mt-4" />
                <Skeleton className="h-4 w-full mt-2" />
              </div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {activeCollections.map((collection) => (
            <Link
              href={`/collections/${collection.slug}`}
              key={collection.id}
              className="group"
            >
              <div className="overflow-hidden rounded-lg bg-gray-100 aspect-[3/2] relative">
                {collection.image && (
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/20 flex items-end">
                  <div className="p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {collection.title}
                    </h3>
                    {collection.desc && (
                      <p className="text-white/90 mt-1 text-sm line-clamp-2">
                        {collection.desc}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">{collection.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  Browse →
                </Button>
              </div>
              {collection.desc && (
                <p className="text-gray-500 mt-1 line-clamp-2">
                  {collection.desc}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {!loading && activeCollections.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No collections available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
