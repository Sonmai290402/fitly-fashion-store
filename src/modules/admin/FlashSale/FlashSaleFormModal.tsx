"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, addHours, addMinutes, format } from "date-fns";
import {
  CalendarIcon,
  Check,
  Clock,
  Loader2,
  Save,
  Search,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateTimePicker } from "@/components/ui/date-time-picker";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useFlashSaleStore } from "@/store/flashSaleStore";
import { useProductStore } from "@/store/productStore";
import { useUploadStore } from "@/store/uploadStore";
import { FlashSaleData, ProductData } from "@/types/flashsale.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDuration } from "@/utils/formatDate";

const flashSaleFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce
    .number()
    .positive("Discount must be greater than zero"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  durationMode: z.enum(["calendar", "preset"]).optional(),
  durationPreset: z.string().optional(),
  bannerImage: z.string().optional(),
  isActive: z.boolean({ required_error: "Active status is required" }),
  badgeText: z.string().optional(),
  badgeColor: z.string().optional(),
  featuredOrder: z.coerce.number().int().nonnegative().optional(),
  productIds: z.array(z.string()).optional(),
});

// Refine the schema to validate that end date is after start date
const flashSaleSchema = flashSaleFormSchema
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      if (data.discountType === "percentage") {
        return data.discountValue <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    }
  );

type FormValues = z.infer<typeof flashSaleSchema>;

interface FlashSaleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashSale: FlashSaleData | null;
}

// Preset duration options
const durationPresets = [
  {
    value: "15m",
    label: "15 Minutes",
    fn: (start: Date) => addMinutes(start, 15),
  },
  {
    value: "30m",
    label: "30 Minutes",
    fn: (start: Date) => addMinutes(start, 30),
  },
  { value: "1h", label: "1 Hour", fn: (start: Date) => addHours(start, 1) },
  { value: "3h", label: "3 Hours", fn: (start: Date) => addHours(start, 3) },
  { value: "6h", label: "6 Hours", fn: (start: Date) => addHours(start, 6) },
  { value: "12h", label: "12 Hours", fn: (start: Date) => addHours(start, 12) },
  { value: "24h", label: "24 Hours", fn: (start: Date) => addHours(start, 24) },
  { value: "2d", label: "2 Days", fn: (start: Date) => addDays(start, 2) },
  { value: "3d", label: "3 Days", fn: (start: Date) => addDays(start, 3) },
  { value: "7d", label: "7 Days", fn: (start: Date) => addDays(start, 7) },
  { value: "14d", label: "14 Days", fn: (start: Date) => addDays(start, 14) },
  { value: "30d", label: "30 Days", fn: (start: Date) => addDays(start, 30) },
];

export default function FlashSaleFormModal({
  open,
  onOpenChange,
  flashSale,
}: FlashSaleFormModalProps) {
  const { createFlashSale, updateFlashSale } = useFlashSaleStore();
  const {
    products,
    loading: productsLoading,
    fetchProducts,
  } = useProductStore();
  const { uploadImage, loading: uploadLoading } = useUploadStore();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<ProductData[]>([]);
  const [productSheetOpen, setProductSheetOpen] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [durationMode, setDurationMode] = useState<"calendar" | "preset">(
    "calendar"
  );

  const isEditMode = !!flashSale;

  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(flashSaleSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      discountType: "percentage",
      discountValue: 10,
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      durationMode: "calendar",
      durationPreset: "24h",
      bannerImage: "",
      isActive: true,
      badgeText: "",
      badgeColor: "#FF0000",
      featuredOrder: 0,
      productIds: [],
    },
  });

  // Monitor upload loading state
  useEffect(() => {
    if (typeof uploadLoading === "boolean") {
      setIsImageUploading(uploadLoading);
    } else if (uploadLoading && Object.keys(uploadLoading).length > 0) {
      setIsImageUploading(Object.values(uploadLoading).some(Boolean));
    } else {
      setIsImageUploading(false);
    }
  }, [uploadLoading]);

  // Fetch products
  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open, fetchProducts]);

  // Auto-generate slug when title changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "title" && !isSlugManuallyEdited) {
        const title = form.getValues("title");
        if (title) {
          const slug = slugify(title, { lower: true, strict: true });
          form.setValue("slug", slug, { shouldValidate: true });
        }
      }

      if (name === "discountType" || name === "discountValue") {
        const type = form.getValues("discountType");
        const value = form.getValues("discountValue");

        if (type && value) {
          let badgeText = "";
          if (type === "percentage") {
            badgeText = `${value}% OFF`;
          } else {
            badgeText = `${formatCurrency(value)} OFF`;
          }

          form.setValue("badgeText", badgeText);
        }
      }

      // Update end date when duration preset changes
      if (name === "durationPreset" && durationMode === "preset") {
        const preset = form.getValues("durationPreset");
        const startDate = form.getValues("startDate") || new Date();
        const presetOption = durationPresets.find((p) => p.value === preset);

        if (presetOption) {
          const newEndDate = presetOption.fn(startDate);
          form.setValue("endDate", newEndDate, { shouldValidate: true });
        }
      }

      // Update end date when start date changes in preset mode
      if (name === "startDate" && durationMode === "preset") {
        const preset = form.getValues("durationPreset");
        const startDate = form.getValues("startDate") || new Date();
        const presetOption = durationPresets.find((p) => p.value === preset);

        if (presetOption) {
          const newEndDate = presetOption.fn(startDate);
          form.setValue("endDate", newEndDate, { shouldValidate: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, isSlugManuallyEdited, durationMode]);

  // Reset form when flash sale changes
  useEffect(() => {
    if (flashSale) {
      const startDate = new Date(flashSale.startDate);
      const endDate = new Date(flashSale.endDate);

      form.reset({
        title: flashSale.title,
        slug: flashSale.slug,
        description: flashSale.description || "",
        discountType: flashSale.discountType,
        discountValue: flashSale.discountValue,
        startDate,
        endDate,
        durationMode: "calendar",
        durationPreset: "24h", // Default, will be recalculated
        bannerImage: flashSale.bannerImage || "",
        isActive: flashSale.isActive,
        badgeText: flashSale.badgeText || "",
        badgeColor: flashSale.badgeColor || "#FF0000",
        featuredOrder: flashSale.featuredOrder || 0,
        productIds: flashSale.productIds || [],
      });

      // Calculate and set appropriate duration mode and preset
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationHours = Math.round(durationMs / (60 * 60 * 1000));

      // Find closest preset
      const hourBasedPresets = [
        0.25, 0.5, 1, 3, 6, 12, 24, 48, 72, 168, 336, 720,
      ];
      const closestPresetHours = hourBasedPresets.reduce((prev, curr) =>
        Math.abs(curr - durationHours) < Math.abs(prev - durationHours)
          ? curr
          : prev
      );

      let presetValue = "24h";
      switch (closestPresetHours) {
        case 0.25:
          presetValue = "15m";
          break;
        case 0.5:
          presetValue = "30m";
          break;
        case 1:
          presetValue = "1h";
          break;
        case 3:
          presetValue = "3h";
          break;
        case 6:
          presetValue = "6h";
          break;
        case 12:
          presetValue = "12h";
          break;
        case 24:
          presetValue = "24h";
          break;
        case 48:
          presetValue = "2d";
          break;
        case 72:
          presetValue = "3d";
          break;
        case 168:
          presetValue = "7d";
          break;
        case 336:
          presetValue = "14d";
          break;
        case 720:
          presetValue = "30d";
          break;
      }

      // If there's an exact match with a preset, set preset mode
      if (Math.abs(durationHours - closestPresetHours) < 0.1) {
        setDurationMode("preset");
        form.setValue("durationMode", "preset");
        form.setValue("durationPreset", presetValue);
      } else {
        setDurationMode("calendar");
        form.setValue("durationMode", "calendar");
      }

      // Set selected products
      const flashSaleProducts = products.filter((p) =>
        flashSale.productIds?.includes(p.id as string)
      );
      setSelectedProducts(flashSaleProducts);

      if (flashSale.bannerImage) {
        setPreviewImage(flashSale.bannerImage);
      }
    } else {
      form.reset({
        title: "",
        slug: "",
        description: "",
        discountType: "percentage",
        discountValue: 10,
        startDate: new Date(),
        endDate: addDays(new Date(), 7),
        durationMode: "calendar",
        durationPreset: "24h",
        bannerImage: "",
        isActive: true,
        badgeText: "10% OFF",
        badgeColor: "#FF0000",
        featuredOrder: 0,
        productIds: [],
      });
      setPreviewImage(null);
      setSelectedProducts([]);
      setDurationMode("calendar");
    }
    setIsSlugManuallyEdited(false);
  }, [flashSale, form, open, products]);

  // Handler for changing duration mode
  const handleDurationModeChange = (newMode: string) => {
    setDurationMode(newMode as "calendar" | "preset");
    form.setValue("durationMode", newMode as "calendar" | "preset");

    if (newMode === "preset") {
      // Update end date based on selected preset
      const preset = form.getValues("durationPreset") || "24h";
      const startDate = form.getValues("startDate") || new Date();
      const presetOption = durationPresets.find((p) => p.value === preset);

      if (presetOption) {
        const newEndDate = presetOption.fn(startDate);
        form.setValue("endDate", newEndDate, { shouldValidate: true });
      }
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter((product) => {
    if (!productSearch) return true;

    return (
      product.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.category?.toLowerCase().includes(productSearch.toLowerCase())
    );
  });

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImageUploading(true);
      const uploadId = `flashSales/${Date.now()}`;
      const image = await uploadImage(file, uploadId);

      if (image) {
        form.setValue("bannerImage", image, { shouldValidate: true });
        setPreviewImage(image);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsImageUploading(false);
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    form.setValue("bannerImage", "", { shouldValidate: true });
    setPreviewImage(null);
  };

  // Handle slug change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    form.setValue("slug", e.target.value, { shouldValidate: true });
  };

  // Reset slug to auto-generated value
  const resetSlug = () => {
    setIsSlugManuallyEdited(false);
    const title = form.getValues("title");
    if (title) {
      const slug = slugify(title, { lower: true, strict: true });
      form.setValue("slug", slug, { shouldValidate: true });
    }
  };

  // Toggle product selection
  const toggleProduct = (product: ProductData) => {
    const productId = product.id as string;
    const currentProductIds = form.getValues("productIds") || [];
    let newProductIds: string[];
    let newSelectedProducts: ProductData[];

    if (currentProductIds.includes(productId)) {
      // Remove product
      newProductIds = currentProductIds.filter((id) => id !== productId);
      newSelectedProducts = selectedProducts.filter((p) => p.id !== productId);
    } else {
      // Add product
      newProductIds = [...currentProductIds, productId];
      newSelectedProducts = [...selectedProducts, product];
    }

    form.setValue("productIds", newProductIds, { shouldValidate: true });
    setSelectedProducts(newSelectedProducts);
  };

  // Remove a product from selection
  const removeProduct = (productId: string) => {
    const currentProductIds = form.getValues("productIds") || [];
    const newProductIds = currentProductIds.filter((id) => id !== productId);
    const newSelectedProducts = selectedProducts.filter(
      (p) => p.id !== productId
    );

    form.setValue("productIds", newProductIds, { shouldValidate: true });
    setSelectedProducts(newSelectedProducts);
  };

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const flashSaleData = {
        title: values.title,
        slug: values.slug,
        description: values.description,
        discountType: values.discountType,
        discountValue: values.discountValue,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        bannerImage: values.bannerImage,
        isActive: values.isActive,
        badgeText: values.badgeText,
        badgeColor: values.badgeColor,
        featuredOrder: values.featuredOrder,
        productIds: values.productIds,
      };

      if (isEditMode && flashSale?.id) {
        await updateFlashSale(flashSale.id, flashSaleData);
      } else {
        await createFlashSale(flashSaleData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving flash sale:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || isImageUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Flash Sale" : "Create Flash Sale"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update this flash sale's details. Click save when you're done."
              : "Fill in the details for the new flash sale."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Summer Flash Sale"
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
                      {isSlugManuallyEdited && (
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
                        placeholder="summer-flash-sale"
                        {...field}
                        onChange={handleSlugChange}
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {isSlugManuallyEdited
                        ? "Custom slug"
                        : "Auto-generated from title"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Limited time offers on our best products"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                      disabled={isFormDisabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Discount Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        className="flex flex-col space-y-1"
                        disabled={isFormDisabled}
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="percentage" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Percentage (%)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="fixed" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Fixed Amount
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.getValues("discountType") === "percentage"
                        ? "Discount Percentage"
                        : "Discount Amount"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step={
                            form.getValues("discountType") === "fixed"
                              ? "0.01"
                              : "1"
                          }
                          min="0"
                          max={
                            form.getValues("discountType") === "percentage"
                              ? "100"
                              : undefined
                          }
                          className="pl-8"
                          {...field}
                          disabled={isFormDisabled}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500">
                            {form.getValues("discountType") === "percentage"
                              ? "%"
                              : "$"}
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {form.getValues("discountType") === "percentage"
                        ? "Enter a percentage between 1-100"
                        : "Enter the fixed discount amount"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Improved Time Selection Section */}
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Sale Duration</h3>

              <Tabs
                value={durationMode}
                onValueChange={handleDurationModeChange}
              >
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="preset" className="flex-1">
                    <Clock className="w-4 h-4 mr-1" /> Quick Duration
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex-1">
                    <CalendarIcon className="w-4 h-4 mr-1" /> Custom Calendar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preset" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <DateTimePicker
                              date={field.value}
                              setDate={(date) => {
                                field.onChange(date);

                                if (durationMode === "preset") {
                                  const preset =
                                    form.getValues("durationPreset") || "24h";
                                  const presetOption = durationPresets.find(
                                    (p) => p.value === preset
                                  );

                                  if (presetOption) {
                                    const newEndDate = presetOption.fn(
                                      new Date(date)
                                    );
                                    form.setValue("endDate", newEndDate, {
                                      shouldValidate: true,
                                    });
                                  }
                                }
                              }}
                              disabled={isFormDisabled}
                              disablePastDates={true}
                            />
                          </FormControl>
                          <FormDescription>
                            When the sale will start
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="durationPreset"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale Duration</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);

                              // Update end date based on selected preset
                              const startDate =
                                form.getValues("startDate") || new Date();
                              const presetOption = durationPresets.find(
                                (p) => p.value === value
                              );

                              if (presetOption) {
                                const newEndDate = presetOption.fn(
                                  new Date(startDate)
                                );
                                form.setValue("endDate", newEndDate, {
                                  shouldValidate: true,
                                });
                              }
                            }}
                            defaultValue={field.value}
                            value={field.value}
                            disabled={isFormDisabled}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="15m">15 Minutes</SelectItem>
                              <SelectItem value="30m">30 Minutes</SelectItem>
                              <SelectItem value="1h">1 Hour</SelectItem>
                              <SelectItem value="3h">3 Hours</SelectItem>
                              <SelectItem value="6h">6 Hours</SelectItem>
                              <SelectItem value="12h">12 Hours</SelectItem>
                              <SelectItem value="24h">24 Hours</SelectItem>
                              <SelectItem value="2d">2 Days</SelectItem>
                              <SelectItem value="3d">3 Days</SelectItem>
                              <SelectItem value="7d">7 Days</SelectItem>
                              <SelectItem value="14d">14 Days</SelectItem>
                              <SelectItem value="30d">30 Days</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How long the sale will run for
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">End time: </span>
                      {format(
                        form.getValues("endDate") || addDays(new Date(), 1),
                        "PPP HH:mm"
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Calendar Selection Tab */}
                <TabsContent value="calendar" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date & Time</FormLabel>
                          <FormControl>
                            <DateTimePicker
                              date={field.value}
                              setDate={field.onChange}
                              disabled={isFormDisabled}
                              disablePastDates={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date & Time</FormLabel>
                          <FormControl>
                            <DateTimePicker
                              date={field.value}
                              setDate={field.onChange}
                              disabled={isFormDisabled}
                              minDate={form.getValues("startDate")}
                            />
                          </FormControl>
                          <FormDescription>
                            Must be after the start date
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Calendar Selection Tab */}
                <TabsContent value="calendar" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date & Time</FormLabel>
                          <div className="flex flex-col gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={isFormDisabled}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    if (!date) return;

                                    // Create a new date object to avoid mutation
                                    const newDate = new Date(date.getTime());
                                    const currentTime =
                                      field.value || new Date();

                                    // Preserve the time
                                    newDate.setHours(
                                      currentTime.getHours(),
                                      currentTime.getMinutes(),
                                      0,
                                      0
                                    );

                                    field.onChange(newDate);
                                  }}
                                  // Allow selecting today and future dates
                                  disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return date < today;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>

                            {/* Time selection remains the same but with parseInt fixes */}
                            <div className="flex gap-2">
                              <Select
                                value={format(field.value || new Date(), "HH")}
                                onValueChange={(hour) => {
                                  const newDate = new Date(
                                    field.value || new Date()
                                  );
                                  newDate.setHours(parseInt(hour, 10));
                                  field.onChange(newDate);
                                }}
                                disabled={isFormDisabled}
                              >
                                {/* Select options */}
                              </Select>

                              {/* Minutes selector */}
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date & Time</FormLabel>
                          <div className="flex flex-col gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={isFormDisabled}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    if (!date) return;

                                    // Create a new date object to avoid mutation
                                    const newDate = new Date(date.getTime());
                                    const currentTime =
                                      field.value || new Date();

                                    // Preserve the time
                                    newDate.setHours(
                                      currentTime.getHours(),
                                      currentTime.getMinutes(),
                                      0,
                                      0
                                    );

                                    field.onChange(newDate);
                                  }}
                                  // Only disable dates before the start date
                                  disabled={(date) => {
                                    const startDate = new Date(
                                      form.getValues("startDate")
                                    );
                                    startDate.setHours(0, 0, 0, 0);
                                    return date < startDate;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>

                            {/* Time selection remains the same but with parseInt fixes */}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
                <p className="font-medium">Sale Duration Summary:</p>
                <div className="flex justify-between items-center mt-1 text-muted-foreground">
                  <span>
                    From:{" "}
                    {format(
                      form.getValues("startDate") || new Date(),
                      "MMM d, yyyy HH:mm"
                    )}
                  </span>
                  <span>
                    To:{" "}
                    {format(
                      form.getValues("endDate") || addDays(new Date(), 1),
                      "MMM d, yyyy HH:mm"
                    )}
                  </span>
                </div>
                <div className="mt-1 text-center font-medium text-primary">
                  {(() => {
                    const startDate = form.getValues("startDate") || new Date();
                    const endDate =
                      form.getValues("endDate") || addDays(new Date(), 1);
                    return formatDuration(startDate, endDate);
                  })()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="badgeText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge Text</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SALE!"
                        {...field}
                        value={field.value || ""}
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormDescription>
                      Text displayed on product badges (e.g., &ldquo;25%
                      OFF&rdquo;)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="badgeColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge Color</FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Input
                          type="color"
                          className="w-12 p-1 h-10"
                          {...field}
                          value={field.value || "#FF0000"}
                          disabled={isFormDisabled}
                        />
                        <Input
                          type="text"
                          placeholder="#FF0000"
                          {...field}
                          value={field.value || ""}
                          disabled={isFormDisabled}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="featuredOrder"
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
                    <FormDescription>
                      Lower numbers appear first in featured sections
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-6">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        When enabled, this flash sale will be visible to
                        customers during its scheduled time
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
            </div>

            <FormField
              control={form.control}
              name="bannerImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image</FormLabel>
                  <FormControl>
                    <div>
                      <input type="hidden" {...field} />

                      {previewImage ? (
                        <div className="relative w-full h-40 border rounded-md overflow-hidden mb-2">
                          <Image
                            src={previewImage}
                            alt="Flash sale banner"
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
                                : "Click to upload banner"}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              PNG, JPG or WebP (recommended: 1200×400)
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

            {/* Products Selection - remains the same */}
            <FormField
              control={form.control}
              name="productIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Products in Flash Sale</FormLabel>
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

                    {/* Sheet for product selection */}
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
                          Select Products for Flash Sale
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="right"
                        className="w-[85%] sm:w-[600px] px-5 py-2"
                      >
                        <SheetHeader>
                          <SheetTitle>Select Products</SheetTitle>
                          <SheetDescription>
                            Choose the products to include in this flash sale.
                            These products will receive the discount you&apos;ve
                            configured.
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
                    {selectedProducts.length !== 1 ? "s" : ""} selected for this
                    flash sale
                  </FormDescription>
                  <FormMessage />
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
                    {isEditMode ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditMode ? "Save Changes" : "Create Flash Sale"}
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
