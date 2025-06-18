import { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "../firebase";
import { FaHome, FaUtensils, FaBirthdayCake, FaGlassMartiniAlt } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { LazyLoadImage } from "react-lazy-load-image-component";

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
  // State
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [menuItems, setMenuItems] = useState([]);
  const [fetching, setFetching] = useState(false);

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
    imageFile: null,      // File object
    imagePreview: null,   // local preview URL
  });
  const [adding, setAdding] = useState(false);
  const [addUploadProgress, setAddUploadProgress] = useState(0);

  // Edit form state
  const [editingItem, setEditingItem] = useState(null);
  const [editUploadProgress, setEditUploadProgress] = useState(0);
  const [updating, setUpdating] = useState(false);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Auth state
  const [user, setUser] = useState(null);

  const storage = getStorage();
  const auth = getAuth();

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        setUser(null);
        // Optionally redirect to login here
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Fetch menu items from Firestore
  const fetchItems = async () => {
    setFetching(true);
    try {
      const querySnapshot = await getDocs(collection(db, "menuItems"));
      const items = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          price: data.price,
          category: data.category,
          imageUrl: data.imageUrl || "",
          imagePath: data.imagePath || "", // storage path for deletion
          // ... any other fields
        };
      });
      setMenuItems(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      alert("Failed to fetch menu items.");
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handlers for Add Form
  const openAddForm = () => {
    setNewItem({ name: "", price: "", category: "", imageFile: null, imagePreview: null });
    setAddUploadProgress(0);
    setShowAddForm(true);
  };
  const closeAddForm = () => {
    if (!adding) {
      setShowAddForm(false);
    }
  };
  const handleNewFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewItem(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    } else {
      setNewItem(prev => ({
        ...prev,
        imageFile: null,
        imagePreview: null,
      }));
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You need to log in to add items.");
      return;
    }
    if (!newItem.name.trim() || !newItem.price.trim() || !newItem.category) {
      alert("Please fill in all required fields.");
      return;
    }
    setAdding(true);
    setAddUploadProgress(0);
    try {
      // 1. Pre-generate a docRef so we know the ID for storage path
      const collectionRef = collection(db, "menuItems");
      const docRef = doc(collectionRef); // generates an ID but does not write yet
      const docId = docRef.id;

      let imageUrl = "";
      let imagePath = "";

      if (newItem.imageFile) {
        // Upload to Storage
        const file = newItem.imageFile;
        const path = `menuItems/${docId}/${file.name}`;
        const storageReference = storageRef(storage, path);
        const uploadTask = uploadBytesResumable(storageReference, file);

        // Monitor progress
        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setAddUploadProgress(Math.floor(progress));
            },
            (error) => {
              console.error("Upload error:", error);
              reject(error);
            },
            async () => {
              // Upload completed
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              imagePath = path;
              resolve(null);
            }
          );
        });
      }

      // 2. Write Firestore document
      const dataToSave = {
        name: newItem.name.trim(),
        price: newItem.price.trim(),
        category: newItem.category,
        imageUrl,
        imagePath,
        createdAt: new Date(),
        // any other metadata
      };
      await setDoc(docRef, dataToSave);

      // 3. Refresh list
      fetchItems();
      // 4. Close form
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Something went wrong while adding the item.");
    } finally {
      setAdding(false);
      setAddUploadProgress(0);
    }
  };

  // Handlers for Edit Form
  const openEditForm = (item) => {
    // Pre-populate editingItem. Include existingImagePath so we can delete if replaced.
    setEditingItem({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      existingImageUrl: item.imageUrl || "",
      existingImagePath: item.imagePath || "",
      imageFile: null,       // new file if selected
      imagePreview: item.imageUrl || null, // show existing image
    });
    setEditUploadProgress(0);
  };
  const closeEditForm = () => {
    if (!updating) {
      setEditingItem(null);
    }
  };
  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingItem(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    } else {
      setEditingItem(prev => ({
        ...prev,
        imageFile: null,
        imagePreview: prev.existingImageUrl || null,
      }));
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editingItem.name.trim() || !editingItem.price.trim() || !editingItem.category) {
      alert("Please fill in all required fields.");
      return;
    }
    setUpdating(true);
    setEditUploadProgress(0);

    try {
      const itemDocRef = doc(db, "menuItems", editingItem.id);

      let newImageUrl = editingItem.existingImageUrl || "";
      let newImagePath = editingItem.existingImagePath || "";

      // If a new file was selected, upload it, then delete old file
      if (editingItem.imageFile) {
        const file = editingItem.imageFile;
        const path = `menuItems/${editingItem.id}/${file.name}`;
        const storageReference = storageRef(storage, path);
        const uploadTask = uploadBytesResumable(storageReference, file);

        // Upload progress
        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setEditUploadProgress(Math.floor(progress));
            },
            (error) => {
              console.error("Upload error:", error);
              reject(error);
            },
            async () => {
              // Completed
              newImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              newImagePath = path;
              resolve(null);
            }
          );
        });

        // Delete old image file if exists and path differs
        if (editingItem.existingImagePath && editingItem.existingImagePath !== newImagePath) {
          try {
            const oldRef = storageRef(storage, editingItem.existingImagePath);
            await deleteObject(oldRef);
          } catch (delErr) {
            console.warn("Failed to delete old image:", delErr);
            // Not fatal; continue
          }
        }
      }

      // Prepare updated data
      const updatedData = {
        name: editingItem.name.trim(),
        price: editingItem.price.trim(),
        category: editingItem.category,
        imageUrl: newImageUrl,
        imagePath: newImagePath,
        updatedAt: new Date(),
      };
      await updateDoc(itemDocRef, updatedData);

      // Refresh list & close form
      fetchItems();
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Something went wrong while updating the item.");
    } finally {
      setUpdating(false);
      setEditUploadProgress(0);
    }
  };

  // Delete handlers
  const openDeleteConfirmModal = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };
  const closeDeleteConfirmModal = () => {
    if (!deleting) {
      setItemToDelete(null);
      setShowDeleteConfirm(false);
    }
  };
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      // 1. Delete image from Storage if imagePath exists
      if (itemToDelete.imagePath) {
        try {
          const imgRef = storageRef(storage, itemToDelete.imagePath);
          await deleteObject(imgRef);
        } catch (imgDelErr) {
          console.warn("Failed to delete image from storage:", imgDelErr);
          // Continue to delete doc anyway
        }
      }
      // 2. Delete Firestore document
      await deleteDoc(doc(db, "menuItems", itemToDelete.id));
      // 3. Refresh list
      fetchItems();
      closeDeleteConfirmModal();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete the item.");
    } finally {
      setDeleting(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout.");
    }
  };

  // Filtered items
  const filteredItems = selectedCategory === "All Items"
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={
          `fixed top-0 left-0 w-64 bg-white shadow-md h-full p-4 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`
        }>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaUtensils /> Menu Admin
        </h1>
        <div className="flex flex-col gap-3">
          {categories.map(cat => (
            <button
            key={cat}
              onClick={() => { setSelectedCategory(cat); setSidebarOpen(false); }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded whitespace-nowrap overflow-hidden text-ellipsis
                ${selectedCategory === cat ? "bg-gray-300 font-bold" : "text-gray-600 hover:bg-gray-200"}`
              }
            >
              {cat === "All Items" && <FaHome />}
              {cat.includes("Breakfast") && <FaUtensils />}
              {cat.includes("Burgers") && <FaUtensils />}
              {cat.includes("Pizza") && <FaUtensils />}
              {cat.includes("Ethiopian") && <FaUtensils />}
              {cat.includes("Arabian") && <FaGlassMartiniAlt />}
              {cat.includes("Salads") && <FaUtensils />}
              {cat.includes("Desserts") && <FaBirthdayCake />}
              {cat.includes("Beverages") && <FaGlassMartiniAlt />}
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
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        {/* Add New Item Button */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={openAddForm}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Add New Item
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-6">{selectedCategory}</h2>

        {/* Table of items */}
        <div className="bg-white rounded shadow p-4 overflow-x-auto">
          {fetching ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : (
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
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">
                      No items in this category.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 flex gap-2 items-center max-w-[160px] sm:max-w-full overflow-hidden">
                        {item.imageUrl && (
                          <LazyLoadImage 
                            src={item.imageUrl} 
                            alt={item.name}
                            loading="lazy" 
                            className="w-10 h-10 object-cover rounded" 
                          />
                        )}
                        <span className="truncate block">{item.name}</span>
                      </td>
                      <td className="py-3">{item.category}</td>
                      <td className="py-3">{item.price}</td>
                      <td className="py-3 flex items-center gap-2">
                        <button 
                          className="p-2 rounded bg-gray-200 hover:bg-gray-300"
                          onClick={() => openEditForm(item)}
                          aria-label={`Edit ${item.name}`}
                          >
                          <FiEdit className="text-blue-500" />
                        </button>
                        <button 
                          className="p-2 rounded bg-gray-200 hover:bg-gray-300"
                          onClick={() => openDeleteConfirmModal(item)}
                          aria-label={`Delete ${item.name}`}
                        >
                          <FiTrash2 className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Item Modal */}
        {showAddForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md mx-4">
              <h3 className="text-2xl font-bold mb-4">Add New Menu Item</h3>
              <form onSubmit={handleAddItem} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Price"
                  value={newItem.price}
                  onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                  className="border p-2 rounded"
                  required
                />
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  className="border p-2 rounded"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.filter(cat => cat !== "All Items").map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div>
                  <label className="block mb-1">Image (optional):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNewFileChange}
                    className="border p-1 rounded w-full"
                  />
                  {newItem.imagePreview && (
                    <img 
                      src={newItem.imagePreview} 
                      alt="Preview" 
                      className="mt-2 w-24 h-24 object-cover rounded border"
                    />
                  )}
                </div>
                {adding && newItem.imageFile && (
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-green-500 h-2" 
                      style={{ width: `${addUploadProgress}%` }}
                    />
                  </div>
                )}
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={closeAddForm}
                    disabled={adding}
                    className={`px-4 py-2 rounded text-white ${adding ? "bg-gray-400" : "bg-gray-500 hover:bg-gray-600"}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className={`px-4 py-2 rounded text-white ${adding ? "bg-green-300" : "bg-green-500 hover:bg-green-600"}`}
                  >
                    {adding ? `Adding... (${addUploadProgress}%)` : "Add Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
       {/* Edit Item Modal */}
        {editingItem && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md mx-4">
              <h3 className="text-2xl font-bold mb-4">Edit Menu Item</h3>
              <form onSubmit={handleUpdateItem} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Price"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, price: e.target.value }))}
                  className="border p-2 rounded"
                  required
                />
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                  className="border p-2 rounded"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.filter(cat => cat !== "All Items").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div>
                  <label className="block mb-1">Replace Image (optional):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileChange}
                    className="border p-1 rounded w-full"
                  />
                  {editingItem.imagePreview && (
                    <img 
                      src={editingItem.imagePreview} 
                      alt="Preview" 
                      className="mt-2 w-24 h-24 object-cover rounded border"
                    />
                  )}
                </div>
                {updating && editingItem.imageFile && (
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-green-500 h-2" 
                      style={{ width: `${editUploadProgress}%` }}
                    />
                  </div>
                )}
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={closeEditForm}
                    disabled={updating}
                    className={`px-4 py-2 rounded text-white ${updating ? "bg-gray-400" : "bg-gray-500 hover:bg-gray-600"}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className={`px-4 py-2 rounded text-white ${updating ? "bg-green-300" : "bg-green-500 hover:bg-green-600"}`}
                  >
                    {updating ? `Updating... (${editUploadProgress}%)` : "Update Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && itemToDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm mx-4">
              <h3 className="text-2xl font-bold mb-4">Delete "{itemToDelete.name}"?</h3>
              <p>This action cannot be undone. Are you sure?</p>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={closeDeleteConfirmModal}
                  disabled={deleting}
                  className={`px-4 py-2 rounded text-white ${deleting ? "bg-gray-400" : "bg-gray-500 hover:bg-gray-600"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteItem}
                  disabled={deleting}
                  className={`px-4 py-2 rounded text-white ${deleting ? "bg-red-300" : "bg-red-500 hover:bg-red-600"}`}
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mt-6">
          <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-md transition duration-200 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}