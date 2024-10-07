import { Router } from "express";
import cartService from "../services/cartService.js";

const router = Router();

// Ruta POST /api/carts/ - Crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const { products } = req.body;

    // Crear un nuevo carrito con los productos (puede ser un array vacío)
    const newCart = await cartService.createCart(products || []);

    res.status(201).json({ message: "Carrito creado", cart: newCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

// Ruta GET /api/carts/:cid - Obtener productos de un carrito por su ID
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    // Obtener carrito por ID
    const cart = await cartService.getCartById(cid);

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    res.json(cart.products); // Devuelve los productos del carrito
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

// Ruta POST /api/carts/:cid/product/:pid - Agregar un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    // Agregar producto al carrito por su ID
    const updatedCart = await cartService.addProductToCart(cid, pid);

    if (!updatedCart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    res.json({ message: "Producto agregado al carrito", cart: updatedCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
});

export default router;
