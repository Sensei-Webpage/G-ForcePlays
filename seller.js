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

console.log("Seller Supabase connected!");


// ==========================
// GET ELEMENTS
// ==========================

const sellerStatus =
    document.getElementById("sellerStatus");

const sellerOrderList =
    document.getElementById("sellerOrderList");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================
// CHECK SELLER ACCESS
// ==========================

async function checkSellerAccess() {

    try {

        // Get current session

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();


        // Check session error

        if (error) {

            console.error(
                "Session error:",
                error
            );

            window.location.href = "login.html";

            return false;
        }


        // Get session

        const session =
            data.session;


        // ==========================
        // NOT LOGGED IN
        // ==========================

        if (!session) {

            alert(
                "You must log in to access the seller dashboard."
            );

            window.location.href =
                "login.html";

            return false;
        }


        console.log(
            "Logged in user:",
            session.user.email
        );


        // ==========================
        // GET USER PROFILE
        // ==========================

        const {
            data: profile,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select("role")
            .eq(
                "id",
                session.user.id
            )
            .single();


        // Check profile error

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


        console.log(
            "User role:",
            profile.role
        );


        // ==========================
        // CHECK SELLER ROLE
        // ==========================

        if (
            profile.role !== "seller"
        ) {

            alert(
                "Access denied. Sellers only."
            );

            window.location.href =
                "index.html";

            return false;
        }


        // ==========================
        // SELLER ACCESS GRANTED
        // ==========================

        console.log(
            "Seller access granted."
        );

        return true;

    } catch (error) {

        console.error(
            "Seller access error:",
            error
        );

        window.location.href =
            "login.html";

        return false;
    }

}


// ==========================
// LOAD CUSTOMER ORDERS
// ==========================

async function loadSellerOrders() {

    sellerStatus.innerHTML =
        "Loading customer orders...";

    sellerOrderList.innerHTML =
        "";


    try {

        // ==========================
        // GET ORDERS
        // ==========================

        const {
            data: orders,
            error
        } = await supabaseClient
            .from("orders")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        // ==========================
        // CHECK ORDER ERROR
        // ==========================

        if (error) {

            console.error(
                "Order loading error:",
                error
            );

            sellerStatus.innerHTML =
                "Error loading orders: " +
                error.message;

            return;
        }


        // ==========================
        // NO ORDERS
        // ==========================

        if (
            !orders ||
            orders.length === 0
        ) {

            sellerStatus.innerHTML =
                "No customer orders yet.";

            sellerOrderList.innerHTML = `
                <p>
                    There are currently no customer orders.
                </p>
            `;

            return;
        }


        // ==========================
        // ORDERS FOUND
        // ==========================

        sellerStatus.innerHTML =
            `Found ${orders.length} customer order(s).`;


        // ==========================
        // LOAD EACH ORDER
        // ==========================

        for (
            const order of orders
        ) {

            await createSellerOrderCard(
                order
            );

        }

    } catch (error) {

        console.error(
            "Unexpected order error:",
            error
        );

        sellerStatus.innerHTML =
            "Something went wrong while loading orders.";

    }

}


// ==========================
// CREATE SELLER ORDER CARD
// ==========================

async function createSellerOrderCard(
    order
) {

    // ==========================
    // GET ORDER ITEMS
    // ==========================

    const {
        data: orderItems,
        error: itemsError
    } = await supabaseClient
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

        return;
    }


    // ==========================
    // CREATE CARD
    // ==========================

    const orderCard =
        document.createElement(
            "div"
        );

    orderCard.className =
        "seller-order-card";


    // ==========================
    // FORMAT DATE
    // ==========================

    const orderDate =
        new Date(
            order.created_at
        ).toLocaleString();


    // ==========================
    // CREATE ITEMS HTML
    // ==========================

    let itemsHTML = "";


    if (
        orderItems &&
        orderItems.length > 0
    ) {

        orderItems.forEach(
            function(item) {

                const itemPrice =
                    Number(
                        item.price || 0
                    );


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
                            ${item.quantity || 0}
                        </span>

                        <span>
                            ₱${itemPrice.toLocaleString()}
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
    // ORDER STATUS
    // ==========================

    const orderStatus =
        order.status ||
        "Pending";


    // ==========================
    // ORDER TOTAL
    // ==========================

    const orderTotal =
        Number(
            order.total_amount || 0
        );


    // ==========================
    // CREATE ORDER CARD HTML
    // ==========================

    orderCard.innerHTML = `

        <div class="seller-order-header">

            <h3>
                Order #${order.id}
            </h3>

            <p>
                Date:
                ${orderDate}
            </p>

        </div>


        <div class="seller-customer-info">

            <h4>
                Customer Information
            </h4>

            <p>
                <strong>Name:</strong>
                ${escapeHTML(
                    order.customer_name ||
                    "Not provided"
                )}
            </p>

            <p>
                <strong>Email:</strong>
                ${escapeHTML(
                    order.customer_email ||
                    "Not provided"
                )}
            </p>

            <p>
                <strong>Phone:</strong>
                ${escapeHTML(
                    order.customer_phone ||
                    "Not provided"
                )}
            </p>

            <p>
                <strong>Address:</strong>
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
                    ${orderStatus === "Pending"
                        ? "selected"
                        : ""}
                >
                    Pending
                </option>


                <option
                    value="Processing"
                    ${orderStatus === "Processing"
                        ? "selected"
                        : ""}
                >
                    Processing
                </option>


                <option
                    value="Shipped"
                    ${orderStatus === "Shipped"
                        ? "selected"
                        : ""}
                >
                    Shipped
                </option>


                <option
                    value="Completed"
                    ${orderStatus === "Completed"
                        ? "selected"
                        : ""}
                >
                    Completed
                </option>


                <option
                    value="Cancelled"
                    ${orderStatus === "Cancelled"
                        ? "selected"
                        : ""}
                >
                    Cancelled
                </option>

            </select>

        </div>

    `;


    // ==========================
    // ADD CARD TO PAGE
    // ==========================

    sellerOrderList.appendChild(
        orderCard
    );

}


// ==========================
// UPDATE ORDER STATUS
// ==========================

document.addEventListener(
    "change",
    async function(event) {

        // Check if status dropdown

        if (
            !event.target.classList.contains(
                "sellerStatusSelect"
            )
        ) {

            return;
        }


        // ==========================
        // GET ORDER ID
        // ==========================

        const orderId =
            event.target.dataset.orderId;


        // ==========================
        // GET NEW STATUS
        // ==========================

        const newStatus =
            event.target.value;


        // ==========================
        // DISABLE DROPDOWN
        // ==========================

        event.target.disabled =
            true;


        try {

            // ==========================
            // UPDATE DATABASE
            // ==========================

            const {
                error
            } = await supabaseClient
                .from("orders")
                .update({
                    status: newStatus
                })
                .eq(
                    "id",
                    orderId
                );


            // ==========================
            // CHECK ERROR
            // ==========================

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


            // ==========================
            // SUCCESS
            // ==========================

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


        // ==========================
        // ENABLE DROPDOWN
        // ==========================

        event.target.disabled =
            false;

    }
);


// ==========================
// LOGOUT
// ==========================

logoutBtn.addEventListener(
    "click",
    async function() {

        // Disable button

        logoutBtn.disabled =
            true;

        logoutBtn.innerHTML =
            "Logging out...";


        try {

            // Sign out

            const {
                error
            } = await supabaseClient.auth.signOut();


            // Check error

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

                logoutBtn.innerHTML =
                    "Logout";

                return;
            }


            // ==========================
            // REDIRECT
            // ==========================

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

            logoutBtn.innerHTML =
                "Logout";

        }

    }
);


// ==========================
// ESCAPE HTML
// ==========================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(value);

    return div.innerHTML;

}


// ==========================
// START SELLER DASHBOARD
// ==========================

async function startSellerDashboard() {

    console.log(
        "Starting seller dashboard..."
    );


    // Check seller access

    const hasAccess =
        await checkSellerAccess();


    // Stop if access denied

    if (!hasAccess) {

        return;
    }


    // Load orders

    await loadSellerOrders();

}


// ==========================
// START
// ==========================

startSellerDashboard();