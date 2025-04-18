"use client";

import React, { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useGenderStore } from "@/store/genderStore";

import GenderCard from "./GenderCard";

const GenderList = () => {
  const { genders, fetchGenders, loading } = useGenderStore();

  useEffect(() => {
    fetchGenders();
  }, [fetchGenders]);

  if (loading) {
    return (
      <div className="flex gap-5 justify-center items-center">
        <Skeleton className="aspect-[3/4] w-[300px] rounded-lg" />
        <Skeleton className="aspect-[3/4] w-[300px] rounded-lg" />
      </div>
    );
  }
  return (
    <div className="flex justify-center gap-6 px-4 md:px-10">
      {genders.map(({ url, title, image }) => (
        <GenderCard key={title} url={url} title={title} src={image || ""} />
      ))}
    </div>
  );
};

export default GenderList;
