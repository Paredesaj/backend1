import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import expressHandlebars from 'express-handlebars';
import ProductManager from './services/ProductManager.js';  // Importar ProductManager
import Product from './models/Product.js';  // Asegúrate de tener el modelo Product
import Cart from './models/Cart.js';       // Asegúrate de tener el modelo Cart

// Configuración de Express y HTTP Server
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Crear una instancia de ProductManager
const productManager = new ProductManager();

// Conexión a la base de datos MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/proyectodb')
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err));

// Middleware
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));  // Asegúrate de servir archivos estáticos

// Configuración de Handlebars para las vistas
app.engine('handlebars', expressHandlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(process.cwd(), 'src', 'views'));

// Rutas
app.get('/', async (req, res) => {
  try {
    const products = await productManager.getAllProducts();  // Usamos ProductManager para obtener productos
    res.render('home', { products });
  } catch (error) {
    console.error('Error al cargar productos:', error);
    res.status(500).send('Error al cargar productos');
  }
});

app.get('/realTimeProducts', (req, res) => {
  res.render('realTimeProducts');
});

// WebSocket para manejar la creación, eliminación de productos y agregar al carrito
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Emitir productos desde MongoDB o archivo JSON al conectar
  productManager.getAllProducts().then((products) => socket.emit('products', products))
    .catch((error) => console.error('Error al cargar productos:', error));

  // Escuchar para agregar un nuevo producto
  socket.on('new-product', async (productData) => {
    try {
      const newProduct = await productManager.addProduct(productData); // Usamos ProductManager
      io.emit('products', await productManager.getAllProducts());
    } catch (error) {
      console.error('Error al agregar producto:', error);
      socket.emit('error', 'Error al agregar producto');
    }
  });

  // Escuchar para eliminar un producto
  socket.on('delete-product', async (productId) => {
    try {
      // Verifica si el producto existe antes de eliminarlo
      const product = await Product.findById(productId);
      if (!product) {
        console.error("Producto no encontrado");
        return socket.emit('error', 'Producto no encontrado');
      }

      // Eliminar el producto de la base de datos
      await Product.findByIdAndDelete(productId);
      console.log(`Producto eliminado: ${product.title}`);
      
      // Emitir los productos actualizados
      io.emit('products', await productManager.getAllProducts());
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      socket.emit('error', 'Error al eliminar producto');
    }
  });

  // Escuchar para agregar un producto al carrito
  socket.on('add-to-cart', async (productId) => {
    console.log('ID del producto recibido:', productId);  // Verifica el ID recibido
  
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error("El ID del producto no es válido:", productId);
      return socket.emit('error', 'ID de producto inválido');
    }
  
    try {
      const product = await Product.findById(productId);
      if (!product) {
        console.error("Producto no encontrado");
        return socket.emit('error', 'Producto no encontrado');
      }
  
      // Verificar si el stock es suficiente
      if (product.stock <= 0) {
        return socket.emit('error', 'Producto sin stock disponible');
      }
  
      // Verificar si el carrito ya existe, sino crear uno nuevo
      let cart = await Cart.findOne();
      if (!cart) {
        cart = new Cart();
        await cart.save(); // Si no existe, lo guardamos
      }

      // Verificar si el producto ya está en el carrito
      const productInCart = cart.products.find(item => {
        // Asegúrate de que item.product esté definido antes de llamar a toString()
        if (!item.product) {
          console.error("Producto sin referencia en el carrito");
          return false;  // Si item.product es undefined, no hacemos la comparación
        }
        return item.product.toString() === productId.toString();
      });

      if (productInCart) {
        // Si el producto ya está en el carrito, solo incrementar la cantidad
        if (productInCart.quantity < product.stock) {
          productInCart.quantity += 1;
        } else {
          return socket.emit('error', 'No hay suficiente stock para agregar más unidades');
        }
      } else {
        // Si el producto no está en el carrito, agregarlo con cantidad 1
        cart.products.push({ product: productId, quantity: 1 });
      }

      // Recalcular el precio total
      cart.totalPrice = cart.products.reduce((total, productItem) => {
        // Verificar si el producto tiene la referencia completa
        if (!productItem.product || !productItem.product.price) {
          console.error("Producto sin referencia completa:", productItem);
          return total; // Si el producto no está completo, omitirlo
        }
      
        const price = parseFloat(productItem.product.price);
        if (isNaN(price)) {
          console.error("Precio inválido para el producto:", productItem.product);
          return total; // Si el precio no es válido, omitirlo
        }
      
        // Sumar el precio del producto multiplicado por la cantidad
        return total + (price * productItem.quantity);
      }, 0);

      await cart.save();  // Guardar los cambios en el carrito
      console.log('Producto agregado al carrito');
      socket.emit('success', 'Producto agregado al carrito');
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      socket.emit('error', 'Error al agregar al carrito');
    }
  });
});

// Iniciar el servidor en el puerto 8080
httpServer.listen(8080, () => {
  console.log('Servidor funcionando en puerto 8080');
});
