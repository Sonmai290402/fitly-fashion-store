"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import HeadingTypo from "@/components/common/HeadingTypo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const LoginForm = () => {
  const { login, loading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [returnPath, setReturnPath] = useState<string | null>(null);

  useEffect(() => {
    const returnTo = searchParams.get("return_to");
    if (returnTo) {
      setReturnPath(returnTo);
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const success = await login({
      email: values.email,
      password: values.password,
    });

    if (success) {
      if (returnPath) {
        router.push(returnPath);
      } else {
        router.push("/");
      }
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-accent p-10 m-10 rounded-lg w-full md:w-[450px] shadow-xl flex flex-col gap-5 items-center justify-center"
      >
        <HeadingTypo className="text-center">Login</HeadingTypo>
        <div className="w-full space-y-5">
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
        </div>

        <Button variant="default" disabled={loading} className="px-10 py-5">
          {!loading ? (
            "Login"
          ) : (
            <>
              <Loader className=" animate-spin" />
              Logging In...
            </>
          )}
        </Button>
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold hover:text-black/60">
            Sign Up
          </Link>
        </p>
      </form>
    </Form>
  );
};

export default LoginForm;
