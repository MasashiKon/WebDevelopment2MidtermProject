$(document).ready(function() {
    $("#cart").click(function(e) {
        e.preventDefault();
        const cartContent = $(this).children("#cartContent");

        if(cartContent.css("display") === "block") {
            cartContent.css("display", "none");
        } else {
            cartContent.css("display", "block");
        }
        
    })
})

