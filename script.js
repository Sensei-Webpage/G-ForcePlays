const SUPABASE_URL = "https://ijiiccptmcdtnxvrfusr.supabase.co";

const SUPABASE_KEY = "sb_publishable_hfYMoDBwJRIn-WCHzNZStw_77eZwZlI";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase client connected!");

// ==========================
// LOAD PRODUCTS FROM SUPABASE
// ==========================

// ==========================
// LOAD PRODUCTS FROM SUPABASE
// ==========================

async function loadProducts() {

    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Error loading products:", error);
        return;
    }

    console.log("Products loaded:", data);

console.log("Number of products:", data.length);

if (data.length === 0) {
    console.warn("No products were returned from Supabase.");
}

    const productContainer =
        document.getElementById("productContainer");

    productContainer.innerHTML = "";

    data.forEach(function(product) {

    const card =
    document.createElement("div");

card.className = "card";

card.dataset.category =
    product.category;

    card.innerHTML = `
    <img 
        src="${product.image_url}" 
        alt="${product.name}"
    >

    <h3>${product.name}</h3>

    <p>₱${Number(product.price).toLocaleString()}</p>

    <button 
        class="buyBtn"
        data-id="${product.id}"
    >
        Add to Cart
    </button>
`;

    productContainer.appendChild(card);

});

}

loadProducts();

// ==========================
// SHOPPING CART
// ==========================


// Stores products added to cart
let shoppingCart = [];

// Get HTML elements
let cart = document.getElementById("cartCount");
let cartItems = document.getElementById("cartItems");
let cartTotal = document.getElementById("cartTotal");
let checkoutBtn = document.getElementById("checkoutBtn");


// ==========================
// CART BUTTON
// ==========================

let cartBtn = document.getElementById("cartBtn");

let cartSection = document.getElementById("cartSection");

cartBtn.addEventListener("click", function() {

    cartSection.scrollIntoView({
        behavior: "smooth"
    });

});


// ==========================
// ADD PRODUCT TO CART
// ==========================

document.addEventListener("click", function(event) {

    // Check if Add to Cart was clicked
    if (event.target.classList.contains("buyBtn")) {

        // Get product ID
        let productId =
            event.target.dataset.id;

        // Find product card
        let card =
            event.target.parentElement;

        // Get product information
        let productName =
            card.querySelector("h3").innerHTML;

        let productPriceText =
            card.querySelector("p").innerHTML;

        // Remove peso sign and commas
        let productPrice =
            Number(
                productPriceText
                    .replace("₱", "")
                    .replace(/,/g, "")
            );

        // Check if product is already in cart
        let existingProduct =
            shoppingCart.find(function(product) {

                return product.id == productId;

            });


        // If product already exists
        if (existingProduct) {

            existingProduct.quantity++;

        }

        // If product is new
        else {

            shoppingCart.push({

                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1

            });

        }


        // Update cart
        displayCart();

    }

});


// ==========================
// DISPLAY CART
// ==========================

function displayCart() {

    // Calculate total quantity
    let totalQuantity = 0;

    shoppingCart.forEach(function(product) {

        totalQuantity += product.quantity;

    });


    // Update cart count
    cart.innerHTML = totalQuantity;


    // Check if cart is empty
    if (shoppingCart.length === 0) {

        cartItems.innerHTML =
            "<p>Your cart is empty.</p>";

        cartTotal.innerHTML = "0";

        return;

    }


    // Clear current cart
    cartItems.innerHTML = "";


    // Total price
    let totalPrice = 0;


    // Display each product
    shoppingCart.forEach(function(product, index) {

        // Calculate product total
        let productTotal =
            product.price * product.quantity;


        // Add product total to cart total
        totalPrice += productTotal;


        // Create cart item
        let item =
            document.createElement("div");

        item.className =
            "cart-item";


        item.innerHTML = `

            <h3>${product.name}</h3>

            <p>
                ₱${productTotal.toLocaleString()}
            </p>

            <div class="quantity-controls">

                <button
                    class="quantityBtn"
                    data-index="${index}"
                    data-action="decrease"
                >
                    −
                </button>

                <span>
                    ${product.quantity}
                </span>

                <button
                    class="quantityBtn"
                    data-index="${index}"
                    data-action="increase"
                >
                    +
                </button>

            </div>

            <button
                class="removeBtn"
                data-index="${index}"
            >
                Remove
            </button>

        `;


        // Add item to cart
        cartItems.appendChild(item);

    });


    // Display total
    cartTotal.innerHTML =
        totalPrice.toLocaleString();

}


// ==========================
// CART QUANTITY CONTROLS
// ==========================

document.addEventListener("click", function(event) {

    // Increase or decrease quantity
    if (event.target.classList.contains("quantityBtn")) {

        let index =
            Number(event.target.dataset.index);

        let action =
            event.target.dataset.action;


        // Increase quantity
        if (action === "increase") {

            shoppingCart[index].quantity++;

        }


        // Decrease quantity
        if (action === "decrease") {

            shoppingCart[index].quantity--;

            // Remove product if quantity becomes zero
            if (shoppingCart[index].quantity <= 0) {

                shoppingCart.splice(index, 1);

            }

        }


        // Refresh cart
        displayCart();

    }


    // ==========================
    // REMOVE PRODUCT
    // ==========================

    if (event.target.classList.contains("removeBtn")) {

        let index =
            Number(event.target.dataset.index);


        // Remove product
        shoppingCart.splice(index, 1);


        // Refresh cart
        displayCart();

    }

});


// ==========================
// INITIAL CART DISPLAY
// ==========================

displayCart();


// ==========================
// DARK MODE
// ==========================

let darkButton =
document.getElementById("darkModeBtn");

darkButton.addEventListener("click", function(){

    document.body.classList.toggle("dark");

});


// ==========================
// SMOOTH SCROLL
// ==========================

let shopButton =
document.getElementById("shopNowBtn");

let products =
document.getElementById("products");

shopButton.addEventListener("click", function(){

    products.scrollIntoView({

        behavior:"smooth"

    });

});


// ==========================
// SEARCH + CATEGORY FILTER
// ==========================

let searchBox =
    document.getElementById("searchBox");

let categoryButtons =
    document.querySelectorAll(".categoryBtn");


// Currently selected category
let selectedCategory = "All";


// ==========================
// FILTER PRODUCTS FUNCTION
// ==========================

function filterProducts() {

    // Get search text
    let search =
        searchBox.value
            .toLowerCase()
            .trim();


    // Get all product cards
    let cards =
        document.querySelectorAll(".card");


    // Check every product
    cards.forEach(function(card) {

        // Get product name
        let productName =
            card.querySelector("h3")
                .innerHTML
                .toLowerCase()
                .trim();


        // Get product category
        let productCategory =
            card.dataset.category
                .trim();


        // Check search match
        let matchesSearch =
            productName.includes(search);


        // Check category match
        let matchesCategory =
            selectedCategory === "All" ||
            productCategory === selectedCategory;


        // Show product only if BOTH match
        if (
            matchesSearch &&
            matchesCategory
        ) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

}


// ==========================
// SEARCH PRODUCTS
// ==========================

searchBox.addEventListener(
    "keyup",
    function() {

        filterProducts();

    }
);


// ==========================
// CATEGORY BUTTONS
// ==========================

categoryButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                // Update selected category
                selectedCategory =
                    button.dataset.category;


                // Remove active from all buttons
                categoryButtons.forEach(
                    function(btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                // Add active to clicked button
                button.classList.add(
                    "active"
                );


                // Apply filters
                filterProducts();

            }
        );

    }
);

// ==========================
// BANNER SLIDESHOW
// ==========================

let slides =
document.querySelectorAll(".slide");

let dots =
document.querySelectorAll(".dot");

let nextButton =
document.querySelector(".nextBtn");

let prevButton =
document.querySelector(".prevBtn");

let currentSlide = 0;


// SHOW SLIDE FUNCTION

function showSlide(index){

    // Remove active from all slides

    slides.forEach(function(slide){

        slide.classList.remove("active");

    });


    // Remove active from all dots

    dots.forEach(function(dot){

        dot.classList.remove("active");

    });


    // Add active to selected slide

    slides[index].classList.add("active");

    dots[index].classList.add("active");

}


// NEXT BUTTON

nextButton.addEventListener("click", function(){

    currentSlide++;

    if(currentSlide >= slides.length){

        currentSlide = 0;

    }

    showSlide(currentSlide);

});


// PREVIOUS BUTTON

prevButton.addEventListener("click", function(){

    currentSlide--;

    if(currentSlide < 0){

        currentSlide = slides.length - 1;

    }

    showSlide(currentSlide);

});


// DOT BUTTONS

dots.forEach(function(dot, index){

    dot.addEventListener("click", function(){

        currentSlide = index;

        showSlide(currentSlide);

    });

});


// AUTOMATIC SLIDESHOW

setInterval(function(){

    currentSlide++;

    if(currentSlide >= slides.length){

        currentSlide = 0;

    }

    showSlide(currentSlide);

}, 5000);

// ==========================
// CONTACT FORM
// ==========================

let contactForm =
    document.getElementById("contactForm");

let contactStatus =
    document.getElementById("contactStatus");


contactForm.addEventListener("submit", async function(event) {

    // Prevent page from refreshing
    event.preventDefault();

    // Get form values
    let name =
        document.getElementById("contactName").value;

    let email =
        document.getElementById("contactEmail").value;

    let message =
        document.getElementById("contactMessage").value;


    // Show sending message
    contactStatus.innerHTML =
        "Sending message...";


    // Send data to Supabase
    const { data, error } = await supabaseClient
        .from("contacts")
        .insert([
            {
                name: name,
                email: email,
                message: message
            }
        ]);


    // Check for errors
    if (error) {

        console.error(
            "Contact form error:",
            error
        );

        contactStatus.innerHTML =
            "Something went wrong. Please try again.";

        return;

    }


    // Success message
    contactStatus.innerHTML =
        "Message sent successfully!";


    // Clear the form
    contactForm.reset();

});

// ==========================
// CHECKOUT FORM DISPLAY
// ==========================

let checkoutFormContainer =
    document.getElementById("checkoutFormContainer");

checkoutBtn.addEventListener("click", function() {

    // Check if cart is empty
    if (shoppingCart.length === 0) {

        alert("Your cart is empty. Please add a product first.");

        return;

    }

    // Show checkout form
    checkoutFormContainer.style.display = "block";

    // Scroll to checkout form
    checkoutFormContainer.scrollIntoView({
        behavior: "smooth"
    });

});

// ==========================
// PLACE ORDER
// ==========================

let checkoutForm =
    document.getElementById("checkoutForm");

let checkoutStatus =
    document.getElementById("checkoutStatus");


checkoutForm.addEventListener("submit", async function(event) {

    // Prevent page refresh
    event.preventDefault();


    // Check if cart is empty
    if (shoppingCart.length === 0) {

        checkoutStatus.innerHTML =
            "Your cart is empty.";

        return;

    }


    // Get customer information
    let customerName =
        document.getElementById("customerName").value;

    let customerEmail =
        document.getElementById("customerEmail").value;

    let customerPhone =
        document.getElementById("customerPhone").value;

    let customerAddress =
        document.getElementById("customerAddress").value;


 // Calculate total
let totalAmount = 0;

shoppingCart.forEach(function(product) {

    totalAmount +=
        product.price * product.quantity;

});


    // Show processing message
    checkoutStatus.innerHTML =
        "Processing your order...";


    // ==========================
    // SAVE ORDER
    // ==========================

    const { data: order, error: orderError } =
        await supabaseClient
            .from("orders")
            .insert([
                {
                    customer_name: customerName,
                    customer_email: customerEmail,
                    customer_phone: customerPhone,
                    customer_address: customerAddress,
                    total_amount: totalAmount
                }
            ])
            .select()
            .single();


    // Check order error
    if (orderError) {

    console.error(
        "Order error:",
        orderError
    );

    checkoutStatus.innerHTML =
        "Order Error: " +
        orderError.message;

    return;

}


    // ==========================
    // SAVE ORDER ITEMS
    // ==========================

  let orderItems = shoppingCart.map(function(product) {

    return {
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        quantity: product.quantity,
        price: product.price
    };

});


    const { error: itemsError } =
        await supabaseClient
            .from("order_items")
            .insert(orderItems);


    // Check order items error
    if (itemsError) {

        console.error(
            "Order items error:",
            itemsError
        );

        checkoutStatus.innerHTML =
            "Order was created, but there was a problem saving the products.";

        return;

    }


    // ==========================
    // SUCCESS
    // ==========================

    checkoutStatus.innerHTML =
        "Order placed successfully! Thank you for your purchase.";


    // Clear cart
    shoppingCart = [];

    // Update cart display
    displayCart();

    // Reset checkout form
    checkoutForm.reset();

});