import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { BoxIcon } from './icons/BoxIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { DollarSignIcon } from './icons/DollarSignIcon'; // Asegúrate de tener este ícono
import Modal from './Modal';

// Definimos el tipo para un Gasto
interface Expense {
    id: number;
    description: string;
    amount: number;
    date: string; // Guardaremos la fecha como un string en formato ISO
}

interface InventoryAndExpensesProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-accent p-4 rounded-lg flex items-center">
        <div className="p-3 rounded-full bg-primary/20 text-primary mr-4">{icon}</div>
        <div>
            <p className="text-sm text-muted-foreground font-semibold">{title}</p>
            <p className="text-xl font-bold text-card-foreground">{value}</p>
        </div>
    </div>
);


const Inventory: React.FC<InventoryAndExpensesProps> = ({ products, setProducts, expenses, setExpenses }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'expenses'>('inventory');

  // --- Estados y Lógica para INVENTARIO ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // --- Estados y Lógica para GASTOS ---
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDeleteExpenseModalOpen, setIsDeleteExpenseModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Partial<Expense> | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // --- Funciones para INVENTARIO ---
  const getStockColor = (current: number, min: number): string => {
    if (min <= 0) return 'bg-green-500';
    const percentage = (current / min) * 100;
    if (percentage <= 100) return 'bg-red-500';
    if (percentage <= 150) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const handleCloseModals = () => {
    setIsProductModalOpen(false);
    setIsDeleteProductModalOpen(false);
    setCurrentProduct(null);
    setProductToDelete(null);
    setIsExpenseModalOpen(false);
    setIsDeleteExpenseModalOpen(false);
    setCurrentExpense(null);
    setExpenseToDelete(null);
  };

  const handleOpenAddProductModal = () => {
    setCurrentProduct({});
    setIsProductModalOpen(true);
  };
  
  const handleOpenEditProductModal = (product: Product) => {
    setCurrentProduct(product);
    setIsProductModalOpen(true);
  };
  
  const handleOpenDeleteProductModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteProductModalOpen(true);
  };

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentProduct) {
      const { name, value, type } = e.target;
      setCurrentProduct({ ...currentProduct, [name]: type === 'number' ? parseInt(value, 10) || 0 : value });
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !currentProduct.name) return;
    if (currentProduct.id) {
        setProducts(products.map(p => p.id === currentProduct.id ? { ...p, ...currentProduct } as Product : p));
    } else {
        const newProduct: Product = { id: Date.now(), name: currentProduct.name, currentStock: currentProduct.currentStock || 0, minStock: currentProduct.minStock || 0 };
        setProducts([newProduct, ...products]);
    }
    handleCloseModals();
  };
  
  const handleDeleteProductConfirm = () => {
    if (productToDelete) setProducts(products.filter(p => p.id !== productToDelete.id));
    handleCloseModals();
  };

  // --- Funciones para GASTOS ---
  const handleOpenAddExpenseModal = () => {
      setCurrentExpense({ date: new Date().toISOString().split('T')[0] });
      setIsExpenseModalOpen(true);
  };

  const handleOpenDeleteExpenseModal = (expense: Expense) => {
      setExpenseToDelete(expense);
      setIsDeleteExpenseModalOpen(true);
  };

  const handleExpenseFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (currentExpense) {
          const { name, value, type } = e.target;
          setCurrentExpense({ ...currentExpense, [name]: type === 'number' ? parseFloat(value) || 0 : value });
      }
  };

  const handleSaveExpense = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentExpense || !currentExpense.description || !currentExpense.amount) return;
      const newExpense: Expense = {
          id: Date.now(),
          description: currentExpense.description,
          amount: currentExpense.amount,
          date: new Date().toISOString(),
      };
      setExpenses([newExpense, ...expenses]);
      handleCloseModals();
  };

  const handleDeleteExpenseConfirm = () => {
      if (expenseToDelete) setExpenses(expenses.filter(e => e.id !== expenseToDelete.id));
      handleCloseModals();
  };

  const expenseTotals = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfFortnight = new Date(today);
        startOfFortnight.setDate(today.getDate() - 15);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const filterAndSum = (startDate: Date) => expenses
            .filter(e => new Date(e.date) >= startDate)
            .reduce((sum, e) => sum + e.amount, 0);

        return {
            day: filterAndSum(today),
            week: filterAndSum(startOfWeek),
            fortnight: filterAndSum(startOfFortnight),
            month: filterAndSum(startOfMonth),
        };
    }, [expenses]);
    
  const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

  return (
    <>
      <div className="bg-card p-4 md:p-8 rounded-2xl shadow-lg border border-border">
        <h2 className="text-2xl font-bold text-card-foreground mb-4">Inventario y Gastos</h2>
        
        {/* Pestañas */}
        <div className="flex border-b border-border mb-6">
          <button onClick={() => setActiveTab('inventory')} className={`py-2 px-4 font-semibold ${activeTab === 'inventory' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
            Gestión de Inventario
          </button>
          <button onClick={() => setActiveTab('expenses')} className={`py-2 px-4 font-semibold ${activeTab === 'expenses' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
            Gestión de Gastos
          </button>
        </div>

        {/* Contenido de la Pestaña */}
        {activeTab === 'inventory' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
              <h3 className="text-xl font-bold text-card-foreground mb-4 md:mb-0">Tus Productos</h3>
              <button onClick={handleOpenAddProductModal} className="w-full md:w-auto bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg shadow hover:bg-primary-hover transition-colors flex items-center justify-center">
                <BoxIcon className="w-5 h-5 mr-2" /> Añadir Producto
              </button>
            </div>
            {/* Tabla de Inventario */}
            <div className="overflow-x-auto responsive-table">
              <table className="min-w-full bg-card">
                  <thead className="bg-accent">
                      <tr>
                          <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">Nombre del Producto</th>
                          <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">Stock</th>
                          <th className="py-3 px-6 text-center text-sm font-semibold text-accent-foreground">Cantidad Actual</th>
                          <th className="py-3 px-6 text-center text-sm font-semibold text-accent-foreground">Alerta de Mínimo</th>
                          <th className="py-3 px-6 text-center text-sm font-semibold text-accent-foreground">Estado</th>
                          <th className="py-3 px-6 text-center text-sm font-semibold text-accent-foreground">Acciones</th>
                      </tr>
                  </thead>
                  <tbody className="text-card-foreground">
                      {products.sort((a, b) => a.name.localeCompare(b.name)).map((product) => {
                          const isLowStock = product.currentStock <= product.minStock;
                          return (
                              <tr key={product.id} className={`border-b border-border ${isLowStock ? 'bg-red-500/10' : 'hover:bg-accent'}`}>
                                  <td data-label="Producto" className="py-4 px-6 font-medium">{product.name}</td>
                                  <td data-label="Stock" className="py-4 px-6">
                                      <div className="w-full bg-muted rounded-full h-2.5"><div className={`h-2.5 rounded-full ${getStockColor(product.currentStock, product.minStock)}`} style={{ width: `${Math.min((product.currentStock / (product.minStock > 0 ? product.minStock * 2 : 1)) * 100, 100)}%` }}></div></div>
                                  </td>
                                  <td data-label="Cantidad" className="py-4 px-6 text-right md:text-center font-mono">{product.currentStock}</td>
                                  <td data-label="Mínimo" className="py-4 px-6 text-right md:text-center font-mono">{product.minStock}</td>
                                  <td data-label="Estado" className="py-4 px-6 text-right md:text-center">
                                      {isLowStock ? (<span className="flex items-center justify-end md:justify-center text-red-600 font-semibold dark:text-red-400"><AlertTriangleIcon className="w-5 h-5 mr-2" />Bajo Stock</span>) : (<span className="text-green-600 font-semibold dark:text-green-400">OK</span>)}
                                  </td>
                                  <td data-label="Acciones" className="py-4 px-6 text-right md:text-center">
                                      <button onClick={() => handleOpenEditProductModal(product)} className="text-blue-500 hover:text-blue-700 mr-4"><i className="fas fa-edit"></i></button>
                                      <button onClick={() => handleOpenDeleteProductModal(product)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
              <h3 className="text-xl font-bold text-card-foreground mb-4 md:mb-0">Resumen de Gastos</h3>
              <button onClick={handleOpenAddExpenseModal} className="w-full md:w-auto bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg shadow hover:bg-primary-hover transition-colors flex items-center justify-center">
                <DollarSignIcon className="w-5 h-5 mr-2" /> Añadir Gasto
              </button>
            </div>

            {/* Tarjetas de Resumen de Gastos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard title="Gasto de Hoy" value={formatCurrency(expenseTotals.day)} icon={<DollarSignIcon className="w-6 h-6"/>} />
              <StatCard title="Gasto Semanal" value={formatCurrency(expenseTotals.week)} icon={<DollarSignIcon className="w-6 h-6"/>} />
              <StatCard title="Gasto Quincenal" value={formatCurrency(expenseTotals.fortnight)} icon={<DollarSignIcon className="w-6 h-6"/>} />
              <StatCard title="Gasto Mensual" value={formatCurrency(expenseTotals.month)} icon={<DollarSignIcon className="w-6 h-6"/>} />
            </div>

            {/* Tabla de Gastos */}
            <div className="overflow-x-auto responsive-table">
                <table className="min-w-full bg-card">
                    <thead className="bg-accent">
                        <tr>
                            <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">Fecha</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">Descripción</th>
                            <th className="py-3 px-6 text-right text-sm font-semibold text-accent-foreground">Monto</th>
                            <th className="py-3 px-6 text-center text-sm font-semibold text-accent-foreground">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-card-foreground">
                        {expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => (
                            <tr key={expense.id} className="border-b border-border hover:bg-accent">
                                <td data-label="Fecha" className="py-4 px-6 font-medium">{new Date(expense.date).toLocaleDateString('es-ES')}</td>
                                <td data-label="Descripción" className="py-4 px-6">{expense.description}</td>
                                <td data-label="Monto" className="py-4 px-6 text-right font-mono">{formatCurrency(expense.amount)}</td>
                                <td data-label="Acciones" className="py-4 px-6 text-center">
                                    <button onClick={() => handleOpenDeleteExpenseModal(expense)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

          </div>
        )}
      </div>

      {/* Modales para Productos */}
      <Modal isOpen={isProductModalOpen} onClose={handleCloseModals} title={currentProduct?.id ? 'Editar Producto' : 'Añadir Nuevo Producto'}>
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div><label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-1">Nombre del Producto</label><input type="text" name="name" id="name" value={currentProduct?.name || ''} onChange={handleProductFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="currentStock" className="block text-sm font-medium text-card-foreground mb-1">Cantidad Actual</label><input type="number" name="currentStock" id="currentStock" value={currentProduct?.currentStock ?? ''} onChange={handleProductFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required min="0" /></div>
            <div><label htmlFor="minStock" className="block text-sm font-medium text-card-foreground mb-1">Alerta de Mínimo</label><input type="number" name="minStock" id="minStock" value={currentProduct?.minStock ?? ''} onChange={handleProductFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required min="0" /></div>
          </div>
          <div className="mt-6 flex justify-end space-x-4"><button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow hover:bg-primary-hover">Guardar Producto</button></div>
        </form>
      </Modal>
      <Modal isOpen={isDeleteProductModalOpen} onClose={handleCloseModals} title="Confirmar Eliminación">
        <div className="text-center"><div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100"><AlertTriangleIcon className="h-6 w-6 text-red-600" /></div><p className="mt-4 text-card-foreground">¿Estás seguro de que quieres eliminar <strong>{productToDelete?.name}</strong>?</p><p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p></div>
        <div className="mt-6 flex justify-center space-x-4"><button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button><button type="button" onClick={handleDeleteProductConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700">Sí, Eliminar</button></div>
      </Modal>

      {/* Modales para Gastos */}
      <Modal isOpen={isExpenseModalOpen} onClose={handleCloseModals} title="Añadir Nuevo Gasto">
          <form onSubmit={handleSaveExpense} className="space-y-4">
              <div><label htmlFor="description" className="block text-sm font-medium text-card-foreground mb-1">Descripción del Gasto</label><input type="text" name="description" id="description" value={currentExpense?.description || ''} onChange={handleExpenseFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required /></div>
              <div><label htmlFor="amount" className="block text-sm font-medium text-card-foreground mb-1">Monto (COP)</label><input type="number" name="amount" id="amount" value={currentExpense?.amount ?? ''} onChange={handleExpenseFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required min="0" step="1" /></div>
              <div className="mt-6 flex justify-end space-x-4"><button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow hover:bg-primary-hover">Guardar Gasto</button></div>
          </form>
      </Modal>
      <Modal isOpen={isDeleteExpenseModalOpen} onClose={handleCloseModals} title="Confirmar Eliminación">
          <div className="text-center"><div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100"><AlertTriangleIcon className="h-6 w-6 text-red-600" /></div><p className="mt-4 text-card-foreground">¿Estás seguro de que quieres eliminar el gasto <strong>"{expenseToDelete?.description}"</strong>?</p><p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p></div>
          <div className="mt-6 flex justify-center space-x-4"><button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button><button type="button" onClick={handleDeleteExpenseConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700">Sí, Eliminar</button></div>
      </Modal>
    </>
  );
};

export default Inventory;