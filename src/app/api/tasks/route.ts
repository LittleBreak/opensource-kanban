import { NextResponse } from "next/server";
import fs from "fs/promises";
import type { Task } from "@/types/task";

const DATA_PATH = "/Users/caizongding.1/.openclaw/workspace-opensource/tasks/opensource-task.json";

async function readTasks(): Promise<Task[]> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeTasks(tasks: Task[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(tasks, null, 2), "utf-8");
}

export async function GET() {
  const tasks = await readTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const tasks = await readTasks();

  const newTask: Task = {
    id: `task-${Date.now()}`,
    title: body.title,
    description: body.description ?? "",
    status: body.status ?? "todo",
    difficulty: body.difficulty ?? "easy",
    estimatedTime: body.estimatedTime ?? "",
    link: body.link ?? "",
    createdAt: new Date().toISOString(),
    ...(body.resolution ? { resolution: body.resolution } : {}),
  };

  tasks.push(newTask);
  await writeTasks(tasks);
  return NextResponse.json(newTask, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const tasks = await readTasks();

  // Bulk update: replace all tasks (used for reordering / drag-drop)
  if (Array.isArray(body)) {
    await writeTasks(body);
    return NextResponse.json(body);
  }

  // Single update
  const idx = tasks.findIndex((t) => t.id === body.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  tasks[idx] = { ...tasks[idx], ...body };
  await writeTasks(tasks);
  return NextResponse.json(tasks[idx]);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  let tasks = await readTasks();
  tasks = tasks.filter((t) => t.id !== id);
  await writeTasks(tasks);
  return NextResponse.json({ success: true });
}
