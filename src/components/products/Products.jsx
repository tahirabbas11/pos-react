import { useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import Add from '../products/Add';
import { useNavigate } from 'react-router-dom';
import { Button, Spin } from 'antd'; // Added Spin for loading indicator
import Fuse from 'fuse.js';

const Products = ({
  products,
  setProducts,
  categories,
  filtered,
  searched,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    getProduct();
  }, [setProducts]); // eslint-disable-line react-hooks/exhaustive-deps

  const getProduct = async () => {
    try {
      const res = await fetch(
        process.env.REACT_APP_SERVER_URL + '/api/products/get-all',
        {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem('postUser'))?.token
            }`,
          },
        }
      );
      if (res.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false); // Ensure loading is false on error
    }
  };

  // Fuse.js setup
  const fuseOptions = {
    keys: ['title'], // Fields to search in
    includeScore: true, // Return search accuracy score
    threshold: 0.4, // Optimized for accuracy
    shouldSort: true, // Sort results by score
    minMatchCharLength: 2, // Ignore short terms
    distance: 100, // Control match precision
  };

  const fuse = new Fuse(products || [], fuseOptions); // Ensure data is never undefined

  // Search results
  const searchResults = searched
    ? fuse.search(searched).map((result) => result.item)
    : filtered || []; // Ensure filtered is not undefined

  return (
    <>
      <div className="flex flex-row justify-end gap-4 mb-4 w-full">
        {/* Add Products Button */}
        <Button
          className="flex-1 flex items-center justify-center text-sm text-white bg-[#2463EB] hover:bg-[#1e4bb1] transition duration-200"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalOpen(true)}
          size="large"
        >
          Add Product
        </Button>

        {/* Edit Products Button */}
        <Button
          className="flex-1 flex items-center justify-center text-sm text-white bg-[#2463EB] hover:bg-[#1e4bb1] transition duration-200"
          icon={<EditOutlined />}
          onClick={() => navigate('/products')}
          size="large"
        >
          Edit Product
        </Button>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <div className="products-wrapper grid grid-cols-card gap-4">
          {searchResults
            .filter((product) => filtered.includes(product))
            .map((item, i) => (
              <ProductItem item={item} key={i} loading={loading} />
            ))}
        </div>
      )}

      <Add
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        products={products}
        setProducts={setProducts}
        categories={categories}
        getProduct={getProduct}
      />
    </>
  );
};

export default Products;
