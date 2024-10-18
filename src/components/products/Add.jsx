import React, { useState, useEffect } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  message,
  Upload,
  Image,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../utils/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Add = ({ isAddModalOpen, setIsAddModalOpen, getProduct, categories }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchVendors();
  }, [isAddModalOpen]);

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
      if (!response.ok) throw new Error('Failed to fetch vendors');
      const data = await response.json();
      setVendors(data.vendors);
    } catch (error) {
      message.error('Error fetching vendors: ' + error.message);
    }
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  // eslint-disable-next-line no-unused-vars
  const handleImageUpload = async (file) => {
    const timestamp = Date.now() / 1000;
    const storageRef = ref(storage, `images/${file.name}-${timestamp}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const onFinish = async (values) => {
    setLoading(true);
    const { price, vendorPrice, quantity } = values;
    const numPrice = Number(price);
    const numVendorPrice = Number(vendorPrice);
    const numQuantity = Number(quantity);

    // Quantity validation
    if (numQuantity < 1) {
      message.error('Quantity must be greater than or equal to 1.');
      return;
    }

    // Price validation
    if (numPrice <= 0 || numPrice <= numVendorPrice) {
      message.error(
        'Product price must be greater than vendor price and cannot be 0.'
      );
      return;
    }

    let uploadedImageUrl = null;
    if (fileList.length > 0) {
      // setLoading(true)
      const file = fileList[0].originFileObj;
      uploadedImageUrl = await handleImageUpload(file);
    }

    try {
      const productData = {
        ...values,
        price: numPrice,
        vendorPrice: numVendorPrice,
        quantity: numQuantity,
        img: uploadedImageUrl,
      };

      const res = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/products/add-product`,
        {
          method: 'POST',
          body: JSON.stringify(productData),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('postUser'))?.token}`,
          },
        }
      );

      if (res.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      message.success('Product added successfully.');
      // Clear modal and reset form
      setIsAddModalOpen(false);
      form.resetFields();
      setFileList([]); // Clear file list
      getProduct();
    } catch (error) {
      console.error(error);
      message.error('Error adding product: ' + error.message);
    }
    setLoading(false);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Modal
      title="Add New Product"
      open={isAddModalOpen}
      onCancel={() => setIsAddModalOpen(false)}
      footer={false}
    >
      <Form layout="vertical" onFinish={onFinish} form={form}>
        <Form.Item
          label="Product Name"
          name="title"
          rules={[{ required: true, message: 'This field is required!' }]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Form.Item label="Product Image">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleChange}
            accept="image/*"
            beforeUpload={() => false} // Disable automatic upload
          >
            {fileList.length >= 1 ? null : uploadButton}
          </Upload>
          {previewImage && (
            <Image
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
              }}
              src={previewImage}
            />
          )}
        </Form.Item>

        <Form.Item
          label="Product Price"
          name="price"
          rules={[
            { required: true, message: 'This field cannot be left blank!' },
          ]}
        >
          <Input placeholder="Enter product price" type="number" />
        </Form.Item>

        <Form.Item
          label="Product Quantity"
          name="quantity"
          rules={[
            { required: true, message: 'This field cannot be left blank!' },
          ]}
        >
          <Input placeholder="Enter product quantity" type="number" />
        </Form.Item>

        <Form.Item
          label="Select Category"
          name="category"
          rules={[
            { required: true, message: 'This field cannot be left blank!' },
          ]}
        >
          <Select
            showSearch
            placeholder="Type to select category"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
            options={categories?.map((item) => ({
              value: item.title,
              label: item.title,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Select Vendor"
          name="vendor"
          rules={[
            { required: true, message: 'This field cannot be left blank!' },
          ]}
        >
          <Select
            showSearch
            placeholder="Type to select vendor"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
            options={vendors?.map((item) => ({
              value: item._id,
              label: item.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Vendor Price"
          name="vendorPrice"
          rules={[
            { required: true, message: 'This field cannot be left blank!' },
          ]}
        >
          <Input placeholder="Enter vendor price" type="number" />
        </Form.Item>

        <Form.Item className="flex justify-end mb-0">
          <Button type="primary" htmlType="submit" disabled={Loading}>
            {Loading? 'Uploading..' : 'Add'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Add;
