import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Sparkles,
  LogOut,
  Plus,
  Trash2,
  ShieldCheck,
  User,
  Lock,
  Loader2,
  CheckCircle2,
  Server,
  Package,
  Heart,
} from "lucide-react";

const API = "http://34.102.241.32";

// ==========================
// AXIOS INSTANCE
// ==========================
const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default function App() {
  // ==========================
  // AUTH
  // ==========================
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // ==========================
  // ITEMS
  // ==========================
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  // ==========================
  // HEALTH
  // ==========================
  const [health, setHealth] = useState(null);

  // ==========================
  // UI
  // ==========================
  const [loading, setLoading] = useState(false);

  // ==========================
  // LOGIN
  // ==========================
  const login = async () => {
    try {
      setLoading(true);

      const { data } = await api.post("/auth/login", {
        username,
        password,
      });

      setToken(data.token);
      localStorage.setItem("token", data.token);

      setTimeout(() => {
        setLoading(false);
      }, 700);
    } catch (err) {
      setLoading(false);
      alert("Login failed ❌");
      console.log(err);
    }
  };

  // ==========================
  // REGISTER
  // ==========================
  const register = async () => {
    try {
      setLoading(true);

      await api.post("/auth/register", {
        username,
        password,
      });

      setLoading(false);

      alert("Compte créé avec succès 🚀");
    } catch (err) {
      setLoading(false);
      alert("Register failed ❌");
    }
  };

  // ==========================
  // LOGOUT
  // ==========================
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  // ==========================
  // FETCH ITEMS
  // ==========================
  const fetchItems = async () => {
    try {
      const { data } = await api.get("/api/items");
      setItems(data);
    } catch (err) {
      console.log(err);
    }
  };

  // ==========================
  // ADD ITEM
  // ==========================
  const addItem = async () => {
    if (!name) return;

    await api.post("/api/items", {
      name,
      description: desc,
    });

    setName("");
    setDesc("");

    fetchItems();
  };

  // ==========================
  // DELETE ITEM
  // ==========================
  const deleteItem = async (id) => {
    await api.delete(`/api/items/${id}`);
    fetchItems();
  };

  // ==========================
  // HEALTH CHECK
  // ==========================
  const fetchHealth = async () => {
    try {
      const { data } = await api.get("/health");
      setHealth(data);
    } catch (err) {
      console.log(err);
    }
  };

  // ==========================
  // INIT
  // ==========================
  useEffect(() => {
    fetchHealth();

    if (token) {
      fetchItems();
    }
  }, [token]);

  // ==========================
  // LOGIN PAGE
  // ==========================
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center px-4 overflow-hidden">

        {/* Glow */}
        <div className="absolute w-[400px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full top-0 left-0"></div>
        <div className="absolute w-[300px] h-[300px] bg-cyan-400/20 blur-[100px] rounded-full bottom-0 right-0"></div>

        <div className="relative w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl text-white">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-500/20 p-4 rounded-2xl mb-4">
              <Sparkles size={38} className="text-cyan-300" />
            </div>

            <h1 className="text-4xl font-black tracking-tight">
              MERN Cloud
            </h1>

            <p className="text-slate-300 mt-2 text-center">
              Kubernetes • Docker • GCP • Microservices
            </p>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="text-sm text-slate-300 mb-2 block">
              Username
            </label>

            <div className="flex items-center bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
              <User className="text-slate-300 mr-3" size={18} />

              <input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent outline-none w-full text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-sm text-slate-300 mb-2 block">
              Password
            </label>

            <div className="flex items-center bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
              <Lock className="text-slate-300 mr-3" size={18} />

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent outline-none w-full text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">

            <button
              onClick={login}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] transition-all duration-300 rounded-2xl py-3 font-bold shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Connexion...
                </div>
              ) : (
                "Se connecter"
              )}
            </button>

            <button
              onClick={register}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl py-3 font-semibold transition-all"
            >
              Créer un compte
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-slate-400">
            Powered by React + Express + Kubernetes
          </div>
        </div>
      </div>
    );
  }

  // ==========================
  // DASHBOARD
  // ==========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-6">

      {/* TOPBAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">

        <div>
          <h1 className="text-4xl font-black flex items-center gap-3">
            🚀 MERN Dashboard
          </h1>

          <p className="text-slate-400 mt-2">
            Microservices architecture on Kubernetes
          </p>
        </div>

        <button
          onClick={logout}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-red-500/20 border border-red-500/20 hover:bg-red-500/30 px-5 py-3 rounded-2xl transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm">Services</p>
              <h2 className="text-3xl font-black mt-2">3</h2>
            </div>

            <Server className="text-cyan-300" size={38} />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm">Items</p>
              <h2 className="text-3xl font-black mt-2">
                {items.length}
              </h2>
            </div>

            <Package className="text-green-300" size={38} />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm">Status</p>

              <h2 className="text-2xl font-black mt-2 text-green-400 flex items-center gap-2">
                <CheckCircle2 size={22} />
                Healthy
              </h2>
            </div>

            <ShieldCheck className="text-blue-300" size={38} />
          </div>
        </div>
      </div>

      {/* HEALTH */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-5 mb-8">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-green-400" />

          <div>
            <p className="font-bold">Health Service</p>

            <p className="text-sm text-slate-300 mt-1">
              {health ? JSON.stringify(health) : "Loading..."}
            </p>
          </div>
        </div>
      </div>

      {/* ADD ITEM */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8">

        <h2 className="text-2xl font-bold mb-5">
          Ajouter un item
        </h2>

        <div className="grid md:grid-cols-3 gap-4">

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom"
            className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 outline-none placeholder:text-slate-400"
          />

          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
            className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 outline-none placeholder:text-slate-400"
          />

          <button
            onClick={addItem}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
          >
            <Plus size={18} />
            Ajouter
          </button>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6">

        <h2 className="text-2xl font-bold mb-5">
          Liste des items
        </h2>

        <div className="space-y-4">

          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-white/10 transition-all"
            >
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Heart className="text-pink-400" size={18} />
                  {item.name}
                </h3>

                <p className="text-slate-400 mt-1">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => deleteItem(item._id)}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/20 p-3 rounded-xl transition-all"
              >
                <Trash2 size={18} className="text-red-400" />
              </button>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}