import { PlusCircle, Trash2 } from "lucide-react";
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { commonSizes } from "@/constants";
import { ProductSize } from "@/types/product.types";

type SizeInputProps = {
  colorIndex: number;
  showErrors?: boolean;
  errorMessage?: string;
};

type ProductFormValues = {
  colors: Array<{
    sizes: ProductSize[];
  }>;
};

export default function SizeInput({ colorIndex }: SizeInputProps) {
  const { control, register, formState } = useFormContext<ProductFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `colors.${colorIndex}.sizes`,
  });

  const errors = formState.errors;
  const colorErrors =
    errors.colors && Array.isArray(errors.colors)
      ? errors.colors[colorIndex]
      : undefined;
  const sizeErrors =
    colorErrors && "sizes" in colorErrors && Array.isArray(colorErrors.sizes)
      ? colorErrors.sizes
      : [];

  const handleAddCommonSize = (sizeName: string) => {
    const sizeExists = fields.some((field) => field.name === sizeName);
    if (!sizeExists) {
      append({ name: sizeName, inStock: 0 });
    }
  };

  return (
    <div className="border-t mt-4 pt-4">
      <div className="flex items-center justify-between">
        <FormLabel className="text-base font-medium">
          Size Variants & Inventory <span className="text-red-500">*</span>
        </FormLabel>
      </div>

      <div className="flex flex-wrap gap-2 my-3">
        {commonSizes.map((size) => (
          <Button
            key={size}
            type="button"
            variant="ghost"
            onClick={() => handleAddCommonSize(size)}
            className={`px-3 py-1 ${
              fields.some((field) => field.name === size)
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
          >
            {size}
          </Button>
        ))}
      </div>

      {colorErrors &&
        "sizes" in colorErrors &&
        typeof colorErrors.sizes === "object" &&
        !Array.isArray(colorErrors.sizes) && (
          <FormMessage>{colorErrors.sizes.message as string}</FormMessage>
        )}

      {fields.length > 0 && (
        <div className="grid grid-cols-12 gap-4 mb-2 px-2 text-sm font-medium text-gray-500">
          <div className="col-span-4">Size</div>
          <div className="col-span-8">Stock Quantity</div>
        </div>
      )}

      <div className="space-y-2">
        {fields.map((field, sizeIndex) => (
          <div key={field.id} className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4">
              <FormItem className="mb-0">
                <FormControl>
                  <Input
                    {...register(
                      `colors.${colorIndex}.sizes.${sizeIndex}.name`,
                      {
                        required: "Size name is required",
                      }
                    )}
                    placeholder="Size"
                  />
                </FormControl>
                {sizeErrors[sizeIndex] && "name" in sizeErrors[sizeIndex] && (
                  <FormMessage>
                    {sizeErrors[sizeIndex].name?.message as string}
                  </FormMessage>
                )}
              </FormItem>
            </div>

            <div className="col-span-7">
              <FormItem className="mb-0">
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...register(
                      `colors.${colorIndex}.sizes.${sizeIndex}.inStock`,
                      {
                        valueAsNumber: true,
                        min: { value: 0, message: "Stock cannot be negative" },
                      }
                    )}
                    placeholder="Available quantity"
                  />
                </FormControl>
                {sizeErrors[sizeIndex] &&
                  "inStock" in sizeErrors[sizeIndex] && (
                    <FormMessage>
                      {sizeErrors[sizeIndex].inStock?.message as string}
                    </FormMessage>
                  )}
              </FormItem>
            </div>

            <div className="col-span-1 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => remove(sizeIndex)}
                className="text-red-500 hover:text-red-700 hover:bg-accent h-8 w-8 p-2"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={() => append({ name: "", inStock: 0 })}
        className="mt-4 w-full flex flex-col items-center justify-center h-full"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Custom Size
      </Button>
    </div>
  );
}
