"use client";

import { useState, useEffect } from "react";


/**
 * Task shape
 */
type Task = {
  id: string;
  title: string;
  completed: boolean;
  enhanced_title?: string;
};

/**
 * Chat message shape
 */
type ChatMessage = {
  role: "user" | "bot";
  content: string;
};

export default function HomePage() {
  // Local state (temporary – Supabase replaces this in Phase 2)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("test@example.com");
  const [name, setName] = useState("Test User");
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  
  useEffect(() => {
    setError(null);
    fetch(`/api/tasks?email=${email}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.error || `Failed to fetch tasks: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setTasks(data);
          setError(null);
        } else if (data.error) {
          setError(data.error);
          setTasks([]);
        } else {
          console.error("Expected array but got:", data);
          setTasks([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        setError(error.message || "Failed to load tasks. Please check your configuration.");
        setTasks([]);
      });
  }, [email]);
  
  /**
   * Add a new task
   */
  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
  
    setError(null);
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
      const errorData = await res.json();
      const errorMessage = errorData.error || "Failed to add task";
      setError(errorMessage);
      console.error("Failed to add task:", errorData);
      return;
    }
  
    const newTask = await res.json();
    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle("");
    setError(null);
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

  /**
   * Display enhanced title if available, otherwise use regular title
   */
  const displayTitle = (task: Task) => {
    return task.enhanced_title && task.enhanced_title.trim()
      ? task.enhanced_title
      : task.title;
  };

  /**
   * Send a chat message and get bot response
   */
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    // show user message immediately
    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: chatInput },
    ]);

    const messageToSend = chatInput;
    setChatInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        message: messageToSend,
      }),
    });

    const data = await res.json();

    setChatMessages((prev) => [
      ...prev,
      { role: "bot", content: data.reply },
    ]);

    // keep UI in sync with chat actions
    fetch(`/api/tasks?email=${email}`)
      .then((r) => r.json())
      .then(setTasks);
  };

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>My To-Do List</h1>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: 12,
            marginBottom: 20,
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: 4,
            color: "#c33",
          }}
        >
          <strong>Error:</strong> {error}
          {error.includes("SUPABASE_URL") && (
            <div style={{ marginTop: 8, fontSize: 14 }}>
              Please update your <code>.env.local</code> file with your actual Supabase credentials.
            </div>
          )}
        </div>
      )}

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
                  {displayTitle(task)}
                </span>
                <button onClick={() => startEditing(task)}>Edit</button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>

      <hr style={{ margin: "40px 0" }} />

      <h2>Chatbot</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 12,
          borderRadius: 6,
          marginBottom: 12,
          maxHeight: 200,
          overflowY: "auto",
        }}
      >
        {chatMessages.length === 0 && (
          <p style={{ opacity: 0.6 }}>
            Hey there! <code> Talk to me about your to-do list </code>
          </p>
        )}

        {chatMessages.map((msg, i) => (
          <p key={i}>
            <strong>{msg.role === "user" ? "You" : "Bot"}:</strong>{" "}
            {msg.content}
          </p>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="#to-do list add buy groceries"
          style={{ flex: 1, padding: 8 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendChatMessage();
            }
          }}
        />
        <button onClick={sendChatMessage}>Send</button>
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