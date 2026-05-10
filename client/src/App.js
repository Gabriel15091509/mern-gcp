import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Sparkles,
  LogOut,
  Plus,
  Trash2,
  Heart,
  Package,
  User,
  Lock,
  Mail,
  Loader2,
  CheckCircle,
} from "lucide-react";

const API = "http://34.102.241.32";

// -------------------------
// AXIOS INSTANCE
// -------------------------
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
  // -------------------------
  // AUTH STATE
  // -------------------------
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // login or register

  // -------------------------
  // ITEMS STATE
  // -------------------------
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [health, setHealth] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // =========================
  // NOTIFICATION SYSTEM
  // =========================
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // =========================
  // LOGIN / REGISTER
  // =========================
  const login = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", { username, password });
      setToken(data.token);
      localStorage.setItem("token", data.token);
      showNotification("Connexion réussie ! 🚀", "success");
      setUsername("");
      setPassword("");
    } catch (err) {
      showNotification("Échec de la connexion", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async () => {
    setIsLoading(true);
    try {
      await api.post("/auth/register", { username, password });
      showNotification("Compte créé avec succès ! 🎉", "success");
      setAuthMode("login");
      setUsername("");
      setPassword("");
    } catch (err) {
      showNotification("Échec de l'inscription", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    showNotification("Déconnexion réussie 👋", "success");
  };

  // =========================
  // ITEMS CRUD
  // =========================
  const fetchItems = async () => {
    try {
      const { data } = await api.get("/api/items");
      setItems(data);
    } catch (err) {
      console.error("Erreur lors du chargement des items", err);
    }
  };

  const addItem = async () => {
    if (!name.trim()) {
      showNotification("Le nom est requis", "error");
      return;
    }
    setIsAddingItem(true);
    try {
      await api.post("/api/items", { name, description: desc });
      setName("");
      setDesc("");
      await fetchItems();
      showNotification("Item ajouté avec succès ✨", "success");
    } catch (err) {
      showNotification("Erreur lors de l'ajout", "error");
    } finally {
      setIsAddingItem(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/api/items/${id}`);
      await fetchItems();
      showNotification("Item supprimé", "success");
    } catch (err) {
      showNotification("Erreur lors de la suppression", "error");
    }
  };

  // =========================
  // HEALTH CHECK
  // =========================
  const fetchHealth = async () => {
    try {
      const { data } = await api.get("/health");
      setHealth(data);
    } catch (err) {
      console.error("Health check failed", err);
    }
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
  // COMPONENTS
  // =========================
  const GlassCard = ({ children, className = "" }) => (
    <div className={`backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl ${className}`}>
      {children}
    </div>
  );

  const NotificationToast = () => (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-500 transform ${
        notification.show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`rounded-lg shadow-lg px-6 py-3 flex items-center gap-2 ${
          notification.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white`}
      >
        {notification.type === "success" ? (
          <CheckCircle size={20} />
        ) : (
          <Heart size={20} />
        )}
        <span>{notification.message}</span>
      </div>
    </div>
  );

  // =========================
  // LOGIN PAGE
  // =========================
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        </div>

        <GlassCard className="rounded-2xl p-8 w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 mx-auto shadow-lg">
              <Sparkles className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Bienvenue</h1>
            <p className="text-white/60">
              {authMode === "login" ? "Connectez-vous à votre compte" : "Créez un nouveau compte"}
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
              <input
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-all"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (authMode === "login" ? login() : register())}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
              <input
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-all"
                placeholder="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (authMode === "login" ? login() : register())}
              />
            </div>

            {authMode === "login" ? (
              <>
                <button
                  onClick={login}
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Se connecter"}
                </button>
                <p className="text-center text-white/60">
                  Pas de compte ?{" "}
                  <button
                    onClick={() => setAuthMode("register")}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    S'inscrire
                  </button>
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={register}
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "S'inscrire"}
                </button>
                <p className="text-center text-white/60">
                  Déjà un compte ?{" "}
                  <button
                    onClick={() => setAuthMode("login")}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Se connecter
                  </button>
                </p>
              </>
            )}
          </div>
        </GlassCard>

        <NotificationToast />
      </div>
    );
  }

  // =========================
  // DASHBOARD
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      <NotificationToast />

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Package className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Gestionnaire d'Items
              </h1>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-all hover:scale-105"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Health Status */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-full animate-pulse">
              <Heart size={16} className="text-white" />
            </div>
            <span className="text-green-300 font-mono">
              {health ? `✅ ${JSON.stringify(health)}` : "🔄 Vérification du service..."}
            </span>
          </div>
        </div>

        {/* Add Item Form */}
        <GlassCard className="rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={20} className="text-purple-400" />
            Ajouter un item
          </h2>
          <div className="space-y-4">
            <input
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-all"
              placeholder="Nom de l'item"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-all resize-none"
              placeholder="Description"
              rows="2"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <button
              onClick={addItem}
              disabled={isAddingItem}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
            >
              {isAddingItem ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Ajouter l'item"}
            </button>
          </div>
        </GlassCard>

        {/* Items List */}
        <GlassCard className="rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Package size={20} className="text-purple-400" />
            Mes Items • {items.length}
          </h2>
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <Package size={48} className="mx-auto mb-3 opacity-50" />
                <p>Aucun item pour le moment</p>
                <p className="text-sm">Ajoutez votre premier item ci-dessus ✨</p>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item._id}
                  className="group relative bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all hover:transform hover:scale-[1.02] cursor-pointer"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.05}s`,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{item.name}</h3>
                      <p className="text-white/40 text-sm">{item.description || "Pas de description"}</p>
                    </div>
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}