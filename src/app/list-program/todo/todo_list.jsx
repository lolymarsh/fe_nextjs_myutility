"use client";
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const TodoList = ({ userData, accessToken }) => {
  const [tasks, setTasks] = useState({
    pending: [],
    in_progress: [],
    completed: []
  });
  const [newTask, setNewTask] = useState({
    task_name: '',
    seq: 0,
    description: '',
    mode: 'one_time',
    status: 'pending'
  });

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      let payload = {
        "search": "",
        "page": 1,
        "page_size": 10
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/todo/filter`,
        payload,
        { headers: { "x-auth-token": `${accessToken}` } }
      );
      const taskData = response.data.data;
      setTasks({
        pending: taskData.filter(task => task.status === 'pending'),
        in_progress: taskData.filter(task => task.status === 'in_progress'),
        completed: taskData.filter(task => task.status === 'completed')
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Insert new task
  const handleInsertTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/todo/insert`,
        newTask,
        { headers: { "x-auth-token": `${accessToken}` } }
      );
      setNewTask({
        task_name: '',
        seq: 0,
        description: '',
        mode: 'one_time',
        status: 'pending'
      });
      fetchTasks();
    } catch (error) {
      console.error('Error inserting task:', error);
    }
  };

  // Update task status
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/todo/update`,
        { task_id: taskId, status: newStatus },
        { headers: { "x-auth-token": `${accessToken}` } }
      );
      fetchTasks();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Update task active status
  const handleUpdateActive = async (taskId, isActive) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/todo/update/is_active`,
        { task_id: taskId, is_active: isActive },
        { headers: { "x-auth-token": `${accessToken}` } }
      );
      fetchTasks();
    } catch (error) {
      console.error('Error updating active status:', error);
    }
  };

  // Handle drag and drop
  const onDragEnd = (result) => {
    const { source, destination } = result;
    
    if (!destination) return;

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;
    const sourceTasks = [...tasks[sourceColumn]];
    const destTasks = [...tasks[destColumn]];
    
    const [movedTask] = sourceTasks.splice(source.index, 1);
    
    if (sourceColumn === destColumn) {
      sourceTasks.splice(destination.index, 0, movedTask);
      setTasks({ ...tasks, [sourceColumn]: sourceTasks });
    } else {
      movedTask.status = destColumn;
      destTasks.splice(destination.index, 0, movedTask);
      setTasks({
        ...tasks,
        [sourceColumn]: sourceTasks,
        [destColumn]: destTasks
      });
      handleUpdateStatus(movedTask.task_id, destColumn);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Todo List</h1>
      
      {/* Form for new task */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleInsertTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="task_name">Task Name</Label>
                <Input
                  id="task_name"
                  type="text"
                  value={newTask.task_name}
                  onChange={(e) => setNewTask({...newTask, task_name: e.target.value})}
                  placeholder="Enter task name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="seq">Sequence</Label>
                <Input
                  id="seq"
                  type="number"
                  value={newTask.seq}
                  onChange={(e) => setNewTask({...newTask, seq: parseInt(e.target.value)})}
                  placeholder="Sequence"
                  required
                />
              </div>
              <div>
                <Label htmlFor="mode">Mode</Label>
                <Select
                  value={newTask.mode}
                  onValueChange={(value) => setNewTask({...newTask, mode: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One Time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  Add Task
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Drag and drop context */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['pending', 'in_progress', 'completed'].map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <Card
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {status.replace('_', ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tasks[status]
                      .sort((a, b) => a.seq - b.seq)
                      .map((task, index) => (
                        <Draggable
                          key={task.task_id}
                          draggableId={task.task_id}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-2"
                            >
                              <CardContent className="pt-4">
                                <h3 className="font-medium">{task.task_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {task.description}
                                </p>
                                <p className="text-sm">Mode: {task.mode}</p>
                                <p className="text-sm">Seq: {task.seq}</p>
                                <Button
                                  variant={task.is_active ? "default" : "destructive"}
                                  size="sm"
                                  className="mt-2"
                                  onClick={() =>
                                    handleUpdateActive(task.task_id, !task.is_active)
                                  }
                                >
                                  {task.is_active ? 'Active' : 'Inactive'}
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </CardContent>
                </Card>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TodoList;