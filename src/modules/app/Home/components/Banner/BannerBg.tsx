"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

const BannerBg = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="absolute inset-0"
    >
      <Image
        src="/HeroBanner.jpg"
        alt="Banner"
        fill
        className="object-cover w-full h-full"
        priority
      />
      <div className="absolute inset-0" />
    </motion.div>
  );
};

export default BannerBg;
