// ==========================
// SHOPPING CART
// ==========================

// Stores all purchased product names
let shoppingCart = [];

// Counts the number of items
let total = 0;

// Get the cart counter
let cart = document.getElementById("cartCount");

// Get all Add to Cart buttons
let buttons = document.querySelectorAll(".buyBtn");

// Loop through every button
buttons.forEach(function(button){

    button.addEventListener("click", function(){

        // Find the product card
        let card = button.parentElement;

        // Get product name
        let productName =
        card.querySelector("h3").innerHTML;

        // Get product price
        let productPrice =
        card.querySelector("p").innerHTML;

        // Store product inside array
        shoppingCart.push(productName);

        // Increase cart counter
        total++;

        // Update HTML
        cart.innerHTML = total;

        // Show in console
        console.log("Shopping Cart:");
        console.log(shoppingCart);

        console.log("Added:");
        console.log(productName);
        console.log(productPrice);

    });

});


// ==========================
// DARK MODE
// ==========================

let darkButton =
document.getElementById("darkModeBtn");

darkButton.addEventListener("click", function(){

    document.body.classList.toggle("dark");

});


// ==========================
// SMOOTH SCROLL
// ==========================

let shopButton =
document.getElementById("shopNowBtn");

let products =
document.getElementById("products");

shopButton.addEventListener("click", function(){

    products.scrollIntoView({

        behavior:"smooth"

    });

});


// ==========================
// SEARCH PRODUCTS
// ==========================

let searchBox =
document.getElementById("searchBox");

let cards =
document.querySelectorAll(".card");

searchBox.addEventListener("keyup", function(){

    let search =
    searchBox.value.toLowerCase();

    cards.forEach(function(card){

        let productName =
        card.querySelector("h3")
        .innerHTML
        .toLowerCase();

        if(productName.includes(search)){

            card.style.display = "block";

        }

        else{

            card.style.display = "none";

        }

    });

});

// ==========================
// BANNER SLIDESHOW
// ==========================

let slides =
document.querySelectorAll(".slide");

let dots =
document.querySelectorAll(".dot");

let nextButton =
document.querySelector(".nextBtn");

let prevButton =
document.querySelector(".prevBtn");

let currentSlide = 0;


// SHOW SLIDE FUNCTION

function showSlide(index){

    // Remove active from all slides

    slides.forEach(function(slide){

        slide.classList.remove("active");

    });


    // Remove active from all dots

    dots.forEach(function(dot){

        dot.classList.remove("active");

    });


    // Add active to selected slide

    slides[index].classList.add("active");

    dots[index].classList.add("active");

}


// NEXT BUTTON

nextButton.addEventListener("click", function(){

    currentSlide++;

    if(currentSlide >= slides.length){

        currentSlide = 0;

    }

    showSlide(currentSlide);

});


// PREVIOUS BUTTON

prevButton.addEventListener("click", function(){

    currentSlide--;

    if(currentSlide < 0){

        currentSlide = slides.length - 1;

    }

    showSlide(currentSlide);

});


// DOT BUTTONS

dots.forEach(function(dot, index){

    dot.addEventListener("click", function(){

        currentSlide = index;

        showSlide(currentSlide);

    });

});


// AUTOMATIC SLIDESHOW

setInterval(function(){

    currentSlide++;

    if(currentSlide >= slides.length){

        currentSlide = 0;

    }

    showSlide(currentSlide);

}, 5000);