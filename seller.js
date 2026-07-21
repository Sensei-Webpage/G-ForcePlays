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

console.log(
    "Seller Supabase connected!"
);


// ==========================
// GET ELEMENTS
// ==========================

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


// ==========================
// CHECK SELLER ACCESS
// ==========================

async function checkSellerAccess() {

    // Get current session

    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();


    // Session error

    if (error) {

        console.error(
            "Session error:",
            error
        );

        window.location.href =
            "login.html";

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


    // ==========================
    // GET PROFILE
    // ==========================

    const {
        data: profile,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select("role")
            .eq(
                "id",
                session.user.id
            )
            .single();


    // Profile error

    if (profileError) {

        console.error(
            "Profile error:",
            profileError
        );

        window.location.href =
            "index.html";

        return false;

    }


    // ==========================
    // CHECK SELLER ROLE
    // ==========================

    if (
        profile.role !==
        "seller"
    ) {

        alert(
            "Access denied. Sellers only."
        );

        window.location.href =
            "index.html";

        return false;

    }


    // ==========================
    // SELLER VERIFIED
    // ==========================

    console.log(
        "Seller access granted."
    );

    return true;

}


// ==========================
// LOAD ORDERS
// ==========================

async function loadSellerOrders() {

    sellerStatus.innerHTML =
        "Loading orders...";


    // Get orders

    const {
        data: orders,
        error
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


    // Check error

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


    // Check empty

    if (
        !orders ||
        orders.length === 0
    ) {

        sellerStatus.innerHTML =
            "No customer orders yet.";

        sellerOrderList.innerHTML =
            "";

        return;

    }


    sellerStatus.innerHTML =
        "Customer orders:";


    sellerOrderList.innerHTML =
        "";


    // ==========================
    // LOAD EACH ORDER
    // ==========================

    for (
        const order of orders
    ) {


        // Get order items

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


        if (itemsError) {

            console.error(
                "Order items error:",
                itemsError
            );

            continue;

        }


        // Create card

        const orderCard =
            document.createElement(
                "div"
            );


        orderCard.className =
            "seller-order-card";


        // Format date

        const orderDate =
            new Date(
                order.created_at
            ).toLocaleString();


        // Items HTML

        let itemsHTML =
            "";


        orderItems.forEach(
            function(item) {

                itemsHTML += `

                    <div class="seller-order-item">

                        <strong>
                            ${item.product_name}
                        </strong>

                        <span>
                            Quantity:
                            ${item.quantity}
                        </span>

                        <span>
                            ₱${Number(
                                item.price
                            ).toLocaleString()}
                        </span>

                    </div>

                `;

            }
        );


        // Create order card

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
                    ${order.customer_name}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${order.customer_email}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${order.customer_phone}
                </p>

                <p>
                    <strong>Address:</strong>
                    ${order.customer_address}
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

                ₱${Number(
                    order.total_amount
                ).toLocaleString()}

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
                        ${order.status === "Pending" ? "selected" : ""}
                    >
                        Pending
                    </option>

                    <option
                        value="Processing"
                        ${order.status === "Processing" ? "selected" : ""}
                    >
                        Processing
                    </option>

                    <option
                        value="Shipped"
                        ${order.status === "Shipped" ? "selected" : ""}
                    >
                        Shipped
                    </option>

                    <option
                        value="Completed"
                        ${order.status === "Completed" ? "selected" : ""}
                    >
                        Completed
                    </option>

                    <option
                        value="Cancelled"
                        ${order.status === "Cancelled" ? "selected" : ""}
                    >
                        Cancelled
                    </option>

                </select>

            </div>

        `;


        sellerOrderList.appendChild(
            orderCard
        );

    }

}


// ==========================
// UPDATE ORDER STATUS
// ==========================

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


        // Disable while saving

        event.target.disabled =
            true;


        // Update database

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


        // Check error

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
                "Logout failed."
            );

            return;

        }


        window.location.href =
            "login.html";

    }
);


// ==========================
// START SELLER DASHBOARD
// ==========================

async function startSellerDashboard() {

    const hasAccess =
        await checkSellerAccess();


    if (!hasAccess) {

        return;

    }


    await loadSellerOrders();

}


startSellerDashboard();