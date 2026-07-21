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
// SHOPPING CART
// ==========================

let shoppingCart = [];


// ==========================
// DOM ELEMENTS
// ==========================

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


// ==========================
// ACCOUNT ELEMENTS
// ==========================

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


// ==========================
// ACCOUNT UI
// ==========================

function showLoggedOutMenu() {

    loggedOutMenu.style.display =
        "flex";

    loggedInMenu.style.display =
        "none";

    accountDropdown.classList.remove(
        "show"
    );

}


function showLoggedInMenu() {

    loggedOutMenu.style.display =
        "none";

    loggedInMenu.style.display =
        "block";

}


// ==========================
// LOAD PRODUCTS
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


    if (error) {

        console.error(
            "Error loading products:",
            error
        );

        document.getElementById(
            "productContainer"
        ).innerHTML =
            "<p>Unable to load products.</p>";

        return;

    }


    console.log(
        "Products loaded:",
        data
    );


    const productContainer =
        document.getElementById(
            "productContainer"
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


// ==========================
// ADD TO CART
// ==========================

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


// ==========================
// DISPLAY CART
// ==========================

function displayCart() {

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


    cartTotal.textContent =
        totalPrice.toLocaleString();


    if (
        shoppingCart.length ===
        0
    ) {

        cartItems.innerHTML =
            "<p>Your cart is empty.</p>";

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

}


// ==========================
// CART BUTTON
// ==========================

cartBtn.addEventListener(
    "click",
    function() {

        cartSection.scrollIntoView({

            behavior:
                "smooth"

        });

    }
);


// ==========================
// CART QUANTITY / REMOVE
// ==========================

document.addEventListener(
    "click",
    function(event) {


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


// ==========================
// DARK MODE
// ==========================

const darkButton =
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
// SHOP NOW
// ==========================

const shopButton =
    document.getElementById(
        "shopNowBtn"
    );


const products =
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


function filterProducts() {


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
                    "block";

            }

            else {

                card.style.display =
                    "none";

            }

        }
    );

}


searchBox.addEventListener(
    "input",
    function() {

        filterProducts();

    }
);


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


// ==========================
// BANNER SLIDESHOW
// ==========================

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


function showSlide(
    index
) {


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


    if (
        slides[index]
    ) {

        slides[index].classList.add(
            "active"
        );

    }


    if (
        dots[index]
    ) {

        dots[index].classList.add(
            "active"
        );

    }

}


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

const contactForm =
    document.getElementById(
        "contactForm"
    );


const contactStatus =
    document.getElementById(
        "contactStatus"
    );


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
        } = await supabaseClient
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


        if (
            error
        ) {

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


// ==========================
// CHECKOUT FORM
// ==========================

const checkoutFormContainer =
    document.getElementById(
        "checkoutFormContainer"
    );


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


// ==========================
// PLACE ORDER
// ==========================

const checkoutForm =
    document.getElementById(
        "checkoutForm"
    );


const checkoutStatus =
    document.getElementById(
        "checkoutStatus"
    );


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


        // ==========================
        // SAVE ORDER
        // ==========================

        const {
            data: order,
            error: orderError
        } = await supabaseClient
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


        if (
            orderError
        ) {

            console.error(
                "ORDER ERROR:",
                orderError
            );


            checkoutStatus.textContent =
                "Order Error: " +
                orderError.message;


            return;

        }


        // ==========================
        // CREATE ORDER ITEMS
        // ==========================

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


        // ==========================
        // SAVE ORDER ITEMS
        // ==========================

        const {
            error: itemsError
        } = await supabaseClient
            .from("order_items")
            .insert(
                orderItems
            );


        if (
            itemsError
        ) {

            console.error(
                "Order items error:",
                itemsError
            );


            checkoutStatus.textContent =
                "Order was created, but there was a problem saving the products.";


            return;

        }


        // ==========================
        // SUCCESS
        // ==========================

        checkoutStatus.textContent =
            "Order placed successfully! Thank you for your purchase.";


        shoppingCart =
            [];


        displayCart();


        checkoutForm.reset();

    }
);


// ==========================
// CHECK USER SESSION
// ==========================

async function checkUserSession() {


    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();


    if (
        error
    ) {

        console.error(
            "Session error:",
            error
        );

        showLoggedOutMenu();

        return;

    }


    const session =
        data.session;


    // ==========================
    // LOGGED OUT
    // ==========================

    if (
        !session
    ) {

        console.log(
            "No active user session."
        );


        showLoggedOutMenu();

        return;

    }


    // ==========================
    // LOGGED IN
    // ==========================

    const user =
        session.user;


    console.log(
        "Current user:",
        user
    );


    showLoggedInMenu();


    // DEFAULT ACCOUNT NAME

    accountName.textContent =
        user.email;


    // ==========================
    // GET PROFILE
    // ==========================

    const {
        data: profile,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq(
                "id",
                user.id
            )
            .single();


    if (
        profileError
    ) {

        console.error(
            "Profile error:",
            profileError
        );


        return;

    }


    console.log(
        "Current user profile:",
        profile
    );


    console.log(
        "Current user role:",
        profile.role
    );


    // ==========================
    // DISPLAY NAME
    // ==========================

    if (
        profile.full_name
    ) {

        accountName.textContent =
            profile.full_name;

    }


    // ==========================
    // RESET ROLE LINKS
    // ==========================

    sellerDashboardLink.style.display =
        "none";

    adminDashboardLink.style.display =
        "none";

    becomeSellerLink.style.display =
        "block";


    // ==========================
    // ADMIN
    // ==========================

    if (
        profile.role ===
        "admin"
    ) {

        adminDashboardLink.style.display =
            "block";

        becomeSellerLink.style.display =
            "none";

    }


    // ==========================
    // SELLER
    // ==========================

    else if (
        profile.role ===
        "seller"
    ) {

        sellerDashboardLink.style.display =
            "block";

        becomeSellerLink.style.display =
            "none";

    }


}


// ==========================
// ACCOUNT DROPDOWN
// ==========================

accountBtn.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        accountDropdown.classList.toggle(
            "show"
        );

    }
);


// ==========================
// CLOSE DROPDOWN
// ==========================

document.addEventListener(
    "click",
    function(event) {

        if (
            !event.target.closest(
                "#accountArea"
            )
        ) {

            accountDropdown.classList.remove(
                "show"
            );

        }

    }
);


// ==========================
// LOGOUT
// ==========================

logoutBtn.addEventListener(
    "click",
    async function() {


        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (
            error
        ) {

            console.error(
                "Logout error:",
                error
            );

            return;

        }


        showLoggedOutMenu();


        window.location.href =
            "index.html";

    }
);


// ==========================
// AUTH STATE LISTENER
// ==========================

supabaseClient.auth.onAuthStateChange(
    function(
        event,
        session
    ) {


        console.log(
            "Auth state changed:",
            event
        );


        if (
            session
        ) {

            checkUserSession();

        }

        else {

            showLoggedOutMenu();

        }

    }
);


// ==========================
// INITIAL CART
// ==========================

displayCart();


// ==========================
// INITIAL PRODUCT LOAD
// ==========================

loadProducts();


// ==========================
// INITIAL SESSION CHECK
// ==========================

checkUserSession();