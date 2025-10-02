const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
// Asumimos que tienes un cliente Prisma configurado en db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Middleware para proteger todas las rutas de este archivo
router.use(verifyToken);

// --- RUTAS DE PRODUCTOS ---

// Obtener todos los productos del negocio
router.get('/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { businessId: req.user.businessId },
            orderBy: { name: 'asc' }
        });
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: 'Error al obtener los productos.' });
    }
});

// Crear un nuevo producto
router.post('/products', async (req, res) => {
    const { name, currentStock, minStock } = req.body;
    try {
        const newProduct = await prisma.product.create({
            data: {
                name,
                currentStock,
                minStock,
                businessId: req.user.businessId,
            }
        });
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: 'Error al crear el producto.' });
    }
});

// Eliminar un producto
router.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({
            where: { 
                id: parseInt(id),
                // Aseguramos que solo el dueño del negocio puede borrarlo
                businessId: req.user.businessId 
            }
        });
        res.status(204).send(); // No content
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: 'Error al eliminar el producto.' });
    }
});


// --- RUTAS DE GASTOS ---

// Obtener todos los gastos del negocio
router.get('/expenses', async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            where: { businessId: req.user.businessId },
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: 'Error al obtener los gastos.' });
    }
});

// Crear un nuevo gasto
router.post('/expenses', async (req, res) => {
    const { description, amount, date } = req.body;
    try {
        const newExpense = await prisma.expense.create({
            data: {
                description,
                amount,
                date: new Date(date),
                businessId: req.user.businessId,
            }
        });
        res.status(201).json(newExpense);
    } catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ message: 'Error al crear el gasto.' });
    }
});

// Eliminar un gasto
router.delete('/expenses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.expense.delete({
            where: { 
                id: parseInt(id),
                businessId: req.user.businessId 
            }
        });
        res.status(204).send(); // No content
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ message: 'Error al eliminar el gasto.' });
    }
});


module.exports = router;
