"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Save, Search, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  const [isUrlManuallyEdited, setIsUrlManuallyEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<ProductData[]>([]);
  const [productSheetOpen, setProductSheetOpen] = useState(false);
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
      if (name === "title" && !isUrlManuallyEdited) {
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
  }, [form, isUrlManuallyEdited]);

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
    setIsUrlManuallyEdited(false);
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
      // Use a structured path specific to collections with ID if editing
      const collectionId = collection?.id || `new-${Date.now()}`;
      const uploadPath = `collections/${collectionId}`;
      const uploadId = `collection-${collectionId}`;

      const image = await uploadImage(file, uploadPath, uploadId);

      if (image) {
        // Delete old image if exists
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

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUrlManuallyEdited(true);
    const newSlug = e.target.value;
    form.setValue("slug", newSlug, { shouldValidate: true });
    form.setValue("url", `/collections/${newSlug}`, { shouldValidate: true });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUrlManuallyEdited(true);
    form.setValue("url", e.target.value, { shouldValidate: true });
  };

  const resetSlug = () => {
    setIsUrlManuallyEdited(false);
    const title = form.getValues("title");
    if (title) {
      const slug = slugify(title, { lower: true, strict: true });
      form.setValue("slug", slug, { shouldValidate: true });
      form.setValue("url", `/collections/${slug}`, { shouldValidate: true });
    }
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

  const removeProduct = (productId: string) => {
    const currentProductIds = form.getValues("productIds") || [];
    const newProductIds = currentProductIds.filter((id) => id !== productId);
    const newSelectedProducts = selectedProducts.filter(
      (p) => p.id !== productId
    );

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

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Slug</FormLabel>
                    {isUrlManuallyEdited && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={resetSlug}
                        className="h-6 px-2 text-xs"
                        disabled={isFormDisabled}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <FormControl>
                    <Input
                      placeholder="collection-slug"
                      {...field}
                      onChange={handleSlugChange}
                      disabled={isFormDisabled}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {isUrlManuallyEdited
                      ? "Custom slug"
                      : "Auto-generated from title"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="/collections/collection-slug"
                      {...field}
                      onChange={handleUrlChange}
                      disabled={isFormDisabled}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {isUrlManuallyEdited
                      ? "Custom URL"
                      : "Auto-generated from slug"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {/* Products Selection */}
            <FormField
              control={form.control}
              name="productIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Products</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2 min-h-10">
                      {selectedProducts.length > 0 ? (
                        selectedProducts.map((product) => (
                          <Badge
                            key={product.id}
                            variant="secondary"
                            className="flex items-center gap-1 pl-2"
                          >
                            {product.title}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                              onClick={() =>
                                removeProduct(product.id as string)
                              }
                              disabled={isFormDisabled}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No products selected
                        </div>
                      )}
                    </div>

                    {/* Product Selection Dialog */}
                    <Sheet
                      open={productSheetOpen}
                      onOpenChange={setProductSheetOpen}
                    >
                      <SheetTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          disabled={isFormDisabled || productsLoading}
                        >
                          {productsLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="mr-2 h-4 w-4" />
                          )}
                          Select Products
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="right"
                        className="w-[85%] sm:w-[600px] px-5 py-2"
                      >
                        <SheetHeader>
                          <SheetTitle>Select Products</SheetTitle>
                          <SheetDescription>
                            Choose the products you want to include in this
                            collection
                          </SheetDescription>
                        </SheetHeader>

                        <div className="py-4">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search products by name or category..."
                              className="pl-8"
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                            />
                          </div>
                        </div>

                        <ScrollArea className="h-[500px] rounded-md border">
                          <div className="p-4">
                            {productsLoading ? (
                              <div className="flex items-center justify-center h-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            ) : products.length === 0 ? (
                              <div className="flex items-center justify-center h-20 text-muted-foreground">
                                No products found
                              </div>
                            ) : filteredProducts.length === 0 ? (
                              <div className="flex items-center justify-center h-20 text-muted-foreground">
                                No products match your search
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-2">
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
                                      <div className="relative size-12 rounded-md overflow-hidden mr-3">
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
                                              product.sale_price ||
                                                product.price
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
                          </div>
                        </ScrollArea>

                        <div className="mt-4 flex justify-end">
                          <Button
                            type="button"
                            onClick={() => setProductSheetOpen(false)}
                          >
                            Done
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                  <input
                    type="hidden"
                    name={field.name}
                    onChange={(e) => {
                      field.onChange(
                        e.target.value ? e.target.value.split(",") : []
                      );
                    }}
                    value={field.value?.join(",") || ""}
                  />
                  <FormDescription>
                    {selectedProducts.length} product
                    {selectedProducts.length !== 1 ? "s" : ""} selected
                  </FormDescription>
                  <FormMessage />
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
                    {collection ? "Save Changes" : "Create Collection"}
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
