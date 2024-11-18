// Components
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import Socials from "./Socials";

const Footer = () => {
  return (
    <footer className="bg-[#6AA553] pt-16 text-white">
      <MaxWidthWrapper>
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-x-16 space-y-12 lg:flex-row lg:space-y-0">
            <div>
              <h3 className="text-3xl font-semibold">
                Small actions, <br />
                big impact.
              </h3>
            </div>
            <div className="flex flex-col items-center justify-center space-y-6">
              <Link href="/" className="group relative">
                <h5 className="text-white transition-all duration-300">
                  About Us
                </h5>
                <span className="absolute bottom-0 left-0 h-0.5 w-full scale-x-0 transform bg-green-800 transition-all duration-500 group-hover:scale-x-100" />
              </Link>
              <Link href="/" className="group relative">
                <h5 className="text-white transition-all duration-300">
                  How It Works
                </h5>
                <span className="absolute bottom-0 left-0 h-0.5 w-full scale-x-0 transform bg-green-800 transition-all duration-500 group-hover:scale-x-100" />
              </Link>
              <Link href="/" className="group relative">
                <h5 className="text-white transition-all duration-300">
                  Contact Us
                </h5>
                <span className="absolute bottom-0 left-0 h-0.5 w-full scale-x-0 transform bg-green-800 transition-all duration-500 group-hover:scale-x-100" />
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center space-y-6">
              <Link href="/" className="group relative">
                <h5 className="text-white transition-all duration-300">
                  Privacy Policy
                </h5>
                <span className="absolute bottom-0 left-0 h-0.5 w-full scale-x-0 transform bg-green-800 transition-all duration-500 group-hover:scale-x-100" />
              </Link>
              <Link href="/" className="group relative">
                <h5 className="text-white transition-all duration-300">
                  Terms of Service
                </h5>
                <span className="absolute bottom-0 left-0 h-0.5 w-full scale-x-0 transform bg-green-800 transition-all duration-500 group-hover:scale-x-100" />
              </Link>
              <Link href="/" className="group relative">
                <h5 className="text-white transition-all duration-300">
                  Cookie Policy
                </h5>
                <span className="absolute bottom-0 left-0 h-0.5 w-full scale-x-0 transform bg-green-800 transition-all duration-500 group-hover:scale-x-100" />
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center space-y-6">
              <Link href="/events" className="group relative">
                <h5 className="text-white transition-all duration-300">
                  Join a Clean-Up
                </h5>
                <span className="absolute bottom-0 left-0 h-0.5 w-full scale-x-0 transform bg-green-800 transition-all duration-500 group-hover:scale-x-100" />
              </Link>
              <Link href="/" className="group relative">
                <h5 className="text-white transition-all duration-300">
                  Host an Event
                </h5>
                <span className="absolute bottom-0 left-0 h-0.5 w-full scale-x-0 transform bg-green-800 transition-all duration-500 group-hover:scale-x-100" />
              </Link>
              <Link href="/" className="group relative">
                <h5 className="text-white transition-all duration-300">
                  Donate Supplies
                </h5>
                <span className="absolute bottom-0 left-0 h-0.5 w-full scale-x-0 transform bg-green-800 transition-all duration-500 group-hover:scale-x-100" />
              </Link>
            </div>
          </div>
          <div className="flex flex-col pb-8 pt-16">
            <Socials containerStyles="flex flex-row items-center justify-center gap-x-4" />
            <p className="pt-2 text-sm font-[300]">
              &copy; 2024 CleanupHub. All rights reserved.
            </p>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
};

export default Footer;
