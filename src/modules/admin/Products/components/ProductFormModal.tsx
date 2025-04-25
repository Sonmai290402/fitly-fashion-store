"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, PlusCircle, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCategoryStore } from "@/store/categoryStore";
import { useCollectionStore } from "@/store/collectionStore";
import { useGenderStore } from "@/store/genderStore";
import { useProductStore } from "@/store/productStore";
import { useUploadStore } from "@/store/uploadStore";
import { ProductData } from "@/types/product.types";

import ColorInput from "./ColorInput";
import MainProductImageUploader from "./ThumbnailUploader";

const productImageSchema = z.object({
  url: z.string().min(1, "Image is required"),
  alt: z.string().optional(),
  isPrimary: z.boolean(),
});

const productSizeSchema = z.object({
  name: z.string().min(1, "Size name is required"),
  inStock: z.number().int().nonnegative("Stock cannot be negative"),
});

const productColorSchema = z.object({
  name: z.string().min(1, "Color name is required"),
  colorCode: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color code"),
  images: z.array(productImageSchema).min(1, "At least one image is required"),
  stock: z.number().int().nonnegative().optional(),
  sizes: z.array(productSizeSchema).min(1, "At least one size is required"),
});

const formSchema = z
  .object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    desc: z.string().optional(),
    price: z.coerce.number().int().positive(),
    sale_price: z.coerce.number().int().nonnegative().optional(),
    gender: z.string().min(1, "You must be select gender"),
    category: z.string().min(1, "You must be select category"),
    image: z.string().min(1, "You must upload an image"),
    totalStock: z.number().int().nonnegative().optional(),
    collections: z.array(z.string()).optional(),
    colors: z
      .array(productColorSchema)
      .min(1, "At least one color is required"),
  })
  .refine((data) => !data.sale_price || data.sale_price <= data.price, {
    message: "Sale price cannot be greater than price",
    path: ["sale_price"],
  });

type ProductFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductData | null;
};

const ProductFormModal = ({
  open,
  onOpenChange,
  product = null,
}: ProductFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemoveColor, setIsRemoveColor] = useState(false);
  const [colorToRemove, setColorToRemove] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const isSubmittingRef = useRef(false);
  const [showUnsavedChangesAlert, setShowUnsavedChangesAlert] = useState(false);
  const onChangeOpenRef = useRef(onOpenChange);

  const { createProduct, updateProduct } = useProductStore();
  const { loading } = useUploadStore();
  const { genders, fetchGenders } = useGenderStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { collections, fetchCollections } = useCollectionStore();

  const isEditMode = !!product;

  const defaultValues = useMemo(
    () => ({
      title: "",
      desc: "",
      price: 0,
      sale_price: 0,
      gender: "",
      category: "",
      image: "",
      totalStock: 0,
      collections: [],
      colors: [
        {
          name: "",
          colorCode: "#000000",
          images: [],
          stock: 0,
          sizes: [
            { name: "S", inStock: 0 },
            { name: "M", inStock: 0 },
            { name: "L", inStock: 0 },
          ],
        },
      ],
    }),
    []
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty: formIsDirty },
    reset,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "colors",
  });

  const selectedGender = watch("gender");

  useEffect(() => {
    setIsDirty(formIsDirty);
  }, [formIsDirty]);

  useEffect(() => {
    onChangeOpenRef.current = onOpenChange;
  }, [onOpenChange]);

  useEffect(() => {
    fetchGenders();
    fetchCollections();
  }, [fetchGenders, fetchCollections]);

  useEffect(() => {
    const genderId = genders.find((g) => g.title === selectedGender)?.id;
    if (genderId) {
      fetchCategories(genderId);
    }
  }, [selectedGender, fetchCategories, genders]);

  useEffect(() => {
    if (selectedGender && !isEditMode) {
      setValue("category", "");
    }
  }, [selectedGender, setValue, isEditMode]);

  useEffect(() => {
    if (open) {
      if (product) {
        const productInCollections = collections
          .filter((collection) =>
            collection.productIds?.includes(product.id as string)
          )
          .map((collection) => collection.id) as string[];

        reset({
          title: product.title || "",
          desc: product.desc || "",
          price: product.price || 0,
          sale_price: product.sale_price || 0,
          gender: product.gender || "",
          category: product.category || "",
          image: product.image || "",
          totalStock: product.totalStock || 0,
          collections: productInCollections || [],
          colors: product.colors || defaultValues.colors,
        });
      } else {
        reset(defaultValues);
      }

      setIsDirty(false);
    }
  }, [open, product, collections, reset, defaultValues]);

  const handleDialogClose = (open: boolean) => {
    if (!open && isDirty && !isSubmittingRef.current) {
      setShowUnsavedChangesAlert(true);
    } else {
      onChangeOpenRef.current(open);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const updatedColors = values.colors.map((color) => {
        const colorStock = color.sizes.reduce(
          (sum, size) => sum + (size.inStock || 0),
          0
        );
        return {
          ...color,
          stock: colorStock,
        };
      });

      const totalStock = updatedColors.reduce(
        (total, color) => total + (color.stock || 0),
        0
      );

      const productData = {
        title: values.title,
        desc: values.desc || "",
        price: values.price,
        sale_price: values.sale_price || 0,
        gender: values.gender,
        category: values.category,
        image: values.image,
        totalStock,
        colors: updatedColors,
      };

      let productId: string | null = null;

      if (isEditMode && product?.id) {
        await updateProduct(product.id, productData);
        productId = product.id;
      } else {
        const result = await createProduct(productData);
        productId = typeof result === "string" ? result : null;
      }

      if (productId) {
        const currentCollections = collections
          .filter((c) => c.productIds?.includes(productId as string))
          .map((c) => c.id as string);

        const collectionsToAdd = (values.collections || []).filter(
          (id) => !currentCollections.includes(id)
        );

        const collectionsToRemove = currentCollections.filter(
          (id) => !(values.collections || []).includes(id)
        );

        for (const collectionId of collectionsToAdd) {
          await useCollectionStore
            .getState()
            .addProductToCollection(collectionId, productId);
        }

        for (const collectionId of collectionsToRemove) {
          await useCollectionStore
            .getState()
            .removeProductFromCollection(collectionId, productId);
        }
      }

      setIsDirty(false);
      onChangeOpenRef.current(false);
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const addColor = () => {
    append({
      name: "",
      colorCode: "#000000",
      images: [{ url: "", alt: "", isPrimary: true }],
      stock: 0,
      sizes: [
        { name: "S", inStock: 0 },
        { name: "M", inStock: 0 },
        { name: "L", inStock: 0 },
      ],
    });
  };

  const handleRemoveColor = (index: number) => {
    setColorToRemove(index);
    setIsRemoveColor(true);
  };

  const confirmRemoveColor = () => {
    if (colorToRemove !== null) {
      remove(colorToRemove);
      setColorToRemove(null);
    }
    setIsRemoveColor(false);
  };

  const handleUnsavedChangesConfirm = () => {
    setShowUnsavedChangesAlert(false);
    setIsDirty(false);
    onChangeOpenRef.current(false);
  };

  const handleUnsavedChangesCancel = () => {
    setShowUnsavedChangesAlert(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {isEditMode ? "Edit Product" : "Create New Product"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5 mt-4"
            >
              <div className="space-y-5">
                <FormField
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
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
                          {...field}
                          placeholder="Product description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Price</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sale_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Sale Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Sale price"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {genders.map(({ id, title }) => (
                              <SelectItem key={id} value={title}>
                                {title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={!selectedGender}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(({ id, title }) => (
                              <SelectItem key={id} value={title}>
                                {title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel>Collections</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {collections
                      .filter((collection) => collection.isActive)
                      .map((collection) => (
                        <FormField
                          key={collection.id}
                          control={control}
                          name="collections"
                          render={({ field }) => {
                            const isChecked = field.value?.includes(
                              collection.id as string
                            );
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                <FormControl>
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([
                                          ...(field.value || []),
                                          collection.id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          field.value?.filter(
                                            (value) => value !== collection.id
                                          ) || []
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-normal">
                                    {collection.title}
                                  </FormLabel>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-4">
                          <input type="hidden" {...field} />
                          <MainProductImageUploader
                            productId={product?.id || "new"}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="mt-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">Colors and Images</h3>
                  </div>

                  {errors.colors?.message && (
                    <p className="text-sm text-red-500 mb-2">
                      {errors.colors.message}
                    </p>
                  )}

                  {fields.map((field, index) => (
                    <div key={field.id} className="relative">
                      <div className="flex justify-between items-center my-5">
                        <h4 className="text-sm font-medium">
                          Color #{index + 1}
                        </h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveColor(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-accent flex items-center text-sm mr-0 px-2"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove Color
                          </Button>
                        )}
                      </div>
                      <ColorInput nestIndex={index} />
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={addColor}
                    className="mt-4 flex flex-col justify-center items-center w-full h-full"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Color
                  </Button>
                </div>
              </div>

              <DialogFooter className="mt-6 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading["mainImage"] || isSubmitting}
                  variant="default"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin mr-2" />
                      {isEditMode ? "Saving..." : "Creating..."}
                    </>
                  ) : isEditMode ? (
                    "Save"
                  ) : (
                    "Create Product"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isRemoveColor} onOpenChange={setIsRemoveColor}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected color variant from your product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsRemoveColor(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmRemoveColor}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showUnsavedChangesAlert}
        onOpenChange={setShowUnsavedChangesAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without
              saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleUnsavedChangesCancel}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleUnsavedChangesConfirm}
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductFormModal;
