"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Save, Search, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCollectionStore } from "@/store/collectionStore";
import { useProductStore } from "@/store/productStore";
import { useUploadStore } from "@/store/uploadStore";
import { CollectionData } from "@/types/collection.types";
import { ProductData } from "@/types/product.types";
import { formatCurrency } from "@/utils/formatCurrency";

const collectionFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  url: z.string().min(1, "URL is required"),
  desc: z.string().optional(),
  image: z.string().min(1, "Image is required"),
  isActive: z.boolean(),
  order: z.coerce.number().int().nonnegative().optional(),
  productIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof collectionFormSchema>;

type CollectionFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: CollectionData | null;
};

export default function CollectionFormModal({
  open,
  onOpenChange,
  collection,
}: CollectionFormModalProps) {
  const { createCollection, updateCollection } = useCollectionStore();
  const {
    products,
    loading: productsLoading,
    fetchProducts,
  } = useProductStore();
  const { uploadImage, deleteImage, loading: uploadLoading } = useUploadStore();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<ProductData[]>([]);
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (typeof uploadLoading === "boolean") {
      setIsImageUploading(uploadLoading);
    } else if (uploadLoading && Object.keys(uploadLoading).length > 0) {
      setIsImageUploading(Object.values(uploadLoading).some(Boolean));
    } else {
      setIsImageUploading(false);
    }
  }, [uploadLoading]);

  const form = useForm<FormValues>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      url: "",
      desc: "",
      image: "",
      isActive: true,
      order: 0,
      productIds: [],
    },
  });

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open, fetchProducts]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "title") {
        const title = form.getValues("title");
        if (title) {
          const slug = slugify(title, { lower: true, strict: true });
          const url = `/collections/${slug}`;
          form.setValue("slug", slug, { shouldValidate: true });
          form.setValue("url", url, { shouldValidate: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (collection) {
      const url = collection.url || `/collections/${collection.slug}`;
      const productIds = collection.productIds || [];

      form.reset({
        title: collection.title,
        slug: collection.slug,
        url: url,
        desc: collection.desc || "",
        image: collection.image || "",
        isActive: collection.isActive,
        order: collection.order || 0,
        productIds: productIds,
      });

      const collectionProducts = products.filter((p) =>
        productIds.includes(p.id as string)
      );
      setSelectedProducts(collectionProducts);

      if (collection.image) {
        setPreviewImage(collection.image);
      }
    } else {
      form.reset({
        title: "",
        slug: "",
        url: "",
        desc: "",
        image: "",
        isActive: true,
        order: 0,
        productIds: [],
      });
      setPreviewImage(null);
      setSelectedProducts([]);
    }
    setProductSearch("");
  }, [collection, form, open, products]);

  const filteredProducts = products.filter((product) => {
    if (!productSearch) return true;

    return (
      product.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.category?.toLowerCase().includes(productSearch.toLowerCase())
    );
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImageUploading(true);
      const collectionId = collection?.id || `new-${Date.now()}`;
      const uploadPath = `collections/${collectionId}`;
      const uploadId = `collection-${collectionId}`;

      const image = await uploadImage(file, uploadPath, uploadId);

      if (image) {
        const currentImage = form.getValues("image");
        if (currentImage && currentImage !== image) {
          await deleteImage(currentImage);
        }

        form.setValue("image", image, { shouldValidate: true });
        setPreviewImage(image);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsImageUploading(false);
    }
  };

  const removeImage = async () => {
    const currentImage = form.getValues("image");
    if (currentImage) {
      try {
        await deleteImage(currentImage);
      } catch (error) {
        console.error("Error deleting collection image:", error);
      }
    }

    form.setValue("image", "", { shouldValidate: true });
    setPreviewImage(null);
  };

  const toggleProduct = (product: ProductData) => {
    const productId = product.id as string;
    const currentProductIds = form.getValues("productIds") || [];
    let newProductIds: string[];
    let newSelectedProducts: ProductData[];

    if (currentProductIds.includes(productId)) {
      newProductIds = currentProductIds.filter((id) => id !== productId);
      newSelectedProducts = selectedProducts.filter((p) => p.id !== productId);
    } else {
      newProductIds = [...currentProductIds, productId];
      newSelectedProducts = [...selectedProducts, product];
    }

    form.setValue("productIds", newProductIds, { shouldValidate: true });
    setSelectedProducts(newSelectedProducts);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const collectionData = {
        title:
          values.title.toLowerCase().charAt(0).toUpperCase() +
          values.title.toLowerCase().slice(1),
        slug: values.slug,
        url: values.url,
        desc: values.desc || "",
        image: values.image || "",
        isActive: values.isActive,
        order: values.order || 0,
        productIds: values.productIds || [],
      };

      if (collection) {
        await updateCollection(collection.id as string, collectionData);
      } else {
        await createCollection(collectionData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving collection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || isImageUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {collection ? "Edit Collection" : "Create Collection"}
          </DialogTitle>
          <DialogDescription>
            {collection
              ? "Update this collection's details. Click save when you're done."
              : "Fill in the details for the new collection."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Collection name"
                      {...field}
                      disabled={isFormDisabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden fields for slug and URL */}
            <input type="hidden" {...form.register("slug")} />
            <input type="hidden" {...form.register("url")} />

            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the collection"
                      {...field}
                      value={field.value || ""}
                      disabled={isFormDisabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      disabled={isFormDisabled}
                    />
                  </FormControl>
                  <FormDescription>Lower numbers appear first</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Products</FormLabel>
                  <FormControl>
                    <Collapsible
                      open={productSelectorOpen}
                      onOpenChange={setProductSelectorOpen}
                      className="w-full"
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between"
                          disabled={isFormDisabled || productsLoading}
                        >
                          <div className="flex items-center">
                            <Search className="mr-2 h-4 w-4" />
                            Select Products ({selectedProducts.length})
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {selectedProducts.length > 0
                              ? `${selectedProducts.length} product${
                                  selectedProducts.length !== 1 ? "s" : ""
                                } selected`
                              : "No products selected"}
                          </span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 border rounded-md p-2">
                        <div className="relative mb-2">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search products..."
                            className="pl-8"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                          />
                        </div>

                        <ScrollArea className="h-[250px]">
                          {productsLoading ? (
                            <div className="flex items-center justify-center h-20">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          ) : filteredProducts.length === 0 ? (
                            <div className="flex items-center justify-center h-20 text-muted-foreground">
                              No products found
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {filteredProducts.map((product) => {
                                const isSelected = field.value?.includes(
                                  product.id as string
                                );
                                return (
                                  <div
                                    key={product.id}
                                    className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-accent ${
                                      isSelected ? "bg-accent" : ""
                                    }`}
                                    onClick={() => toggleProduct(product)}
                                  >
                                    <div className="relative size-8 rounded-md overflow-hidden mr-3">
                                      <Image
                                        src={
                                          product.image ||
                                          "/placeholder-image.png"
                                        }
                                        alt={product.title || ""}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {product.title}
                                      </p>
                                      <div className="text-xs text-muted-foreground">
                                        <span className="mr-2">
                                          {product.category}
                                        </span>
                                        <span>
                                          {formatCurrency(
                                            product.sale_price || product.price
                                          )}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex-shrink-0 ml-2">
                                      <div
                                        className={`size-5 rounded-full border flex items-center justify-center
                                          ${
                                            isSelected
                                              ? "bg-primary border-transparent"
                                              : "border-gray-300"
                                          }`}
                                      >
                                        {isSelected && (
                                          <Check className="h-3 w-3 text-primary-foreground" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </ScrollArea>

                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            {selectedProducts.length} of {products.length}{" "}
                            products selected
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="default"
                            onClick={() => setProductSelectorOpen(false)}
                          >
                            Done
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </FormControl>
                  <FormMessage />
                  <input
                    type="hidden"
                    name={field.name}
                    value={field.value?.join(",") || ""}
                    onChange={(e) => {
                      field.onChange(
                        e.target.value ? e.target.value.split(",") : []
                      );
                    }}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Image</FormLabel>
                  <FormControl>
                    <div>
                      <input type="hidden" {...field} />

                      {previewImage ? (
                        <div className="relative w-full h-40 border rounded-md overflow-hidden mb-2">
                          <Image
                            src={previewImage}
                            alt="Collection preview"
                            fill
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full"
                            onClick={removeImage}
                            disabled={isFormDisabled}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                          <input
                            type="file"
                            id="image-upload"
                            className="sr-only"
                            onChange={handleImageUpload}
                            accept="image/*"
                            disabled={isFormDisabled}
                          />
                          <label
                            htmlFor="image-upload"
                            className={`flex flex-col items-center ${
                              isFormDisabled
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                            }`}
                          >
                            {isImageUploading ? (
                              <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-2" />
                            ) : (
                              <Upload className="h-10 w-10 text-gray-400 mb-2" />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {isImageUploading
                                ? "Uploading..."
                                : "Click to upload"}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              PNG, JPG or WebP
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      When enabled, this collection will be visible to customers
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isFormDisabled}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isFormDisabled}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isFormDisabled}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {collection ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {collection ? "Save" : "Create Collection"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
