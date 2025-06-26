import { Copyright, Facebook, Github, Mail } from "lucide-react";
import Link from "next/link";

import { footerItems, footerTerms } from "@/constants";

import FooterForm from "./FooterForm";

const Footer = () => {
  return (
    <footer className="bg-lightColor dark:bg-card flex flex-col justify-center items-center p-4 sm:p-6 gap-4 sm:gap-6 text-sm">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full max-w-screen-xl">
        {footerItems.map((item) => (
          <div key={item.title} className="flex flex-col gap-3">
            <h4 className="font-bold text-base dark:text-foreground">
              {item.title}
            </h4>
            <ul className="flex flex-col gap-2">
              {item.list.map((footerItem, index) => (
                <li
                  key={index}
                  className="hover:underline cursor-pointer font-light dark:text-foreground transition-colors"
                >
                  {footerItem}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-2 mt-4 lg:mt-0">
          <h4 className="font-bold text-base dark:text-foreground mb-3">
            Subscribe to our newsletter
          </h4>
          <FooterForm />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-2 sm:mt-4">
        {footerTerms.map((item, index) => (
          <span
            key={index}
            className="font-extralight text-xs sm:text-sm dark:text-muted-foreground hover:underline cursor-pointer"
          >
            {item}
          </span>
        ))}
      </div>

      <p className="flex gap-1 items-center font-extralight text-xs sm:text-sm mt-2 dark:text-muted-foreground">
        <Copyright size={14} /> 2025 FITLY. Developed by Sonmai
      </p>
      <p className="flex gap-3 items-center font-extralight text-xs sm:text-sm mt-2 dark:text-muted-foreground">
        Contacct me via{" "}
        <Link
          href="https://github.com/sonmai290402"
          target="_blank"
          className="flex gap-1 items-center hover:underline font-bold"
        >
          <Github size={14} /> Sonmai290402
        </Link>
        <Link
          href="https://www.facebook.com/sonmai294/"
          target="_blank"
          className="flex gap-1 items-center hover:underline font-bold"
        >
          <Facebook size={14} /> Sơn Mai
        </Link>
        <Link
          href="mailto:maitheson2942002@gmail.com"
          target="_blank"
          className="flex gap-1 items-center hover:underline font-bold"
        >
          <Mail size={14} /> Sơn Mai
        </Link>
      </p>
    </footer>
  );
};

export default Footer;
