"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HomeIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/action/auth";
import { toast } from "sonner";

const LogoutPage = () => {

    const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    try {
        setIsSubmitting(true)
        await logoutAction();
        toast.success("ออกจากระบบสำเร็จ กำลังพาคุณกลับไปหน้าเข้าสู่ระบบ");
        setTimeout(() => {
            window.location.href = "/login";
        }, 2000);
    } catch (error) { 
        setIsSubmitting(false);
        console.log("Logout failed:", error);
    }
  };

  return (
    <div className="mt-20 flex items-center justify-center">
      <Card className="w-[380px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            ออกจากระบบ
          </CardTitle>
          <CardDescription className="text-center">
            คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            onClick={handleLogout}
            className="w-full max-w-[200px] group"
            variant="destructive"
            disabled={isSubmitting}
          >
            <LogOut className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            {isSubmitting ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
        <Button asChild>
            <Link href="/" className="flex iftems-center gap-2">
              <HomeIcon size={18} />
              <span>กลับไปยังหน้าหลัก</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LogoutPage;
