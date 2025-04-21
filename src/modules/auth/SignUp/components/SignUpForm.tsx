"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import HeadingTypo from "@/components/common/HeadingTypo";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";

const formSchema = z
  .object({
    username: z
      .string()
      .min(5, "Username must be at least 5 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        /^[a-zA-Z][a-zA-Z0-9_]{4,29}$/,
        "Username must start with a letter and contain only letters, numbers, or underscores"
      ),
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: "Password and confirm password do not match",
    path: ["confirmPassword"],
  });

const SignUpForm = () => {
  const { signup, loading } = useAuthStore();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const success = await signup({
        username: values.username,
        email: values.email,
        password: values.password,
      });
      if (success) {
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-accent p-10 m-10 rounded-lg w-full md:w-[450px] shadow-xl flex flex-col gap-5 items-center justify-center"
      >
        <HeadingTypo className="text-center">Sign up</HeadingTypo>
        <div className="w-full space-y-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your confirm password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button variant="default" disabled={loading} className="px-10 py-5">
          {!loading ? (
            "Sign Up"
          ) : (
            <>
              <Loader className=" animate-spin" />
              Signing Up...
            </>
          )}
        </Button>
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold hover:text-black/60">
            Login
          </Link>
        </p>
      </form>
    </Form>
  );
};

export default SignUpForm;
