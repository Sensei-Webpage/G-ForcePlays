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

console.log("Orders Supabase connected!");


// ==========================
// GET ELEMENTS
// ==========================

const ordersStatus =
    document.getElementById("ordersStatus");

const myOrdersList =
    document.getElementById("myOrdersList");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================
// LOAD CUSTOMER ORDERS
// ==========================

async function loadMyOrders() {

    console.log("Loading customer orders...");

    // Show loading message

    if (ordersStatus) {
        ordersStatus.textContent =
            "Loading your orders...";
    }


    // ==========================
    // GET CURRENT USER
    // ==========================

    const {
        data: userData,
        error: userError
    } =
        await supabaseClient.auth.getUser();


    // ==========================
    // CHECK USER
    // ==========================

    if (
        userError ||
        !userData ||
        !userData.user
    ) {

        console.error(
            "User error:",
            userError
        );

        window.location.href =
            "login.html";

        return;

    }


    // Current logged-in user

    const user =
        userData.user;

    console.log(
        "Current customer:",
        user.email
    );


    // ==========================
    // LOAD ORDERS
    // ==========================

    const {
        data: orders,
        error: ordersError
    } =
        await supabaseClient
            .from("orders")
            .select("*")
            .eq(
                "customer_email",
                user.email
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    // ==========================
    // CHECK ORDER ERROR
    // ==========================

    if (ordersError) {

        console.error(
            "Orders loading error:",
            ordersError
        );

        if (ordersStatus) {

            ordersStatus.textContent =
                "Unable to load your orders.";

        }

        return;

    }


    // ==========================
    // NO ORDERS
    // ==========================

    if (
        !orders ||
        orders.length === 0
    ) {

        if (ordersStatus) {

            ordersStatus.textContent =
                "You have not placed any orders yet.";

        }

        if (myOrdersList) {

            myOrdersList.innerHTML =
                "";

        }

        return;

    }


    // ==========================
    // ORDERS FOUND
    // ==========================

    if (ordersStatus) {

        ordersStatus.textContent =
            "Here are your orders:";

    }


    if (myOrdersList) {

        myOrdersList.innerHTML =
            "";

    }


    // ==========================
    // LOOP THROUGH ORDERS
    // ==========================

    for (
        const order of orders
    ) {


        // ==========================
        // GET ORDER ITEMS
        // ==========================

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


        // ==========================
        // CHECK ITEMS ERROR
        // ==========================

        if (itemsError) {

            console.error(
                "Order items error:",
                itemsError
            );

        }


        // ==========================
        // CREATE ORDER CARD
        // ==========================

        const orderCard =
            document.createElement("div");


        orderCard.className =
            "my-order-card";


        // ==========================
        // FORMAT DATE
        // ==========================

        const orderDate =
            order.created_at
                ? new Date(
                    order.created_at
                ).toLocaleString()
                : "Date unavailable";


        // ==========================
        // ORDER STATUS
        // ==========================

        const orderStatus =
            order.status ||
            "Pending";


        // ==========================
        // CREATE PRODUCTS HTML
        // ==========================

        let itemsHTML =
            "";


        if (
            orderItems &&
            orderItems.length > 0
        ) {

            orderItems.forEach(
                function(item) {

                    const productName =
                        item.product_name ||
                        "Unknown Product";

                    const quantity =
                        item.quantity ||
                        0;

                    const price =
                        Number(
                            item.price || 0
                        );


                    itemsHTML += `

                        <div class="my-order-item">

                            <strong>
                                ${productName}
                            </strong>

                            <span>
                                Quantity:
                                ${quantity}
                            </span>

                            <span>
                                ₱${price.toLocaleString()}
                            </span>

                        </div>

                    `;

                }
            );

        } else {

            itemsHTML = `

                <p>
                    No products found for this order.
                </p>

            `;

        }


        // ==========================
        // ORDER TOTAL
        // ==========================

        const totalAmount =
            Number(
                order.total_amount || 0
            );


        // ==========================
        // CREATE ORDER CARD
        // ==========================

        orderCard.innerHTML = `

            <div class="my-order-header">

                <h3>
                    Order #${order.id}
                </h3>

                <p>
                    ${orderDate}
                </p>

            </div>


            <div class="my-order-status">

                <strong>
                    Status:
                </strong>

                <span>
                    ${orderStatus}
                </span>

            </div>


            <div class="my-order-products">

                <h4>
                    Products
                </h4>

                ${itemsHTML}

            </div>


            <div class="my-order-total">

                <strong>
                    Total:
                </strong>

                ₱${totalAmount.toLocaleString()}

            </div>

        `;


        // ==========================
        // ADD ORDER TO PAGE
        // ==========================

        if (myOrdersList) {

            myOrdersList.appendChild(
                orderCard
            );

        }

    }

}


// ==========================
// LOGOUT
// ==========================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function() {

            console.log(
                "Logging out..."
            );


            const {
                error
            } =
                await supabaseClient.auth.signOut();


            // ==========================
            // CHECK LOGOUT ERROR
            // ==========================

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


            // ==========================
            // REDIRECT TO LOGIN
            // ==========================

            window.location.href =
                "login.html";

        }
    );

}


// ==========================
// START ORDERS PAGE
// ==========================

loadMyOrders();