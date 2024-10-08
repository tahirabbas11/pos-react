import Header from "../components/header/Header";
import StatisticCard from "../components/statistic/StatisticCard";
import React, { useState, useEffect } from "react";
import { Area, Pie } from "@ant-design/plots";
import { Spin, DatePicker, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs"; // Ensure dayjs is installed

const { RangePicker } = DatePicker;

const StatisticPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [products, setProducts] = useState([]);
  const [startDate, setStartDate] = useState(null); // Start date
  const [endDate, setEndDate] = useState(null); // End date

  useEffect(() => {
    asyncFetch();
    getProduct();
  }, []);

  const getProduct = async () => {
    try {
      const res = await fetch(
        process.env.REACT_APP_SERVER_URL + "/api/products/get-all",
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("postUser"))?.token}`,
          },
        }
      );
      if (res.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.log(error);
    }
  };

  const asyncFetch = () => {
    fetch(process.env.REACT_APP_SERVER_URL + "/api/invoices/get-all", {
      headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem("postUser"))?.token}`,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        setData(json);
        setFilteredData(json); // Initialize with all data
      })
      .catch((error) => {
        console.log("fetch data failed", error);
      });
  };

  const filterDataByDate = () => {
    const start = startDate ? new Date(startDate).getTime() : null; // Start date in milliseconds
    const end = endDate ? new Date(endDate).getTime()+86400000 : null; // End date in milliseconds

    // // Log the start and end dates
    // console.log("Start Date:", start ? new Date(start).toISOString().split('T')[0] : "Not selected");
    // console.log("End Date:", end ? new Date(end).toISOString().split('T')[0] : "Not selected");

    // Check the conditions for filtering
    if (!start && !end) {
      // No dates selected
      message.error("Please select at least one date.");
      return;
    }

    const filtered = data.filter((item) => {
      const invoiceDate = new Date(item.createdAt).getTime(); // Convert invoice date to milliseconds

      // Apply filtering logic based on the start and end date selections
      const isStartValid = start ? invoiceDate >= start : true; // If start date is selected
      const isEndValid = end ? invoiceDate <= end : true; // If end date is selected

      return isStartValid && isEndValid; // Return true if both conditions are satisfied
    });

    setFilteredData(filtered);
  };

  const totalAmount = () => {
    const amount = filteredData.reduce((total, item) => item.totalAmount + total, 0);
    return `${amount.toFixed(2)} Rs`;
  };

  const config = {
    data: filteredData,
    xField: "customerName",
    yField: "subTotal",
    xAxis: {
      range: [0, 1],
    },
  };

  const config2 = {
    appendPadding: 10,
    data: filteredData,
    angleField: "subTotal",
    colorField: "customerName",
    radius: 1,
    innerRadius: 0.6,
    label: {
      type: "inner",
      offset: "-50%",
      content: "{value}",
      style: {
        textAlign: "center",
        fontSize: 14,
      },
    },
    interactions: [
      {
        type: "element-selected",
      },
      {
        type: "element-active",
      },
    ],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: "pre-wrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
        content: "Total Sales",
      },
    },
  };

  const localStr = localStorage.getItem("postUser");
  const user = JSON.parse(localStr);

  return (
    <>
      <Header />
      {data.length > 0 ? (
        <div className="px-6 md:pb-0 pb-20">
          <h1 className="text-4xl text-center font-bold mb-4">Statistics</h1>
          <div>
            <h2 className="text-lg">
              Welcome{" "}
              <span className="text-xl text-green-700 font-bold">
                {user.username}
              </span>
            </h2>
            <div className="flex justify-end mb-4">
              <DatePicker
                value={startDate ? dayjs(startDate) : null} // Control the start date picker with the state
                onChange={(date) => {
                  console.log("Start Date:", date);
                  setStartDate(date); // Update the start date state
                }}
                format="YYYY-MM-DD"
                placeholder="Select Start Date"
                className="mr-4"
              />
              <DatePicker
                value={endDate ? dayjs(endDate) : null} // Control the end date picker with the state
                onChange={(date) => {
                  console.log("End Date:", date);
                  setEndDate(date); // Update the end date state
                }}
                format="YYYY-MM-DD"
                placeholder="Select End Date"
                 className="mr-4"
              />
              <Button type="primary" onClick={filterDataByDate} className="ml-2">
                Filter
              </Button>
            </div>
            <div className="statistic-cards grid xl:grid-cols-4 md:grid-cols-2 my-10 md:gap-10 gap-4">
              <StatisticCard
                title={"Total Customers"}
                amount={filteredData.length}
                image={"images/user.png"}
              />
              <StatisticCard
                title={"Total Profit"}
                amount={totalAmount()}
                image={"images/money.png"}
              />
              <StatisticCard
                title={"Total Sales"}
                amount={filteredData.length}
                image={"images/sale.png"}
              />
              <StatisticCard
                title={"Total Products"}
                amount={products.length}
                image={"images/product.png"}
              />
            </div>
            <div className="flex justify-between gap-10 lg:flex-row flex-col md:p-10 p-4">
              <div className="lg:w-1/2 lg:h-72 h-72">
                <Area {...config} />
              </div>
              <div className="lg:w-1/2 lg:h-72 h-72">
                <Pie {...config2} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Spin size="large" className="absolute left-1/2 top-1/2" />
      )}
    </>
  );
};

export default StatisticPage;
