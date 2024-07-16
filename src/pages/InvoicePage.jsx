import Header from "../components/header/Header";
import { Table, Button, Input, Space, DatePicker } from "antd";
import { useEffect, useState, useRef } from "react";
import PrintInvoice from "../components/invoice/PrintInvoice";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { Spin } from "antd";

const InvoicePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoices, setInvoices] = useState();
  const [printData, setPrintData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalEarning, SetTotalEarning] = useState(0);
  const searchInput = useRef(null);

  useEffect(() => {
    const getInvoices = async () => {
      try {
        // Build query parameters conditionally
        const query = new URLSearchParams();
        if (startDate) {
          query.append("startDate", new Date(startDate).toISOString());
        }
        if (endDate) {
          const nextDay = new Date(endDate);
          nextDay.setDate(nextDay.getDate() + 1);
          query.append("endDate", nextDay.toISOString());
        }

        const res = await fetch(
          `${
            process.env.REACT_APP_SERVER_URL
          }/api/invoices/get-all?${query.toString()}`
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch invoices: ${res.statusText}`);
        }

        const data = await res.json();
        const newData = data.map((item) => ({
          ...item,
          key: item._id,
        }));

        console.log(newData);
        setInvoices(newData);
        SetTotalEarning(data.reduce((sum, order) => sum + order.subTotal, 0));
      } catch (error) {
        setInvoices([]);
        console.error("Error fetching invoices:", error); // Log the error for debugging
        // setError(error.message);
        console.log(error.message); // Display the error message to the user
      }
    };

    getInvoices();
  }, [startDate, endDate]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
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
            display: "block",
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
          color: filtered ? "#1890ff" : undefined,
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
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      ...getColumnSearchProps("customerName"),
    },
    {
      title: "Phone Number",
      dataIndex: "customerPhoneNumber",
      key: "customerPhoneNumber",
      ...getColumnSearchProps("customerPhoneNumber"),
    },
    {
      title: "Creation Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text, record) => {
        return <span>{text.substring(0, 10)}</span>;
      },
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMode",
      key: "paymentMode",
    },
    {
      title: "Total Price",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (text, record) => {
        return <span>{text}&nbsp;Rs</span>;
      },
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "100px",
      render: (text, record) => {
        return (
          <Button
            size="small"
            type="primary"
            className="mt-4 w-full"
            onClick={() => {
              setIsModalOpen(true);
              setPrintData(record);
            }}
          >
            Print
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Header />
      {invoices ? (
        <div className="px-6 min-h-[550px]">
          <h1 className="text-4xl text-center font-bold mb-4">Invoices</h1>
          <div className="mt-6 flex items-center">
            <p className="mr-2">Start Date:</p>
            <DatePicker onChange={(date) => setStartDate(date)} />
            <p className="mx-2">End Date:</p>
            <DatePicker onChange={(date) => setEndDate(date)} />
          </div>
          <div className="mt-4 flex justify-content">
            <p>Total Earninging :&nbsp;</p>
            <p className="font-bold">
              {totalEarning}
              &nbsp;Rs
            </p>
          </div>
          <Table
            dataSource={invoices}
            columns={columns}
            bordered
            pagination={true}
            scroll={{ x: 1200, y: 300 }}
            rowKey="_id"
            className="pt-6"
          />
        </div>
      ) : (
        <Spin size="large" className="absolute left-1/2 top-1/2" />
      )}

      <PrintInvoice
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        printData={printData}
      />
    </>
  );
};

export default InvoicePage;
