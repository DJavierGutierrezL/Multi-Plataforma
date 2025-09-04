import React, { useState, useEffect } from 'react';
import { SettingsIcon } from './icons/SettingsIcon';
import { UsersIcon } from './icons/UsersIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { Profile, Prices, ThemeSettings, PrimaryColor, BackgroundColor } from '../types';
import { PaletteIcon } from './icons/PaletteIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import ExcelUploader from './ExcelUploader';
import { UploadIcon } from './icons/UploadIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface SettingsProps {
  profile: Profile;
  prices: Prices;
  onSaveProfile: (profile: Profile) => void;
  onSavePrices: (prices: Prices) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onAppointmentsImported: (data: any[]) => void;
  themeSettings: ThemeSettings;
  onSaveThemeSettings: (settings: ThemeSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, prices, onSaveProfile, onSavePrices, theme, onThemeChange, onAppointmentsImported, themeSettings, onSaveThemeSettings }) => {
  const [profileForm, setProfileForm] = useState<Profile>(profile);
  const [pricesForm, setPricesForm] = useState<Prices>(prices);
  const [themeSettingsForm, setThemeSettingsForm] = useState<ThemeSettings>(themeSettings);

  useEffect(() => {
    setProfileForm(profile);
  }, [profile]);

  useEffect(() => {
    setPricesForm(prices);
  }, [prices]);
  
  useEffect(() => {
    setThemeSettingsForm(themeSettings);
  }, [themeSettings]);
  
  useEffect(() => {
    // Instant feedback for theme changes
    onSaveThemeSettings(themeSettingsForm);
  }, [themeSettingsForm, onSaveThemeSettings]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPricesForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };
  
  const handleThemeSettingChange = (field: keyof ThemeSettings, value: PrimaryColor | BackgroundColor) => {
      setThemeSettingsForm(prev => ({...prev, [field]: value}));
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profileForm);
  };

  const handleSavePrices = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePrices(pricesForm);
  };

  const colorOptions: { name: PrimaryColor, label: string, bgClass: string, textClass: string }[] = [
      { name: PrimaryColor.Pink, label: 'Rosa', bgClass: 'bg-pink-500', textClass: 'text-pink-500' },
      { name: PrimaryColor.Gold, label: 'Dorado', bgClass: 'bg-yellow-500', textClass: 'text-yellow-500' },
      { name: PrimaryColor.Green, label: 'Verde', bgClass: 'bg-green-500', textClass: 'text-green-500' },
      { name: PrimaryColor.Red, label: 'Rojo', bgClass: 'bg-red-500', textClass: 'text-red-500' },
      { name: PrimaryColor.Blue, label: 'Azul', bgClass: 'bg-blue-500', textClass: 'text-blue-500' },
      { name: PrimaryColor.Beige, label: 'Beige', bgClass: 'bg-stone-400', textClass: 'text-stone-400' },
  ];
  
  const backgroundOptions: { name: BackgroundColor, label: string }[] = [
      { name: BackgroundColor.White, label: 'Blanco' },
      { name: BackgroundColor.Black, label: 'Negro' },
      { name: BackgroundColor.Blue, label: 'Azul' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-card p-4 md:p-8 rounded-2xl shadow-lg border border-border">
        <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center">
          <SettingsIcon className="w-7 h-7 mr-3 text-muted-foreground" />
          Configuración General
        </h2>

        {/* Profile Settings */}
        <form onSubmit={handleSaveProfile} className="mb-8 p-4 md:p-6 border border-border rounded-xl">
          <h3 className="text-xl font-semibold text-card-foreground mb-4 flex items-center">
            <UsersIcon className="w-6 h-6 mr-3 text-primary" />
            Perfil de Usuario
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="salonName" className="block text-sm font-medium text-card-foreground">Nombre del Salón</label>
              <input type="text" id="salonName" name="salonName" value={profileForm.salonName} onChange={handleProfileChange} className="mt-1 block w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background" />
            </div>
            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-card-foreground">Tu Nombre</label>
              <input type="text" id="ownerName" name="ownerName" value={profileForm.ownerName} onChange={handleProfileChange} className="mt-1 block w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background" />
            </div>
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-card-foreground">Detalles para Transferencia / Pago</label>
              <textarea id="accountNumber" name="accountNumber" value={profileForm.accountNumber || ''} onChange={handleProfileChange} rows={3} className="mt-1 block w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background" placeholder={'Ej:\nBancolombia cuenta AHORROS\n(123-4560-1890)'} />
            </div>
            <div className="pt-2">
              <button type="submit" className="w-full sm:w-auto bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg shadow hover:bg-primary-hover transition-colors">
                Guardar Cambios de Perfil
              </button>
            </div>
          </div>
        </form>
        
        {/* Customization Settings */}
        <div className="mb-8 p-4 md:p-6 border border-border rounded-xl">
            <h3 className="text-xl font-semibold text-card-foreground mb-4 flex items-center">
                <PaletteIcon className="w-6 h-6 mr-3 text-blue-500" />
                Personalización de la Apariencia
            </h3>
            <div className='space-y-6'>
                <div>
                    <label className="block text-sm font-medium text-card-foreground mb-3">Color de Botones (Primario)</label>
                    <div className="flex flex-wrap gap-4">
                        {colorOptions.map(color => (
                            <label key={color.name} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="primaryColor"
                                    value={color.name}
                                    checked={themeSettingsForm.primaryColor === color.name}
                                    onChange={() => handleThemeSettingChange('primaryColor', color.name)}
                                    className="sr-only"
                                />
                                <div className={`w-8 h-8 rounded-full ${color.bgClass} transition-all ${themeSettingsForm.primaryColor === color.name ? 'ring-2 ring-offset-2 ring-offset-background ring-primary' : ''}`}></div>
                                <span className={`font-medium ${themeSettingsForm.primaryColor === color.name ? 'text-primary' : 'text-muted-foreground'}`}>{color.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-card-foreground mb-3">Color de Fondo</label>
                    <div className="flex flex-wrap gap-4">
                       {backgroundOptions.map(bg => (
                            <label key={bg.name} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="backgroundColor"
                                    value={bg.name}
                                    checked={themeSettingsForm.backgroundColor === bg.name}
                                    onChange={() => handleThemeSettingChange('backgroundColor', bg.name)}
                                    className="sr-only"
                                />
                                <div className={`px-4 py-1 rounded-md border-2 transition-colors ${themeSettingsForm.backgroundColor === bg.name ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground'}`}>
                                    {bg.label}
                                </div>
                            </label>
                       ))}
                    </div>
                </div>
            </div>
        </div>


        {/* Appearance Settings */}
        <div className="mb-8 p-4 md:p-6 border border-border rounded-xl">
          <h3 className="text-xl font-semibold text-card-foreground mb-4 flex items-center">
            <PaletteIcon className="w-6 h-6 mr-3 text-muted-foreground" />
            Modo de Apariencia
          </h3>
          <div className="flex space-x-2 rounded-lg bg-muted p-1">
            <button
                onClick={() => onThemeChange('light')}
                className={`w-full flex items-center justify-center space-x-2 rounded-md py-2 px-3 text-sm font-medium transition-all ${
                    theme === 'light' ? 'bg-card text-primary shadow' : 'text-muted-foreground hover:bg-card/50'
                }`}
            >
                <SunIcon className="w-5 h-5" />
                <span>Claro</span>
            </button>
            <button
                onClick={() => onThemeChange('dark')}
                className={`w-full flex items-center justify-center space-x-2 rounded-md py-2 px-3 text-sm font-medium transition-all ${
                    theme === 'dark' ? 'bg-card text-primary shadow' : 'text-muted-foreground hover:bg-card/50'
                }`}
            >
                 <MoonIcon className="w-5 h-5" />
                 <span>Oscuro</span>
            </button>
          </div>
        </div>


        {/* Service Prices */}
        <form onSubmit={handleSavePrices} className="mb-8 p-4 md:p-6 border border-border rounded-xl">
          <h3 className="text-xl font-semibold text-card-foreground mb-4 flex items-center">
            <DollarSignIcon className="w-6 h-6 mr-3 text-green-500" />
            Precios de Servicios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {Object.keys(pricesForm).map((service) => (
              <div key={service}>
                <label htmlFor={service} className="block text-sm font-medium text-card-foreground">{service}</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                   <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                     <span className="text-muted-foreground sm:text-sm">$</span>
                   </div>
                   <input
                    type="number"
                    name={service}
                    id={service}
                    value={pricesForm[service]}
                    onChange={handlePriceChange}
                    className="block w-full rounded-md border-border pl-7 pr-4 py-2 focus:border-primary focus:ring-primary sm:text-sm bg-background"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-6">
            <button type="submit" className="w-full sm:w-auto bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-green-700 transition-colors">
              Guardar Precios
            </button>
          </div>
        </form>

        {/* Data Management */}
        <div className="mb-8 p-4 md:p-6 border border-border rounded-xl">
            <h3 className="text-xl font-semibold text-card-foreground mb-2 flex items-center">
                <UploadIcon className="w-6 h-6 mr-3 text-blue-500" />
                Gestión de Datos
            </h3>
            <ExcelUploader onDataUploaded={onAppointmentsImported} serviceList={Object.keys(prices)} />
        </div>


        {/* Notification Settings */}
        <div className="p-4 md:p-6 border border-border rounded-xl">
            <h3 className="text-xl font-semibold text-card-foreground mb-4 flex items-center">
                <MegaphoneIcon className="w-6 h-6 mr-3 text-purple-500" />
                Notificaciones
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-card-foreground text-sm sm:text-base">Recordatorios de citas por email</span>
                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="relative w-11 h-6 bg-muted rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                 <div className="flex items-center justify-between">
                    <span className="text-card-foreground text-sm sm:text-base">Alertas de bajo stock</span>
                     <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="relative w-11 h-6 bg-muted rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;