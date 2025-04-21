import { Ban } from "lucide-react";
import React from "react";

const NoProductFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] text-center">
      <Ban className="w-12 h-12 text-gray-400 mb-4" />
      <h2 className="text-lg font-semibold">No products found</h2>
      <p className="text-gray-500 text-sm mb-4">
        Try adjusting your filters or check back later.
      </p>
    </div>
  );
};

export default NoProductFound;
