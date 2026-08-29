import express, { Request, Response } from 'express';
import { randomUUID } from 'crypto';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const app = express();
app.use(express.json());

// In-memory store. Resets on every cold start — a real database
// replaces this once we move past this first lesson.
const tasks: Task[] = [];

app.post('/tasks', (req: Request, res: Response) => {
  const { title } = req.body ?? {};

  if (typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }

  const task: Task = { id: randomUUID(), title, completed: false };
  tasks.push(task);

  res.status(201).json(task);
});

export default app;
