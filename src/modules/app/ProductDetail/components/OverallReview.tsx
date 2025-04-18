import { Star } from "lucide-react";
import React from "react";

const OverallReview = () => {
  return (
    <section className="px-5 py-10 bg-accent flex justify-center gap-10 rounded-lg">
      <div className="flex flex-1 justify-center">
        <div className="flex flex-col gap-5 items-center">
          <p className="flex font-bold">5.0 Overall Rating</p>
          <div className="flex items-center gap-2">
            <span>
              <Star fill="black" />
            </span>
            <span>
              <Star fill="black" />
            </span>
            <span>
              <Star fill="black" />
            </span>
            <span>
              <Star fill="black" />
            </span>
            <span>
              <Star fill="black" />
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 w-64">
          <span className="flex gap-1">
            5
            <Star fill="black" className="size-5 items-center justify-center" />
          </span>
          <progress
            className="w-full h-2 bg-darker text-darker rounded-full "
            value="100"
            max="100"
          />
          <span>2</span>
        </div>
        <div className="flex items-center gap-2 w-64">
          <span className="flex gap-1">
            4
            <Star fill="black" className="size-5 items-center justify-center" />
          </span>
          <progress
            className="w-full h-2 bg-darker text-darker rounded-full "
            value="0"
            max="100"
          />
          <span>0</span>
        </div>
        <div className="flex items-center gap-2 w-64">
          <span className="flex gap-1">
            3
            <Star fill="black" className="size-5 items-center justify-center" />
          </span>
          <progress
            className="w-full h-2 bg-darker text-darker rounded-full "
            value="0"
            max="100"
          />
          <span>0</span>
        </div>
        <div className="flex items-center gap-2 w-64">
          <span className="flex gap-1">
            2
            <Star fill="black" className="size-5 items-center justify-center" />
          </span>
          <progress
            className="w-full h-2 bg-darker text-darker rounded-full "
            value="0"
            max="100"
          />
          <span>0</span>
        </div>
        <div className="flex items-center gap-2 w-64">
          <span className="flex gap-1">
            1
            <Star fill="black" className="size-5 items-center justify-center" />
          </span>
          <progress
            className="w-full h-2 bg-darker text-darker rounded-full "
            value="0"
            max="100"
          />
          <span>0</span>
        </div>
      </div>
      <div className="flex flex-1">
        <p className="font-semibold text-lg">Run sightly large</p>
      </div>
    </section>
  );
};

export default OverallReview;
