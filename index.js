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
let subCanvasElement;
let pointedBurger = null;

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
                const contents = cartList.filter(food => food.type !== "burger")
                                        .map(food => {
                                            return {type: food.type, name: food.name};
                                        });
    
                cartList.push({cartId: cartId++, name, price, type, contents});

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

        if(food.type === "burger") {
            listItem.hover(() => {
                pointedBurger = food.contents;
                subCanvasElement = new p5(subCanvas);
            }, () => {
                pointedBurger = null;
                subCanvasElement.remove();
            });
        }



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

    const totalEle = $("<div></div>").text(`Total: $${total}`);
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

const mainCanvas = function(sketch) {
    sketch.setup = function() {
        const myCanvas = sketch.createCanvas(sketch.windowWidth / 2 - 50, sketch.windowWidth / 2);
        myCanvas.parent("#canvas");
    }

    sketch.draw = function () {
        sketch.background(255);
        sketch.fill(0);
        sketch.textSize(20);
        sketch.text(`$${cartList.reduce((pre, crr) => {
            if(crr.type === "burger") return pre;
            return pre += crr.price;
        }, 0)}`, sketch.width / 10, sketch.width  / 10);
        sketch.translate(sketch.width / 2, 0);
        bottomBun();
        sketch.rectMode(sketch.CENTER);
        const availableArea = buns.isOrdered ? sketch.height - sketch.height / 4 : sketch.height;
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
                        foodHeight += sketch.width / 40;      
                        if(gap < sketch.width / 40) {
                            patty(gap + foodHeight, foodList[i].name);
                        } else {
                            patty(gap * (i + 1), foodList[i].name); 
                        }
                        if(i === foodList.length - 1) {
                            foodHeight += sketch.width / 40;
                        }
                        break;
                    case "vegetable":
                        foodHeight += sketch.width / 60;      
                        if(gap < sketch.width / 60) {
                            vegetable(gap + foodHeight, foodList[i].name);
                        } else {
                            vegetable(gap * (i + 1), foodList[i].name); 
                        }
                        if(i === foodList.length - 1) {
                            foodHeight += sketch.width / 60;
                        }
                        break;
                    case "option":
                        foodHeight += sketch.width / 80;      
                        if(gap < sketch.width / 80) {
                            option(gap + foodHeight, foodList[i].name);
                        } else {
                            option(gap * (i + 1), foodList[i].name); 
                        }
                        if(i === foodList.length - 1) {
                            foodHeight += sketch.width / 80;
                        }
                        break;
                }
            } else {
                switch(foodList[i].type) {
                    case "patty":
                        switch(foodList[i - 1].type) {
                            case "patty":
                                foodHeight += sketch.width / 40;
                                break;
                            case "vegetable":
                                foodHeight += sketch.width / 60;
                                break;
                            case "option":
                                foodHeight += sketch.width / 80;
                                break;
                        }
                        foodHeight += sketch.width / 40;
                        if(gap < sketch.width / 40) {
                            patty(gap + foodHeight, foodList[i].name);
                        } else {
                            patty(gap * (i + 1), foodList[i].name); 
                        }
                        if(i === foodList.length - 1) {
                            foodHeight += sketch.width / 40;
                        }
                        break;
                    case "vegetable":
                        switch(foodList[i - 1].type) {
                            case "patty":
                                foodHeight += sketch.width / 40;
                                break;
                            case "vegetable":
                                foodHeight += sketch.width / 60;
                                break;
                            case "option":
                                foodHeight += sketch.width / 80;
                                break;
                        }
                        foodHeight += sketch.width / 60;
                        if(gap < sketch.width / 60) {
                            vegetable(gap + foodHeight, foodList[i].name);
                        } else {
                            vegetable(gap * (i + 1), foodList[i].name); 
                        }
                        if(i === foodList.length - 1) {
                            foodHeight += sketch.width / 60;
                        }
                        break;
                    case "option":
                        switch(foodList[i - 1].type) {
                            case "patty":
                                foodHeight += sketch.width / 40;
                                break;
                            case "vegetable":
                                foodHeight += sketch.width / 60;
                                break;
                            case "option":
                                foodHeight += sketch.width / 80;
                                break;
                        }
                        foodHeight += sketch.width / 80;
                        if(gap < sketch.width / 80) {
                            option(gap + foodHeight, foodList[i].name);
                        } else {
                            option(gap * (i + 1), foodList[i].name); 
                        }
                        if(i === foodList.length - 1) {
                            foodHeight += sketch.width / 80;
                        }
                        break;
                }
            }
        }
        topBun(foodHeight, gap, burgerType);
    }

    function topBun(foodHeight, gap, type) {
        if(!buns.isOrdered) return;
        const finalHeight = sketch.height - foodHeight - sketch.width / 10;
        const topBunGap = finalHeight - (sketch.height - sketch.width / 7 * 6);
        const val = gap <= 0.5 ? finalHeight - topBunGap * topBunFrame - sketch.width / 7 / 4 : sketch.width/ 7 - sketch.width / 7 / 4;
        if(type === "original") {
            sketch.fill("#9C7A3E");
            sketch.arc(0, gap <= 0.5 ? finalHeight - topBunGap * topBunFrame : sketch.width / 7, sketch.width / 5, sketch.width/ 7, sketch.PI, sketch.TWO_PI , sketch.CHORD);
        } else {
            sketch.fill("#9C7A3E");
            sketch.arc(0, gap <= 0.5 ? finalHeight - topBunGap * topBunFrame : sketch.width / 7, sketch.width / 5, sketch.width/ 7, sketch.PI, sketch.TWO_PI , sketch.CHORD);
            sketch.fill(30);
            sketch.translate(0, val);
            sketch.angleMode(sketch.DEGREES);
            for(let i = 0; i < 50; i++) {
                sketch.translate(sketch.map(sketch.noise(i), 0, 1, -sketch.width / 7 / 3, sketch.width / 7 / 3), sketch.map(sketch.noise(100 + i), 0, 1, -sketch.width / 7 / 3, sketch.width / 7 / 3));
                sketch.rotate(6 * i);
                sketch.ellipse(0, 0, sketch.width / 300, sketch.width/ 100); 
                sketch.rotate(-6 * i);
                sketch.translate(-sketch.map(sketch.noise(i), 0, 1, -sketch.width / 7 / 3, sketch.width / 7 / 3), -sketch.map(sketch.noise(100 + i), 0, 1, -sketch.width / 7 / 3, sketch.width / 7 / 3));
            }
            sketch.angleMode(sketch.RADIANS);
            sketch.translate(0, -val);
        }
    };
    
    function bottomBun() {
        if(!buns.isOrdered) return;
        sketch.fill("#9C7A3E");
        sketch.arc(0, sketch.height - sketch.width / 10, sketch.width / 5, sketch.width / 10, 0, sketch.PI, sketch.CHORD);
    };
    
    function patty(y, type) {
        if(type === "beef") {
            sketch.fill(150, 50, 50);
            sketch.rect(0, buns.isOrdered ? sketch.height - y - sketch.width / 10 : sketch.height - y, sketch.width / 4, sketch.width / 20, 10);
        } else if(type === "vegan") {
            sketch.fill("#865151");
            sketch.rect(0, buns.isOrdered ? sketch.height - y - sketch.width / 10 : sketch.height - y, sketch.width / 4, sketch.width / 20, 10);
        }
    };
    
    function vegetable(y, type) {
        if(type === "tomato") {
            sketch.fill("#EE3D3D");
            sketch.rect(0, buns.isOrdered ? sketch.height - y - sketch.width / 10 : sketch.height - y, sketch.width / 5, sketch.width / 30, 2);
        } else if(type === "lettuce") {
            sketch.fill("#94DC42");
            sketch.rect(0, buns.isOrdered ? sketch.height - y - sketch.width / 10 : sketch.height - y, sketch.width / 3, sketch.width / 30, 10);
        }
    };
    
    function option(y, type) {
        if(type === "cheese") {
            sketch.fill("#FFCC33");
            sketch.rect(0, buns.isOrdered ? sketch.height - y - sketch.width / 10 : sketch.height - y, sketch.width / 4, sketch.width / 40, 10);
        } else if(type === "pickle") {
            sketch.fill("#4A7321");
            sketch.rect(0, buns.isOrdered ? sketch.height - y - sketch.width / 10 : sketch.height - y, sketch.width / 10, sketch.width / 40, 10);
        }
    };
}

new p5(mainCanvas);

const subCanvas = function(sketch) {
    
    sketch.setup = function() {
        const height = pointedBurger.reduce((acc, crr) => {
            switch(crr.type) {
                case "bun":
                    return acc += sketch.windowWidth / 70 * 17;
                case "patty":
                    return acc += sketch.windowWidth / 20;
                case "vegetable":
                    return acc += sketch.windowWidth / 40;
                case "option":
                    return acc += sketch.windowWidth / 80;
            }
        }, 0); 
        const myCanvas = sketch.createCanvas(sketch.windowWidth / 10, height);
        myCanvas.style("position", "absolute");
        myCanvas.style("left", `-${sketch.mouseX + sketch.width}px`);
        myCanvas.style("top", `${sketch.mouseY}px`);
        myCanvas.parent("#cartContent");
    }

    sketch.draw = function () {
        let height = 0;

        sketch.background(255);
        sketch.translate(sketch.width / 2, 0);
        height += topBun();
        sketch.rectMode(sketch.CENTER);
        if(!pointedBurger.some(food => food.type === "bun")) height += sketch.width / 20;
        for(let i = pointedBurger.length - 1; i >= 0; i--) {
            switch(pointedBurger[i].type) {
                case "patty":
                    height += patty(height, pointedBurger[i].name);
                    break;
                case "vegetable":
                    height += vegetable(height, pointedBurger[i].name);
                    break;
                case "option":
                    height += option(height, pointedBurger[i].name);
                    break;
                default:
                    break;
            }
        }
        bottomBun(height);
        sketch.noLoop();
    }

    function topBun() {
        if(!pointedBurger.some(food => food.type === "bun")) return 0;
        if(pointedBurger.some(food => food.name === "original")) {
            sketch.fill("#9C7A3E");
            sketch.arc(0, sketch.width / 7, sketch.width / 5, sketch.width/ 7, sketch.PI, sketch.TWO_PI , sketch.CHORD);
        } else {
            sketch.fill("#9C7A3E");
            sketch.arc(0, sketch.width / 7, sketch.width / 5, sketch.width/ 7, sketch.PI, sketch.TWO_PI , sketch.CHORD);
            sketch.fill(30);
            sketch.translate(0, sketch.width/ 7 - sketch.width/ 7 / 4);
            sketch.angleMode(sketch.DEGREES);
            for(let i = 0; i < 50; i++) {
                sketch.translate(sketch.map(sketch.noise(i), 0, 1, -sketch.width / 7 / 3, sketch.width / 7 / 3), sketch.map(sketch.noise(100 + i), 0, 1, -sketch.width / 7 / 3, sketch.width / 7 / 3));
                sketch.rotate(6 * i);
                sketch.ellipse(0, 0, sketch.width / 300, sketch.width/ 100); 
                sketch.rotate(-6 * i);
                sketch.translate(-sketch.map(sketch.noise(i), 0, 1, -sketch.width / 7 / 3, sketch.width / 7 / 3), -sketch.map(sketch.noise(100 + i), 0, 1, -sketch.width / 7 / 3, sketch.width / 7 / 3));
            }
            sketch.angleMode(sketch.RADIANS);
            sketch.translate(0, -(sketch.width / 7 - sketch.width/ 7 / 4));
        }
        return sketch.width / 7;
    };
    
    function bottomBun(y) {
        if(!pointedBurger.some(food => food.type === "bun")) return;
        sketch.fill("#9C7A3E");
        let adjustVal  = 0;
        if(pointedBurger[1] !== undefined && pointedBurger[0].type === "bun") {
            switch(pointedBurger[1].type) {
                case "patty":
                    adjustVal = sketch.width / 40;
                    break;
                case "vegetable":
                    adjustVal = sketch.width / 60;
                    break;
                case "option":
                    adjustVal = sketch.width / 80;
                    break;
            }
        } else {
            switch(pointedBurger[0].type) {
                case "patty":
                    adjustVal = sketch.width / 40;
                    break;
                case "vegetable":
                    adjustVal = sketch.width / 60;
                    break;
                case "option":
                    adjustVal = sketch.width / 80;
                    break;
            }
        }
        sketch.arc(0, y - adjustVal, sketch.width / 5, sketch.width / 10, 0, sketch.PI, sketch.CHORD);
    };
    
    function patty(y, type) {
        if(type === "beef") {
            sketch.fill(150, 50, 50);
            sketch.rect(0, y, sketch.width / 4, sketch.width / 20, 10);
        } else if(type === "vegan") {
            sketch.fill("#865151");
            sketch.rect(0, y, sketch.width / 4, sketch.width / 20, 10);
        }
        return sketch.width / 20;
    };
    
    function vegetable(y, type) {
        if(type === "tomato") {
            sketch.fill("#EE3D3D");
            sketch.rect(0, y, sketch.width / 5, sketch.width / 30, 2);
        } else if(type === "lettuce") {
            sketch.fill("#94DC42");
            sketch.rect(0, y, sketch.width / 3, sketch.width / 30, 10);
        }
        return sketch.width / 30;
    };
    
    function option(y, type) {
        if(type === "cheese") {
            sketch.fill("#FFCC33");
            sketch.rect(0, y, sketch.width / 4, sketch.width / 40, 10);
        } else if(type === "pickle") {
            sketch.fill("#4A7321");
            sketch.rect(0, y, sketch.width / 10, sketch.width / 40, 10);
        }
        return sketch.width / 40;
    };
}