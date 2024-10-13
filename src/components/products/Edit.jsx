import {
  Form,
  Table,
  Input,
  Button,
  message,
  Select,
  Image,
  // Space,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import EditModal from './EditModal';
// import LazyLoadImage from 'react-lazy-load-image-component';

const Edit = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState({});
  //eslint-disable-next-line
  const [form] = Form.useForm();
  const [vendors, setVendors] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    price: '',
    vendor: null,
    category: null,
  });
  const [sortOrder, setSortOrder] = useState('ascend');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchVendors();
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/products/get-all`, {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('postUser'))?.token}`,
        },
      });
      if (res.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/categories/get-all`, {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('postUser'))?.token}`,
        },
      });
      if (res.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/vendors/get-all`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('postUser'))?.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch vendors');
      const data = await response.json();
      setVendors(data.vendors);
    } catch (error) {
      message.error('Error fetching vendors: ' + error.message);
    }
  };

  const handleSearch = () => {
    const filtered = products.filter((product) => {
      const matchName = product.title?.toLowerCase().includes(filters.name.toLowerCase()) || false;
      const matchPrice = product.price?.toString().includes(filters.price) || false;
      const matchVendor = filters.vendor ? product.vendor === filters.vendor : true;
      const matchCategory = filters.category ? product.category === filters.category : true;
      return matchName && matchPrice && matchVendor && matchCategory;
    });
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [filters, products, categories]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFinish = async (values) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/products/update-product`, {
        method: 'PUT',
        body: JSON.stringify({ ...values, productId: editingItem._id }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('postUser'))?.token}`,
        },
      });
      if (res.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
      const data = await res.json();
      setProducts((prevProducts) =>
        prevProducts.map((item) => (item._id === editingItem._id ? data : item))
      );
      setFilteredProducts((prevFiltered) =>
        prevFiltered.map((item) => (item._id === editingItem._id ? data : item))
      );
      message.success('Product successfully updated.');
      setIsEditModalOpen(false);
    } catch (error) {
      message.error('Something went wrong...');
    }

    fetchData();
    fetchCategories();
    fetchVendors();
  };

  const deleteProduct = (id) => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/api/products/delete-product`, {
      method: 'DELETE',
      body: JSON.stringify({ productId: id }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('postUser'))?.token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          message.success('Product successfully deleted.');
          setProducts((prev) => prev.filter((item) => item._id !== id));
          setFilteredProducts((prev) => prev.filter((item) => item._id !== id));
        } else {
          localStorage.clear();
          navigate('/login');
        }
      })
      .catch(() => {
        message.error('Something went wrong...');
      });
  };

  const handleSort = (order) => {
    const sorted = [...filteredProducts].sort((a, b) =>
      order === 'ascend' ? a.price - b.price : b.price - a.price
    );
    setFilteredProducts(sorted);
    setSortOrder(order);
  };

  const handleClearFilters = () => {
    setFilters({ name: '', price: '', vendor: null, category: '' });
    setFilteredProducts(products);
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const columns = [
    {
      title: 'Product Image',
      dataIndex: 'img',
      width: '10%',
      render: (img) => <Image src={img ?? 'https://via.placeholder.com/150'} alt="" width={30} />,
    },
    {
      title: 'Product Name',
      dataIndex: 'title',
      width: '15%',
    },
    {
      title: 'Product Price',
      dataIndex: 'price',
      width: '15%',
    },
    {
      title: 'Available Quantity',
      dataIndex: 'quantity',
      width: '15%',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      width: '15%',
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor',
      width: '15%',
      render: (vendorId) => {
        const vendor = vendors.find((v) => v._id === vendorId);
        return vendor ? vendor.name : 'Unknown';
      },
    },
    {
      title: 'Date Added',
      dataIndex: 'createdAt',
      width: '15%',
      render: (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <Button
            type="text"
            // className="pl-0"
            onClick={() => {
              setIsEditModalOpen(true);
              setEditingItem(record);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => deleteProduct(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },    
  ];

  return (
    <>
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
  <Col xs={24} sm={12} md={8} lg={4}>
    <Input
      placeholder="Search by name"
      value={filters.name}
      onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
      prefix={<SearchOutlined />}
    />
  </Col>
  <Col xs={24} sm={12} md={8} lg={4}>
    <Input
      placeholder="Search by price"
      value={filters.price}
      onChange={(e) => setFilters((prev) => ({ ...prev, price: e.target.value }))}
      prefix={<SearchOutlined />}
    />
  </Col>
  <Col xs={24} sm={12} md={8} lg={4}>
    <Select
      placeholder="Filter by vendor"
      value={filters.vendor}
      onChange={(value) => setFilters((prev) => ({ ...prev, vendor: value }))}
      allowClear
      style={{ width: '100%' }}
      options={vendors.map((vendor) => ({ label: vendor.name, value: vendor._id }))}
    />
  </Col>
  <Col xs={24} sm={12} md={8} lg={4}>
    <Select
      placeholder="Filter by category"
      value={filters.category}
      onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
      allowClear
      style={{ width: '100%' }}
      options={categories?.map((category) => ({
        label: category.title,
        value: category.title,
      }))}
    />
  </Col>
  <Col xs={24} sm={12} md={8} lg={4}>
    <Button
      onClick={() =>
        handleSort(sortOrder === 'ascend' ? 'descend' : 'ascend')
      }
      icon={
        sortOrder === 'ascend' ? <SortDescendingOutlined /> : <SortAscendingOutlined />
      }
      block
    >
      Sort by Price
    </Button>
  </Col>
  <Col xs={24} sm={12} md={8} lg={4}>
    <Button onClick={handleClearFilters} icon={<ClearOutlined />} block>
      Clear Filters
    </Button>
  </Col>
</Row>

<Table
  columns={columns}
  dataSource={filteredProducts}
  rowKey="_id"
  pagination={pagination}
  onChange={handleTableChange}
  scroll={{ x: 'max-content' }}  // Makes the table scroll horizontally if needed
/>

      {isEditModalOpen && (
        
        <EditModal
          visible={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          onFinish={onFinish}
          editingItem={editingItem}
          isEditModalOpen={isEditModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          categories={categories}
        />
      )}
    </>
  );
};

export default Edit;
