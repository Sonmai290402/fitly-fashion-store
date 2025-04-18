import React from "react";

import { HighlightItemProps } from "../../Home.types";

const HighlightItem = ({ title, icon, subTitle }: HighlightItemProps) => {
  return (
    <>
      <div
        key={title}
        className="flex flex-col gap-2 items-center justify-center"
      >
        {icon}
        <p className="font-bold text-center">{title}</p>
        <p className="">{subTitle}</p>
      </div>
    </>
  );
};

export default HighlightItem;
