// ==================================================
// SUPABASE CONNECTION
// ==================================================

const SUPABASE_URL =
    "https://ijiiccptmcdtnxvrfusr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_hfYMoDBwJRIn-WCHzNZStw_77eZwZlI";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

console.log("Supabase client connected!");


// ==================================================
// SHOPPING CART
// ==================================================

let shoppingCart = [];


// ==================================================
// DELIVERY FEE
// ==================================================

const DELIVERY_FEE = 100;


// ==================================================
// DOM ELEMENTS
// ==================================================

const cart =
    document.getElementById("cartCount");

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutBtn =
    document.getElementById("checkoutBtn");

const cartBtn =
    document.getElementById("cartBtn");

const cartSection =
    document.getElementById("cartSection");

const checkoutFormContainer =
    document.getElementById("checkoutFormContainer");

const checkoutForm =
    document.getElementById("checkoutForm");

const checkoutStatus =
    document.getElementById("checkoutStatus");

const checkoutItems =
    document.getElementById("checkoutItems");

const checkoutProductTotal =
    document.getElementById("checkoutProductTotal");

const deliveryFeeElement =
    document.getElementById("deliveryFee");

const checkoutTotal =
    document.getElementById("checkoutTotal");

const placeOrderBtn =
    document.getElementById("placeOrderBtn");

const gcashPaymentSection =
    document.getElementById("gcashPaymentSection");

const bankPaymentSection =
    document.getElementById("bankPaymentSection");

const gcashReference =
    document.getElementById("gcashReference");

const paymentProof =
    document.getElementById("paymentProof");

const contactForm =
    document.getElementById("contactForm");

const contactStatus =
    document.getElementById("contactStatus");


// ==================================================
// ACCOUNT DOM ELEMENTS
// ==================================================

const loggedOutMenu =
    document.getElementById("loggedOutMenu");

const loggedInMenu =
    document.getElementById("loggedInMenu");

const accountBtn =
    document.getElementById("accountBtn");

const accountName =
    document.getElementById("accountName");

const accountDropdown =
    document.getElementById("accountDropdown");

const logoutBtn =
    document.getElementById("logoutBtn");

const sellerDashboardLink =
    document.getElementById("sellerDashboardLink");

const adminDashboardLink =
    document.getElementById("adminDashboardLink");

const becomeSellerLink =
    document.getElementById("becomeSellerLink");


// ==================================================
// SHOW LOGGED OUT MENU
// ==================================================

function showLoggedOutMenu() {

    if (loggedOutMenu) {

        loggedOutMenu.style.display =
            "flex";

    }

    if (loggedInMenu) {

        loggedInMenu.style.display =
            "none";

    }

}


// ==================================================
// SHOW LOGGED IN MENU
// ==================================================

function showLoggedInMenu() {

    if (loggedOutMenu) {

        loggedOutMenu.style.display =
            "none";

    }

    if (loggedInMenu) {

        loggedInMenu.style.display =
            "block";

    }

}


// ==================================================
// UPDATE ROLE-BASED MENU
// ==================================================

function updateRoleLinks(role) {

    console.log(
        "Updating menu for role:",
        role
    );


    if (sellerDashboardLink) {

        sellerDashboardLink.style.display =
            "none";

    }


    if (adminDashboardLink) {

        adminDashboardLink.style.display =
            "none";

    }


    if (becomeSellerLink) {

        becomeSellerLink.style.display =
            "none";

    }


    // ==================================================
    // ADMIN
    // ==================================================

    if (role === "admin") {

        if (sellerDashboardLink) {

            sellerDashboardLink.style.display =
                "block";

        }


        if (adminDashboardLink) {

            adminDashboardLink.style.display =
                "block";

        }


        return;

    }


    // ==================================================
    // SELLER
    // ==================================================

    if (role === "seller") {

        if (sellerDashboardLink) {

            sellerDashboardLink.style.display =
                "block";

        }


        return;

    }


    // ==================================================
    // CUSTOMER
    // ==================================================

    if (role === "customer") {

        if (becomeSellerLink) {

            becomeSellerLink.style.display =
                "block";

        }


        return;

    }


    // ==================================================
    // UNKNOWN ROLE
    // ==================================================

    if (becomeSellerLink) {

        becomeSellerLink.style.display =
            "block";

    }

}


// ==================================================
// LOAD PRODUCTS
// ==================================================

async function loadProducts() {

    const productContainer =
        document.getElementById(
            "productContainer"
        );


    if (!productContainer) {

        return;

    }


    productContainer.innerHTML =
        "<p>Loading products...</p>";


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("products")
                .select("*")
                .order(
                    "id",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "Error loading products:",
                error
            );


            productContainer.innerHTML =
                "<p>Unable to load products.</p>";

            return;

        }


        console.log(
            "Products loaded:",
            data
        );


        productContainer.innerHTML =
            "";


        if (
            !data ||
            data.length === 0
        ) {

            productContainer.innerHTML =
                "<p>No products available.</p>";

            return;

        }


        data.forEach(
            function(product) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "card";


                card.dataset.category =
                    product.category || "";


                card.innerHTML = `

                    <img
                        src="${product.image_url || ""}"
                        alt="${product.name || "Product"}"
                    >

                    <h3>
                        ${product.name || "Unnamed Product"}
                    </h3>

                    <p>
                        ₱${Number(
                            product.price || 0
                        ).toLocaleString()}
                    </p>

                    <button
                        class="buyBtn"
                        data-id="${product.id}"
                        type="button"
                    >
                        Add to Cart
                    </button>

                `;


                productContainer.appendChild(
                    card
                );

            }
        );


        filterProducts();


    } catch (error) {

        console.error(
            "Unexpected product loading error:",
            error
        );


        productContainer.innerHTML =
            "<p>Unable to load products.</p>";

    }

}


// ==================================================
// INITIAL PRODUCT LOAD
// ==================================================

loadProducts();


// ==================================================
// CART BUTTON
// ==================================================

if (cartBtn) {

    cartBtn.addEventListener(
        "click",
        function() {

            if (cartSection) {

                cartSection.scrollIntoView({

                    behavior:
                        "smooth"

                });

            }

        }
    );

}


// ==================================================
// ADD TO CART
// ==================================================

document.addEventListener(
    "click",
    function(event) {

        if (
            !event.target.classList.contains(
                "buyBtn"
            )
        ) {

            return;

        }


        const productId =
            event.target.dataset.id;


        const card =
            event.target.closest(
                ".card"
            );


        if (!card) {

            return;

        }


        const productName =
            card.querySelector("h3")
                .textContent
                .trim();


        const productPriceText =
            card.querySelector("p")
                .textContent;


        const productPrice =
            Number(
                productPriceText
                    .replace("₱", "")
                    .replace(/,/g, "")
                    .trim()
            );


        const existingProduct =
            shoppingCart.find(
                function(product) {

                    return String(
                        product.id
                    ) ===
                    String(
                        productId
                    );

                }
            );


        if (existingProduct) {

            existingProduct.quantity++;

        }

        else {

            shoppingCart.push({

                id:
                    productId,

                name:
                    productName,

                price:
                    productPrice,

                quantity:
                    1

            });

        }


        displayCart();

        console.log(
            "Shopping cart:",
            shoppingCart
        );

    }
);


// ==================================================
// DISPLAY CART
// ==================================================

function displayCart() {

    if (!cart) {

        return;

    }


    let totalQuantity =
        0;


    let totalPrice =
        0;


    shoppingCart.forEach(
        function(product) {

            totalQuantity +=
                product.quantity;


            totalPrice +=
                product.price *
                product.quantity;

        }
    );


    cart.textContent =
        totalQuantity;


    if (
        !cartItems ||
        !cartTotal
    ) {

        return;

    }


    if (
        shoppingCart.length === 0
    ) {

        cartItems.innerHTML =
            "<p>Your cart is empty.</p>";


        cartTotal.textContent =
            "0";


        return;

    }


    cartItems.innerHTML =
        "";


    shoppingCart.forEach(
        function(
            product,
            index
        ) {

            const productTotal =
                product.price *
                product.quantity;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "cart-item";


            item.innerHTML = `

                <h3>
                    ${product.name}
                </h3>

                <p>
                    ₱${productTotal.toLocaleString()}
                </p>

                <div
                    class="quantity-controls"
                >

                    <button
                        class="quantityBtn"
                        data-index="${index}"
                        data-action="decrease"
                        type="button"
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
                        type="button"
                    >
                        +
                    </button>

                </div>

                <button
                    class="removeBtn"
                    data-index="${index}"
                    type="button"
                >
                    Remove
                </button>

            `;


            cartItems.appendChild(
                item
            );

        }
    );


    cartTotal.textContent =
        totalPrice.toLocaleString();

}


// ==================================================
// INITIAL CART
// ==================================================

displayCart();


// ==================================================
// CART QUANTITY + REMOVE
// ==================================================

document.addEventListener(
    "click",
    function(event) {


        // INCREASE / DECREASE

        if (
            event.target.classList.contains(
                "quantityBtn"
            )
        ) {

            const index =
                Number(
                    event.target.dataset.index
                );


            const action =
                event.target.dataset.action;


            if (!shoppingCart[index]) {

                return;

            }


            if (
                action === "increase"
            ) {

                shoppingCart[
                    index
                ].quantity++;

            }


            if (
                action === "decrease"
            ) {

                shoppingCart[
                    index
                ].quantity--;


                if (
                    shoppingCart[
                        index
                    ].quantity <= 0
                ) {

                    shoppingCart.splice(
                        index,
                        1
                    );

                }

            }


            displayCart();

        }


        // REMOVE

        if (
            event.target.classList.contains(
                "removeBtn"
            )
        ) {

            const index =
                Number(
                    event.target.dataset.index
                );


            shoppingCart.splice(
                index,
                1
            );


            displayCart();

        }

    }
);


// ==================================================
// DARK MODE
// ==================================================

const darkButton =
    document.getElementById(
        "darkModeBtn"
    );


if (darkButton) {

    darkButton.addEventListener(
        "click",
        function() {

            document.body.classList.toggle(
                "dark"
            );

        }
    );

}


// ==================================================
// SHOP NOW
// ==================================================

const shopButton =
    document.getElementById(
        "shopNowBtn"
    );


const productsSection =
    document.getElementById(
        "products"
    );


if (
    shopButton &&
    productsSection
) {

    shopButton.addEventListener(
        "click",
        function() {

            productsSection.scrollIntoView({

                behavior:
                    "smooth"

            });

        }
    );

}


// ==================================================
// SEARCH + CATEGORY FILTER
// ==================================================

const searchBox =
    document.getElementById(
        "searchBox"
    );


const categoryButtons =
    document.querySelectorAll(
        ".categoryBtn"
    );


let selectedCategory =
    "All";


// ==================================================
// FILTER PRODUCTS
// ==================================================

function filterProducts() {

    if (!searchBox) {

        return;

    }


    const search =
        searchBox.value
            .toLowerCase()
            .trim();


    const cards =
        document.querySelectorAll(
            ".card"
        );


    cards.forEach(
        function(card) {

            const productName =
                card.querySelector("h3")
                    .textContent
                    .toLowerCase()
                    .trim();


            const productCategory =
                (
                    card.dataset.category ||
                    ""
                )
                .trim();


            const matchesSearch =
                productName.includes(
                    search
                );


            const matchesCategory =

                selectedCategory === "All"

                ||

                productCategory ===
                selectedCategory;


            if (
                matchesSearch &&
                matchesCategory
            ) {

                card.style.display =
                    "";

            }

            else {

                card.style.display =
                    "none";

            }

        }
    );

}


// ==================================================
// SEARCH
// ==================================================

if (searchBox) {

    searchBox.addEventListener(
        "input",
        function() {

            filterProducts();

        }
    );

}


// ==================================================
// CATEGORY BUTTONS
// ==================================================

categoryButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                selectedCategory =
                    button.dataset.category;


                categoryButtons.forEach(
                    function(btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                filterProducts();

            }
        );

    }
);


// ==================================================
// BANNER SLIDESHOW
// ==================================================

const slides =
    document.querySelectorAll(
        ".slide"
    );


const dots =
    document.querySelectorAll(
        ".dot"
    );


const nextButton =
    document.querySelector(
        ".nextBtn"
    );


const prevButton =
    document.querySelector(
        ".prevBtn"
    );


let currentSlide =
    0;


// ==================================================
// SHOW SLIDE
// ==================================================

function showSlide(index) {

    if (
        slides.length === 0
    ) {

        return;

    }


    slides.forEach(
        function(slide) {

            slide.classList.remove(
                "active"
            );

        }
    );


    dots.forEach(
        function(dot) {

            dot.classList.remove(
                "active"
            );

        }
    );


    slides[index].classList.add(
        "active"
    );


    if (dots[index]) {

        dots[index].classList.add(
            "active"
        );

    }

}


// ==================================================
// NEXT SLIDE
// ==================================================

if (nextButton) {

    nextButton.addEventListener(
        "click",
        function() {

            currentSlide++;


            if (
                currentSlide >=
                slides.length
            ) {

                currentSlide =
                    0;

            }


            showSlide(
                currentSlide
            );

        }
    );

}


// ==================================================
// PREVIOUS SLIDE
// ==================================================

if (prevButton) {

    prevButton.addEventListener(
        "click",
        function() {

            currentSlide--;


            if (
                currentSlide < 0
            ) {

                currentSlide =
                    slides.length - 1;

            }


            showSlide(
                currentSlide
            );

        }
    );

}


// ==================================================
// DOTS
// ==================================================

dots.forEach(
    function(
        dot,
        index
    ) {

        dot.addEventListener(
            "click",
            function() {

                currentSlide =
                    index;


                showSlide(
                    currentSlide
                );

            }
        );

    }
);


// ==================================================
// AUTO SLIDESHOW
// ==================================================

if (
    slides.length > 1
) {

    setInterval(
        function() {

            currentSlide++;


            if (
                currentSlide >=
                slides.length
            ) {

                currentSlide =
                    0;

            }


            showSlide(
                currentSlide
            );

        },
        5000
    );

}


// ==================================================
// CONTACT FORM
// ==================================================

if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "contactName"
                ).value.trim();


            const email =
                document.getElementById(
                    "contactEmail"
                ).value.trim();


            const message =
                document.getElementById(
                    "contactMessage"
                ).value.trim();


            contactStatus.textContent =
                "Sending message...";


            try {

                const {
                    error
                } =
                    await supabaseClient
                        .from("contacts")
                        .insert([

                            {

                                name:
                                    name,

                                email:
                                    email,

                                message:
                                    message

                            }

                        ]);


                if (error) {

                    console.error(
                        "Contact form error:",
                        error
                    );


                    contactStatus.textContent =
                        "Something went wrong. Please try again.";


                    return;

                }


                contactStatus.textContent =
                    "Message sent successfully!";


                contactForm.reset();


            } catch (error) {

                console.error(
                    "Unexpected contact error:",
                    error
                );


                contactStatus.textContent =
                    "Something went wrong. Please try again.";

            }

        }
    );

}


// ==================================================
// CHECKOUT BUTTON
// ==================================================

if (checkoutBtn) {

    checkoutBtn.addEventListener(
        "click",
        function() {

            if (
                shoppingCart.length === 0
            ) {

                alert(
                    "Your cart is empty. Please add a product first."
                );

                return;

            }


            if (checkoutFormContainer) {

                checkoutFormContainer.style.display =
                    "block";


                updateCheckoutSummary();


                checkoutFormContainer.scrollIntoView({

                    behavior:
                        "smooth"

                });

            }

        }
    );

}


// ==================================================
// UPDATE CHECKOUT SUMMARY
// ==================================================

function updateCheckoutSummary() {

    if (!checkoutItems) {

        return;

    }


    let productTotal =
        0;


    checkoutItems.innerHTML =
        "";


    shoppingCart.forEach(
        function(product) {

            const itemTotal =
                product.price *
                product.quantity;


            productTotal +=
                itemTotal;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "checkout-item";


            item.innerHTML = `

                <p>

                    <strong>
                        ${product.name}
                    </strong>

                    x

                    ${product.quantity}

                    =

                    ₱${itemTotal.toLocaleString()}

                </p>

            `;


            checkoutItems.appendChild(
                item
            );

        }
    );


    const finalTotal =
        productTotal +
        DELIVERY_FEE;


    if (checkoutProductTotal) {

        checkoutProductTotal.textContent =
            productTotal.toLocaleString();

    }


    if (deliveryFeeElement) {

        deliveryFeeElement.textContent =
            DELIVERY_FEE.toLocaleString();

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            finalTotal.toLocaleString();

    }

}


// ==================================================
// PAYMENT METHOD CHANGE
// ==================================================

document.addEventListener(
    "change",
    function(event) {

        if (
            event.target.name !==
            "paymentMethod"
        ) {

            return;

        }


        const selectedPayment =
            event.target.value;


        console.log(
            "Selected payment:",
            selectedPayment
        );


        // ==================================================
        // GCASH
        // ==================================================

        if (
            selectedPayment ===
            "GCash"
        ) {

            if (gcashPaymentSection) {

                gcashPaymentSection.style.display =
                    "block";

            }


            if (bankPaymentSection) {

                bankPaymentSection.style.display =
                    "none";

            }


            return;

        }


        // ==================================================
        // BANK TRANSFER
        // ==================================================

        if (
            selectedPayment ===
            "Bank Transfer"
        ) {

            if (gcashPaymentSection) {

                gcashPaymentSection.style.display =
                    "none";

            }


            if (bankPaymentSection) {

                bankPaymentSection.style.display =
                    "block";

            }


            return;

        }


        // ==================================================
        // COD
        // ==================================================

        if (gcashPaymentSection) {

            gcashPaymentSection.style.display =
                "none";

        }


        if (bankPaymentSection) {

            bankPaymentSection.style.display =
                "none";

        }

    }
);


// ==================================================
// PLACE ORDER
// ==================================================

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // ==================================================
            // CHECK CART
            // ==================================================

            if (
                shoppingCart.length === 0
            ) {

                checkoutStatus.textContent =
                    "Your cart is empty.";

                return;

            }


            // ==================================================
            // GET CUSTOMER DETAILS
            // ==================================================

            const customerName =
                document.getElementById(
                    "customerName"
                ).value.trim();


            const customerEmail =
                document.getElementById(
                    "customerEmail"
                ).value.trim();


            const customerPhone =
                document.getElementById(
                    "customerPhone"
                ).value.trim();


            const customerAddress =
                document.getElementById(
                    "customerAddress"
                ).value.trim();


            // ==================================================
            // GET PAYMENT METHOD
            // ==================================================

            const selectedPaymentElement =
                document.querySelector(
                    'input[name="paymentMethod"]:checked'
                );


            if (!selectedPaymentElement) {

                checkoutStatus.textContent =
                    "Please select a payment method.";

                return;

            }


            const paymentMethod =
                selectedPaymentElement.value;


            // ==================================================
            // GET PAYMENT DETAILS
            // ==================================================

            const gcashReferenceValue =
                gcashReference
                    ? gcashReference.value.trim()
                    : "";


            const paymentProofValue =
                paymentProof
                    ? paymentProof.value.trim()
                    : "";


            // ==================================================
            // VALIDATE GCASH
            // ==================================================

            if (
                paymentMethod ===
                "GCash"
            ) {

                if (!gcashReferenceValue) {

                    checkoutStatus.textContent =
                        "Please enter your GCash reference number.";

                    if (gcashReference) {

                        gcashReference.focus();

                    }

                    return;

                }

            }


            // ==================================================
            // CALCULATE TOTAL
            // ==================================================

            let productTotal =
                0;


            shoppingCart.forEach(
                function(product) {

                    productTotal +=
                        product.price *
                        product.quantity;

                }
            );


            const finalTotal =
                productTotal +
                DELIVERY_FEE;


            // ==================================================
            // SHOW PROCESSING
            // ==================================================

            checkoutStatus.textContent =
                "Processing your order...";


            if (placeOrderBtn) {

                placeOrderBtn.disabled =
                    true;


                placeOrderBtn.textContent =
                    "Processing...";

            }


            try {


                // ==================================================
                // SAVE ORDER
                // ==================================================

                const {
                    data: order,
                    error: orderError
                } =
                    await supabaseClient
                        .from("orders")
                        .insert([

                            {

                                customer_name:
                                    customerName,

                                customer_email:
                                    customerEmail,

                                customer_phone:
                                    customerPhone,

                                customer_address:
                                    customerAddress,

                                payment_method:
                                    paymentMethod,

                                payment_status:
                                    paymentMethod ===
                                    "COD"
                                        ? "Pending"
                                        : "Pending",

                                gcash_reference:
                                    paymentMethod ===
                                    "GCash"
                                        ? gcashReferenceValue
                                        : null,

                                payment_proof:
                                    paymentMethod ===
                                    "GCash"
                                        ? paymentProofValue ||
                                          null
                                        : null,

                                delivery_fee:
                                    DELIVERY_FEE,

                                total_amount:
                                    finalTotal,

                                status:
                                    "Pending"

                            }

                        ])
                        .select()
                        .single();


                // ==================================================
                // CHECK ORDER ERROR
                // ==================================================

                if (orderError) {

                    console.error(
                        "ORDER ERROR:",
                        orderError
                    );


                    checkoutStatus.textContent =
                        "Order Error: " +
                        orderError.message;


                    return;

                }


                console.log(
                    "Order created:",
                    order
                );


                // ==================================================
                // CREATE ORDER ITEMS
                // ==================================================

                const orderItems =
                    shoppingCart.map(
                        function(product) {

                            return {

                                order_id:
                                    order.id,

                                product_id:
                                    product.id,

                                product_name:
                                    product.name,

                                quantity:
                                    product.quantity,

                                price:
                                    product.price

                            };

                        }
                    );


                // ==================================================
                // SAVE ORDER ITEMS
                // ==================================================

                const {
                    error: itemsError
                } =
                    await supabaseClient
                        .from("order_items")
                        .insert(
                            orderItems
                        );


                // ==================================================
                // CHECK ORDER ITEMS ERROR
                // ==================================================

                if (itemsError) {

                    console.error(
                        "ORDER ITEMS ERROR:",
                        itemsError
                    );


                    checkoutStatus.textContent =
                        "Order was created, but there was a problem saving the products: " +
                        itemsError.message;


                    return;

                }


                // ==================================================
                // SUCCESS
                // ==================================================

                // ==================================================
// UPDATE PRODUCT STOCK
// ==================================================

for (const item of shoppingCart) {

    // Get latest stock
    const { data: product, error: stockError } =
        await supabaseClient
            .from("products")
            .select("stock")
            .eq("id", item.id)
            .single();

    if (stockError) {

        console.error(
            "Unable to retrieve stock:",
            stockError
        );

        continue;
    }

    const newStock =
        Math.max(
            0,
            product.stock - item.quantity
        );

    const { error: updateError } =
        await supabaseClient
            .from("products")
            .update({

                stock: newStock

            })
            .eq("id", item.id);

    if (updateError) {

        console.error(
            "Unable to update stock:",
            updateError
        );

    }

}

                checkoutStatus.textContent =
                    "Order placed successfully! Thank you for your purchase.";


                alert(
                    "Your order has been placed successfully!"
                );


                // ==================================================
                // CLEAR CART
                // ==================================================

                shoppingCart =
                    [];


                displayCart();


                // ==================================================
                // RESET FORM
                // ==================================================

                checkoutForm.reset();


                // ==================================================
                // HIDE PAYMENT SECTIONS
                // ==================================================

                if (gcashPaymentSection) {

                    gcashPaymentSection.style.display =
                        "none";

                }


                if (bankPaymentSection) {

                    bankPaymentSection.style.display =
                        "none";

                }


                // ==================================================
                // UPDATE CHECKOUT SUMMARY
                // ==================================================

                updateCheckoutSummary();


                // ==================================================
                // HIDE CHECKOUT AFTER SUCCESS
                // ==================================================

                setTimeout(
                    function() {

                        if (checkoutFormContainer) {

                            checkoutFormContainer.style.display =
                                "none";

                        }

                    },
                    3000
                );


            } catch (error) {

                console.error(
                    "Unexpected checkout error:",
                    error
                );


                checkoutStatus.textContent =
                    "Something went wrong while placing your order.";

            }


            // ==================================================
            // ENABLE BUTTON
            // ==================================================

            if (placeOrderBtn) {

                placeOrderBtn.disabled =
                    false;


                placeOrderBtn.textContent =
                    "Place Order";

            }

        }
    );

}


// ==================================================
// CHECK USER SESSION
// ==================================================

async function checkUserSession() {

    console.log(
        "Checking user session..."
    );


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );


            showLoggedOutMenu();

            return;

        }


        const session =
            data.session;


        // ==================================================
        // USER LOGGED OUT
        // ==================================================

        if (!session) {

            console.log(
                "No active session."
            );


            showLoggedOutMenu();

            return;

        }


        // ==================================================
        // USER LOGGED IN
        // ==================================================

        const user =
            session.user;


        console.log(
            "Current user:",
            user
        );


        showLoggedInMenu();


        if (accountName) {

            accountName.textContent =
                user.email ||
                "Account";

        }


        // ==================================================
        // GET PROFILE
        // ==================================================

        const {
            data: profile,
            error: profileError
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "full_name, role"
                )
                .eq(
                    "id",
                    user.id
                )
                .maybeSingle();


        if (profileError) {

            console.error(
                "Profile error:",
                profileError
            );

            return;

        }


        // ==================================================
        // NO PROFILE
        // ==================================================

        if (!profile) {

            updateRoleLinks(
                "customer"
            );


            return;

        }


        // ==================================================
        // DISPLAY USER NAME
        // ==================================================

        if (
            profile.full_name &&
            accountName
        ) {

            accountName.textContent =
                profile.full_name;

        }


        // ==================================================
        // GET ROLE
        // ==================================================

        const role =
            String(
                profile.role ||
                "customer"
            )
            .toLowerCase()
            .trim();


        console.log(
            "Current user role:",
            role
        );


        // ==================================================
        // UPDATE MENU
        // ==================================================

        updateRoleLinks(
            role
        );


    } catch (error) {

        console.error(
            "Unexpected session error:",
            error
        );


        showLoggedOutMenu();

    }

}


// ==================================================
// ACCOUNT DROPDOWN
// ==================================================

if (accountBtn) {

    accountBtn.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();


            if (accountDropdown) {

                accountDropdown.classList.toggle(
                    "show"
                );

            }

        }
    );

}


// ==================================================
// CLOSE ACCOUNT DROPDOWN
// ==================================================

document.addEventListener(
    "click",
    function(event) {

        if (
            !event.target.closest(
                "#accountArea"
            )
        ) {

            if (accountDropdown) {

                accountDropdown.classList.remove(
                    "show"
                );

            }

        }

    }
);


// ==================================================
// LOGOUT
// ==================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function() {

            logoutBtn.disabled =
                true;


            try {

                const {
                    error
                } =
                    await supabaseClient.auth.signOut();


                if (error) {

                    console.error(
                        "Logout error:",
                        error
                    );


                    alert(
                        "Logout failed. Please try again."
                    );


                    logoutBtn.disabled =
                        false;


                    return;

                }


                console.log(
                    "User logged out."
                );


                showLoggedOutMenu();


                if (accountDropdown) {

                    accountDropdown.classList.remove(
                        "show"
                    );

                }


            } catch (error) {

                console.error(
                    "Unexpected logout error:",
                    error
                );


                alert(
                    "Something went wrong while logging out."
                );


                logoutBtn.disabled =
                    false;

            }

        }
    );

}


// ==================================================
// AUTH STATE LISTENER
// ==================================================

supabaseClient.auth.onAuthStateChange(
    function(
        event,
        session
    ) {

        console.log(
            "Auth state changed:",
            event
        );


        if (session) {

            checkUserSession();

        }

        else {

            showLoggedOutMenu();

        }

    }
);


// ==================================================
// INITIAL SESSION CHECK
// ==================================================

showLoggedOutMenu();

checkUserSession();


// ==================================================
// END
// ==================================================

console.log(
    "G-ForcePlays script loaded successfully."
);