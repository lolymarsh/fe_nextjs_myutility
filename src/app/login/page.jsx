"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { loginAction } from "@/action/auth";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "กรุณากรอกอีเมล")
    .max(100, "อีเมลยาวเกินไป")
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z
    .string()
    .min(5, "รหัสผ่านอย่างน้อย 5 ตัวอักษร")
    .max(100, "รหัสผ่านยาวเกินไป"),
});

const errorHandle = (error) => {
  let errorMsg = "";

  switch (error) {
    case "user not found":
      errorMsg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      break;
    case "password is incorrect":
      errorMsg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      break;
    case "user is not active":
      errorMsg = "บัญชีของคุณถูกปิดการใช้งาน";
      break;
    default:
      errorMsg = "เกิดข้อผิดพลาด";
      break;
  }

  return toast.error(errorMsg);
};

const LoginPage = () => {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const result = await loginAction(data);
      if (result?.error) {
        console.log("result.error", result.error);
        errorHandle(result.error);
        setIsSubmitting(false);
      } else {
        toast.success("เข้าสู่ระบบสำเร็จ กำลังเปลี่ยนหน้า...");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (error) {
      console.log("Login failed:", error);
      setIsSubmitting(false);
    } 
  };

  return (
    <div className="mt-10 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">
            ยินดีต้อนรับ
          </CardTitle>
          <CardDescription className="text-center">
            กรอกข้อมูลของคุณเพื่อเข้าสู่ระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อีเมล</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="กรอกอีเมลของคุณ"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รหัสผ่าน</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="กรอกรหัสผ่านของคุณ"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className=" w-full" disabled={isSubmitting}>
                {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {/* <div className="text-sm text-center text-muted-foreground">
            <Link
              href="/forgot-password"
              className="hover:text-primary underline underline-offset-4"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div> */}
          <div className="text-sm text-center text-muted-foreground">
            หากต้องการผู้ใช้งานต้องติดต่อผู้ดูแลระบบสามารถดูได้จากหน้าแรก
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
