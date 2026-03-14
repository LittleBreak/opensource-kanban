"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { Task, TaskStatus } from "@/types/task";
import TaskCard from "./TaskCard";

const columnMeta: Record<
  TaskStatus,
  { emoji: string; title: string; accent: string }
> = {
  todo: {
    emoji: "\u{1F4CB}",
    title: "待办",
    accent: "border-t-sky-500",
  },
  "in-progress": {
    emoji: "\u{1F504}",
    title: "进行中",
    accent: "border-t-amber-500",
  },
  done: {
    emoji: "\u2705",
    title: "已完成",
    accent: "border-t-emerald-500",
  },
};

interface ColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function Column({ status, tasks, onEdit, onDelete }: ColumnProps) {
  const meta = columnMeta[status];
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      className={`flex min-h-[60vh] w-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md ${meta.accent} border-t-2`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-base font-semibold text-white/80">
          {meta.emoji} {meta.title}
        </h2>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/50">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex flex-1 flex-col gap-3 px-3 pb-4"
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex flex-1 items-center justify-center text-sm text-white/20">
              拖拽任务到此处
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
