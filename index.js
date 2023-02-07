let cartList = [];
let cartId = 1;
let canvas;

const setList = async () => {

    try{
        const res = await axios("https://run.mocky.io/v3/2f79c808-aa5f-4e46-a1e3-f52a4e2f7e2f");
        const menu = res.data.product;
        $(".menuItem").each(function(i) {
            const listItem = $(this);
            if(i < menu.length) {
                listItem.children(".name").text(menu[i].name);
                listItem.children(".price").text(`$${menu[i].price}`);
            }
        })

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

            cartList.push({cartId: cartId++, name, price});

            updateCart();
        })

    } catch(e) {
        throw new Error(e);
    }

}

$(document).ready(function() {
    setList();
});

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

            // console.log(itemToRemove.attr("id"), idToRemove);

            cartList = cartList.filter(food => food.cartId !== idToRemove);

            updateCart();
        })

        const listItem = $(`<li id=food${food.cartId}></li>`);

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

function setup() {
    const myCanvas = createCanvas(windowWidth / 2 - 50, windowWidth / 2);
    myCanvas.parent("#canvas");
}

function draw() {
    translate(width / 2, height / 2);
    translate(0, - height / 3);
    rotate(QUARTER_PI * 3.95);
    topBun();
}

function topBun() {
    fill(255);
    arc(0, 0, width / 5, width/ 5, 0, PI + QUARTER_PI / 10, CHORD);
};