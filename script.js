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
    // loadCart();

    renderProducts();
    // renderCart();


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
