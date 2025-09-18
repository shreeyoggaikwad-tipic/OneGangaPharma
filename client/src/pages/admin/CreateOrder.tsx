import React, { useState } from "react";
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
};

const previousCustomers: Customer[] = [
  { name: "Abhijeet patil", age: 32, address: "MG Road, Pune", pincode: "411001" },
  { name: "aditya thorat", age: 28, address: "Andheri East, Mumbai", pincode: "400069" },
  { name: "Amit Patil", age: 45, address: "Shivaji Nagar, Nagpur", pincode: "440001" },
];

const medicines = [
  { label: "Super 30 (100)", price: 100 },
  { label: "Super 30 (500)", price: 500 },
  { label: "Super 30 (1000)", price: 1000 },
];

const CreateOrderForm: React.FC = () => {
  const [customerName, setCustomerName] = useState("");
  const [filteredNames, setFilteredNames] = useState<Customer[]>([]);
  const [age, setAge] = useState<number | "">("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [medicine, setMedicine] = useState(medicines[0].label);
  const [confirmed, setConfirmed] = useState(false);

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
    setPincode(customer.pincode);
    setFilteredNames([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmed(true);
  };

  const selectedMedicine = medicines.find((m) => m.label === medicine);

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
                // value={pincode}
                onChange={(e) => setPincode(e.target.value)}
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
                type="text"
                // value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter Mobile Number"
              />
            </div>

          {/* Medicine Dropdown */}
          <div>
            <label className="flex items-center text-gray-700 mb-1">
              <Package className="w-4 h-4 mr-1 text-gray-500" /> Medicine
            </label>
            <select
              value={medicine}
              onChange={(e) => setMedicine(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {medicines.map((m, idx) => (
                <option key={idx} value={m.label}>
                  {m.label} → ₹{m.price}
                </option>
              ))}
            </select>
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
            Your order is confirmed for <b className="ml-1">{customerName}</b>.{" "}
            Medicine: <b>{medicine}</b>, Price: ₹{selectedMedicine?.price}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateOrderForm;
