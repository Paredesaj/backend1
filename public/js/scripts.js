const socket = io(); // Conectar al servidor WebSocket

// Función para renderizar productos en la lista
const renderProducts = (products) => {
    const productList = document.querySelector('.products');
    productList.innerHTML = ''; // Limpiar la lista antes de renderizar

    products.forEach((product) => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.id = `product-${product._id}`; // Usar _id de MongoDB

        productDiv.innerHTML = `
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            <p>Precio: $${product.price}</p>
            <button class="add-to-cart" data-id="${product._id}">Agregar al carrito</button>
            <button class="delete-product" data-id="${product._id}">Eliminar</button>
        `;

        productList.appendChild(productDiv);
    });

    // Agregar eventos a los botones de agregar al carrito y eliminar productos
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async (event) => {
            const productId = event.target.getAttribute('data-id');
            socket.emit('add-to-cart', productId); // Emitir evento para agregar al carrito
        });
    });

    document.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', async (event) => {
            const productId = event.target.getAttribute('data-id');
            socket.emit('delete-product', productId); // Emitir evento para eliminar producto
        });
    });
};

// Escuchar el evento 'products' del servidor para recibir los productos
socket.on('products', (products) => {
    console.log('Productos actualizados:', products);
    renderProducts(products); // Renderizar los productos en la interfaz
});

// Escuchar el carrito actualizado desde el servidor
socket.on('cart', (cart) => {
    console.log('Carrito actualizado:', cart);
    updateCartUI(cart); // Actualizar la UI del carrito
});

// Función para actualizar el carrito en la UI
function updateCartUI(cart) {
    const cartContainer = document.getElementById('cart-container'); // El contenedor del carrito
    cartContainer.innerHTML = '<h2>Carrito de Compras</h2>'; // Limpiar el carrito

    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.innerHTML = `
            <p>${item.title} - ${item.quantity}</p>
            <button onclick="deleteProduct('${item.productId}')">Eliminar</button>
        `;
        cartContainer.appendChild(cartItemElement);
    });

    // Botón para vaciar el carrito
    const clearCartButton = document.createElement('button');
    clearCartButton.textContent = 'Vaciar Carrito';
    clearCartButton.addEventListener('click', clearCart);
    cartContainer.appendChild(clearCartButton); // Agregar el botón al carrito
}

// Función para manejar el formulario de agregar un nuevo producto
document.getElementById('addProductForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Evitar el envío del formulario por defecto
    
    const product = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value, // Se agregó descripción
        code: document.getElementById('code').value,
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value),
        category: document.getElementById('category').value,
        thumbnails: [document.getElementById('thumbnail').value],
        status: true,
    };

    console.log('Emitiendo nuevo producto:', product); // Log para depurar
    socket.emit('new-product', product); // Emitir el evento 'new-product' al servidor
    document.getElementById('addProductForm').reset(); // Limpiar el formulario
});

// Función para agregar un producto al carrito usando WebSocket
function addToCart(productId) {
    socket.emit('add-to-cart', productId); // Emitir evento para agregar al carrito
}

// Función para eliminar un producto usando WebSocket
function deleteProduct(productId) {
    socket.emit('delete-product', productId); // Emitir evento para eliminar producto
}

// Función para vaciar el carrito
function clearCart() {
    socket.emit('clear-cart'); // Emitir evento para vaciar el carrito
}

// Manejar errores
socket.on('error', (message) => {
    alert(message); // Mostrar un mensaje de error al usuario
});
