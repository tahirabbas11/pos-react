import React from "react";
import { Badge, Input, message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  CopyOutlined,
  UserOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import "./index.css";
// import Logo from "../../Images/logo.png";
import Swal from "sweetalert2";

const Header = ({ setSearched }) => {
  const cart = useSelector((state) => state.cart);
  const basketNumber = cart.cartItems.length;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = () => {
    Swal.fire({
      title: "Log out?",
      text: "Won't be able to access account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2463EB",
      cancelButtonColor: "gray-400",
      confirmButtonText: "Confirm",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("postUser");
        navigate("/login");
        message.success("Logout successful.");
      }
    });
  };

  return (
    <div className="border-b mb-6">
      <header className="py-4 px-6 flex justify-between items-center gap-10">
        {/* <div className="logo">
           <Link
            to="/"
            className={`menu-link ${pathname === "/" && " text-[#40a9ff]"} `}
          >
            <HomeOutlined className="md:text-5xl text-2xl" />
            <span className="md:text-xs text-[10px]">Shan Foods</span>
          </Link>
          <Link to="/">
            <h2 className="text-2xl font-bold md:text-4xl">Shan Food</h2>
          </Link>
          <Link to="/">
          <div className="flex justify-center items-center">
            <img
              className="object-contain"
              src={Logo}
              alt="Logo"
              style={{ width: "120px", height: "auto" }} // Set the desired width and height
            />
          </div>
            </Link>
        </div> */}
        <div
          className="header-search flex-1"
          onClick={() => {
            pathname !== "/" && navigate("/");
          }}
        >
          <Input
            size="large"
            placeholder="Search product ..."
            prefix={<SearchOutlined />}
            className="rounded-full max-w-[auto]"
            onChange={(e) => setSearched(e.target.value.toLowerCase())}
          />
        </div>
        <div className="menu-links">
          <Link
            to="/"
            className={`menu-link ${pathname === "/" && " text-[#40a9ff]"} `}
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
                pathname === "/cart" && " text-[#40a9ff]"
              } `}
            >
              <ShoppingCartOutlined className="md:text-2xl text-xl" />
              <span className="md:text-xs text-[10px]">Cart</span>
            </Link>
          </Badge>
          <Link
            to="/invoices"
            className={`menu-link ${
              pathname === "/invoices" && " text-[#40a9ff]"
            } `}
          >
            <CopyOutlined className="md:text-2xl text-xl" />
            <span className="md:text-xs text-[10px]">Invoices</span>
          </Link>
          <Link
            to="/customers"
            className={`menu-link ${
              pathname === "/customers" && " text-[#40a9ff]"
            } `}
          >
            <UserOutlined className="md:text-2xl text-xl" />
            <span className="md:text-xs text-[10px]">customers</span>
          </Link>
          <Link
            to="/statistics"
            className={`menu-link ${
              pathname === "/statistics" && " text-[#40a9ff]"
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
              pathname === "/cart" && " text-[#40a9ff]"
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
