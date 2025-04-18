import { Copyright } from "lucide-react";

import { footerItems, footerTerms } from "@/constants";

import FooterForm from "./FooterForm";

const Footer = () => {
  return (
    <footer className="bg-lightColor flex flex-col justify-center items-center p-6 gap-6 text-sm">
      {/* Grid Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 w-full max-w-screen-xl">
        {footerItems.map((item) => (
          <div key={item.title} className="flex flex-col gap-4">
            <h4 className="font-bold text-base">{item.title}</h4>
            <ul className="flex flex-col gap-2">
              {item.list.map((footerItem, index) => (
                <li
                  key={index}
                  className="hover:underline cursor-pointer font-light"
                >
                  {footerItem}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {/* Form column spans 2 on large screens */}
        <div className="lg:col-span-2">
          <FooterForm />
        </div>
      </div>

      {/* Footer terms */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {footerTerms.map((item, index) => (
          <span key={index} className="font-extralight">
            {item}
          </span>
        ))}
      </div>

      {/* Copyright */}
      <p className="flex gap-1 items-center font-extralight mt-2">
        <Copyright size={15} /> 2025 All Rights Reserved
      </p>
    </footer>
  );
};

export default Footer;
