"use client";

import clsx from "clsx";
import { ChevronDown, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { commonColors, commonSizes } from "@/constants";
import { useCategoryStore } from "@/store/categoryStore";
import { useGenderStore } from "@/store/genderStore";
import { ProductFilters } from "@/types/product.types";

type ProductFilterBarProps = {
  initialFilters: ProductFilters;
  isMobile?: boolean;
  closeMobileFilters?: () => void;
};

export default function FilterBar({
  initialFilters,
  isMobile = false,
  closeMobileFilters,
}: ProductFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [, startTransition] = useTransition();

  const { genders, fetchGenders } = useGenderStore();
  const { categories, fetchCategories } = useCategoryStore();

  const selectedGender = genders.find(
    (g) => g.title.toLowerCase() === initialFilters.gender
  );

  const availableCategories = selectedGender
    ? categories.filter((c) => c.genderId === selectedGender.id)
    : [];

  const isCategoryValidForGender = initialFilters.category
    ? availableCategories.some(
        (c) => (c.url.split("/").pop() || "") === initialFilters.category
      )
    : true;

  const [openSections, setOpenSections] = useState({
    gender: true,
    category: !!initialFilters.gender,
    color: !!initialFilters.color,
    size: !!initialFilters.size,
    price: !!(initialFilters.minPrice || initialFilters.maxPrice),
  });

  useEffect(() => {
    fetchGenders();
  }, [fetchGenders]);

  useEffect(() => {
    if (selectedGender?.id) {
      fetchCategories(selectedGender.id);
    }
  }, [selectedGender?.id, fetchCategories]);

  useEffect(() => {
    if (
      initialFilters.gender &&
      initialFilters.category &&
      !isCategoryValidForGender
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("category");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }
  }, [
    initialFilters.gender,
    initialFilters.category,
    isCategoryValidForGender,
    router,
    pathname,
    searchParams,
  ]);

  const toggleFilterValue = useCallback(
    (key: string, value: string | number) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentValue = params.get(key);
      const newValue = String(value);

      if (currentValue === newValue) {
        params.delete(key);

        if (key === "gender") {
          params.delete("category");
        }
      } else {
        params.set(key, newValue);

        if (key === "gender") {
          params.delete("category");
        }
      }

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });

      if (isMobile && closeMobileFilters && key !== "sort") {
        closeMobileFilters();
      }
    },
    [searchParams, pathname, router, isMobile, closeMobileFilters]
  );

  const handleCheckboxChange = useCallback(
    (key: string, value: string, checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString());

      if (checked) {
        params.set(key, value);

        if (key === "gender") {
          params.delete("category");
        }

        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        });
      } else {
        params.delete(key);

        if (key === "gender") {
          params.delete("category");
        }

        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        });
      }
    },
    [searchParams, pathname, router]
  );

  const updateFilters = useCallback(
    (key: string, value: string | number | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null) {
        params.delete(key);

        if (key === "gender") {
          params.delete("category");
        }
      } else {
        params.set(key, String(value));
      }

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });

      if (isMobile && closeMobileFilters) {
        closeMobileFilters();
      }
    },
    [searchParams, pathname, router, isMobile, closeMobileFilters]
  );

  const toggleSection = useCallback((section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
    if (isMobile && closeMobileFilters) {
      closeMobileFilters();
    }
  }, [router, pathname, isMobile, closeMobileFilters]);

  const activeFiltersCount = Object.keys(initialFilters).filter(
    (key) => key !== "sort"
  ).length;

  return (
    <div
      className={clsx(
        "bg-white p-4 rounded-lg shadow-md",
        isMobile ? "h-full overflow-auto" : ""
      )}
    >
      {!isMobile && <h2 className="text-lg font-semibold mb-4">Filters</h2>}

      <div className="mb-4 space-y-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("gender")}
        >
          <h3 className="font-medium">Gender</h3>
          <ChevronDown
            className={clsx(
              "size-5 transition-transform duration-300",
              openSections.gender ? "rotate-180" : ""
            )}
          />
        </div>

        {openSections.gender && (
          <div className="space-y-2">
            {genders
              .filter((g) => g.isActive)
              .map((gender) => {
                const genderValue = gender.title.toLowerCase();
                const isChecked = initialFilters.gender === genderValue;

                return (
                  <div key={gender.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`gender-${gender.id}`}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          "gender",
                          genderValue,
                          checked === true
                        )
                      }
                    />
                    <Label
                      htmlFor={`gender-${gender.id}`}
                      className="cursor-pointer"
                    >
                      {gender.title}
                    </Label>
                  </div>
                );
              })}
          </div>
        )}
        <Separator />
      </div>

      <div className="mb-4 space-y-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("category")}
        >
          <h3 className="font-medium">Category</h3>
          <ChevronDown
            className={clsx(
              "w-5 h-5 transition-transform",
              openSections.category ? "rotate-180" : ""
            )}
          />
        </div>

        {openSections.category && (
          <div className="space-y-2">
            {availableCategories.length > 0 ? (
              availableCategories.map((category) => {
                const categoryValue = category.url.split("/").pop() || "";
                const isChecked = initialFilters.category === categoryValue;

                return (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          "category",
                          categoryValue,
                          checked === true
                        )
                      }
                      disabled={!initialFilters.gender}
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className={clsx(
                        "cursor-pointer",
                        !initialFilters.gender && "text-gray-400"
                      )}
                    >
                      {category.title}
                    </Label>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">
                {initialFilters.gender
                  ? "No categories available for this gender"
                  : "Select a gender first"}
              </p>
            )}
          </div>
        )}
        <Separator />
      </div>

      <div className="mb-4 space-y-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("color")}
        >
          <h3 className="font-medium">Color</h3>
          <ChevronDown
            className={clsx(
              "size-5 transition-transform",
              openSections.color ? "rotate-180" : ""
            )}
          />
        </div>

        {openSections.color && (
          <div className="flex flex-wrap gap-2 mt-2">
            {commonColors.map((color) => {
              const colorValue = color.name.toLowerCase();
              const isSelected = initialFilters.color === colorValue;

              return (
                <Button
                  key={color.name}
                  onClick={() => toggleFilterValue("color", colorValue)}
                  className={clsx(
                    "size-6 rounded-full p-0 border",
                    isSelected ? "ring-1 ring-offset-2 ring-primary" : ""
                  )}
                  style={{ backgroundColor: color.colorCode }}
                  variant="ghost"
                  title={color.name}
                  aria-label={`Filter by ${color.name} color`}
                />
              );
            })}
          </div>
        )}
        <Separator />
      </div>

      {/* Size Section */}
      <div className="mb-4 space-y-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("size")}
        >
          <h3 className="font-medium">Size</h3>
          <ChevronDown
            className={clsx(
              "size-5 transition-transform",
              openSections.size ? "rotate-180" : ""
            )}
          />
        </div>

        {openSections.size && (
          <div className="flex flex-wrap gap-2 mt-2">
            {commonSizes.map((size) => (
              <Button
                key={size}
                onClick={() => toggleFilterValue("size", size)}
                variant={initialFilters.size === size ? "default" : "outline"}
                size="sm"
                className="h-9 px-3"
              >
                {size}
              </Button>
            ))}
          </div>
        )}
        <Separator />
      </div>

      {/* Price Range Section */}
      <div className="mb-4 space-y-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("price")}
        >
          <h3 className="font-medium">Price Range</h3>
          <ChevronDown
            className={clsx(
              "size-5 transition-transform",
              openSections.price ? "rotate-180" : ""
            )}
          />
        </div>

        {openSections.price && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1/2">
                <Label htmlFor="min-price" className="text-sm mb-1.5 block">
                  Min ($)
                </Label>
                <Input
                  id="min-price"
                  type="number"
                  min="0"
                  value={initialFilters.minPrice || ""}
                  onChange={(e) =>
                    updateFilters(
                      "minPrice",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  placeholder="0"
                />
              </div>
              <div className="w-1/2">
                <Label htmlFor="max-price" className="text-sm mb-1.5 block">
                  Max ($)
                </Label>
                <Input
                  id="max-price"
                  type="number"
                  min="0"
                  value={initialFilters.maxPrice || ""}
                  onChange={(e) =>
                    updateFilters(
                      "maxPrice",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  placeholder="999"
                />
              </div>
            </div>
          </div>
        )}
        <Separator />
      </div>

      {/* Sort By Section */}
      <div className="mb-4 space-y-4">
        <h3 className="font-medium">Sort By</h3>

        <RadioGroup
          defaultValue={initialFilters.sort || "newest"}
          onValueChange={(value) => updateFilters("sort", value)}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="newest" id="sort-newest" />
              <Label htmlFor="sort-newest">Newest Arrivals</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price-asc" id="sort-price-asc" />
              <Label htmlFor="sort-price-asc">Price: Low to High</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price-desc" id="sort-price-desc" />
              <Label htmlFor="sort-price-desc">Price: High to Low</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="popular" id="sort-popular" />
              <Label htmlFor="sort-popular">Popularity</Label>
            </div>
          </div>
        </RadioGroup>
        <Separator />
      </div>

      {/* Active Filters Section */}
      {activeFiltersCount > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Active Filters:</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(initialFilters).map(([key, value]) => {
              // Skip sort parameter for active filters display
              if (key === "sort") return null;

              let label = "";
              if (
                key === "gender" ||
                key === "category" ||
                key === "color" ||
                key === "size"
              ) {
                label = `${key}: ${value}`;
              } else if (key === "minPrice") {
                label = `Min: $${value}`;
              } else if (key === "maxPrice") {
                label = `Max: $${value}`;
              }

              return (
                <Badge
                  key={key}
                  variant="outline"
                  className="flex items-center gap-1 pl-2 pr-1 py-1"
                >
                  <span className="capitalize">{label}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => updateFilters(key, null)}
                    aria-label={`Remove ${key} filter`}
                  >
                    <X className="size-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
          <Separator className="my-4" />
        </div>
      )}

      {activeFiltersCount > 0 && (
        <Button variant="default" onClick={clearAllFilters} className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
