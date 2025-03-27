"use server";

import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import ThemeToggleComponent from "./ThemeToggleComponent";

const NavbarComponent = async () => {
  const headersList = headers();
  const user_data = headersList.get("user_data")

  // console.log("user_data", user_data)

  const navItems = [
    // { name: "เข้าสู่ระบบ", href: "/login", is_show: user_data ? false : true },
    { name: "สิ่งที่ต้องทำ", href: "/list-todo", is_show: user_data ? true : false },
    { name: "โปรแกรม", href: "/list-program", is_show: true },
    { name: "ออกจากระบบ", href: "/logout", is_show: user_data ? true : false },
  ];

  return (
    <nav className="border-b sticky top-0 bg-white dark:bg-slate-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold">
              LolyUtility
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(
              (item) =>
                item.is_show && (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium rounded-md"
                  >
                    {item.name}
                  </Link>
                )
            )}
            <ThemeToggleComponent />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-4">
                  {navItems.map(
                    (item) =>
                      item.is_show && (
                        <Link key={item.name} href={item.href} className="py-2">
                          {item.name}
                        </Link>
                      )
                  )}
                </div>
                <div className="flex justify-end">
                  <ThemeToggleComponent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarComponent;
