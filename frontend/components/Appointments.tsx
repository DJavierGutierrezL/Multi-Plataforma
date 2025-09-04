import React, { useState } from 'react';
import { Appointment, AppointmentStatus, Client, Prices } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { ClockIcon } from './icons/ClockIcon';
import Modal from './Modal';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface AppointmentsProps {
    appointments: Appointment[];
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
    clients: Client[];
    prices: Prices;
}

const getStatusClasses = (status: AppointmentStatus) => {
    switch (status) {
        case AppointmentStatus.Confirmed:
            return {
                bubble: 'bg-green-400 hover:bg-green-500 text-white',
                badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            };
        case AppointmentStatus.Completed:
            return {
                bubble: 'bg-blue-400 hover:bg-blue-500 text-white',
                badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            };
        case AppointmentStatus.Cancelled:
            return {
                bubble: 'bg-red-400 hover:bg-red-500 text-white line-through',
                badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
            };
        case AppointmentStatus.PaymentPending:
            return {
                bubble: 'bg-gray-800 hover:bg-gray-900 text-white',
                badge: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
            };
        case AppointmentStatus.Pending:
        default:
            return {
                bubble: 'bg-yellow-400 hover:bg-yellow-500 text-white',
                badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            };
    }
};

const Appointments: React.FC<AppointmentsProps> = ({ appointments, setAppointments, clients, prices }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentAppointment, setCurrentAppointment] = useState<Partial<Appointment> | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [historyFilterStatus, setHistoryFilterStatus] = useState<AppointmentStatus | 'All'>(AppointmentStatus.Completed);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const serviceOptions = Object.keys(prices);


  // --- Calendar Logic ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  // Calculate the start of the week (Monday)
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const startOfWeek = new Date(today);
  // If today is Sunday (0), go back 6 days to last Monday. Otherwise, go back (dayOfWeek - 1) days.
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(today.getDate() - diff);

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const weekDaysShort = ['L', 'M', 'X', 'J', 'V', 'S'];
  
  // Generate 6 days for the calendar, from Monday to Saturday
  const calendarDays = Array.from({ length: 6 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
  });
  
  // --- Helper Functions ---
  const formatTime12h = (time24h: string): string => {
    if (!time24h) return '';
    const [hoursStr, minutes] = time24h.split(':');
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    let h12 = hours % 12;
    if (h12 === 0) h12 = 12; // the hour '0' should be '12'
    return `${h12}:${minutes} ${ampm}`;
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentAppointment(null);
    setAppointmentToDelete(null);
  };

  const handleOpenAddModal = () => {
    setCurrentAppointment({
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      time: '10:00',
      clientName: clients[0]?.name || 'Invitado',
      services: [],
      status: AppointmentStatus.Pending,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setIsDeleteModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (currentAppointment) {
      setCurrentAppointment({ ...currentAppointment, [e.target.name]: e.target.value });
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (currentAppointment) {
        const currentServices = currentAppointment.services || [];
        if (checked) {
            setCurrentAppointment({
                ...currentAppointment,
                services: [...currentServices, value]
            });
        } else {
            setCurrentAppointment({
                ...currentAppointment,
                services: currentServices.filter(s => s !== value)
            });
        }
    }
  };


  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAppointment) return;

    const { id, clientName, services, date, time, status } = currentAppointment;

    if (!clientName || !services || services.length === 0 || !date || !time || !status) {
      alert('Por favor, rellena todos los campos, incluyendo al menos un servicio.');
      return;
    }

    let updatedAppointments;
    if (id) {
      updatedAppointments = appointments.map((a) => (a.id === id ? ({ ...a, ...currentAppointment } as Appointment) : a));
    } else {
      const newAppointment: Appointment = {
        id: Date.now(),
        clientName,
        services,
        date,
        time,
        status,
      };
      updatedAppointments = [newAppointment, ...appointments];
    }

    setAppointments(updatedAppointments.sort((a,b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
    }));

    handleCloseModals();
  };

  const handleDeleteConfirm = () => {
    if (appointmentToDelete) {
      setAppointments(appointments.filter((a) => a.id !== appointmentToDelete.id));
    }
    handleCloseModals();
  };
  
  const selectedDayAppointments = appointments
    .filter(appointment => {
        const appointmentDate = new Date(`${appointment.date}T00:00:00`);
        return appointmentDate.toDateString() === selectedDate.toDateString();
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const filteredHistoryAppointments = appointments
    .filter(appointment => {
        if (historyFilterStatus === 'All') return true;
        return appointment.status === historyFilterStatus;
    })
    .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB.getTime() - dateA.getTime(); // Sort descending
    });

  return (
    <>
    <div className="bg-card p-4 md:p-8 rounded-2xl shadow-lg border border-border">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
        <h2 className="text-2xl font-bold text-card-foreground mb-4 md:mb-0">Gestión de Citas</h2>
        <button onClick={handleOpenAddModal} className="w-full md:w-auto bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg shadow hover:bg-primary-hover transition-colors">
            Añadir Cita
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-card-foreground mb-4">Calendario Semanal</h3>
        <div className="grid grid-cols-6 gap-1 md:gap-2 text-center">
            <div className="hidden md:grid grid-cols-6 col-span-6 gap-2">
                {weekDays.map(day => <div key={day} className="font-bold text-muted-foreground">{day}</div>)}
            </div>
            <div className="grid md:hidden grid-cols-6 col-span-6 gap-1">
                {weekDaysShort.map(day => <div key={day} className="font-bold text-muted-foreground text-sm">{day}</div>)}
            </div>
            {calendarDays.map((day, index) => {
                const dayAppointments = appointments.filter(a => {
                    const appointmentDate = new Date(`${a.date}T00:00:00`);
                    return appointmentDate.toDateString() === day.toDateString();
                });

                const isToday = day.toDateString() === new Date().toDateString();
                const isSelected = day.toDateString() === selectedDate.toDateString();

                const appointmentsToShow = dayAppointments.sort((a,b) => a.time.localeCompare(b.time));
                const maxAppointmentsVisible = 5;

                return (
                    <div 
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        className={`p-1 md:p-2 border rounded-lg min-h-24 md:min-h-32 cursor-pointer transition-colors
                            ${isToday ? 'bg-primary/10 border-primary/30' : 'bg-muted/50 border-border'}
                            ${isSelected ? 'ring-2 ring-primary' : 'hover:bg-accent'}
                        `}
                    >
                        <div className={`text-xs md:text-base font-bold text-right ${isToday ? 'text-primary' : 'text-card-foreground'}`}>{day.getDate()}</div>
                        
                        <div className="mt-1 space-y-1">
                            {appointmentsToShow.slice(0, maxAppointmentsVisible).map(app => {
                                const statusStyle = getStatusClasses(app.status);
                                return (
                                    <button key={app.id} onClick={(e) => { e.stopPropagation(); handleOpenEditModal(app); }} className={`w-full text-left overflow-hidden rounded-md shadow-sm transition-transform hover:scale-105 ${statusStyle.bubble}`}>
                                        {/* Desktop content */}
                                        <div className="hidden md:block px-2 py-1 text-xs">
                                            <div className="font-bold truncate">{formatTime12h(app.time)} - {app.clientName}</div>
                                            <div className="text-white/80 truncate">{app.services[0]}</div>
                                        </div>
                                        {/* Mobile content */}
                                        <div className="md:hidden p-1 text-xs leading-tight">
                                            <div className="font-bold truncate">{formatTime12h(app.time)} {app.clientName}</div>
                                            <div className="truncate text-white/80">{app.services[0]}</div>
                                        </div>
                                    </button>
                                );
                            })}
                            {appointmentsToShow.length > maxAppointmentsVisible && (
                                <div className="text-center text-muted-foreground text-xs mt-1">
                                    + {appointmentsToShow.length - maxAppointmentsVisible} más
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-card-foreground mb-4">
           Citas para el {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h3>
        <div className="space-y-4">
          {selectedDayAppointments.length > 0 ? (
            selectedDayAppointments.map((appointment) => {
                const statusStyle = getStatusClasses(appointment.status);
                const isCancelled = appointment.status === AppointmentStatus.Cancelled;
                return (
                  <div key={appointment.id} className="bg-accent p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1 mb-3 md:mb-0 pr-4">
                      <p className={`font-bold text-primary ${isCancelled ? 'line-through' : ''}`}>{appointment.clientName}</p>
                      <p className={`text-sm text-muted-foreground ${isCancelled ? 'line-through' : ''}`}>{appointment.services.join(', ')}</p>
                       <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle.badge}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="text-left md:text-right mb-3 md:mb-0 pr-4">
                       <div className="flex items-center text-sm text-card-foreground font-medium">
                          <ClockIcon className="w-4 h-4 mr-2 text-muted-foreground"/>
                          <span>{formatTime12h(appointment.time)}</span>
                       </div>
                    </div>
                     <div className="flex space-x-2 self-start md:self-center">
                       <button onClick={() => handleOpenEditModal(appointment)} className="text-blue-500 hover:text-blue-700 p-2"><i className="fas fa-edit"></i></button>
                       <button onClick={() => handleOpenDeleteModal(appointment)} className="text-red-500 hover:text-red-700 p-2"><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                )
              })
          ) : (
             <div className="text-center text-muted-foreground py-4">
                No hay citas programadas para este día.
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
          <h3 className="text-xl font-semibold text-card-foreground mb-3 md:mb-0">Historial de Citas</h3>
            <div className='flex items-center'>
                 <label htmlFor="status-filter" className="text-sm font-medium text-card-foreground mr-2">Filtrar:</label>
                 <select 
                    id="status-filter"
                    value={historyFilterStatus}
                    onChange={(e) => setHistoryFilterStatus(e.target.value as AppointmentStatus | 'All')}
                    className="p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card"
                 >
                    <option value="All">Todas</option>
                    {Object.values(AppointmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
            </div>
        </div>
        <div className="space-y-4">
            {filteredHistoryAppointments.length > 0 ? (
                filteredHistoryAppointments.map((appointment) => {
                const statusStyle = getStatusClasses(appointment.status);
                const isCancelled = appointment.status === AppointmentStatus.Cancelled;
                return (
                  <div key={appointment.id} className="bg-muted/50 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-3 md:mb-0">
                      <p className={`font-bold text-card-foreground ${isCancelled ? 'line-through' : ''}`}>{appointment.clientName}</p>
                      <p className={`text-sm text-muted-foreground ${isCancelled ? 'line-through' : ''}`}>{appointment.services.join(', ')}</p>
                       <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle.badge}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="text-left md:text-right mb-3 md:mb-0">
                       <div className="flex items-center text-sm text-card-foreground">
                          <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground"/>
                          <span>{new Date(`${appointment.date}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                       </div>
                       <div className="flex items-center text-sm text-card-foreground">
                          <ClockIcon className="w-4 h-4 mr-2 text-muted-foreground"/>
                          <span>{formatTime12h(appointment.time)}</span>
                       </div>
                    </div>
                     <div className="flex space-x-2 self-start md:self-center">
                       <button onClick={() => handleOpenEditModal(appointment)} className="text-blue-500 hover:text-blue-700 p-2"><i className="fas fa-edit"></i></button>
                       <button onClick={() => handleOpenDeleteModal(appointment)} className="text-red-500 hover:text-red-700 p-2"><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                )
              })
            ) : (
                <div className="text-center text-muted-foreground py-4">
                    No se encontraron citas con el estado seleccionado.
                </div>
            )}
        </div>
      </div>
    </div>

    <Modal
      isOpen={isModalOpen}
      onClose={handleCloseModals}
      title={currentAppointment?.id ? 'Editar Cita' : 'Añadir Nueva Cita'}
    >
      <form onSubmit={handleSaveAppointment} className="space-y-4">
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-card-foreground mb-1">
            Cliente
          </label>
          <select name="clientName" id="clientName" value={currentAppointment?.clientName || ''} onChange={handleFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required>
            {clients.map((client) => (<option key={client.id} value={client.name}>{client.name}</option>))}
            <option value="Invitado">Invitado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-2">Servicios</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                {serviceOptions.map(service => (
                <div key={service} className="flex items-center">
                    <input
                    type="checkbox"
                    id={`service-${service}`}
                    name={service}
                    value={service}
                    checked={currentAppointment?.services?.includes(service) || false}
                    onChange={handleServiceChange}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor={`service-${service}`} className="ml-2 block text-sm text-card-foreground">
                    {service}
                    </label>
                </div>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-card-foreground mb-1">Fecha</label>
            <input type="date" name="date" id="date" value={currentAppointment?.date || ''} onChange={handleFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-card-foreground mb-1">Hora</label>
            <input type="time" name="time" id="time" value={currentAppointment?.time || ''} onChange={handleFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required />
          </div>
        </div>
        <div>
            <label htmlFor="status" className="block text-sm font-medium text-card-foreground mb-1">Estado</label>
            <select name="status" id="status" value={currentAppointment?.status || ''} onChange={handleFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required>
                {Object.values(AppointmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow hover:bg-primary-hover">Guardar Cita</button>
        </div>
      </form>
    </Modal>

    <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title="Confirmar Eliminación">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <AlertTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
        <p className="mt-4 text-card-foreground">
          ¿Estás seguro de que quieres eliminar la cita de{' '}<strong>{appointmentToDelete?.clientName}</strong> para el servicio de{' '}<strong>{appointmentToDelete?.services.join(', ')}</strong>?
        </p>
        <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
      </div>
      <div className="mt-6 flex justify-center space-x-4">
        <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button>
        <button type="button" onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700">Sí, Eliminar</button>
      </div>
    </Modal>
  </>
  );
};

export default Appointments;