"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <WifiOff className="h-6 w-6" />
            {"คุณเข้าสู่ออฟไลน์โหมด"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-gray-600">
            ขอโทษ เน็ตเวิร์คของท่านมีปัญหา
          </p>
          <p className="mb-6 text-gray-500">
            กรุณาตรวจสอบเน็ตเวิร์คของท่าน
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            ลองใหม่
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}