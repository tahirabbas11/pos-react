import { Modal, Button } from "antd";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Logo from "../../Images/logo.png";

const PrintInvoice = ({ isModalOpen, setIsModalOpen, printData }) => {
  const compnentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => compnentRef.current,
  });

  return (
    <Modal
      title="Shan Foods Invoice"
      open={isModalOpen}
      footer={false}
      onCancel={() => setIsModalOpen(false)}
      width={800}
    >
      <section className=" bg-white" ref={compnentRef}>
        <div className="bg-white px-6 max-w-5xl mx-auto">
          <article className="overflow-hidden">
            <div className="logo ">
              {/* <h2 className="text-4xl font-bold text-slate-700">LOGO</h2> */}
              <div className="flex justify-center items-center">
                <img
                  className="object-contain"
                  src={Logo}
                  alt="Logo"
                  style={{ width: "250px", height: "auto" }} // Set the desired width and height
                />
              </div>
            </div>
            <div className="invoice-details">
              <div className="grid sm:grid-cols-4 grid-cols-3 gap-12">
                <div className="text-md">
                  <p className="font-bold">Invoice Details</p>
                  <p className="text-green-600">{printData?.customerName}</p>
                  <p>Tel: {printData?.customerPhoneNumber}</p>
                </div>
                <div className="text-md">
                  <p className="font-bold">Invoice</p>
                  <p>{printData?.paymentMode}</p>
                </div>
                <div className="text-md">
                  <p className="font-bold">Invoice Number</p>
                  <p>00{Math.floor(Math.random() * 100)}</p>
                  {/* <p className="font-bold mt-2">Issue Date</p>
                  <p>{printData?.createdAt?.substring(0, 10)}</p> */}
                </div>
                <div className="text-md sm:block hidden">
                <p className="font-bold">Issue Date</p>
                <p>{printData?.createdAt?.substring(0, 10)}</p>
                  {/* <p className="font-bold">Conditions</p>
                  <p>10 Days</p>
                  <p className="font-bold mt-2">Due Date</p>
                  <p>12.03.2023</p> */}
                </div>
              </div>
            </div>
            <div className="bill-table-area mt-8">
              <table className="min-w-full divide-y divide-slate-500 overflow-hidden">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 text-left text-sm font-normal text-slate-700 md:pl-0 sm:table-cell hidden"
                    >
                      Image
                    </th>
                    <th
                      scope="col"
                      className="sm:w-auto w-full py-3.5 text-left text-sm font-normal text-slate-700 md:pl-0"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 text-center text-sm font-normal text-slate-700 md:pl-0 sm:table-cell hidden"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 text-center text-sm font-normal text-slate-700 md:pl-0 sm:table-cell hidden"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 text-end text-sm font-normal text-slate-700 md:pl-0"
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {printData?.cartItems?.map((item) => (
                    <tr
                      className="border-t border-b border-slate-200"
                      key={item._id}
                    >
                      <td className="py-4 sm:table-cell hidden">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-12 h-12 object-cover"
                        />
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.title}</span>
                          <span className="sm:hidden inline-block text-xs">
                            Unit Price {item.price.toFixed(2)} Rs
                          </span>
                        </div>
                      </td>
                      <td className="py-4 sm:text-center text-right sm:table-cell hidden">
                        <span>{item.price.toFixed(2)} Rs</span>
                      </td>
                      <td className="py-4 sm:text-center text-right sm:table-cell hidden">
                        <span>{item.quantity}</span>
                      </td>
                      <td className="py-4 text-end">
                        <span>
                          {(item.quantity * item.price).toFixed(2)} Rs
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th
                      className="text-right sm:table-cell hidden pt-4"
                      colSpan={4}
                      scope="row"
                    >
                      <span className="font-normal text-slate-700">
                        Total Amount
                      </span>
                    </th>
                    <th className="text-left sm:hidden py-2" scope="row">
                      <p className="font-normal text-slate-700">Total Amount</p>
                    </th>
                    <th className="text-right">
                      <span className="font-normal text-slate-700">
                        {printData?.subTotal?.toFixed(2)} Rs
                      </span>
                    </th>
                  </tr>
                  <tr>
                    <th
                      className="text-right sm:table-cell hidden"
                      colSpan={4}
                      scope="row"
                    >
                      <span className="font-normal text-red-400">Tax</span>
                    </th>
                    <th className="text-left sm:hidden" scope="row">
                      <p className="font-normal text-red-400">Tax</p>
                    </th>
                    <th className="text-right">
                      <span className="font-normal text-red-400">
                        +{printData.tax} Rs
                      </span>
                    </th>
                  </tr>
                  <tr>
                    <th
                      className="text-right sm:table-cell hidden"
                      colSpan={4}
                      scope="row"
                    >
                      <span className="font-bold text-slate-700">
                        Grand Total
                      </span>
                    </th>
                    <th className="text-left sm:hidden" scope="row">
                      <p className="font-bold text-slate-700">Grand Total</p>
                    </th>
                    <th className="text-right">
                      <span className="font-normal text-slate-700">
                        {printData.totalAmount} Rs
                      </span>
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="py-6">
              <div className="border-t pt-9 border-slate-200">
                <p className="text-sm font-light text-slate-700">
                We are Shan Food, delivering the best taste to your doorstep with a commitment to exceptional quality and unforgettable flavor. Experience the difference with every bite!
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
      <div className="flex justify-end mt-4">
        <Button type="primary" size="large" onClick={handlePrint}>
          Print
        </Button>
      </div>
    </Modal>
  );
};

export default PrintInvoice;
