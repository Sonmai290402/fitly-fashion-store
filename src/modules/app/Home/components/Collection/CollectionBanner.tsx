import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";
import useScrollView from "@/hooks/useScrollView";
import { CollectionData } from "@/types/collection.types";

const CollectionBanner = ({ collection }: { collection: CollectionData }) => {
  const { inView, ref } = useScrollView();
  const router = useRouter();
  return (
    <div className="relative flex flex-col w-full aspect-[16/9] md:aspect-[16/7] lg:aspect-[16/6] overflow-hidden">
      <Image
        src={collection.image || ""}
        alt="Collection Image"
        width={1980}
        height={1080}
        priority
        className="object-cover w-full h-full"
      />
      <div className="absolute top-1/2 -translate-y-1/2  flex flex-col text-white px-5 md:px-10 lg:px-20 max-w-sm md:max-w-2xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -30 }}
          animate={inView && { opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <h2 className="uppercase text-3xl md:text-6xl font-bold leading-tight">
            {collection.title} COLLECTION
          </h2>
          <p className="font-semibold">{collection.desc}</p>
        </motion.div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, x: -30 }}
          animate={inView && { opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <Button
            variant="outline"
            onClick={() => router.push(collection.url || "")}
            className="text-black  text-sm md:text-xl !px-10 !py-6 rounded-full mt-5"
          >
            SHOP NOW
            <MoveRight className="size-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default CollectionBanner;
