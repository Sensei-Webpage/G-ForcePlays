// ==================================================
// DOM ELEMENTS
// ==================================================

const cartItems =
    document.getElementById("cartItems");

const cartSubtotal =
    document.getElementById("cartSubtotal");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutBtn =
    document.getElementById("checkoutBtn");


// ==================================================
// LOAD CART
// ==================================================

let cart =
    JSON.parse(localStorage.getItem("cart")) || [];


// ==================================================
// DISPLAY CART
// ==================================================

function loadCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <h2>Your cart is empty.</h2>

                <a href="products.html">
                    Continue Shopping
                </a>

            </div>

        `;

        cartSubtotal.textContent = "₱0";

        cartTotal.textContent = "₱0";

        return;

    }

    let subtotal = 0;

    cart.forEach(function(product, index) {

        subtotal += product.price * product.quantity;

        const card =
            document.createElement("div");

        card.className = "cart-card";

        card.innerHTML = `

            <img
                src="${product.image_url}"
                class="cart-image"
            >

            <div class="cart-info">

                <h3>${product.name}</h3>

                <p>
                    ₱${product.price.toLocaleString()}
                </p>

            </div>

            <div class="cart-quantity">

                <button
                    onclick="decreaseQuantity(${index})"
                >
                    -
                </button>

                <span>
                    ${product.quantity}
                </span>

                <button
                    onclick="increaseQuantity(${index})"
                >
                    +
                </button>

            </div>

            <div class="cart-subtotal">

                ₱${(product.price * product.quantity).toLocaleString()}

            </div>

            <button
                class="removeBtn"
                onclick="removeItem(${index})"
            >
                Remove
            </button>

        `;

        cartItems.appendChild(card);

    });

    cartSubtotal.textContent =
        "₱" + subtotal.toLocaleString();

    cartTotal.textContent =
        "₱" + subtotal.toLocaleString();

}


// ==================================================
// SAVE CART
// ==================================================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    loadCart();

}


// ==================================================
// INCREASE QUANTITY
// ==================================================

function increaseQuantity(index) {

    cart[index].quantity++;

    saveCart();

}


// ==================================================
// DECREASE QUANTITY
// ==================================================

function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    }

    saveCart();

}


// ==================================================
// REMOVE ITEM
// ==================================================

function removeItem(index) {

    if (!confirm("Remove this product?")) {

        return;

    }

    cart.splice(index, 1);

    saveCart();

}


// ==================================================
// CHECKOUT
// ==================================================

if (checkoutBtn) {

    checkoutBtn.addEventListener("click", function() {

        if (cart.length === 0) {

            alert("Your cart is empty.");

            return;

        }

        window.location.href =
            "checkout.html";

    });

}


// ==================================================
// LOAD PAGE
// ==================================================

loadCart();