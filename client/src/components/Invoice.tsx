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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
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
      const qrData = `Invoice: ${order.orderNumber}\nTotal: ₹${totals.finalTotal.toFixed(2)}\nDate: ${formatDate(order.createdAt)}`;
      return await QRCode.toDataURL(qrData, { width: 100 });
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
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoice - {order.orderNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mb-4 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-blue-600 hover:text-blue-700"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="text-green-600 hover:text-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Download PDF"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsAppShare}
              className="text-green-600 hover:text-green-700"
            >
              <Share className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>

          {/* Invoice Content */}
          <div 
            ref={invoiceRef}
            className="flex-1 overflow-y-auto bg-white text-black p-6 print:p-0"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-blue-600 mb-2">Sharda Med</h1>
                <p className="text-gray-600 text-sm">Your Trusted Online Pharmacy</p>
                <div className="mt-4 space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>123 Medical Street, Healthcare City, HC 110001</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>+91-XXXXXXXXXX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>support@shardamed.com</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800 mb-2">INVOICE</div>
                <div className="space-y-1 text-sm">
                  <div><strong>Invoice #:</strong> INV-{order.orderNumber}</div>
                  <div><strong>Order #:</strong> {order.orderNumber}</div>
                  <div><strong>Date:</strong> {formatDate(order.createdAt)}</div>
                  <div><strong>Time:</strong> {formatTime(order.createdAt)}</div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Customer & Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Bill To
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="font-medium">{order.user?.firstName} {order.user?.lastName}</div>
                  <div>{order.user?.email}</div>
                  <div>{order.user?.phone}</div>
                  {order.shippingAddress && (
                    <div className="mt-2">
                      <div className="font-medium">Delivery Address:</div>
                      <div>{order.shippingAddress.addressLine1}</div>
                      {order.shippingAddress.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
                      <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={
                      order.status === "delivered" ? "default" :
                      order.status === "processing" ? "secondary" :
                      order.status === "shipped" ? "outline" : "destructive"
                    }>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      {order.paymentMethod || "Cash on Delivery"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <Badge variant={order.paymentStatus === "paid" ? "default" : "outline"}>
                      {order.paymentStatus || "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Order Items */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Order Items
              </h3>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-medium">Item</th>
                      <th className="text-center p-3 font-medium">Qty</th>
                      <th className="text-right p-3 font-medium">MRP</th>
                      <th className="text-right p-3 font-medium">Price</th>
                      <th className="text-right p-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item: any, index: number) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                            <div>
                              <div className="font-medium">{item.medicine.name}</div>
                              <div className="text-sm text-gray-600">{item.medicine.dosage}</div>
                              {item.medicine.requiresPrescription && (
                                <Badge variant="destructive" className="text-xs mt-1">
                                  Prescription Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right text-gray-500">
                          ₹{parseFloat(item.medicine.mrp).toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex flex-col items-end">
                            {parseFloat(item.medicine.discount) > 0 && (
                              <span className="text-xs text-red-500 line-through">
                                ₹{parseFloat(item.medicine.mrp).toFixed(2)}
                              </span>
                            )}
                            <span className="font-medium">
                              ₹{parseFloat(item.medicine.discountedPrice).toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium">
                          ₹{(parseFloat(item.medicine.discountedPrice) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div></div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
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
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>₹{totals.finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• All prescription medicines require valid prescription</li>
                    <li>• Return policy applicable within 7 days of delivery</li>
                    <li>• Check expiry dates upon delivery</li>
                    <li>• For queries, contact our support team</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-2">Scan for order details</div>
                  <div className="w-20 h-20 mx-auto border rounded-lg flex items-center justify-center">
                    <div className="text-xs text-gray-400">QR Code</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-6 text-xs text-gray-500">
                Thank you for choosing Sharda Med - Your Health, Our Priority
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}