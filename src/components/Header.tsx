"use client";

// Functions
import { useState, useEffect } from "react";

// Components
import Nav from "@/components/Nav";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import Socials from "@/components/Socials";

// Icons
import { Menu, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import MaxWidthWrapper from "./MaxWidthWrapper";

const Header: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  const handleSidebarClose = () => {
    setShowSidebar(false);
  };

  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSidebar]);

  return (
    <header className="lexend py-10">
      <MaxWidthWrapper>
        <div className="container max-w-screen-xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="group relative">
              <h4 className="font-semibold">
                <span>Cleanup</span>
                <span className="text-green-500">Hub</span>
              </h4>
              <span className="absolute bottom-0 left-0 h-0.5 w-full scale-x-0 transform bg-green-500 bg-primary transition-all duration-500 group-hover:scale-x-100" />
            </Link>
            <div className="flex items-center">
              <Nav
                containerStyles="hidden lg:flex gap-x-8 items-center"
                linkStyles="relative hover:text-primary transition-all"
                underlineStyles="absolute left-0 top-full h-[2px] bg-primary w-full"
              />
            </div>

            <div className="flex items-center gap-x-6 lg:hidden">
              <div className="flex gap-x-2">
                {!showSidebar && (
                  <Menu
                    onClick={() => {
                      setShowSidebar(true);
                    }}
                    className="cursor-pointer"
                  />
                )}
                {showSidebar && (
                  <X onClick={handleSidebarClose} className="cursor-pointer" />
                )}
              </div>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {showSidebar && (
            <Sidebar
              containerStyles="flex flex-col items-start p-4 justify-center text-center py-36"
              linkStyles="py-4 w-full"
              underlineStyles="absolute left-0 top-full h-[2px] bg-primary w-full"
              onLinkClick={() => setShowSidebar(false)}
            />
          )}
        </AnimatePresence>
      </MaxWidthWrapper>
    </header>
  );
};

export default Header;
