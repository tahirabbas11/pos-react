import { useEffect, useState, useRef } from 'react';
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
  DatePicker,
  // Badge,
} from 'antd';
import {
  SearchOutlined,
  PlusCircleOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
// import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Extend dayjs with the plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(utc);
dayjs.extend(timezone);

const ExpensePage = () => {
  // const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]); // New state for filtered expenses
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const searchInput = useRef(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [startDate, setStartDate] = useState(null); // State for start date
  const [endDate, setEndDate] = useState(null); // State for end date

  const token = JSON.parse(localStorage.getItem('postUser'))?.token;

  useEffect(() => {
    fetchExpenses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update filtered expenses whenever startDate, endDate, or expenses change
  useEffect(() => {
    filterExpensesByDate();
  }, [startDate, endDate, expenses]); // eslint-disable-line react-hooks/exhaustive-deps

  const disableFutureDates = (currentDate) => {
    return currentDate && currentDate > dayjs().endOf('day');
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/expenses/get-all`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch expenses');
      let data = await response.json();
      data.reverse();
      setExpenses(data);
      setFilteredExpenses(data); // Initialize filtered expenses
    } catch (error) {
      message.error('Error fetching expenses: ' + error.message);
    }
  };

  const filterExpensesByDate = () => {
    let filtered = expenses;

    if (startDate) {
      // Include expenses from the selected start date onwards
      filtered = filtered.filter((expense) =>
        dayjs(expense.date).isSameOrAfter(startDate.startOf('day'))
      );
    }

    if (endDate) {
      // Include expenses up to the selected end date
      filtered = filtered.filter((expense) =>
        dayjs(expense.date).isSameOrBefore(endDate.endOf('day'))
      );
    }

    setFilteredExpenses(filtered); // Update filtered expenses
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

  const showModal = (expense = null) => {
    setIsModalVisible(true);
    if (expense) {
      setEditExpense(expense);
      form.setFieldsValue({
        ...expense,
        date: dayjs(expense.date),
      });
    } else {
      setEditExpense(null);
      form.resetFields(); // Reset only when creating a new expense
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditExpense(null); // Keep editExpense for retaining values
  };

  const handleAddOrUpdateExpense = async (values) => {
    try {
      if (editExpense) {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/expenses/update-expense`,
          {
            method: 'PUT',
            body: JSON.stringify({ expenseId: editExpense._id, ...values }),
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to update expense');
        fetchExpenses();
        message.success('Expense updated successfully.');
      } else {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/expenses/add-expense`,
          {
            method: 'POST',
            body: JSON.stringify(values),
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to add expense');
        fetchExpenses();
        message.success('Expense added successfully.');
      }

      setIsModalVisible(false);
      form.resetFields(); // Reset only on successful submission
      setEditExpense(null); // Reset edit state
    } catch (error) {
      message.error('Failed to save expense: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/expenses/delete-expense`,
        {
          method: 'DELETE',
          body: JSON.stringify({ expenseId: id }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchExpenses();
      message.success('Expense deleted successfully.');
    } catch (error) {
      message.error('Failed to delete expense: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ...getColumnSearchProps('title'),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      ...getColumnSearchProps('amount'),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
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
            title="Are you sure you want to delete this expense?"
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
        <div className="flex flex-col md:flex-row justify-end my-4 w-full">
          <div className="flex items-center w-full md:w-auto mb-2 md:mb-0 md:mr-2">
            <DatePicker
              placeholder="Start Date"
              onChange={(date) => setStartDate(date)}
              disabledDate={disableFutureDates} // Disable future dates
              className="w-full" // Full width on mobile
              value={startDate}
            />
          </div>
          <div className="flex items-center w-full md:w-auto mb-2 md:mb-0 md:mr-2">
            <DatePicker
              placeholder="End Date"
              onChange={(date) => setEndDate(date)}
              disabledDate={disableFutureDates} // Disable future dates
              className="mt-2 md:mt-0 md:ml-4 w-full"
              value={endDate}
            />
          </div>
          <div className="flex items-center w-full md:w-auto mb-2 md:mb-0">
            <Button
              onClick={() => {
                setEndDate(null);
                setStartDate(null);
              }}
              className="mt-2 md:mt-0 md:ml-4 w-full"
              variant="outlined"
              icon={<ClearOutlined />}
            >
              Clear Filter
            </Button>
          </div>
          <div className="flex items-center w-full md:w-auto mb-2 md:mb-0 ml-4">
            <Button
              type="primary"
              className="w-full md:w-auto"
              icon={<PlusCircleOutlined />}
              onClick={() => showModal()}
            >
              Add Expense
            </Button>
          </div>
        </div>
        <div className="flex justify-end my-4">
          {/* <div className="bg-gray-200 p-2 rounded"> */}
          <strong style={{ marginRight: 10 }}>Total Expense:</strong>
          {filteredExpenses
            ?.reduce((acc, curr) => acc + curr.amount, 0)
            ?.toFixed(2) || 0}
          {/* </div> */}
        </div>

        <div className="overflow-x-auto">
          {' '}
          {/* Makes the table scrollable horizontally on small screens */}
          <Table
            columns={columns}
            dataSource={filteredExpenses}
            pagination={pagination}
            onChange={(_, __, sorter) => {
              setPagination({
                current: sorter.current,
                pageSize: sorter.pageSize,
              });
            }}
          />
        </div>
        <Modal
          title={editExpense ? 'Edit Expense' : 'Add Expense'}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddOrUpdateExpense}
            initialValues={{
              title: '',
              amount: '',
              date: editExpense ? dayjs(editExpense.date) : dayjs(), // Set initial date to today or selected date
              description: '',
            }}
          >
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: 'Please enter a title!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Amount"
              name="amount"
              rules={[{ required: true, message: 'Please enter an amount!' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: 'Please select a date!' }]}
            >
              <DatePicker
                disabledDate={disableFutureDates}
                format="YYYY-MM-DD"
                className="w-full"
              />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">
                {editExpense ? 'Update Expense' : 'Add Expense'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default ExpensePage;
