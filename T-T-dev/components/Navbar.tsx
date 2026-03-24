"use client";

import Link from "next/link";
import { useState, useEffect } from "react"; // Added useEffect
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/services/authService";
import {
  Settings,
  UserRound,
  MoonIcon,
  LayoutDashboard,
  ClipboardList,
  ListTodo,
  LogOut,
  RotateCw,
} from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const storedName = localStorage.getItem("taskQ_user_name");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/login/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard/", icon: LayoutDashboard },
    { name: "Notes", href: "/notes/", icon: ClipboardList },
    { name: "taskQ", href: "/taskQ/", icon: ListTodo },
  ];

  return (
    <div className="w-full h-10 flex flex-row justify-between items-center bg-[#30493b] text-white px-4 border-b border-white/10">
      {/* Left: Logo */}
      <div className="flex flex-row items-center justify-between text-lg gap-16 font-medium">
        <div className="flex gap-2">
          <img src="/akralogo.png" alt="logo" width="60" height="30" />
          <span>taskQ</span>
        </div>

        <div className="flex gap-2 justify-start items-center basis-2/4 text-sm">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname === `${link.href}/`;
            const Icon = link.icon;

            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex gap-1.5 items-center px-3 py-1 rounded-md transition-all ${
                  isActive
                    ? "bg-white text-[#30493b] font-medium"
                    : "text-[#fdfdfd]/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? "text-[#30493b]" : "text-white/70"}`}
                />
                {link.name}
              </a>
            );
          })}
        </div>
      </div>

      {/* <div className="flex gap-2 justify- items-center text-sm">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname === `${link.href}/`;
          const Icon = link.icon;

          return (
            <a
              key={link.href}
              href={link.href}
              className={`flex gap-1.5 items-center px-3 py-1 rounded-md transition-all ${
                isActive
                  ? "bg-white text-[#30493b] font-medium"
                  : "text-[#fdfdfd]/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? "text-[#30493b]" : "text-white/70"}`}
              />
              {link.name}
            </a>
          );
        })}
      </div> */}

      {/* Right: Icons & User Greeting */}
      <div className="flex gap-4 justify-end items-center ">
        <div className="relative flex items-center gap-3">
          {/* Greeting Text */}
          {userName && (
            <span className="text-sm text-white/80 font-normal hidden sm:block">
              Hi, <span className="font-semibold text-white">{userName}</span>
            </span>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-1 rounded-full transition-colors flex items-center justify-center ${
              isMenuOpen ? "bg-white/20" : "hover:bg-white/10"
            }`}
          >
            <UserRound className="w-4 h-4 cursor-pointer" />
          </button>

          <RotateCw
            onClick={handleRefresh}
            className={`w-4 h-4 cursor-pointer hover:opacity-80 transition-all ${isRefreshing ? "animate-spin text-green-400" : ""}`}
          />

          {/* Popover Menu */}
          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsMenuOpen(false)}
              ></div>

              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-slate-200 animate-in fade-in zoom-in duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Account
                  </p>
                  <p className="text-sm text-slate-700 font-medium truncate">
                    {userName || "User"}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
