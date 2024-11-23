import Header from '../components/header/Header';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Popconfirm,
  message,
} from 'antd';
import { useEffect, useState, useRef } from 'react';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const VendorPage = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const searchInput = useRef(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Get token from localStorage
  const token = JSON.parse(localStorage.getItem('postUser'))?.token;

  useEffect(() => {
    fetchVendors();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVendors = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/vendors/get-all`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
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

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
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
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const showModal = (vendor = null) => {
    setIsModalVisible(true);
    if (vendor) {
      setEditVendor(vendor);
      form.setFieldsValue(vendor);
    } else {
      setEditVendor(null);
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditVendor(null);
    form.resetFields();
  };

  const handleAddOrUpdateVendor = async (values) => {
    try {
      if (editVendor) {
        // Update vendor
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/vendors/update-vendor/${editVendor._id}`,
          {
            method: 'PUT',
            body: JSON.stringify(values),
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to update vendor');
        const updatedVendor = await response.json();
        setVendors(
          vendors.map((v) =>
            v._id === editVendor._id ? updatedVendor.vendor : v
          )
        );
        message.success('Vendor updated successfully.');
      } else {
        // Add new vendor
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/vendors/add-vendor`,
          {
            method: 'POST',
            body: JSON.stringify(values),
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to add vendor');
        const newVendor = await response.json();
        setVendors([...vendors, newVendor.vendor]);
        message.success('Vendor added successfully.');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving vendor:', error);
      message.error('Failed to save vendor: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/vendors/delete-vendor/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setVendors(vendors.filter((vendor) => vendor._id !== id));
      message.success('Vendor deleted successfully.');
    } catch (error) {
      console.error('Error deleting vendor:', error);
      message.error('Failed to delete vendor: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      ...getColumnSearchProps('phone'),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ...getColumnSearchProps('notes'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this vendor?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Header />
      <div className="px-6 min-h-[550px]">
        <h1 className="text-4xl text-center font-bold mb-4">Vendors</h1>
        <div className="flex justify-end">
          <Button
            type="primary"
            onClick={() => showModal()}
            className="mb-4 ML-4"
          >
            <PlusCircleOutlined /> Add Vendor
          </Button>
          <Button
            type="primary"
            onClick={() => navigate('/vendor')}
            className="mb-4 ml-4"
          >
            Go Back
          </Button>
        </div>

        <Table
          dataSource={vendors}
          columns={columns}
          bordered
          // scroll={{ y: 500 }}
          pagination={{
            ...pagination,
            pageSizeOptions: ['10', '20', '30'],
            showSizeChanger: true,
            onChange: (page, pageSize) =>
              setPagination({ current: page, pageSize }),
          }}
          rowKey="_id"
          className="pt-6"
        />

        <Modal
          title={editVendor ? 'Edit Vendor' : 'Add Vendor'}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddOrUpdateVendor}
          >
            <Form.Item
              label="Vendor Name"
              name="name"
              rules={[
                { required: true, message: "Please input the vendor's name!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Phone"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Please input the vendor's phone number!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item label="Notes" name="notes">
              <Input />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editVendor ? 'Update Vendor' : 'Add Vendor'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default VendorPage;
