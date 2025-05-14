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
import { Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import PaginationComponent from "@/components/PaginationComponent";
import dayjs from "dayjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { epochMillisecondsToDate } from "@/lib/dateUtils";

const UserList = ({ userData, accessToken }) => {
  const [pageData, setPageData] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    is_active: "all",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    first_name: "",
    last_name: "",
    first_name_th: "",
    last_name_th: "",
    email: "",
    new_password: "",
    role: "USER",
    is_active: true,
  });

  const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": `${accessToken}`,
    },
  });

  const validateForm = () => {
    if (!formData.first_name) {
      toast.error("กรุณากรอกชื่อ");
      return false;
    }
    if (!formData.last_name) {
      toast.error("กรุณากรอกนามสกุล");
      return false;
    }
    if (!formData.first_name_th) {
      toast.error("กรุณากรอกชื่อ (ภาษาไทย)");
      return false;
    }
    if (!formData.last_name_th) {
      toast.error("กรุณากรอกนามสกุล (ภาษาไทย)");
      return false;
    }
    if (!formData.email) {
      toast.error("กรุณากรอกอีเมล");
      return false;
    }
    if (!isEditMode && !formData.new_password) {
      toast.error("กรุณากรอกรหัสผ่าน");
      return false;
    }
    if (!["USER", "ADMIN"].includes(formData.role)) {
      toast.error("บทบาทไม่ถูกต้อง");
      return false;
    }
    return true;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;
    setIsSending(true)
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        first_name_th: formData.first_name_th,
        last_name_th: formData.last_name_th,
        email: formData.email,
        password: formData.new_password,
      };

      await api.post("/auth/register", payload);
      toast.success("สร้างผู้ใช้สำเร็จ");
      setIsDialogOpen(false);
      fetchPageData(pagination.currentPage);
      resetForm();
    } catch (error) {
      toast.error("ไม่สามารถสร้างผู้ใช้ได้", {
        description: error.response?.data?.message || "เกิดข้อผิดพลาด",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!validateForm()) return;
    setIsSending(true)

    try {
      const payload = {
        user_id: formData.user_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        first_name_th: formData.first_name_th,
        last_name_th: formData.last_name_th,
        email: formData.email,
        role: formData.role,
        is_active: formData.is_active,
      };

      if (formData.new_password) {
        payload.new_password = formData.new_password;
      }

      await api.post("/user/update", payload);
      toast.success("อัปเดตผู้ใช้สำเร็จ");
      setIsDialogOpen(false);
      fetchPageData(pagination.currentPage);
      resetForm();
    } catch (error) {
      toast.error("ไม่สามารถอัปเดตผู้ใช้ได้", {
        description: error.response?.data?.message || "เกิดข้อผิดพลาด",
      });
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: "",
      first_name: "",
      last_name: "",
      first_name_th: "",
      last_name_th: "",
      email: "",
      new_password: "",
      role: "USER",
      is_active: true,
    });
  };

  const openCreateDialog = () => {
    setIsEditMode(false);
    resetForm();
    setFormData({
      first_name: "",
      last_name: "",
      first_name_th: "",
      last_name_th: "",
      email: "",
      new_password: "",
      role: "USER",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (user) => {
    setIsEditMode(true);
    setFormData({
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      first_name_th: user.first_name_th,
      last_name_th: user.last_name_th,
      email: user.email,
      new_password: "",
      role: user.role,
      is_active: user.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const fetchPageData = async (page = 1, pageSize = pagination.pageSize) => {
    setIsPageLoading(true);
    try {
      const keywords = [];
      if (filters.search) {
        keywords.push({ field: "search", value: filters.search });
      }
      if (filters.is_active !== "all") {
        keywords.push({ field: "is_active", value: filters.is_active });
      }

      const response = await api.post(
        "/user/filter",
        {
          keywords,
          sort_name: "created_at",
          sort_by: "desc",
          page,
          page_size: pageSize,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": `${accessToken}`,
          },
        }
      );

      if (response?.data) {
        setPageData(response.data.data || []);
        setPagination({
          currentPage: page,
          pageSize: pageSize,
          totalPages: Math.ceil((response.data.total || 0) / pageSize),
          totalItems: response.data.total || 0,
        });
      }
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้", { description: "เกิดข้อผิดพลาด" });
    } finally {
      setIsPageLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
      fetchPageData(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: 1,
    }));
    fetchPageData(1, newPageSize);
  };

  useEffect(() => {
    fetchPageData(pagination.currentPage);
  }, [filters]);

  const renderSkeletonRows = () => {
    return Array(5)
      .fill()
      .map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-[50px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[150px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[200px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
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
            <h1 className="text-2xl font-bold">รายชื่อผู้ใช้</h1>
            <Button onClick={openCreateDialog}>เพิ่มผู้ใช้</Button>
          </div>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="ค้นหาผู้ใช้"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-1/3"
            />
            <Select
              value={filters.is_active}
              onValueChange={(value) => handleFilterChange("is_active", value)}
            >
              <SelectTrigger className="w-1/4">
                <SelectValue placeholder="กรองตามสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="true">เปิดใช้งาน</SelectItem>
                <SelectItem value="false">ปิดใช้งาน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] min-w-[60px]">ลำดับ</TableHead>
                <TableHead className="w-[150px] min-w-[150px] max-w-[200px]">
                  ชื่อ-นามสกุล
                </TableHead>
                <TableHead className="w-[200px] min-w-[200px] max-w-[300px]">
                  อีเมล
                </TableHead>
                <TableHead className="w-[100px] min-w-[100px]">บทบาท</TableHead>
                <TableHead className="w-[100px] min-w-[100px]">สถานะ</TableHead>
                <TableHead className="w-[150px] min-w-[150px]">
                  วันที่สร้าง
                </TableHead>
                <TableHead className="w-[150px] min-w-[150px]">
                  วันที่อัปเดต
                </TableHead>
                <TableHead className="w-[120px] min-w-[120px] text-center">
                  การจัดการ
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPageLoading ? (
                renderSkeletonRows()
              ) : pageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    ไม่พบผู้ใช้
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((user, index) => {
                  return (
                    <TableRow key={user.user_id}>
                      <TableCell>{index + 1 + (pagination.currentPage - 1) * pagination.pageSize}</TableCell>
                      <TableCell className="truncate" title={`${user.first_name_th} ${user.last_name_th}`}>
                        {`${user.first_name_th} ${user.last_name_th}`}
                      </TableCell>
                      <TableCell className="truncate" title={user.email}>
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "USER" ? "default" : "secondary"}>
                          {user.role === "USER" ? "ผู้ใช้" : "ผู้ดูแล"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "success" : "destructive"}>
                          {user.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {epochMillisecondsToDate(user.created_at)}
                      </TableCell>
                      <TableCell>
                        {epochMillisecondsToDate(user.updated_at)}
                      </TableCell>
                      <TableCell className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="first_name" className="text-right">
                ชื่อ
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="last_name" className="text-right">
                นามสกุล
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="first_name_th" className="text-right">
                ชื่อ (ไทย)
              </Label>
              <Input
                id="first_name_th"
                value={formData.first_name_th}
                onChange={(e) => setFormData({ ...formData, first_name_th: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="last_name_th" className="text-right">
                นามสกุล (ไทย)
              </Label>
              <Input
                id="last_name_th"
                value={formData.last_name_th}
                onChange={(e) => setFormData({ ...formData, last_name_th: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                อีเมล
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new_password" className="text-right">
                รหัสผ่าน{isEditMode ? " (ถ้ามี)" : ""}
              </Label>
              <Input
                id="new_password"
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                บทบาท
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">ผู้ใช้</SelectItem>
                  <SelectItem value="ADMIN">ผู้ดูแล</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                สถานะ
              </Label>
              <Select
                value={formData.is_active.toString()}
                onValueChange={(value) => setFormData({ ...formData, is_active: value === "true" })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">เปิดใช้งาน</SelectItem>
                  <SelectItem value="false">ปิดใช้งาน</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={isEditMode ? handleUpdateUser : handleCreateUser}
              disabled={isSending}
            >
              {isSending ? "กำลังส่ง..." : isEditMode ? "บันทึก" : "สร้าง"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserList;