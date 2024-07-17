import { Button, Form, Input, Modal, message } from "antd";

const Add = ({
  isAddModalOpen,
  setIsAddModalOpen,
  categories,
  setCategories,
}) => {
  const [form] = Form.useForm();

  const onFinish = (value) => {
    fetch(process.env.REACT_APP_SERVER_URL + "/api/categories/add-category", {
      method: "POST",
      body: JSON.stringify(value),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    })
      .then(response => response.json())
      .then(data => {
        message.success("Category added successfully.");
        setIsAddModalOpen(false);
        form.resetFields();
        setCategories([
          ...categories,
          {
            _id: data.id || Math.random(),
            title: value.title,
          },
        ]);
      })
      .catch(error => {
        console.log(error);
      });
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
          label={"Add Category"}
          name="title"
          rules={[
            {
              required: true,
              message: "This field is required!",
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

