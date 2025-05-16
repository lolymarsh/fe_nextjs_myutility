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
import { Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import PaginationComponent from "@/components/PaginationComponent";
import {  epochMillisecondsToOnlyDate } from "@/lib/dateUtils";
import { Calendar } from "@/components/ui/calendar";
import dayjs from "dayjs";

const TodoList = ({ userData, accessToken }) => {
  const [listWebhooks, setListWebhooks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [taskForm, setTaskForm] = useState({
    task_id: null,
    task_name: "",
    seq: 0,
    description: "",
    mode: "daily",
    status: "pending",
    webhook_id: "NO_WEBHOOK",
    due_date: 0,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    mode: "all",
    status: "all",
    is_active: "true",
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
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);

  const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": `${accessToken}`,
    },
  });

  const fetchTasks = async (page = 1, pageSize = pagination.pageSize) => {
    setIsPageLoading(true);
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
      if (filters.user_id !== "all") {
        keywords.push({ field: "user_id", value: filters.user_id });
      }

      const response = await api.post("/todo/filter", {
        keywords,
        sort_name: "seq",
        sort_by: "asc",
        page,
        page_size: pageSize,
      });

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
      setIsPageLoading(false);
    }
  };

  const fetchWebhooks = async (page = 1, pageSize = 100) => {
    try {
      const keywords = [{
        "field": "user_id",
        "value": userData?.user_id
      }];
      const respListWebhooks = await api.post("/discord_webhook/filter", {
        keywords,
        sort_name: "created_at",
        sort_by: "desc",
        page,
        page_size: pageSize,
      });

      if (respListWebhooks?.data) {
        setListWebhooks(respListWebhooks.data.data || []);
      }
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูล Webhook ได้", { description: "เกิดข้อผิดพลาด" });
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

  const handleSubmitTask = async () => {
    if (!validateTask(taskForm)) {
      return;
    }
    try {
      const payload = { 
        ...taskForm, 
        dc_webhook_id: taskForm.mode === "one_time" && taskForm.status === "completed" ? "" : 
                       taskForm.webhook_id === "NO_WEBHOOK" ? "" : taskForm.webhook_id, 
        due_date: taskForm.status === "completed" ? 0 : dayjs(taskForm.due_date).valueOf() || 0
      };

      const endpoint = isEditMode ? "/todo/update" : "/todo/insert";
      const response = await api.post(endpoint, payload);
      if (response?.data) {
        toast.success(isEditMode ? "อัปเดตงานเรียบร้อย" : "เพิ่มงานเรียบร้อย");
        setIsDialogOpen(false);
        resetTaskForm();
        fetchTasks(pagination.currentPage);
      }
    } catch (error) {
      toast.error(isEditMode ? "ไม่สามารถอัปเดตงานได้" : "ไม่สามารถเพิ่มงานได้", {
        description: "เกิดข้อผิดพลาด",
      });
    }
  };

  const handleDeleteTask = async () => {
    try {
      setIsLoadingDelete(true);
      const response = await api.post("/todo/update/is_active", {
        task_id: taskIdToDelete,
        is_active: false,
      });
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

  const resetTaskForm = () => {
    setTaskForm({
      task_id: null,
      task_name: "",
      seq: 0,
      description: "",
      mode: "daily",
      status: "pending",
      webhook_id: "NO_WEBHOOK",
      due_date: 0,
    });
    setIsEditMode(false);
  };

  const openEditDialog = (task) => {
    setTaskForm({
      task_id: task.task_id,
      task_name: task.task_name,
      seq: task.seq,
      description: task.description,
      mode: task.mode,
      status: task.status,
      webhook_id: task.dc_webhook_id || "NO_WEBHOOK",
      due_date: task.due_date || 0,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

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

  const currentEpochMili = dayjs().startOf('day').valueOf();

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">สิ่งที่ต้องทำ</h1>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetTaskForm();
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>เพิ่มงาน</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditMode ? "แก้ไขงาน" : "เพิ่มงานใหม่"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="task_name" className="text-right">
                      ชื่องาน
                    </Label>
                    <Input
                      id="task_name"
                      value={taskForm.task_name}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, task_name: e.target.value })
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
                      value={taskForm.seq}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, seq: parseInt(e.target.value) })
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
                      value={taskForm.description}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, description: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mode" className="text-right">
                      รูปแบบ
                    </Label>
                    <Select
                      value={taskForm.mode}
                      onValueChange={(value) =>
                        setTaskForm({ ...taskForm, mode: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="เลือกรูปแบบ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">รายวัน</SelectItem>
                        {/* <SelectItem value="weekly">รายสัปดาห์</SelectItem>
                        <SelectItem value="monthly">รายเดือน</SelectItem>
                        <SelectItem value="yearly">รายปี</SelectItem> */}
                        <SelectItem value="one_time">ครั้งเดียว</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      สถานะ
                    </Label>
                    <Select
                      value={taskForm.status}
                      onValueChange={(value) =>
                        setTaskForm({ ...taskForm, status: value })
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
                  {taskForm.status !== "completed" && (
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="webhook" className="text-right">
                      เลือก Webhook
                    </Label>
                    <Select
                      value={taskForm.webhook_id}
                      onValueChange={(value) =>
                        setTaskForm({ ...taskForm, webhook_id: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="เลือก Webhook" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NO_WEBHOOK">ไม่ต้องส่ง Webhook</SelectItem>
                        {listWebhooks.map((webhook) => (
                          <SelectItem key={webhook.dc_webhook_id} value={webhook.dc_webhook_id}>
                            {webhook.webhook_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  )}
                  {taskForm.mode !== "daily" && taskForm.status !== "completed" && taskForm.webhook_id !== "NO_WEBHOOK" && (
                   
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="due_date" className="text-right">
                        วันแจ้งเตือน
                      </Label>
                       <Calendar
                                mode="single"
                                selected={dayjs(taskForm.due_date).toDate()}
                                onSelect={(selectedDate) => {
                                  setTaskForm({ ...taskForm, due_date: selectedDate });
                                }}
                                
                              />
                    </div>
                   
                  )}
                </div>
                <Button onClick={handleSubmitTask}>
                  {isEditMode ? "อัปเดตงาน" : "เพิ่มงาน"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        <div className="mb-4">
          {/* description gray text */}
          <p className="text-gray-500">หากเป็นรายวันจะแจ้งเตือนทุกๆ 18:00</p>
          <p className="text-gray-500">หากเป็นครั้งเดียวจะแจ้งเตือนตามวันที่กำหนดก่อน 7 วัน</p>
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
                {/* <SelectItem value="weekly">รายสัปดาห์</SelectItem>
                <SelectItem value="monthly">รายเดือน</SelectItem>
                <SelectItem value="yearly">รายปี</SelectItem> */}
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
                <TableHead className="w-[60px] min-w-[60px]">ลำดับ</TableHead>
                <TableHead className="w-[200px] min-w-[150px] max-w-[200px]">ชื่องาน</TableHead>
                <TableHead className="w-[200px] min-w-[200px] max-w-[200px]">คำอธิบาย</TableHead>
                <TableHead className="w-[100px] min-w-[100px]">รูปแบบ</TableHead>
                <TableHead className="w-[120px] min-w-[120px]">สถานะ</TableHead>
                <TableHead className="w-[120px] min-w-[120px]">Webhook</TableHead>
                <TableHead className="w-[120px] min-w-[120px]">วันแจ้งเตือน</TableHead>
                {userData?.role === "ADMIN" && (
                  <TableHead className="w-[120px] min-w-[120px]">ผู้สร้าง</TableHead>
                )}
                <TableHead className="w-[120px] min-w-[120px]">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPageLoading ? (
                renderSkeletonRows()
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={userData?.role === "ADMIN" ? 7 : 6} className="text-center">
                    ไม่พบงาน
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.task_id}>
                    <TableCell>{task.seq}</TableCell>
                    <TableCell title={task.task_name}>
                      {task.task_name.slice(0, 20) + "..."}
                    </TableCell>
                    <TableCell title={task.description}>
                      {task.description.slice(0, 20) + "..."}
                    </TableCell>
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
                    <TableCell>{task.dc_webhook_name}</TableCell>
                    <TableCell>
                      {task.due_date > 0 && task.due_date < currentEpochMili ? (
                        <Badge variant="destructive">หมดเขต</Badge>
                      ) : (
                        epochMillisecondsToOnlyDate(task.due_date)
                      )}
                    </TableCell>
                    {userData?.role === "ADMIN" && (
                      <TableCell>{task?.user_owner_email.slice(0, 20) + "..."}</TableCell>
                    )}
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(task)}
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
    </div>
  );
};

export default TodoList;