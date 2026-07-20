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
// LOGIN FORM
// ==========================

let loginForm =
    document.getElementById(
        "loginForm"
    );

let loginStatus =
    document.getElementById(
        "loginStatus"
    );


loginForm.addEventListener(
    "submit",
    async function(event) {

        // Stop page refresh
        event.preventDefault();


        // Get email
        let email =
            document.getElementById(
                "loginEmail"
            ).value;


        // Get password
        let password =
            document.getElementById(
                "loginPassword"
            ).value;


        // Show status
        loginStatus.innerHTML =
            "Logging in...";


        // Login with Supabase

        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


        // Check error

        if (error) {

            console.error(
                "Login error:",
                error
            );


            loginStatus.innerHTML =
                "Invalid email or password.";

            return;

        }


        // Login successful

        loginStatus.innerHTML =
            "Login successful!";


        // Go to admin dashboard

        window.location.href =
            "admin.html";

    }
);