
import React, { useEffect, useState } from 'react';
import API from './api';

function Dashboard(){ return <div><h2>Dashboard</h2><p>Resumen del negocio...</p></div> }
function Clients(){
  const [clients, setClients] = useState([]);
  useEffect(()=>{ API('/api/clientes').then(r=>{ if(r.ok) setClients(r.data.clientes||[]); }) }, []);
  return <div>
    <h2>Clientes</h2>
    <button onClick={async ()=>{ const name=prompt('Nombre'); const correo=prompt('Email'); const telefono=prompt('Tel'); const res = await API('/api/clientes',{method:'POST',headers:{'Content-Type':'application/json'}, body:JSON.stringify({nombres:name, correo, telefono})}); if(res.ok) setClients([res.data.cliente,...clients]); }}>Crear cliente</button>
    <ul>{clients.map(c=> <li key={c.id}>{c.name} - {c.email} - {c.phone}</li>)}</ul>
  </div>
}
function App(){
  const [route,setRoute]=useState('dashboard');
  return <div style={{fontFamily:'Arial, sans-serif', padding:20}}>
    <h1>Negocio - App mínima</h1>
    <nav style={{marginBottom:10}}>
      <button onClick={()=>setRoute('dashboard')}>Dashboard</button>
      <button onClick={()=>setRoute('clients')}>Clientes</button>
      <button onClick={()=>setRoute('appointments')}>Citas</button>
      <button onClick={()=>setRoute('inventory')}>Inventario</button>
      <button onClick={()=>setRoute('settings')}>Ajustes</button>
    </nav>
    <div style={{border:'1px solid #ddd', padding:10}}>
      {route==='dashboard' && <Dashboard />}
      {route==='clients' && <Clients />}
      {route==='appointments' && <div><h2>Citas</h2><p>Modulo de citas - pendiente implementación completa</p></div>}
      {route==='inventory' && <div><h2>Inventario</h2><p>Modulo inventario - pendiente</p></div>}
      {route==='settings' && <div><h2>Ajustes</h2><p>Ajustes del negocio</p></div>}
    </div>
  </div>
}
export default App;
