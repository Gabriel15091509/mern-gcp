import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://34.120.24.189"; // ton Ingress IP

export default function App() {
  // AUTH
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  // ITEMS
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  // HEALTH
  const [health, setHealth] = useState(null);

  // -------------------------
  // HEALTH CHECK
  // -------------------------
  const fetchHealth = async () => {
    try {
      const { data } = await axios.get(`${API}/health`);
      setHealth(data);
    } catch (err) {
      console.log(err);
    }
  };

  // -------------------------
  // ITEMS
  // -------------------------
  const fetchItems = async () => {
    const { data } = await axios.get(`${API}/api/items`);
    setItems(data);
  };

  const addItem = async () => {
    await axios.post(`${API}/api/items`, {
      name,
      description: desc,
    });
    setName("");
    setDesc("");
    fetchItems();
  };

  const deleteItem = async (id) => {
    await axios.delete(`${API}/api/items/${id}`);
    fetchItems();
  };

  // -------------------------
  // AUTH
  // -------------------------
  const register = async () => {
    await axios.post(`${API}/auth/register`, {
      username,
      password,
    });
    alert("Compte créé !");
  };

  const login = async () => {
    const { data } = await axios.post(`${API}/auth/login`, {
      username,
      password,
    });

    setToken(data.token);
    alert("Login OK");
  };

  // INIT
  useEffect(() => {
    fetchItems();
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6 text-center">
        🚀 MERN Microservices Dashboard
      </h1>

      {/* HEALTH */}
      <div className="bg-green-700 p-3 rounded mb-6 text-center">
        <strong>Health:</strong>{" "}
        {health ? JSON.stringify(health) : "loading..."}
      </div>

      {/* AUTH SECTION */}
      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-xl mb-2">Auth</h2>

        <input
          className="p-2 m-1 text-black"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="p-2 m-1 text-black"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="mt-2">
          <button onClick={register} className="bg-blue-500 px-3 py-1 mr-2">
            Register
          </button>

          <button onClick={login} className="bg-green-500 px-3 py-1">
            Login
          </button>
        </div>

        {token && (
          <p className="mt-2 text-sm text-green-300">
            Token: {token.substring(0, 20)}...
          </p>
        )}
      </div>

      {/* ITEMS */}
      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-xl mb-2">Items</h2>

        <input
          className="p-2 m-1 text-black"
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="p-2 m-1 text-black"
          placeholder="description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <button onClick={addItem} className="bg-blue-600 px-3 py-1 ml-2">
          Adds
        </button>

        <ul className="mt-4">
          {items.map((item) => (
            <li
              key={item._id}
              className="flex justify-between bg-gray-700 p-2 mt-2 rounded"
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
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}