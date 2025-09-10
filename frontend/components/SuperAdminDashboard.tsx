import React, { useState, useEffect } from 'react';
import { User, Business, UserRole } from './types';
import api from './api';

// Modal para editar negocio
interface BusinessModalProps {
  business: Business;
  onClose: () => void;
  onSave: (updated: Business) => void;
}

const BusinessModal: React.FC<BusinessModalProps> = ({ business, onClose, onSave }) => {
  const [salonName, setSalonName] = useState(business.profile?.salonName || '');
  const [type, setType] = useState(business.type || '');

  const handleSave = async () => {
    try {
      const updatedBusiness = await api.updateBusiness(business.id, { profile: { salonName }, type });
      onSave(updatedBusiness);
      onClose();
    } catch (err) {
      console.error('Error actualizando negocio:', err);
    }
  };

  return (
    <div className="modal">
      <h2>Editar Negocio</h2>
      <input value={salonName} onChange={(e) => setSalonName(e.target.value)} placeholder="Nombre del negocio" />
      <input value={type} onChange={(e) => setType(e.target.value)} placeholder="Tipo" />
      <button onClick={handleSave}>Guardar</button>
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
};

// Modal para editar usuario
interface UserModalProps {
  user: User;
  onClose: () => void;
  onSave: (updated: User) => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);

  const handleSave = async () => {
    try {
      const updatedUser = await api.updateUser(user.id, { firstName, lastName, username, email });
      onSave(updatedUser);
      onClose();
    } catch (err) {
      console.error('Error actualizando usuario:', err);
    }
  };

  return (
    <div className="modal">
      <h2>Editar Usuario</h2>
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nombre" />
      <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Apellido" />
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <button onClick={handleSave}>Guardar</button>
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
};

const SuperAdminDashboard: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [businessData, userData] = await Promise.all([api.getBusinesses(), api.getUsers()]);
        setBusinesses(businessData.filter((b): b is Business => !!b));
        setUsers(userData.filter((u): u is User => !!u));
      } catch (err) {
        console.error(err);
        setError('Error cargando datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // CRUD negocios
  const handleDeleteBusiness = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar este negocio?')) return;
    try {
      await api.deleteBusiness(id);
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Error eliminando negocio:', err);
    }
  };

  // CRUD usuarios
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar este usuario?')) return;
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error('Error eliminando usuario:', err);
    }
  };

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard">
      <h1>Negocios</h1>
      {businesses.length === 0 ? (
        <p>No hay negocios registrados.</p>
      ) : (
        <ul>
          {businesses.map((b) => (
            <li key={b.id}>
              {b.profile?.salonName || 'Sin nombre'} - {b.type || 'Tipo desconocido'}
              <button onClick={() => setSelectedBusiness(b)}>Editar</button>
              <button onClick={() => handleDeleteBusiness(b.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}

      <h1>Usuarios</h1>
      {users.filter((u) => u.role !== UserRole.SuperAdmin).length === 0 ? (
        <p>No hay usuarios.</p>
      ) : (
        <ul>
          {users
            .filter((u) => u.role !== UserRole.SuperAdmin)
            .map((u) => {
              const assignedBusiness = businesses.find((b) => b.id === u.businessId);
              return (
                <li key={u.id}>
                  {u.firstName} {u.lastName} - {u.username} - {assignedBusiness?.profile?.salonName || 'Ninguno'}
                  <button onClick={() => setSelectedUser(u)}>Editar</button>
                  <button onClick={() => handleDeleteUser(u.id)}>Eliminar</button>
                </li>
              );
            })}
        </ul>
      )}

      {selectedBusiness && (
        <BusinessModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onSave={(updated) =>
            setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
          }
        />
      )}

      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={(updated) => setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))}
        />
      )}
    </div>
  );
};

export default SuperAdminDashboard;
