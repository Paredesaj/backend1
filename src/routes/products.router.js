import { Router } from "express";
import ProductManager from "../services/ProductManager.js";

const router = Router();

// Instancia de clase ProductManager
const productManager = new ProductManager();

// Endpoint configuration
// GET
router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

    const products = await productManager.getAllProducts(limit);

    res.json(products);
  } catch (error) {
    console.log(error);
  }
});

// GET:pid

router.get("/:pid", async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const product = await productManager.getProductById(productId);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    console.log(error);
  }
});

// POST
router.post("/", async (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnails } =
      req.body;

    if (!title || !description || !code || !price || !stock || !category) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    const product = await productManager.addProduct({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log(error);
  }
});

// PUT:pid

router.put("/:pid", async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const updateProduct = await productManager.updateProduct(
      productId,
      req.body
    );
    if (updateProduct) {
      res.json(updateProduct);
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    console.log(error);
  }
});

// DELETE:pid

router.delete("/:pid", async (req, res) => {
    try {
      const productId = parseInt(req.params.pid);
      const deleteProduct = productManager.deleteProduct(productId);
      if (deleteProduct) {
        res.json(deleteProduct);
      } else {
        res.status(404).json({ error: "Producto no encontrado" });
      }
    } catch (error) {
      console.log(error);
    }
  });

export default router;
