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
import { storage } from '../../utils/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const EditProductModal = ({
  isEditModalOpen,
  setIsEditModalOpen,
  getProduct,
  categories,
  editingItem,
  onFinish,
}) => {
  const [form] = Form.useForm();
  const [vendors, setVendors] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [Loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(editingItem);
    fetchVendors();
    if (editingItem) {
      form.setFieldsValue(editingItem); // Populate form with editingItem values
      setFileList([{ url: editingItem.img }]); // Set the image for preview
    }
  }, [isEditModalOpen, editingItem, form]);

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files (JPG, PNG, GIF, etc.)!');
    }
    return isImage; // Only allow image uploads
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

  const handleImageUpload = async (file) => {
    if (!file) return null;
    const timestamp = Date.now() / 1000;
    const storageRef = ref(storage, `images/${file.name}-${timestamp}`);
    // const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const onFinished = async (values) => {
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

    let uploadedImageUrl = editingItem.img; // Default to existing image
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const file = fileList[0].originFileObj;
      uploadedImageUrl = await handleImageUpload(file);
    }
    // console.log(uploadedImageUrl);

    const productData = {
      ...values,
      price: numPrice,
      vendorPrice: numVendorPrice,
      quantity: numQuantity,
      img: uploadedImageUrl,
    };

    onFinish(productData);
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
      title="Edit Product"
      open={isEditModalOpen}
      onCancel={() => setIsEditModalOpen(false)}
      footer={false}
    >
      <Form layout="vertical" onFinish={onFinished} form={form}>
        <Form.Item
          label="Product Name"
          name="title"
          rules={[{ required: true, message: 'This field cannot be empty!' }]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Form.Item label="Product Image">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleChange}
            beforeUpload={beforeUpload}
            accept="image/*"
          >
            {fileList.length >= 1 ? null : uploadButton}
          </Upload>
          {previewImage && (
            <Image
              preview={{
                visible: previewOpen,
                onVisibleChange: setPreviewOpen,
              }}
              src={previewImage}
            />
          )}
        </Form.Item>

        <Form.Item
          label="Product Price"
          name="price"
          rules={[{ required: true, message: 'This field cannot be empty!' }]}
        >
          <Input placeholder="Enter product price" type="number" />
        </Form.Item>

        <Form.Item
          label="Product Quantity"
          name="quantity"
          rules={[{ required: true, message: 'This field cannot be empty!' }]}
        >
          <Input placeholder="Enter product quantity" type="number" />
        </Form.Item>

        <Form.Item
          label="Select Category"
          name="category"
          rules={[{ required: true, message: 'This field cannot be empty!' }]}
        >
          <Select
            showSearch
            placeholder="Select Category"
            optionFilterProp="children"
            allowClear
          >
            {categories?.map((cat) => (
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
              (option?.children ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            filterSort={(optionA, optionB) =>
              (optionA?.children ?? '')
                .toLowerCase()
                .localeCompare((optionB?.children ?? '').toLowerCase())
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
            {Loading? 'Updating...' : "Update"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProductModal;
