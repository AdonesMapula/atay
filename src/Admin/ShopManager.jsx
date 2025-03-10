import React, { useEffect, useState } from "react";
import { db } from "../Firebase/firebase";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Dialog } from "@headlessui/react";
import { FaCheck, FaTimes, FaUndo, FaTrash } from "react-icons/fa";

function ShopManager() {
  const [soldItems, setSoldItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "solditems"));
        const itemsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSoldItems(itemsData);
      } catch (error) {
        console.error("Error fetching sold items: ", error);
      }
    };
    fetchItems();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const itemRef = doc(db, "solditems", id);
      await updateDoc(itemRef, { status: newStatus });
      setSoldItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, "solditems", id));
      setSoldItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  };

  const openDialog = (item, action) => {
    setSelectedItem({ ...item, action });
    setIsOpen(true);
  };

  const filteredItems = soldItems.filter((item) => {
    return (
      (filterStatus === "" || item.status === filterStatus) &&
      (searchQuery === "" || item.fullName.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (dateRange.start === "" || item.purchaseDate >= dateRange.start) &&
      (dateRange.end === "" || item.purchaseDate <= dateRange.end)
    );
  });

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen text-white p-6 ml-64">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-4xl font-bold tracking-tight uppercase">
          <span className="inline-block transform -skew-x-12 bg-white text-black px-2 mr-2">SOLD ITEMS</span>
          MANAGEMENT
        </h1>
        <p className="text-gray-400 mt-2 italic">Rapollo's Shop</p>
      </header>

      {/* Filters */}
      <div className="mb-6 flex justify-between bg-gray-800 p-4 rounded-md">
        <input
          type="text"
          placeholder="Search by buyer's name..."
          className="px-3 py-2 bg-gray-900 text-white rounded border border-gray-700"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-4">
          <select
            className="px-3 py-2 bg-gray-900 text-white rounded border border-gray-700"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Declined">Declined</option>
          </select>
          <input
            type="date"
            className="px-3 py-2 bg-gray-900 text-white rounded border border-gray-700"
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <input
            type="date"
            className="px-3 py-2 bg-gray-900 text-white rounded border border-gray-700"
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
      </div>

      {/* Sold Items Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border border-white text-white">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border px-4 py-2">Brand</th>
              <th className="border px-4 py-2">Item Name</th>
              <th className="border px-4 py-2">Size</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">Buyer</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Contact</th>
              <th className="border px-4 py-2">Payment Method</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="text-center bg-gray-900">
                <td className="border px-4 py-2">{item.brand}</td>
                <td className="border px-4 py-2">{item.name}</td>
                <td className="border px-4 py-2">{item.size}</td>
                <td className="border px-4 py-2">{item.price}</td>
                <td className="border px-4 py-2">{item.fullName}</td>
                <td className="border px-4 py-2">{item.email}</td>
                <td className="border px-4 py-2">{item.phone}</td>
                <td className="border px-4 py-2">{item.paymentMethod}</td>
                <td className="border px-4 py-2 font-bold">{item.status || "Pending"}</td>
                <td className="border px-4 py-2 flex justify-center gap-2">
                    <button onClick={() => openDialog(item, "Approved")} className="bg-green-600 p-2 rounded">
                    <FaCheck />
                    </button>
                    <button onClick={() => openDialog(item, "Declined")} className="bg-red-600 p-2 rounded">
                    <FaTimes />
                    </button>
                    <button onClick={() => openDialog(item, "Pending")} className="bg-gray-600 p-2 rounded">
                    <FaUndo />
                    </button>
                    {item.status === "Declined" && (
                    <button onClick={() => deleteItem(item.id)} className="bg-red-800 p-2 rounded">
                        <FaTrash />
                    </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Confirmation Dialog */}
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-900 p-6 rounded-lg text-white">
            <p>Are you sure you want to {selectedItem?.action} this item?</p>
            <div className="flex justify-end gap-4 mt-4">
                <button className="bg-white text-black border-2 border-gray-600 px-4 py-2 rounded" onClick={() => setIsOpen(false)}>Cancel</button>
                <button className="bg-black text-white px-4 py-2 rounded" onClick={() => updateStatus(selectedItem.id, selectedItem.action)}>Confirm</button>
            </div>
            </div>
        </Dialog>
    </div>
  );
}

export default ShopManager;
