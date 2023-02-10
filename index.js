let cartList = [];
let cartId = 1;
let buns = {isOrdered: false, type: null};
let isBought = false;
let burgerFixed = false;
let burgerHeight = [];
let gap = 0;
let animCount = 1;
let topBunFrame = 1;
let burgerCount = 1;

const setList = async () => {

    try{
        const res = await axios("https://run.mocky.io/v3/2f79c808-aa5f-4e46-a1e3-f52a4e2f7e2f");
        const menu = res.data.product;
        $(".menuItem").each(function(i) {
            const listItem = $(this);
            listItem.attr("class", `${menu[i].type}`);
            if(i < menu.length) {
                listItem.children(".name").text(menu[i].name);
                listItem.children(".price").text(`$${menu[i].price}`);
            }
            listItem.css("padding", "10px")
        });

        $("#cart").click(function(e) {
            e.preventDefault();
            const cartContent = $(this).children("#cartContent");

            if(cartContent.css("display") === "none") {
                cartContent.css("display", "block");
            } else {
                cartContent.css("display", "none");
            }
        });

        $(".addBtn").click(function() {

            const thisMenu = $(this).parent();
            const name = thisMenu.children(".name").text();
            const price = parseInt(thisMenu.children(".price").text().replace(/\$/, ''));
            
            if(!(cartList.some(orderItem => orderItem.type === "bun") && thisMenu.attr("class") === "bun")) {
    
                const itemToPush = {cartId: cartId++, name, price, type: thisMenu.attr("class")};

                cartList.push(itemToPush);

            } else {
                const idToDelete = cartList.findIndex(orderItem => orderItem.type === "bun");

                if(!(cartList[idToDelete].name === name)) {

                    cartList = cartList.filter((orderItem, i) => i !== idToDelete);

                    const itemToPush = {cartId: cartId++, name, price, type: thisMenu.attr("class")};
    
                    cartList.push(itemToPush);

                }
            }

            updateCart();

        });

        $(".makeItBurgerBtn").click(function() {
            if(burgerFixed) {
                burgerFixed = false;
                $(this).text("Make it Burger");
                gap = 0;
                animCount = 1;
                topBunFrame = 1;
                $(".addBtn").removeAttr('disabled');
                $(".addToCartBtn").css("visibility", "hidden");
            } else {
                burgerFixed = true;
                $(this).text("Try Another Burger");
                $(".addBtn").attr('disabled','disabled');
                $(".addToCartBtn").css("visibility", "visible");
            }
        });

        $(".addToCartBtn").click(function() {
            if(cartList.filter(food => food.type !== "burger").length > 0) {
                const name = `Your Burger${burgerCount++}`
                const price = cartList.reduce((pre, crr) => pre += crr.price, 0);
                const type = "burger";
    
                cartList.push({cartId: cartId++, name, price, type});

                cartList = cartList.filter(food => food.type === "burger");

                updateCart();

                $(this).css("visibility", "hidden");
            }
        });

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

    const updateBun = cartList.find(orderItem => orderItem.type === "bun");
    if(updateBun) {
        buns.isOrdered = true;
        buns.type = updateBun.name;
    } else {
        buns.isOrdered = false;
        buns.type = null;
    }

    if(cartList.length === 0) {cart.html("<div>Are you hungry?<br/>Make your own burger!</div>"); return};
    
    for(let food of cartList) {

        const itemName = $("<div></div").text(`${food.name}`);
        const itemPrice = $("<span></span>").text(`$${food.price}`);
        const removeBnt = $("<button></button>").text("Remove");
        
        total += food.price;

        removeBnt.click(function(e) {
            e.stopPropagation();
            const itemToRemove = $(this).parentsUntil("ul");
            const idToRemove = parseInt(itemToRemove.attr("id").replace("food", ""));

            cartList = cartList.filter(food => food.cartId !== idToRemove);

            updateCart();
        })

        const listItem = $(`<li id=food${food.cartId}></li>`);

        listItem.append(itemName);
        listItem.append(itemPrice);
        listItem.append("<br/>");
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

        isBought = true;
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
    background(255);
    fill(0);
    textSize(20);
    text(`$${cartList.reduce((pre, crr) => {
        if(crr.type === "burger") return pre;
        return pre += crr.price;
    }, 0)}`, width / 10, width  / 10);
    translate(width / 2, 0);
    bottomBun();
    rectMode(CENTER);
    const availableArea = buns.isOrdered ? height - height / 4 : height;
    const numOfFoods = buns.isOrdered ? cartList.length - 1 : cartList.length;
    let burgerType;
    const foodList = cartList.filter(orderItem => {
        if(orderItem.type === "bun") burgerType = orderItem.name;
        return orderItem.type !== "bun" && orderItem.type !== "burger";
    });
    if(burgerFixed) {
        if(gap > 0) {
            gap -= animCount++;
        } else {
            gap = 0;
            if(topBunFrame > 0) {
                const subVal = 0.1;
                if(topBunFrame - subVal < 0) {
                    topBunFrame = 0;
                } else {
                    topBunFrame -= subVal;
                };
            } else {
                topBunFrame = 0;
            };
        }
    } else {
        gap = availableArea / (numOfFoods + 1);
    }
    let foodHeight = 0;
    for(let i = 0; i < foodList.length; i++) {
        if(i === 0) {
            switch(foodList[i].type) {
                case "patty":
                    foodHeight += width / 40;      
                    if(gap < width / 40) {
                        patty(gap + foodHeight, foodList[i].name);
                    } else {
                        patty(gap * (i + 1), foodList[i].name); 
                    }
                    if(i === foodList.length - 1) {
                        foodHeight += width / 40;
                    }
                    break;
                case "vegetable":
                    foodHeight += width / 60;      
                    if(gap < width / 60) {
                        vegetable(gap + foodHeight, foodList[i].name);
                    } else {
                        vegetable(gap * (i + 1), foodList[i].name); 
                    }
                    if(i === foodList.length - 1) {
                        foodHeight += width / 60;
                    }
                    break;
                case "option":
                    foodHeight += width / 80;      
                    if(gap < width / 80) {
                        option(gap + foodHeight, foodList[i].name);
                    } else {
                        option(gap * (i + 1), foodList[i].name); 
                    }
                    if(i === foodList.length - 1) {
                        foodHeight += width / 80;
                    }
                    break;
            }
        } else {
            switch(foodList[i].type) {
                case "patty":
                    switch(foodList[i - 1].type) {
                        case "patty":
                            foodHeight += width / 40;
                            break;
                        case "vegetable":
                            foodHeight += width / 60;
                            break;
                        case "option":
                            foodHeight += width / 80;
                            break;
                    }
                    foodHeight += width / 40;
                    if(gap < width / 40) {
                        patty(gap + foodHeight, foodList[i].name);
                    } else {
                        patty(gap * (i + 1), foodList[i].name); 
                    }
                    if(i === foodList.length - 1) {
                        foodHeight += width / 40;
                    }
                    break;
                case "vegetable":
                    switch(foodList[i - 1].type) {
                        case "patty":
                            foodHeight += width / 40;
                            break;
                        case "vegetable":
                            foodHeight += width / 60;
                            break;
                        case "option":
                            foodHeight += width / 80;
                            break;
                    }
                    foodHeight += width / 60;
                    if(gap < width / 60) {
                        vegetable(gap + foodHeight, foodList[i].name);
                    } else {
                        vegetable(gap * (i + 1), foodList[i].name); 
                    }
                    if(i === foodList.length - 1) {
                        foodHeight += width / 60;
                    }
                    break;
                case "option":
                    switch(foodList[i - 1].type) {
                        case "patty":
                            foodHeight += width / 40;
                            break;
                        case "vegetable":
                            foodHeight += width / 60;
                            break;
                        case "option":
                            foodHeight += width / 80;
                            break;
                    }
                    foodHeight += width / 80;
                    if(gap < width / 80) {
                        option(gap + foodHeight, foodList[i].name);
                    } else {
                        option(gap * (i + 1), foodList[i].name); 
                    }
                    if(i === foodList.length - 1) {
                        foodHeight += width / 80;
                    }
                    break;
            }
        }
    }
    topBun(foodHeight, gap, burgerType);
}

function topBun(foodHeight, gap, type) {
    if(!buns.isOrdered) return;
    const finalHeight = height - foodHeight - width / 10;
    const topBunGap = finalHeight - (height - width / 7 * 6);
    const val = gap <= 0.5 ? finalHeight - topBunGap * topBunFrame - width / 7 / 4 : width/ 7 - width / 7 / 4;
    if(type === "original") {
        fill("#9C7A3E");
        arc(0, gap <= 0.5 ? finalHeight - topBunGap * topBunFrame : width / 7, width / 5, width/ 7, PI, TWO_PI , CHORD);
    } else {
        fill("#9C7A3E");
        arc(0, gap <= 0.5 ? finalHeight - topBunGap * topBunFrame : width / 7, width / 5, width/ 7, PI, TWO_PI , CHORD);
        fill(30);
        translate(0, val);
        angleMode(DEGREES);
        for(let i = 0; i < 50; i++) {
            translate(map(noise(i), 0, 1, -width / 7 / 3, width / 7 / 3), map(noise(100 + i), 0, 1, -width / 7 / 3, width / 7 / 3));
            rotate(6 * i);
            ellipse(0, 0, width / 300, width/ 100); 
            rotate(-6 * i);
            translate(-map(noise(i), 0, 1, -width / 7 / 3, width / 7 / 3), -map(noise(100 + i), 0, 1, -width / 7 / 3, width / 7 / 3));
        }
        angleMode(RADIANS);
        translate(0, -val);
    }

};

function bottomBun() {
    if(!buns.isOrdered) return;
    fill("#9C7A3E");
    arc(0, height - width / 10, width / 5, width / 10, 0, PI, CHORD);
};

function patty(y, type) {
    if(type === "beef") {
        fill(150, 50, 50);
        rect(0, buns.isOrdered ? height - y - width / 10 : height - y, width / 4, width / 20, 10);
    } else if(type === "vegan") {
        fill("#865151");
        rect(0, buns.isOrdered ? height - y - width / 10 : height - y, width / 4, width / 20, 10);
    }
};

function vegetable(y, type) {
    if(type === "tomato") {
        fill("#EE3D3D");
        rect(0, buns.isOrdered ? height - y - width / 10 : height - y, width / 5, width / 30, 2);
    } else if(type === "lettuce") {
        fill("#94DC42");
        rect(0, buns.isOrdered ? height - y - width / 10 : height - y, width / 3, width / 30, 10);
    }
};

function option(y, type) {
    if(type === "cheese") {
        fill("#FFCC33");
        rect(0, buns.isOrdered ? height - y - width / 10 : height - y, width / 4, width / 40, 10);
    } else if(type === "pickle") {
        fill("#4A7321");
        rect(0, buns.isOrdered ? height - y - width / 10 : height - y, width / 10, width / 40, 10);
    }
};