import React, { useState, useEffect, useCallback } from "react";
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
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const API = "http://34.102.241.32";

// -------------------------
// AXIOS INSTANCE
// -------------------------
const api = axios.create({
  baseURL: API,
  timeout: 10000, // Timeout de 10 secondes
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default function App() {
  // -------------------------
  // AUTH STATE
  // -------------------------
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // -------------------------
  // ITEMS STATE
  // -------------------------
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [health, setHealth] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);

  // -------------------------
  // NOTIFICATION SYSTEM
  // -------------------------
  const [notification, setNotification] = useState({ 
    show: false, 
    message: "", 
    type: "",
    id: null 
  });

  const showNotification = useCallback((message, type = "success") => {
    const id = Date.now();
    setNotification({ show: true, message, type, id });
    setTimeout(() => {
      setNotification(prev => {
        if (prev.id === id) {
          return { show: false, message: "", type: "", id: null };
        }
        return prev;
      });
    }, 3000);
  }, []);

  // =========================
  // LOGIN / REGISTER
  // =========================
  const validateInputs = () => {
    if (!username.trim()) {
      showNotification("Veuillez entrer un nom d'utilisateur", "error");
      return false;
    }
    if (!password.trim()) {
      showNotification("Veuillez entrer un mot de passe", "error");
      return false;
    }
    if (password.length < 3) {
      showNotification("Le mot de passe doit faire au moins 3 caractères", "error");
      return false;
    }
    return true;
  };

  const login = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", { 
        username: username.trim(), 
        password: password.trim() 
      });
      
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        showNotification("Connexion réussie ! 🚀", "success");
        setUsername("");
        setPassword("");
      } else {
        throw new Error("Token non reçu");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Échec de la connexion";
      showNotification(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    try {
      await api.post("/auth/register", { 
        username: username.trim(), 
        password: password.trim() 
      });
      showNotification("Compte créé avec succès ! 🎉", "success");
      setAuthMode("login");
      setUsername("");
      setPassword("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Échec de l'inscription";
      showNotification(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setToken("");
    localStorage.removeItem("token");
    setItems([]);
    showNotification("Déconnexion réussie 👋", "success");
  }, [showNotification]);

  // =========================
  // ITEMS CRUD
  // =========================
  const fetchItems = useCallback(async () => {
    if (!token) return;
    
    try {
      const { data } = await api.get("/api/items");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur lors du chargement des items:", err);
      if (err.response?.status === 401) {
        logout();
      } else {
        showNotification("Erreur de chargement des items", "error");
      }
    }
  }, [token, logout, showNotification]);

  const addItem = async () => {
    if (!name.trim()) {
      showNotification("Le nom est requis", "error");
      return;
    }
    
    if (name.length > 100) {
      showNotification("Le nom est trop long (max 100 caractères)", "error");
      return;
    }
    
    setIsAddingItem(true);
    try {
      await api.post("/api/items", { 
        name: name.trim(), 
        description: desc.trim() || "Pas de description" 
      });
      setName("");
      setDesc("");
      await fetchItems();
      showNotification("Item ajouté avec succès ✨", "success");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur lors de l'ajout";
      showNotification(errorMsg, "error");
    } finally {
      setIsAddingItem(false);
    }
  };

  const deleteItem = async (id) => {
    setIsDeletingId(id);
    try {
      await api.delete(`/api/items/${id}`);
      await fetchItems();
      showNotification("Item supprimé ✓", "success");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur lors de la suppression";
      showNotification(errorMsg, "error");
    } finally {
      setIsDeletingId(null);
    }
  };

  // =========================
  // HEALTH CHECK
  // =========================
  const fetchHealth = useCallback(async () => {
    try {
      const { data } = await api.get("/health");
      setHealth(data);
    } catch (err) {
      console.error("Health check failed:", err);
      setHealth({ status: "offline", error: "Service indisponible" });
    }
  }, []);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    if (token) {
      fetchItems();
    }
  }, [token, fetchItems]);

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
        className={`rounded-lg shadow-lg px-4 py-3 flex items-center gap-2 min-w-[200px] ${
          notification.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white`}
      >
        {notification.type === "success" ? (
          <CheckCircle size={18} />
        ) : (
          <AlertCircle size={18} />
        )}
        <span className="text-sm">{notification.message}</span>
      </div>
    </div>
  );

  const Input = ({ icon: Icon, ...props }) => (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
      )}
      <input
        {...props}
        className={`w-full px-4 py-3 ${Icon ? 'pl-10' : 'pl-4'} pr-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all`}
      />
    </div>
  );

  // =========================
  // LOGIN PAGE
  // =========================
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
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
            <Input
              icon={User}
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (authMode === "login" ? login() : register())}
              disabled={isLoading}
            />

            <Input
              icon={Lock}
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (authMode === "login" ? login() : register())}
              disabled={isLoading}
            />

            {authMode === "login" ? (
              <>
                <button
                  onClick={login}
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </button>
                <p className="text-center text-white/60 text-sm">
                  Pas de compte ?{" "}
                  <button
                    onClick={() => {
                      setAuthMode("register");
                      setUsername("");
                      setPassword("");
                    }}
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
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Inscription..." : "S'inscrire"}
                </button>
                <p className="text-center text-white/60 text-sm">
                  Déjà un compte ?{" "}
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setUsername("");
                      setPassword("");
                    }}
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
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Package className="text-white" size={24} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Gestionnaire d'Items
              </h1>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-all hover:scale-105"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Health Status */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-full">
              <Heart size={16} className="text-white" />
            </div>
            <span className="text-green-300 font-mono text-sm sm:text-base break-all">
              {health ? `✅ ${JSON.stringify(health)}` : "🔄 Vérification..."}
            </span>
          </div>
        </div>

        {/* Add Item Form */}
        <GlassCard className="rounded-xl p-5 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={20} className="text-purple-400" />
            Ajouter un item
          </h2>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Nom de l'item *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addItem()}
              disabled={isAddingItem}
            />
            <textarea
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
              placeholder="Description (optionnelle)"
              rows="3"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              disabled={isAddingItem}
            />
            <button
              onClick={addItem}
              disabled={isAddingItem || !name.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isAddingItem ? "Ajout en cours..." : "Ajouter l'item"}
            </button>
          </div>
        </GlassCard>

        {/* Items List */}
        <GlassCard className="rounded-xl p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Package size={20} className="text-purple-400" />
            Mes Items
            {items.length > 0 && (
              <span className="text-sm text-white/40 ml-2">({items.length})</span>
            )}
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
                  key={item._id || index}
                  className="group relative bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all hover:transform hover:scale-[1.02]"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${Math.min(index * 0.05, 0.5)}s both`,
                  }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold mb-1 break-words">
                        {item.name}
                      </h3>
                      <p className="text-white/40 text-sm break-words">
                        {item.description || "Pas de description"}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteItem(item._id)}
                      disabled={isDeletingId === item._id}
                      className="opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-500/20 rounded-lg text-red-400 disabled:opacity-50"
                    >
                      {isDeletingId === item._id ? "..." : <Trash2 size={18} />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <style>{`
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
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}