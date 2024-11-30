"use client";

// Functions
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

// Framer motion
import { motion } from "framer-motion";

// Components
import Link from "next/link";
import Image from "next/image";

interface NavLink {
  path: string;
  name: string;
  additionalStyles?: string;
}

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

  // Modified links array - removes the sign in option
  const links: NavLink[] = [
    { path: "/events", name: "events" },
    { path: "/about", name: "about" },
    { path: "/contact", name: "contact" },
  ];

  // Render nothing until client-side hydration and session loading are complete
  if (!isClient || !isSessionLoaded) return null;

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
      {isClient && session ? (
        <Link href="/profile">
          <div className="h-8 w-8 overflow-hidden rounded-full">
            <Image
              src={session.user.image ?? "/defaultAvatar.jpg"}
              alt="Profile"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
        </Link>
      ) : (
        <Link
          href="/signIn"
          className={`capitalize ${linkStyles} text-[#6FC03B]`}
        >
          sign in
        </Link>
      )}
    </nav>
  );
};

export default Nav;
