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
    "Orders Supabase connected!"
);


// ==========================
// GET ELEMENTS
// ==========================

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


// ==========================
// LOAD CUSTOMER ORDERS
// ==========================

async function loadMyOrders() {


    // ==========================
    // GET CURRENT USER
    // ==========================

    const {
        data: userData,
        error: userError
    } =
        await supabaseClient.auth.getUser();


    // Check user error

    if (
        userError ||
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


    // Current user

    const user =
        userData.user;


    console.log(
        "Current customer:",
        user
    );


    // ==========================
    // LOAD USER ORDERS
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


    // Check error

    if (ordersError) {

        console.error(
            "Orders error:",
            ordersError
        );

        ordersStatus.innerHTML =
            "Unable to load your orders.";

        return;

    }


    // ==========================
    // NO ORDERS
    // ==========================

    if (
        !orders ||
        orders.length === 0
    ) {

        ordersStatus.innerHTML =
            "You have not placed any orders yet.";

        myOrdersList.innerHTML =
            "";

        return;

    }


    // ==========================
    // ORDERS FOUND
    // ==========================

    ordersStatus.innerHTML =
        "Here are your orders:";


    myOrdersList.innerHTML =
        "";


    // ==========================
    // LOAD EACH ORDER
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
        // CREATE ORDER CARD
        // ==========================

        const orderCard =
            document.createElement(
                "div"
            );


        orderCard.className =
            "my-order-card";


        // ==========================
        // FORMAT DATE
        // ==========================

        const orderDate =
            new Date(
                order.created_at
            ).toLocaleString();


        // ==========================
        // ORDER ITEMS
        // ==========================

        let itemsHTML =
            "";


        if (
            orderItems &&
            orderItems.length > 0
        ) {

            orderItems.forEach(
                function(item) {

                    itemsHTML += `

                        <div class="my-order-item">

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

        }


        // ==========================
        // ORDER STATUS
        // ==========================

        const orderStatus =
            order.status ||
            "Pending";


        // ==========================
        // ORDER CARD
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

                ₱${Number(
                    order.total_amount
                ).toLocaleString()}

            </div>

        `;


        // Add order

        myOrdersList.appendChild(
            orderCard
        );

    }

}


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
// START
// ==========================

loadMyOrders();