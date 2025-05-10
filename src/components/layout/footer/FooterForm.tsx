import { ArrowRight } from "lucide-react";
import React from "react";

const FooterForm = () => {
  return (
    <form className="flex flex-col sm:flex-row items-stretch w-full gap-2 sm:gap-0">
      <input
        type="email"
        placeholder="Email Address"
        className="bg-white dark:bg-input dark:text-foreground py-3 px-4 w-full flex-1 border border-border dark:border-sidebar-border focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
        required
      />
      <button
        type="submit"
        className="bg-darker dark:bg-primary text-white dark:text-primary-foreground px-4 py-3 hover:opacity-90 transition flex items-center justify-center sm:w-auto w-full mt-2 sm:mt-0"
        aria-label="Subscribe to newsletter"
      >
        <span className="mr-2">Subscribe</span>
        <ArrowRight size={18} />
      </button>
    </form>
  );
};

export default FooterForm;
