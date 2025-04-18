import React from "react";

import Comments from "./Comments";
import OverallReview from "./OverallReview";

const ProductReviews = () => {
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold text-center">Reviews</h2>
      <OverallReview />
      <Comments />
    </div>
  );
};

export default ProductReviews;
