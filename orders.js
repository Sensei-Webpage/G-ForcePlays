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
    "My Orders Supabase connected!"
);


// ==================================================
// DOM ELEMENTS
// ==================================================

const ordersStatus =
    document.getElementById(
        "ordersStatus"
    );

const myOrdersList =
    document.getElementById(
        "myOrdersList"
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
// CHECK USER LOGIN
// ==================================================

async function checkUserLogin() {

    console.log(
        "Checking user login..."
    );


    try {

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


            if (ordersStatus) {

                ordersStatus.textContent =
                    "Unable to verify your login.";

            }


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
        // USER NOT LOGGED IN
        // ==================================================

        if (!session) {

            alert(
                "You must log in to view your orders."
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


        return true;


    } catch (error) {

        console.error(
            "Login check error:",
            error
        );


        window.location.href =
            "login.html";


        return false;

    }

}


// ==================================================
// LOAD MY ORDERS
// ==================================================

async function loadMyOrders() {

    if (!currentUser) {

        return;

    }


    // ==================================================
    // SHOW LOADING
    // ==================================================

    if (ordersStatus) {

        ordersStatus.textContent =
            "Loading your orders...";

    }


    if (myOrdersList) {

        myOrdersList.innerHTML =
            "";

    }


    try {

        // ==================================================
        // GET CUSTOMER EMAIL
        // ==================================================

        const customerEmail =
            currentUser.email;


        console.log(
            "Loading orders for:",
            customerEmail
        );


        // ==================================================
        // GET ORDERS
        // ==================================================

        const {
            data: orders,
            error
        } =
            await supabaseClient
                .from("orders")
                .select("*")
                .eq(
                    "customer_email",
                    customerEmail
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        // ==================================================
        // CHECK ERROR
        // ==================================================

        if (error) {

            console.error(
                "Orders loading error:",
                error
            );


            if (ordersStatus) {

                ordersStatus.textContent =
                    "Error loading your orders: " +
                    error.message;

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

            if (ordersStatus) {

                ordersStatus.textContent =
                    "You have no orders yet.";

            }


            if (myOrdersList) {

                myOrdersList.innerHTML = `

                    <div class="no-orders">

                        <h3>
                            No Orders Found
                        </h3>

                        <p>
                            You have not placed any orders yet.
                        </p>

                        <a href="index.html">
                            Start Shopping
                        </a>

                    </div>

                `;

            }


            return;

        }


        // ==================================================
        // ORDERS FOUND
        // ==================================================

        if (ordersStatus) {

            ordersStatus.textContent =
                `Found ${orders.length} order(s).`;

        }


        // ==================================================
        // LOAD EACH ORDER
        // ==================================================

        for (
            const order of orders
        ) {

            await createOrderCard(
                order
            );

        }


    } catch (error) {

        console.error(
            "Unexpected orders error:",
            error
        );


        if (ordersStatus) {

            ordersStatus.textContent =
                "Something went wrong while loading your orders.";

        }

    }

}


// ==================================================
// CREATE ORDER CARD
// ==================================================

async function createOrderCard(
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


    // ==================================================
    // CHECK ITEMS ERROR
    // ==================================================

    if (error) {

        console.error(
            "Order items error:",
            error
        );

        return;

    }


    // ==================================================
    // CREATE ORDER CARD
    // ==================================================

    const orderCard =
        document.createElement(
            "div"
        );


    orderCard.className =
        "my-order-card";


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
    // CREATE ITEMS HTML
    // ==================================================

    let itemsHTML =
        "";


    if (
        orderItems &&
        orderItems.length > 0
    ) {

        orderItems.forEach(
            function(item) {

                const itemTotal =
                    Number(
                        item.price ||
                        0
                    ) *
                    Number(
                        item.quantity ||
                        0
                    );


                itemsHTML += `

                    <div class="my-order-item">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    item.product_name ||
                                    "Unknown Product"
                                )}
                            </strong>

                        </div>


                        <div>

                            Quantity:
                            ${Number(
                                item.quantity ||
                                0
                            )}

                        </div>


                        <div>

                            Price:
                            ₱${Number(
                                item.price ||
                                0
                            ).toLocaleString()}

                        </div>


                        <div>

                            Subtotal:
                            ₱${itemTotal.toLocaleString()}

                        </div>

                    </div>

                `;

            }
        );

    }

    else {

        itemsHTML = `

            <p>
                No products found for this order.
            </p>

        `;

    }


    // ==================================================
    // CREATE ORDER CARD
    // ==================================================

    orderCard.innerHTML = `

        <div class="my-order-header">

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


        <div class="my-order-products">

            <h4>
                Ordered Products
            </h4>


            ${itemsHTML}

        </div>


        <div class="my-order-total">

            <strong>
                Total:
            </strong>


            ₱${orderTotal.toLocaleString()}

        </div>


        <div class="my-order-status">

            <strong>
                Order Status:
            </strong>


            <span
                class="status-badge status-${orderStatus.toLowerCase()}"
            >

                ${escapeHTML(
                    orderStatus
                )}

            </span>

        </div>

    `;


    // ==================================================
    // ADD CARD TO PAGE
    // ==================================================

    if (myOrdersList) {

        myOrdersList.appendChild(
            orderCard
        );

    }

}


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


                // ==================================================
                // REDIRECT
                // ==================================================

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
// START MY ORDERS PAGE
// ==================================================

async function startMyOrdersPage() {

    console.log(
        "Starting My Orders page..."
    );


    // ==================================================
    // CHECK LOGIN
    // ==================================================

    const isLoggedIn =
        await checkUserLogin();


    if (!isLoggedIn) {

        return;

    }


    // ==================================================
    // LOAD ORDERS
    // ==================================================

    await loadMyOrders();


    console.log(
        "My Orders page loaded successfully."
    );

}


// ==================================================
// START
// ==================================================

startMyOrdersPage();


// ==================================================
// END
// ==================================================

console.log(
    "orders.js loaded successfully."
);