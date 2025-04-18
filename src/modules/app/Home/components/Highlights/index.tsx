import { highlightItems } from "@/constants";

import HighlightItem from "./HighlightItem";

const Highlights = () => {
  return (
    <section className="p-10">
      <div className="flex gap-5 items-start justify-center">
        {highlightItems.map(({ title, subTitle, icon }) => (
          <HighlightItem
            key={title}
            title={title}
            subTitle={subTitle}
            icon={icon}
          />
        ))}
      </div>
    </section>
  );
};

export default Highlights;
