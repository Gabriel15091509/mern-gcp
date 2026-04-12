import React, { useState, useEffect } from 'react';
import axios from 'axios';
 
function App() {
  const [items, setItems]   = useState([]);
  const [name, setName]     = useState('');
  const [desc, setDesc]     = useState('');
  const [loading, setLoading] = useState(false);
 
  const fetchItems = async () => {
    const { data } = await axios.get('/api/items');
    setItems(data);
  };
 
  useEffect(() => { fetchItems(); }, []);
 
  const addItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    await axios.post('/api/items', { name, description: desc });
    setName(''); setDesc('');
    await fetchItems();
    setLoading(false);
  };
 
  const deleteItem = async (id) => {
    await axios.delete(`/api/items/${id}`);
    await fetchItems();
  };
 
  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#1A56A0' }}>MERN App — GCP DevOps</h1>
      <form onSubmit={addItem} style={{ marginBottom: 32 }}>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder='Nom' required
          style={{ marginRight: 8, padding: '8px 12px', width: 200 }}/>
        <input value={desc} onChange={e => setDesc(e.target.value)}
          placeholder='Description'
          style={{ marginRight: 8, padding: '8px 12px', width: 300 }}/>
        <button type='submit' disabled={loading}
          style={{ padding: '8px 20px', background: '#1A56A0', color: '#fff', border: 'none' }}>
          {loading ? '...' : 'Ajouter'}
        </button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(item => (
          <li key={item._id} style={{ padding: 16, marginBottom: 8, background: '#F4F6F9', borderLeft: '4px solid #1A56A0' }}>
            <strong>{item.name}</strong> — {item.description}
            <button onClick={() => deleteItem(item._id)} style={{ float: 'right', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
 
export default App;
