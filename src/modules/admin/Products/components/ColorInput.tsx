import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useColorStore } from "@/store/colorStore";

import MultipleImageSelector from "./MultipleImageSelector";
import { SizeInput } from "./SizeInput";

export default function ColorInput({ nestIndex }: { nestIndex: number }) {
  const { register, setValue, formState, watch } = useFormContext();
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [customColor, setCustomColor] = useState("#000000");
  const { colors, fetchColors } = useColorStore();
  const [, setIsActiveColor] = useState(false);
  const [activeColorName, setActiveColorName] = useState<string>("");

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

  const watchedImages = watch(`colors.${nestIndex}.images`);
  const watchedSizes = watch(`colors.${nestIndex}.sizes`);
  const watchedColorCode = watch(`colors.${nestIndex}.colorCode`);
  const watchedColorName = watch(`colors.${nestIndex}.name`);

  const colorImages = (watchedImages || [])
    .filter((img: ProductImage) => img && img.url && img.url.trim() !== "")
    .map((img: ProductImage) => ({ url: img.url }));

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  useEffect(() => {
    if (watchedColorCode && watchedColorCode !== customColor) {
      setCustomColor(watchedColorCode);
    }
  }, [watchedColorCode, customColor]);

  useEffect(() => {
    if (watchedColorName) {
      setIsActiveColor(true);
      setActiveColorName(watchedColorName);
    }
  }, [watchedColorName]);

  useEffect(() => {
    if (watchedSizes && Array.isArray(watchedSizes)) {
      const totalStock = watchedSizes.reduce(
        (sum, size) => sum + (parseInt(size.inStock) || 0),
        0
      );

      setValue(`colors.${nestIndex}.stock`, totalStock, {
        shouldValidate: true,
      });
    }
  }, [watchedSizes, nestIndex, setValue]);

  const handlePredefinedColorSelect = (color: {
    name: string;
    colorCode: string;
  }) => {
    // Toggle color selection if the same color is clicked again
    if (activeColorName === color.name) {
      setValue(`colors.${nestIndex}.name`, "");
      setValue(`colors.${nestIndex}.colorCode`, "");
      setCustomColor("");
      setActiveColorName("");
    } else {
      setValue(`colors.${nestIndex}.name`, color.name);
      setValue(`colors.${nestIndex}.colorCode`, color.colorCode);
      setCustomColor(color.colorCode);
      setActiveColorName(color.name);
    }
    setIsCustomColor(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    setValue(`colors.${nestIndex}.colorCode`, color);
    setValue(`colors.${nestIndex}.name`, "Custom Color");
    setIsCustomColor(true);
    setActiveColorName("Custom Color");
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

  const copyColorCode = () => {
    const colorCode = watchedColorCode || customColor;
    navigator.clipboard.writeText(colorCode);
    toast.success("Color code copied to clipboard!");
  };

  const handleColorCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue(`colors.${nestIndex}.colorCode`, value);
    setCustomColor(value);
    setValue(`colors.${nestIndex}.name`, "Custom Color");
    setIsCustomColor(true);
  };

  return (
    <div className="border rounded-md p-4 mt-4">
      <div className="grid grid-cols-2 items-start gap-4">
        <FormItem>
          <FormLabel>Color Name</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., Red, Blue, etc."
              {...register(`colors.${nestIndex}.name`)}
            />
          </FormControl>

          {colorErrors?.name && (
            <FormMessage>{colorErrors.name.message as string}</FormMessage>
          )}
        </FormItem>

        <FormItem>
          <FormLabel>Color Code</FormLabel>
          <div className="flex items-center gap-2">
            <span className="flex items-center flex-wrap gap-2">
              {colors.map((color, index) => (
                <TooltipProvider key={color.name || index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handlePredefinedColorSelect(color)}
                        className={`w-8 h-8 rounded-full border ${
                          activeColorName === color.name
                            ? "ring-2 ring-blue-500"
                            : ""
                        }`}
                        style={{ backgroundColor: color.colorCode }}
                        aria-label={`Select ${color.name}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{color.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomColor(true)}
                className={`w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center ${
                  isCustomColor ? "ring-2 ring-blue-500" : ""
                }`}
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
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    className="w-24 h-10"
                    value={customColor}
                    onChange={handleColorCodeInput}
                    placeholder="#000000"
                  />
                  <button
                    type="button"
                    onClick={copyColorCode}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    title="Copy color code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
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
