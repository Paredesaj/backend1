import fs from 'fs/promises';
import path from 'path';
import Product from '../models/Product.js';  // Modelo de MongoDB

// Ruta del archivo JSON donde se guardarán los productos
const productosFilesPath = path.resolve('data', 'productos.json');

export default class ProductManager {
  constructor() {
    this.products = [];
    this.init(); // Inicializa el objeto con los productos, ya sea desde MongoDB o el archivo JSON
  }

  // Inicialización con MongoDB o archivo JSON
  async init() {
    try {
      const data = await fs.readFile(productosFilesPath, 'utf-8');
      this.products = JSON.parse(data); // Si existen productos en el archivo, los carga
    } catch (error) {
      this.products = []; // Si no existen productos en el archivo, inicializa el array vacío
    }
  }

  // Guardar productos en el archivo JSON
  async saveToFile() {
    await fs.writeFile(productosFilesPath, JSON.stringify(this.products, null, 2)); // Guarda los productos en el archivo
  }

  // Obtener todos los productos (limitados o no)
  async getAllProducts(limit) {
    if (this.products.length > 0) {
      return limit ? this.products.slice(0, limit) : this.products;  // Si los productos existen en el archivo JSON, los devuelve
    } else {
      return await Product.find().limit(limit);  // Si no, los obtiene desde MongoDB
    }
  }

  // Obtener producto por ID (desde JSON o MongoDB)
  async getProductById(id) {
    const product = this.products.find(product => product.id === id);
    if (!product) {
      return await Product.findById(id); // Si no lo encuentra en el archivo JSON, lo busca en MongoDB
    }
    return product;
  }

  // Agregar un producto (en MongoDB o archivo JSON)
  async addProduct(productData) {
    if (this.products.length > 0) {
      // Si ya existen productos en el archivo JSON, los agrega a ese archivo
      const newProduct = {
        id: this.products.length ? this.products[this.products.length - 1].id + 1 : 1, // Genera un ID basado en el último ID
        ...productData,
        status: true,
      };
      this.products.push(newProduct); // Agrega el producto al array de productos
      await this.saveToFile(); // Guarda el archivo JSON actualizado
      return newProduct;  // Devuelve el producto agregado
    } else {
      // Si no existen productos en el archivo JSON, guarda el producto en MongoDB
      const newProduct = new Product(productData); // Crea un nuevo producto
      await newProduct.save(); // Guarda el producto en MongoDB
      return newProduct;
    }
  }

  // Actualizar un producto (en MongoDB o archivo JSON)
  async updateProduct(id, updateFields) {
    const productIndex = this.products.findIndex(product => product.id === id);
    if (productIndex === -1) return null;  // Si no se encuentra el producto, retorna null

    const updatedProduct = { ...this.products[productIndex], ...updateFields, id: this.products[productIndex].id };
    this.products[productIndex] = updatedProduct;  // Actualiza el producto en el array
    await this.saveToFile();  // Guarda el archivo JSON actualizado
    return updatedProduct;  // Devuelve el producto actualizado
  }

  // Eliminar un producto (en MongoDB o archivo JSON)
  async deleteProduct(id) {
    const productIndex = this.products.findIndex(product => product.id === id);
    if (productIndex === -1) return null;  // Si no se encuentra el producto, retorna null

    const deletedProduct = this.products.splice(productIndex, 1);  // Elimina el producto del array
    await this.saveToFile();  // Guarda el archivo JSON actualizado

    await Product.findByIdAndDelete(id); // Elimina el producto también de MongoDB

    return deletedProduct[0];  // Devuelve el producto eliminado
  }
}
