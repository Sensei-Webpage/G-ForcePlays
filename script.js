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
    document.getElementById(
        "checkoutFormContainer"
    );

const checkoutForm =
    document.getElementById(
        "checkoutForm"
    );

const checkoutStatus =
    document.getElementById(
        "checkoutStatus"
    );

const contactForm =
    document.getElementById(
        "contactForm"
    );

const contactStatus =
    document.getElementById(
        "contactStatus"
    );


// ==================================================
// ACCOUNT DOM ELEMENTS
// ==================================================

const loggedOutMenu =
    document.getElementById(
        "loggedOutMenu"
    );

const loggedInMenu =
    document.getElementById(
        "loggedInMenu"
    );

const accountBtn =
    document.getElementById(
        "accountBtn"
    );

const accountName =
    document.getElementById(
        "accountName"
    );

const accountDropdown =
    document.getElementById(
        "accountDropdown"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const sellerDashboardLink =
    document.getElementById(
        "sellerDashboardLink"
    );

const adminDashboardLink =
    document.getElementById(
        "adminDashboardLink"
    );

const becomeSellerLink =
    document.getElementById(
        "becomeSellerLink"
    );


// ==================================================
// DEFAULT ACCOUNT STATE
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
// SHOW LOGGED IN ACCOUNT
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
// RESET ROLE LINKS
// ==================================================

function resetRoleLinks() {

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
                product.category ||
                "";


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
            card.querySelector(
                "h3"
            ).textContent.trim();


        const productPriceText =
            card.querySelector(
                "p"
            ).textContent;


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
                    ) === String(
                        productId
                    );

                }
            );


        if (
            existingProduct
        ) {

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
        shoppingCart.length ===
        0
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


            if (
                !shoppingCart[index]
            ) {

                return;

            }


            if (
                action ===
                "increase"
            ) {

                shoppingCart[
                    index
                ].quantity++;

            }


            if (
                action ===
                "decrease"
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
                card.querySelector(
                    "h3"
                )
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

                selectedCategory ===
                    "All"

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

function showSlide(
    index
) {


    if (
        slides.length ===
        0
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


    slides[
        index
    ].classList.add(
        "active"
    );


    if (
        dots[index]
    ) {

        dots[
            index
        ].classList.add(
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
                    slides.length -
                    1;

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
                shoppingCart.length ===
                0
            ) {

                alert(
                    "Your cart is empty. Please add a product first."
                );

                return;

            }


            checkoutFormContainer.style.display =
                "block";


            checkoutFormContainer.scrollIntoView({

                behavior:
                    "smooth"

            });

        }
    );

}


// ==================================================
// PLACE ORDER
// ==================================================

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function(event) {


            event.preventDefault();


            if (
                shoppingCart.length ===
                0
            ) {

                checkoutStatus.textContent =
                    "Your cart is empty.";

                return;

            }


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


            let totalAmount =
                0;


            shoppingCart.forEach(
                function(product) {

                    totalAmount +=
                        product.price *
                        product.quantity;

                }
            );


            checkoutStatus.textContent =
                "Processing your order...";


            // SAVE ORDER

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

                            total_amount:
                                totalAmount

                        }

                    ])
                    .select()
                    .single();


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


            // CREATE ORDER ITEMS

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


            // SAVE ORDER ITEMS

            const {
                error: itemsError
            } =
                await supabaseClient
                    .from("order_items")
                    .insert(
                        orderItems
                    );


            if (itemsError) {

                console.error(
                    "ORDER ITEMS ERROR:",
                    itemsError
                );


                checkoutStatus.textContent =
                    "Order was created, but there was a problem saving the products.";


                return;

            }


            // SUCCESS

            checkoutStatus.textContent =
                "Order placed successfully! Thank you for your purchase.";


            shoppingCart =
                [];


            displayCart();


            checkoutForm.reset();

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


    // ==============================================
    // USER IS LOGGED OUT
    // ==============================================

    if (!session) {

        console.log(
            "No active session."
        );


        showLoggedOutMenu();


        resetRoleLinks();


        return;

    }


    // ==============================================
    // USER IS LOGGED IN
    // ==============================================

    const user =
        session.user;


    console.log(
        "Current user:",
        user
    );


    showLoggedInMenu();


    resetRoleLinks();


    accountName.textContent =
        user.email ||
        "Account";


    // ==============================================
    // GET USER PROFILE
    // ==============================================

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


    // ==============================================
    // NO PROFILE FOUND
    // ==============================================

    if (!profile) {

        console.log(
            "No profile found for user."
        );


        return;

    }


    console.log(
        "User profile:",
        profile
    );


    // ==============================================
    // DISPLAY USER NAME
    // ==============================================

    if (
        profile.full_name
    ) {

        accountName.textContent =
            profile.full_name;

    }


    // ==============================================
    // GET USER ROLE
    // ==============================================

    const role =
        String(
            profile.role ||
            "user"
        )
        .toLowerCase()
        .trim();


    console.log(
        "Current user role:",
        role
    );


    // ==============================================
    // ADMIN
    // ==============================================

    if (
        role ===
        "admin"
    ) {

        if (adminDashboardLink) {

            adminDashboardLink.style.display =
                "block";

        }


        if (sellerDashboardLink) {

            sellerDashboardLink.style.display =
                "block";

        }


        if (becomeSellerLink) {

            becomeSellerLink.style.display =
                "none";

        }

    }


    // ==============================================
    // SELLER
    // ==============================================

    else if (
        role ===
        "seller"
    ) {

        if (sellerDashboardLink) {

            sellerDashboardLink.style.display =
                "block";

        }


        if (becomeSellerLink) {

            becomeSellerLink.style.display =
                "none";

        }

    }


    // ==============================================
    // NORMAL USER
    // ==============================================

    else {

        if (becomeSellerLink) {

            becomeSellerLink.style.display =
                "block";

        }

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


                return;

            }


            console.log(
                "User logged out."
            );


            showLoggedOutMenu();


            resetRoleLinks();


            if (accountDropdown) {

                accountDropdown.classList.remove(
                    "show"
                );

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


            resetRoleLinks();

        }

    }
);


// ==================================================
// INITIAL SESSION CHECK
// ==================================================

showLoggedOutMenu();

resetRoleLinks();


checkUserSession();


// ==================================================
// END
// ==================================================

console.log(
    "G-ForcePlays script loaded successfully."
);