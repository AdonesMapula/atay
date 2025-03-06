import React, { useEffect, useState } from "react";
import { db } from "../Firebase/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState([]); // ✅ State for fetched events
  const productsPerPage = 6;

  useEffect(() => {
    fetchProducts();
    fetchEvents(); // ✅ Fetch recent events
  }, []);

  // Fetch products from Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
      setFilteredProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Fetch recent events from Firestore
  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, "events");
      const q = query(eventsRef, orderBy("year", "desc"), limit(3));
      const querySnapshot = await getDocs(q);

      const eventData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEvents(eventData); // ✅ Updates the events state with latest 3
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Handle search filter
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(term)
      )
    );
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Static merch sales data for chart
  const merchSalesData = [
    { name: "Hoodies", sales: 120 },
    { name: "Caps", sales: 90 },
    { name: "Shoes", sales: 150 },
    { name: "Tees", sales: 200 },
    { name: "Accessories", sales: 80 },
  ];

  // Static ticket sales data for chart
  const ticketSalesData = [
    { name: "Jan", tickets: 500 },
    { name: "Feb", tickets: 650 },
    { name: "Mar", tickets: 800 },
    { name: "Apr", tickets: 720 },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen text-white p-6 ml-64">
      <div className="mb-10 border-b border-gray-800 pb-4">
          <h1 className="text-4xl font-bold tracking-tight uppercase flex items-center">
            <span className="inline-block transform -skew-x-12 bg-white text-black px-3 py-1 mr-3">RAPOLLO</span>
            DASHBOARD
          </h1>
          <p className="text-gray-400 mt-2 italic">Dashboard </p>
        </div>
      {/* Search Bar */}
      <div className="relative w-1/3 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none pr-10"
        />
        <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Merch Sales Chart */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Top Merch Sold This Month</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={merchSalesData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="sales" fill="#facc15" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ticket Sales Chart */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Ticket Sales (Last 4 Months)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={ticketSalesData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Line type="monotone" dataKey="tickets" stroke="#f87171" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Events Section */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-10">
        <h2 className="text-2xl font-bold mb-4">Recent Events</h2>
        <ul className="space-y-4">
          {events.length > 0 ? (
            events.map((event) => (
              <li key={event.id} className="bg-gray-800 p-4 rounded-md">
                <h3 className="text-xl font-semibold">{event.name}</h3>
                <p className="text-gray-400">{event.year} - {event.description}</p>
              </li>
            ))
          ) : (
            <p className="text-gray-400">No recent events available.</p>
          )}
        </ul>
      </div>

      {/* Product Grid */}
      <h2 className="text-2xl font-bold mb-4">Merchandise</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <div key={product.id} className="bg-gray-900 p-4 rounded-lg shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[250px] object-cover rounded-md"
              />
              <h2 className="mt-3 font-bold text-xl">{product.name}</h2>
              <p className="text-gray-400 text-sm">{product.category}</p>
              <p className="text-yellow-400 text-lg font-semibold">₱{product.price}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No products found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-700 rounded-md mx-2 disabled:opacity-50"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-white text-lg">Page {currentPage}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={indexOfLastProduct >= filteredProducts.length}
          className="px-4 py-2 bg-gray-700 rounded-md mx-2 disabled:opacity-50"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
