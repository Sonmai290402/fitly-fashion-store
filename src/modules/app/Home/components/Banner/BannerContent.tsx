"use client";

import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";
import useScrollView from "@/hooks/useScrollView";

const BannerContent = () => {
  const router = useRouter();
  const { inView, ref } = useScrollView();
  return (
    <div className="absolute inset-0 flex items-center md:justify-start md:bg-none z-50 px-5 md:px-15">
      <div className="max-w-xl space-y-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -40 }}
          animate={inView && { opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <h1 className="text-3xl md:text-6xl font-bold">SUMMER READY</h1>
          <p className="text-base md:text-xl text-gray-700 ">
            40K discount for orders from 299K
          </p>
        </motion.div>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, x: -40 }}
          animate={inView && { opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <Button
            variant="default"
            className="inline-flex items-center justify-center rounded-full text-sm md:text-md md:py-6 md:w-[200px] bg-darker"
            onClick={() => router.push("/products")}
          >
            SHOP NOW
            <MoveRight className="ml-2" size={20} />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default BannerContent;
