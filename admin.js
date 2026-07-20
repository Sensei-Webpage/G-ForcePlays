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

    // ==========================
// CHECK ADMIN LOGIN
// ==========================

async function checkAdminLogin() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();


    if (
        error ||
        !data.user
    ) {

        window.location.href =
            "login.html";

        return;

    }

}


// Check login

checkAdminLogin();

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


    let productList =
        document.getElementById(
            "adminProductList"
        );


    productList.innerHTML = "";


    data.forEach(
        function(product) {

            let productCard =
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


// Load products
loadAdminProducts();


// ==========================
// ADD PRODUCT
// ==========================

let addProductForm =
    document.getElementById(
        "addProductForm"
    );


addProductForm.addEventListener(
    "submit",
    async function(event) {

        // Prevent page refresh

        event.preventDefault();


        // ==========================
        // GET PRODUCT INFORMATION
        // ==========================

        let name =
            document.getElementById(
                "productName"
            ).value;


        let price =
            Number(
                document.getElementById(
                    "productPrice"
                ).value
            );


        let category =
            document.getElementById(
                "productCategory"
            ).value;


        // ==========================
        // GET IMAGE FILE
        // ==========================

        let imageFile =
            document.getElementById(
                "productImage"
            ).files[0];


        // Check if image was selected

        if (!imageFile) {

            document.getElementById(
                "productStatus"
            ).innerHTML =
                "Please select a product image.";

            return;

        }


        // ==========================
        // SHOW UPLOADING MESSAGE
        // ==========================

        document.getElementById(
            "productStatus"
        ).innerHTML =
            "Uploading product image...";


        // ==========================
        // CREATE UNIQUE FILE NAME
        // ==========================

        let fileName =
            Date.now() +
            "_" +
            imageFile.name;


        // ==========================
        // UPLOAD IMAGE
        // ==========================

        const {
            error: uploadError
        } = await supabaseClient
            .storage
            .from("product-images")
            .upload(
                fileName,
                imageFile
            );


        // Check upload error

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
        // GET IMAGE URL
        // ==========================

        const {
            data: imageData
        } = supabaseClient
            .storage
            .from("product-images")
            .getPublicUrl(
                fileName
            );


        let imageUrl =
            imageData.publicUrl;


        // ==========================
        // SAVE PRODUCT TO DATABASE
        // ==========================

        document.getElementById(
            "productStatus"
        ).innerHTML =
            "Saving product...";


        const {
            error
        } = await supabaseClient
            .from("products")
            .insert([

                {

                    name: name,

                    price: price,

                    category: category,

                    image_url: imageUrl

                }

            ]);


        // ==========================
        // CHECK DATABASE ERROR
        // ==========================

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


        // Clear form

        addProductForm.reset();


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
            event.target.classList.contains(
                "deleteProductBtn"
            )
        ) {

            let productId =
                event.target.dataset.id;


            // Confirm deletion

            let confirmDelete =
                confirm(
                    "Are you sure you want to delete this product?"
                );


            if (!confirmDelete) {

                return;

            }


            // Delete product

            const {
                error
            } = await supabaseClient
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

                return;

            }


            // Reload products

            loadAdminProducts();

        }

    }
);

// ==========================
// LOGOUT
// ==========================

let logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


logoutBtn.addEventListener(
    "click",
    async function() {

        await supabaseClient.auth.signOut();


        window.location.href =
            "login.html";

    }
);

// ==========================
// EDIT PRODUCT
// ==========================

document.addEventListener(
    "click",
    async function(event) {

        if (
            event.target.classList.contains(
                "editProductBtn"
            )
        ) {

            // Get product ID

            let productId =
                event.target.dataset.id;


            // Get product from Supabase

            const {
                data: product,
                error
            } = await supabaseClient
                .from("products")
                .select("*")
                .eq(
                    "id",
                    productId
                )
                .single();


            // Check error

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


            document.getElementById(
                "editProductImage"
            ).value =
                product.image_url;


            // Scroll to edit form

            document
                .getElementById(
                    "editProductSection"
                )
                .scrollIntoView({

                    behavior: "smooth"

                });

        }

    }
);

// ==========================
// SAVE EDITED PRODUCT
// ==========================

let editProductForm =
    document.getElementById(
        "editProductForm"
    );


editProductForm.addEventListener(
    "submit",
    async function(event) {

        // Stop page refresh

        event.preventDefault();


        // Get values

        let productId =
            document.getElementById(
                "editProductId"
            ).value;


        let name =
            document.getElementById(
                "editProductName"
            ).value;


        let price =
            Number(
                document.getElementById(
                    "editProductPrice"
                ).value
            );


        let category =
            document.getElementById(
                "editProductCategory"
            ).value;


        let imageUrl =
            document.getElementById(
                "editProductImage"
            ).value;


        // Update product

        const {
            error
        } = await supabaseClient
            .from("products")
            .update({

                name: name,

                price: price,

                category: category,

                image_url: imageUrl

            })
            .eq(
                "id",
                productId
            );


        // Check error

        if (error) {

            console.error(
                "Update product error:",
                error
            );


            document.getElementById(
                "editProductStatus"
            ).innerHTML =
                "Error updating product.";

            return;

        }


        // Success

        document.getElementById(
            "editProductStatus"
        ).innerHTML =
            "Product updated successfully!";


        // Clear form

        editProductForm.reset();


        // Reload products

        loadAdminProducts();

    }
);

// ==========================
// CANCEL EDIT
// ==========================

let cancelEditBtn =
    document.getElementById(
        "cancelEditBtn"
    );


cancelEditBtn.addEventListener(
    "click",
    function() {

        editProductForm.reset();

        document.getElementById(
            "editProductStatus"
        ).innerHTML = "";

    }
);