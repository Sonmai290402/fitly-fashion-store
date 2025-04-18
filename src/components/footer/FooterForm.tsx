import { ArrowRight } from "lucide-react";
import React from "react";

const FooterForm = () => {
  return (
    <form className="flex items-center w-full">
      <input
        type="email"
        placeholder="Email Address"
        className="bg-white py-3 px-4 w-full sm:w-[300px] flex-1"
      />
      <button
        type="submit"
        className="bg-darker text-white px-4 py-3 hover:bg-black transition"
      >
        <ArrowRight />
      </button>
    </form>
  );
};

export default FooterForm;
