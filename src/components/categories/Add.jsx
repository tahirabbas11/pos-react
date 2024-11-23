import { Button, Form, Input, Modal, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const Add = ({
  isAddModalOpen,
  setIsAddModalOpen,
  categories,
  setCategories,
}) => {
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const onFinish = async (value) => {
    try {
      const res = await fetch(
        process.env.REACT_APP_SERVER_URL + '/api/categories/add-category',
        {
          method: 'POST',
          body: JSON.stringify(value),
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

      message.success('Category added successfully.');
      setIsAddModalOpen(false);
      form.resetFields();
      setCategories([
        ...categories,
        {
          _id: data.id || Math.random(),
          title: value.title,
        },
      ]);
    } catch (error) {
      console.log(error);
    }
    navigate(0);
  };

  return (
    <Modal
      title="Add New Category"
      open={isAddModalOpen}
      onCancel={() => setIsAddModalOpen(false)}
      footer={false}
    >
      <Form layout="vertical" onFinish={onFinish} form={form}>
        <Form.Item
          label={'Add Category'}
          name="title"
          rules={[
            {
              required: true,
              message: 'This field is required!',
            },
          ]}
        >
          <Input placeholder="Enter category name" />
        </Form.Item>
        <Form.Item className="flex justify-end mb-0">
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Add;
