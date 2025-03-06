import React, { useEffect, useState } from "react";
import { db } from "../Firebase/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import axios from "axios";

function Shop() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [productData, setProductData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    image: "",
    sizes: [],
  });

  const sizeOptions = ["All", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
  const categoryOptions = ["T-Shirts", "Jackets", "Hoodies", "Cap", "Accessories", "Others"];

  // Function to handle dropdown change
  const handleDropdownChange = (field, value) => {
    setProductData({ 
      ...productData, 
      [field]: value === "Others" ? "" : value
    });
  };


  const [selectedSizes, setSelectedSizes] = useState([]);

  const toggleSize = (size) => {
    setSelectedSizes((prevSizes) =>
      prevSizes.includes(size)
        ? prevSizes.filter((s) => s !== size) 
        : [...prevSizes, size] 
    );
  };
  

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSizeSelection = (size) => {
    setProductData((prevData) => {
      let updatedSizes;
      if (size === "All") {
        updatedSizes = prevData.sizes.includes("All") ? [] : sizeOptions.slice(1);
      } else {
        updatedSizes = prevData.sizes.includes(size)
          ? prevData.sizes.filter((s) => s !== size)
          : [...prevData.sizes, size];
      }
      return { ...prevData, sizes: updatedSizes };
    });
  };

  const handleSubmit = async () => {
    try {
      let uploadedImageUrl = productData.image;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "bshhhijy");
        formData.append("folder", "shop_products");

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dznhei4mc/image/upload",
          formData
        );
        uploadedImageUrl = response.data.secure_url;
      }

      const newProductData = { ...productData, image: uploadedImageUrl };

      if (selectedProduct) {
        const productRef = doc(db, "products", selectedProduct.id);
        await updateDoc(productRef, newProductData);
      } else {
        await addDoc(collection(db, "products"), newProductData);
      }

      setIsModalOpen(false);
      setIsEditModalOpen(false);
      setProductData({ name: "", brand: "", category: "", price: "", image: "", sizes: [] });
      setImageFile(null);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product.");
    }
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setProductData({ name: "", brand: "", category: "", price: "", image: "", sizes: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setProductData({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      price: product.price || "",
      image: product.image || "",
      sizes: product.sizes || [],
    });
    setIsEditModalOpen(true);
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      fetchProducts(); // Refresh product list after deletion
    } catch (error) {
      console.error("Error removing product:", error);
      alert("Failed to remove product.");
    }
  };
  

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen text-white p-6 ml-64">
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
      <div className="mb-10 border-b border-gray-800 pb-4">
          <h1 className="text-4xl font-bold tracking-tight uppercase flex items-center">
            <span className="inline-block transform -skew-x-12 bg-white text-black px-3 py-1 mr-3">PRODUCT</span>
            MANAGEMENT
          </h1>
          <p className="text-gray-400 mt-2 italic">Rapollo Products </p>
        </div>
        <button onClick={openAddModal} className="bg-yellow-500 px-4 py-2 rounded-md font-semibold">
          Add Product
        </button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="bg-gray-800 p-4 rounded-lg shadow-lg text-center">
              <img src={product.image} alt={product.name} className="w-full h-[250px] object-cover rounded-md" />
              <h2 className="mt-3 font-bold text-xl">{product.name}</h2>
              <p className="text-gray-400">{product.category} - {product.brand}</p>
              <p className="text-yellow-400 text-lg font-semibold">₱{product.price}</p>
              <p className="text-white text-md">Sizes:{" "}<span className="font-bold">
                  {product.sizes ?.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)).join(", ") || "None"}
                </span>
              </p>
              <div className="flex justify-between mt-4">
                <button onClick={() => openEditModal(product)} className="bg-blue-500 text-white px-3 py-1 rounded-md">
                  Edit
                </button>
                <button onClick={() => removeProduct(product.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md">
                  Remove
                </button>
              </div>

            </div>
          ))
        ) : (
          <p className="text-gray-400">No products available.</p>
        )}
      </div>

      {(isModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-900 p-6 rounded-lg w-96">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                {selectedProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }}>✖</button>
            </div>

            {/* Name */}
            <input 
              type="text" 
              placeholder="Name" 
              value={productData.name} 
              onChange={(e) => setProductData({ ...productData, name: e.target.value })} 
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2" 
            />

            {/* Brand Dropdown */}
            <input 
              type="text"
              placeholder="Brand"
              value={productData.brand}
              onChange={(e) => setProductData({ ...productData, brand: e.target.value })} 
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2"
            >
            </input>

            {/* Category Dropdown */}
            <select 
              value={categoryOptions.includes(productData.category) ? productData.category : "Others"}
              onChange={(e) => handleDropdownChange("category", e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Price */}
            <input 
              type="number" 
              placeholder="Price" 
              value={productData.price} 
              onChange={(e) => setProductData({ ...productData, price: e.target.value })} 
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2" 
            />
            <input
              type="file"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2 bg-green-500 text-black"
            />

            {/* Available Sizes */}
            <div className="mb-4">
              <label className="text-white font-bold">Available Sizes:</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {sizeOptions.map((size) => (
                  <div
                    key={size}
                    className={`cursor-pointer px-3 py-1 rounded-md text-center font-bold ${
                      productData.sizes.includes(size) ? "bg-green-500 text-black" : "bg-red-500 text-white"
                    }`}
                    onClick={() => handleSizeSelection(size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button onClick={handleSubmit} className="bg-yellow-500 px-6 py-2 rounded-md w-full font-semibold">
              {selectedProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop;
