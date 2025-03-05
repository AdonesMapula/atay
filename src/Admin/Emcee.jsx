import React, { useState } from "react";
import { Search } from "lucide-react";
import Lawrence from "../assets/Pictures/Lawrence.png";
import Ban from "../assets/Pictures/Ban.png";
function Emcee() {
  const [category, setCategory] = useState("All Emcee");
  const [sortBy, setSortBy] = useState("Name (A-Z)");
  
  const emcees = [
    {
      name: "Lawrence",
      hometown: "Tabok, Mandaue City, Cebu",
      reppin: "Bloc Insights",
      image: Lawrence,
      description: "A rising emcee known for his intricate wordplay and powerful delivery."
    },
    {
      name: "Ban",
      hometown: "Lapu-Lapu City",
      reppin: "Shaman Ubec",
      image: Ban,
      description: "An underground rap talent bringing raw energy and lyrical depth to the scene."
    }
  ];

  return (
    <div className="bg-black min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold text-left mb-6">Create new Emcee</h1>
      
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-1/3">
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none pr-10"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        </div>
        
        <div className="flex gap-4">
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-md"
          >
            <option>All Emcee</option>
            <option>Category 1</option>
            <option>Category 2</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-md"
          >
            <option>Name (A-Z)</option>
            <option>Name (Z-A)</option>
          </select>
        </div>
        
        <button className="bg-gray-700 px-6 py-2 rounded-md">Add</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {emcees.map((emcee, index) => (
          <div key={index} className="bg-gray-900 p-4 rounded-lg shadow-lg w-[300px] h-[500px] flex flex-col justify-between">
            <img src={emcee.image} alt={emcee.name} className="w-full h-[300px] object-cover rounded-md" />
            <div className="p-4">
              <h2 className="mt-3 font-bold text-2xl">{emcee.name}</h2>
              <p className="text-gray-300 text-lg">Hometown: <span className="text-white">{emcee.hometown}</span></p>
              <p className="text-gray-300 text-lg">Reppin: <span className="text-white">{emcee.reppin}</span></p>
              <p className="text-gray-400 text-sm mt-2">{emcee.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Emcee;
