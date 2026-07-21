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

console.log("Admin Supabase connected!");


// ==========================
// ADMIN ACCESS PROTECTION
// ==========================

async function checkAdminAccess() {

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();


    // Session error

    if (error) {

        console.error(
            "Session error:",
            error
        );

        window.location.href =
            "login.html";

        return;

    }


    const session =
        data.session;


    // ==========================
    // NOT LOGGED IN
    // ==========================

    if (!session) {

        alert(
            "You must log in to access the admin dashboard."
        );

        window.location.href =
            "login.html";

        return;

    }


    // ==========================
    // GET USER PROFILE
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

        alert(
            "Your account profile could not be found."
        );

        window.location.href =
            "index.html";

        return;

    }


    // ==========================
    // CHECK ADMIN ROLE
    // ==========================

    if (
        profile.role !==
        "admin"
    ) {

        alert(
            "Access denied. Admins only."
        );

        window.location.href =
            "index.html";

        return;

    }


    // ==========================
    // ADMIN VERIFIED
    // ==========================

    console.log(
        "Admin access granted."
    );


    // Load products only after
    // admin is verified

    loadAdminProducts();

}


// ==========================
// LOAD PRODUCTS
// ==========================

async function loadAdminProducts() {

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

        return;

    }


    const productList =
        document.getElementById(
            "adminProductList"
        );


    productList.innerHTML =
        "";


    // Check if no products

    if (
        !data ||
        data.length === 0
    ) {

        productList.innerHTML =
            "<p>No products found.</p>";

        return;

    }


    // Display products

    data.forEach(
        function(product) {

            const productCard =
                document.createElement(
                    "div"
                );


            productCard.className =
                "admin-product-card";


            productCard.innerHTML = `

                <img
                    src="${product.image_url}"
                    alt="${product.name}"
                >

                <h3>
                    ${product.name}
                </h3>

                <p>
                    Category:
                    ${product.category}
                </p>

                <p>
                    ₱${Number(
                        product.price
                    ).toLocaleString()}
                </p>

                <button
                    class="editProductBtn"
                    data-id="${product.id}"
                >
                    Edit
                </button>

                <button
                    class="deleteProductBtn"
                    data-id="${product.id}"
                >
                    Delete
                </button>

            `;


            productList.appendChild(
                productCard
            );

        }
    );

}


// ==========================
// ADD PRODUCT
// ==========================

const addProductForm =
    document.getElementById(
        "addProductForm"
    );


addProductForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        // Get product information

        const name =
            document.getElementById(
                "productName"
            ).value.trim();


        const price =
            Number(
                document.getElementById(
                    "productPrice"
                ).value
            );


        const category =
            document.getElementById(
                "productCategory"
            ).value;


        // Get image

        const imageFile =
            document.getElementById(
                "productImage"
            ).files[0];


        // Check image

        if (!imageFile) {

            document.getElementById(
                "productStatus"
            ).innerHTML =
                "Please select a product image.";

            return;

        }


        // Show status

        document.getElementById(
            "productStatus"
        ).innerHTML =
            "Uploading product image...";


        // ==========================
        // CREATE UNIQUE FILE NAME
        // ==========================

        const fileName =
            Date.now() +
            "_" +
            imageFile.name;


        // ==========================
        // UPLOAD IMAGE
        // ==========================

        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from("product-images")
                .upload(
                    fileName,
                    imageFile
                );


        // Upload error

        if (uploadError) {

            console.error(
                "Image upload error:",
                uploadError
            );

            document.getElementById(
                "productStatus"
            ).innerHTML =
                "Image upload failed: " +
                uploadError.message;

            return;

        }


        // ==========================
        // GET PUBLIC IMAGE URL
        // ==========================

        const {
            data: imageData
        } =
            supabaseClient
                .storage
                .from("product-images")
                .getPublicUrl(
                    fileName
                );


        const imageUrl =
            imageData.publicUrl;


        // ==========================
        // SAVE PRODUCT
        // ==========================

        document.getElementById(
            "productStatus"
        ).innerHTML =
            "Saving product...";


        const {
            error
        } =
            await supabaseClient
                .from("products")
                .insert([

                    {

                        name:
                            name,

                        price:
                            price,

                        category:
                            category,

                        image_url:
                            imageUrl

                    }

                ]);


        // Database error

        if (error) {

            console.error(
                "Add product error:",
                error
            );

            document.getElementById(
                "productStatus"
            ).innerHTML =
                "Error adding product: " +
                error.message;

            return;

        }


        // ==========================
        // SUCCESS
        // ==========================

        document.getElementById(
            "productStatus"
        ).innerHTML =
            "Product added successfully!";


        addProductForm.reset();


        // Reload product list

        loadAdminProducts();

    }
);


// ==========================
// EDIT PRODUCT
// ==========================

document.addEventListener(
    "click",
    async function(event) {

        if (
            !event.target.classList.contains(
                "editProductBtn"
            )
        ) {

            return;

        }


        const productId =
            event.target.dataset.id;


        // Get product

        const {
            data: product,
            error
        } =
            await supabaseClient
                .from("products")
                .select("*")
                .eq(
                    "id",
                    productId
                )
                .single();


        if (error) {

            console.error(
                "Error loading product:",
                error
            );

            return;

        }


        // Fill edit form

        document.getElementById(
            "editProductId"
        ).value =
            product.id;


        document.getElementById(
            "editProductName"
        ).value =
            product.name;


        document.getElementById(
            "editProductPrice"
        ).value =
            product.price;


        document.getElementById(
            "editProductCategory"
        ).value =
            product.category;


        // IMPORTANT:
        // Do NOT set value of file input


        // Scroll to edit section

        document
            .getElementById(
                "editProductSection"
            )
            .scrollIntoView({

                behavior:
                    "smooth"

            });

    }
);


// ==========================
// SAVE EDITED PRODUCT
// ==========================

const editProductForm =
    document.getElementById(
        "editProductForm"
    );


editProductForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        // Get product ID

        const productId =
            document.getElementById(
                "editProductId"
            ).value;


        // Get values

        const name =
            document.getElementById(
                "editProductName"
            ).value.trim();


        const price =
            Number(
                document.getElementById(
                    "editProductPrice"
                ).value
            );


        const category =
            document.getElementById(
                "editProductCategory"
            ).value;


        // Get optional new image

        const imageFile =
            document.getElementById(
                "editProductImage"
            ).files[0];


        const editStatus =
            document.getElementById(
                "editProductStatus"
            );


        editStatus.innerHTML =
            "Updating product...";


        // ==========================
        // UPDATE WITHOUT IMAGE
        // ==========================

        if (!imageFile) {

            const {
                error
            } =
                await supabaseClient
                    .from("products")
                    .update({

                        name:
                            name,

                        price:
                            price,

                        category:
                            category

                    })
                    .eq(
                        "id",
                        productId
                    );


            if (error) {

                console.error(
                    "Update product error:",
                    error
                );

                editStatus.innerHTML =
                    "Error updating product: " +
                    error.message;

                return;

            }

        }


        // ==========================
        // UPDATE WITH NEW IMAGE
        // ==========================

        else {

            editStatus.innerHTML =
                "Uploading new image...";


            const fileName =
                Date.now() +
                "_" +
                imageFile.name;


            const {
                error: uploadError
            } =
                await supabaseClient
                    .storage
                    .from("product-images")
                    .upload(
                        fileName,
                        imageFile
                    );


            if (uploadError) {

                console.error(
                    "Image upload error:",
                    uploadError
                );

                editStatus.innerHTML =
                    "Image upload failed: " +
                    uploadError.message;

                return;

            }


            // Get new image URL

            const {
                data: imageData
            } =
                supabaseClient
                    .storage
                    .from("product-images")
                    .getPublicUrl(
                        fileName
                    );


            const imageUrl =
                imageData.publicUrl;


            // Update product

            const {
                error
            } =
                await supabaseClient
                    .from("products")
                    .update({

                        name:
                            name,

                        price:
                            price,

                        category:
                            category,

                        image_url:
                            imageUrl

                    })
                    .eq(
                        "id",
                        productId
                    );


            if (error) {

                console.error(
                    "Update product error:",
                    error
                );

                editStatus.innerHTML =
                    "Error updating product: " +
                    error.message;

                return;

            }

        }


        // ==========================
        // SUCCESS
        // ==========================

        editStatus.innerHTML =
            "Product updated successfully!";


        editProductForm.reset();


        // Reload products

        loadAdminProducts();

    }
);


// ==========================
// DELETE PRODUCT
// ==========================

document.addEventListener(
    "click",
    async function(event) {

        if (
            !event.target.classList.contains(
                "deleteProductBtn"
            )
        ) {

            return;

        }


        const productId =
            event.target.dataset.id;


        // Confirm deletion

        const confirmDelete =
            confirm(
                "Are you sure you want to delete this product?"
            );


        if (!confirmDelete) {

            return;

        }


        // Show deleting

        event.target.innerHTML =
            "Deleting...";


        event.target.disabled =
            true;


        // Delete product

        const {
            error
        } =
            await supabaseClient
                .from("products")
                .delete()
                .eq(
                    "id",
                    productId
                );


        if (error) {

            console.error(
                "Delete product error:",
                error
            );

            alert(
                "Error deleting product: " +
                error.message
            );

            event.target.innerHTML =
                "Delete";

            event.target.disabled =
                false;

            return;

        }


        // Success

        loadAdminProducts();

    }
);


// ==========================
// CANCEL EDIT
// ==========================

const cancelEditBtn =
    document.getElementById(
        "cancelEditBtn"
    );


cancelEditBtn.addEventListener(
    "click",
    function() {

        editProductForm.reset();

        document.getElementById(
            "editProductStatus"
        ).innerHTML =
            "";

    }
);


// ==========================
// LOGOUT
// ==========================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


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
                "Logout failed: " +
                error.message
            );

            return;

        }


        window.location.href =
            "login.html";

    }
);


// ==========================
// START ADMIN DASHBOARD
// ==========================

checkAdminAccess();

// ==========================
// LOAD CUSTOMER ORDERS
// ==========================

async function loadAdminOrders() {

    const orderList =
        document.getElementById(
            "adminOrderList"
        );


    // Show loading

    orderList.innerHTML =
        "<p>Loading orders...</p>";


    // ==========================
    // GET ORDERS
    // ==========================

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


    // Check error

    if (ordersError) {

        console.error(
            "Error loading orders:",
            ordersError
        );

        orderList.innerHTML =
            "<p>Error loading orders: " +
            ordersError.message +
            "</p>";

        return;

    }


    // ==========================
    // CHECK EMPTY ORDERS
    // ==========================

    if (
        !orders ||
        orders.length === 0
    ) {

        orderList.innerHTML =
            "<p>No customer orders yet.</p>";

        return;

    }


    // Clear order list

    orderList.innerHTML =
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


        // Check items error

        if (itemsError) {

            console.error(
                "Error loading order items:",
                itemsError
            );

            continue;

        }


        // ==========================
        // CREATE ORDER CARD
        // ==========================

        const orderCard =
            document.createElement(
                "div"
            );


        orderCard.className =
            "admin-order-card";


        // ==========================
        // FORMAT DATE
        // ==========================

        let orderDate =
            new Date(
                order.created_at
            ).toLocaleString();


        // ==========================
        // ORDER ITEMS HTML
        // ==========================

        let itemsHTML =
            "";


        orderItems.forEach(
            function(item) {

                itemsHTML += `

                    <div class="admin-order-item">

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


        // ==========================
        // ORDER CARD HTML
        // ==========================

        orderCard.innerHTML = `

            <div class="admin-order-header">

                <h3>
                    Order #${order.id}
                </h3>

                <p>
                    Date:
                    ${orderDate}
                </p>

            </div>


            <div class="admin-customer-info">

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


            <div class="admin-order-products">

                <h4>
                    Ordered Products
                </h4>

                ${itemsHTML}

            </div>


           <div class="admin-order-total">

    <strong>
        Total:
    </strong>

    ₱${Number(
        order.total_amount
    ).toLocaleString()}

</div>


<!-- ==========================
     ORDER STATUS
========================== -->

<div class="admin-order-status">

    <strong>
        Order Status:
    </strong>

    <select
        class="orderStatusSelect"
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


        // Add order to dashboard

        orderList.appendChild(
            orderCard
        );

    }

}


// ==========================
// LOAD ORDERS
// ==========================

loadAdminOrders();

// ==========================
// UPDATE ORDER STATUS
// ==========================

document.addEventListener(
    "change",
    async function(event) {

        // Check if order status was changed

        if (
            !event.target.classList.contains(
                "orderStatusSelect"
            )
        ) {

            return;

        }


        // Get order ID

        const orderId =
            event.target.dataset.orderId;


        // Get new status

        const newStatus =
            event.target.value;


        // Show updating status

        event.target.disabled =
            true;


        // Update Supabase

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
                "Order status update error:",
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


        // Success

        console.log(
            "Order status updated:",
            orderId,
            newStatus
        );


        event.target.disabled =
            false;

    }
);