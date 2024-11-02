import React, { useState } from 'react';
import { Badge, Input, message, Modal, Drawer } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuOutlined,
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

const Header = ({ setSearched }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State for drawer toggle
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
        const token = JSON.parse(localStorage.getItem('postUser'))?.token;
        if (token) {
          try {
            const response = await fetch(
              `${process.env.REACT_APP_SERVER_URL}/api/auth/logout`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (!response.ok) throw new Error('Logout failed.');
            const data = await response.json();
            localStorage.removeItem('postUser');
            navigate('/login');
            message.success(data.message || 'Logout successful.');
          } catch (error) {
            message.error(error.message || 'Something went wrong.');
          }
        } else {
          message.warning('There is no Session.');
          navigate('/login');
        }
      },
    });
  };

  return (
    <div className="border-b mb-6">
      <header className="py-4 px-6 flex justify-between items-center">
        <div className="md:hidden flex items-center mr-2">
          <MenuOutlined
            onClick={() => setIsDrawerOpen(true)}
            className="text-2xl cursor-pointer"
          />
        </div>
        <div
          className="header-search flex-1"
          onClick={() => pathname !== '/' && navigate('/')}
        >
          <Input
            size="large"
            placeholder="Search product ..."
            prefix={<SearchOutlined />}
            className="rounded-full max-w-[auto] px-4"
            onChange={(e) => setSearched(e.target.value.toLowerCase())}
          />
        </div>
        <div className="md:hidden flex items-center">
          <Badge count={basketNumber} offset={[0, 0]} className="ml-4">
            <Link
              to="/cart"
              className={`menu-link ${pathname === '/cart' ? 'text-[#40a9ff]' : ''}`}
            >
              <ShoppingCartOutlined className="text-2xl" />
              <span className="text-[10px]">Cart</span>
            </Link>
          </Badge>
        </div>
        <div className="hidden md:flex menu-links">
          {/* Existing Menu Links */}
          <Link
            to="/"
            className={`menu-link ${pathname === '/' ? 'text-[#40a9ff]' : ''}`}
          >
            <HomeOutlined className="md:text-2xl text-xl ml-4" />
            <span className="md:text-xs text-[10px] ml-4">Home</span>
          </Link>
          <Badge
            count={basketNumber}
            offset={[0, 0]}
            className="md:flex hidden"
          >
            <Link
              to="/cart"
              className={`menu-link ${pathname === '/cart' ? 'text-[#40a9ff]' : ''}`}
            >
              <ShoppingCartOutlined className="md:text-2xl text-xl" />
              <span className="md:text-xs text-[10px]">Cart</span>
            </Link>
          </Badge>
          <Link
            to="/invoices"
            className={`menu-link ${pathname === '/invoices' ? 'text-[#40a9ff]' : ''}`}
          >
            <CopyOutlined className="md:text-2xl text-xl" />
            <span className="md:text-xs text-[10px]">Invoices</span>
          </Link>
          <Link
            to="/customers"
            className={`menu-link ${pathname === '/customers' ? 'text-[#40a9ff]' : ''}`}
          >
            <UserOutlined className="md:text-2xl text-xl" />
            <span className="md:text-xs text-[10px]">Customers</span>
          </Link>
          <Link
            to="/vendor"
            className={`menu-link ${pathname === '/vendor' ? 'text-[#40a9ff]' : ''}`}
          >
            <UsergroupDeleteOutlined className="md:text-2xl text-xl" />
            <span className="md:text-xs text-[10px]">Vendors</span>
          </Link>
          <Link
            to="/expenses"
            className={`menu-link ${pathname === '/daily-expense' ? 'text-[#40a9ff]' : ''}`}
          >
            <DollarOutlined className="md:text-2xl text-xl" />
            <span className="md:text-xs text-[10px]">Expense</span>
          </Link>
          <Link
            to="/statistics"
            className={`menu-link ${pathname === '/statistics' ? 'text-[#40a9ff]' : ''}`}
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
        <Drawer
          title="Main Menu"
          placement="left"
          onClose={() => setIsDrawerOpen(false)}
          open={isDrawerOpen}
        >
          {/* Sidebar links for mobile with icons */}
          <Link
            to="/"
            onClick={() => setIsDrawerOpen(false)}
            className="menu-link-phone"
          >
            <HomeOutlined className="text-xl" /> Home
          </Link>
          <Link
            to="/cart"
            onClick={() => setIsDrawerOpen(false)}
            className="menu-link-phone"
          >
            <ShoppingCartOutlined className="text-xl" /> Cart
          </Link>
          <Link
            to="/invoices"
            onClick={() => setIsDrawerOpen(false)}
            className="menu-link-phone"
          >
            <CopyOutlined className="text-xl" /> Invoices
          </Link>
          <Link
            to="/customers"
            onClick={() => setIsDrawerOpen(false)}
            className="menu-link-phone"
          >
            <UserOutlined className="text-xl" /> Customers
          </Link>
          <Link
            to="/vendor"
            onClick={() => setIsDrawerOpen(false)}
            className="menu-link-phone"
          >
            <UsergroupDeleteOutlined className="text-xl" /> Vendors
          </Link>
          <Link
            to="/expenses"
            onClick={() => setIsDrawerOpen(false)}
            className="menu-link-phone"
          >
            <DollarOutlined className="text-xl" /> Expense
          </Link>
          <Link
            to="/statistics"
            onClick={() => setIsDrawerOpen(false)}
            className="menu-link-phone"
          >
            <BarChartOutlined className="text-xl" /> Statistics
          </Link>
          <div onClick={logout} className="menu-link-phone">
            <LogoutOutlined className="text-xl" /> Logout
          </div>
        </Drawer>
      </header>
    </div>
  );
};

export default Header;
