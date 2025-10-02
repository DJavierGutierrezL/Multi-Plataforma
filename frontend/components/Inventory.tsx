import React, { useState, useMemo } from 'react';
import { Product } from '../types';

// --- Componentes de Íconos y Modal (Definidos localmente) ---

const BoxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const AlertTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const DollarSignIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-card rounded-2xl shadow-lg w-full max-w-md m-4 border border-border">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="text-lg font-bold text-card-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};


// Definimos el tipo para un Gasto
interface Expense {
    id: number;
    description: string;
    amount: number;
    date: string; // Formato ISO
}

// --- INTERFAZ DE PROPS ACTUALIZADA ---
interface InventoryAndExpensesProps {
    products: Product[];
    expenses: Expense[];
    onCreateProduct: (productData: Omit<Product, 'id' | 'businessId'>) => Promise<void>;
    onDeleteProduct: (productId: number) => Promise<void>;
    onCreateExpense: (expenseData: Omit<Expense, 'id' | 'businessId'>) => Promise<void>;
    onDeleteExpense: (expenseId: number) => Promise<void>;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-accent p-4 rounded-lg flex items-center">
        <div className="p-3 rounded-full bg-primary/20 text-primary mr-4">{icon}</div>
        <div>
            <p className="text-sm text-muted-foreground font-semibold capitalize">{title}</p>
            <p className="text-xl font-bold text-card-foreground">{value}</p>
        </div>
    </div>
);

// --- COMPONENTE ACTUALIZADO PARA USAR PROPS ---
const Inventory: React.FC<InventoryAndExpensesProps> = ({
    products,
    expenses,
    onCreateProduct,
    onDeleteProduct,
    onCreateExpense,
    onDeleteExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'expenses'>('inventory');

  // Estados locales para manejar los modales y formularios
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDeleteExpenseModalOpen, setIsDeleteExpenseModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Partial<Expense> | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('all');

  // --- Funciones de UI (sin cambios) ---
  const getStockColor = (current: number, min: number): string => {
    if (min <= 0) return 'bg-green-500';
    const percentage = (current / min) * 100;
    if (percentage <= 100) return 'bg-red-500';
    if (percentage <= 150) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const handleCloseModals = () => {
    setIsProductModalOpen(false); setIsDeleteProductModalOpen(false); setCurrentProduct(null); setProductToDelete(null);
    setIsExpenseModalOpen(false); setIsDeleteExpenseModalOpen(false); setCurrentExpense(null); setExpenseToDelete(null);
  };

  const handleOpenAddProductModal = () => { setCurrentProduct({}); setIsProductModalOpen(true); };
  const handleOpenEditProductModal = (product: Product) => { setCurrentProduct(product); setIsProductModalOpen(true); };
  const handleOpenDeleteProductModal = (product: Product) => { setProductToDelete(product); setIsDeleteProductModalOpen(true); };
  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (currentProduct) { const { name, value, type } = e.target; setCurrentProduct({ ...currentProduct, [name]: type === 'number' ? parseInt(value, 10) || 0 : value }); } };
  
  const handleOpenAddExpenseModal = () => { setCurrentExpense({ date: new Date().toISOString().split('T')[0] }); setIsExpenseModalOpen(true); };
  const handleOpenDeleteExpenseModal = (expense: Expense) => { setExpenseToDelete(expense); setIsDeleteExpenseModalOpen(true); };
  const handleExpenseFormChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (currentExpense) { const { name, value, type } = e.target; setCurrentExpense({ ...currentExpense, [name]: type === 'number' ? parseFloat(value) || 0 : value }); } };

  // --- FUNCIONES DE GUARDADO Y BORRADO (MODIFICADAS) ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !currentProduct.name || currentProduct.currentStock === undefined || currentProduct.minStock === undefined) {
      alert("Por favor, rellena todos los campos del producto.");
      return;
    }
    // Por ahora, solo manejamos la creación. La edición requeriría un endpoint PUT/PATCH.
    if (!currentProduct.id) {
        await onCreateProduct({
            name: currentProduct.name,
            currentStock: currentProduct.currentStock,
            minStock: currentProduct.minStock,
        });
    }
    handleCloseModals();
  };
  
  const handleDeleteProductConfirm = async () => {
    if (productToDelete) {
        await onDeleteProduct(productToDelete.id);
    }
    handleCloseModals();
  };
  
  const handleSaveExpense = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentExpense || !currentExpense.description || !currentExpense.amount || !currentExpense.date) {
        alert("Por favor, rellena todos los campos del gasto.");
        return;
      }
      
      const date = new Date(currentExpense.date);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const dateInUTC = new Date(date.getTime() + userTimezoneOffset);

      await onCreateExpense({
          description: currentExpense.description,
          amount: currentExpense.amount,
          date: dateInUTC.toISOString(),
      });
      handleCloseModals();
  };

  const handleDeleteExpenseConfirm = async () => {
      if (expenseToDelete) {
        await onDeleteExpense(expenseToDelete.id);
      }
      handleCloseModals();
  };
  
  // --- Lógica de cálculos y filtros (sin cambios) ---
  const formatMonthForDisplay = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  };
  
  const expenseTotals = useMemo(() => {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startOfWeekUTC = new Date(todayUTC);
    startOfWeekUTC.setUTCDate(todayUTC.getUTCDate() - todayUTC.getUTCDay());
    const startOfFortnightUTC = new Date(todayUTC);
    startOfFortnightUTC.setUTCDate(todayUTC.getUTCDate() - 15);
    const startOfMonthUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const filterAndSum = (startDate: Date) => expenses.filter(e => new Date(e.date) >= startDate).reduce((sum, e) => sum + e.amount, 0);

    let monthlyDisplayTotal;
    let monthlyDisplayTitle = "Gasto Mensual";

    if (filterMonth === 'all') {
      monthlyDisplayTotal = filterAndSum(startOfMonthUTC);
    } else {
      monthlyDisplayTotal = expenses.filter(e => e.date.startsWith(filterMonth)).reduce((sum, e) => sum + e.amount, 0);
      monthlyDisplayTitle = `Gasto de ${formatMonthForDisplay(filterMonth)}`;
    }

    return { day: filterAndSum(todayUTC), week: filterAndSum(startOfWeekUTC), fortnight: filterAndSum(startOfFortnightUTC), month: monthlyDisplayTotal, monthTitle: monthlyDisplayTitle };
  }, [expenses, filterMonth]);
    
  const availableMonths = useMemo(() => {
    const monthSet = new Set(expenses.map(e => e.date.substring(0, 7)));
    return Array.from(monthSet).sort().reverse();
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (filterMonth === 'all') return expenses;
    return expenses.filter(e => e.date.startsWith(filterMonth));
  }, [expenses, filterMonth]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

  return (
    <>
      <div className="bg-card p-4 md:p-8 rounded-2xl shadow-lg border border-border">
        <h2 className="text-2xl font-bold text-card-foreground mb-4">Inventario y Gastos</h2>
        <div className="flex border-b border-border mb-6">
          <button onClick={() => setActiveTab('inventory')} className={`py-2 px-4 font-semibold ${activeTab === 'inventory' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>Gestión de Inventario</button>
          <button onClick={() => setActiveTab('expenses')} className={`py-2 px-4 font-semibold ${activeTab === 'expenses' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>Gestión de Gastos</button>
        </div>

        {activeTab === 'inventory' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                <h3 className="text-xl font-bold text-card-foreground mb-4 md:mb-0">Tus Productos</h3>
                <button onClick={handleOpenAddProductModal} className="w-full md:w-auto bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg shadow hover:bg-primary-hover transition-colors flex items-center justify-center">
                    <BoxIcon className="w-5 h-5 mr-2" /> Añadir Producto
                </button>
            </div>
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
                                  <div className="w-full bg-muted rounded-full h-2.5">
                                      <div className={`h-2.5 rounded-full ${getStockColor(product.currentStock, product.minStock)}`} style={{ width: `${Math.min((product.currentStock / (product.minStock > 0 ? product.minStock * 2 : 1)) * 100, 100)}%` }}></div>
                                  </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Gasto de Hoy" value={formatCurrency(expenseTotals.day)} icon={<DollarSignIcon className="w-6 h-6"/>} />
                <StatCard title="Gasto Semanal" value={formatCurrency(expenseTotals.week)} icon={<DollarSignIcon className="w-6 h-6"/>} />
                <StatCard title="Gasto Quincenal" value={formatCurrency(expenseTotals.fortnight)} icon={<DollarSignIcon className="w-6 h-6"/>} />
                <StatCard title={expenseTotals.monthTitle} value={formatCurrency(expenseTotals.month)} icon={<DollarSignIcon className="w-6 h-6"/>} />
            </div>
            
            <div className="mb-4 flex justify-end">
              <select onChange={(e) => setFilterMonth(e.target.value)} value={filterMonth} className="p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-card-foreground">
                <option value="all">Ver Todos los Meses</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>{formatMonthForDisplay(month)}</option>
                ))}
              </select>
            </div>

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
                        {filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => (
                            <tr key={expense.id} className="border-b border-border hover:bg-accent">
                                <td data-label="Fecha" className="py-4 px-6 font-medium">{new Date(expense.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })}</td>
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

      <Modal isOpen={isProductModalOpen} onClose={handleCloseModals} title={currentProduct?.id ? 'Editar Producto' : 'Añadir Nuevo Producto'}>
          <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                  <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-1">Nombre del Producto</label>
                  <input type="text" name="name" id="name" value={currentProduct?.name || ''} onChange={handleProductFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="currentStock" className="block text-sm font-medium text-card-foreground mb-1">Cantidad Actual</label>
                      <input type="number" name="currentStock" id="currentStock" value={currentProduct?.currentStock ?? ''} onChange={handleProductFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required min="0" />
                  </div>
                  <div>
                      <label htmlFor="minStock" className="block text-sm font-medium text-card-foreground mb-1">Alerta de Mínimo</label>
                      <input type="number" name="minStock" id="minStock" value={currentProduct?.minStock ?? ''} onChange={handleProductFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required min="0" />
                  </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                  <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow hover:bg-primary-hover">Guardar Producto</button>
              </div>
          </form>
      </Modal>
      <Modal isOpen={isDeleteProductModalOpen} onClose={handleCloseModals} title="Confirmar Eliminación">
          <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <p className="mt-4 text-card-foreground">¿Estás seguro de que quieres eliminar <strong>{productToDelete?.name}</strong>?</p>
              <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
          </div>
          <div className="mt-6 flex justify-center space-x-4">
              <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button>
              <button type="button" onClick={handleDeleteProductConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700">Sí, Eliminar</button>
          </div>
      </Modal>

      <Modal isOpen={isExpenseModalOpen} onClose={handleCloseModals} title="Añadir Nuevo Gasto">
          <form onSubmit={handleSaveExpense} className="space-y-4">
              <div>
                  <label htmlFor="description" className="block text-sm font-medium text-card-foreground mb-1">Descripción del Gasto</label>
                  <input type="text" name="description" id="description" value={currentExpense?.description || ''} onChange={handleExpenseFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-card-foreground mb-1">Monto (COP)</label>
                    <input type="number" name="amount" id="amount" value={currentExpense?.amount ?? ''} onChange={handleExpenseFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required min="0" step="1" />
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-card-foreground mb-1">Fecha del Gasto</label>
                    <input type="date" name="date" id="date" value={typeof currentExpense?.date === 'string' ? currentExpense.date.split('T')[0] : ''} onChange={handleExpenseFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                  <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow hover:bg-primary-hover">Guardar Gasto</button>
              </div>
          </form>
      </Modal>
      <Modal isOpen={isDeleteExpenseModalOpen} onClose={handleCloseModals} title="Confirmar Eliminación">
          <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <p className="mt-4 text-card-foreground">¿Estás seguro de que quieres eliminar el gasto <strong>"{expenseToDelete?.description}"</strong>?</p>
              <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
          </div>
          <div className="mt-6 flex justify-center space-x-4">
              <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button>
              <button type="button" onClick={handleDeleteExpenseConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700">Sí, Eliminar</button>
          </div>
      </Modal>
    </>
  );
};

export default Inventory;

