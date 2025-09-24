

import React, { useState, useRef, useEffect } from 'react';
import { FrenchBulldogIcon } from './icons/FrenchBulldogIcon';
import { SendIcon } from './icons/SendIcon';
import { XIcon } from './icons/XIcon';
import { Appointment, Client, Product, Prices, KandyAIMessage } from '../types';
import { getKandyAIResponse } from '../services/kandyAIService';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

// Add types for SpeechRecognition API to fix TypeScript errors
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    lang: string;
    interimResults: boolean;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

// Extend the Window interface to include webkitSpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: { new (): SpeechRecognition };
        webkitSpeechRecognition: { new (): SpeechRecognition };
    }
}

interface KandyAIProps {
    appointments: Appointment[];
    clients: Client[];
    products: Product[];
    prices: Prices;
    services: Service[]; 
}

const KandyAI: React.FC<KandyAIProps> = ({ appointments, clients, products, prices, services }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<KandyAIMessage[]>([
        { sender: 'kandy', text: '¡Hola! Soy Kandy, tu asistente. ¿En qué te puedo ayudar hoy?' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'es-ES';
            recognition.interimResults = true;

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                setUserInput(transcript);
            };
            
            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                if (recognitionRef.current) {
                  recognitionRef.current.stop();
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        } else {
            console.warn('Speech Recognition not supported in this browser.');
        }
    }, []);

    const handleToggleChat = () => {
        setIsOpen(prev => !prev);
    };
    
    const handleToggleListening = () => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
        } else {
            setUserInput('');
            recognition.start();
            setIsListening(true);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: KandyAIMessage = { sender: 'user', text: userInput };
        const updatedMessages = [...messages, newUserMessage];
        
        setMessages(updatedMessages);
        setUserInput('');
        setIsLoading(true);
        
        try {
            const responseText = await getKandyAIResponse(updatedMessages, { appointments, clients, products, prices, services });
            const newKandyMessage: KandyAIMessage = { sender: 'kandy', text: responseText };
            setMessages(prev => [...prev, newKandyMessage]);
        } catch (error) {
            const errorMessage: KandyAIMessage = { sender: 'kandy', text: "Lo siento, ocurrió un error. Por favor intenta de nuevo." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chat Window */}
            <div className={`fixed bottom-24 right-4 sm:right-6 md:right-8 w-[calc(100%-2rem)] max-w-sm h-3/5 max-h-[500px] bg-card shadow-2xl rounded-2xl flex flex-col transition-all duration-300 ease-in-out z-40 border border-border ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
    <div className="flex items-center">
        {/* 👇 AQUÍ HACEMOS EL CAMBIO 👇 */}
        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary to-purple-500 rounded-full">
            <img 
                src="/imageKandyAi.png" 
                alt="Kandy AI Logo" 
                className="w-8 h-8 rounded-full object-cover" 
            />
        </div>
        <h3 className="ml-3 text-lg font-bold text-card-foreground">Kandy AI</h3>
    </div>
    <button onClick={handleToggleChat} className="text-muted-foreground hover:text-foreground">
        <XIcon className="w-6 h-6" />
    </button>
</div>
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-muted-foreground rounded-bl-none'}`}>
                                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-muted text-muted-foreground rounded-bl-none">
                                    <div className="flex items-center space-x-2">
                                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>
                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                    <div className="relative">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={isListening ? "Escuchando..." : "Pregúntale a Kandy..."}
                            className="w-full pl-12 pr-12 py-2 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                            disabled={isLoading}
                        />
                         <button
                            type="button"
                            onClick={handleToggleListening}
                            className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-accent transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}
                            aria-label={isListening ? 'Detener grabación' : 'Grabar voz'}
                            disabled={!recognitionRef.current}
                        >
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                        <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-muted-foreground transition-colors" disabled={isLoading || !userInput.trim()}>
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
            {/* Floating Action Button */}
            <button
                onClick={handleToggleChat}
                className="fixed bottom-4 right-4 sm:right-6 md:right-8 w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white transform transition-transform hover:scale-110 z-50 overflow-hidden"
                aria-label="Abrir asistente Kandy AI"
            >
                {/* 👇 AQUÍ HACEMOS EL CAMBIO 👇 */}
                <img 
                    src="/imageKandyAi.png" 
                    alt="Asistente Kandy AI" 
                    className="w-full h-full object-cover" 
                />
            </button>
        </>
    );
};

export default KandyAI;