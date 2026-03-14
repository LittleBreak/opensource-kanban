export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskDifficulty = "easy" | "medium" | "hard";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  difficulty: TaskDifficulty;
  estimatedTime: string;
  link: string;
  createdAt: string;
}
