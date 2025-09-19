import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, User, ShoppingBag, IndianRupee, Calendar, Phone, MapPin, ChevronDown, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CustomerReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef(null);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [orders, setOrders] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);

  // Fetch all orders and unique customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const response = await fetch("http://localhost:5000/api/orders2");
        const result = await response.json();

        const orders = result.orders ?? [];
        setOrders(orders);

        const uniqueCustomers = Array.from(
          new Map(
            orders.map((order, index) => [
              order.customerName,
              {
                id: index + 1,
                name: order.customerName,
                phone: order.mobile_no,
                district: order.district,
                place: order.place,
                joinDate: order.createdAt,
                mobile_no : order.mobile_no,
                totalOrders: orders.filter(o => o.customerName === order.customerName).length,
              },
            ])
          ).values()
        );

        setCustomers(uniqueCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch orders for the selected customer from existing orders state
  useEffect(() => {
    if (selectedCustomer) {
      const filteredOrders = orders
        .filter(order => order.customerName === selectedCustomer.name)
        .map((order, index) => ({
          id: order.orderId || `ORD${index + 1}`,
          date: order.createdAt,
          items: order.medicines || [], // Expecting array of { name, quantity, price }
          amount: order.totalPrice || 0,
        }));

      setCustomerOrders(filteredOrders);
    } else {
      setCustomerOrders([]);
    }
  }, [selectedCustomer, orders]);

  useEffect(() => {
    console.log("Selected Customer Orders:", customerOrders);
  }, [customerOrders]);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return [];

    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm, customers]);

  useEffect(() => {
    if (searchTerm) {
      setShowDropdown(true);
      setSelectedCustomer(null);
    } else {
      setShowDropdown(false);
      setSelectedCustomer(null);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedCustomer || !showDropdown) return;

      const searchContainer = document.getElementById('search-container');
      if (searchContainer && !searchContainer.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCustomer, showDropdown]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setSearchTerm(customer.name);
    setShowDropdown(false);
  };

  const handleSearch = () => {
    if (filteredCustomers.length > 0) {
      setSelectedCustomer(filteredCustomers[0]);
      setSearchTerm(filteredCustomers[0].name);
      setShowDropdown(false);
    }
  };

  const generatePDF = async () => {
    if (!selectedCustomer || !reportRef.current) {
      alert('Please select a customer first');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const downloadBtn = document.querySelector('.download-btn');
      if (downloadBtn) {
        downloadBtn.style.visibility = 'hidden';
      }

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        width: reportRef.current.scrollWidth,
        height: reportRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Customer Report', 20, 20);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, 20, 30);
      pdf.text(`Customer: ${selectedCustomer.name}`, 20, 40);

      position = 50;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth - 20, heightLeft);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth - 20, imgHeight);
        heightLeft -= pageHeight;
      }

      const customerName = selectedCustomer.name.replace(/\s+/g, '_').toLowerCase();
      const filename = `customer_report_${customerName}_${Date.now()}.pdf`;

      pdf.save(filename);

      showNotification('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      showNotification('Failed to generate PDF', 'error');
    } finally {
      if (downloadBtn) {
        downloadBtn.style.visibility = 'visible';
      }
      setIsGeneratingPDF(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;

    notification.style.transform = 'translateX(100%)';
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getHighlightedName = (name, searchTerm) => {
    if (!searchTerm) return name;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = name.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

 const PDFReportContent = () => {
    const totalSales = customerOrders.reduce((sum, order) => 
        sum + (order.items && order.items.length > 0 
            ? order.items.reduce((itemSum, item) => itemSum + (item.quantity * item.mrp), 0) 
            : 0), 
    0);

    return (
      <div className="pdf-report p-6 space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6 border-b pb-4">
            <div className="bg-teal-100 p-3 rounded-full">
              <User className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
              <p className="text-gray-600">Customer ID: #{selectedCustomer.id.toString().padStart(4, '0')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{selectedCustomer.mobile_no}</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 break-words">{`${selectedCustomer.place}, ${selectedCustomer.district}`}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">Joined: {formatDate(selectedCustomer.joinDate)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Sales</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(totalSales)}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <IndianRupee className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold mt-1">{selectedCustomer.totalOrders}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <ShoppingBag className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-700 border-b">Order ID</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700 border-b">Date</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700 border-b">Item Name</th>
                  <th className="text-right py-3 px-6 font-medium text-gray-700 border-b">Quantity</th>
                  <th className="text-right py-3 px-6 font-medium text-gray-700 border-b">Price</th>
                  <th className="text-right py-3 px-6 font-medium text-gray-700 border-b">Total</th>
                  <th className="text-right py-3 px-6 font-medium text-gray-700 border-b">Grand Total</th>
                </tr>
              </thead>
              <tbody>
                {customerOrders.length > 0 ? (
                  customerOrders.map((order, orderIndex) =>
                    order.items && order.items.length > 0 ? (
                      order.items.map((item, itemIndex) => (
                        <tr
                          key={`${order.id}-${itemIndex}`}
                          className={orderIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                        >
                          {itemIndex === 0 && (
                            <>
                              <td
                                className="py-3 px-6 font-medium text-teal-600 border-b"
                                rowSpan={order.items.length}
                              >
                                {order.id}
                              </td>
                              <td
                                className="py-3 px-6 text-gray-700 border-b"
                                rowSpan={order.items.length}
                              >
                                {formatDate(order.date)}
                              </td>
                            </>
                          )}
                          <td className="py-3 px-6 text-gray-700 border-b">{item.name}</td>
                          <td className="py-3 px-6 text-right text-gray-700 border-b">{item.quantity}</td>
                          <td className="py-3 px-6 text-right text-gray-700 border-b">
                            {formatCurrency(item.mrp)}
                          </td>
                          <td className="py-3 px-6 text-right font-semibold text-gray-900 border-b">
                            {formatCurrency(item.quantity * item.mrp)}
                          </td>
                          {itemIndex === 0 && (
                            <td
                              className="py-3 px-6 text-right font-semibold text-gray-900 border-b"
                              rowSpan={order.items.length}
                            >
                              {formatCurrency(
                                order.items.reduce((sum, item) => sum + (item.quantity * item.mrp), 0)
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr key={order.id} className={orderIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-3 px-6 font-medium text-teal-600 border-b">{order.id}</td>
                        <td className="py-3 px-6 text-gray-700 border-b">{formatDate(order.date)}</td>
                        <td className="py-3 px-6 text-gray-700 border-b" colSpan={3}>
                          No items available
                        </td>
                        <td className="py-3 px-6 text-right font-semibold text-gray-900 border-b">
                          {formatCurrency(0)}
                        </td>
                        <td className="py-3 px-6 text-right font-semibold text-gray-900 border-b">
                          {formatCurrency(0)}
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td colSpan={7} className="py-3 px-6 text-center text-gray-500">
                      No orders found for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t pt-4 text-center text-sm text-gray-500">
          <p>Generated by Pharmacy Management System</p>
          <p>{new Date().toLocaleDateString('en-IN')} {new Date().toLocaleTimeString('en-IN')}</p>
        </div>
      </div>
    );
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Reports</h1>
              <p className="text-gray-600 mt-1">Search and view detailed customer information and sales data</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Last updated</span>
              <span className="text-sm font-medium text-gray-700">{new Date().toLocaleTimeString('en-IN')}</span>
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Customer</h2>
          <div id="search-container" className="relative">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                    if (e.key === 'Escape') {
                      setSearchTerm('');
                      setShowDropdown(false);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  autoComplete="off"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button
                onClick={handleSearch}
                disabled={!searchTerm || filteredCustomers.length === 0}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                Search
              </button>
            </div>

            {showDropdown && filteredCustomers.length > 0 && (
              <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="py-2">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-teal-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 ml-3">
                        <div className="flex items-center justify-between">
                          <div className="truncate">
                            <p className="text-sm font-medium text-gray-900">
                              {getHighlightedName(customer.name, searchTerm)}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {customer.phone}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {customer.totalOrders} orders
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredCustomers.length === 5 && (
                  <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
                    Showing top 5 results. Refine your search for more.
                  </div>
                )}
              </div>
            )}

            {showDropdown && searchTerm && filteredCustomers.length === 0 && (
              <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="px-4 py-4 text-center">
                  <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-900 font-medium mb-1">No customers found</p>
                  <p className="text-xs text-gray-500">
                    Try searching for: Rajesh Kumar, Priya Sharma, or Amit Patel
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setSearchTerm('');
                }}
                className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <span>Back to Search</span>
              </button>
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="download-btn flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Report</span>
                  </>
                )}
              </button>
            </div>

            <div ref={reportRef} className="print-section">
              <PDFReportContent />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerReport;