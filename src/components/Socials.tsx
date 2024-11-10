"use client";

// Functions
import { usePathname } from "next/navigation";

// Framer motion
import { motion } from "framer-motion";

// Components
import Link from "next/link";

// Icons
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

interface SocialsLink {
  path: string;
  icon: JSX.Element;
}

const links: SocialsLink[] = [
  {
    path: "/",
    icon: <FaInstagram className="h-6 w-6" />,
  },
  {
    path: "/",
    icon: <FaTiktok className="h-6 w-6" />,
  },
  {
    path: "/",
    icon: <FaXTwitter className="h-6 w-6" />,
  },
  {
    path: "/",
    icon: <FaFacebook className="h-6 w-6" />,
  },
];

interface SocialsProps {
  containerStyles?: string;
  linkStyles?: string;
  underlineStyles?: string;
}

const Socials: React.FC<SocialsProps> = ({
  containerStyles,
  linkStyles,
  underlineStyles,
}) => {
  const path = usePathname();
  return (
    <div className={containerStyles}>
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.path}
          className={`capitalize ${linkStyles} transition-colors hover:text-primary`}
          target="_blank" // This will open the link in a new tab
          rel="noopener noreferrer" // This is a security measure
        >
          {link.path === path && <motion.span className={underlineStyles} />}
          {link.icon}
        </Link>
      ))}
    </div>
  );
};

export default Socials;
