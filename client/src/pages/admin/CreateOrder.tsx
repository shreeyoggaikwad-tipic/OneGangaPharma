import React, { useEffect, useState } from "react";
import {
  User,
  MapPin,
  Package,
  CheckCircle,
  Hash,
  Home,
  Smartphone,
} from "lucide-react";

type Customer = {
  name: string;
  age: number;
  address: string;
  pincode: string;
  mobile: number;
  place: string;
};

const previousCustomers: Customer[] = [
  { name: "Shreeyog Gaikwad", age: 22, address: "Pimpri Pune", pincode: "411018", mobile: 9527264942, place:"Pune" },
];

const CreateOrderForm: React.FC = () => {
  const [medi,setMedi] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [filteredNames, setFilteredNames] = useState<Customer[]>([]);
  const [age, setAge] = useState<number | "">("");
  const [address, setAddress] = useState("");
  const [place, setPlace] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [mobile, setMobileNumber] = useState<number | "">("");

  // Order medicines (dynamic list for current order)
  const [orderMedicines, setOrderMedicines] = useState<any[]>([]);

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/medicines?storeId=1");
        const response = await res.json();
        setMedi(response);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };
    
    fetchMedicine();
  }, []);

  const handleNameChange = (value: string) => {
    setCustomerName(value);
    setConfirmed(false);

    if (value.trim() === "") {
      setFilteredNames([]);
      return;
    }

    const matches = previousCustomers.filter((c) =>
      c.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredNames(matches);
  };

  const handleSelectName = (customer: Customer) => {
    setCustomerName(customer.name);
    setAge(customer.age);
    setAddress(customer.address);
    setPlace(customer.place);
    setMobileNumber(customer.mobile);
    setFilteredNames([]);
  };

  const handleMedicineChange = (index: number, value: string) => {
    const updated = [...orderMedicines];
    const selected = medi.find((m) => m.name === value);
    if (selected) {
      updated[index] = {
        ...updated[index],
        id: selected.id,
        name: selected.name,
        mrp: selected.mrp,
      };
    }
    setOrderMedicines(updated);
  };

  const addMedicine = () => {
    // Add empty medicine item with no default selection
    setOrderMedicines([
      ...orderMedicines,
      {
        name: "", 
        quantity: 1,
        mrp: 0,
        totalPrice: 0,
      },
    ]);
  };

  const handleQuantityChange = (index: number, value: number) => {
    const updated = [...orderMedicines];
    updated[index].quantity = value;
    updated[index].totalPrice = updated[index].mrp * value;
    setOrderMedicines(updated);
  };

  const removeMedicine = (index: number) => {
    const updated = [...orderMedicines];
    updated.splice(index, 1);
    setOrderMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(customerName,address,place, mobile, orderMedicines);

    try {
      const response = await fetch("http://localhost:5000/api/createorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          district: address,
          place: place,
          age:age,
          mobile_no: mobile,
          medicines: orderMedicines,
          
        }),
      });

      const data = await response.json();
      if (data.success) {
        setConfirmed(true);
      } else {
        alert("Failed to create order");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating order");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-3xl">
        {/* Title */}
        <div className="flex items-center mb-6">
          <Package className="text-teal-600 w-6 h-6 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">Create New Order</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Customer Name + Age */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="flex items-center text-gray-700 mb-1">
                <User className="w-4 h-4 mr-1 text-gray-500" /> Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter or select customer"
              />
              {/* Dropdown Suggestions */}
              {filteredNames.length > 0 && (
                <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow-md">
                  {filteredNames.map((customer, idx) => (
                    <li
                      key={idx}
                      className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                      onClick={() => handleSelectName(customer)}
                    >
                      {customer.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="flex items-center text-gray-700 mb-1">
                <Hash className="w-4 h-4 mr-1 text-gray-500" /> Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter age"
              />
            </div>
          </div>

          {/* Row 2: Address + Pincode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-gray-700 mb-1">
                <Home className="w-4 h-4 mr-1 text-gray-500" />District
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter District"
              />
            </div>

            <div>
              <label className="flex items-center text-gray-700 mb-1">
                <MapPin className="w-4 h-4 mr-1 text-gray-500" />Place
              </label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter place"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center text-gray-700 mb-1">
              <Smartphone className="w-4 h-4 mr-1 text-gray-500" />Mobile No
            </label>
            <input
              type="number"
              value={mobile}
              onChange={(e) => setMobileNumber(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter Mobile Number"
            />
          </div>

          {/* Medicines Section */}
          <div>
            <label className="flex items-center text-gray-700 mb-1">
              <Package className="w-4 h-4 mr-1 text-gray-500" /> Medicines
            </label>

            {orderMedicines.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 mb-3 border p-3 rounded-lg">
                {/* Medicine Dropdown with Placeholder */}
                <select
                  value={item.name}
                  onChange={(e) => handleMedicineChange(idx, e.target.value)}
                  className="flex-1 border rounded-lg px-2 py-1 text-sm"
                >
                  {/* Placeholder option */}
                  <option value="" disabled>
                    Select a medicine
                  </option>
                  
                  {/* Medicine options */}
                  {medi.map((m: any) => (
                    <option key={m.id} value={m.name}>
                      {m.name} → ₹{m.mrp}
                    </option>
                  ))}
                </select>

                {/* Quantity Input */}
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                  className="w-20 border rounded-lg px-2 py-1"
                  placeholder="Qty"
                />

                {/* Unit Price */}
                <span className="text-gray-700">₹{item.mrp || 0}</span>

                {/* Total */}
                <span className="font-semibold text-teal-600">
                  ₹{!item.mrp ? 0 : item.quantity * item.mrp}
                </span>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeMedicine(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Add Medicine Button */}
            <button
              type="button"
              onClick={addMedicine}
              className="mt-2 bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700"
            >
              + Add Medicine
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition"
          >
            Create Order
          </button>
        </form>

        {/* Confirmation Message */}
        {confirmed && (
          <div className="mt-4 flex items-center text-green-600 font-medium">
            <CheckCircle className="w-5 h-5 mr-2" />
            Your order is confirmed for <b className="ml-1">{customerName}</b>.
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateOrderForm;