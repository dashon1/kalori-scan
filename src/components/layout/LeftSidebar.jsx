import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, BarChart3, Settings } from "lucide-react";

export default function LeftSidebar({ activeTab, onTabClick }) {
  const items = [
    { key: "Home", label: "Home", icon: Home },
    { key: "Analytics", label: "Analytics", icon: BarChart3 },
    { key: "Settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="sticky top-[72px] space-y-2">
      {items.map(({ key, label, icon: Icon }) => (
        <Link
          key={key}
          to={createPageUrl(key)}
          onClick={(e) => onTabClick(key, e)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all select-none ${
            activeTab === key
              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Icon className="w-5 h-5" />
          <span className="text-sm font-semibold">{label}</span>
        </Link>
      ))}
    </nav>
  );
}