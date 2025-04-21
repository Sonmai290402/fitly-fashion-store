import React from "react";

import HeadingTypo from "@/components/common/HeadingTypo";

import CategorySwiper from "./CategorySwiper";

const Category = () => {
  return (
    <section className="px-4 md:px-8 py-12">
      <div className="flex flex-col items-center justify-center gap-8">
        <HeadingTypo>Shop By Category</HeadingTypo>
        <CategorySwiper />
      </div>
    </section>
  );
};

export default Category;
