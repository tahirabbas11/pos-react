import React from 'react';
import { Badge, Input, message, Modal } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  SearchOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  CopyOutlined,
  UserOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UsergroupDeleteOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import './index.css';
// import Swal from 'sweetalert2';

const Header = ({ setSearched }) => {
  const cart = useSelector((state) => state.cart);
  const basketNumber = cart.cartItems.length;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = async () => {
  
    Modal.confirm({
      title: 'Log out?',
      content: "Won't be able to access account.",
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        const token = JSON.parse(localStorage.getItem('postUser'))?.token; // Get the stored token
  
        if (token) {
          try {
            const response = await fetch(
              `${process.env.REACT_APP_SERVER_URL}/api/auth/logout`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
                },
              }
            );
  
            if (!response.ok) {
              throw new Error('Logout failed.');
            }
  
            const data = await response.json(); // Parse response JSON
            localStorage.removeItem('postUser'); // Clear the token from local storage
            navigate('/login'); // Navigate to login page
            message.success(data.message || 'Logout successful.'); // Show success message
          } catch (error) {
            message.error(error.message || 'Something went wrong.'); // Show error message
          }
        } else {
          message.warning('There is no Session.'); // Warn if no session exists
          navigate('/login'); // Navigate to login page
        }
      },
      onCancel() {
        // Optional: Handle any actions on cancel if needed
      },
    });
  };

  return (
    <div className="border-b mb-6">
      <header className="py-4 px-6 flex justify-between items-center">
        <div
          className="header-search flex-1"
          onClick={() => {
            pathname !== '/' && navigate('/');
          }}
        >
          <Input
            size="large"
            placeholder="Search product ..."
            prefix={<SearchOutlined />}
            className="rounded-full max-w-[auto] px-4"
            onChange={(e) => setSearched(e.target.value.toLowerCase())}
          />
        </div>
        <div className="menu-links">
          <Link
            to="/"
            className={`menu-link ${pathname === '/' && ' text-[#40a9ff]'} `}
          >
            <HomeOutlined className="md:text-2xl text-xl" />
            <span className="md:text-xs text-[10px]">Homepage</span>
          </Link>
          <Badge
            count={basketNumber}
            offset={[0, 0]}
            className="md:flex hidden"
          >
            <Link
              to="/cart"
              className={`menu-link ${
                pathname === '/cart' && ' text-[#40a9ff]'
              } `}
            >
              <ShoppingCartOutlined className="md:text-2xl text-xl" />
              <span className="md:text-xs text-[10px]">Cart</span>
            </Link>
          </Badge>
          <Link
            to="/invoices"
            className={`menu-link ${
              pathname === '/invoices' && ' text-[#40a9ff]'
            } `}
          >
            <CopyOutlined className="md:text-2xl text-xl" />
            <span className="md:text-xs text-[10px]">Invoices</span>
          </Link>
          <Link
            to="/customers"
            className={`menu-link ${
              pathname === '/customers' && ' text-[#40a9ff]'
            } `}
          >
            <UserOutlined className="md:text-2xl text-xl" />
            <span className="md:text-xs text-[10px]">Customers</span>
          </Link>
          <Link
            to="/vendor"
            className={`menu-link ${
              pathname === '/vendor' && ' text-[#40a9ff]'
            } `}
          >
            <UsergroupDeleteOutlined className="md:text-2xl text-xl" />
            <span className="md:text-xs text-[10px]">Vendors</span>
          </Link>
          <Link
            to="/expenses"
            className={`menu-link ${
              pathname === '/daily-expense' && ' text-[#40a9ff]'
            } `}
          >
            <DollarOutlined className="md:text-2xl text-xl" />
            <span className="md:text-xs text-[10px]">Expense</span>
          </Link>
          <Link
            to="/statistics"
            className={`menu-link ${
              pathname === '/statistics' && ' text-[#40a9ff]'
            } `}
          >
            <BarChartOutlined className="md:text-2xl text-xl" />
            <span className="md:text-xs text-[10px]">Statistics</span>
          </Link>
          <div onClick={logout}>
            <Link className="menu-link">
              <LogoutOutlined className="md:text-2xl text-xl" />
              <span className="md:text-xs text-[10px]">Logout</span>
            </Link>
          </div>
        </div>
        <Badge count={basketNumber} offset={[0, 0]} className="md:hidden flex">
          <Link
            to="/cart"
            className={`menu-link ${
              pathname === '/cart' && ' text-[#40a9ff]'
            } `}
          >
            <ShoppingCartOutlined className="text-2xl" />
            <span className="md:text-xs text-[10px]">Cart</span>
          </Link>
        </Badge>
      </header>
    </div>
  );
};

export default Header;
