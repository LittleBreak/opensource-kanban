"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@/types/task";
import Column from "./Column";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

const STATUSES: TaskStatus[] = ["todo", "in-progress", "done"];

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Persist tasks to server
  const persistTasks = useCallback(async (updated: Task[]) => {
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  }, []);

  // Get tasks for a column
  const getColumnTasks = useCallback(
    (status: TaskStatus) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  // Find which column a task belongs to
  const findTaskStatus = useCallback(
    (taskId: string): TaskStatus | undefined => {
      return tasks.find((t) => t.id === taskId)?.status;
    },
    [tasks]
  );

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeStatus = findTaskStatus(activeId);
    // over could be a task id or a column id (status)
    const overStatus = STATUSES.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : findTaskStatus(overId);

    if (!activeStatus || !overStatus || activeStatus === overStatus) return;

    setTasks((prev) => {
      return prev.map((t) =>
        t.id === activeId ? { ...t, status: overStatus } : t
      );
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) {
      // Same item — persist current state (status may have changed in handleDragOver)
      persistTasks(tasks);
      return;
    }

    // Reorder within the same column
    const activeStatus = findTaskStatus(activeId);
    const overStatus = STATUSES.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : findTaskStatus(overId);

    if (activeStatus && overStatus && activeStatus === overStatus) {
      const columnTasks = tasks.filter((t) => t.status === activeStatus);
      const oldIdx = columnTasks.findIndex((t) => t.id === activeId);
      const newIdx = columnTasks.findIndex((t) => t.id === overId);

      if (oldIdx !== -1 && newIdx !== -1) {
        const reordered = arrayMove(columnTasks, oldIdx, newIdx);
        const otherTasks = tasks.filter((t) => t.status !== activeStatus);
        const updated = [...otherTasks, ...reordered];
        setTasks(updated);
        persistTasks(updated);
        return;
      }
    }

    persistTasks(tasks);
  };

  // CRUD handlers
  const handleCreate = async (data: Partial<Task>) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const newTask = await res.json();
    setTasks((prev) => [...prev, newTask]);
  };

  const handleEdit = async (data: Partial<Task>) => {
    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = (data: Partial<Task>) => {
    if (editingTask) {
      handleEdit(data);
    } else {
      handleCreate(data);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0f0f1a]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-white/90 tracking-tight">
            Open Source Kanban
          </h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            新建任务
          </button>
        </div>
      </header>

      {/* Board */}
      <main className="mx-auto max-w-7xl p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STATUSES.map((status) => (
              <Column
                key={status}
                status={status}
                tasks={getColumnTasks(status)}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 scale-105">
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Modal */}
      <TaskModal
        open={modalOpen}
        task={editingTask}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
