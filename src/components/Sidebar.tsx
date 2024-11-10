"use client";

// Functions
import { usePathname } from "next/navigation";

// Framer motion
import { motion } from "framer-motion";

// Components
import Link from "next/link";
import Socials from "./Socials";

interface SidebarLink {
  path: string;
  name: string;
}

const links: SidebarLink[] = [
  { path: "/events", name: "events" },
  { path: "/about", name: "about" },
  { path: "/contact", name: "contact" },
  { path: "/signIn", name: "sign in" },
];

interface SidebarProps {
  containerStyles?: string;
  linkStyles?: string;
  underlineStyles?: string;
  onLinkClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  containerStyles,
  linkStyles,
  underlineStyles,
  onLinkClick,
}) => {
  const path = usePathname();
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.6 }}
      className="fixed inset-0 top-20 z-[1000] h-[calc(100%-5rem)] w-full"
    >
      <nav className={containerStyles}>
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.path}
            className={`capitalize ${linkStyles}`}
            onClick={onLinkClick}
          >
            {link.path === path && (
              <motion.span
                initial={{ y: "-100%" }}
                animate={{ y: 0 }}
                transition={{ type: "tween" }}
                layoutId="underline"
                className={underlineStyles}
              />
            )}
            {link.name}
          </Link>
        ))}
      </nav>
      <Socials containerStyles="flex flex-row justify-center items-start gap-x-4" />
    </motion.div>
  );
};

export default Sidebar;
