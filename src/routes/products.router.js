// src/routes/products.router.js
import express from 'express';
import Product from '../models/Product.js';
import { createProduct, getAllProducts } from '../services/ProductManager.js';

const router = express.Router();

// Ruta para obtener productos con filtros, paginación y ordenamiento
router.get('/', async (req, res) => {
  const { limit = 10, page = 1, sort, query } = req.query;

  try {
    const filters = {};
    if (query) {
      if (query === 'available') {
        filters.status = true;
      } else {
        filters.category = query;
      }
    }

    const sortOrder = sort === 'asc' ? 1 : -1;
    const options = {
      limit: parseInt(limit),
      skip: (page - 1) * limit,
      sort: sort ? { price: sortOrder } : {},
    };

    const products = await Product.find(filters, null, options);
    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? parseInt(page) + 1 : null,
      page: Number(page),
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink: page > 1 ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}` : null,
      nextLink: page < totalPages ? `/api/products?limit=${limit}&page=${parseInt(page) + 1}&sort=${sort}&query=${query}` : null,
    });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ruta para crear un nuevo producto
router.post('/', async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;

  try {
    // Validación de los campos requeridos
    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Usando el servicio para crear el producto
    const newProduct = await createProduct({ title, description, code, price, stock, category, thumbnails });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear el producto', details: error.message });
  }
});

// Ruta para actualizar un producto por ID
router.put('/:pid', async (req, res) => {
  try {
    const updateProduct = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
    if (updateProduct) {
      res.json(updateProduct);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// Ruta para eliminar un producto por ID
router.delete('/:pid', async (req, res) => {
  try {
    const deleteProduct = await Product.findByIdAndDelete(req.params.pid);
    if (deleteProduct) {
      res.json(deleteProduct);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

export default router;
