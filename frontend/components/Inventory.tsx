import React, { useState } from 'react';
import { Product } from '../types';
import { BoxIcon } from './icons/BoxIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import Modal from './Modal';

interface InventoryProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const getStockColor = (current: number, min: number): string => {
    if (min <= 0) return 'bg-green-500';
    const percentage = (current / min) * 100;
    if (percentage <= 100) return 'bg-red-500';
    if (percentage <= 150) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const handleCloseModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentProduct(null);
    setProductToDelete(null);
  };

  const handleOpenAddModal = () => {
    setCurrentProduct({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };
  
  const handleOpenDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentProduct) {
      const { name, value, type } = e.target;
      setCurrentProduct({
        ...currentProduct,
        [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
      });
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    const { id, name, currentStock, minStock } = currentProduct;

    if (!name || currentStock === undefined || minStock === undefined) {
        alert('Por favor, rellena todos los campos.');
        return;
    }
    
    if (id) {
        setProducts(products.map(p => p.id === id ? { ...p, ...currentProduct } as Product : p));
    } else {
        const newProduct: Product = {
            id: Date.now(),
            name,
            currentStock,
            minStock,
        };
        setProducts([newProduct, ...products]);
    }
    handleCloseModals();
  };
  
  const handleDeleteConfirm = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete.id));
    }
    handleCloseModals();
  };


  return (
    <>
    <div className="bg-card p-4 md:p-8 rounded-2xl shadow-lg border border-border">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
        <h2 className="text-2xl font-bold text-card-foreground mb-4 md:mb-0">Gestión de Inventario</h2>
        <button onClick={handleOpenAddModal} className="w-full md:w-auto bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg shadow hover:bg-primary-hover transition-colors flex items-center justify-center">
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
                      <div
                        className={`h-2.5 rounded-full ${getStockColor(product.currentStock, product.minStock)}`}
                        style={{ width: `${Math.min((product.currentStock / (product.minStock > 0 ? product.minStock * 2 : 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td data-label="Cantidad" className="py-4 px-6 text-right md:text-center font-mono">{product.currentStock}</td>
                  <td data-label="Mínimo" className="py-4 px-6 text-right md:text-center font-mono">{product.minStock}</td>
                  <td data-label="Estado" className="py-4 px-6 text-right md:text-center">
                    {isLowStock ? (
                       <span className="flex items-center justify-end md:justify-center text-red-600 font-semibold dark:text-red-400">
                         <AlertTriangleIcon className="w-5 h-5 mr-2" />
                         Bajo Stock
                       </span>
                    ) : (
                      <span className="text-green-600 font-semibold dark:text-green-400">OK</span>
                    )}
                  </td>
                  <td data-label="Acciones" className="py-4 px-6 text-right md:text-center">
                    <button onClick={() => handleOpenEditModal(product)} className="text-blue-500 hover:text-blue-700 mr-4"><i className="fas fa-edit"></i></button>
                    <button onClick={() => handleOpenDeleteModal(product)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={currentProduct?.id ? 'Editar Producto' : 'Añadir Nuevo Producto'}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-1">Nombre del Producto</label>
            <input type="text" name="name" id="name" value={currentProduct?.name || ''} onChange={handleFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="currentStock" className="block text-sm font-medium text-card-foreground mb-1">Cantidad Actual</label>
                <input type="number" name="currentStock" id="currentStock" value={currentProduct?.currentStock ?? ''} onChange={handleFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required min="0" />
              </div>
              <div>
                <label htmlFor="minStock" className="block text-sm font-medium text-card-foreground mb-1">Alerta de Mínimo</label>
                <input type="number" name="minStock" id="minStock" value={currentProduct?.minStock ?? ''} onChange={handleFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required min="0" />
              </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow hover:bg-primary-hover">Guardar Producto</button>
          </div>
        </form>
    </Modal>

    <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        title="Confirmar Eliminación"
    >
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <p className="mt-4 text-card-foreground">
                ¿Estás seguro de que quieres eliminar <strong>{productToDelete?.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
        </div>
        <div className="mt-6 flex justify-center space-x-4">
            <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">
                Cancelar
            </button>
            <button type="button" onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700">
                Sí, Eliminar
            </button>
        </div>
    </Modal>
    </>
  );
};

export default Inventory;