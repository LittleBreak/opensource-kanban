"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, TaskDifficulty } from "@/types/task";

const difficultyConfig: Record<
  TaskDifficulty,
  { label: string; color: string }
> = {
  easy: { label: "简单", color: "bg-emerald-500/20 text-emerald-400" },
  medium: { label: "中等", color: "bg-amber-500/20 text-amber-400" },
  hard: { label: "困难", color: "bg-rose-500/20 text-rose-400" },
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const diff = difficultyConfig[task.difficulty];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-white/20 ${
        isDragging ? "opacity-50 shadow-2xl" : ""
      }`}
    >
      {/* Drag handle + actions */}
      <div className="mb-2 flex items-start justify-between">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60 pt-0.5"
          title="拖拽排序"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white/80"
            title="编辑"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="rounded-md p-1 text-white/40 hover:bg-rose-500/20 hover:text-rose-400"
            title="删除"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-1 font-semibold text-white/90">{task.title}</h3>

      {/* Description */}
      {task.description && (
        <p className="mb-3 text-sm leading-relaxed text-white/50">
          {task.description}
        </p>
      )}

      {/* Resolution (only shown for done tasks with resolution) */}
      {task.resolution && (
        <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span>{task.resolution}</span>
        </div>
      )}

      {/* Tags row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-full px-2 py-0.5 font-medium ${diff.color}`}>
          {diff.label}
        </span>
        {task.estimatedTime && (
          <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-blue-400">
            {task.estimatedTime}
          </span>
        )}
      </div>

      {/* Footer: link + date */}
      <div className="mt-3 flex items-center justify-between text-xs text-white/30">
        <div className="flex items-center gap-2 truncate max-w-[70%]">
          {task.link && (
            <a
              href={task.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors truncate"
            >
              {task.link.replace(/^https?:\/\//, "").split("/").slice(0, 3).join("/")}
            </a>
          )}
          {task.prLink && (
            <a
              href={task.prLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 rounded bg-purple-500/15 px-1.5 py-0.5 text-purple-400 hover:bg-purple-500/25 transition-colors shrink-0"
              title={task.prLink}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
                <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 9.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm7.5-.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM4.25.5a2.75 2.75 0 0 0-.75 5.4v4.2a2.75 2.75 0 1 0 1.5 0V5.9a2.75 2.75 0 0 0-.75-5.4Zm0 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm0 8.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm7.5-1.5a2.75 2.75 0 1 0-1.5 0v.9a2.75 2.75 0 0 0-.75 5.4 2.75 2.75 0 0 0 .75-5.4v-.9Z"/>
              </svg>
              PR
            </a>
          )}
        </div>
        <span>{new Date(task.createdAt).toLocaleDateString("zh-CN")}</span>
      </div>
    </div>
  );
}
