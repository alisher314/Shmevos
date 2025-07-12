// script.js

// Initialize Telegram WebApp
// Check if the Telegram.WebApp object is available
if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    // Show the "Send order to Telegram" button only if the app is launched within Telegram
    document.getElementById('send-order-btn').style.display = 'block';
} else {
    console.warn('Telegram WebApp API is not available. The application may not function fully.');
    // Optionally hide the button or show a message to the user
}

// Define the initial product data (fallback if localStorage is empty)
const defaultProductsData = [
    { id: '1', name: 'Пицца-Шмицца', price: 98000, img: 'https://img.freepik.com/free-photo/delicious-pizza-studio_23-2151846547.jpg?semt=ais_hybrid&w=740' },
    { id: '2', name: 'Бургер-Шмургер', price: 58000, img: 'https://img.freepik.com/free-photo/delicious-burger-studio_23-2151846495.jpg?semt=ais_hybrid&w=740' },
    { id: '3', name: 'Салат-Малат', price: 19000, img: 'https://st.focusedcollection.com/11312302/i/650/focused_490211394-stock-photo-salad-fresh-vegetables-arugula-black.jpg' },
    { id: '4', name: 'Картошка-Шмартошка', price: 18000, img: 'https://img.freepik.com/premium-photo/pile-french-fries-black-background_135427-8020.jpg' },
    { id: '5', name: 'Кока-Шмола 0,5 литра', price: 9000, img: 'https://kartofan.ua/wp-content/uploads/2020/01/1-4-700x470.jpg' },
    { id: '6', name: 'Лаваш-Шмаваш', price: 49000, img: 'https://abrakadabra.fun/uploads/posts/2022-01/1641155555_4-abrakadabra-fun-p-shaurma-na-temnom-fone-5.jpg' },
    { id: '7', name: 'Сет "Суши-Муши"', price: 165000, img: 'https://thumbs.dreamstime.com/b/%D0%B2%D0%BA%D1%83%D1%81%D0%BD%D1%8B%D0%B5-%D1%80%D0%BE%D0%BB%D0%BB%D1%8B-%D0%B8-%D1%81%D1%83%D1%88%D0%B8-%D0%B8%D0%BD%D0%B3%D1%80%D0%B5%D0%B4%D0%B8%D0%B5%D0%BD%D1%82%D1%8B-%D0%BD%D0%B0-%D1%87%D0%B5%D1%80%D0%BD%D0%BE%D0%BC-%D1%84%D0%BE%D0%BD%D0%B5-%D1%87%D1%91%D1%80%D0%BD%D0%BE%D0%BC-174410898.jpg' },
    { id: '8', name: 'Хотдог-Шмотдог', price: 25000, img: 'https://gagaru.club/uploads/posts/2023-02/1676671788_gagaru-club-p-khot-dog-solnechnii-instagram-87.jpg' }
];

// Function to save products data to localStorage
function saveProductsToLocalStorage(products) {
    localStorage.setItem('productsData', JSON.stringify(products));
}

// Function to get products data from localStorage
function getProductsFromLocalStorage() {
    const storedData = localStorage.getItem('productsData');
    return storedData ? JSON.parse(storedData) : defaultProductsData;
}

// Function to format numbers with spaces
function formatNumberWithSpaces(number) {
    if (typeof number !== 'number') return number;
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Function to format time as HH:MM
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}


// Get DOM elements
const mainOrderView = document.getElementById('main-order-view');
const manageProductsView = document.getElementById('manage-products-view');
const manageProductsBtn = document.getElementById('manage-products-btn');
const backToOrderBtn = document.getElementById('back-to-order-btn');
const productsList = document.getElementById('products-list');
const searchInput = document.getElementById('search-input');
const cartItemsList = document.getElementById('cart-items');
const cartPlaceholder = document.querySelector('.cart-placeholder');
const totalPriceElement = document.getElementById('total-price');
const excelFileInput = document.getElementById('excel-file-input');
const loadExcelBtn = document.getElementById('load-excel-btn');
const uploadStatus = document.getElementById('upload-status');
const manageProductsTable = document.getElementById('manage-products-list');
const addProductNameInput = document.getElementById('add-product-name');
const addProductPriceInput = document.getElementById('add-product-price');
const addProductBtn = document.getElementById('add-product-manual-btn');
const addProductStatus = document.getElementById('add-product-status');
const placeOrderBtn = document.getElementById('place-order-button');
const receiptOutput = document.getElementById('receipt-output');
const sendOrderBtn = document.getElementById('send-order-btn');
const calculatorKeyboard = document.getElementById('calculator-keyboard');
const calculatorDisplay = document.getElementById('calculator-display');

// Global variables
let productsData = getProductsFromLocalStorage();
let cart = {}; // { productId: { name: '...', price: '...', quantity: '...' } }
let activeInput = null; // To track which input is being edited


// Function to save cart to local storage
function saveCartToLocalStorage() {
    localStorage.setItem('cartData', JSON.stringify(cart));
}

// Function to load cart from local storage
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('cartData');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}

// Function to render products
function renderProducts(products) {
    productsList.innerHTML = ''; // Clear current products
    if (products.length === 0) {
        productsList.innerHTML = '<p style="text-align: center;">Товары не найдены.</p>';
        return;
    }
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <img src="${product.img || 'https://cdn-icons-png.flaticon.com/512/857/857681.png'}" alt="${product.name}">
            <span>${product.name}</span>
            <span>${formatNumberWithSpaces(product.price)} сум</span>
            <button class="add-to-cart" data-id="${product.id}">Добавить</button>
        `;
        productsList.appendChild(productItem);
    });

    // Add event listeners to "add to cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const productToAdd = productsData.find(p => p.id === productId);
            if (productToAdd) {
                addToCart(productToAdd);
            }
        });
    });
}

// Function to filter products based on search input
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredProducts = productsData.filter(product =>
        product.name.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
}

// Function to add a product to the cart
function addToCart(product) {
    if (cart[product.id]) {
        cart[product.id].quantity++;
    } else {
        cart[product.id] = {
            name: product.name,
            price: product.price,
            quantity: 1
        };
    }
    saveCartToLocalStorage();
    updateCartDisplay();
}

// Function to update the cart display
function updateCartDisplay() {
    cartItemsList.innerHTML = '';
    const productIds = Object.keys(cart);
    if (productIds.length === 0) {
        cartItemsList.innerHTML = '<li class="cart-placeholder">Ваша корзина пуста</li>';
        totalPriceElement.textContent = `0 сум`;
        return;
    }

    let total = 0;
    productIds.forEach(productId => {
        const item = cart[productId];
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('li');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-details">
                <span>${item.name}</span>
            </div>
            <div class="item-inputs">
                <label>Кол-во:</label>
                <div class="quantity-controls">
                    <button class="quantity-btn" data-id="${productId}" data-action="decrease">-</button>
                    <span class="item-quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" data-id="${productId}" data-action="increase">+</button>
                </div>
                <label>Цена:</label>
                <span class="item-price-display" data-id="${productId}">${formatNumberWithSpaces(Math.round(item.price))}</span>
                <button class="remove-item" data-id="${productId}">Удалить</button>
            </div>
        `;
        cartItemsList.appendChild(cartItem);
    });

    totalPriceElement.textContent = `${formatNumberWithSpaces(Math.round(total))} сум`;
    saveCartToLocalStorage();

    // Attach event listeners for the updated cart items
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const action = e.target.dataset.action;
            if (action === 'increase') {
                cart[productId].quantity++;
            } else if (action === 'decrease') {
                cart[productId].quantity--;
                if (cart[productId].quantity <= 0) {
                    delete cart[productId];
                }
            }
            updateCartDisplay();
        });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            delete cart[productId];
            updateCartDisplay();
        });
    });

    document.querySelectorAll('.item-price-display').forEach(span => {
        span.addEventListener('click', (e) => {
            activeInput = e.target.dataset.id;
            calculatorDisplay.textContent = Math.round(cart[activeInput].price);
            calculatorKeyboard.classList.remove('hidden');
        });
    });
}

// Function to render products in management view
function renderManageProducts() {
    manageProductsTable.innerHTML = '';
    productsData.forEach(product => {
        const row = document.createElement('li');
        row.className = 'manage-product-item';
        row.innerHTML = `
            <span>${product.name}</span>
            <span>${formatNumberWithSpaces(product.price)} сум</span>
            <button class="delete-product-btn" data-id="${product.id}">Удалить</button>
        `;
        manageProductsTable.appendChild(row);
    });

    document.querySelectorAll('.delete-product-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            deleteProduct(productId);
        });
    });
}

// Function to delete a product
function deleteProduct(productId) {
    productsData = productsData.filter(p => p.id !== productId);
    saveProductsToLocalStorage(productsData);
    renderManageProducts();
    renderProducts(productsData); // Also update the main view
}

// Function to add a product manually
function addProductManually() {
    const name = addProductNameInput.value.trim();
    const price = parseFloat(addProductPriceInput.value);

    if (!name || isNaN(price)) {
        addProductStatus.textContent = 'Ошибка: Пожалуйста, введите корректные название и цену.';
        addProductStatus.style.color = '#dc3545';
        return;
    }

    const newId = (Math.max(...productsData.map(p => parseInt(p.id))) + 1).toString();
    const newProduct = {
        id: newId,
        name: name,
        price: Math.round(price),
        img: 'https://cdn-icons-png.flaticon.com/512/857/857681.png'
    };

    productsData.push(newProduct);
    saveProductsToLocalStorage(productsData);
    renderManageProducts();
    renderProducts(productsData);

    addProductNameInput.value = '';
    addProductPriceInput.value = '';
    addProductStatus.textContent = 'Товар успешно добавлен!';
    addProductStatus.style.color = '#28a745';
}

// Function to handle Excel file upload
function handleExcelFile(event) {
    const file = event.target.files[0];
    if (!file) {
        uploadStatus.textContent = 'Файл не выбран.';
        uploadStatus.style.color = '#dc3545';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length > 1) {
            // Assume the first row is headers, starting from the second row
            const newProducts = json.slice(1).map((row, index) => {
                // Ensure row has enough columns
                if (row.length >= 2) {
                    return {
                        id: (productsData.length + index + 1).toString(),
                        name: row[0],
                        price: Math.round(row[1]),
                        img: row[2] || 'https://cdn-icons-png.flaticon.com/512/857/857681.png' // Use default if no image URL
                    };
                }
                return null;
            }).filter(item => item !== null);

            productsData = [...productsData, ...newProducts];
            saveProductsToLocalStorage(productsData);
            renderManageProducts();
            renderProducts(productsData);

            uploadStatus.textContent = 'Данные из Excel успешно загружены!';
            uploadStatus.style.color = '#28a745';
        } else {
            uploadStatus.textContent = 'Ошибка: Пустой или некорректный файл Excel.';
            uploadStatus.style.color = '#dc3545';
        }
    };
    reader.readAsArrayBuffer(file);
}


// Function to send order data to Telegram
function sendOrderToTelegram() {
    let orderDetails = [];
    let totalAmount = 0;

    const now = new Date();
    // const orderTime = formatTime(now); // No longer needed in the message string
    const arrivalTime = new Date(now.getTime() + 30 * 60 * 1000); // Add 30 minutes in milliseconds
    const estimatedArrivalTime = formatTime(arrivalTime);

    for (const productId in cart) {
        const item = cart[productId];
        const itemPrice = Math.round(item.price);
        orderDetails.push(`${item.name}\n${item.quantity}шт * ${formatNumberWithSpaces(itemPrice)} = ${formatNumberWithSpaces(itemPrice * item.quantity)} сум`);
        totalAmount += itemPrice * item.quantity;
    }

    let message = "ЗАКАЗ ОФОРМЛЕН\n";
    message += `(примерное время прибытия доставки ${estimatedArrivalTime})\n\n`; // Simplified message
    message += "ВАШ ЗАКАЗ:\n\n";

    if (orderDetails.length === 0) {
        message += "Корзина пуста.\n";
    } else {
        message += orderDetails.join('\n\n');
        message += `\n\n===========================\n`;
        message += `Общая сумма = ${formatNumberWithSpaces(Math.round(totalAmount))} сум\n\n`;
    }

    message += "Спасибо что выбираете Shmevos";

    // Send data back to Telegram
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(message);
        // Также можно очистить корзину после отправки
        cart = {};
        updateCartDisplay();
        receiptOutput.classList.add('hidden');
    } else {
        console.log("Simulating sending order to Telegram:");
        console.log(message);
        // Using a custom modal/message box instead of alert()
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            text-align: center;
            max-width: 90%;
            font-family: Arial, sans-serif;
            color: #333;
        `;
        messageBox.innerHTML = `
            <h3>Заказ сформирован (для Telegram):</h3>
            <p style="white-space: pre-wrap; text-align: left;">${message}</p>
            <button style="
                background-color: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 15px;
            " onclick="this.parentNode.remove()">Закрыть</button>
        `;
        document.body.appendChild(messageBox);
        // Очищаем корзину и обновляем отображение
        cart = {};
        updateCartDisplay();
        receiptOutput.classList.add('hidden');
    }
}

// Function to copy receipt text to clipboard
function copyReceiptToClipboard() {
    const textToCopy = receiptOutput.innerText.trim(); // Use innerText to get formatted text
    if (!textToCopy) {
        alert('Чек пуст.');
        return;
    }

    // Modern way to copy to clipboard
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Чек скопирован в буфер обмена!');
    }).catch(err => {
        console.error('Не удалось скопировать текст: ', err);
        // Fallback for older browsers
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        try {
            document.execCommand('copy');
            alert('Чек скопирован в буфер обмена!');
        } catch (err) {
            console.error('Fallback: Не удалось скопировать текст', err);
            const messageBox = document.createElement('div');
            messageBox.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                z-index: 1000;
                text-align: center;
                max-width: 90%;
                font-family: Arial, sans-serif;
                color: #333;
            `;
            messageBox.innerHTML = `
                <h3>Ошибка копирования</h3>
                <p>Не удалось скопировать текст автоматически. Пожалуйста, выделите текст в чеке и скопируйте вручную.</p>
                <button style="
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 15px;
                " onclick="this.parentNode.remove()">Закрыть</button>
            `;
            document.body.appendChild(messageBox);
        } finally {
            // Remove the temporary textarea
            document.body.removeChild(tempTextArea);
        }
    });
}


// Event listeners
searchInput.addEventListener('input', filterProducts);

manageProductsBtn.addEventListener('click', () => {
    mainOrderView.classList.remove('active');
    manageProductsView.classList.add('active');
    renderManageProducts();
});

backToOrderBtn.addEventListener('click', () => {
    manageProductsView.classList.remove('active');
    mainOrderView.classList.add('active');
    renderProducts(productsData);
});

loadExcelBtn.addEventListener('click', () => {
    excelFileInput.click();
});

excelFileInput.addEventListener('change', handleExcelFile);

addProductBtn.addEventListener('click', addProductManually);


placeOrderBtn.addEventListener('click', () => {
    let receiptContent = '';
    let totalAmount = 0;

    const now = new Date();
    // const orderTime = formatTime(now); // No longer needed in the message string
    const arrivalTime = new Date(now.getTime() + 30 * 60 * 1000); // Add 30 minutes in milliseconds
    const estimatedArrivalTime = formatTime(arrivalTime);

    if (Object.keys(cart).length === 0) {
        receiptContent = 'Ваша корзина пуста. Добавьте товары для оформления заказа.';
    } else {
        receiptContent += 'ЗАКАЗ ОФОРМЛЕН\n';
        receiptContent += `(примерное время прибытия доставки ${estimatedArrivalTime})\n\n`; // Simplified message
        receiptContent += 'ВАШ ЗАКАЗ:\n\n';

        for (const productId in cart) {
            const item = cart[productId];
            const itemPrice = Math.round(item.price);
            const itemTotal = itemPrice * item.quantity;
            totalAmount += itemTotal;

            receiptContent += `${item.name}\n`;
            receiptContent += `${item.quantity}шт * ${formatNumberWithSpaces(itemPrice)} = ${formatNumberWithSpaces(itemTotal)} сум\n\n`;
        }

        receiptContent += `===========================\n`;
        receiptContent += `Общая сумма = ${formatNumberWithSpaces(Math.round(totalAmount))} сум\n\n`;
        receiptContent += `Спасибо что выбираете Shmevos`;
    }

    // For display in HTML, replace \n with <br>
    receiptOutput.innerHTML = receiptContent.replace(/\n/g, '<br>');
    receiptOutput.classList.remove('hidden');

    // Add a copy button after the receipt is generated
    let copyButton = document.getElementById('copy-receipt-button');
    if (!copyButton) {
        copyButton = document.createElement('button');
        copyButton.id = 'copy-receipt-button';
        copyButton.className = 'secondary-button'; // Reusing secondary-button style
        copyButton.textContent = 'Скопировать заказ';
        copyButton.style.marginTop = '15px';
        receiptOutput.parentNode.insertBefore(copyButton, receiptOutput.nextSibling);
        copyButton.addEventListener('click', copyReceiptToClipboard);
    } else {
        copyButton.style.display = 'block';
    }
});

sendOrderBtn.addEventListener('click', sendOrderToTelegram);


// Calculator logic
document.querySelectorAll('.calc-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const value = e.target.dataset.value;
        if (!activeInput) return;

        let currentValue = calculatorDisplay.textContent;

        if (value === 'C') {
            currentValue = '0';
        } else if (value === 'Del') {
            currentValue = currentValue.slice(0, -1);
            if (currentValue === '') {
                currentValue = '0';
            }
        } else if (value === '.') {
            if (!currentValue.includes('.')) {
                currentValue += '.';
            }
        } else if (value === '+500') {
            const num = parseFloat(currentValue || '0') + 500;
            currentValue = num.toString();
        } else if (value === '-500') {
            const num = parseFloat(currentValue || '0') - 500;
            currentValue = num.toString();
        } else if (value === 'OK') {
            let newPrice = parseFloat(currentValue);
            if (!isNaN(newPrice)) {
                cart[activeInput].price = Math.round(newPrice);
            }
            updateCartDisplay();
            calculatorKeyboard.classList.add('hidden');
            activeInput = null;
            return;
        } else {
            if (currentValue === '0' && value !== '.') {
                currentValue = value;
            } else {
                currentValue += value;
            }
        }

        calculatorDisplay.textContent = currentValue;
    });
});


// Initialization on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromLocalStorage();
    renderProducts(productsData);
    updateCartDisplay();
});
