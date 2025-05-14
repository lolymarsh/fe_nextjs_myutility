"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PaginationComponent from "@/components/PaginationComponent";

const DiscordWebHookList = ({ userData, accessToken }) => {
  const [webhooks, setWebhooks] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [webhookForm, setWebhookForm] = useState({
    dc_webhook_id: null,
    webhook_name: "",
    webhook_url: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isWebhookUrlVisible, setIsWebhookUrlVisible] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    user_id: userData?.user_id || "all",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
  });
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [webhookIdToDelete, setWebhookIdToDelete] = useState(null);

  const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": `${accessToken}`,
    },
  });

  const fetchWebhooks = async (page = 1, pageSize = pagination.pageSize) => {
    setIsPageLoading(true);
    try {
      const keywords = [];
      if (filters.search) {
        keywords.push({ field: "webhook_name", value: filters.search });
        keywords.push({ field: "webhook_url", value: filters.search });
      }
      if (filters.user_id !== "all") {
        keywords.push({ field: "user_id", value: filters.user_id });
      }

      const response = await api.post("/discord_webhook/filter", {
        keywords,
        sort_name: "created_at",
        sort_by: "desc",
        page,
        page_size: pageSize,
      });

      if (response?.data) {
        setWebhooks(response.data.data || []);
        setPagination({
          currentPage: page,
          pageSize: pageSize,
          totalPages: Math.ceil((response.data.total || 0) / pageSize),
          totalItems: response.data.total || 0,
        });
      }
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูล webhook ได้", { description: "เกิดข้อผิดพลาด" });
    } finally {
      setIsPageLoading(false);
    }
  };

  const validateWebhook = (webhook) => {
    if (!webhook.webhook_name.trim()) {
      toast.error("ชื่อ webhook ต้องไม่ว่างเปล่า");
      return false;
    }
    if (!webhook.webhook_url.trim()) {
      toast.error("URL webhook ต้องไม่ว่างเปล่า");
      return false;
    }
    if (webhook.webhook_name.length > 100) {
      toast.error("ชื่อ webhook ต้องไม่เกิน 100 ตัวอักษร");
      return false;
    }
    if (webhook.webhook_url.length > 255) {
      toast.error("URL webhook ต้องไม่เกิน 255 ตัวอักษร");
      return false;
    }
    return true;
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSubmitWebhook = async () => {
    if (!validateWebhook(webhookForm)) {
      return;
    }
    try {
      const payload = {
        webhook_name: webhookForm.webhook_name,
        webhook_url: webhookForm.webhook_url,
      };
      if (isEditMode) {
        payload.dc_webhook_id = webhookForm.dc_webhook_id;
      }
      const endpoint = isEditMode ? "/discord_webhook/update" : "/discord_webhook/insert";
      const response = await api.post(endpoint, payload);
      if (response?.data) {
        toast.success(isEditMode ? "อัปเดต webhook เรียบร้อย" : "เพิ่ม webhook เรียบร้อย");
        setIsDialogOpen(false);
        resetWebhookForm();
        fetchWebhooks(pagination.currentPage);
      }
    } catch (error) {
      toast.error(isEditMode ? "ไม่สามารถอัปเดต webhook ได้" : "ไม่สามารถเพิ่ม webhook ได้", {
        description: "เกิดข้อผิดพลาด",
      });
    }
  };

  const handleDeleteWebhook = async () => {
    try {
      setIsLoadingDelete(true);
      const response = await api.post("/discord_webhook/delete", {
        dc_webhook_id: webhookIdToDelete,
      });
      if (response?.data) {
        toast.success("ลบ webhook เรียบร้อย");
        fetchWebhooks(pagination.currentPage);
      }
    } catch (error) {
      toast.error("ไม่สามารถลบ webhook ได้", { description: "เกิดข้อผิดพลาด" });
    } finally {
      setIsLoadingDelete(false);
      setIsDeleteDialogOpen(false);
      setWebhookIdToDelete(null);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
      fetchWebhooks(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: 1,
    }));
    fetchWebhooks(1, newPageSize);
  };

  const resetWebhookForm = () => {
    setWebhookForm({
      dc_webhook_id: null,
      webhook_name: "",
      webhook_url: "",
    });
    setIsEditMode(false);
    setIsWebhookUrlVisible(false);
  };

  const openEditDialog = (webhook) => {
    setWebhookForm({
      dc_webhook_id: webhook.dc_webhook_id,
      webhook_name: webhook.webhook_name,
      webhook_url: webhook.webhook_url,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchWebhooks(pagination.currentPage);
  }, [filters]);

  const renderSkeletonRows = () => {
    return Array(5)
      .fill()
      .map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-[150px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[200px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
          {userData?.role === "ADMIN" && (
            <TableCell>
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
          )}
          <TableCell>
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
        </TableRow>
      ));
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">รายการ Webhook</h1>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetWebhookForm();
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>เพิ่ม Webhook</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditMode ? "แก้ไข Webhook" : "เพิ่ม Webhook"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="webhook_name" className="text-right">
                      ชื่อ Webhook
                    </Label>
                    <Input
                      id="webhook_name"
                      value={webhookForm.webhook_name}
                      onChange={(e) =>
                        setWebhookForm({ ...webhookForm, webhook_name: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="webhook_url" className="text-right">
                      URL Webhook
                    </Label>
                    <div className="col-span-3 relative">
                      <Input
                        id="webhook_url"
                        type={isWebhookUrlVisible ? "text" : "password"}
                        value={webhookForm.webhook_url}
                        onChange={(e) =>
                          setWebhookForm({ ...webhookForm, webhook_url: e.target.value })
                        }
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setIsWebhookUrlVisible(!isWebhookUrlVisible)}
                      >
                        {isWebhookUrlVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <Button onClick={handleSubmitWebhook}>
                  {isEditMode ? "อัปเดต Webhook" : "เพิ่ม Webhook"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-4 mb-4">
            <Input
              placeholder="ค้นหาชื่อหรือ URL webhook"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-1/2"
            />
            {userData?.role === "ADMIN" && (
              <Select
                value={filters.user_id}
                onValueChange={(value) => handleFilterChange("user_id", value)}
              >
                <SelectTrigger className="w-1/4">
                  <SelectValue placeholder="เลือกผู้ใช้งาน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value={userData?.user_id}>ตัวเอง</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] min-w-[150px] max-w-[200px]">
                  ชื่อ Webhook
                </TableHead>
                <TableHead className="w-[300px] min-w-[200px] max-w-[300px]">
                  URL Webhook
                </TableHead>
                <TableHead className="w-[120px] min-w-[120px]">วันที่สร้าง</TableHead>
                {userData?.role === "ADMIN" && (
                  <TableHead className="w-[120px] min-w-[120px]">ผู้สร้าง</TableHead>
                )}
                <TableHead className="w-[120px] min-w-[120px]">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPageLoading ? (
                renderSkeletonRows()
              ) : webhooks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={userData?.role === "ADMIN" ? 5 : 4}
                    className="text-center"
                  >
                    ไม่พบ webhook
                  </TableCell>
                </TableRow>
              ) : (
                webhooks.map((webhook) => (
                  <TableRow key={webhook.dc_webhook_id}>
                    <TableCell className="truncate" title={webhook.webhook_name}>
                      {webhook.webhook_name}
                    </TableCell>
                    <TableCell className="truncate" title={webhook.webhook_url}>
                      {webhook.webhook_url.length > 10
                        ? webhook.webhook_url.slice(0, 20) + "..."
                        : webhook.webhook_url}
                    </TableCell>
                    <TableCell>
                      {new Date(webhook.created_at * 1000).toLocaleDateString("th-TH")}
                    </TableCell>
                    {userData?.role === "ADMIN" && (
                      <TableCell>{webhook.user_email || "N/A"}</TableCell>
                    )}
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(webhook)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setWebhookIdToDelete(webhook.dc_webhook_id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <PaginationComponent
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้จะลบ webhook ออกจากรายการ คุณต้องการดำเนินการต่อหรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isLoadingDelete}
              onClick={() => setWebhookIdToDelete(null)}
            >
              ยกเลิก
            </AlertDialogCancel>
            <Button disabled={isLoadingDelete} onClick={handleDeleteWebhook}>
              {isLoadingDelete ? "กำลังลบ..." : "ลบ"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DiscordWebHookList;