import React from "react";
import { Link } from "react-router-dom";
import { IoHomeOutline, IoCarOutline, IoTrendingUpOutline, IoNavigateOutline, IoMailOutline, IoInformationCircleOutline, IoShareSocialOutline } from "react-icons/io5";

const menuItems = [
  {
    title: "Accueil",
    href: "#hero",
    icon: <IoHomeOutline />,
    gradientFrom: "#a955ff",
    gradientTo: "#ea51ff",
  },
  {
    title: "Véhicules",
    href: "/vehicules",
    icon: <IoCarOutline />,
    gradientFrom: "#56CCF2",
    gradientTo: "#2F80ED",
  },
  {
    title: "Rentabilité",
    href: "/rentabilite",
    icon: <IoTrendingUpOutline />,
    gradientFrom: "#22C55E",
    gradientTo: "#15803D",
  },
  {
    title: "Transport",
    href: "/transport",
    icon: <IoNavigateOutline />,
    gradientFrom: "#F59E0B",
    gradientTo: "#EF4444",
  },
  {
    title: "Contact",
    href: "/contact",
    icon: <IoMailOutline />,
    gradientFrom: "#FF9966",
    gradientTo: "#FF5E62",
  },
  {
    title: "À propos",
    href: "/a-propos",
    icon: <IoInformationCircleOutline />,
    gradientFrom: "#8B5CF6",
    gradientTo: "#EC4899",
  },
  {
    title: "Mes réseaux",
    href: "/reseaux",
    icon: <IoShareSocialOutline />,
    gradientFrom: "#10B981",
    gradientTo: "#06B6D4",
  },
];

interface GradientMenuProps {
  variant?: "inline" | "full";
  className?: string;
}

export default function GradientMenu({ variant = "full", className = "" }: GradientMenuProps) {
  const list = (
    <ul className="flex gap-4">
      {menuItems.map(({ title, href, icon, gradientFrom, gradientTo }, idx) => {
        const isAnchor = href.startsWith("#");
        const linkClassName =
          "relative w-[44px] h-[44px] bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-500 hover:w-[140px] hover:shadow-none hover:scale-110 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.4)] group cursor-pointer [transform-style:preserve-3d]";
        const style = {
          "--gradient-from": gradientFrom,
          "--gradient-to": gradientTo,
        } as React.CSSProperties;
        const content = (
          <>
            <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 ease-out group-hover:opacity-100" />
            <span className="absolute top-[6px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[12px] opacity-0 -z-10 transition-all duration-500 ease-out group-hover:opacity-50 group-hover:blur-[16px]" />
            <span className="relative z-10 transition-all duration-500 group-hover:scale-0 delay-0">
              <span className="text-lg text-gray-500">{icon}</span>
            </span>
            <span className="absolute text-white uppercase tracking-wide text-xs transition-all duration-500 scale-0 group-hover:scale-100 delay-150">
              {title}
            </span>
          </>
        );
        return (
          <li key={idx}>
            {isAnchor ? (
              <a href={href} style={style} className={linkClassName}>
                {content}
              </a>
            ) : (
              <Link to={href} style={style} className={linkClassName}>
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  if (variant === "inline") {
    return <nav className={className}>{list}</nav>;
  }

  return (
    <div
      className={`flex justify-center items-center min-h-screen bg-background ${className}`.trim()}
    >
      {list}
    </div>
  );
}
