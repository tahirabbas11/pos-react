import { createSlice } from "@reduxjs/toolkit";
import { message } from "antd";


message.config({
  duration: 2,
  maxCount: 3,
  prefixCls: 'my-message',
});

const loadCartFromLocalStorage = () => {
  const cartData = localStorage.getItem("cart");
  return cartData ? JSON.parse(cartData) : { cartItems: [], total: 0, tax: 0, discount: 0, totalQuantity: 0, subtotal: 0 };
};

const saveCartToLocalStorage = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

const cartSlice = createSlice({
  name: "cart",
  initialState: loadCartFromLocalStorage(),
  reducers: {
    addProduct: (state, action) => {
      const cartFindItem = state.cartItems.find(item => item._id === action.payload._id);
      const totalQuantity = action.payload.totalQuantity; // Total available quantity from the payload

      if (cartFindItem) {
        // If the product already exists in the cart
        if (cartFindItem.quantity < totalQuantity) {
          cartFindItem.quantity += 1; // Increase quantity
          state.totalQuantity += 1; // Increment total quantity
          const discountAmountPerPiece = (cartFindItem.price * cartFindItem.discount) / 100;
          cartFindItem.discountPricePerPiece = cartFindItem.price - discountAmountPerPiece; // Update discounted price
          cartFindItem.totalproductprice = cartFindItem.discountPricePerPiece * cartFindItem.quantity; // Update total product price
          message.success("Product quantity updated.");
        } else {
          message.error(`Cannot add more than ${totalQuantity} of this product.`);
        }
      } else {
        // If the product does not exist in the cart
        if (1 <= totalQuantity) {
          const discountAmountPerPiece = (action.payload.price * 0) / 100; // Default discount 0
          state.cartItems.push({
            ...action.payload,
            quantity: 1,
            discount: 0, // Default no discount
            discountPricePerPiece: action.payload.price - discountAmountPerPiece, // Discounted price per piece
            totalproductprice: action.payload.price // Initial total price
          });
          state.totalQuantity += 1; // Increment total quantity
          message.success("Product added.");
        } else {
          message.error(`Cannot add more than ${totalQuantity} of this product.`);
        }
      }

      // Recalculate the subtotal and total
      state.subtotal = state.cartItems.reduce((subtotal, item) => subtotal + item.totalproductprice, 0);
      state.total = state.subtotal - (state.subtotal * state.discount) / 100; // Apply overall discount if any
      saveCartToLocalStorage(state); // Save updated cart to localStorage
    },

    increase: (state, action) => {
      const cartFindItem = state.cartItems.find(item => item._id === action.payload._id);
      const totalQuantity = action.payload.totalQuantity; // Total available quantity from the payload

      if (cartFindItem) {
        // If the product already exists in the cart
        if (cartFindItem.quantity < totalQuantity) {
          cartFindItem.quantity += 1; // Increase quantity
          state.totalQuantity += 1; // Increment total quantity
          const discountAmountPerPiece = (cartFindItem.price * cartFindItem.discount) / 100;
          cartFindItem.discountPricePerPiece = cartFindItem.price - discountAmountPerPiece; // Update discounted price
          cartFindItem.totalproductprice = cartFindItem.discountPricePerPiece * cartFindItem.quantity; // Update total product price
          message.success("Product quantity increased.");
        } else {
          message.error(`Cannot increase quantity beyond ${totalQuantity}.`);
        }
      }

      // Recalculate the subtotal and total
      state.subtotal = state.cartItems.reduce((subtotal, item) => subtotal + item.totalproductprice, 0);
      state.total = state.subtotal - (state.subtotal * state.discount) / 100; // Apply overall discount if any
      saveCartToLocalStorage(state); // Save updated cart to localStorage
    },

    decrease: (state, action) => {
      const cartFindItem = state.cartItems.find(item => item._id === action.payload._id);

      if (cartFindItem) {
        // If the product already exists in the cart
        if (cartFindItem.quantity > 1) {
          cartFindItem.quantity -= 1; // Decrease quantity
          state.totalQuantity -= 1; // Decrement total quantity
          const discountAmountPerPiece = (cartFindItem.price * cartFindItem.discount) / 100;
          cartFindItem.discountPricePerPiece = cartFindItem.price - discountAmountPerPiece; // Update discounted price
          cartFindItem.totalproductprice = cartFindItem.discountPricePerPiece * cartFindItem.quantity; // Update total product price
          message.success("Product quantity decreased.");
        } else {
          message.error("Cannot decrease quantity below 1.");
        }
      }

      // Recalculate the subtotal and total
      state.subtotal = state.cartItems.reduce((subtotal, item) => subtotal + item.totalproductprice, 0);
      state.total = state.subtotal - (state.subtotal * state.discount) / 100; // Apply overall discount if any
      saveCartToLocalStorage(state); // Save updated cart to localStorage
    },

    deleteProduct: (state, action) => {
      const productIndex = state.cartItems.findIndex(item => item._id === action.payload._id);
      if (productIndex !== -1) {
        const quantityToRemove = state.cartItems[productIndex].quantity; // Get quantity of the product to remove
        state.totalQuantity -= quantityToRemove; // Decrement total quantity
        state.cartItems.splice(productIndex, 1); // Remove the product from the cart
        message.success("Product removed.");
      }

      // Recalculate the subtotal and total
      state.subtotal = state.cartItems.reduce((subtotal, item) => subtotal + item.totalproductprice, 0);
      state.total = state.subtotal - (state.subtotal * state.discount) / 100; // Apply overall discount if any
      saveCartToLocalStorage(state); // Save updated cart to localStorage
    },

    reset: (state) => {
      state.cartItems = [];
      state.total = 0;
      state.totalQuantity = 0;
      state.subtotal = 0;
      state.discount = 0;
      saveCartToLocalStorage(state); // Clear the cart from localStorage
    },

    applyDiscount: (state, action) => {
      const { discountType, value } = action.payload; // Destructure discountType and value
    
      if (discountType === "product") {
        const { productId, discount } = value; // Destructure productId and discount
    
        // Check if discount is valid
        if (discount >= 0 && discount <= 100) {
          const cartFindItem = state.cartItems.find(item => item._id === productId);
    
          if (cartFindItem) {
            cartFindItem.discount = discount; // Update discount in the product object
            const discountAmountPerPiece = (cartFindItem.price * discount) / 100;
            cartFindItem.discountPricePerPiece = cartFindItem.price - discountAmountPerPiece; // Discounted price per piece
            cartFindItem.totalproductprice = cartFindItem.discountPricePerPiece * cartFindItem.quantity; // Update total product price
    
            // Recalculate the subtotal (before applying the overall discount)
            state.subtotal = state.cartItems.reduce((subtotal, item) => subtotal + item.totalproductprice, 0);
    
            // Apply overall discount, if any
            if (state.discount > 0) {
              const overallDiscountAmount = (state.subtotal * state.discount) / 100;
              state.total = state.subtotal - overallDiscountAmount;
            } else {
              state.total = state.subtotal; // No overall discount
            }
    
            message.success(`Discount of ${discount}% applied to ${cartFindItem.title}.`);
          } else {
            message.error("Product not found in cart.");
          }
        } else {
          message.error("Invalid discount percentage. It must be between 0 and 100.");
        }
      } else if (discountType === "overall") {
        const overallDiscount = value; // Directly use the overall discount value
    
        // Check if discount is valid
        if (overallDiscount >= 0 && overallDiscount <= 100) {
          const overallDiscountAmount = (state.subtotal * overallDiscount) / 100;
          state.discount = overallDiscount; // Store the overall discount value
          state.total = state.subtotal - overallDiscountAmount; // Apply overall discount to the subtotal to get the total
    
          message.success(`Overall discount of ${overallDiscount}% applied.`);
        } else {
          message.error("Invalid discount percentage. It must be between 0 and 100.");
        }
      }
    
      saveCartToLocalStorage(state); // Save updated cart to localStorage
    },
    
    updateQuantity: (state, action) => {
      const { _id, quantity } = action.payload;
      const cartFindItem = state.cartItems.find(item => item._id === _id);
    
      if (cartFindItem) {
        const totalQuantity = cartFindItem.totalQuantity; // Get the total available quantity
        if (quantity <= totalQuantity && quantity >= 1) {
          const discountAmountPerPiece = (cartFindItem.price * cartFindItem.discount) / 100;
          cartFindItem.quantity = quantity; // Update the quantity
          cartFindItem.discountPricePerPiece = cartFindItem.price - discountAmountPerPiece; // Update discounted price
          cartFindItem.totalproductprice = cartFindItem.discountPricePerPiece * quantity; // Update total product price
          message.success("Product quantity updated.");
        } else {
          message.error(`Quantity must be between 1 and ${totalQuantity}.`);
        }
      }
    
      // Recalculate the subtotal and total
      state.subtotal = state.cartItems.reduce((subtotal, item) => subtotal + item.totalproductprice, 0);
      state.total = state.subtotal - (state.subtotal * state.discount) / 100; // Apply overall discount if any
      saveCartToLocalStorage(state); // Save updated cart to localStorage
    },    
  }
});

export const { addProduct, increase, decrease, deleteProduct, reset, applyDiscount, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
