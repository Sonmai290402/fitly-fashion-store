"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import React from "react";
import { twMerge } from "tailwind-merge";

import useScrollView from "@/hooks/useScrollView";

type HeadingProps = {
  children: React.ReactNode;
  level?: "h1" | "h2" | "h3";
  className?: string;
};

const HeadingTypo = ({
  children,
  className = "",
  level = "h2",
}: HeadingProps) => {
  const Tag = level;
  const { inView, ref } = useScrollView();
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView && { opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
    >
      <Tag
        ref={ref}
        className={twMerge(clsx("text-3xl font-bold mb-6", className))}
      >
        {children}
      </Tag>
    </motion.div>
  );
};

export default HeadingTypo;
