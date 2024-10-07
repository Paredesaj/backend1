import fs from 'fs/promises';
import path from 'path';

// Ruta al archivo donde se almacenan los carritos
const cartsFilePath = path.resolve('data', 'carts.json');

class CartService {
    constructor() {
        this.carts = [];
        this.lastCartId = 0;
        this.init();
    }

    // Método para inicializar y cargar los carritos desde el archivo
    async init() {
        try {
            const data = await fs.readFile(cartsFilePath, 'utf-8');
            this.carts = JSON.parse(data);

            // Actualizamos lastCartId para evitar duplicados
            if (this.carts.length > 0) {
                this.lastCartId = Math.max(...this.carts.map(cart => cart.id));
            }
        } catch (error) {
            this.carts = [];
        }
    }

    // Guardar los carritos en el archivo
    async saveToFile() {
        await fs.writeFile(cartsFilePath, JSON.stringify(this.carts, null, 2));
    }

    // Generar un ID único incremental
    generateCartId() {
        this.lastCartId += 1;
        return this.lastCartId;
    }

    // Crear un nuevo carrito
    async createCart(products = []) {
        const newCart = {
            id: this.generateCartId(),
            products: products || []
        };
        this.carts.push(newCart);
        await this.saveToFile();
        return newCart;
    }

    // Obtener un carrito por su ID
    getCartById(cid) {
        return this.carts.find(cart => cart.id === parseInt(cid));
    }

    // Agregar un producto al carrito
    async addProductToCart(cid, pid) {
        const cart = this.getCartById(cid);

        if (!cart) {
            return null;
        }

        const existingProduct = cart.products.find(p => p.product === pid);

        if (existingProduct) {
            // Si el producto ya existe, incrementa la cantidad
            existingProduct.quantity += 1;
        } else {
            // Si el producto no existe, se agrega con cantidad 1
            cart.products.push({
                product: pid,
                quantity: 1
            });
        }

        await this.saveToFile();
        return cart;
    }
}

export default new CartService();
