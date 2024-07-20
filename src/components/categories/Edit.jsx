import { Form, Modal, Table, Input, Button, message } from "antd";
import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Edit = ({
  isEditModalOpen,
  setIsEditModalOpen,
  categories,
  setCategories,
}) => {
  const [editingRow, setEditingRow] = useState({});
  const navigate = useNavigate();

  const handleFinish = async (values) => {
    try {
      const res = await fetch(
        process.env.REACT_APP_SERVER_URL + "/api/categories/update-category",
        {
          method: "PUT",
          body: JSON.stringify({ ...values, categoryId: editingRow._id }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("postUser"))?.token
            }`,
          },
        }
      );
      if (res.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
      message.success("Category successfully updated.");
      setCategories(
        categories.map((item) => {
          if (item._id === editingRow._id) {
            return { ...item, title: values.title };
          }
          return item;
        })
      );
    } catch (error) {
      message.error("Something went wrong...");
    }
  };

  // const handleDeleteCategory = (id) => {
  //   if (window.confirm("Are you sure you want to delete?")) {
  // try {
  //   fetch(
  //     process.env.REACT_APP_SERVER_URL + "/api/categories/delete-category",
  //     {
  //       method: "DELETE",
  //       body: JSON.stringify({ categoryId: id }),
  //       headers: {
  //   'Content-Type': 'application/json',
  //   'Authorization': `Bearer ${JSON.parse(localStorage.getItem("postUser"))?.token}`
  // },
  //     }
  //   );
  //   message.success("Category successfully deleted.");
  //   setCategories(categories.filter((item) => item._id !== id));
  // } catch (error) {
  //   message.error("Something went wrong...");
  // }
  //   }
  // };

  const handleDeleteCategory = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2463EB",
      cancelButtonColor: "gray-400",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(
          process.env.REACT_APP_SERVER_URL +
            "/api/categories/delete-category",
          {
            method: "DELETE",
            body: JSON.stringify({ categoryId: id }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("postUser"))?.token
              }`,
            },
          }
        )
          .then((res) => {
            if (res.status === 401) {
              localStorage.clear();
              navigate("/login");
            }
            return res.json();
          })
          .then((data) => {
            message.success("Category successfully deleted.");
            setCategories(categories.filter((item) => item._id !== id));
          })
          .catch((error) => {
            message.error("Something went wrong...");
          });
      }
    });
  };

  const columns = [
    {
      title: "Category Name",
      dataIndex: "title",
      render: (_, record) => {
        if (record._id === editingRow._id) {
          return (
            <Form.Item className="mb-0" name="title">
              <div>
                <p className="mb-2">{record.title}</p>
                <Input />
              </div>
            </Form.Item>
          );
        } else {
          return <p> {record.title}</p>;
        }
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <div>
            <Button
              type="link"
              onClick={() => setEditingRow(record)}
              className="pl-0"
            >
              Edit
            </Button>
            <Button type="text" htmlType="submit">
              Save
            </Button>
            <Button
              type="text"
              danger
              onClick={() => handleDeleteCategory(record._id)}
            >
              Delete
            </Button>
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
    >
      <Form onFinish={handleFinish}>
        <Table
          bordered
          dataSource={categories}
          columns={columns}
          rowKey={"_id"}
        />
      </Form>
    </Modal>
  );
};

export default Edit;
