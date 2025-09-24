import React, { useState, useEffect } from 'react';
import { Client, Profile } from '../types';
import * as apiService from '../services/apiService'; // Usamos nuestro apiService
import { MessageCircleIcon } from './icons/MessageCircleIcon';
import { SendIcon } from './icons/SendIcon';

interface MarketingProps {
    clients: Client[];
    profile: Profile;
}

const Marketing: React.FC<MarketingProps> = ({ clients, profile }) => {
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [messageType, setMessageType] = useState<string>('Confirmacion');
    const [generatedMessage, setGeneratedMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Este useEffect se asegura de seleccionar un cliente tan pronto como la lista esté disponible.
    useEffect(() => {
        if (clients.length > 0 && !selectedClientId) {
            setSelectedClientId(String(clients[0].id));
        }
    }, [clients, selectedClientId]);

    const handleGenerateMessage = async () => {
    if (!selectedClientId) {
        alert("Por favor, selecciona un cliente.");
        return;
    }
    setIsLoading(true);
    setGeneratedMessage('');
    
    try {
        // Enviamos el ID del cliente (como número) y el nombre del negocio
        const response = await apiService.generateAiMessage(
            parseInt(selectedClientId), 
            messageType, 
            profile.salonName
        );
        setGeneratedMessage(response.generatedMessage);
    } catch (error) {
        console.error("Error generando el mensaje:", error);
        alert("Hubo un error al generar el mensaje.");
    } finally {
        setIsLoading(false);
    }
};

    const handleSendWhatsApp = () => {
        const selectedClient = clients.find(c => c.id === parseInt(selectedClientId));
        if (!selectedClient || !selectedClient.phone || !generatedMessage) {
            alert("Selecciona un cliente y genera un mensaje primero.");
            return;
        }
        
        let phoneNumber = selectedClient.phone.replace(/\s+/g, '');
        if (!phoneNumber.startsWith('57')) {
            phoneNumber = `57${phoneNumber}`;
        }
        
        const encodedMessage = encodeURIComponent(generatedMessage);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    const messageTypes = ['Confirmacion', 'Promocion', 'Cumpleaños', 'Falta Pago'];
    const selectedClientName = clients.find(c => c.id === parseInt(selectedClientId))?.firstName || '';

    return (
        <div className="bg-card p-4 md:p-8 rounded-2xl shadow-lg border border-border">
            <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center">
                <MessageCircleIcon className="w-7 h-7 mr-3 text-primary" />
                Asistente Virtual
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Panel de Control */}
                <div className="space-y-6">
                    <div>
                        <label htmlFor="client-select" className="block text-sm font-medium text-card-foreground mb-1">
                            Seleccionar Cliente
                        </label>
                        <select
                            id="client-select"
                            className="w-full p-2 border border-border rounded-lg bg-background"
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            value={selectedClientId}
                            disabled={clients.length === 0}
                        >
                            {clients.length > 0 ? (
                                clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>
                                ))
                            ) : (
                                <option>No hay clientes para seleccionar</option>
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">Tipo de Mensaje</label>
                        <div className="grid grid-cols-2 gap-2">
                            {messageTypes.map(type => (
                                <button 
                                    key={type} 
                                    onClick={() => setMessageType(type)}
                                    className={`py-2 px-4 rounded-lg transition-colors text-sm font-semibold ${messageType === type ? 'bg-primary text-primary-foreground shadow' : 'bg-muted hover:bg-accent'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <button
                        onClick={handleGenerateMessage}
                        disabled={isLoading || !selectedClientId}
                        className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg shadow-lg disabled:opacity-50 flex items-center justify-center"
                    >
                        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "Generar Mensaje con IA"}
                    </button>
                </div>

                {/* Vista Previa y Envío */}
                <div className="bg-accent p-6 rounded-lg flex flex-col">
                    <h3 className="text-lg font-semibold text-accent-foreground mb-4">Vista Previa del Mensaje de WhatsApp</h3>
                    <div className="flex-grow bg-background rounded-xl shadow-inner p-4">
                        <p className="text-foreground whitespace-pre-wrap">
                            {generatedMessage || "El mensaje generado por la IA aparecerá aquí..."}
                        </p>
                    </div>
                    <button 
                        onClick={handleSendWhatsApp}
                        className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-green-600 disabled:bg-gray-400 flex items-center justify-center"
                        disabled={!generatedMessage || isLoading}>
                        <SendIcon className="w-5 h-5 mr-2" />
                        Enviar a {selectedClientName}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Marketing;