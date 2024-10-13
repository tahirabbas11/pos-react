import { useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import Add from '../products/Add';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
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
      <div className="flex justify-end space-x-4 mb-4">
        {' '}
        {/* Container for alignment */}
        <Button
          className="product-item min-h-[40px] bg-blue-700 border hover:shadow-lg cursor-pointer transition-all select-none flex items-center justify-center text-sm text-white px-4 py-2 hover:opacity-90"
          onClick={() => setIsAddModalOpen(true)}
        >
          <p className="text-base">
            <PlusOutlined
              className="inline-block"
              style={{ marginBottom: '-2px' }}
            />
            &nbsp; Add Products
          </p>
        </Button>
        <Button
          className="product-item min-h-[40px] bg-blue-700 border hover:shadow-lg cursor-pointer transition-all select-none flex items-center justify-center text-sm text-white px-4 py-2 hover:opacity-90"
          onClick={() => navigate('/products')}
        >
          <p className="text-base">
            <EditOutlined
              className="inline-block"
              style={{ marginBottom: '-2px' }}
            />
            &nbsp; Edit Products
          </p>
        </Button>
      </div>

      <div className="products-wrapper grid grid-cols-card gap-4">
        {searchResults
          .filter((product) => filtered.includes(product))
          .map((item, i) => (
            <ProductItem item={item} key={i} loading={loading} />
          ))}
        <div className="products-wrapper grid grid-cols-card gap-2"></div>

        <Add
          isAddModalOpen={isAddModalOpen}
          setIsAddModalOpen={setIsAddModalOpen}
          products={products}
          setProducts={setProducts}
          categories={categories}
          getProduct={getProduct}
        />
      </div>
    </>
  );
};

export default Products;
