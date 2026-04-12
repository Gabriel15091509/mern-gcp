import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    const { data } = await axios.get('/api/items');
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    await axios.post('/api/items', { name, description: desc });
    setName('');
    setDesc('');
    await fetchItems();
    setLoading(false);
  };

  const deleteItem = async (id) => {
    await axios.delete(`/api/items/${id}`);
    await fetchItems();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-600 text-white flex items-center justify-center">
      <div className="w-full max-w-3xl p-6">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">🚀 MERN DevOps App</h1>
          <p className="text-gray-300">Gestion stylée avec React + Express + MongoDB</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl mb-8">
          <form onSubmit={addItem} className="flex flex-col md:flex-row gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom"
              required
              className="flex-1 px-4 py-2 rounded-xl bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description"
              className="flex-1 px-4 py-2 rounded-xl bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-semibold"
            >
              {loading ? '...' : 'Ajouter'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-lg flex justify-between items-center hover:scale-[1.02] transition"
            >
              <div>
                <h2 className="font-bold text-lg">{item.name}</h2>
                <p className="text-gray-300 text-sm">{item.description}</p>
              </div>

              <button
                onClick={() => deleteItem(item._id)}
                className="text-red-400 hover:text-red-600 font-semibold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

