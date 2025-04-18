import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import useScrollView from "@/hooks/useScrollView";

import { GenderCardProps } from "../../Home.types";

const GenderCard = ({ url, src, title }: GenderCardProps) => {
  const { ref, inView } = useScrollView();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView && { opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
    >
      <Link href={url} className="group relative rounded-lg">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="overflow-hidden rounded-lg">
            <Image
              src={src}
              width={3600}
              height={4800}
              alt={title}
              className="aspect-[3/4] w-[200px] md:w-[300px] object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <h4 className="text-xl font-bold">{title}</h4>
        </div>
      </Link>
    </motion.div>
  );
};

export default GenderCard;
