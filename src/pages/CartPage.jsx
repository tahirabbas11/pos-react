import Header from '../components/header/Header';
import { Table, Card, Button, message, Popconfirm, Input, Space } from 'antd';
import { useRef, useState } from 'react';
import CreateInvoice from '../components/cart/CreateInvoice';
import { useDispatch, useSelector } from 'react-redux';
import {
  PlusCircleOutlined,
  MinusCircleOutlined,
  ClearOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  increase,
  decrease,
  deleteProduct,
  reset,
  applyDiscount,
  updateQuantity,
} from '../redux/cartSlice';
import Highlighter from 'react-highlight-words';

const CartPage = () => {
  const cart = useSelector((state) => state.cart);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

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
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
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
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
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
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
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
      title: 'Product Image',
      dataIndex: 'img',
      key: 'img',
      width: '120px',
      render: (text) => (
        <img src={text} alt="" className="w-full h-20 object-cover" />
      ),
    },
    {
      title: 'Product Name',
      dataIndex: 'title',
      key: 'title',
      ...getColumnSearchProps('title'),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      ...getColumnSearchProps('category'),
    },
    {
      title: 'Product Price',
      dataIndex: 'price',
      key: 'price',
      render: (text) => <span>{text.toFixed(2)}&nbsp;Rs</span>,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Product Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => (
        <div className="flex items-center">
          <Button
            type="primary"
            size="small"
            className="w-full flex items-center justify-center !rounded-full"
            icon={<PlusCircleOutlined />}
            onClick={() => dispatch(increase(record))}
          />
          <input
            type="number"
            value={record.quantity}
            min={1}
            max={record.totalQuantity} // Set the max to the total available quantity
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value > record.totalQuantity) {
                message.error(
                  `Cannot exceed total quantity of ${record.totalQuantity}.`
                );
              } else if (value < 1) {
                message.error('Quantity cannot be less than 1.');
              } else {
                // Dispatch an action to update the quantity in the cart
                dispatch(updateQuantity({ ...record, quantity: value }));
              }
            }}
            className="w-12 text-center border rounded mx-2"
          />

          {record.quantity > 1 ? (
            <Button
              type="primary"
              size="small"
              className="w-full flex items-center justify-center !rounded-full"
              icon={<MinusCircleOutlined />}
              onClick={() => dispatch(decrease(record))} // Directly decrease if quantity > 1
            />
          ) : (
            <Popconfirm
              title="Are you sure you want to delete the product?"
              onConfirm={() => {
                dispatch(deleteProduct(record));
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                size="small"
                className="w-full flex items-center justify-center !rounded-full"
                icon={<MinusCircleOutlined />}
                onClick={(e) => e.stopPropagation()} // Prevent event bubbling
              />
            </Popconfirm>
          )}
        </div>
      ),
    },

    {
      title: 'Total Stock',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      render: (text, record) => (
        <Card className="w-full">
          <p className="font-bold text-center">{record.totalQuantity}</p>
          <p className="text-sm text-gray-500 text-center">
            remaining {record.totalQuantity - record.quantity}
          </p>
        </Card>
      ),
    },
    {
      title: 'Discount Price (%)',
      dataIndex: 'discountPrice',
      key: 'discountPrice',
      render: (text, record) => (
        <Input
          type="number"
          min={0}
          max={100}
          value={record.discount}
          onChange={(e) => {
            const discountValue = Number(e.target.value);
            dispatch(
              applyDiscount({
                discountType: 'product',
                value: { productId: record._id, discount: discountValue },
              })
            );
          }}
        />
      ),
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (text, record) => {
        return (
          <div className="text-right">
            <div>{record.discountPricePerPiece}&nbsp;Rs</div>{' '}
            {/* Discounted price per piece */}
            <div>x {record.quantity}</div> {/* Quantity */}
            <div className="border-b border-gray-300 my-1"></div>
            <div>
              <strong>{record.totalproductprice}&nbsp;Rs</strong>
            </div>{' '}
            {/* Total price */}
          </div>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: '100px',
      render: (text, record) => (
        <Popconfirm
          title="Delete Product"
          description="Are you sure you want to delete the product?"
          okText="Yes"
          cancelText="No"
          onConfirm={() => dispatch(deleteProduct(record))}
        >
          <Button type="primary" danger>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Header />
      <div className="px-6">
        <Table
          dataSource={cart.cartItems}
          columns={columns}
          bordered
          pagination={false}
          scroll={{ x: 1200, y: 400 }}
        />
        <div className="flex justify-end mt-4 mb-16">
          <Card className="w-72">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                {cart?.subtotal ? cart.subtotal.toFixed(2) : '-'}&nbsp;Rs
              </span>
            </div>
            <div className="flex justify-between my-2">
              <span>Tax {cart.tax}%</span>
              <span className="text-red-600">
                {(cart.total * cart.tax) / 100 > 0
                  ? `+${((cart.total * cart.tax) / 100).toFixed(2)}`
                  : 0}
                &nbsp;Rs
              </span>
            </div>
            <div className="flex justify-between my-2">
              <span>Discount %</span>
              <Input
                type="number"
                value={cart.discount}
                min={0}
                max={100}
                size="small"
                style={{ width: 80 }}
                onChange={(e) => {
                  const overallDiscountValue = Number(e.target.value);
                  dispatch(
                    applyDiscount({
                      discountType: 'overall',
                      value: overallDiscountValue,
                    })
                  );
                }}
              />
            </div>
            <div className="flex justify-between">
              <b>Total</b>
              <b>{cart.total}&nbsp;Rs</b>
            </div>
            <Button
              type="primary"
              size="large"
              className="w-full mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              Create Order
            </Button>
          </Card>
        </div>
      </div>
      <CreateInvoice
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};

export default CartPage;
