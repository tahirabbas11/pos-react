import { useEffect, useState } from "react";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import Add from "./Add";
import Edit from "./Edit";
import "./style.css";
import { Button } from "antd";

const Categories = ({
  categories = [],
  setCategories,
  products,
  setFiltered,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState("All");

  useEffect(() => {
    if (categoryTitle === "Tümü") {
      setFiltered(products);
    } else {
      setFiltered(
        products.filter((product) => product.category === categoryTitle)
      );
    }
  }, [products, setFiltered, categoryTitle]);
  console.log("filtered");

  return (
    <ul className="flex gap-1 md:flex-col flex-row text-sm overflow-x-auto rounded-lg ">
      {categories?.length > 0 &&
        categories.map((item) => (
          <Button
            className={`${
              item.title === categoryTitle
                ? "!bg-blue-700 text-white hover:!bg-blue-700 hover:text-white"
                : " text-black hover:text-gray-900 hover:bg-gray-100"
            } rounded-md h-10 w-24 flex items-center justify-center cursor-pointer`}
            key={item._id}
            onClick={() => setCategoryTitle(item.title)}
          >
            <span>{item.title}</span>
          </Button>
        ))}

      {/* <li className="category-item !bg-transparent hover:opacity-50 p-2 rounded-md h-10 w-24 flex items-center justify-center cursor-pointer"> */}
      <li></li>
      <li className="flex items-center justify-center cursor-pointer">
      <Button
        type="primary"
        shape="circle"
        icon={<PlusOutlined />}
        onClick={() => setIsAddModalOpen(true)}
      />
      </li>

      {/* <li className="category-item !bg-gray-400 hover:opacity-50 p-2 rounded-md h-10 w-24 flex items-center justify-center cursor-pointer"> */}
      <li className="flex items-center justify-center cursor-pointer">
      <Button
        type="primary"
        shape="circle"
        icon={<EditOutlined />}
        onClick={() => setIsEditModalOpen(true)}
      />
      </li> 

      <Add
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        categories={categories}
        setCategories={setCategories}
        // getCategories={getCategories}
      />

      <Edit
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        categories={categories}
        setCategories={setCategories}
      />
    </ul>
  );
};

export default Categories;
