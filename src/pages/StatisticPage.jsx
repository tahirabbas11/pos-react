import Header from '../components/header/Header';
import StatisticCard from '../components/statistic/StatisticCard';
import React, { useState, useEffect } from 'react';
import { Area, Pie } from '@ant-design/plots';
import { Spin, DatePicker, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs'; // Ensure dayjs is installed
import { ClearOutlined } from '@ant-design/icons';

// const { RangePicker } = DatePicker;

const StatisticPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [products, setProducts] = useState([]);
  const [startDate, setStartDate] = useState(null); // Start date
  const [endDate, setEndDate] = useState(null); // End date
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [totals, setTotals] = useState({
    totalSales: 0,
    totalCost: 0,
    profit: 0,
    profitPercentage: 0,
    totalAmount: 0,
    totalExpenses: 0,
  });

  useEffect(() => {
    asyncFetch();
    getProduct();
    fetchExpenses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    calculateTotals();
  }, [filteredData, filteredExpenses]); // eslint-disable-line react-hooks/exhaustive-deps

  const getProduct = async () => {
    try {
      const res = await fetch(
        process.env.REACT_APP_SERVER_URL + '/api/products/get-all',
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('postUser'))?.token}`,
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

  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/expenses/get-all`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('postUser'))?.token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data);
      setFilteredExpenses(data);
    } catch (error) {
      message.error('Error fetching expenses: ' + error.message);
    }
  };

  const asyncFetch = () => {
    fetch(process.env.REACT_APP_SERVER_URL + '/api/invoices/get-all', {
      headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('postUser'))?.token}`,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        setData(json);
        setFilteredData(json); // Initialize with all data
      })
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };

  const filterDataByDate = () => {
    const start = startDate ? new Date(startDate).getTime() : null; // Start date in milliseconds
    const end = endDate ? new Date(endDate).getTime() + 86400000 : null; // End date in milliseconds
    // Check the conditions for filtering
    if (!start && !end) {
      // No dates selected
      message.error('Please select at least one date.');
      return;
    }

    const filtered = data.filter((item) => {
      const invoiceDate = new Date(item.createdAt).getTime(); // Convert invoice date to milliseconds

      // Apply filtering logic based on the start and end date selections
      const isStartValid = start ? invoiceDate >= start : true; // If start date is selected
      const isEndValid = end ? invoiceDate <= end : true;

      return isStartValid && isEndValid;
    });

    const filteredExpense = expenses.filter((item) => {
      const expenseDate = new Date(item.date).getTime();
      const isStartValid = start ? expenseDate >= start : true;
      const isEndValid = end ? expenseDate <= end : true;

      return isStartValid && isEndValid;
    });
    setFilteredData(filtered);
    setFilteredExpenses(filteredExpense);
  };

  const calculateTotals = () => {
    let totalSales = 0;
    let totalCost = 0;

    filteredData.forEach((order) => {
      order.cartItems.forEach((item) => {
        // Calculate the total sales and total cost for each item
        totalSales += item.price * item.quantity;
        totalCost += item.vendorPrice * item.quantity;
      });
    });

    // Calculate profit and profit percentage
    const profit = totalSales - totalCost;
    const profitPercentage = totalSales ? (profit / totalSales) * 100 : 0;

    // Calculate total amount
    const totalAmount = filteredData.reduce(
      (total, item) => item.totalAmount + total,
      0
    );

    // Calculate total expenses
    const totalExpenses = filteredExpenses.reduce(
      (total, item) => item.amount + total,
      0
    );

    // Update state with calculated values
    setTotals({
      totalSales,
      totalCost,
      profit,
      profitPercentage,
      totalAmount,
      totalExpenses,
    });
  };

  // Call `calculateTotals` when necessary, such as in a useEffect or based on an event

  const config = {
    data: filteredData,
    xField: 'customerName',
    yField: 'subTotal',
    xAxis: {
      range: [0, 1],
    },
  };

  const config2 = {
    appendPadding: 10,
    data: filteredData,
    angleField: 'subTotal',
    colorField: 'customerName',
    radius: 1,
    innerRadius: 0.6,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14,
      },
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: 'Total Sales',
      },
    },
  };

  const localStr = localStorage.getItem('postUser');
  //eslint-disable-next-line
  const user = JSON.parse(localStr);

  return (
    <>
      <Header />
      {data.length > 0 ? (
        <div className="px-6 md:pb-0 pb-20">
          <h1 className="text-4xl text-center font-bold mb-4">Statistics</h1>
          <div>
            <div className="flex flex-col md:flex-row justify-end mb-4 w-full">
              <div className="flex items-center w-full md:w-auto mb-2 md:mb-0 md:mr-2">
                <DatePicker
                  value={startDate ? dayjs(startDate) : null} // Control the start date picker with the state
                  onChange={(date) => {
                    console.log('Start Date:', date);
                    setStartDate(date); // Update the start date state
                  }}
                  format="YYYY-MM-DD"
                  placeholder="Select Start Date"
                  className="w-full" // Full width on mobile
                />
              </div>
              <div className="flex items-center w-full md:w-auto mb-2 md:mb-0 md:mr-2">
                <DatePicker
                  value={endDate ? dayjs(endDate) : null} // Control the end date picker with the state
                  onChange={(date) => {
                    console.log('End Date:', date);
                    setEndDate(date); // Update the end date state
                  }}
                  format="YYYY-MM-DD"
                  placeholder="Select End Date"
                  className="w-full" // Full width on mobile
                />
              </div>
              <div className="flex items-center w-full md:w-auto mb-2 md:mb-0 md:mr-2">
                <Button
                  onClick={() => {
                    setEndDate(null);
                    setStartDate(null);
                    asyncFetch();
                  }}
                  className="w-full"
                  variant="outlined"
                  icon={<ClearOutlined />}
                >
                  Clear Filter
                </Button>
              </div>
              <div className="flex items-center w-full md:w-auto mb-2 md:mb-0 md:mr-2">
                <Button
                  type="primary"
                  onClick={filterDataByDate}
                  className="w-full md:w-auto"
                >
                  Filter
                </Button>
              </div>
            </div>

            <div className="statistic-cards grid xl:grid-cols-6 md:grid-cols-4 my-10 md:gap-2 gap-1">
  <StatisticCard
    title="Total Sales"
    amount={filteredData.length}
    image="images/sale.png"
  />
  <StatisticCard
    title="Total Products"
    amount={products.length}
    image="images/product.png"
  />
  <StatisticCard
    title="Total Sales"
    amount={`${totals.totalAmount.toFixed(2)} Rs`}
    image="images/money.png"
  />

  <StatisticCard
    title="Total Expenses"
    amount={`${totals.totalExpenses.toFixed(2)} Rs`}
    image="images/money.png"
  />
    <StatisticCard
    title="Total Profit"
    amount={`${totals.profit.toFixed(2)} Rs`}
    image="images/money.png"
    percentage={totals.profitPercentage.toFixed(2)}
  />
  <StatisticCard
    title="Net Profit"
    amount={`${(totals.profit - totals.totalExpenses).toFixed(2)} Rs`}
    image="images/money.png"
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
