import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Search, Eye, X, Pencil, Trash } from "lucide-react";
import { db } from "../Firebase/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";




const Event = () => {
  const [showForm, setShowForm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ name: "", year: "", description: "", photo: null });
  const [searchTerm, setSearchTerm] = useState(""); // State to manage the search term
  const [currentPage, setCurrentPage] = useState(1);
  const [editEventId, setEditEventId] = useState(null); // Track the event being edited
  const [confirmDelete, setConfirmDelete] = useState(null); // State to track delete confirmation
  const [confirmSave, setConfirmSave] = useState(false); // State to track save confirmation
  const eventsPerPage = 5;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const querySnapshot = await getDocs(collection(db, "events"));
    const eventData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setEvents(eventData);
    setFilteredEvents(eventData);
  };
  // Function to add or update an event
  const handleSaveEvent = async () => {
    if (!newEvent.name || !newEvent.year || !newEvent.description) {
      toast.error("Please fill in all fields!");
      return;
    }
  
    setConfirmSave(true);
  };
  
  const confirmSaveEvent = async () => {
    try {
      const uploadedImageUrl = imageFile ? await handleImageUpload() : newEvent.photo;
      if (!uploadedImageUrl) return;
  
      const eventData = { ...newEvent, photo: uploadedImageUrl };
  
      if (editEventId) {
        // ✅ Update existing event instead of adding a new one
        await updateDoc(doc(db, "events", editEventId), eventData);
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === editEventId ? { id: editEventId, ...eventData } : event
          )
        );
        toast.success("Event updated successfully!");
      } else {
        // ✅ Add a new event
        const docRef = await addDoc(collection(db, "events"), eventData);
        setEvents((prevEvents) => [...prevEvents, { id: docRef.id, ...eventData }]);
        toast.success("Event added successfully!");
      }
  
      // ✅ Reset state properly
      setShowForm(false);
      setNewEvent({ name: "", year: "", description: "", photo: null });
      setImageFile(null);
      setEditEventId(null); // Reset after update
      setConfirmSave(false);
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event");
    }
  };
  
  

  // Function to handle event editing
  const handleEditEvent = (event) => {
    setEditEventId(event.id); // ✅ Set editEventId correctly
    setNewEvent({
      name: event.name,
      year: event.year,
      description: event.description,
      photo: event.photo,
    });
    setShowForm(true);
  };
  
  

  // Function to delete an event
  const handleDeleteEvent = (eventId) => {
    console.log("Deleting Event ID:", eventId);
    setConfirmDelete(eventId);
  };

  const confirmDeleteEvent = async () => {
    if (!confirmDelete) return;
  
    try {
      await deleteDoc(doc(db, "events", confirmDelete));
      setEvents((prevEvents) => prevEvents.filter(event => event.id !== confirmDelete));
      toast.success("Event deleted successfully!");
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };
  
  useEffect(() => {
    // Filter events whenever searchTerm changes
    if (searchTerm === "") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(
        events.filter((event) =>
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.year.toString().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, events]);


  const indexOfLastEvent = currentPage * eventsPerPage;
const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
// Handle page change
const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleImageUpload = async () => {
    if (!imageFile) return alert("Please select an image to upload.");
    
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "bshhhijy");
    formData.append("folder", "event_images");
    
    try {
      const response = await axios.post("https://api.cloudinary.com/v1_1/dznhei4mc/image/upload", formData);
      return response.data.secure_url;
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Image upload failed");
      return null;
    }
  };

  const handleAddEvent = async () => {
    try {
      const uploadedImageUrl = await handleImageUpload();
      if (!uploadedImageUrl) return;

      const newEventData = { ...newEvent, photo: uploadedImageUrl };
      await addDoc(collection(db, "events"), newEventData);
      setEvents([...events, newEventData]);
      setShowForm(false);
      setNewEvent({ name: "", year: "", description: "", photo: null });
      setImageFile(null);
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
       
      <ToastContainer />
      {/* Rest of your component */}
  
      <Transition show={showForm} as={Fragment}>
  <Dialog as="div" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-lg" onClose={() => setShowForm(false)}>
    <Dialog.Panel className="relative bg-gray-900 p-6 rounded-lg shadow-lg w-[90%] max-w-md text-white">
      {/* Close Button */}
      <button className="absolute top-3 right-3 text-gray-400 hover:text-white transition" onClick={() => setShowForm(false)}>
        <X size={24} />
      </button>

      <h3 className="text-xl font-semibold mb-4">
  {editEventId ? "Edit Event" : "Add New Event"}
</h3>

      {/* Event Form */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Event Name"
          className="p-2 bg-gray-800 rounded-lg text-white outline-none focus:ring-2 focus:ring-gray-600"
          value={newEvent.name}
          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Year"
          className="p-2 bg-gray-800 rounded-lg text-white outline-none focus:ring-2 focus:ring-gray-600"
          value={newEvent.year}
          onChange={(e) => setNewEvent({ ...newEvent, year: e.target.value })}
        />
        <textarea
          placeholder="Description"
          className="p-2 bg-gray-800 rounded-lg text-white outline-none focus:ring-2 focus:ring-gray-600"
          value={newEvent.description}
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
        />

        {/* File Upload */}
        <input
          type="file"
          className="p-2 bg-gray-800 rounded-lg text-white"
          onChange={(e) => setImageFile(e.target.files[0])}
        />

        {/* Submit Button */}
        <button 
          className="bg-blue-500 px-4 py-2 rounded-lg text-white font-medium hover:bg-blue-600 transition"
          onClick={handleSaveEvent} // ✅ This ensures edit/update works properly
        >
          Save Event
        </button>

      </div>
    </Dialog.Panel>
  </Dialog>
</Transition>

{/* Confirmation Dialog for Delete */}
<Transition show={confirmDelete !== null} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClose={() => setConfirmDelete(null)}>
          <Dialog.Panel className="bg-gray-900 p-6 rounded-lg shadow-lg text-white">
            <h3 className="text-xl font-semibold">Confirm Deletion</h3>
            <p>Are you sure you want to delete this event?</p>
            <div className="flex justify-end mt-4 gap-4">
              <button className="bg-gray-500 px-4 py-2 rounded-lg" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="bg-red-600 px-4 py-2 rounded-lg" onClick={confirmDeleteEvent}>Delete</button>
            </div>
          </Dialog.Panel>
        </Dialog>
      </Transition>

      {/* Confirmation Dialog for Save/Edit */}
      <Transition show={confirmSave} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClose={() => setConfirmSave(false)}>
          <Dialog.Panel className="bg-gray-900 p-6 rounded-lg shadow-lg text-white">
            <h3 className="text-xl font-semibold">Confirm Save</h3>
            <p>Are you sure you want to save this event?</p>
            <div className="flex justify-end mt-4 gap-4">
              <button className="bg-gray-500 px-4 py-2 rounded-lg" onClick={() => setConfirmSave(false)}>Cancel</button>
              <button className="bg-blue-600 px-4 py-2 rounded-lg" onClick={confirmSaveEvent}>Save</button>
            </div>
          </Dialog.Panel>
        </Dialog>
      </Transition>
      {/* Image Modal */}
      <Transition show={showImageModal} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-lg" onClose={() => setShowImageModal(false)}>
          <Dialog.Panel className="relative bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-3xl">
            <button className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 transition" onClick={() => setShowImageModal(false)}>
              <X size={24} />
            </button>
            {selectedImage && <img src={selectedImage} alt="Event Preview" className="w-full h-auto max-h-[80vh] rounded-lg object-contain" />}
          </Dialog.Panel>
        </Dialog>
      </Transition>
      
      {/* Event Management Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Event Management</h2>
          
          <button className="bg-white px-4 py-2 rounded-lg text-black" onClick={() => setShowForm(true)}>Add Event</button>
          {/* Search Bar */}
        <div className="mb-4 flex justify-end">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              className="p-2 pl-8 bg-gray-800 rounded-lg text-white outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm state
            />
            <Search className="absolute left-2 top-2 text-gray-400" size={18} />
          </div>
        </div>

        </div>
        
        
        
        
        {/* Events Table */}
        <div className="p-6">
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow-lg border border-gray-600 text-center text-white">
            <thead className=" text-white uppercase font-semibold">
              <tr>
                <th className="p-4 border border-gray-700">Event Photo</th>
                <th className="p-4 border border-gray-700">Event Name</th>
                <th className="p-4 border border-gray-700">Year</th>
                <th className="p-4 border border-gray-700">Description</th>
                <th className="p-4 border border-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
  {currentEvents.map((event) => (

                  <tr key={event.id} className="hover:bg-gray-800 transition-colors">
                    <td className="p-4 border border-gray-700 flex justify-center items-center">
                      {event.photo ? (
                        <img
                          src={event.photo}
                          alt="Event"
                          className="w-16 h-16 rounded-md object-cover border border-gray-600 hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => { setSelectedImage(event.photo); setShowImageModal(true); }}
                        />
                      ) : (
                        <span className="text-gray-500">No Image</span>
                      )}
                    </td>
                    <td className="p-4 border border-gray-700 text-gray-300">{event.name}</td>
                    <td className="p-4 border border-gray-700 text-gray-300">{event.year}</td>
                    <td className="p-4 border border-gray-700 text-gray-300">{event.description}</td>
                    <td className="p-4 border border-gray-700 w-[150px]">
                      <div className="flex justify-center items-center gap-4">
                        <button 
                          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                          onClick={() => handleEditEvent(event)} // Added Edit Function
                        >
                          <Pencil size={20} className="text-gray-300 hover:text-white" />
                        </button>
                        <button 
                          className="p-2 rounded-lg bg-gray-800 hover:bg-red-600 transition"
                          onClick={() => handleDeleteEvent(event.id)} // Added Delete Function
                        >
                          <Trash size={20} className="text-red-400 hover:text-white" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
            </tbody>
          </table>
          {/* Pagination */}
    <div className="flex justify-center mt-4 gap-2">
      {[...Array(Math.ceil(filteredEvents.length / eventsPerPage)).keys()].map(number => (
        <button
          key={number + 1}
          onClick={() => paginate(number + 1)}
          className={`px-4 py-2 rounded-lg ${currentPage === number + 1 ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'} hover:bg-blue-600 transition`}
        >
          {number + 1}
        </button>
      ))}
    </div>
        </div>
      </div>
    </div>
  );
};

export default Event;
