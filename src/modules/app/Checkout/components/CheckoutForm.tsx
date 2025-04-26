"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

import OrderSummary from "./OrderSummary";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  detailAddress: z.string().min(5, "Please enter a valid address"),
  district: z.string().min(3, "District is required"),
  city: z.string().min(2, "City is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
});

const checkoutSchema = z.object({
  shipping: addressSchema,
  paymentMethod: z.enum(["cash", "bank_transfer"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, createOrderFromCart } = useCartStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasCheckedCart = useRef(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "cash",
      shipping: {
        fullName: user?.username || "",
        detailAddress: "",
        district: "",
        city: "",
        phoneNumber: "",
      },
    },
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/login?returnUrl=/checkout");
      return;
    }

    if (!hasCheckedCart.current) {
      hasCheckedCart.current = true;

      if (items.length === 0) {
        toast.error("Your cart is empty");
        router.push("/products");
      }
    }
  }, [router, user, items.length]);

  if (!user || items.length === 0) {
    return null;
  }

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!user) {
      toast.error("You need to be logged in to place an order");
      return;
    }
    setIsSubmitting(true);

    try {
      const orderId = await createOrderFromCart(
        user,
        data.shipping,
        data.paymentMethod
      );

      toast.success("Order placed successfully!");

      router.push(`/orders/confirmation/${orderId}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4 p-6 border rounded-lg">
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shipping.fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shipping.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="0123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shipping.detailAddress"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shipping.district"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>District</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the district" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shipping.city"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Hanoi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 p-6 border rounded-lg">
                <h2 className="text-xl font-semibold">Payment Method</h2>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2 border p-4 rounded-md">
                            <RadioGroupItem value="cash" id="cash" />
                            <FormLabel
                              htmlFor="cash"
                              className="flex-1 cursor-pointer"
                            >
                              Cash
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2 border p-4 rounded-md">
                            <RadioGroupItem
                              value="bank_transfer"
                              id="bank_transfer"
                            />
                            <FormLabel
                              htmlFor="bank_transfer"
                              className="flex-1 cursor-pointer"
                            >
                              Bank Transfer
                            </FormLabel>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <div className="sticky top-24 bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <OrderSummary
            onSubmit={form.handleSubmit(onSubmit)}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
