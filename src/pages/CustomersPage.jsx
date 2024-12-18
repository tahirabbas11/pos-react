import Header from '../components/header/Header';
import { Table, Button, Input, Space, Spin } from 'antd';
import { useEffect, useState, useRef } from 'react';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const InvoicePage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  useEffect(() => {
    const getInvoices = async () => {
      const token = JSON.parse(localStorage.getItem('postUser'))?.token;

      // console.log("token", token);

      try {
        const res = await fetch(
          process.env.REACT_APP_SERVER_URL + '/api/invoices/get-all',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`, // Using the retrieved token
            },
          }
        );
        if (res.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
        const data = await res.json();
        const newData = data.map((item) => {
          return { ...item, key: item._id };
        });
        setInvoices(newData);
      } catch (error) {
        console.log(error);
      }
    };

    getInvoices();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });
  const columns = [
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
      ...getColumnSearchProps('customerName'),
    },
    {
      title: 'Phone Number',
      dataIndex: 'customerPhoneNumber',
      key: 'customerPhoneNumber',
      ...getColumnSearchProps('customerPhoneNumber'),
    },
    {
      title: 'Operation Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text, record) => {
        return <span>{text.substring(0, 10)}</span>;
      },
    },
  ];

  return (
    <>
      <Header />
      {invoices ? (
        <div className="px-6 min-h-[550px]">
          <h1 className="text-4xl text-center font-bold mb-4">Customers</h1>
          <div className="overflow-x-auto">
            {' '}
            {/* Makes the table scrollable horizontally on small screens */}
            <Table
              dataSource={invoices}
              columns={columns}
              bordered
              pagination={{
                pageSizeOptions: ['10', '20', '30'],
                showSizeChanger: true,
                pageSize: 10,
              }}
              rowKey="_id"
            />
          </div>
        </div>
      ) : (
        <Spin size="large" className="absolute left-1/2 top-1/2" />
      )}
    </>
  );
};

export default InvoicePage;
