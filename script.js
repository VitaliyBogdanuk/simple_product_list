const products = [
    { id: 1, title: "Wireless Mouse", category: "Electronics", price: 499 },
    { id: 2, title: "USB-C Cable", category: "Electronics", price: 199 },
    { id: 3, title: "Notebook A5", category: "Stationery", price: 79 },
    { id: 4, title: "Gel Pen", category: "Stationery", price: 45 },
    { id: 5, title: "Water Bottle 1L", category: "Home", price: 259 },
    { id: 6, title: "Kitchen Towel", category: "Home", price: 99 },
    { id: 7, title: "T-shirt Basic", category: "Clothes", price: 349 },
    { id: 8, title: "Socks 3-pack", category: "Clothes", price: 129 }
];

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const categoryButtons = document.getElementById("categoryButtons");

const productsList = document.getElementById("productsList");

const cartList = document.getElementById("cartList");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const cartBadge = document.getElementById("cartBadge");
const clearCartBtn = document.getElementById("clearCartBtn");

let cart = {};
const CART_KEY = "productCatalogCart";

// Активна категорія для кнопок
let activeCategory = "all";

init();

function init() {
    renderCategoryButtons();
    loadCart();

    renderProducts();
    renderCart();

    searchInput.addEventListener("input", renderProducts);
    sortSelect.addEventListener("change", renderProducts);

    // Каталог
    productsList.addEventListener("click", function (e) {
        const btn = e.target.closest("button");
        if (!btn) return;

        if (btn.dataset.action === "add") {
            addToCart(Number(btn.dataset.id));
        }
    });

    // Кошик
    cartList.addEventListener("click", function (e) {
        const btn = e.target.closest("button");
        if (!btn) return;

        const id = Number(btn.dataset.id);
        const action = btn.dataset.action;

        if (action === "inc") changeQty(id, 1);
        if (action === "dec") changeQty(id, -1);
        if (action === "remove") removeFromCart(id);
    });

    clearCartBtn.addEventListener("click", clearCart);

    // Кнопки категорій
    categoryButtons.addEventListener("click", function (e) {
        const btn = e.target.closest("button");
        if (!btn) return;

        if (btn.dataset.action === "category") {
            activeCategory = btn.dataset.category;
            updateActiveCategoryButton();
            renderProducts();
        }
    });
}

function renderCategoryButtons() {
    const categories = getUniqueCategories();

    categoryButtons.innerHTML = "";

    // Перша кнопка: усі
    categoryButtons.appendChild(createCategoryButton("Усі", "all"));

    for (let i = 0; i < categories.length; i++) {
        categoryButtons.appendChild(createCategoryButton(categories[i], categories[i]));
    }

    updateActiveCategoryButton();
}

function createCategoryButton(label, value) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "catBtn";
    btn.textContent = label;
    btn.dataset.action = "category";
    btn.dataset.category = value;
    return btn;
}

function updateActiveCategoryButton() {
    const buttons = categoryButtons.querySelectorAll("button");
    for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        if (btn.dataset.category === activeCategory) btn.classList.add("active");
        else btn.classList.remove("active");
    }
}

function getUniqueCategories() {
    const categories = [];
    for (let i = 0; i < products.length; i++) {
        const c = products[i].category;
        if (!categories.includes(c)) categories.push(c);
    }
    return categories;
}

function getVisibleProducts() {
    const searchText = searchInput.value.trim().toLowerCase();
    const sortMode = sortSelect.value;

    const filtered = [];

    for (let i = 0; i < products.length; i++) {
        const p = products[i];

        const matchesSearch = searchText === "" || p.title.toLowerCase().includes(searchText);
        const matchesCategory = activeCategory === "all" || p.category === activeCategory;

        if (matchesSearch && matchesCategory) filtered.push(p);
    }

    if (sortMode === "priceAsc") {
        filtered.sort(function (a, b) {
            return a.price - b.price;
        });
    }

    if (sortMode === "priceDesc") {
        filtered.sort(function (a, b) {
            return b.price - a.price;
        });
    }

    return filtered;
}

function renderProducts() {
    const list = getVisibleProducts();
    productsList.innerHTML = "";

    if (list.length === 0) {
        const div = document.createElement("div");
        div.className = "empty";
        div.textContent = "Нічого не знайдено.";
        productsList.appendChild(div);
        return;
    }

    for (let i = 0; i < list.length; i++) {
        const p = list[i];

        const card = document.createElement("div");
        card.className = "card";

        const title = document.createElement("div");
        title.className = "cardTitle";
        title.textContent = p.title;

        const meta = document.createElement("div");
        meta.className = "cardMeta";

        const cat = document.createElement("span");
        cat.textContent = p.category;

        const price = document.createElement("span");
        price.className = "price";
        price.textContent = formatMoney(p.price);

        meta.appendChild(cat);
        meta.appendChild(price);

        const btn = document.createElement("button");
        btn.className = "btn";
        btn.type = "button";
        btn.textContent = "Додати в кошик";
        btn.dataset.action = "add";
        btn.dataset.id = String(p.id);

        card.appendChild(title);
        card.appendChild(meta);
        card.appendChild(btn);

        productsList.appendChild(card);
    }
}

function addToCart(productId) {
    const key = String(productId);

    if (cart[key]) cart[key] = cart[key] + 1;
    else cart[key] = 1;

    saveCart();
    renderCart();
}

function changeQty(productId, delta) {
    const key = String(productId);
    if (!cart[key]) return;

    cart[key] = cart[key] + delta;

    if (cart[key] <= 0) delete cart[key];

    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    const key = String(productId);
    if (!cart[key]) return;

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
        const div = document.createElement("div");
        div.className = "empty";
        div.textContent = "Кошик порожній.";
        cartList.appendChild(div);

        cartCount.textContent = "0";
        cartTotal.textContent = "0";
        cartBadge.textContent = "0";

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
        if (!product) continue;

        const lineSum = product.price * qty;

        totalCount = totalCount + qty;
        totalSum = totalSum + lineSum;

        const item = document.createElement("div");
        item.className = "cartItem";

        const top = document.createElement("div");
        top.className = "cartTop";

        const name = document.createElement("div");
        name.className = "cartName";
        name.textContent = product.title;

        const line = document.createElement("div");
        line.className = "cartLine";
        line.textContent = formatMoney(lineSum);

        top.appendChild(name);
        top.appendChild(line);

        const info = document.createElement("div");
        info.className = "cartLine";
        info.textContent = "Ціна: " + formatMoney(product.price);

        const actions = document.createElement("div");
        actions.className = "cartActions";

        const qtyRow = document.createElement("div");
        qtyRow.className = "qtyRow";

        const decBtn = document.createElement("button");
        decBtn.className = "btn secondary";
        decBtn.type = "button";
        decBtn.textContent = "-";
        decBtn.dataset.action = "dec";
        decBtn.dataset.id = String(id);

        const qtyBox = document.createElement("div");
        qtyBox.className = "qtyBox";
        qtyBox.textContent = String(qty);

        const incBtn = document.createElement("button");
        incBtn.className = "btn secondary";
        incBtn.type = "button";
        incBtn.textContent = "+";
        incBtn.dataset.action = "inc";
        incBtn.dataset.id = String(id);

        qtyRow.appendChild(decBtn);
        qtyRow.appendChild(qtyBox);
        qtyRow.appendChild(incBtn);

        const removeBtn = document.createElement("button");
        removeBtn.className = "btn danger";
        removeBtn.type = "button";
        removeBtn.textContent = "Видалити";
        removeBtn.dataset.action = "remove";
        removeBtn.dataset.id = String(id);

        actions.appendChild(qtyRow);
        actions.appendChild(removeBtn);

        item.appendChild(top);
        item.appendChild(info);
        item.appendChild(actions);

        cartList.appendChild(item);
    }

    cartCount.textContent = String(totalCount);
    cartTotal.textContent = formatMoney(totalSum);
    cartBadge.textContent = String(totalCount);
}

function findProductById(id) {
    for (let i = 0; i < products.length; i++) {
        if (products[i].id === id) return products[i];
    }
    return null;
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function loadCart() {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) {
        cart = {};
        return;
    }

    try {
        const data = JSON.parse(raw);
        if (data && typeof data === "object") cart = data;
        else cart = {};
    } catch (e) {
        cart = {};
    }
}

function formatMoney(value) {
    return String(value) + " грн";
}

