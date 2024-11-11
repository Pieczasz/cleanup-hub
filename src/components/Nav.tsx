"use client";

// Functions
import { usePathname } from "next/navigation";

// Framer motion
import { motion } from "framer-motion";

// Components
import Link from "next/link";

interface NavLink {
  path: string;
  name: string;
  additionalStyles?: string;
}

const links: NavLink[] = [
  { path: "/events", name: "events" },
  { path: "/about", name: "about" },
  { path: "/contact", name: "contact" },
  { path: "/signIn", name: "sign in", additionalStyles: "text-[#6FC03B]" },
];

interface NavProps {
  containerStyles?: string;
  linkStyles?: string;
  underlineStyles?: string;
  additionalStyles?: string;
}

const Nav: React.FC<NavProps> = ({
  containerStyles,
  linkStyles,
  underlineStyles,
  additionalStyles,
}) => {
  const path = usePathname();
  return (
    <nav className={containerStyles}>
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.path}
          className={`capitalize ${linkStyles} ${link.additionalStyles ?? ""}`}
        >
          {link.path === path && (
            <motion.span
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              transition={{ type: "tween" }}
              layoutId="underline"
              className={`${underlineStyles} ${additionalStyles}`}
            />
          )}
          {link.name}
        </Link>
      ))}
    </nav>
  );
};

export default Nav;
