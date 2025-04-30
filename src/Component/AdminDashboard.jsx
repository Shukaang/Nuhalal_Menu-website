import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';
import { deleteDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { FaHome, FaUtensils, FaBirthdayCake, FaGlassMartiniAlt } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const categories = [
  "All Items",
  "Breakfast",
  "Burgers",
  "Pizza",
  "Ethiopian Dishes",
  "Arabian Specials",
  "Salads",
  "Desserts",
  "Beverages",
];

export default function AdminDashboard() {
    const [selectedCategory, setSelectedCategory] = useState("All Items");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState({
      name: "",
      price: "",
      category: "",
      image: null,
    });
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [editingItem, setEditingItem] = useState(null);
  
    // Delete Confirmation Modal State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
  
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menuItems"));
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
  
    useEffect(() => {
      fetchItems();
    }, []);
  
    const handleAddItem = async (e) => {
        e.preventDefault();
        setLoading(true);
      
        try {
          await addDoc(collection(db, "menuItems"), {
            ...newItem,
            imageUrl: imageUrl, // save the pasted URL
          });
      
          setNewItem({ name: "", price: "", category: "" });
          setImageUrl("");
          setShowAddForm(false);
          fetchItems(); // don't forget to reload items after adding
        } catch (error) {
          console.error("Error adding item:", error);
          alert("Something went wrong!");
        }
      
        setLoading(false);
      };
      
  
    const handleUpdateItem = async (e) => {
      e.preventDefault();
      try {
        const itemDoc = doc(db, "menuItems", editingItem.id);
        await updateDoc(itemDoc, {
          name: editingItem.name,
          price: editingItem.price,
          category: editingItem.category,
        });
    
        setEditingItem(null);
        fetchItems();
      } catch (error) {
        console.error("Error updating item:", error);
        alert("Something went wrong!");
      }
    };
  
    // Open delete confirmation modal
    const openDeleteConfirmModal = (item) => {
      setItemToDelete(item);
      setShowDeleteConfirm(true);
    };
  
    // Close delete confirmation modal
    const closeDeleteConfirmModal = () => {
      setItemToDelete(null);
      setShowDeleteConfirm(false);
    };
  
    // Handle delete
    const handleDeleteItem = async () => {
      if (itemToDelete) {
        try {
          await deleteDoc(doc(db, "menuItems", itemToDelete.id));
          fetchItems();
          closeDeleteConfirmModal(); // Close modal after deletion
        } catch (error) {
          console.error("Error deleting item:", error);
          alert("Failed to delete the item!");
        }
      }
    };
  
    const filteredItems = selectedCategory === "All Items"
      ? menuItems
      : menuItems.filter(item => item.category === selectedCategory);
  
    return (
      <div className="flex h-screen overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 w-64 bg-white shadow-md h-full p-4 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}>
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FaUtensils /> Menu Admin
          </h1>
  
          <div className="flex flex-col gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setSidebarOpen(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded 
                  ${selectedCategory === cat ? "bg-gray-300 font-bold" : "text-gray-600 hover:bg-gray-200"}`}
              >
                {cat === "All Items" && <FaHome />}
                {cat.includes("Breakfast") && <FaUtensils />}
                {cat.includes("Burgers") && <FaUtensils />}
                {cat.includes("Pizza") && <FaUtensils />}
                {cat.includes("Ethiopian") && <FaUtensils />}
                {cat.includes("Arabian") && <FaGlassMartiniAlt />}
                {cat.includes("Salads") && <FaUtensils />}
                {cat.includes("Desserts") && <FaBirthdayCake />}
                {cat.includes("Juices") && <FaGlassMartiniAlt />}
                {cat}
              </button>
            ))}
          </div>
        </aside>
  
        {/* Main Content */}
        <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden mb-4 text-3xl focus:outline-none"
          >
            ☰
          </button>
  
          {/* Add New Item Button */}
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Add New Item
            </button>
          </div>
  
          <h2 className="text-3xl font-bold mb-6">{selectedCategory}</h2>
  
          <div className="bg-white rounded shadow p-4">
            <table className="min-w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Item</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 flex gap-2 items-center">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded" />
                      )}
                      {item.name}
                    </td>
                    <td className="py-3">{item.category}</td>
                    <td className="py-3">{item.price}</td>
                    <td className="py-3 flex items-center gap-2">
                      <button 
                        className="p-2 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => setEditingItem(item)}
                      >
                        <FiEdit className="text-blue-500" />
                      </button>
                      <button 
                        className="p-2 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => openDeleteConfirmModal(item)}
                      >
                        <FiTrash2 className="text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          {/* Add Item Modal */}
          {showAddForm && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-8 rounded shadow-lg w-96">
      <h3 className="text-2xl font-bold mb-4">Add New Menu Item</h3>

      <form onSubmit={handleAddItem} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Select Category</option>
          {categories.filter(category => category !== "All Items").map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Paste image URL here"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="border p-2 rounded"
        />

        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Adding..." : "Add Item"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{editingItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded shadow-lg w-96">
            <h3 className="text-2xl font-bold mb-4">Edit Menu Item</h3>

            <form onSubmit={handleUpdateItem} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Item Name"
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Price"
                value={editingItem.price}
                onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                className="border p-2 rounded"
              />
              <select
                value={editingItem.category}
                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                className="border p-2 rounded"
              >
                <option value="">Select Category</option>
                {categories.filter(cat => cat !== "All Items").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Image URL"
                value={editingItem.imageUrl}
                onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                className="border p-2 rounded"
              />

              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}  // Close the edit form
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-8 rounded shadow-lg w-96">
                <h3 className="text-2xl font-bold mb-4">Are you sure you want to delete this item?</h3>
  
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    onClick={closeDeleteConfirmModal}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteItem}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }
