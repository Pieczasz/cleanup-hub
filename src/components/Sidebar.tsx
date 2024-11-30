"use client";

// Functions
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";

// Framer motion
import { motion } from "framer-motion";

// Components
import Link from "next/link";
import Socials from "./Socials";

// Interfaces
interface SidebarLink {
  path: string;
  name: string;
  additionalStyles?: string;
}

interface SidebarProps {
  containerStyles?: string;
  linkStyles?: string;
  underlineStyles?: string;
  additionalStyles?: string;
  onLinkClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  containerStyles,
  linkStyles,
  underlineStyles,
  additionalStyles,
  onLinkClick,
}) => {
  const { data: session } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const path = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && session !== undefined) {
      setIsSessionLoaded(true);
    }
  }, [session, isClient]);

  // Define links conditionally based on session
  const links: SidebarLink[] = [
    { path: "/events", name: "events" },
    { path: "/about", name: "about" },
    { path: "/contact", name: "contact" },
    ...(isClient && !session
      ? [
          {
            path: "/signIn",
            name: "sign in",
            additionalStyles: "text-[#6FC03B]",
          },
        ]
      : []),
  ];

  // Render nothing until client-side hydration and session loading are complete
  if (!isClient || !isSessionLoaded) return null;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.6 }}
      className="fixed inset-0 z-[1000] flex h-screen w-full flex-col justify-between bg-white"
    >
      <nav className={`flex flex-col items-center gap-y-6 ${containerStyles}`}>
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.path}
            className={`capitalize ${linkStyles} ${link.additionalStyles ?? ""}`}
            onClick={onLinkClick}
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
        {isClient && session ? (
          <Link
            href="/profile"
            className="flex items-center gap-x-2"
            onClick={onLinkClick}
          >
            <div className="h-8 w-8 overflow-hidden rounded-full">
              <Image
                src={session.user.image ?? "/defaultAvatar.jpg"}
                alt="Profile"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="capitalize">Profile</span>
          </Link>
        ) : null}
      </nav>
      <Socials containerStyles="flex flex-row justify-center items-center gap-x-4 p-4" />
    </motion.div>
  );
};

export default Sidebar;
