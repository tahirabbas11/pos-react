import {
  Button,
  Form,
  Input,
  Carousel,
  message,
  Card,
  Descriptions,
} from "antd";
import { Link } from "react-router-dom";
import AuthCarousel from "../../components/auth/AuthCarousel";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Logo from "../../Images/logo.png";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_SERVER_URL);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setContactInfo(data);
      } catch (error) {}
    };

    fetchContactInfo();
  },[]);
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await fetch(
        process.env.REACT_APP_SERVER_URL + "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify(values),
          headers: { "Content-type": "application/json; charset=UTF-8" },
        }
      );
      if (res.status === 200) {
        message.success("Registration process successful");
        navigate("/login");
        setLoading(false);
      }
    } catch (error) {
      message.error("Something went wrong!");
    }
  };

  return (
    <div className="h-screen">
      <div className="flex justify-between h-full">
        <div className="xl:w-2/6 min-w-[400px] xl:px-20 px-10 flex flex-col justify-center w-full relative">
          <h1 className="text-center text-5xl font-bold mb-6">
            {/* <Link to="/">LOGO</Link> */}
            <Link to="/">
              <img
                className="object-contain w-100 h-100"
                src={Logo}
                alt="Logo"
              />
            </Link>
          </h1>
          {/* <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Username"
              name={"userName"}
              rules={[
                {
                  required: true,
                  message: "Username field cannot be left blank!",
                }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Email"
              name={"email"}
              rules={[
                {
                  required: true,
                  message: "Email Field Cannot Be Left Blank!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Password"
              name={"password"}
              rules={[
                {
                  required: true,
                  message: "Password Field Cannot Be Left Blank!",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="Password Again"
              name={"passwordAgain"}
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Password Again field cannot be left blank!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords you entered do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                className="w-full"
                loading={loading}
              >
                Sign Up
              </Button>
            </Form.Item>
          </Form> */}
          <Card
            title={`Developer : ${contactInfo?.name}`}
            className="max-w-sm mx-auto"
          >
            <Descriptions column={1}>
              <Descriptions.Item label="GitHub">
                {contactInfo?.github && (
                  <a href={contactInfo.github}>tahirabbas11</a>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                {contactInfo?.contact && (
                  <a href={contactInfo.contact}>{contactInfo.contact}</a>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {contactInfo?.contact && (
                  <a href={contactInfo.email}>{contactInfo.email}</a>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <div className="pt-10 left-0 w-full flex items-center justify-center">
            Do you have an account?
            <Link to="/login" className="text-blue-600 inline-block p-2">
              Now, log in
            </Link>
          </div>
        </div>
        <div className="sm:flex hidden xl:w-4/6 min-w-[500px] bg-[#6c63ff]" >
          <div className="w-full mt-40">
            <Carousel autoplay>
              <AuthCarousel
                img={"images/responsive.svg"}
                title={"Responsive"}
                desc={"Compability with all device sizes"}
              />
              <AuthCarousel
                img={"images/statistic.svg"}
                title={"Statistics"}
                desc={"Wide-ranging Statistics"}
              />
              <AuthCarousel
                img={"images/customer.svg"}
                title={"Customer Satisfaction"}
                desc={"Satisfied Customers at the End of the Product Journey"}
              />
              <AuthCarousel
                img={"images/admin.svg"}
                title={"Admin Panel"}
                desc={"Centralized Management"}
              />
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;