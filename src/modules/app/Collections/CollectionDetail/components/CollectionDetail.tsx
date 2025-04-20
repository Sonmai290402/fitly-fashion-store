"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import CollectionBreadcrumb from "@/components/breadcrumb/CollectionBreadcrumb";
import { useCollectionStore } from "@/store/collectionStore";
import { ProductData } from "@/types/product.types";

import CollectionGrid from "./CollectionGrid";

const CollectionDetail = () => {
  const { slug } = useParams();
  const {
    getCollectionBySlug,
    getProductsByCollection,
    loading,
    activeCollection,
  } = useCollectionStore();

  const [products, setProducts] = useState<ProductData[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setProductsLoading(true);

        const collection = await getCollectionBySlug(slug as string);
        if (!collection?.id) {
          setError("Collection not found");
          return;
        }

        const products = await getProductsByCollection(collection.id);
        setProducts(products);
      } catch (err) {
        console.log(" fetch ~ err:", err);
        setError("Something went wrong while loading the collection");
      } finally {
        setProductsLoading(false);
      }
    };

    fetch();
  }, [slug, getCollectionBySlug, getProductsByCollection]);

  if (loading || productsLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-gray-600">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    );
  }

  if (!activeCollection || !activeCollection.isActive) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold">Collection not found</h1>
        <p className="mt-2 text-gray-600">
          The collection you are looking for does not exist or is not active.
        </p>
      </div>
    );
  }

  return (
    <main className="container py-8">
      <CollectionBreadcrumb collection={activeCollection} className="mb-6" />

      <div className="mt-8">
        <CollectionGrid
          products={products}
          collectionTitle={activeCollection.title}
        />
      </div>
    </main>
  );
};

export default CollectionDetail;
