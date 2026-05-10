import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://34.120.24.189";

// -------------------------
// AXIOS INSTANCE (IMPORTANT)
// -------------------------
const api = axios.create({
  baseURL: API,
});

// inject token automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function App() {
  // -------------------------
  // AUTH STATE
  // -------------------------
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // -------------------------
  // ITEMS STATE
  // -------------------------
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const [health, setHealth] = useState(null);

  // =========================
  // LOGIN
  // =========================
  const login = async () => {
    try {
      const { data } = await api.post("/auth/login", {
        username,
        password,
      });

      setToken(data.token);
      localStorage.setItem("token", data.token);

      alert("Login OK 🚀");
    } catch (err) {
      alert("Login failed");
      console.log(err);
    }
  };

  const register = async () => {
    try {
      await api.post("/auth/register", {
        username,
        password,
      });

      alert("Compte créé !");
    } catch (err) {
      alert("Register failed");
    }
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  // =========================
  // ITEMS
  // =========================
  const fetchItems = async () => {
    const { data } = await api.get("/api/items");
    setItems(data);
  };

  const addItem = async () => {
    await api.post("/api/items", {
      name,
      description: desc,
    });

    setName("");
    setDesc("");
    fetchItems();
  };

  const deleteItem = async (id) => {
    await api.delete(`/api/items/${id}`);
    fetchItems();
  };

  // =========================
  // HEALTH
  // =========================
  const fetchHealth = async () => {
    const { data } = await api.get("/health");
    setHealth(data);
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    fetchHealth();

    if (token) {
      fetchItems();
    }
  }, [token]);

  // =========================
  // UI LOGIN PAGE
  // =========================
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="bg-gray-800 p-6 rounded w-96">
          <h1 className="text-xl mb-4 text-center">🔐 Login</h1>

          <input
            className="w-full p-2 mb-2 text-black"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="w-full p-2 mb-2 text-black"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={login} className="bg-green-600 w-full p-2 mb-2">
            Login
          </button>

          <button onClick={register} className="bg-blue-600 w-full p-2">
            Register
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // DASHBOARD (ITEMS)
  // =========================
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl">🚀 Dashboard Items</h1>
        <button onClick={logout} className="bg-red-600 px-3 py-1">
          Logout
        </button>
      </div>

      {/* HEALTH */}
      <div className="bg-green-700 p-3 rounded mb-4">
        Health: {health ? JSON.stringify(health) : "loading..."}
      </div>

      {/* ADD ITEM */}
      <div className="bg-gray-800 p-4 rounded mb-4">
        <input
          className="p-2 text-black mr-2"
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="p-2 text-black mr-2"
          placeholder="description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <button onClick={addItem} className="bg-blue-600 px-3 py-2">
          Add
        </button>
      </div>

      {/* LIST */}
      <div className="bg-gray-800 p-4 rounded">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex justify-between bg-gray-700 p-2 mb-2"
          >
            <span>
              {item.name} - {item.description}
            </span>

            <button
              onClick={() => deleteItem(item._id)}
              className="text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}