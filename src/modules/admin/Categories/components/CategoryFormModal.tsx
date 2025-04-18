"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { z } from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCategoryStore } from "@/store/categoryStore";
import { useGenderStore } from "@/store/genderStore";
import { useUploadStore } from "@/store/uploadStore";
import { CategoryData } from "@/types/category.types";

const categoryFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  url: z.string().optional(),
  genderId: z.string().min(1, "Gender is required"),
  image: z.string().min(1, "Image is required"),
  isActive: z.boolean().default(true).optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

type CategoryFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryData | null;
};

export default function CategoryFormModal({
  open,
  onOpenChange,
  category,
}: CategoryFormModalProps) {
  const { createCategory, updateCategory } = useCategoryStore();
  const { genders, fetchGenders } = useGenderStore();
  const { uploadImage, deleteImage, loading: uploadLoading } = useUploadStore();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUrlManuallyEdited, setIsUrlManuallyEdited] = useState(false);
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);

  const isUploading = currentUploadId
    ? !!uploadLoading[currentUploadId]
    : false;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      title: "",
      url: "",
      genderId: "",
      image: "",
      isActive: true,
    },
  });

  const generateUrl = useCallback(
    (title: string, genderId: string): string => {
      if (!title || !genderId) return "";

      const slug = slugify(title, { lower: true, strict: true });
      const gender = genders.find((g) => g.id === genderId);

      if (!gender) return "";

      return `/products/${gender.title.toLowerCase()}/${slug}`;
    },
    [genders]
  );

  const updateUrl = useCallback(() => {
    if (isUrlManuallyEdited) return;

    const title = form.getValues("title");
    const genderId = form.getValues("genderId");

    if (title && genderId) {
      const url = generateUrl(title, genderId);
      form.setValue("url", url, { shouldValidate: true });
    }
  }, [form, generateUrl, isUrlManuallyEdited]);

  useEffect(() => {
    updateUrl();
    const subscription = form.watch((values, { name }) => {
      if (name === "title" || name === "genderId") {
        updateUrl();
      }
    });

    return () => subscription.unsubscribe();
  }, [form, updateUrl]);

  useEffect(() => {
    fetchGenders();
  }, [fetchGenders]);

  useEffect(() => {
    if (category) {
      form.reset({
        title: category.title,
        url: category.url || "",
        genderId: category.genderId,
        image: category.image || "",
        isActive: category.isActive,
      });

      if (category.image) {
        setPreviewImage(category.image);
      }

      const generatedUrl = generateUrl(category.title, category.genderId);
      setIsUrlManuallyEdited(category.url !== generatedUrl);
    } else {
      form.reset({
        title: "",
        url: "",
        genderId: "",
        image: "",
        isActive: true,
      });
      setPreviewImage(null);
      setIsUrlManuallyEdited(false);
    }
  }, [category, form, open, generateUrl]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Use a structured path with category ID if editing
      const categoryId = category?.id || `new-${Date.now()}`;
      const uploadPath = `categories/${categoryId}`;
      const uploadId = `category-${categoryId}`;

      setCurrentUploadId(uploadId);
      const image = await uploadImage(file, uploadPath, uploadId);

      if (image) {
        // Delete old image if it exists
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
      setCurrentUploadId(null);
    }
  };

  const removeImage = async () => {
    const currentImage = form.getValues("image");
    if (currentImage) {
      try {
        await deleteImage(currentImage);
      } catch (error) {
        console.error("Error deleting category image:", error);
      }
    }

    form.setValue("image", "", { shouldValidate: true });
    setPreviewImage(null);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUrlManuallyEdited(true);
    form.setValue("url", e.target.value);
  };

  const resetUrl = () => {
    setIsUrlManuallyEdited(false);
    updateUrl();
  };

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      const categoryData = {
        ...values,
        title:
          values.title.toLowerCase().charAt(0).toUpperCase() +
          values.title.toLowerCase().slice(1),
        url: values.url || "",
        image: values.image || "",
        slug: values.url ? values.url.split("/").pop() || "" : "",
      };

      if (category) {
        await updateCategory(category.id as string, categoryData);
      } else {
        await createCategory(categoryData);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Update this category's details. Click save when you're done."
              : "Fill in the details for the new category."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="genderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genders.map((gender) => (
                          <SelectItem
                            key={gender.id}
                            value={gender.id as string}
                          >
                            {gender.title}
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
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>URL Path</FormLabel>
                      {isUrlManuallyEdited && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={resetUrl}
                          className="h-6 px-2 text-xs"
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                    <FormControl>
                      <Input
                        placeholder="/products/gender/category-name"
                        {...field}
                        onChange={handleUrlChange}
                        className={
                          isUrlManuallyEdited ? "" : "opacity-70 bg-gray-50"
                        }
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {isUrlManuallyEdited
                        ? "Custom URL path"
                        : "Auto-generated from title and gender"}
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Image</FormLabel>
                  <FormControl>
                    <div className="">
                      <input type="hidden" {...field} />

                      {previewImage ? (
                        <div className="relative w-full h-40 border rounded-md overflow-hidden mb-2 flex items-center justify-center">
                          <Image
                            src={previewImage}
                            alt="Category preview"
                            width={3600}
                            height={4800}
                            className="object-cover aspect-square w-40"
                          />

                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full"
                            onClick={removeImage}
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
                            disabled={isUploading}
                            accept="image/*"
                          />
                          <label
                            htmlFor="image-upload"
                            className="flex flex-col items-center cursor-pointer"
                          >
                            {isUploading ? (
                              <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-2" />
                            ) : (
                              <Upload className="h-10 w-10 text-gray-400 mb-2" />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              Click to upload
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
                      When enabled, this category will be visible to customers
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isUploading}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {category ? "Save Changes" : "Create Category"}
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
