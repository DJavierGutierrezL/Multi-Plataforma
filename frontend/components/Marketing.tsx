

import React, { useState, useEffect } from 'react';
import { generateMarketingMessage } from '../services/geminiService';
import { Client, Appointment, AppointmentStatus, Prices, Profile } from '../types';
import { FrenchBulldogIcon } from './icons/FrenchBulldogIcon';
import { SendIcon } from './icons/SendIcon';

interface MarketingProps {
  clients: Client[];
  appointments: Appointment[];
  prices: Prices;
  profile: Profile;
}

const Marketing: React.FC<MarketingProps> = ({ clients, appointments, prices, profile }) => {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(clients.length > 0 ? clients[0].id : null);
  const [messageType, setMessageType] = useState<'confirmation' | 'promotion' | 'birthday' | 'faltaPago'>('confirmation');
  const [promotionText, setPromotionText] = useState('20% de descuento en tu próxima pedicura spa!');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Update selected client if the client list changes
  useEffect(() => {
    if (clients.length > 0 && !clients.find(c => c.id === selectedClientId)) {
      setSelectedClientId(clients[0].id);
    } else if (clients.length === 0) {
      setSelectedClientId(null);
    }
  }, [clients, selectedClientId]);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleGenerateMessage = async () => {
    if (!selectedClient) {
      alert('Por favor, selecciona un cliente.');
      return;
    }

    setIsLoading(true);
    setGeneratedMessage('');

    let details: { appointment?: Appointment; promotion?: string; prices: Prices; accountNumber: string; salonName: string; ownerName: string; } = { 
        prices,
        accountNumber: profile.accountNumber,
        salonName: profile.salonName,
        ownerName: profile.ownerName,
    };
    
    if (messageType === 'promotion') {
        if (!promotionText.trim()) {
          alert('Por favor, introduce el texto de la promoción.');
          setIsLoading(false);
          return;
        }
        details.promotion = promotionText;
    } else if (messageType === 'confirmation') {
        const appointmentForClient = appointments
            .filter(a => a.clientName === selectedClient.name && new Date(`${a.date}T00:00:00`) >= new Date())
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
        
        if (!appointmentForClient) {
            alert('Este cliente no tiene citas próximas para enviarle una confirmación.');
            setIsLoading(false);
            return;
        }
        details.appointment = appointmentForClient;
    } else if (messageType === 'faltaPago') {
        const appointmentForClient = appointments
            .filter(a => a.clientName === selectedClient.name && a.status === AppointmentStatus.PaymentPending)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]; // most recent first
        
        if (!appointmentForClient) {
            alert('Este cliente no tiene citas con pago pendiente.');
            setIsLoading(false);
            return;
        }
        details.appointment = appointmentForClient;
    }

    try {
      const message = await generateMarketingMessage(messageType, selectedClient, details);
      setGeneratedMessage(message);
    } catch (error) {
      setGeneratedMessage('Hubo un error al generar el mensaje.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!selectedClient || !generatedMessage) {
      alert("No hay cliente seleccionado o mensaje generado.");
      return;
    }

    // Clean phone number: remove spaces, dashes, parentheses, etc.
    const phoneNumber = selectedClient.phone.replace(/[^0-9+]/g, '');
    if (!phoneNumber) {
        alert("El cliente seleccionado no tiene un número de teléfono válido. Asegúrate de incluir el código de país.");
        return;
    }
    
    const encodedMessage = encodeURIComponent(generatedMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-card p-4 md:p-8 rounded-2xl shadow-lg border border-border">
      <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center">
        <FrenchBulldogIcon className="w-7 h-7 mr-3 text-primary" />
        Asistente Virtual
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <label htmlFor="client-select" className="block text-sm font-medium text-card-foreground mb-1">
              Seleccionar Cliente
            </label>
            <select
              id="client-select"
              className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              onChange={(e) => setSelectedClientId(parseInt(e.target.value))}
              value={selectedClientId || ''}
              disabled={clients.length === 0}
            >
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            {clients.length === 0 && <p className="text-xs text-red-500 mt-1">No hay clientes para seleccionar.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Tipo de Mensaje</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMessageType('confirmation')}
                className={`py-2 px-4 rounded-lg transition-colors text-sm ${messageType === 'confirmation' ? 'bg-primary text-primary-foreground shadow' : 'bg-muted text-muted-foreground'}`}
              >
                Confirmación
              </button>
              <button
                onClick={() => setMessageType('promotion')}
                className={`py-2 px-4 rounded-lg transition-colors text-sm ${messageType === 'promotion' ? 'bg-purple-500 text-white shadow' : 'bg-muted text-muted-foreground'}`}
              >
                Promoción
              </button>
              <button
                onClick={() => setMessageType('birthday')}
                className={`py-2 px-4 rounded-lg transition-colors text-sm ${messageType === 'birthday' ? 'bg-yellow-500 text-white shadow' : 'bg-muted text-muted-foreground'}`}
              >
                Cumpleaños
              </button>
              <button
                onClick={() => setMessageType('faltaPago')}
                className={`py-2 px-4 rounded-lg transition-colors text-sm ${messageType === 'faltaPago' ? 'bg-gray-900 text-white shadow dark:bg-gray-900' : 'bg-muted text-muted-foreground'}`}
              >
                Falta Pago
              </button>
            </div>
          </div>
          
          {messageType === 'promotion' && (
            <div>
              <label htmlFor="promotion-text" className="block text-sm font-medium text-card-foreground mb-1">
                Texto de la Promoción
              </label>
              <textarea
                id="promotion-text"
                rows={3}
                className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-background"
                value={promotionText}
                onChange={(e) => setPromotionText(e.target.value)}
              />
            </div>
          )}

          <button
            onClick={handleGenerateMessage}
            disabled={isLoading || !selectedClient}
            className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <FrenchBulldogIcon className="w-5 h-5 mr-2" />
                Generar Mensaje con IA
              </>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="bg-accent p-6 rounded-lg flex flex-col">
          <h3 className="text-lg font-semibold text-accent-foreground mb-4">Vista Previa del Mensaje de WhatsApp</h3>
          <div className="flex-grow bg-background rounded-xl shadow-inner p-4 space-y-2">
            {generatedMessage ? (
              <p className="text-foreground whitespace-pre-wrap">{generatedMessage}</p>
            ) : (
              <p className="text-muted-foreground text-center my-auto">
                El mensaje generado por la IA aparecerá aquí...
              </p>
            )}
          </div>
          <button 
            onClick={handleSendWhatsApp}
            className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-green-600 transition-colors flex items-center justify-center disabled:bg-gray-400"
            disabled={!generatedMessage || isLoading}>
            <SendIcon className="w-5 h-5 mr-2" />
            Enviar a {selectedClient?.name.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Marketing;