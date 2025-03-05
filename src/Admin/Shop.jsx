import React from "react";

function Shop() {
  return (
    <div className="w-full h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add Shop Product</h1>
      </div>

      {/* Product Grid - Expands with Content */}
      <div className="w-full max-w-5xl grid grid-cols-3 gap-6">
        {/* Sample Product Items */}
        {Array(4) // Increased count for better scrolling effect
          .fill("")
          .map((_, index) => (
            <div key={index} className="w-full h-64 bg-white rounded-lg flex items-center justify-center">
              <img src="/path-to-product-image.jpg" alt="Product" className="w-full h-full object-cover rounded-lg" />
            </div>
          ))}

        {/* Add Product Button */}
        <button className="w-full h-64 bg-gray-700 text-6xl text-white flex items-center justify-center rounded-lg hover:bg-gray-600">
          +
        </button>
      </div>
    </div>
  );
}

export default Shop;
