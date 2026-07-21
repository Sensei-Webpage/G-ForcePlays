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

console.log(
    "Seller Supabase connected!"
);


// ==================================================
// DOM ELEMENTS
// ==================================================

const sellerWelcomeText =
    document.getElementById(
        "sellerWelcomeText"
    );

const addProductForm =
    document.getElementById(
        "addProductForm"
    );

const productStatus =
    document.getElementById(
        "productStatus"
    );

const productsStatus =
    document.getElementById(
        "productsStatus"
    );

const sellerProductList =
    document.getElementById(
        "sellerProductList"
    );

const sellerStatus =
    document.getElementById(
        "sellerStatus"
    );

const sellerOrderList =
    document.getElementById(
        "sellerOrderList"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


// ==================================================
// CURRENT USER
// ==================================================

let currentUser = null;


// ==================================================
// CURRENT USER ROLE
// ==================================================

let currentUserRole = null;


// ==================================================
// CHECK SELLER ACCESS
// ==================================================

async function checkSellerAccess() {

    try {

        console.log(
            "Checking seller dashboard access..."
        );


        // ==================================================
        // GET SESSION
        // ==================================================

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        // ==================================================
        // SESSION ERROR
        // ==================================================

        if (error) {

            console.error(
                "Session error:",
                error
            );

            window.location.href =
                "login.html";

            return false;

        }


        // ==================================================
        // GET SESSION
        // ==================================================

        const session =
            data.session;


        // ==================================================
        // NOT LOGGED IN
        // ==================================================

        if (!session) {

            alert(
                "You must log in to access the seller dashboard."
            );


            window.location.href =
                "login.html";


            return false;

        }


        // ==================================================
        // SAVE CURRENT USER
        // ==================================================

        currentUser =
            session.user;


        console.log(
            "Logged in user:",
            currentUser.email
        );


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
                    currentUser.id
                )
                .maybeSingle();


        // ==================================================
        // PROFILE ERROR
        // ==================================================

        if (profileError) {

            console.error(
                "Profile error:",
                profileError
            );


            alert(
                "Unable to verify your account role."
            );


            window.location.href =
                "index.html";


            return false;

        }


        // ==================================================
        // NO PROFILE
        // ==================================================

        if (!profile) {

            alert(
                "Your account profile could not be found."
            );


            window.location.href =
                "index.html";


            return false;

        }


        // ==================================================
        // GET ROLE
        // ==================================================

        currentUserRole =
            String(
                profile.role ||
                ""
            )
            .toLowerCase()
            .trim();


        console.log(
            "Current user role:",
            currentUserRole
        );


        // ==================================================
        // CHECK SELLER OR ADMIN
        // ==================================================

        if (
            currentUserRole !== "seller" &&
            currentUserRole !== "admin"
        ) {

            alert(
                "Access denied. Sellers and admins only."
            );


            window.location.href =
                "index.html";


            return false;

        }


        // ==================================================
        // DISPLAY WELCOME MESSAGE
        // ==================================================

        if (sellerWelcomeText) {

            sellerWelcomeText.textContent =
                "Welcome, " +
                (
                    profile.full_name ||
                    currentUser.email
                ) +
                "!";

        }


        console.log(
            "Dashboard access granted."
        );


        return true;


    } catch (error) {

        console.error(
            "Access check error:",
            error
        );


        window.location.href =
            "login.html";


        return false;

    }

}


// ==================================================
// ADD NEW PRODUCT
// ==================================================

if (addProductForm) {

    addProductForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // ==================================================
            // CHECK USER
            // ==================================================

            if (!currentUser) {

                alert(
                    "You must be logged in."
                );

                return;

            }


            // ==================================================
            // GET FORM VALUES
            // ==================================================

            const productName =
                document.getElementById(
                    "productName"
                ).value.trim();


            const productCategory =
                document.getElementById(
                    "productCategory"
                ).value;


            const productPrice =
                Number(
                    document.getElementById(
                        "productPrice"
                    ).value
                );


            const productStock =
                Number(
                    document.getElementById(
                        "productStock"
                    ).value
                );


            const productImage =
                document.getElementById(
                    "productImage"
                ).value.trim();


            // ==================================================
            // VALIDATION
            // ==================================================

            if (
                !productName ||
                !productCategory ||
                !productImage
            ) {

                if (productStatus) {

                    productStatus.textContent =
                        "Please complete all fields.";

                }

                return;

            }


            if (
                productPrice < 0 ||
                productStock < 0
            ) {

                if (productStatus) {

                    productStatus.textContent =
                        "Price and stock cannot be negative.";

                }

                return;

            }


            // ==================================================
            // SHOW STATUS
            // ==================================================

            if (productStatus) {

                productStatus.textContent =
                    "Adding product...";

            }


            // ==================================================
            // INSERT PRODUCT
            // ==================================================

            const {
                error
            } =
                await supabaseClient
                    .from("products")
                    .insert([

                        {

                            name:
                                productName,

                            category:
                                productCategory,

                            price:
                                productPrice,

                            stock:
                                productStock,

                            image_url:
                                productImage,

                            seller_id:
                                currentUser.id

                        }

                    ]);


            // ==================================================
            // CHECK ERROR
            // ==================================================

            if (error) {

                console.error(
                    "Product insert error:",
                    error
                );


                if (productStatus) {

                    productStatus.textContent =
                        "Failed to add product: " +
                        error.message;

                }


                return;

            }


            // ==================================================
            // SUCCESS
            // ==================================================

            console.log(
                "Product added successfully!"
            );


            if (productStatus) {

                productStatus.textContent =
                    "Product added successfully!";

            }


            // ==================================================
            // RESET FORM
            // ==================================================

            addProductForm.reset();


            // ==================================================
            // RELOAD PRODUCTS
            // ==================================================

            await loadSellerProducts();

        }
    );

}


// ==================================================
// LOAD SELLER PRODUCTS
// ==================================================

async function loadSellerProducts() {

    if (!sellerProductList) {

        return;

    }


    if (productsStatus) {

        productsStatus.textContent =
            "Loading your products...";

    }


    sellerProductList.innerHTML =
        "";


    try {

        // ==================================================
        // BUILD QUERY
        // ==================================================

        let query =
            supabaseClient
                .from("products")
                .select("*")
                .order(
                    "id",
                    {
                        ascending: false
                    }
                );


        // ==================================================
        // SELLER ONLY
        // ==================================================

        if (
            currentUserRole ===
            "seller"
        ) {

            query =
                query.eq(
                    "seller_id",
                    currentUser.id
                );

        }


        // ==================================================
        // EXECUTE QUERY
        // ==================================================

        const {
            data: products,
            error
        } =
            await query;


        // ==================================================
        // ERROR
        // ==================================================

        if (error) {

            console.error(
                "Product loading error:",
                error
            );


            if (productsStatus) {

                productsStatus.textContent =
                    "Error loading products: " +
                    error.message;

            }


            return;

        }


        // ==================================================
        // NO PRODUCTS
        // ==================================================

        if (
            !products ||
            products.length === 0
        ) {

            if (productsStatus) {

                productsStatus.textContent =
                    "You have no products yet.";

            }


            sellerProductList.innerHTML = `

                <div class="empty-products">

                    <p>
                        No products found.
                    </p>

                </div>

            `;


            return;

        }


        // ==================================================
        // PRODUCTS FOUND
        // ==================================================

        if (productsStatus) {

            productsStatus.textContent =
                `Found ${products.length} product(s).`;

        }


        // ==================================================
        // DISPLAY PRODUCTS
        // ==================================================

        products.forEach(
            function(product) {

                createSellerProductCard(
                    product
                );

            }
        );


    } catch (error) {

        console.error(
            "Unexpected product error:",
            error
        );


        if (productsStatus) {

            productsStatus.textContent =
                "Something went wrong while loading products.";

        }

    }

}


// ==================================================
// CREATE PRODUCT CARD
// ==================================================

function createSellerProductCard(
    product
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "seller-product-card";


    card.innerHTML = `

        <img
            src="${escapeHTML(
                product.image_url ||
                ""
            )}"
            alt="${escapeHTML(
                product.name ||
                "Product"
            )}"
        >


        <div class="seller-product-info">

            <h3>

                ${escapeHTML(
                    product.name ||
                    "Unnamed Product"
                )}

            </h3>


            <p>

                Category:
                ${escapeHTML(
                    product.category ||
                    "N/A"
                )}

            </p>


            <p>

                Price:
                ₱${Number(
                    product.price ||
                    0
                ).toLocaleString()}

            </p>


            <p>

                Stock:
                ${Number(
                    product.stock ||
                    0
                )}

            </p>


            <button
                class="deleteProductBtn"
                data-product-id="${product.id}"
                type="button"
            >

                Delete Product

            </button>

        </div>

    `;


    sellerProductList.appendChild(
        card
    );

}


// ==================================================
// DELETE PRODUCT
// ==================================================

document.addEventListener(
    "click",
    async function(event) {


        // ==================================================
        // CHECK DELETE BUTTON
        // ==================================================

        if (
            !event.target.classList.contains(
                "deleteProductBtn"
            )
        ) {

            return;

        }


        // ==================================================
        // GET PRODUCT ID
        // ==================================================

        const productId =
            event.target.dataset.productId;


        // ==================================================
        // CONFIRM DELETE
        // ==================================================

        const confirmed =
            confirm(
                "Are you sure you want to delete this product?"
            );


        if (!confirmed) {

            return;

        }


        // ==================================================
        // DISABLE BUTTON
        // ==================================================

        event.target.disabled =
            true;


        event.target.textContent =
            "Deleting...";


        try {

            // ==================================================
            // DELETE PRODUCT
            // ==================================================

            let deleteQuery =
                supabaseClient
                    .from("products")
                    .delete()
                    .eq(
                        "id",
                        productId
                    );


            // ==================================================
            // SELLER CAN DELETE OWN PRODUCTS ONLY
            // ==================================================

            if (
                currentUserRole ===
                "seller"
            ) {

                deleteQuery =
                    deleteQuery.eq(
                        "seller_id",
                        currentUser.id
                    );

            }


            // ==================================================
            // EXECUTE DELETE
            // ==================================================

            const {
                error
            } =
                await deleteQuery;


            // ==================================================
            // CHECK ERROR
            // ==================================================

            if (error) {

                console.error(
                    "Delete product error:",
                    error
                );


                alert(
                    "Failed to delete product: " +
                    error.message
                );


                event.target.disabled =
                    false;


                event.target.textContent =
                    "Delete Product";


                return;

            }


            // ==================================================
            // SUCCESS
            // ==================================================

            alert(
                "Product deleted successfully!"
            );


            await loadSellerProducts();


        } catch (error) {

            console.error(
                "Unexpected delete error:",
                error
            );


            alert(
                "Something went wrong while deleting the product."
            );


            event.target.disabled =
                false;


            event.target.textContent =
                "Delete Product";

        }

    }
);


// ==================================================
// LOAD SELLER ORDERS
// ==================================================

async function loadSellerOrders() {

    if (sellerStatus) {

        sellerStatus.textContent =
            "Loading customer orders...";

    }


    if (sellerOrderList) {

        sellerOrderList.innerHTML =
            "";

    }


    try {

        // ==================================================
        // GET ALL ORDERS
        // ==================================================

        const {
            data: orders,
            error: ordersError
        } =
            await supabaseClient
                .from("orders")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        // ==================================================
        // CHECK ORDER ERROR
        // ==================================================

        if (ordersError) {

            console.error(
                "Order loading error:",
                ordersError
            );


            if (sellerStatus) {

                sellerStatus.textContent =
                    "Error loading orders: " +
                    ordersError.message;

            }


            return;

        }


        // ==================================================
        // NO ORDERS
        // ==================================================

        if (
            !orders ||
            orders.length === 0
        ) {

            if (sellerStatus) {

                sellerStatus.textContent =
                    "No customer orders yet.";

            }


            if (sellerOrderList) {

                sellerOrderList.innerHTML = `

                    <p>
                        There are currently no customer orders.
                    </p>

                `;

            }


            return;

        }


        // ==================================================
        // ADMIN CAN SEE ALL ORDERS
        // ==================================================

        if (
            currentUserRole ===
            "admin"
        ) {

            if (sellerStatus) {

                sellerStatus.textContent =
                    `Found ${orders.length} customer order(s).`;

            }


            for (
                const order of orders
            ) {

                await createSellerOrderCard(
                    order
                );

            }


            return;

        }


        // ==================================================
        // SELLER ORDER FILTERING
        // ==================================================

        const sellerOrders = [];


        for (
            const order of orders
        ) {

            // ==================================================
            // GET ORDER ITEMS
            // ==================================================

            const {
                data: orderItems,
                error: itemsError
            } =
                await supabaseClient
                    .from("order_items")
                    .select("*")
                    .eq(
                        "order_id",
                        order.id
                    );


            // ==================================================
            // CHECK ORDER ITEMS ERROR
            // ==================================================

            if (itemsError) {

                console.error(
                    "Order items error:",
                    itemsError
                );

                continue;

            }


            // ==================================================
            // CHECK EACH ORDER ITEM
            // ==================================================

            for (
                const item of orderItems || []
            ) {

                // ==================================================
                // GET PRODUCT
                // ==================================================

                const {
                    data: product,
                    error: productError
                } =
                    await supabaseClient
                        .from("products")
                        .select(
                            "seller_id"
                        )
                        .eq(
                            "id",
                            item.product_id
                        )
                        .maybeSingle();


                // ==================================================
                // CHECK PRODUCT ERROR
                // ==================================================

                if (productError) {

                    console.error(
                        "Product lookup error:",
                        productError
                    );

                    continue;

                }


                // ==================================================
                // CHECK SELLER ID
                // ==================================================

                if (
                    product &&
                    product.seller_id ===
                    currentUser.id
                ) {

                    sellerOrders.push(
                        order
                    );

                    break;

                }

            }

        }


        // ==================================================
        // NO SELLER ORDERS
        // ==================================================

        if (
            sellerOrders.length === 0
        ) {

            if (sellerStatus) {

                sellerStatus.textContent =
                    "You have no customer orders yet.";

            }


            if (sellerOrderList) {

                sellerOrderList.innerHTML = `

                    <p>
                        No customer orders found for your products.
                    </p>

                `;

            }


            return;

        }


        // ==================================================
        // DISPLAY SELLER ORDERS
        // ==================================================

        if (sellerStatus) {

            sellerStatus.textContent =
                `Found ${sellerOrders.length} customer order(s).`;

        }


        for (
            const order of sellerOrders
        ) {

            await createSellerOrderCard(
                order
            );

        }


    } catch (error) {

        console.error(
            "Unexpected seller order error:",
            error
        );


        if (sellerStatus) {

            sellerStatus.textContent =
                "Something went wrong while loading seller orders.";

        }

    }

}


// ==================================================
// CREATE ORDER CARD
// ==================================================

async function createSellerOrderCard(
    order
) {

    // ==================================================
    // GET ORDER ITEMS
    // ==================================================

    const {
        data: orderItems,
        error
    } =
        await supabaseClient
            .from("order_items")
            .select("*")
            .eq(
                "order_id",
                order.id
            );


    if (error) {

        console.error(
            "Order items error:",
            error
        );

        return;

    }


    // ==================================================
    // CREATE CARD
    // ==================================================

    const orderCard =
        document.createElement(
            "div"
        );


    orderCard.className =
        "seller-order-card";


    // ==================================================
    // FORMAT DATE
    // ==================================================

    const orderDate =
        order.created_at
            ? new Date(
                order.created_at
            ).toLocaleString()
            : "Unknown date";


    // ==================================================
    // CREATE PRODUCTS HTML
    // ==================================================

    let itemsHTML =
        "";


    if (
        orderItems &&
        orderItems.length > 0
    ) {

        orderItems.forEach(
            function(item) {

                itemsHTML += `

                    <div class="seller-order-item">

                        <strong>

                            ${escapeHTML(
                                item.product_name ||
                                "Unknown Product"
                            )}

                        </strong>


                        <span>

                            Quantity:
                            ${Number(
                                item.quantity ||
                                0
                            )}

                        </span>


                        <span>

                            Price:
                            ₱${Number(
                                item.price ||
                                0
                            ).toLocaleString()}

                        </span>

                    </div>

                `;

            }
        );

    }

    else {

        itemsHTML = `

            <p>
                No products found.
            </p>

        `;

    }


    // ==================================================
    // ORDER STATUS
    // ==================================================

    const orderStatus =
        order.status ||
        "Pending";


    // ==================================================
    // ORDER TOTAL
    // ==================================================

    const orderTotal =
        Number(
            order.total_amount ||
            0
        );


    // ==================================================
    // CREATE CARD HTML
    // ==================================================

    orderCard.innerHTML = `

        <div class="seller-order-header">

            <h3>

                Order #${escapeHTML(
                    order.id
                )}

            </h3>


            <p>

                Date:
                ${escapeHTML(
                    orderDate
                )}

            </p>

        </div>


        <div class="seller-customer-info">

            <h4>
                Customer Information
            </h4>


            <p>

                <strong>
                    Name:
                </strong>

                ${escapeHTML(
                    order.customer_name ||
                    "Not provided"
                )}

            </p>


            <p>

                <strong>
                    Email:
                </strong>

                ${escapeHTML(
                    order.customer_email ||
                    "Not provided"
                )}

            </p>


            <p>

                <strong>
                    Phone:
                </strong>

                ${escapeHTML(
                    order.customer_phone ||
                    "Not provided"
                )}

            </p>


            <p>

                <strong>
                    Address:
                </strong>

                ${escapeHTML(
                    order.customer_address ||
                    "Not provided"
                )}

            </p>

        </div>


        <div class="seller-order-products">

            <h4>
                Ordered Products
            </h4>


            ${itemsHTML}

        </div>


        <div class="seller-order-total">

            <strong>
                Total:
            </strong>

            ₱${orderTotal.toLocaleString()}

        </div>


        <div class="seller-order-status">

            <strong>
                Order Status:
            </strong>


            <select
                class="sellerStatusSelect"
                data-order-id="${order.id}"
            >

                <option
                    value="Pending"
                    ${
                        orderStatus ===
                        "Pending"
                            ? "selected"
                            : ""
                    }
                >
                    Pending
                </option>


                <option
                    value="Processing"
                    ${
                        orderStatus ===
                        "Processing"
                            ? "selected"
                            : ""
                    }
                >
                    Processing
                </option>


                <option
                    value="Shipped"
                    ${
                        orderStatus ===
                        "Shipped"
                            ? "selected"
                            : ""
                    }
                >
                    Shipped
                </option>


                <option
                    value="Completed"
                    ${
                        orderStatus ===
                        "Completed"
                            ? "selected"
                            : ""
                    }
                >
                    Completed
                </option>


                <option
                    value="Cancelled"
                    ${
                        orderStatus ===
                        "Cancelled"
                            ? "selected"
                            : ""
                    }
                >
                    Cancelled
                </option>

            </select>

        </div>

    `;


    if (sellerOrderList) {

        sellerOrderList.appendChild(
            orderCard
        );

    }

}


// ==================================================
// UPDATE ORDER STATUS
// ==================================================

document.addEventListener(
    "change",
    async function(event) {


        if (
            !event.target.classList.contains(
                "sellerStatusSelect"
            )
        ) {

            return;

        }


        const orderId =
            event.target.dataset.orderId;


        const newStatus =
            event.target.value;


        event.target.disabled =
            true;


        try {

            const {
                error
            } =
                await supabaseClient
                    .from("orders")
                    .update({

                        status:
                            newStatus

                    })
                    .eq(
                        "id",
                        orderId
                    );


            if (error) {

                console.error(
                    "Status update error:",
                    error
                );


                alert(
                    "Failed to update order status: " +
                    error.message
                );


                event.target.disabled =
                    false;

                return;

            }


            console.log(
                "Order status updated:",
                orderId,
                newStatus
            );


            alert(
                "Order status updated successfully!"
            );


        } catch (error) {

            console.error(
                "Unexpected status error:",
                error
            );


            alert(
                "Something went wrong while updating the order."
            );

        }


        event.target.disabled =
            false;

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


            logoutBtn.textContent =
                "Logging out...";


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
                        "Logout failed: " +
                        error.message
                    );


                    logoutBtn.disabled =
                        false;


                    logoutBtn.textContent =
                        "Logout";


                    return;

                }


                window.location.href =
                    "login.html";


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


                logoutBtn.textContent =
                    "Logout";

            }

        }
    );

}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value
        );


    return div.innerHTML;

}


// ==================================================
// START SELLER DASHBOARD
// ==================================================

async function startSellerDashboard() {

    console.log(
        "Starting seller dashboard..."
    );


    // ==================================================
    // CHECK ACCESS
    // ==================================================

    const hasAccess =
        await checkSellerAccess();


    if (!hasAccess) {

        return;

    }


    // ==================================================
    // LOAD PRODUCTS
    // ==================================================

    await loadSellerProducts();


    // ==================================================
    // LOAD ORDERS
    // ==================================================

    await loadSellerOrders();


    console.log(
        "Seller dashboard loaded successfully."
    );

}


// ==================================================
// START
// ==================================================

startSellerDashboard();


// ==================================================
// END
// ==================================================

console.log(
    "seller.js loaded successfully."
);