"use client";

import { useState, useEffect } from "react";


/**
 * Task shape
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

  const [email, setEmail] = useState("test@example.com");
  const [name, setName] = useState("Test User");
  
  useEffect(() => {
    fetch(`/api/tasks?email=${email}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch tasks: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error("Expected array but got:", data);
          setTasks([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      });
  }, [email]);
  
  /**
   * Add a new task
   */
  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
  
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTaskTitle,
        user_email: email,
        user_name: name,
      }),
    });
  
    if (!res.ok) {
      const error = await res.json();
      console.error("Failed to add task:", error);
      return;
    }
  
    const newTask = await res.json();
    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle("");
  };
  

  /**
   * Toggle task completion
   */
  const toggleComplete = async (taskId: string, completed: boolean) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
  
    if (!res.ok) {
      const error = await res.json();
      console.error("Failed to toggle task:", error);
      return;
    }
  
    const updated = await res.json();
  
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? updated : t))
    );
  };
   
  const deleteTask = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    
    if (!res.ok) {
      const error = await res.json();
      console.error("Failed to delete task:", error);
      return;
    }
    
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
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
  const saveEdit = async (taskId: string) => {
    if (!editingTitle.trim()) return;
  
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingTitle }),
    });
  
    if (!res.ok) {
      const error = await res.json();
      console.error("Failed to update task:", error);
      return;
    }
  
    const updated = await res.json();
  
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? updated : t))
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
              checked={task.completed || false}
              onChange={() => toggleComplete(task.id, task.completed || false)}
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
                <button onClick={() => deleteTask(task.id)}>Delete</button>
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