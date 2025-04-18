import { Star } from "lucide-react";
import Image from "next/image";
import React from "react";

import { Separator } from "@/components/ui/separator";

const Comments = () => {
  return (
    <section>
      <h2 className="text-lg font-semibold">Comments</h2>

      <Separator className="my-5" />

      <div className="py-5 flex gap-10">
        <div className="flex flex-col gap-1 justify-center items-center">
          <p className="font-semibold">User123</p>
          <Image
            src="/220GSM.webp"
            alt="User avatar"
            width={300}
            height={400}
            className="size-15 object-cover rounded-full"
          />
        </div>
        <div className="flex flex-col gap-2 justify-center">
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
              <Star />
            </span>
          </div>
          <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nostrum
            est iste aut dolore eum temporibus possimus illo facilis minus
            quaerat! Totam excepturi provident modi magnam cumque nisi libero!
            Hic, magnam.
          </p>
        </div>
        <div className="flex">
          <p className="text-sm text-muted-foreground">10 minutes ago</p>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="py-5 flex gap-10">
        <div className="flex flex-col gap-1 justify-center items-center">
          <p className="font-semibold">User12</p>
          <Image
            src="/ao-thun.webp"
            alt="User avatar"
            width={300}
            height={400}
            className="size-15 object-cover rounded-full"
          />
        </div>
        <div className="flex flex-col gap-2 justify-center">
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
          <p>
            Got this to keep my husband warm on those chilly late fall days. He
            loves it as it not only is pretty warm but he looks good in it and
            he knows it.
          </p>
        </div>
        <div className="">
          <p className="text-sm text-muted-foreground">18 hours ago</p>
        </div>
      </div>
    </section>
  );
};

export default Comments;
