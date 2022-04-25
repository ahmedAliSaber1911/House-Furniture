//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartitems = document.querySelector(".cart-items");
const cartOverlay = document.querySelector(".cart-overlay");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
//end of variable
//cart
let cart =[];
//buttons 
let buttonsDOM = [];
//getting the products
class Products{
async getProducts(){
    try {
    let result= await fetch('products.json');
    let data = await result.json(); // getting our data from the local storage (json)
    let products = data.items;
    products = products.map(item=>{
        const{title,price} = item.fields; // get two properity form the data in products.json
        const{id} = item.sys; // also called destraction (تدمير)
        const image =item.fields.image.fields.file.url; 
        return {title, price, id, image}; //return form the map (products)
    })
    return products; 
    } catch (error) {
    console.log(error);        
    }
}
}
//display the products
class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product => {
            result += `
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img" >
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>   
            </article>
            `
        });
        productsDOM.innerHTML = result;
    }
    getBagButtom(){
        const buttons = [...document.querySelectorAll(".bag-btn")]; //three dots to return it as array not nodelist
        buttonsDOM = buttons;
        buttons.forEach(button=>{
            let id =button.dataset.id; // getting the id to use it to fetch to the data obout the product when i click the button
            let inCart = cart.find(item=> item.id == id);
            if(inCart){
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener("click",(event)=>{
                event.target.innerText = "In Cart";     // target what is in the event (consloe log the event to understand )
                event.target.disabled =true;
                // get product from the products
                let cartItem = {...Storage.getProduct(id),amount:1}; //to destraction 
                //add product to the cart
                cart = [...cart,cartItem];
                //save cart in local storage 
                Storage.saveCart(cart);
                //set cart values 
                this.setCartValues(cart);
                // display cart item 
                this.addCartItem(cartItem);
                //show the cart 
                this.showCart();
                })
            
        })
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemTotal = 0;
        cart.map(item=>{
            tempTotal += item.price* item.amount;
            itemTotal += item.amount;
        })     
        cartTotal.innerText = parseFloat(tempTotal).toFixed(2);
        cartitems.innerText = itemTotal;
    }   
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
                    <img src=${item.image} alt="product">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>
        `
        cartContent.appendChild(div); //to append the div the cart content as i delete it form the html
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));
    }
    setupApp(){
        cart = Storage.getCart() ;// when app is run we look cart if had some thing return it or return empty array
        this.setCartValues(cart);
        this.populateCart(cart); // to add previous selected item in the cart ( showing them)
        closeCartBtn.addEventListener("click",this.hideCart); //i dont put the () because i want to refer to the dom
        cartBtn.addEventListener("click",this.showCart);
    }
    cartLogic(){
        //clear cart button 
        clearCartBtn.addEventListener('click', ()=>{ // i use arrow fuction because without it the this keyword to refer to button
            this.clearCart();
        })
        // cart functionality
        cartContent.addEventListener("click",event =>{
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;  // to speciy the target then delete them (consloe log remove item to under stand);
                let id = removeItem.dataset.id;
                this.removeItem(id); // to remove the item form the cart 
                cartContent.removeChild(removeItem.parentElement.parentElement) // to remove the item from the dom (comment the line and see the difference)
            }else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount =tempItem.amount + 1; 
                Storage.saveCart(cart)// this is in the cart 
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount // add element target to the raise buttom and the amount text is below it so i use the nextElement to
                // it instead of the hard code
            }
            else if(event.target.classList.contains('fa-chevron-down')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1; 
                if(tempItem.amount > 0 ){
                    Storage.saveCart(cart)// this is in the cart 
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }
                else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        })
    }    
    clearCart(){
        let cartItems = cart.map(item=>item.id);
        cartItems.forEach(id=> this.removeItem(id));
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        }
    }
    removeItem(id){
        cart=cart.filter(item => item.id !== id); // return all items unless the item with the id 
        this.setCartValues(cart); // to update the values
        Storage.saveCart(cart); // to save the new cart 
        let button = this.getSingleButton(id);
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`
    }
    getSingleButton(id){
        return buttonsDOM.find(button=>button.dataset.id === id); // to get the button and then get it back to default value 
    }

}
//local storage 
class Storage{
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products)) // to save products as string not an array on the local storage;
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products')); // parse to convert id form string to integer
        return products.find(product => product.id === id);
    }
    static saveCart(cart){
        localStorage.setItem("cart",JSON.stringify(cart)) // to save products as string not an array on the local storage;
    }
    static getCart(){
        return localStorage.getItem("cart")? JSON.parse(localStorage.getItem('cart')):[];
    }
}

document.addEventListener("DOMContentLoaded",()=>{
    const ui = new UI(); //create an instance of Ui class;
    const products = new Products();
    //setup the app
    ui.setupApp(); 
    // get the products
    products.getProducts().then(products => 
        {
        ui.displayProducts(products);
        Storage.saveProducts(products);
        }).then(()=>{
            ui.getBagButtom(); // i use another then because will dont get until i get the products so i wait until product getting is done
            ui.cartLogic();
        });
})





