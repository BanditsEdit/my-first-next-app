"use client";

import { useState } from "react";

/**
 * Task shape
 * This will later match the Supabase table
 */
type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export default function HomePage() {
  // Local state (temporary – Supabase replaces this in Phase 2)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  /**
   * Add a new task
   */
  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      completed: false,
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
  };

  /**
   * Toggle task completion
   */
  const toggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  /**
   * Start editing a task
   */
  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  /**
   * Save edited task
   */
  const saveEdit = (taskId: string) => {
    if (!editingTitle.trim()) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, title: editingTitle } : task
      )
    );

    setEditingTaskId(null);
    setEditingTitle("");
  };

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>My To-Do List</h1>

      {/* Add Task */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Add a task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={addTask}>Add</button>
      </div>

      {/* Task List */}
      <div>
        {tasks.length === 0 && (
          <p style={{ opacity: 0.6 }}>No tasks yet.</p>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(task.id)}
            />

            {editingTaskId === task.id ? (
              <>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  style={{ flex: 1, padding: 6 }}
                />
                <button onClick={() => saveEdit(task.id)}>Save</button>
              </>
            ) : (
              <>
                <span
                  style={{
                    flex: 1,
                    textDecoration: task.completed
                      ? "line-through"
                      : "none",
                    opacity: task.completed ? 0.6 : 1,
                  }}
                >
                  {task.title}
                </span>
                <button onClick={() => startEditing(task)}>Edit</button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Supabase placeholders */}
      {/* 
        TODO (Phase 2):
        - Fetch tasks from Supabase on page load
        - Create task via API route
        - Update task via API route
        - Delete task via API route
      */}
    </main>
  );
}