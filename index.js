let cartList = [];
let id = 1;

$(document).ready(function() {
    $("#cart").click(function(e) {
        e.preventDefault();
        const cartContent = $(this).children("#cartContent");

        if(cartContent.css("display") === "none") {
            cartContent.css("display", "block");
        } else {
            cartContent.css("display", "none");
        }
    })

    $(".addBtn").click(function() {
        const thisMenu = $(this).parent();
        const name = thisMenu.children(".name").text();
        const price = parseInt(thisMenu.children(".price").text().replace(/\$/, ''));

        cartList.push({id: id++, name, price});

        updateCart();
    })
})

function updateCart() {
    const cart = $("#cartContent");
    const newList = $("<ul></ul>");
    let total = 0;

    if(cartList.length === 0) {cart.html("<div>Are you hungry?<br/>Make your own burger!</div>"); return};
    
    for(let food of cartList) {
        const itemName = $("<div></div").text(`${food.name}`);
        const itemPrice = $("<span></span>").text(`${food.price}`);
        const removeBnt = $("<button></button>").text("Remove");
        
        total += food.price;

        removeBnt.click(function(e) {
            e.stopPropagation();
            const itemToRemove = $(this).parentsUntil("ul");
            const idToRemove = parseInt(itemToRemove.attr("id").replace("food", ""));

            cartList = cartList.filter(food => food.id !== idToRemove);

            updateCart();
        })

        const listItem = $(`<li id=food${food.id}></li>`);

        listItem.append(itemName);
        listItem.append(itemPrice);
        listItem.append(removeBnt);

        listItem.css({
            "border": "black solid",
            "margin": "0"
        });

        newList.append(listItem);

        newList.css({
            "display": "flex",
            "flex-direction": "column",
            "justify-content": "center",
            "margin": "0",
            "padding": "0"
        });
    }

    cart.html(newList);

    const totalEle = $("<div></div>").text(`Tatal: $${total}`);
    const byNowBtn = $("<button class='buyNowBtn'></button>").text("Buy Now");
    const clearBtn = $("<button></button>").text("Clear");

    byNowBtn.click(function(e) {
        e.stopPropagation();
    });
    clearBtn.click(function(e) {
        e.stopPropagation();

        cartList = [];
        updateCart();
    })

    cart.append(totalEle);
    cart.append(byNowBtn);
    cart.append(clearBtn);
}