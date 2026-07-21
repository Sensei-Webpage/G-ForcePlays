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

console.log("Supabase login connected!");


// ==========================
// LOGIN FORM
// ==========================

const loginForm =
    document.getElementById("loginForm");

const loginStatus =
    document.getElementById("loginStatus");


// ==========================
// LOGIN
// ==========================

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        // Get email

        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim();


        // Get password

        const password =
            document
                .getElementById("loginPassword")
                .value;


        // Show status

        loginStatus.innerHTML =
            "Logging in...";


        // ==========================
        // SUPABASE LOGIN
        // ==========================

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        // Check login error

        if (error) {

            console.error(
                "Login error:",
                error
            );

            loginStatus.innerHTML =
                error.message;

            return;

        }


        console.log(
            "User logged in:",
            data.user
        );


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
                .eq("id", data.user.id)
                .single();


        // Check profile error

        if (profileError) {

            console.error(
                "Profile error:",
                profileError
            );

            loginStatus.innerHTML =
                "Login successful, but your account profile could not be found.";

            return;

        }


        // Get role

        const userRole = profile.role;

console.log("PROFILE:", profile);
console.log("USER ROLE:", userRole);

alert("Your role is: " + userRole);


// ==========================
// REDIRECT BY ROLE
// ==========================

console.log("FINAL USER ROLE:", userRole);

if (userRole === "admin") {

    console.log(
        "Admin detected. Redirecting to admin dashboard..."
    );

    window.location.href = "admin.html";

}
else if (userRole === "seller") {

    console.log(
        "Seller detected. Redirecting to seller dashboard..."
    );

    window.location.href = "seller.html";

}
else {

    console.log(
        "Customer detected. Redirecting to store..."
    );

    window.location.href = "index.html";

}

});