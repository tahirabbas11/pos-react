import {
  Form,
  Table,
  Input,
  Button,
  message,
  Select,
  // Modal,
  Image,
  Space,
  Popconfirm,
  Menu,
} from 'antd';
import { useState, useEffect } from 'react';
// import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import {
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import EditModal from './EditModal';

const Edit = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [form] = Form.useForm();
  const [vendors, setVendors] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    price: '',
    vendor: null,
    category: '',
  });
  // eslint-disable-next-line no-unused-vars
  const [sortOrder, setSortOrder] = useState('ascend'); // 'ascend' or 'descend'
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/products/get-all`,
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
      setFilteredProducts(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/categories/get-all`,
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
      setCategories(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/vendors/get-all`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem('postUser'))?.token
            }`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch vendors');
      const data = await response.json();
      setVendors(data.vendors);
    } catch (error) {
      message.error('Error fetching vendors: ' + error.message);
    }
  };

  // Fetch products, categories, and vendors on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchVendors();
  }, [navigate]);

  // Search handler
  // Search handler
  const handleSearch = () => {
    const filtered = products.filter((product) => {
      const matchName =
        product.title?.toLowerCase().includes(filters.name.toLowerCase()) ||
        false;
      const matchPrice =
        product.price?.toString().includes(filters.price) || false;
      const matchVendor = filters.vendor
        ? product.vendor === filters.vendor
        : true;
      const matchCategory = filters.category
        ? product.category === filters.category
        : true;
      return matchName && matchPrice && matchVendor && matchCategory;
    });
    setFilteredProducts(filtered);
  };
  useEffect(() => {
    handleSearch();
  }, [filters, products, categories]);

  const onFinish = async (values) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/products/update-product`,
        {
          method: 'PUT',
          body: JSON.stringify({ ...values, productId: editingItem._id }),
          headers: {
            'Content-Type': 'application/json',
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
        Authorization: `Bearer ${
          JSON.parse(localStorage.getItem('postUser'))?.token
        }`,
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
  // eslint-disable-next-line no-unused-vars
  const categoryMenu = (
    <Menu>
      <Menu.Item
        key="all"
        onClick={() => setFilters((prev) => ({ ...prev, category: '' }))}
      >
        All Categories
      </Menu.Item>
      {categories.map((cat) => (
        <Menu.Item
          key={cat.title}
          onClick={() =>
            setFilters((prev) => ({ ...prev, category: cat.title }))
          }
        >
          {cat.title}
        </Menu.Item>
      ))}
    </Menu>
  );

  const columns = [
    {
      title: 'Product Image',
      dataIndex: 'img',
      width: '10%',
      render: (img) => <Image src={img} alt="" width={30} />,
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
        return (
          date.getDate() +
          '/' +
          (date.getMonth() + 1) +
          '/' +
          date.getFullYear()
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: '15%',
      render: (_, record) => (
        <div>
          <Button
            type="text"
            className="pl-0"
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
      <Space
        style={{ marginBottom: 16, justifyContent: 'flex-end', float: 'right' }}
      >
        <Input
          placeholder="Search by name"
          value={filters.name}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, name: e.target.value }));
          }}
          style={{ width: 200 }}
          prefix={<SearchOutlined />}
        />
        <Input
          placeholder="Search by price"
          value={filters.price}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, price: e.target.value }));
          }}
          style={{ width: 200 }}
          prefix={<SearchOutlined />}
        />
        <Select
          showSearch
          placeholder="Select Category"
          optionFilterProp="children"
          style={{ width: 200 }}
          onChange={(value) => {
            setFilters((prev) => ({ ...prev, category: value }));
          }}
          allowClear
        >
          {categories.map((cat) => (
            <Select.Option key={cat._id} value={cat.title}>
              {cat.title}
            </Select.Option>
          ))}
        </Select>
        <Select
          showSearch
          placeholder="Select Vendor"
          optionFilterProp="children"
          style={{ width: 200 }}
          onChange={(value) => {
            setFilters((prev) => ({ ...prev, vendor: value }));
          }}
          allowClear
        >
          {vendors.map((vendor) => (
            <Select.Option key={vendor._id} value={vendor._id}>
              {vendor.name}
            </Select.Option>
          ))}
        </Select>
        <Button
          onClick={() => handleSort('ascend')}
          icon={<SortAscendingOutlined />}
        >
          Sort Ascending
        </Button>
        <Button
          onClick={() => handleSort('descend')}
          icon={<SortDescendingOutlined />}
        >
          Sort Descending
        </Button>
        <Button onClick={handleClearFilters} icon={<ClearOutlined />}>
          Clear Filters
        </Button>
      </Space>
      <div className="overflow-x-auto">
        {' '}
        {/* Makes the table scrollable horizontally on small screens */}
        <Table
          columns={columns}
          dataSource={filteredProducts}
          onChange={handleTableChange}
          pagination={{
            ...pagination,
            pageSizeOptions: ['10', '20', '30'],
            showSizeChanger: true,
            onChange: (page, pageSize) =>
              setPagination({ current: page, pageSize }),
          }}
        />
      </div>
      {/* <Modal
  title="Edit Product"
  open={isEditModalOpen}
  onCancel={() => setIsEditModalOpen(false)}
  footer={false}
>
  <Form
    layout="vertical"
    onFinish={onFinish}
    form={form}
    initialValues={editingItem}
  >
    <Form.Item
      label={"Product Name"}
      name="title"
      rules={[
        {
          required: true,
          message: "This field cannot be empty!",
        },
      ]}
    >
      <Input placeholder="Enter product name" />
    </Form.Item>
    <Form.Item
      label={"Product Image Link"}
      name="img"
      rules={[
        {
          required: true,
          message: "This field cannot be empty!",
        },
      ]}
    >
      <Input placeholder="Enter product image link" />
    </Form.Item>
    <Form.Item
      label={"Product Price"}
      name="price"
      rules={[
        {
          required: true,
          message: "This field cannot be empty!",
        },
      ]}
    >
      <Input placeholder="Enter product price" type="number" />
    </Form.Item>
    <Form.Item
      label={"Product Quantity"}
      name="quantity"
      rules={[
        {
          required: true,
          message: "This field cannot be empty!",
        },
      ]}
    >
      <Input placeholder="Enter product quantity" type="number" />
    </Form.Item>
    <Form.Item
      label={"Select Category"}
      name="category"
      rules={[
        {
          required: true,
          message: "This field cannot be empty!",
        },
      ]}
    >
      <Select
        showSearch
        placeholder="Select Category"
        optionFilterProp="children"
        allowClear
      >
        {categories.map((cat) => (
          <Select.Option key={cat._id} value={cat.title}>
            {cat.title}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item
      name="vendor"
      label="Vendor"
      rules={[{ required: true, message: 'Please select the vendor!' }]}
    >
      <Select
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
        }
        filterSort={(optionA, optionB) =>
          (optionA?.children ?? "")
            .toLowerCase()
            .localeCompare((optionB?.children ?? "").toLowerCase())
        }
        allowClear
      >
        {vendors.map((vendor) => (
          <Select.Option key={vendor._id} value={vendor._id}>
            {vendor.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item
      label={"Vendor Price"}
      name="vendorPrice"
      rules={[
        {
          required: true,
          message: "This field cannot be left blank!",
        },
      ]}
    >
      <Input placeholder="Enter vendor price" type="number" />
    </Form.Item>
    <Form.Item className="flex justify-end mb-0">
      <Button type="primary" htmlType="submit">
        Update
      </Button>
    </Form.Item>
  </Form>
</Modal> */}
      <EditModal
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        getProduct={fetchData}
        categories={categories}
        editingItem={editingItem}
        onFinish={onFinish}
      />
    </>
  );
};

export default Edit;
