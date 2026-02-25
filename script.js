const products = [
    { id: 1, title: "Monitor", category: "Electronics", price: 499},
    { id: 2, title: "Mouse", category: "Electronics", price: 100},
    { id: 3, title: "Laptop", category: "Electronics", price: 999},
    { id: 4, title: "Water tank", category: "Home", price: 30},
    { id: 5, title: "Towel", category: "Home", price: 5},
    { id: 6, title: "Bicycle", category: "Sport", price: 1500},
    { id: 7, title: "Socks", category: "Clothes", price: 50}
];

const searchInput = document.getElementById('searchInput');
const categoryButtons = document.getElementById('categoryButtons');
const sortSelect = document.getElementById('sortSelect');
const productsList = document.getElementById('productsList');
const cartBadge = document.getElementById('cartBadge');
const cartList = document.getElementById('cartList');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');

let cart = {};
const CART_KEY = "productCatalogCart";
let activeCategory = "all";

init();

function init() {
    renderCategoryButtons();
    loadCart();

    renderProducts();
    renderCart();

    searchInput.addEventListener('input', renderProducts);
    sortSelect.addEventListener('change', renderProducts);

    productsList.addEventListener('click', function(e){
        const btn = e.target.closest('button');
        if(!btn) return;

        if(btn.dataset.action === 'add') {
            addTocart(Number(btn.dataset.id));
        }
    });

    cartList.addEventListener('click', function(e){
        const btn = e.target.closest('button');
        if(!btn) return;

        const id = Number(btn.dataset.id);
        const action = btn.dataset.action;

        if(action === 'inc') changeQty(id, 1);
        if(action === 'dec') changeQty(id, -1);
        if(action === 'remove') removeFromCart(id);
    });

    clearCartBtn.addEventListener('click', clearCart);

    categoryButtons.addEventListener('click', function(e){
        const btn = e.target.closest('button');
        if(!btn) return;

        if(btn.dataset.action === 'category') {
            activeCategory = btn.dataset.category;
            updateActiveCategoryButton();
            renderProducts();
        }
    });

}

function getUniqueCategories() {
    const categories = [];
    for (let index = 0; index < products.length; index++) {
        const category = products[index].category;
        if(!categories.includes(category)) categories.push(category);
    }
    return categories;
}

function renderCategoryButtons() {
    const categories = getUniqueCategories();
    categoryButtons.innerHTML = "";

    categoryButtons.appendChild(createCategoryButton("Усі", "all"));

    for (let index = 0; index < categories.length; index++) {
        categoryButtons.appendChild(createCategoryButton(categories[index], categories[index]));
    }

    updateActiveCategoryButton();
}

function createCategoryButton(label, value) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'catBtn';
    btn.textContent = label;
    btn.dataset.action = 'category';
    btn.dataset.category = value;

    return btn;
}

function updateActiveCategoryButton() {
    const buttons = categoryButtons.querySelectorAll('button');
    for (let index = 0; index < buttons.length; index++) {
        const button = buttons[index];
        if (button.dataset.category === activeCategory) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    }
}

function onCategoryClick(e) {
    const btn = e.target.closest('button');
    if(!btn) return;

    if (btn.dataset.action === "category") {
        activeCategory = btn.dataset.category;
        updateActiveCategoryButton();
        renderProducts();
    }
}

function getVisibleProducts() {
    const searchText = searchInput.value.trim().toLowerCase();
    const sortMode = sortSelect.value;

    const filtered = [];

    for (let index = 0; index < products.length; index++) {
        const product = products[index];
        
        const matchesSearch = searchText === "" || product.title.toLowerCase().includes(searchText);
        const matchesCategory = activeCategory === "all" || product.category === activeCategory;

        if (matchesSearch && matchesCategory) {
            filtered.push(product);
        }
    }

    if (sortMode === "priceAsc") {
        filtered.sort(function (a, b){
            return a.price - b.price;
        });
    }

    if (sortMode === "priceDesc") {
        filtered.sort(function (a, b){
            return b.price - a.price;
        });
    }

    return filtered;
}

function renderProducts() {
    const list = getVisibleProducts();

    productsList.innerHTML = '';

    if (list.length === 0) {
        const div = document.createElement('div');
        div.className = 'empty';
        div.textContent = 'Нічого не знайдено.';

        productsList.appendChild(div);
        return;
    }

    for (let index = 0; index < list.length; index++) {
        const p = list[index];

        const card = document.createElement('div');
        card.className = 'card';

        const title = document.createElement('div');
        title.className = 'cardTitle';
        title.textContent = p.title;

        const cat = document.createElement('div');
        cat.textContent = p.category;

        const meta = document.createElement('div');
        meta.className = 'cardMeta';

        const price = document.createElement('div');
        price.className = 'price';
        price.textContent = p.price;
        
        meta.appendChild(cat);
        meta.appendChild(price);

        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.type = 'button'
        btn.textContent = 'Додати в кошик';
        btn.dataset.action = 'add';
        btn.dataset.id = String(p.id);

        card.appendChild(title);
        card.appendChild(meta);
        card.appendChild(btn);

        productsList.appendChild(card);
    }
}

function onProductsClick(e) {
    const btn = e.target.closest('button');
    if(!btn) return;

    if (btn.dataset.action === "add") {
        addTocart(Number(btn.dataset.id));
    }
}

function addTocart(productId) {
    const key = String(productId);

    if (cart[key]) {
        cart[key] = cart[key] + 1;
    } else {
        cart[key] = 1
    }

    saveCart();
    renderCart();
}

function changeQty(productId, delta){
    const key = String(productId);
    if(!cart[key]) return;

    cart[key] = cart[key] + delta;
    if(cart[key] <= 0) delete cart[key];
    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    const key = String(productId);
    if(!cart[key]) return;

    delete cart[key];

    saveCart();
    renderCart();
}

function clearCart() {
    cart = {};
    saveCart();
    renderCart();
}

function renderCart() {
    cartList.innerHTML = "";

    const ids = Object.keys(cart);

    if (ids.length === 0) {
        const div = document.createElement('div');
        div.className = 'empty';
        div.textContent = 'Кошик порожній';
        cartList.appendChild(div);

        cartCount.textContent = '0';
        cartTotal.textContent = '0';
        cartBadge.textContent = '0';

        clearCartBtn.disabled = true;
        return;
    }

    clearCartBtn.disabled = false;

    let totalCount = 0;
    let totalSum = 0;

    for (let i = 0; i < ids.length; i++) {
        const id = Number(ids[i]);
        const qty = cart[String(id)];

        const product = findProductById(id);
        if(!product) continue;

        const lineSum = product.price * qty;

        totalCount = totalCount + qty;
        totalSum = totalSum + lineSum;

        const item = document.createElement('div');
        item.className = 'cartItem';

        const top = document.createElement('div');
        top.className = 'cartTop';

        const name = document.createElement('div');
        name.className = 'cartName';
        name.textContent = product.title;

        const line = document.createElement('div');
        line.className = 'cartLine';
        line.textContent = lineSum;

        top.appendChild(name);
        top.appendChild(line);

        const info = document.createElement('div');
        info.className = 'cartLine';
        info.textContent = 'Ціна: ' + product.price;

        const actions = document.createElement('div');
        actions.className = 'cartActions';

        const qtyRow = document.createElement('div');
        qtyRow.className = 'qtyRow';

        const decBtn = document.createElement('button');
        decBtn.className = 'btn secondary';
        decBtn.type = 'button';
        decBtn.textContent = '-';
        decBtn.dataset.action = 'dec';
        decBtn.dataset.id = String(id);

        const qtyBox = document.createElement('div');
        qtyBox.className = 'qtyBox';
        qtyBox.textContent = String(qty);

        const incBtn = document.createElement('button');
        incBtn.className = 'btn secondary';
        incBtn.type = 'button';
        incBtn.textContent = '+';
        incBtn.dataset.action = 'inc';
        incBtn.dataset.id = String(id);

        qtyRow.appendChild(decBtn);
        qtyRow.appendChild(qtyBox);
        qtyRow.appendChild(incBtn);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn danger';
        removeBtn.type = 'button';
        removeBtn.textContent = 'Видалити';
        removeBtn.dataset.action = 'remove';
        removeBtn.dataset.id = String(id);

        actions.appendChild(qtyRow);
        actions.appendChild(removeBtn);

        item.appendChild(top);
        item.appendChild(info);
        item.appendChild(actions);

        cartList.appendChild(item);
    }

    cartCount.textContent = String(totalCount);
    cartTotal.textContent = totalSum;
    cartBadge.textContent = String(totalCount);
}

function onCartClick(e){
    const btn = e.target.closest('button');

    if(!btn) return;

    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;

    if(action === 'inc') changeQty(id, 1);
    if(action === 'dec') changeQty(id, -1);
    if(action === 'remove') removeFromCart(id);
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function loadCart() {
    const raw = localStorage.getItem(CART_KEY);

    if(!raw) {
        cart = {};
        return;
    }

    try {
        const data = JSON.parse(raw);
        if(data && typeof data === 'object') cart = data;
        else cart = {};
    } catch (e) {
        cart = {};
    }
}

function findProductById(id) {
    for (let i = 0; i < products.length; i++) {
        if(products[i].id === id) return products[i];
    }

    return null;
}

