import React, { useEffect, useState, useRef } from 'react';
import Header from '../components/header/Header';
// import Highlighter from 'react-highlight-words';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Image,
  InputNumber,
} from 'antd';
import {
  SearchOutlined,
  PlusCircleOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const VendorPage = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  //eslint-disable-next-line 
  const [selectedProductPrice, setSelectedProductPrice] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  // Filter States
  const [vendorFilter, setVendorFilter] = useState(null);
  const [productFilter, setProductFilter] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedProductImage, setSelectedProductImage] = useState(''); // State to hold selected product image

// eslint-disable-next-line
const [searchText, setSearchText] = useState('');
// eslint-disable-next-line
  const [searchedColumn, setSearchedColumn] = useState('');
  // eslint-disable-next-line
  const searchInput = useRef(null);

  // Fetch vendors, products, and purchases on component mount
  useEffect(() => {
    fetchVendors();
    fetchProducts();
    fetchPurchases();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch purchases and filter them based on selected filters
  useEffect(() => {
    fetchPurchases();
  }, [vendorFilter, productFilter, startDate, endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPurchases = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/purchase/get-all`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('postUser'))?.token}`,
          },
        }
      );
      const data = (await response.json()).reverse();
      const filteredPurchases = data.filter((purchase) => {
        const vendorId = purchase.vendor ? purchase.vendor._id : null;
        const productTitle = purchase.product?.title || '';

        const vendorMatch = !vendorFilter || vendorId === vendorFilter;
        const productMatch = productTitle
          .toLowerCase()
          .includes((productFilter || '').toLowerCase());

        const dateMatch =
          (!startDate ||
            dayjs(purchase.purchaseDate).isAfter(
              dayjs(startDate).startOf('day')
            )) &&
          (!endDate ||
            dayjs(purchase.purchaseDate).isBefore(dayjs(endDate).endOf('day')));

        return vendorMatch && productMatch && dateMatch;
      });

      setPurchases(filteredPurchases);
    } catch (error) {
      message.error('Error fetching purchases: ' + error.message);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/vendors/get-all`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('postUser'))?.token}`,
          },
        }
      );
      const data = await response.json();
      setVendors(data.vendors);
    } catch (error) {
      message.error('Error fetching vendors: ' + error.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/products/get-all`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('postUser'))?.token}`,
          },
        }
      );
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      message.error('Error fetching products: ' + error.message);
    }
  };

  // Handle modal visibility
  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
    setSelectedProductPrice(0);
    setSelectedProductId(null);
    setSelectedVendorId(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddPurchase = async (values) => {
    if (values.purchaseDate) {
      values.purchaseDate = values.purchaseDate.toISOString();
    }

    const purchaseData = {
      ...values,
      product: selectedProductId,
      vendor: selectedVendorId,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/purchase/add-purchase`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('postUser'))?.token}`,
          },
          body: JSON.stringify(purchaseData),
        }
      );

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to add purchase');
      }

      message.success('Purchase added successfully.');
    } catch (error) {
      message.error('Operation failed.');
      console.error('Error details:', error);
    } finally {
      fetchPurchases();
      setIsModalVisible(false);
    }
  };

  const handleProductChange = (value) => {
    const selectedProduct = products.find((product) => product.title === value);
    if (selectedProduct) {
      setSelectedProductPrice(selectedProduct.price);
      setSelectedProductId(selectedProduct._id);
      setSelectedProductImage(selectedProduct.img);
      form.setFieldsValue({ purchasingPrice: selectedProduct.price });
    }
  };

  const handleVendorChange = (value) => {
    const selectedVendor = vendors.find((vendor) => vendor.name === value);
    if (selectedVendor) {
      setSelectedVendorId(selectedVendor._id);
    }
  };

  const disableFutureDates = (currentDate) => {
    return currentDate && currentDate > dayjs().endOf('day');
  };

  //eslint-disable-next-line
  const resetFilters = () => {
    setVendorFilter('');
    setProductFilter('');
    setStartDate(null);
    setEndDate(null);
  };

    //eslint-disable-next-line
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = () => {
    setVendorFilter(null);
    setProductFilter(null);
    setStartDate(null);
    setEndDate(null);
    setSearchText('');
  };

    //eslint-disable-next-line
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm({ closeDropdown: false })}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => {
              confirm({ closeDropdown: false });
              console.log('Filter applied!'); // Debug log
            }}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              setSelectedKeys([]);
              console.log('Filters cleared!'); // Debug log
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      // Handle filtering logic based on dataIndex
      const fieldValue = dataIndex.includes('.')
        ? dataIndex.split('.').reduce((o, i) => o[i], record)
        : record[dataIndex];

      return String(fieldValue).toLowerCase().includes(value.toLowerCase()); // Filter condition
    },
  });

  // Define your columns for the table
  const columns = [
    {
      title: 'Image',
      dataIndex: ['product', 'img'],
      render: (img) => {
        // Placeholder image URL (replace with your placeholder image path)
        const placeholderImg = 'https://via.placeholder.com/150';
        const imageSrc = img ? img : placeholderImg;
        return <Image width={30} src={imageSrc} alt="Product Image" />;
      },
    },
    {
      title: 'Vendor',
      dataIndex: ['vendor', 'name'],
      // ...getColumnSearchProps('vendor.name'),
    },
    {
      title: 'Product',
      dataIndex: ['product', 'title'],
      // ...getColumnSearchProps('product.title'),
    },
    {
      title: 'Purchasing Price',
      dataIndex: 'purchasingPrice',
      sorter: (a, b) => a.purchasingPrice - b.purchasingPrice,
    },
    {
      title: 'Purchase Date',
      dataIndex: 'purchaseDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate),
    },
  ];

  return (
    <div>
      <Header />
      <div className="p-5">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-end mt-4 mb-4 space-y-2 md:space-y-0 md:space-x-2">
          <Select
            placeholder="Filter by Vendor"
            className="w-full md:w-48"
            onChange={setVendorFilter}
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            value={vendorFilter} // Bind the value to the state
          >
            {vendors.map((vendor) => (
              <Select.Option key={vendor._id} value={vendor._id}>
                {vendor.name}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Filter by Product"
            className="w-full md:w-48"
            onChange={setProductFilter}
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            value={productFilter} // Bind the value to the state
          >
            {products.map((product) => (
              <Select.Option key={product._id} value={product.title}>
                {product.title}
              </Select.Option>
            ))}
          </Select>

          <DatePicker
            placeholder="Start Date"
            className="w-full md:w-auto md:mr-2"
            disabledDate={disableFutureDates}
            onChange={(date) => setStartDate(date)}
            value={startDate}
          />

          <DatePicker
            placeholder="End Date"
            className="w-full md:w-auto"
            disabledDate={disableFutureDates}
            onChange={(date) => setEndDate(date)}
            value={endDate}
          />

          <Button
            onClick={() => handleReset()} // Pass clearFilters correctly
            className="mt-2 md:mt-0 md:ml-4"
            variant="outlined"
            icon={<ClearOutlined />}
          >
            Clear Filter
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-end">
          <div className="mb-4 mr-4 text-right">
            <strong className="mr-2">Total Purchases:</strong>{' '}
            {purchases.length}
          </div>
          <div className="mb-4 mr-4 text-right">
            <strong className="mr-2">Total Wholesale Amount:</strong>{' '}
            {purchases
              .reduce(
                (acc, purchase) =>
                  acc + purchase?.purchasingPrice * purchase.quantity,
                0
              )
              .toFixed(2)}
          </div>
          <div className="mb-4 mr-4 text-right">
            <strong className="mr-2">Total Retail Amount:</strong>{' '}
            {purchases
              .reduce(
                (acc, purchase) =>
                  acc + purchase?.product?.price * purchase.quantity,
                0
              )
              .toFixed(2)}
          </div>
          <Button type="primary" onClick={showModal} className="mb-4 ml-4">
            Add Purchase
          </Button>
          <Button
            type="primary"
            onClick={() => navigate('/vendor-list')}
            className="mb-4 ml-4"
          >
            <PlusCircleOutlined /> Vendor
          </Button>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="overflow-x-auto">
        {' '}
        {/* Makes the table scrollable horizontally on small screens */}
        <Table
          columns={columns}
          dataSource={purchases}
          rowKey={(record) => record._id}
          pagination={{
            pageSizeOptions: ['10', '20', '30'],
            showSizeChanger: true,
            pageSize: 10,
          }}
        />
      </div>

      {/* Add Purchase Modal */}
      <Modal
        title="Add Purchase"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddPurchase}
          initialValues={{
            purchaseDate: dayjs(), // Set initial date to today
          }}
        >
          {/* Product Dropdown */}
          <Form.Item
            label="Select Product"
            name="product"
            rules={[{ required: true, message: 'Please select a product' }]}
          >
            <Select
              placeholder="Select a product"
              showSearch
              allowClear
              onChange={handleProductChange} // Add onChange handler
            >
              {products.map((product) => (
                <Select.Option key={product._id} value={product.title}>
                  <div className="flex items-center">
                    <img
                      src={product.img}
                      alt={product.title}
                      className="w-5 h-5 mr-2"
                    />
                    {product.title}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Vendor Dropdown */}
          <Form.Item
            label="Select Vendor"
            name="vendor"
            rules={[{ required: true, message: 'Please select a vendor' }]}
          >
            <Select
              placeholder="Select a vendor"
              showSearch
              allowClear
              onChange={handleVendorChange} // Add onChange handler
            >
              {vendors.map((vendor) => (
                <Select.Option key={vendor._id} value={vendor.name}>
                  {vendor.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Additional Fields */}
          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[
              {
                required: true,
                message: 'Please enter the Quantity',
              },
            ]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          {/* Additional Fields */}
          <Form.Item
            label="Purchasing Price"
            name="purchasingPrice"
            rules={[
              {
                required: true,
                message: 'Please enter the purchasing price',
              },
            ]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item
            label="Purchase Date"
            name="purchaseDate"
            rules={[
              { required: true, message: 'Please select a purchase date' },
            ]}
          >
            <DatePicker
              disabledDate={disableFutureDates}
              format="YYYY-MM-DD"
              className="w-full"
              showToday
            />
          </Form.Item>

          {/* Note Field (Optional) */}
          <Form.Item label="Notes" name="notes">
            <Input.TextArea placeholder="Optional notes" />
          </Form.Item>
          {/* Display Selected Product Image */}
          {selectedProductImage && (
            <div className="mb-4 flex items-center justify-center">
              <Image
                src={selectedProductImage}
                alt="Selected Product"
                width={200}
                height={200}
              />
            </div>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Add Purchase
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VendorPage;
