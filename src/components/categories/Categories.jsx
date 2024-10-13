import { useEffect, useState } from 'react';
import {
  PlusOutlined,
  EditOutlined,
  CloseOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import Add from './Add';
import Edit from './Edit';
import './style.css';
import { Button, Select } from 'antd';

const Categories = ({
  categories = [],
  setCategories,
  products,
  setFiltered,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Initial mobile check

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Update mobile state on resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (categoryTitle === 'Tümü') {
      setFiltered(products);
    } else {
      if (!categoryTitle || categoryTitle.length <= 0) {
        setFiltered(products);
      } else {
        setFiltered(
          products.filter((product) => product.category === categoryTitle)
        );
      }
    }
  }, [products, setFiltered, categoryTitle]);

  return (
    <div className={`categories-container ${isMobile ? 'no-scroll' : ''}`}>
      {isMobile ? (
        <Select
          value={categoryTitle}
          onChange={setCategoryTitle}
          placeholder="Select a category"
          className="w-full"
          showSearch
          allowClear
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {categories.map((item) => (
            <Select.Option key={item._id} value={item.title}>
              {item.title}
            </Select.Option>
          ))}
        </Select>
      ) : (
        <ul className="flex gap-2 md:flex-col flex-row text-sm rounded-lg p-2 bg-white shadow-md border border-gray-200">
          {categories?.length > 0 &&
            categories.map((item) => (
              <li key={item._id} className="flex flex-col">
                <Button
                  className={`${
                    item.title === categoryTitle
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  } rounded-md h-10 w-28 flex items-center justify-center transition-colors duration-200 ease-in-out`}
                  onClick={() => setCategoryTitle(item.title)}
                >
                  <span>{item.title}</span>
                </Button>
              </li>
            ))}
        </ul>
      )}

      {/* Clear button to reset categoryTitle */}
      {!isMobile && categoryTitle && (
        <div className="flex justify-center mt-3">
          <Button
            type="default"
            icon={<ClearOutlined />}
            onClick={() => setCategoryTitle(null)} // Reset category title to null
            className="hover:bg-red-500 hover:text-white transition-colors duration-200 ease-in-out"
            size="large"
          >
            Reset
          </Button>
        </div>
      )}

      {/* Only show add/edit buttons if not mobile */}
      {!isMobile && (
        <div className="flex justify-center gap-4 mt-3">
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalOpen(true)}
            className="hover:bg-green-600 transition-colors duration-200 ease-in-out"
            size="large"
          />
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => setIsEditModalOpen(true)}
            className="hover:bg-blue-600 transition-colors duration-200 ease-in-out"
            size="large"
          />
        </div>
      )}

      {!isMobile && (
        <Add
          isAddModalOpen={isAddModalOpen}
          setIsAddModalOpen={setIsAddModalOpen}
          categories={categories}
          setCategories={setCategories}
        />
      )}

      {!isMobile && (
        <Edit
          isEditModalOpen={isEditModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          categories={categories}
          setCategories={setCategories}
        />
      )}
    </div>
  );
};

export default Categories;
