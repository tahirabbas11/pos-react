import { useEffect, useState } from "react";
import ProductItem from "./ProductItem";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import Add from "../products/Add";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";

const Products = ({
  products,
  setProducts,
  categories,
  filtered,
  searched,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getProduct();
  }, [setProducts]); // eslint-disable-line react-hooks/exhaustive-deps

  const getProduct = async () => {
    try {
      const res = await fetch(
        process.env.REACT_APP_SERVER_URL + "/api/products/get-all",
        {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("postUser"))?.token
            }`,
          },
        }
      );
      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="products-wrapper grid grid-cols-card gap-4">
      {filtered
        .filter((product) => product.title.toLowerCase().includes(searched))
        .map((item, i) => (
          <ProductItem item={item} key={i} />
        ))}
        <div className="products-wrapper grid grid-cols-card gap-2">
      <Button
        className="product-item min-h-[60px] bg-blue-700 border hover:shadow-lg cu Rsor-pointer transition-all select-none flex items-center justify-center md:text-3xl text-white p-10 hover:opacity-90"
        // className="product-item min-h-[180px] bg-gray-400	 border hover:shadow-lg cu Rsor-pointer transition-all select-none flex items-center justify-center md:text-3xl text-white p-10 hover:opacity-90"
        onClick={() => setIsAddModalOpen(true)}
      >
        {/* <PlusOutlined /> */}
        <p className="text-base">
          <PlusOutlined
            className="inline-block"
            style={{ marginBottom: "-2px" }}
          />
          &nbsp; Add Products
        </p>
      </Button>
      <Button
        className="product-item min-h-[60px] bg-blue-700 border hover:shadow-lg cu Rsor-pointer transition-all select-none flex items-center justify-center md:text-3xl text-white p-10 hover:opacity-90"
        // className="product-item min-h-[180px] bg-gray-400		 border hover:shadow-lg cu Rsor-pointer transition-all select-none flex items-center justify-center md:text-3xl text-white p-10 hover:opacity-90"
        onClick={() => navigate("/products")}
      >
        <p className="text-base">
          <EditOutlined
            className="inline-block"
            style={{ marginBottom: "-2px" }}
          />
          &nbsp; Edit Products
        </p>
      </Button>
      </div>

      <Add
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        products={products}
        setProducts={setProducts}
        categories={categories}
        getProduct={getProduct}
      />
    </div>
  );
};

export default Products;
