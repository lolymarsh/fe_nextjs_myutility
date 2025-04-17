"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import { Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import PaginationComponent from "@/components/PaginationComponent";

const TodoList = ({ userData, accessToken }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    task_name: "",
    seq: 0,
    description: "",
    mode: "daily",
    status: "pending",
  });
  const [editTask, setEditTask] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    mode: "all",
    status: "all",
    is_active: "true",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
  });
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);

  const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": `${accessToken}`,
    },
  });

  const fetchTasks = async (page = 1, pageSize = pagination.pageSize) => {
    setIsLoading(true);
    try {
      const keywords = [];
      if (filters.search) {
        keywords.push({ field: "search", value: filters.search });
      }
      if (filters.mode !== "all") {
        keywords.push({ field: "mode", value: filters.mode });
      }
      if (filters.status !== "all") {
        keywords.push({ field: "status", value: filters.status });
      }
      if (filters.is_active) {
        keywords.push({ field: "is_active", value: filters.is_active });
      }
  
      const response = await api.post(
        "/todo/filter",
        {
          keywords,
          sort_name: "seq",
          sort_by: "asc",
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
        setTasks(response.data.data || []);
        setPagination({
          currentPage: page,
          pageSize: pageSize,
          totalPages: Math.ceil((response.data.total || 0) / pageSize),
          totalItems: response.data.total || 0,
        });
      }
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลงานได้", { description: "เกิดข้อผิดพลาด" });
    } finally {
      setIsLoading(false);
    }
  };

  const validateTask = (task) => {
    if (!task.task_name.trim()) {
      toast.error("ชื่องานต้องไม่ว่างเปล่า");
      return false;
    }
    if (isNaN(task.seq) || task.seq <= 0) {
      toast.error("ลำดับต้องเป็นตัวเลขที่มากกว่า 0");
      return false;
    }
    return true;
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleAddTask = async () => {
    if (!validateTask(newTask)) {
      return;
    }
    try {
      const response = await api.post(
        "/todo/insert",
        { ...newTask },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": `${accessToken}`,
          },
        }
      );
      if (response?.data) {
        toast.success("เพิ่มงานเรียบร้อย");
        setIsAddOpen(false);
        setNewTask({
          task_name: "",
          seq: 0,
          description: "",
          mode: "daily",
          status: "pending",
        });
        fetchTasks(pagination.currentPage);
      }
    } catch (error) {
      toast.error("ไม่สามารถเพิ่มงานได้", { description: "เกิดข้อผิดพลาด" });
    }
  };

  const handleUpdateTask = async () => {
    if (!validateTask(editTask)) {
      return;
    }
    try {
      const response = await api.post(
        "/todo/update",
        { ...editTask },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": `${accessToken}`,
          },
        }
      );
      if (response?.data) {
        toast.success("อัปเดตงานเรียบร้อย");
        setIsEditOpen(false);
        setEditTask(null);
        fetchTasks(pagination.currentPage);
      }
    } catch (error) {
      toast.error("ไม่สามารถอัปเดตงานได้", { description: "เกิดข้อผิดพลาด" });
    }
  };

  const handleDeleteTask = async () => {
    try {
      setIsLoadingDelete(true);
      const response = await api.post(
        "/todo/update/is_active",
        {
          task_id: taskIdToDelete,
          is_active: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": `${accessToken}`,
          },
        }
      );
      if (response?.data) {
        toast.success("ลบงานเรียบร้อย");
        fetchTasks(pagination.currentPage);
      }
    } catch (error) {
      toast.error("ไม่สามารถลบงานได้", { description: "เกิดข้อผิดพลาด" });
    } finally {
      setIsLoadingDelete(false);
      setIsDeleteDialogOpen(false);
      setTaskIdToDelete(null);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
      fetchTasks(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: 1,
    }));
    fetchTasks(1, newPageSize);
  };

  useEffect(() => {
    fetchTasks(pagination.currentPage);
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
        </TableRow>
      ));
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">รายการงาน</h1>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>เพิ่มงาน</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>เพิ่มงานใหม่</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="task_name" className="text-right">
                      ชื่องาน
                    </Label>
                    <Input
                      id="task_name"
                      value={newTask.task_name}
                      onChange={(e) =>
                        setNewTask({ ...newTask, task_name: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="seq" className="text-right">
                      ลำดับ
                    </Label>
                    <Input
                      id="seq"
                      type="number"
                      value={newTask.seq}
                      onChange={(e) =>
                        setNewTask({ ...newTask, seq: parseInt(e.target.value) })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      คำอธิบาย
                    </Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mode" className="text-right">
                      รูปแบบ
                    </Label>
                    <Select
                      value={newTask.mode}
                      onValueChange={(value) =>
                        setNewTask({ ...newTask, mode: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="เลือกรูปแบบ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">รายวัน</SelectItem>
                        <SelectItem value="weekly">รายสัปดาห์</SelectItem>
                        <SelectItem value="monthly">รายเดือน</SelectItem>
                        <SelectItem value="yearly">รายปี</SelectItem>
                        <SelectItem value="one_time">ครั้งเดียว</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      สถานะ
                    </Label>
                    <Select
                      value={newTask.status}
                      onValueChange={(value) =>
                        setNewTask({ ...newTask, status: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="เลือกสถานะ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">รอดำเนินการ</SelectItem>
                        <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                        <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddTask}>เพิ่มงาน</Button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-4 mb-4">
            <Input
              placeholder="ค้นหางานหรือคำอธิบาย"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-1/3"
            />
            <Select
              value={filters.mode}
              onValueChange={(value) => handleFilterChange("mode", value)}
            >
              <SelectTrigger className="w-1/4">
                <SelectValue placeholder="กรองตามรูปแบบ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="daily">รายวัน</SelectItem>
                <SelectItem value="weekly">รายสัปดาห์</SelectItem>
                <SelectItem value="monthly">รายเดือน</SelectItem>
                <SelectItem value="yearly">รายปี</SelectItem>
                <SelectItem value="one_time">ครั้งเดียว</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-1/4">
                <SelectValue placeholder="กรองตามสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="pending">รอดำเนินการ</SelectItem>
                <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ลำดับ</TableHead>
                <TableHead>ชื่องาน</TableHead>
                <TableHead>คำอธิบาย</TableHead>
                <TableHead>รูปแบบ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                renderSkeletonRows()
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    ไม่พบงาน
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.task_id}>
                    <TableCell>{task.seq}</TableCell>
                    <TableCell>{task.task_name}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          task.mode === "daily"
                            ? "default"
                            : task.mode === "weekly"
                            ? "secondary"
                            : task.mode === "monthly"
                            ? "outline"
                            : task.mode === "yearly"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {task.mode === "daily" && "รายวัน"}
                        {task.mode === "weekly" && "รายสัปดาห์"}
                        {task.mode === "monthly" && "รายเดือน"}
                        {task.mode === "yearly" && "รายปี"}
                        {task.mode === "one_time" && "ครั้งเดียว"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          task.status === "pending"
                            ? "secondary"
                            : task.status === "in_progress"
                            ? "default"
                            : "success"
                        }
                      >
                        {task.status === "pending" && "รอดำเนินการ"}
                        {task.status === "in_progress" && "กำลังดำเนินการ"}
                        {task.status === "completed" && "เสร็จสิ้น"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditTask({
                            task_id: task.task_id,
                            task_name: task.task_name,
                            seq: task.seq,
                            description: task.description,
                            mode: task.mode,
                            status: task.status,
                          });
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setTaskIdToDelete(task.task_id);
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
              การกระทำนี้จะลบงานออกจากรายการ คุณต้องการดำเนินการต่อหรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoadingDelete} onClick={() => setTaskIdToDelete(null)}>
              ยกเลิก
            </AlertDialogCancel>
            <Button disabled={isLoadingDelete} onClick={handleDeleteTask}>
              {isLoadingDelete ? "กำลังลบ..." : "ลบ"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขงาน</DialogTitle>
          </DialogHeader>
          {editTask && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task_name" className="text-right">
                  ชื่องาน
                </Label>
                <Input
                  id="task_name"
                  value={editTask.task_name}
                  onChange={(e) =>
                    setEditTask({ ...editTask, task_name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="seq" className="text-right">
                  ลำดับ
                </Label>
                <Input
                  id="seq"
                  type="number"
                  value={editTask.seq}
                  onChange={(e) =>
                    setEditTask({ ...editTask, seq: parseInt(e.target.value) })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  คำอธิบาย
                </Label>
                <Textarea
                  id="description"
                  value={editTask.description}
                  onChange={(e) =>
                    setEditTask({ ...editTask, description: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mode" className="text-right">
                  รูปแบบ
                </Label>
                <Select
                  value={editTask.mode}
                  onValueChange={(value) =>
                    setEditTask({ ...editTask, mode: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="เลือกรูปแบบ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">รายวัน</SelectItem>
                    <SelectItem value="weekly">รายสัปดาห์</SelectItem>
                    <SelectItem value="monthly">รายเดือน</SelectItem>
                    <SelectItem value="yearly">รายปี</SelectItem>
                    <SelectItem value="one_time">ครั้งเดียว</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  สถานะ
                </Label>
                <Select
                  value={editTask.status}
                  onValueChange={(value) =>
                    setEditTask({ ...editTask, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">รอดำเนินการ</SelectItem>
                    <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                    <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <Button onClick={handleUpdateTask}>อัปเดตงาน</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TodoList;