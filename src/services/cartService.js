// cartService.js

import Cart from '../models/Cart.js'; // Importamos el modelo Cart
import Product from './ProductManager.js'; // Asegúrate de tener el modelo Product
import mongoose from 'mongoose';

// Almacenamiento de carritos en memoria (esto podría ser en una base de datos)
let carts = [];

// Función para crear un carrito (en base de datos o en memoria)
const createCart = async (products = []) => {
  try {
    const newCart = new Cart({ products: products || [] });
    await newCart.save(); // Guardamos el carrito en la base de datos
    carts.push(newCart); // También lo guardamos en memoria
    return newCart;
  } catch (error) {
    throw new Error("Error al crear el carrito: " + error.message);
  }
};

// Función para obtener un carrito por ID (desde memoria o base de datos)
const getCartById = async (cartId) => {
  try {
    const cart = await Cart.findById(cartId).populate('products.product');
    return cart || carts.find(cart => cart.id === cartId); // Buscamos en la memoria si no está en la base de datos
  } catch (error) {
    throw new Error("Error al obtener el carrito: " + error.message);
  }
};

// Función para agregar un producto al carrito
const addProductToCart = async (cartId, productItem) => {
  try {
    if (!productItem.product || !mongoose.Types.ObjectId.isValid(productItem.product)) {
      throw new Error("El ID del producto no es válido.");
    }

    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const product = await Product.findById(productItem.product);
    if (!product) throw new Error("Producto no encontrado.");

    const existingProduct = cart.products.find(
      (item) => item.product.toString() === productItem.product.toString()
    );

    if (existingProduct) {
      existingProduct.quantity += productItem.quantity;
    } else {
      cart.products.push(productItem);
    }

    // Calcular el total
    cart.totalPrice = cart.products.reduce((total, productItem) => {
      const price = parseFloat(productItem.product.price);
      if (isNaN(price)) {
        console.error("Precio inválido para el producto:", productItem.product.title);
        return total;
      }
      return total + (price * productItem.quantity);
    }, 0);

    await cart.save();
    return cart;
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    throw new Error("Error al agregar producto al carrito");
  }
};

// Función para eliminar un producto del carrito
const removeProductFromCart = async (cartId, productId) => {
  try {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    cart.products = cart.products.filter(
      (item) => item.product._id.toString() !== productId.toString()
    );

    // Calcular el nuevo total
    cart.totalPrice = cart.products.reduce((total, productItem) => {
      const price = parseFloat(productItem.product.price);
      if (isNaN(price)) {
        console.error("Precio inválido para el producto:", productItem.product.title);
        return total;
      }
      return total + (price * productItem.quantity);
    }, 0);

    await cart.save();
    return cart;
  } catch (error) {
    console.error("Error al eliminar producto del carrito:", error);
    throw new Error("Error al eliminar producto del carrito");
  }
};

// Función para vaciar todos los productos del carrito
const clearCartProducts = async (cartId) => {
  try {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();
    return cart;
  } catch (error) {
    console.error("Error al vaciar el carrito:", error);
    throw new Error("Error al vaciar el carrito");
  }
};

// Función para eliminar un carrito completo por su ID
const deleteCart = async (cartId) => {
  try {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");

    await Cart.findByIdAndDelete(cartId);
    console.log("Carrito eliminado completamente");

    // También eliminamos el carrito de la memoria
    carts = carts.filter(cart => cart.id !== cartId);
    return { message: "Carrito eliminado exitosamente" };
  } catch (error) {
    console.error("Error al eliminar carrito:", error);
    throw error;
  }
};

// Exportar todas las funciones
export default {
  createCart,
  getCartById,
  addProductToCart,
  removeProductFromCart,
  clearCartProducts,
  deleteCart
};
