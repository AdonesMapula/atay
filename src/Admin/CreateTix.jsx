import React, { useState, useEffect } from "react";
import axios from "axios";
import { db } from "../Firebase/firebase";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Image,
  X 
} from "lucide-react";

function CreateTix() {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const querySnapshot = await getDocs(collection(db, "tickets"));
    const ticketList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTickets(ticketList);
  };

  const handleImageUpload = async () => {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "bshhhijy");
    formData.append("folder", "event_images");

    try {
      const response = await axios.post("https://api.cloudinary.com/v1_1/dznhei4mc/image/upload", formData);
      return response.data.secure_url;
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Image upload failed");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic form validation
    if (!eventName || !eventDate || !venue || !ticketPrice) {
      toast.error("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    const imageUrl = await handleImageUpload();
    if (!imageUrl && !editId) {
      setIsSubmitting(false);
      return;
    }

    const ticketData = {
      eventName,
      eventDate,
      venue,
      ticketPrice,
      imageURL: imageUrl || tickets.find((t) => t.id === editId)?.imageURL,
    };

    try {
      if (editId) {
        await updateDoc(doc(db, "tickets", editId), ticketData);
        toast.success("Ticket updated successfully!");
        setEditId(null);
      } else {
        await addDoc(collection(db, "tickets"), ticketData);
        toast.success("Ticket created successfully!");
      }
      resetForm();
      fetchTickets();
    } catch (error) {
      console.error("Error saving document: ", error);
      toast.error("Failed to save ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (ticket) => {
    setEditId(ticket.id);
    setEventName(ticket.eventName);
    setEventDate(ticket.eventDate);
    setVenue(ticket.venue);
    setTicketPrice(ticket.ticketPrice);
    setImagePreview(ticket.imageURL);
  };

  const handleCancelEdit = () => {
    // Reset the form and exit edit mode
    resetForm();
    setEditId(null);
  
    // Reset the file input manually
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';  // Clears the file input
    }
  };
  

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "tickets", id));
      toast.success("Ticket deleted successfully!");
      fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket: ", error);
      toast.error("Failed to delete ticket.");
    }
  };

  const resetForm = () => {
    setEventName("");
    setEventDate("");
    setVenue("");
    setTicketPrice("");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 p-8">
          Event Ticket Management
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4 flex justify-center">
                  <img 
                    src={imagePreview} 
                    alt="Event Preview" 
                    className="w-40 h-40 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}

              {/* Form Inputs with Icons */}
              <div className="relative">
                <PlusCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Event Name" 
                  value={eventName} 
                  onChange={(e) => setEventName(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="datetime-local" 
                  value={eventDate} 
                  onChange={(e) => setEventDate(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Venue" 
                  value={venue} 
                  onChange={(e) => setVenue(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl text-gray-400">
                ₱
              </span>
                <input 
                  type="number" 
                  placeholder="Ticket Price" 
                  value={ticketPrice} 
                  onChange={(e) => setTicketPrice(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              
              <div className="relative">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="file" 
                  onChange={handleImageChange} 
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>
              
              <div className="flex space-x-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-grow py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    editId ? "Update Ticket" : "Create Ticket"
                  )}
                </button>
                
                {editId && (
                  <button 
                    type="button"
                    onClick={handleCancelEdit}
                    className="py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center px-4"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Ticket List Section */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {tickets.length === 0 ? (
              <div className="text-center bg-gray-800 p-6 rounded-lg">
                <p className="text-gray-400">No tickets available. Create your first ticket!</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex">
                    <div className="w-40 h-40">
                      <img 
                        src={ticket.imageURL} 
                        alt={ticket.eventName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-blue-300">{ticket.eventName}</h3>
                        <p className="text-sm text-gray-400">{ticket.eventDate}</p>
                        <p className="text-sm text-gray-400 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" /> {ticket.venue}
                        </p>
                        <p className="text-lg font-semibold text-green-400 mt-2">
                          ₱{ticket.ticketPrice}
                        </p>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button 
                          onClick={() => handleEdit(ticket)} 
                          className="flex items-center bg-yellow-500 text-black px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 mr-1" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(ticket.id)} 
                          className="flex items-center bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <ToastContainer theme="dark" />
    </div>
  );
}

export default CreateTix;