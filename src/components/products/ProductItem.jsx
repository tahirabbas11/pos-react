import { message } from "antd";
import { addProduct } from "../../redux/cartSlice";
import { useDispatch, useSelector } from "react-redux";


const ProductItem = ({ item }) => {
  const dispatch = useDispatch();
  
  // Get cart items from Redux store
  const cartItems = useSelector(state => state.cart.cartItems);
  
  // Find the item in the cart to determine the current quantity
  const cartItem = cartItems.find(cartItem => cartItem._id === item._id);
  const currentQuantityInCart = cartItem ? cartItem.quantity : 0;

  const handleClick = () => {
    if (item.quantity > currentQuantityInCart) { // Check if there's enough stock left
      dispatch(addProduct({ ...item, quantity: 1, key: item._id, totalQuantity: item.quantity }));
    } else {
      message.warning("Out of Stock");
    }
  };

  // Calculate remaining stock
  const remainingQuantity = item.quantity - currentQuantityInCart;

  return (
    <div
      className="product-item border hover:shadow-lg cursor-pointer transition-all select-none"
      onClick={handleClick}
    >
      <div className="product-image">
        <img
          src={item.img}
          alt={item.title}
          className="h-28 object-cover w-full border-b"
        />
      </div>
      <div className="product-info flex flex-col p-3 items-center">
        <span className="font-bold">{item.title}</span>
        <span
          className={`text-sm ${remainingQuantity <= 0 ? "text-red-500" : ""}`}
        >
          {remainingQuantity <= 0 
            ? "Out of Stock" 
            : `(${remainingQuantity} left)`}
        </span>
        <span>{item?.price ? item.price.toFixed(2) + ' Rs' : '-'}</span>
        </div>
    </div>
  );
};

export default ProductItem;
