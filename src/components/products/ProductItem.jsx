import { addProduct } from '../../redux/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, message, Skeleton } from 'antd';
import { LazyLoadImage } from "react-lazy-load-image-component";

const ProductItem = ({ item, loading }) => {
  const dispatch = useDispatch();

  // Get cart items from Redux store
  const cartItems = useSelector((state) => state.cart.cartItems);

  // Find the item in the cart to determine the current quantity
  const cartItem = cartItems.find((cartItem) => cartItem._id === item._id);
  const currentQuantityInCart = cartItem ? cartItem.quantity : 0;

  const handleClick = () => {
    if (item.quantity > currentQuantityInCart) {
      // Check if there's enough stock left
      dispatch(
        addProduct({
          ...item,
          quantity: 1,
          key: item._id,
          totalQuantity: item.quantity,
        })
      );
    } else {
      message.warning('Out of Stock');
    }
  };

  // Calculate remaining stock
  const remainingQuantity = item.quantity - currentQuantityInCart;

  // Determine stock status
  const stockStatus =
    remainingQuantity > 0 ? `${remainingQuantity} Left` : 'Out of Stock';

  return (
    <Skeleton loading={loading} active>
      <div
        className="product-item border hover:shadow-lg hover:border-blue-500 hover:shadow-blue-300 cursor-pointer transition-all select-none "
        onClick={handleClick}
        style={{ maxWidth: '95%' }}
      >
        <Badge.Ribbon
          text={stockStatus}
          color={remainingQuantity > 0 ? 'green' : 'red'}
        >
          <div className="product-image">
            
            <LazyLoadImage
              src={item.img ? item.img : 'https://via.placeholder.com/150'}
              alt={item.title}
              className="h-28 object-cover w-full border-b"
            />
          </div>
          <div className="product-info flex flex-col p-3 items-center">
            <span className="font-bold">{item.title}</span>
            <span>{item?.price ? item.price.toFixed(2) + ' Rs' : '-'}</span>
          </div>
        </Badge.Ribbon>
      </div>
    </Skeleton>
  );
};

export default ProductItem;
