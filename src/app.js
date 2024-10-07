import express from 'express';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();
const PORT = 8080;

// Preparar la configuración del servidor para recibir objetos JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de las rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
