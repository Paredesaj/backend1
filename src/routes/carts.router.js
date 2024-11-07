// src/routes/carts.router.js
import express from 'express';
import cartService from "../services/cartService.js";
import { Product } from '../services/ProductManager.js'; // Importar el modelo de productos

const router = express.Router();

// POST: Crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const { products } = req.body;
    const newCart = await cartService.createCart(products || []);
    res.status(201).json({ message: "Carrito creado", cart: newCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

// GET: Obtener carrito con detalles completos de productos usando populate
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartService.getCartById(cid);

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    res.json({ status: "success", payload: cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

// POST: Agregar un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body; // Asumimos que quantity se pasa en el cuerpo de la solicitud

    // Recuperar el producto completo desde la base de datos
    const product = await Product.findById(pid);
    if (!product) {
      console.error("Producto no encontrado:", pid);
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Crear el objeto productItem con la información completa del producto
    const productItem = {
      product: product, // Añadir el producto completo
      quantity: quantity, // Añadir la cantidad
    };

    // Llamar a cartService para agregar el producto al carrito
    const updatedCart = await cartService.addProductToCart(cid, productItem);

    if (!updatedCart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    res.json({ message: "Producto agregado al carrito", cart: updatedCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
});

// DELETE: Eliminar producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const updatedCart = await cartService.removeProductFromCart(cid, pid);
    if (!updatedCart) {
      return res.status(404).json({ message: "Carrito o producto no encontrado" });
    }
    res.json({ status: "success", message: "Producto eliminado del carrito", cart: updatedCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el producto del carrito" });
  }
});

// PUT: Actualizar carrito con un arreglo de productos
router.put("/:cid", async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;
  try {
    const updatedCart = await cartService.updateCart(cid, products);
    if (!updatedCart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }
    res.json({ status: "success", payload: updatedCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el carrito" });
  }
});

// PUT: Actualizar cantidad de un producto específico
router.put("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  try {
    const updatedCart = await cartService.updateProductQuantity(cid, pid, quantity);
    if (!updatedCart) {
      return res.status(404).json({ message: "Carrito o producto no encontrado" });
    }
    res.json({ status: "success", payload: updatedCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la cantidad del producto" });
  }
});

// DELETE: Eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const updatedCart = await cartService.clearCart(cid);
    if (!updatedCart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }
    res.json({ status: "success", message: "Carrito vaciado", cart: updatedCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al vaciar el carrito" });
  }
});

export default router;
