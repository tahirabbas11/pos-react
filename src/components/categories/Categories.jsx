import { useEffect, useState } from "react";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import Add from "./Add";
import Edit from "./Edit";
import "./style.css";

const Categories = ({ categories, setCategories, products, setFiltered }) => {
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

  return (
    <ul className="flex gap-1 md:flex-col flex-row text-sm overflow-x-auto rounded-lg">
      {categories.map((item) => (
        <li
          className={`category-item  ${
            item.title === categoryTitle
              ? "!bg-blue-700"
              : "!bg-gray-400 hover:opacity-50"
          } p-2 rounded-md h-10 w-24 flex items-center justify-center cursor-pointer md:text-sm text-sm`}
          key={item._id}
          onClick={() => setCategoryTitle(item.title)}
        >
          <span>{item.title}</span>
        </li>
      ))}

      <li
        className="category-item !bg-gray-400 hover:opacity-50 p-2 rounded-md h-10 w-24 flex items-center justify-center cursor-pointer"
        onClick={() => setIsAddModalOpen(true)}
      >
        <PlusOutlined className="md:text-sm text-sm" />
      </li>

      <li
        className="category-item !bg-gray-400 hover:opacity-50 p-2 rounded-md h-10 w-24 flex items-center justify-center cursor-pointer"
        onClick={() => setIsEditModalOpen(true)}
      >
        <EditOutlined className="md:text-sm text-sm" />
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
