import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, User, ShoppingBag, IndianRupee, Calendar, Phone, MapPin, Mail, ChevronDown, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CustomerReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Mock customer data - in real app, this would come from API
  const customers = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      phone: '+91 98765 43210',
      address: 'Shop No. 15, Main Market, Pimpri, Pune - 411018',
      joinDate: '2023-01-15',
      totalOrders: 24,
      totalSales: 18750.50,
      orders: [
        { id: 'ORD-001', date: '2024-09-15', amount: 1250.00, items: 5 },
        { id: 'ORD-002', date: '2024-09-10', amount: 850.75, items: 3 },
        { id: 'ORD-003', date: '2024-09-05', amount: 2100.25, items: 8 }
      ]
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 87654 32109',
      address: 'Flat 203, Sunrise Apartments, Chinchwad, Pune - 411033',
      joinDate: '2023-03-20',
      totalOrders: 18,
      totalSales: 12300.75,
      orders: [
        { id: 'ORD-004', date: '2024-09-18', amount: 750.00, items: 2 },
        { id: 'ORD-005', date: '2024-09-12', amount: 1450.50, items: 6 },
        { id: 'ORD-006', date: '2024-09-08', amount: 900.25, items: 4 }
      ]
    },
    {
      id: 3,
      name: 'Amit Patel',
      email: 'amit.patel@email.com',
      phone: '+91 76543 21098',
      address: 'House No. 45, Sector 12, Akurdi, Pune - 411035',
      joinDate: '2023-06-10',
      totalOrders: 31,
      totalSales: 25600.25,
      orders: [
        { id: 'ORD-007', date: '2024-09-19', amount: 1800.00, items: 7 },
        { id: 'ORD-008', date: '2024-09-16', amount: 950.75, items: 3 },
        { id: 'ORD-009', date: '2024-09-13', amount: 1200.50, items: 5 }
      ]
    },
    {
      id: 4,
      name: 'Suresh Kumar',
      email: 'suresh.kumar@email.com',
      phone: '+91 98765 43211',
      address: 'Shop No. 22, Market Road, Hadapsar, Pune - 411028',
      joinDate: '2023-04-05',
      totalOrders: 15,
      totalSales: 9800.00,
      orders: [
        { id: 'ORD-010', date: '2024-09-17', amount: 650.00, items: 3 },
        { id: 'ORD-011', date: '2024-09-14', amount: 1200.00, items: 5 }
      ]
    },
    {
      id: 5,
      name: 'Anita Desai',
      email: 'anita.desai@email.com',
      phone: '+91 87654 32108',
      address: 'Apartment 5B, Green Valley, Kothrud, Pune - 411038',
      joinDate: '2023-07-12',
      totalOrders: 22,
      totalSales: 15400.75,
      orders: [
        { id: 'ORD-012', date: '2024-09-19', amount: 850.50, items: 4 },
        { id: 'ORD-013', date: '2024-09-17', amount: 1300.25, items: 6 },
        { id: 'ORD-014', date: '2024-09-15', amount: 950.00, items: 3 }
      ]
    }
  ];

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return [];
    
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm]);

  // Handle input change with debouncing
  useEffect(() => {
    if (searchTerm) {
      setShowDropdown(true);
      setSelectedCustomer(null);
    } else {
      setShowDropdown(false);
      setSelectedCustomer(null);
    }
  }, [searchTerm]);

  // Hide dropdown when clicking outside
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

  // PDF Generation Function
  const generatePDF = async () => {
    if (!selectedCustomer || !reportRef.current) {
      alert('Please select a customer first');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      // Hide the download button temporarily to avoid capturing it
      const downloadBtn = document.querySelector('.download-btn');
      if (downloadBtn) {
        downloadBtn.style.visibility = 'hidden';
      }

      // Capture the report section
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

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add header to PDF
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Customer Report', 20, 20);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, 20, 30);
      pdf.text(`Customer: ${selectedCustomer.name}`, 20, 40);

      position = 50; // Start content after header

      // Add the captured image
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth - 20, heightLeft);
      heightLeft -= pageHeight;

      // Add additional pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth - 20, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const customerName = selectedCustomer.name.replace(/\s+/g, '_').toLowerCase();
      const filename = `customer_report_${customerName}_${Date.now()}.pdf`;

      // Download PDF
      pdf.save(filename);

      // Show notification
      showNotification('PDF downloaded successfully!', 'success');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      showNotification('Failed to generate PDF', 'error');
    } finally {
      // Restore the download button
      if (downloadBtn) {
        downloadBtn.style.visibility = 'visible';
      }
      setIsGeneratingPDF(false);
    }
  };

  // Notification system
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    
    // Add animation
    notification.style.transform = 'translateX(100%)';
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
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
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  // PDF-friendly version of the report (without interactive elements)
  const PDFReportContent = () => (
    <div className="pdf-report p-6 space-y-6">
      {/* Customer Info Card - PDF Version */}
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
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">{selectedCustomer.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">{selectedCustomer.phone}</span>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 break-words">{selectedCustomer.address}</span>
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

      {/* Stats Cards - PDF Version */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Sales</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(selectedCustomer.totalSales)}</p>
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

      {/* Recent Orders Table - PDF Version */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700 border-b">Order ID</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700 border-b">Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700 border-b">Items</th>
                <th className="text-right py-3 px-6 font-medium text-gray-700 border-b">Amount</th>
              </tr>
            </thead>
            <tbody>
              {selectedCustomer.orders.map((order, index) => (
                <tr key={order.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-3 px-6 font-medium text-teal-600 border-b">{order.id}</td>
                  <td className="py-3 px-6 text-gray-700 border-b">{formatDate(order.date)}</td>
                  <td className="py-3 px-6 text-gray-700 border-b">{order.items} items</td>
                  <td className="py-3 px-6 text-right font-semibold text-gray-900 border-b">
                    {formatCurrency(order.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-4 text-center text-sm text-gray-500">
        <p>Generated by Pharmacy Management System</p>
        <p>{new Date().toLocaleDateString('en-IN')} {new Date().toLocaleTimeString('en-IN')}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Reports</h1>
              <p className="text-gray-600 mt-1">Search and view detailed customer information and sales data</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Last updated</span>
              <span className="text-sm font-medium text-gray-700">3:36:06 pm</span>
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
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

            {/* Dropdown Results */}
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
                          {customer.totalOrders} orders • {formatCurrency(customer.totalSales)}
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

            {/* No Results Message */}
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

        {/* Customer Report */}
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Back Button and Download Button */}
            <div className="flex items-center justify-between">
              
              {/* Download PDF Button */}
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

            {/* Report Content - Reference for PDF */}
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