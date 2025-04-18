"use client";

import React, { useEffect } from "react";

import { useCollectionStore } from "@/store/collectionStore";

import CollectionBanner from "./CollectionBanner";
import CollectionSwiper from "./CollectionSwiper";

const Collection = () => {
  const { collections, fetchCollections } = useCollectionStore();
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);
  const activeCollections = collections.filter(
    (c) => c.isActive && c.productIds.length > 0
  );

  return (
    <>
      {activeCollections.length > 0 && (
        <div className="flex flex-col gap-5">
          {activeCollections.map((collection) => (
            <div key={collection.id}>
              <CollectionBanner collection={collection} />
              <CollectionSwiper collection={collection} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Collection;
