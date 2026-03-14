"use client";

import { useState, useEffect } from "react";
import type { Task, TaskDifficulty, TaskStatus } from "@/types/task";

interface TaskModalProps {
  open: boolean;
  task: Task | null; // null = create mode
  onClose: () => void;
  onSave: (data: Partial<Task>) => void;
}

export default function TaskModal({ open, task, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<TaskDifficulty>("easy");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDifficulty(task.difficulty);
      setEstimatedTime(task.estimatedTime);
      setLink(task.link);
      setStatus(task.status);
    } else {
      setTitle("");
      setDescription("");
      setDifficulty("easy");
      setEstimatedTime("");
      setLink("");
      setStatus("todo");
    }
  }, [task, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(task ? { id: task.id } : {}),
      title,
      description,
      difficulty,
      estimatedTime,
      link,
      status,
    });
    onClose();
  };

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a2e] p-6 shadow-2xl"
      >
        <h2 className="mb-5 text-lg font-semibold text-white/90">
          {task ? "编辑任务" : "新建任务"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">
              标题 *
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="任务标题"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="任务描述..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/50">
                难度
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as TaskDifficulty)}
                className={inputClass}
              >
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/50">
                预估时间
              </label>
              <input
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className={inputClass}
                placeholder="如 30min / 2h"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">
              状态
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className={inputClass}
            >
              <option value="todo">待办</option>
              <option value="in-progress">进行中</option>
              <option value="done">已完成</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">
              关联链接
            </label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className={inputClass}
              placeholder="https://github.com/..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            {task ? "保存" : "创建"}
          </button>
        </div>
      </form>
    </div>
  );
}
