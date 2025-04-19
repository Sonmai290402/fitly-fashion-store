import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { commonColors } from "@/constants";

import MultipleImageSelector from "./MultipleImageSelector";
import SizeInput from "./SizeInput";

export default function ColorInput({ nestIndex }: { nestIndex: number }) {
  const { register, setValue, formState, watch } = useFormContext();
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [customColor, setCustomColor] = useState("#000000");

  const { errors } = formState;

  interface ColorError {
    name?: { message: string };
    colorCode?: { message: string };
    images?: { message?: string; root?: { message?: string } };
    sizes?: { message?: string; root?: { message?: string } };
  }

  const colorErrors = (errors.colors as Array<ColorError> | undefined)?.[
    nestIndex
  ];
  const imagesError =
    colorErrors?.images?.message ||
    (colorErrors?.images?.root?.message as string);

  const allColorImages = watch(`colors.${nestIndex}.images`) || [];
  const colorImages = allColorImages
    .filter((img: ProductImage) => img && img.url && img.url.trim() !== "")
    .map((img: ProductImage) => ({ url: img.url }));

  const sizes = watch(`colors.${nestIndex}.sizes`);

  useEffect(() => {
    if (sizes && Array.isArray(sizes)) {
      const totalStock = sizes.reduce(
        (sum, size) => sum + (size.inStock || 0),
        0
      );

      setValue(`colors.${nestIndex}.stock`, totalStock, {
        shouldValidate: true,
      });
    }
  }, [sizes, nestIndex, setValue]);

  const handlePredefinedColorSelect = (color: {
    name: string;
    colorCode: string;
  }) => {
    setValue(`colors.${nestIndex}.name`, color.name);
    setValue(`colors.${nestIndex}.colorCode`, color.colorCode);
    setIsCustomColor(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    setValue(`colors.${nestIndex}.colorCode`, color);
    setValue(`colors.${nestIndex}.name`, "Custom Color");
    setIsCustomColor(true);
  };

  interface ProductImage {
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }

  const handleImagesChange = (newImages: Array<{ url: string }>) => {
    const validImages = newImages.filter(
      (img) => img.url && img.url.trim() !== ""
    );

    if (validImages.length === 0) {
      setValue(`colors.${nestIndex}.images`, [], {
        shouldValidate: false,
      });
    } else {
      const updatedImages = validImages.map((img, index) => ({
        url: img.url,
        alt: "",
        isPrimary: index === 0,
      }));

      setValue(`colors.${nestIndex}.images`, updatedImages, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  return (
    <div className="border rounded-md p-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>Color Name</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., Red, Blue, etc."
              {...register(`colors.${nestIndex}.name`)}
              disabled={!isCustomColor}
            />
          </FormControl>

          {colorErrors?.name && (
            <FormMessage>{colorErrors.name.message as string}</FormMessage>
          )}
        </FormItem>

        <FormItem>
          <FormLabel>Color Code</FormLabel>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-2">
              {commonColors.map((color) => (
                <button
                  type="button"
                  key={color.colorCode}
                  onClick={() => handlePredefinedColorSelect(color)}
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: color.colorCode }}
                  aria-label={`Select ${color.name}`}
                />
              ))}
              <button
                type="button"
                onClick={() => setIsCustomColor(true)}
                className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center"
                aria-label="Custom color"
              >
                +
              </button>
            </span>
            {isCustomColor && (
              <>
                <Input
                  type="color"
                  className="w-16 p-1 h-10"
                  value={customColor}
                  onChange={handleCustomColorChange}
                />
                <button
                  onClick={() => setIsCustomColor(false)}
                  className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center"
                  aria-label="Back to predefined colors"
                >
                  &#x2715;
                </button>
              </>
            )}
          </div>

          {colorErrors?.colorCode && (
            <FormMessage>{colorErrors.colorCode.message as string}</FormMessage>
          )}
        </FormItem>
      </div>
      <div className="mt-4">
        <FormLabel>Images</FormLabel>
        {imagesError && <FormMessage>{imagesError}</FormMessage>}

        <MultipleImageSelector
          images={colorImages}
          onChange={handleImagesChange}
          uploadPath={`products/colors/${nestIndex}`}
          maxImages={4}
        />
      </div>
      <SizeInput colorIndex={nestIndex} />
    </div>
  );
}
