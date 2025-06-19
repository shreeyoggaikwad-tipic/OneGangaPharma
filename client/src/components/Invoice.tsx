import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Download,
  Printer,
  Share,
  Receipt,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  User,
  CreditCard,
  Pill,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";

interface InvoiceProps {
  order: any;
  trigger?: React.ReactNode;
}

export default function Invoice({ order, trigger }: InvoiceProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long", 
      day: "numeric",
    });
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotals = () => {
    const orderItems = order.items || order.orderItems || [];
    
    const subtotal = orderItems.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.medicine.discountedPrice) * item.quantity);
    }, 0);
    
    const totalMrp = orderItems.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.medicine.mrp) * item.quantity);
    }, 0);
    
    const totalDiscount = totalMrp - subtotal;
    const deliveryCharges = subtotal >= 500 ? 0 : 50;
    const tax = subtotal * 0.05; // 5% tax
    const finalTotal = subtotal + deliveryCharges + tax;

    return {
      subtotal,
      totalMrp,
      totalDiscount,
      deliveryCharges,
      tax,
      finalTotal,
    };
  };

  const totals = calculateTotals();

  const generateQRCode = async () => {
    try {
      // Enhanced QR code with comprehensive order information
      const qrData = `🏥 SHARDA MED - Digital Invoice Verification
📋 Invoice: INV-${order.orderNumber}
🛒 Order: ${order.orderNumber}
💰 Total: ₹${totals.finalTotal.toFixed(2)}
📅 Date: ${formatDate(order.createdAt)}
⏰ Time: ${formatTime(order.createdAt)}
📦 Items: ${order.items?.length || 0} medicine(s)
🚚 Status: ${order.status?.toUpperCase()}
💳 Payment: ${order.paymentMethod?.toUpperCase() || 'COD'}
🌐 Verify at: https://shardamed.com/verify/${order.orderNumber}
📞 Support: +91-800-SHARDA (742732)
✅ Authentic Digital Receipt`;
      return await QRCode.toDataURL(qrData, { 
        width: 120,
        margin: 2,
        color: {
          dark: '#1e40af',  // Blue color for QR
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      return "";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    setIsGenerating(true);
    try {
      // Generate and inject QR code in both locations
      const qrCodeDataUrl = await generateQRCode();
      
      // Header QR code
      const qrElement = invoiceRef.current.querySelector('#invoice-qr-code') as HTMLImageElement;
      if (qrElement && qrCodeDataUrl) {
        qrElement.src = qrCodeDataUrl;
        qrElement.style.display = 'block';
      }
      
      // Footer QR code
      const qrElementFooter = invoiceRef.current.querySelector('#invoice-qr-code-footer') as HTMLImageElement;
      const qrPlaceholder = invoiceRef.current.querySelector('#qr-placeholder') as HTMLDivElement;
      if (qrElementFooter && qrCodeDataUrl) {
        qrElementFooter.src = qrCodeDataUrl;
        qrElementFooter.style.display = 'block';
        if (qrPlaceholder) qrPlaceholder.style.display = 'none';
      }

      // Wait for QR codes to render
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 1.8,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      // A4 dimensions with margins
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10;
      const contentWidth = pdfWidth - (2 * margin);
      const contentHeight = pdfHeight - (2 * margin);
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Scale to fit width with margins
      const scale = contentWidth / (imgWidth * 0.264583); // Convert pixels to mm
      const scaledHeight = (imgHeight * 0.264583) * scale;
      
      // Simple single page approach with better scaling
      const finalScale = Math.min(
        contentWidth / (imgWidth * 0.264583),
        contentHeight / (imgHeight * 0.264583)
      );
      
      const finalWidth = (imgWidth * 0.264583) * finalScale;
      const finalHeight = (imgHeight * 0.264583) * finalScale;
      
      // Center the image on the page
      const xPos = margin + (contentWidth - finalWidth) / 2;
      const yPos = margin;
      
      pdf.addImage(imgData, "PNG", xPos, yPos, finalWidth, finalHeight);

      pdf.save(`Invoice-${order.orderNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppShare = () => {
    const message = `*Sharda Med - Invoice*
    
Order #: ${order.orderNumber}
Date: ${formatDate(order.createdAt)}
Total Amount: ₹${totals.finalTotal.toFixed(2)}

Items:
${(order.items || order.orderItems || []).map((item: any) => 
  `• ${item.medicine.name} (${item.quantity}x) - ₹${(parseFloat(item.medicine.discountedPrice) * item.quantity).toFixed(2)}`
).join('\n')}

Thank you for shopping with Sharda Med!
For support: Call +91-XXXXXXXXXX`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Receipt className="h-4 w-4 mr-2" />
            Invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-6xl h-[95vh] max-h-[95vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-3 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <span className="text-lg sm:text-xl">₹</span>
              Invoice - {order.orderNumber}
            </DialogTitle>
          </DialogHeader>
          
          {/* Action Buttons - Fixed Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 border-b print:hidden flex-shrink-0 bg-gray-50">
            <div className="text-xs text-gray-500 hidden sm:block">
              Scroll down to view complete invoice
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
              >
                <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Print</span>
                <span className="sm:hidden">Print</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="text-green-600 hover:text-green-700 text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{isGenerating ? "Generating..." : "Download PDF"}</span>
                <span className="sm:hidden">{isGenerating ? "..." : "PDF"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsAppShare}
                className="text-green-600 hover:text-green-700 text-xs sm:text-sm"
              >
                <Share className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">WhatsApp</span>
                <span className="sm:hidden">Share</span>
              </Button>
            </div>
          </div>

          {/* Scrollable Invoice Content */}
          <div 
            className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative" 
            style={{ 
              maxHeight: 'calc(95vh - 140px)',
              scrollBehavior: 'smooth'
            }}
          >
            {/* Scroll indicator gradient at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none z-10 print:hidden"></div>
            <div 
              ref={invoiceRef}
              className="bg-white text-black p-3 sm:p-4 md:p-6 print:p-0 invoice-container invoice-content-enhanced"
              style={{ 
                fontFamily: "Arial, sans-serif", 
                maxWidth: '800px', 
                margin: '0 auto',
                lineHeight: '1.4'
              }}
            >
              {/* Professional Watermark */}
              <div className="invoice-watermark print:block hidden">SHARDA MED</div>
              <style>{`
                @media print {
                  * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  
                  body {
                    font-family: 'Segoe UI', 'Arial', sans-serif !important;
                  }
                  
                  .invoice-container {
                    box-shadow: 0 4px 20px rgba(30, 64, 175, 0.15) !important;
                    border: 3px solid #1e40af !important;
                    border-radius: 12px !important;
                    overflow: hidden !important;
                  }
                  
                  .invoice-header-enhanced {
                    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%) !important;
                    color: white !important;
                    padding: 24px !important;
                    margin: -24px -24px 24px -24px !important;
                    position: relative !important;
                  }
                  
                  .invoice-header-enhanced::before {
                    content: '' !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="20" cy="80" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="2" fill="rgba(255,255,255,0.1)"/></svg>') !important;
                    pointer-events: none !important;
                  }
                  
                  .invoice-badge {
                    display: inline-block !important;
                    padding: 4px 10px !important;
                    border-radius: 8px !important;
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    line-height: 1.2 !important;
                    white-space: nowrap !important;
                    vertical-align: baseline !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.8px !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
                  }
                  
                  .invoice-status-delivered {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                    color: white !important;
                  }
                  .invoice-status-processing {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
                    color: white !important;
                  }
                  .invoice-status-pending {
                    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
                    color: white !important;
                  }
                  .invoice-prescription-required {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
                    color: white !important;
                  }
                  
                  .invoice-flex-row {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    margin-bottom: 10px !important;
                    padding: 4px 0 !important;
                  }
                  
                  .invoice-table-enhanced {
                    border: 2px solid #e5e7eb !important;
                    border-radius: 12px !important;
                    overflow: hidden !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
                  }
                  
                  .invoice-table-enhanced th {
                    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important;
                    color: white !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 1px !important;
                    padding: 16px 12px !important;
                    border: none !important;
                    font-size: 12px !important;
                  }
                  
                  .invoice-table-enhanced td {
                    padding: 14px 12px !important;
                    border-bottom: 1px solid #f3f4f6 !important;
                    font-size: 11px !important;
                    vertical-align: middle !important;
                  }
                  
                  .invoice-table-enhanced tr:nth-child(even) {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
                  }
                  
                  .invoice-summary-enhanced {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
                    border: 2px solid #cbd5e1 !important;
                    border-radius: 12px !important;
                    padding: 20px !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
                  }
                  
                  .invoice-total-enhanced {
                    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important;
                    color: white !important;
                    padding: 16px 20px !important;
                    border-radius: 10px !important;
                    font-weight: 800 !important;
                    font-size: 20px !important;
                    text-align: center !important;
                    margin-top: 12px !important;
                    box-shadow: 0 6px 16px rgba(30, 64, 175, 0.3) !important;
                    text-transform: uppercase !important;
                    letter-spacing: 1px !important;
                  }
                  
                  .invoice-footer-enhanced {
                    background: linear-gradient(135deg, #1f2937 0%, #374151 100%) !important;
                    color: white !important;
                    padding: 24px !important;
                    margin: 24px -24px -24px -24px !important;
                    text-align: center !important;
                    position: relative !important;
                  }
                  
                  .invoice-qr-enhanced {
                    border: 3px solid #1e40af !important;
                    border-radius: 12px !important;
                    padding: 8px !important;
                    background: white !important;
                    box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2) !important;
                  }
                  
                  .invoice-company-name {
                    font-size: 32px !important;
                    font-weight: 900 !important;
                    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important;
                    -webkit-background-clip: text !important;
                    -webkit-text-fill-color: transparent !important;
                    background-clip: text !important;
                    text-shadow: 0 2px 4px rgba(30, 64, 175, 0.3) !important;
                  }
                  
                  .invoice-watermark {
                    position: fixed !important;
                    top: 45% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) rotate(-45deg) !important;
                    font-size: 120px !important;
                    color: rgba(30, 64, 175, 0.03) !important;
                    font-weight: 900 !important;
                    z-index: 0 !important;
                    pointer-events: none !important;
                    text-transform: uppercase !important;
                    letter-spacing: 8px !important;
                  }
                  
                  .invoice-content-enhanced {
                    position: relative !important;
                    z-index: 1 !important;
                  }
                }
              `}</style>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 sm:mb-8 gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2 invoice-company-name">Sharda Med</h1>
                <p className="text-gray-600 text-xs sm:text-sm">Your Trusted Online Pharmacy</p>
                <div className="mt-3 sm:mt-4 space-y-1 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                    <span>123 Medical Street, Healthcare City, HC 110001</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>+91-XXXXXXXXXX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>support@shardamed.com</span>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  ₹ INVOICE
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div><strong>Invoice #:</strong> INV-{order.orderNumber}</div>
                  <div><strong>Order #:</strong> {order.orderNumber}</div>
                  <div><strong>Date:</strong> {formatDate(order.createdAt)}</div>
                  <div><strong>Time:</strong> {formatTime(order.createdAt)}</div>
                </div>
                {/* QR Code Container */}
                <div className="mt-3 sm:mt-4 flex justify-start sm:justify-end">
                  <img 
                    id="invoice-qr-code" 
                    style={{ display: 'none' }}
                    className="w-16 h-16 sm:w-20 sm:h-20 invoice-qr-enhanced"
                    alt="Invoice QR Code"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-4 sm:my-6" />

            {/* Customer & Order Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  Bill To
                </h3>
                <div className="space-y-1 text-xs sm:text-sm">
                  {order.billingAddress ? (
                    <>
                      <div className="font-medium">{order.billingAddress.fullName}</div>
                      <div>{order.billingAddress.phone}</div>
                      <div className="mt-2">
                        <div className="font-medium">Billing Address:</div>
                        <div>{order.billingAddress.addressLine1}</div>
                        {order.billingAddress.addressLine2 && <div>{order.billingAddress.addressLine2}</div>}
                        <div>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}</div>
                      </div>
                      {order.shippingAddress && order.billingAddress.id !== order.shippingAddress.id && (
                        <div className="mt-3">
                          <div className="font-medium">Delivery Address:</div>
                          <div>{order.shippingAddress.fullName}</div>
                          <div>{order.shippingAddress.addressLine1}</div>
                          {order.shippingAddress.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
                          <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</div>
                          <div>Phone: {order.shippingAddress.phone}</div>
                        </div>
                      )}
                      {order.billingAddress.id === order.shippingAddress?.id && (
                        <div className="mt-2 text-xs italic text-gray-500">
                          (Delivery address same as billing address)
                        </div>
                      )}
                    </>
                  ) : order.shippingAddress ? (
                    <>
                      <div className="font-medium">{order.shippingAddress.fullName}</div>
                      <div>{order.shippingAddress.phone}</div>
                      <div className="mt-2">
                        <div className="font-medium">Address:</div>
                        <div>{order.shippingAddress.addressLine1}</div>
                        {order.shippingAddress.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
                        <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-medium">{order.user?.firstName} {order.user?.lastName}</div>
                      <div>{order.user?.email}</div>
                      <div>{order.user?.phone}</div>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                  Order Details
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="invoice-flex-row">
                    <span>Status:</span>
                    <span className={`invoice-badge ${
                      order.status === "delivered" ? "invoice-status-delivered" :
                      order.status === "processing" ? "invoice-status-processing" :
                      order.status === "shipped" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="invoice-flex-row">
                    <span>Payment Method:</span>
                    <span className="flex items-center gap-1">
                      <span className="text-xs">💳</span>
                      <span className="text-xs sm:text-sm">{order.paymentMethod || "COD"}</span>
                    </span>
                  </div>
                  <div className="invoice-flex-row">
                    <span>Payment Status:</span>
                    <span className={`invoice-badge ${
                      order.paymentStatus === "paid" ? "invoice-status-delivered" : "invoice-status-pending"
                    }`}>
                      {order.paymentStatus || "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Order Items */}
            <div className="mb-6 sm:mb-8">
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <Pill className="h-4 w-4 sm:h-5 sm:w-5" />
                Order Items
              </h3>
              
              <div className="border rounded-lg overflow-hidden">
                {/* Mobile responsive table */}
                <div className="hidden sm:block">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm">Item</th>
                        <th className="text-center p-2 sm:p-3 font-medium text-xs sm:text-sm">Qty</th>
                        <th className="text-right p-2 sm:p-3 font-medium text-xs sm:text-sm">MRP</th>
                        <th className="text-right p-2 sm:p-3 font-medium text-xs sm:text-sm">Price</th>
                        <th className="text-right p-2 sm:p-3 font-medium text-xs sm:text-sm">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || order.orderItems || []).map((item: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-2 sm:p-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                {item.medicine.frontImageUrl ? (
                                  <img
                                    src={item.medicine.frontImageUrl}
                                    alt={item.medicine.name}
                                    className="w-full h-full object-contain rounded-lg"
                                  />
                                ) : (
                                  <Package className="h-3 w-3 sm:h-5 sm:w-5 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-xs sm:text-sm">{item.medicine.name}</div>
                                <div className="text-xs text-gray-600">{item.medicine.dosage}</div>
                                {item.medicine.requiresPrescription && (
                                  <div className="invoice-badge invoice-prescription-required mt-1">
                                    Prescription Required
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">{item.quantity}</td>
                          <td className="p-2 sm:p-3 text-right text-gray-500 text-xs sm:text-sm">
                            ₹{parseFloat(item.medicine.mrp).toFixed(2)}
                          </td>
                          <td className="p-2 sm:p-3 text-right text-xs sm:text-sm">
                            ₹{parseFloat(item.medicine.discountedPrice).toFixed(2)}
                          </td>
                          <td className="p-2 sm:p-3 text-right font-medium text-xs sm:text-sm">
                            ₹{(parseFloat(item.medicine.discountedPrice) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card layout */}
                <div className="sm:hidden">
                  {(order.items || order.orderItems || []).map((item: any, index: number) => (
                    <div key={index} className="p-3 border-b last:border-b-0">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.medicine.frontImageUrl ? (
                            <img
                              src={item.medicine.frontImageUrl}
                              alt={item.medicine.name}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.medicine.name}</div>
                          <div className="text-xs text-gray-600 mb-2">{item.medicine.dosage}</div>
                          {item.medicine.requiresPrescription && (
                            <div className="invoice-badge invoice-prescription-required mb-2">
                              Prescription Required
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Qty: </span>
                              <span className="font-medium">{item.quantity}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">MRP: </span>
                              <span className="text-gray-500">₹{parseFloat(item.medicine.mrp).toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Price: </span>
                              <span className="font-medium">₹{parseFloat(item.medicine.discountedPrice).toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Total: </span>
                              <span className="font-medium">₹{(parseFloat(item.medicine.discountedPrice) * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-80 border rounded-lg p-3 sm:p-4 bg-gray-50">
                <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Order Summary</h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal (MRP):</span>
                    <span>₹{totals.totalMrp.toFixed(2)}</span>
                  </div>
                  {totals.totalDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Total Discount:</span>
                      <span>-₹{totals.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges:</span>
                    <span>{totals.deliveryCharges === 0 ? "FREE" : `₹${totals.deliveryCharges.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (5%):</span>
                    <span>₹{totals.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-sm sm:text-lg">
                    <span>Total Amount:</span>
                    <span>₹{totals.finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Terms & Conditions</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• All prescription medicines require valid prescription</li>
                    <li>• Return policy applicable within 7 days of delivery</li>
                    <li>• Check expiry dates upon delivery</li>
                    <li>• For queries, contact our support team</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-2">Scan for order details</div>
                  <img 
                    id="invoice-qr-code-footer" 
                    style={{ display: 'none' }}
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto border rounded-lg"
                    alt="Invoice QR Code"
                  />
                  <div 
                    id="qr-placeholder" 
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto border rounded-lg flex items-center justify-center"
                  >
                    <div className="text-xs text-gray-400">QR Code</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4 sm:mt-6 text-xs text-gray-500">
                Thank you for choosing Sharda Med - Your Health, Our Priority
              </div>
            </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}