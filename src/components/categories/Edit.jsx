import { Form, Modal, Table, Input, Button, message, Popconfirm } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Edit = ({
  isEditModalOpen,
  setIsEditModalOpen,
  categories,
  setCategories,
}) => {
  const [editingRow, setEditingRow] = useState(null); // Change initial state to null
  const navigate = useNavigate();

  const handleFinish = async (values) => {
    try {
      const res = await fetch(
        process.env.REACT_APP_SERVER_URL + '/api/categories/update-category',
        {
          method: 'PUT',
          body: JSON.stringify({ ...values, categoryId: editingRow._id }),
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
      message.success('Category successfully updated.');
      setCategories(
        categories?.map((item) => {
          if (item._id === editingRow._id) {
            return { ...item, title: values.title };
          }
          return item;
        })
      );
      setEditingRow(null); // Reset editing row after saving
    } catch (error) {
      message.error('Something went wrong...');
    }
  };

  const handleDeleteCategory = (id) => {
    fetch(
      process.env.REACT_APP_SERVER_URL + '/api/categories/delete-category',
      {
        method: 'DELETE',
        body: JSON.stringify({ categoryId: id }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem('postUser'))?.token
          }`,
        },
      }
    )
      .then((res) => {
        if (res.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
        return res.json();
      })
      .then((data) => {
        message.success('Category successfully deleted.');
        setCategories(categories.filter((item) => item._id !== id));
      })
      .catch((error) => {
        message.error('Something went wrong...');
      });
  };

  const columns = [
    {
      title: 'Category Name',
      dataIndex: 'title',
      render: (_, record) => {
        if (record._id === editingRow?._id) {
          // Check if editing the current row
          return (
            <Form.Item
              className="mb-0"
              name="title"
              style={{ margin: 0 }} // Ensure no margin for inputs
              rules={[
                { required: true, message: 'Please input the category name!' },
              ]}
            >
              <Input placeholder="Enter category name" />
            </Form.Item>
          );
        } else {
          return <p>{record.title}</p>; // Show category name as text
        }
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (text, record) => {
        return (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              type="link"
              onClick={() => setEditingRow(record)} // Set current row for editing
              className="pl-0"
              disabled={editingRow !== null} // Disable if another row is being edited
            >
              Edit
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => handleFinish({ title: record.title })}
              disabled={!editingRow}
            >
              Save
            </Button>
            <Popconfirm
              title="Delete Category"
              description="Are you sure you want to delete this category?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDeleteCategory(record._id)}
              placement="topRight" // Position popconfirm to avoid overlap
            >
              <Button type="text" danger>
                Delete
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <Modal
      title="Category Operations"
      open={isEditModalOpen}
      onCancel={() => setIsEditModalOpen(false)}
      footer={false}
      width={800} // Set a fixed width for better responsiveness
    >
      <Form onFinish={handleFinish}>
        <Table
          bordered
          dataSource={categories}
          columns={columns}
          rowKey={'_id'}
          pagination={false} // Disable pagination for better responsiveness
          // scroll={{ y: 500 }}
        />
      </Form>
    </Modal>
  );
};

export default Edit;
