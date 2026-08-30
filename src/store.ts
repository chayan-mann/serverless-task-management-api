export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

// In-memory store, shared by handlers within this same deployed package.
// Resets on every cold start — a real database replaces this once we
// move past this first lesson.
export const tasks: Task[] = [];
