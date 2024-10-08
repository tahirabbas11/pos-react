import Header from "../components/header/Header";
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  InputNumber,
  Popconfirm,
  message,
  DatePicker,
  Image
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // Import utc plugin
import timezone from "dayjs/plugin/timezone"; // Import timezone plugin
import { PlusCircleOutlined, ClearOutlined } from "@ant-design/icons";

dayjs.extend(utc); // Extend dayjs with utc
dayjs.extend(timezone); // Extend dayjs with timezone

const VendorPage = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedProductPrice, setSelectedProductPrice] = useState(0); // State to hold selected product price
  const [selectedProductId, setSelectedProductId] = useState(null); // State to hold selected product ID
  const [selectedVendorId, setSelectedVendorId] = useState(null); // State to hold selected vendor ID
  const [selectedProductImage, setSelectedProductImage] = useState(""); // State to hold selected product image

  // Filter States
  const [vendorFilter, setVendorFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Fetch vendors and products on component mount
  useEffect(() => {
    fetchVendors();
    fetchProducts();
    fetchPurchases();
  }, []);

  // Fetch purchases and filter them based on selected filters
  useEffect(() => {
    fetchPurchases();
  }, [vendorFilter, productFilter, startDate, endDate]);

  const fetchPurchases = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/purchase/get-all`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("postUser"))?.token}`,
          },
        }
      );
      const data = (await response.json()).reverse();

      // Filter purchases based on the filters
      const filteredPurchases = data.filter(purchase => {
        // Check if vendor and product exist before accessing their properties
        const vendorName = purchase.vendor && purchase.vendor.name ? purchase.vendor.name : ''; // Default to empty string if undefined
        const productTitle = purchase.product && purchase.product.title ? purchase.product.title : ''; // Default to empty string if undefined

        // Safely check if filters are applied, use empty string if null or undefined
        const vendorMatch = vendorName.toLowerCase().includes((vendorFilter || '').toLowerCase());
        const productMatch = productTitle.toLowerCase().includes((productFilter || '').toLowerCase());

        const dateMatch = (!startDate || dayjs(purchase.purchaseDate).isAfter(dayjs(startDate).startOf('day'))) &&
          (!endDate || dayjs(purchase.purchaseDate).isBefore(dayjs(endDate).endOf('day')));

        return vendorMatch && productMatch && dateMatch;
      });

      setPurchases(filteredPurchases);
    } catch (error) {
      message.error("Error fetching purchases: " + error.message);
    }
  };


  //   const fetchPurchases = async () => {
  //     try {
  //       const response = await fetch(
  //         `${process.env.REACT_APP_SERVER_URL}/api/purchase/get-all`,
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${
  //               JSON.parse(localStorage.getItem("postUser"))?.token
  //             }`,
  //           },
  //         }
  //       );
  //       const data = await response.json();

  // // Filter purchases based on the filters
  // const filteredPurchases = data.filter(purchase => {
  //   // Check if vendor and product exist before accessing their properties
  //   const vendorName = purchase.vendor && purchase.vendor.name ? purchase.vendor.name : ''; // Default to empty string if undefined
  //   const productTitle = purchase.product && purchase.product.title ? purchase.product.title : ''; // Default to empty string if undefined

  //   const vendorMatch = vendorName.toLowerCase().includes(vendorFilter.toLowerCase());
  //   const productMatch = productTitle.toLowerCase().includes(productFilter.toLowerCase());

  //   const dateMatch = (!startDate || dayjs(purchase.purchaseDate).isAfter(dayjs(startDate).startOf('day'))) &&
  //                     (!endDate || dayjs(purchase.purchaseDate).isBefore(dayjs(endDate).endOf('day')));

  //   return vendorMatch && productMatch && dateMatch;
  // });

  // setPurchases(filteredPurchases);


  //     } catch (error) {
  //       message.error("Error fetching purchases: " + error.message);
  //     }
  //   };

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/vendors/get-all`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("postUser"))?.token
              }`,
          },
        }
      );
      const data = await response.json();
      setVendors(data.vendors);
    } catch (error) {
      message.error("Error fetching vendors: " + error.message);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/products/get-all`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("postUser"))?.token
              }`,
          },
        }
      );
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      message.error("Error fetching products: " + error.message);
    }
  };

  // Handle modal visibility
  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields(); // Reset fields before opening the modal
    setSelectedProductPrice(0); // Reset selected product price
    setSelectedProductId(null); // Reset selected product ID
    setSelectedVendorId(null); // Reset selected vendor ID
    setSelectedProductImage(""); // Reset selected product image
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Handle form submission
  const handleAddPurchase = async (values) => {
    // Ensure purchaseDate is set to the correct format
    if (values.purchaseDate) {
      values.purchaseDate = values.purchaseDate.toISOString(); // Convert to ISO format
    }

    // Include product ID and vendor ID in the submitted values
    const purchaseData = {
      ...values, // Spread operator to include existing values
      product: selectedProductId, // Add product ID
      vendor: selectedVendorId, // Add vendor ID
    };

    console.log("Submitted Values:", purchaseData);
    setIsModalVisible(false);

    // Send the purchase data to the backend
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/purchase/add-purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("postUser"))?.token}`,
          },
          body: JSON.stringify(purchaseData),
        }
      );

      // Handle different response statuses
      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return; // Exit early after navigating
      }

      if (!response.ok) {
        throw new Error("Failed to add purchase"); // Throw an error for any other status
      }

      message.success("Purchase added successfully.");
    } catch (error) {
      message.error("Operation failed.");
      console.error("Error details:", error); // Use console.error for error logging
    } finally {
      fetchPurchases();
      setIsModalVisible(false); // Ensure modal is closed in all scenarios
    }
  };

  // Handle product selection
  const handleProductChange = (value) => {
    const selectedProduct = products.find((product) => product.title === value);
    if (selectedProduct) {
      setSelectedProductPrice(selectedProduct.price); // Update state with selected product's price
      setSelectedProductId(selectedProduct._id); // Set selected product ID
      setSelectedProductImage(selectedProduct.img); // Set selected product image
      form.setFieldsValue({ purchasingPrice: selectedProduct.price }); // Set the purchasing price in the form
    }
  };

  // Handle vendor selection
  const handleVendorChange = (value) => {
    const selectedVendor = vendors.find((vendor) => vendor.name === value);
    if (selectedVendor) {
      setSelectedVendorId(selectedVendor._id); // Set selected vendor ID
    }
  };

  // Function to disable future dates
  const disableFutureDates = (currentDate) => {
    return currentDate && currentDate > dayjs().endOf("day"); // Disable dates after today
  };

  // Function to reset filters
  const resetFilters = () => {
    setVendorFilter('');
    setProductFilter('');
    setStartDate(null);
    setEndDate(null);
  };

  // Modal form structure
  return (
    <>
      <Header />
      <div className="px-6 min-h-[550px]">
        <h1 className="text-4xl text-center font-bold mb-4">Purchase From Vendor</h1>


        {/* Filter Section */}
        <div className="mb-4" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Space>
            <Select
              placeholder="Select a vendor"
              value={vendorFilter || undefined}  // Sync with vendorFilter state
              onChange={setVendorFilter}
              style={{ width: 200 }}
              allowClear
              showSearch   // Enables search functionality
              optionFilterProp="children"  // Searches based on the vendor name (text inside the option)
              filterOption={(input, option) =>
                option?.children.toLowerCase().includes(input.toLowerCase())
              }  // Custom filter function for searching
            >
              {vendors.map(vendor => (
                <Select.Option key={vendor._id} value={vendor.name}>
                  {vendor.name}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="Select a product"
              value={productFilter || undefined}  // Sync with productFilter state
              onChange={setProductFilter}
              style={{ width: 200 }}
              allowClear
              showSearch   // Enables search functionality
              optionFilterProp="children"  // Searches based on the product title (text inside the option)
              filterOption={(input, option) =>
                option?.children.toLowerCase().includes(input.toLowerCase())
              }  // Custom filter function for searching
            >
              {products.map(product => (
                <Select.Option key={product._id} value={product.title}>
                  {product.title}
                </Select.Option>
              ))}
            </Select>

            <DatePicker
              placeholder="Start Date"
              value={startDate}
              onChange={setStartDate}
              disabledDate={disableFutureDates}
              style={{ marginRight: 8 }}
            />
            <DatePicker
              placeholder="End Date"
              value={endDate}
              onChange={setEndDate}
              disabledDate={disableFutureDates}
            />
            <Button onClick={resetFilters} icon={<ClearOutlined />}>
          Clear Filters
        </Button>
          </Space>
        </div>

        <div className="flex justify-end">
          <Button type="primary" onClick={showModal} className="mb-4 ml-4">
          Add Purchase
          </Button> 
          <Button type="primary" onClick={() => navigate('/vendor-list')} className="mb-4 ml-4">
            <PlusCircleOutlined /> Vendor
          </Button>
        </div>

        <Table
          dataSource={purchases}
          columns={[
            {
              title: "Image",
              dataIndex: ["product", "img"],
              render: (img) => <Image width={30} src={img} alt="Product Image" />,
            },
            {
              title: "Vendor",
              dataIndex: "vendor",
              key: "vendor",
              render: (vendor) => vendor.name,
            },
            {
              title: "Product",
              dataIndex: ["product", "title"],
              key: "product",
            },
            {
              title: "Purchasing Price",
              dataIndex: "purchasingPrice",
              key: "purchasingPrice",
            },
            {
              title: "Date",
              dataIndex: "purchaseDate",
              key: "purchaseDate",
              render: (text) => dayjs(text).format("YYYY-MM-DD"), // Format date for display
            },
            // {
            //   title: "Action",
            //   key: "action",
            //   render: (text, record) => (
            //     <Popconfirm
            //       title="Are you sure to delete this purchase?"
            //       onConfirm={async () => {
            //         await handleDeletePurchase(record._id);
            //       }}
            //       okText="Yes"
            //       cancelText="No"
            //     >
            //       <Button type="link" danger>
            //         Delete
            //       </Button>
            //     </Popconfirm>
            //   ),
            // },
          ]}
        />

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
              rules={[{ required: true, message: "Please select a product" }]}
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
              rules={[{ required: true, message: "Please select a vendor" }]}
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
                  message: "Please enter the Quantity",
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
                  message: "Please enter the purchasing price",
                },
              ]}
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>

            <Form.Item
              label="Purchase Date"
              name="purchaseDate"
              rules={[
                { required: true, message: "Please select a purchase date" },
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
                <Image src={selectedProductImage} alt="Selected Product" width={200} height={200} />
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
    </>
  );
};

export default VendorPage;