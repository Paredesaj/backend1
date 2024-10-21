const socket = io();

// Función para renderizar productos en la lista
const renderProducts = (products) => {
    const productList = document.getElementById('productList');
    productList.innerHTML = ''; // Limpiar la lista antes de renderizar

    products.forEach((product) => {
        const li = document.createElement('li');
        li.textContent = `${product.title} - ${product.price}`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.onclick = () => {
            socket.emit('delete-product', product.id);
        };
        li.appendChild(deleteButton);
        productList.appendChild(li);
    });
};

// Escuchar el evento 'products' del servidor
socket.on('products', (products) => {
    console.log('Productos recibidos:', products);
    renderProducts(products);
});

// Manejar el envío del formulario para agregar productos
document.getElementById('addProductForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Evitar el envío del formulario
    
    const product = {
        id: Date.now(), // Usar un ID único
        title: document.getElementById('title').value,
        code: document.getElementById('code').value,
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value),
        category: document.getElementById('category').value,
        thumbnails: [document.getElementById('thumbnail').value],
        status: true,
    };

    console.log('Emitiendo nuevo producto:', product); // Añadir este log
    socket.emit('new-product', product); // Emitir el evento new-product
    document.getElementById('addProductForm').reset(); // Limpiar el formulario
});
