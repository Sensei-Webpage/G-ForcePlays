// ==========================
// SUPABASE CONNECTION
// ==========================

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


// ==========================
// LOAD PRODUCTS FROM SUPABASE
// ==========================

async function loadProducts() {

    const {
        data,
        error
    } = await supabaseClient
        .from("products")
        .select("*")
        .order(
            "id",
            {
                ascending: true
            }
        );


    // Check for error

    if (error) {

        console.error(
            "Error loading products:",
            error
        );

        return;

    }


    // Console information

    console.log(
        "Products loaded:",
        data
    );

    console.log(
        "Number of products:",
        data.length
    );


    if (data.length === 0) {

        console.warn(
            "No products were returned from Supabase."
        );

    }


    // Get product container

    const productContainer =
        document.getElementById(
            "productContainer"
        );


    // Clear existing products

    productContainer.innerHTML = "";


    // Create product cards

    data.forEach(
        function(product) {


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card";


            // Store category

            card.dataset.category =
                product.category;


            // Product HTML

            card.innerHTML = `

                <img
                    src="${product.image_url}"
                    alt="${product.name}"
                >

                <h3>
                    ${product.name}
                </h3>

                <p>
                    ₱${Number(
                        product.price
                    ).toLocaleString()}
                </p>

                <button
                    class="buyBtn"
                    data-id="${product.id}"
                >
                    Add to Cart
                </button>

            `;


            // Add card to container

            productContainer.appendChild(
                card
            );

        }
    );

}


// Load products

loadProducts();


// ==========================
// SHOPPING CART
// ==========================

// Stores products added to cart

let shoppingCart = [];


// Get cart elements

let cart =
    document.getElementById(
        "cartCount"
    );

let cartItems =
    document.getElementById(
        "cartItems"
    );

let cartTotal =
    document.getElementById(
        "cartTotal"
    );

let checkoutBtn =
    document.getElementById(
        "checkoutBtn"
    );


// ==========================
// CART BUTTON
// ==========================

let cartBtn =
    document.getElementById(
        "cartBtn"
    );

let cartSection =
    document.getElementById(
        "cartSection"
    );


cartBtn.addEventListener(
    "click",
    function() {

        cartSection.scrollIntoView({

            behavior: "smooth"

        });

    }
);


// ==========================
// ADD PRODUCT TO CART
// ==========================

document.addEventListener(
    "click",
    function(event) {


        // Check if Add to Cart button

        if (
            event.target.classList.contains(
                "buyBtn"
            )
        ) {


            // Get product ID

            let productId =
                event.target.dataset.id;


            // Get product card

            let card =
                event.target.parentElement;


            // Get product name

            let productName =
                card.querySelector(
                    "h3"
                ).innerHTML;


            // Get product price text

            let productPriceText =
                card.querySelector(
                    "p"
                ).innerHTML;


            // Convert price to number

            let productPrice =
                Number(

                    productPriceText
                        .replace(
                            "₱",
                            ""
                        )
                        .replace(
                            /,/g,
                            ""
                        )

                );


            // Check if product already exists

            let existingProduct =
                shoppingCart.find(
                    function(product) {

                        return product.id ==
                            productId;

                    }
                );


            // If product exists

            if (
                existingProduct
            ) {

                existingProduct.quantity++;

            }


            // If product is new

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


            // Update cart

            displayCart();

        }

    }
);


// ==========================
// DISPLAY CART
// ==========================

function displayCart() {


    // Calculate total quantity

    let totalQuantity =
        0;


    shoppingCart.forEach(
        function(product) {

            totalQuantity +=
                product.quantity;

        }
    );


    // Update cart count

    cart.innerHTML =
        totalQuantity;


    // Check if cart is empty

    if (
        shoppingCart.length ===
        0
    ) {

        cartItems.innerHTML =
            "<p>Your cart is empty.</p>";

        cartTotal.innerHTML =
            "0";

        return;

    }


    // Clear current cart

    cartItems.innerHTML =
        "";


    // Total price

    let totalPrice =
        0;


    // Display each product

    shoppingCart.forEach(
        function(
            product,
            index
        ) {


            // Calculate product total

            let productTotal =
                product.price *
                product.quantity;


            // Add to total

            totalPrice +=
                productTotal;


            // Create cart item

            let item =
                document.createElement(
                    "div"
                );


            item.className =
                "cart-item";


            // Cart item HTML

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


            // Add item

            cartItems.appendChild(
                item
            );

        }
    );


    // Display total

    cartTotal.innerHTML =
        totalPrice.toLocaleString();

}


// ==========================
// CART QUANTITY CONTROLS
// ==========================

document.addEventListener(
    "click",
    function(event) {


        // Increase / decrease quantity

        if (
            event.target.classList.contains(
                "quantityBtn"
            )
        ) {


            // Get index

            let index =
                Number(
                    event.target.dataset.index
                );


            // Get action

            let action =
                event.target.dataset.action;


            // Increase

            if (
                action ===
                "increase"
            ) {

                shoppingCart[
                    index
                ].quantity++;

            }


            // Decrease

            if (
                action ===
                "decrease"
            ) {

                shoppingCart[
                    index
                ].quantity--;


                // Remove if zero

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


            // Update cart

            displayCart();

        }


        // ==========================
        // REMOVE PRODUCT
        // ==========================

        if (
            event.target.classList.contains(
                "removeBtn"
            )
        ) {


            // Get index

            let index =
                Number(
                    event.target.dataset.index
                );


            // Remove product

            shoppingCart.splice(
                index,
                1
            );


            // Update cart

            displayCart();

        }

    }
);


// ==========================
// INITIAL CART DISPLAY
// ==========================

displayCart();


// ==========================
// DARK MODE
// ==========================

let darkButton =
    document.getElementById(
        "darkModeBtn"
    );


darkButton.addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "dark"
        );

    }
);


// ==========================
// SMOOTH SCROLL
// ==========================

let shopButton =
    document.getElementById(
        "shopNowBtn"
    );

let products =
    document.getElementById(
        "products"
    );


shopButton.addEventListener(
    "click",
    function() {

        products.scrollIntoView({

            behavior:
                "smooth"

        });

    }
);


// ==========================
// SEARCH + CATEGORY FILTER
// ==========================

let searchBox =
    document.getElementById(
        "searchBox"
    );


let categoryButtons =
    document.querySelectorAll(
        ".categoryBtn"
    );


// Selected category

let selectedCategory =
    "All";


// ==========================
// FILTER PRODUCTS
// ==========================

function filterProducts() {


    // Get search text

    let search =
        searchBox.value
            .toLowerCase()
            .trim();


    // Get cards

    let cards =
        document.querySelectorAll(
            ".card"
        );


    // Check each card

    cards.forEach(
        function(card) {


            // Get product name

            let productName =
                card.querySelector(
                    "h3"
                )
                .innerHTML
                .toLowerCase()
                .trim();


            // Get category

            let productCategory =
                card.dataset.category
                    .trim();


            // Search match

            let matchesSearch =
                productName.includes(
                    search
                );


            // Category match

            let matchesCategory =

                selectedCategory ===
                    "All"

                ||

                productCategory ===
                    selectedCategory;


            // Show or hide

            if (
                matchesSearch &&
                matchesCategory
            ) {

                card.style.display =
                    "block";

            }

            else {

                card.style.display =
                    "none";

            }

        }
    );

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


                // Update category

                selectedCategory =
                    button.dataset.category;


                // Remove active

                categoryButtons.forEach(
                    function(btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                // Add active

                button.classList.add(
                    "active"
                );


                // Filter

                filterProducts();

            }
        );

    }
);


// ==========================
// BANNER SLIDESHOW
// ==========================

let slides =
    document.querySelectorAll(
        ".slide"
    );


let dots =
    document.querySelectorAll(
        ".dot"
    );


let nextButton =
    document.querySelector(
        ".nextBtn"
    );


let prevButton =
    document.querySelector(
        ".prevBtn"
    );


let currentSlide =
    0;


// ==========================
// SHOW SLIDE
// ==========================

function showSlide(
    index
) {


    // Remove active slides

    slides.forEach(
        function(slide) {

            slide.classList.remove(
                "active"
            );

        }
    );


    // Remove active dots

    dots.forEach(
        function(dot) {

            dot.classList.remove(
                "active"
            );

        }
    );


    // Activate slide

    slides[
        index
    ].classList.add(
        "active"
    );


    // Activate dot

    dots[
        index
    ].classList.add(
        "active"
    );

}


// ==========================
// NEXT BUTTON
// ==========================

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


// ==========================
// PREVIOUS BUTTON
// ==========================

prevButton.addEventListener(
    "click",
    function() {


        currentSlide--;


        if (
            currentSlide < 0
        ) {

            currentSlide =
                slides.length -
                1;

        }


        showSlide(
            currentSlide
        );

    }
);


// ==========================
// DOT BUTTONS
// ==========================

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


// ==========================
// AUTOMATIC SLIDESHOW
// ==========================

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


// ==========================
// CONTACT FORM
// ==========================

let contactForm =
    document.getElementById(
        "contactForm"
    );


let contactStatus =
    document.getElementById(
        "contactStatus"
    );


contactForm.addEventListener(
    "submit",
    async function(event) {


        // Prevent refresh

        event.preventDefault();


        // Get values

        let name =
            document.getElementById(
                "contactName"
            ).value;


        let email =
            document.getElementById(
                "contactEmail"
            ).value;


        let message =
            document.getElementById(
                "contactMessage"
            ).value;


        // Status

        contactStatus.innerHTML =
            "Sending message...";


        // Insert contact

        const {
            error
        } = await supabaseClient
            .from(
                "contacts"
            )
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


        // Check error

        if (
            error
        ) {


            console.error(
                "Contact form error:",
                error
            );


            contactStatus.innerHTML =
                "Something went wrong. Please try again.";


            return;

        }


        // Success

        contactStatus.innerHTML =
            "Message sent successfully!";


        // Reset

        contactForm.reset();

    }
);


// ==========================
// CHECKOUT FORM DISPLAY
// ==========================

let checkoutFormContainer =
    document.getElementById(
        "checkoutFormContainer"
    );


checkoutBtn.addEventListener(
    "click",
    function() {


        // Check empty cart

        if (
            shoppingCart.length ===
            0
        ) {

            alert(
                "Your cart is empty. Please add a product first."
            );

            return;

        }


        // Show checkout form

        checkoutFormContainer.style.display =
            "block";


        // Scroll

        checkoutFormContainer.scrollIntoView({

            behavior:
                "smooth"

        });

    }
);


// ==========================
// PLACE ORDER
// ==========================

let checkoutForm =
    document.getElementById(
        "checkoutForm"
    );


let checkoutStatus =
    document.getElementById(
        "checkoutStatus"
    );


checkoutForm.addEventListener(
    "submit",
    async function(event) {


        // Prevent refresh

        event.preventDefault();


        // Check cart

        if (
            shoppingCart.length ===
            0
        ) {

            checkoutStatus.innerHTML =
                "Your cart is empty.";

            return;

        }


        // ==========================
        // GET CUSTOMER INFORMATION
        // ==========================

        let customerName =
            document.getElementById(
                "customerName"
            ).value;


        let customerEmail =
            document.getElementById(
                "customerEmail"
            ).value;


        let customerPhone =
            document.getElementById(
                "customerPhone"
            ).value;


        let customerAddress =
            document.getElementById(
                "customerAddress"
            ).value;


        // ==========================
        // CALCULATE TOTAL
        // ==========================

        let totalAmount =
            0;


        shoppingCart.forEach(
            function(product) {

                totalAmount +=
                    product.price *
                    product.quantity;

            }
        );


        // ==========================
        // SHOW PROCESSING
        // ==========================

        checkoutStatus.innerHTML =
            "Processing your order...";


        // ==========================
        // SAVE ORDER
        // ==========================

        const {
            data: order,
            error: orderError
        } = await supabaseClient
            .from(
                "orders"
            )
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

                    total_amount:
                        totalAmount

                }

            ])
            .select()
            .single();


        // ==========================
        // CHECK ORDER ERROR
        // ==========================

        if (
            orderError
        ) {


            console.error(
                "ORDER ERROR FULL:",
                orderError
            );


            console.error(
                "ORDER ERROR MESSAGE:",
                orderError.message
            );


            console.error(
                "ORDER ERROR DETAILS:",
                orderError.details
            );


            console.error(
                "ORDER ERROR HINT:",
                orderError.hint
            );


            console.error(
                "ORDER ERROR CODE:",
                orderError.code
            );


            checkoutStatus.innerHTML =
                "Order Error: " +
                orderError.message;


            return;

        }


        // ==========================
        // SAVE ORDER ITEMS
        // ==========================

        let orderItems =
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


        const {
            error: itemsError
        } = await supabaseClient
            .from(
                "order_items"
            )
            .insert(
                orderItems
            );


        // ==========================
        // CHECK ORDER ITEMS ERROR
        // ==========================

        if (
            itemsError
        ) {


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

        shoppingCart =
            [];


        // Update cart

        displayCart();


        // Reset form

        checkoutForm.reset();

    }
);