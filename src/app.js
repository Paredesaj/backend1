import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import expressHandlebars from 'express-handlebars';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Ajusta la ruta para el archivo JSON dentro de la carpeta 'data'
const dataPath = path.join(process.cwd(), 'data', 'productos.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Configura el motor de plantillas Handlebars
app.engine('handlebars', expressHandlebars.engine());
app.set('view engine', 'handlebars');

// Ajusta la ruta para la carpeta de vistas dentro de 'src/views'
app.set('views', path.join(process.cwd(), 'src', 'views'));

// Cargar productos desde el archivo JSON
const loadProductsFromFile = () => {
  try {
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al cargar productos:', error);
    return [];
  }
};

// Guardar productos en el archivo JSON
const saveProductsToFile = (products) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Error al guardar productos:', error);
  }
};

// Ruta para mostrar productos en la vista 'home.handlebars'
app.get('/', (req, res) => {
  const products = loadProductsFromFile();
  res.render('home', { products });
});

// Ruta para mostrar la vista de productos en tiempo real
app.get('/realTimeProducts', (req, res) => {
  res.render('realTimeProducts');
});

// WebSocket para manejar la creación y eliminación de productos
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Emitir productos al conectar
  socket.emit('products', loadProductsFromFile());

  // Manejar la creación de productos
  socket.on('new-product', (product) => {
    console.log('Producto recibido en el servidor:', product); // Añadir este log
    const products = loadProductsFromFile();
    products.push(product); // Agregar el nuevo producto
    saveProductsToFile(products); // Guardar los productos actualizados en el JSON
    io.emit('products', products); // Emitir productos actualizados a todos los clientes
  });

  // Manejar la eliminación de productos
  socket.on('delete-product', (productId) => {
    let products = loadProductsFromFile();
    products = products.filter((product) => product.id !== productId);
    saveProductsToFile(products);
    io.emit('products', products); // Emitir productos actualizados a todos los clientes
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Iniciar el servidor
const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
