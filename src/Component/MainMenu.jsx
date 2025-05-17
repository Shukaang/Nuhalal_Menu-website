import React, { useState, useEffect, useMemo} from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const MainMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const menuCollectionRef = collection(db, 'menuItems');
  const [loading, setLoading] = useState(true);

  const categoryBackgrounds = {
  "Breakfast": "url(Breakfast.jpg)",
  "Burgers": "url(Burger.jpg)",
  "Pizza": "url(Pizza.jpg)",
  "Ethiopian Dishes": "url(Ethiopian.jpg)",
  "Arabian Specials": "url(Arabian.jpg)",
  "Salads": "url(Salad.jpg)",
  "Desserts": "url(Desert.jpg)",
  "Beverages": "url(Beverages.jpg)",
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataSnapshot = await getDocs(menuCollectionRef);
        const items = dataSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
        if (items.length === 0) {
          setError('No items found here!.');
        } else {
          setMenuItems(items);
          setFilteredItems(items);
        }
  
        const categoriesSet = new Set(items.map(item => item.category));
        setCategories([...categoriesSet]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load menu items.');
      } finally {
        setLoading(false); 
      }
    };
  
    fetchData(); 
  }, []);
  

  const filterItems = (category) => {
    const filtered = menuItems.filter(item => item.category === category);
    setFilteredItems(filtered);
  };

  const resetFilter = () => {
    setFilteredItems(menuItems);
  };

  const filteredItemsMemo = useMemo(() => {
    if (filteredItems.length === 0) {
      return menuItems;
    }
    return filteredItems;
  }, [filteredItems, menuItems]);
  

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header Section */}
      <div className="bg-no-repeat bg-cover p-6 flex justify-between items-center"
           style={{backgroundImage: "url('Menu-bg-Arabian.jpg')"}}
      >
        <h1 className="text-4xl font-bold text-black menu-title">Nuhalal Menu</h1>
        <button className="bg-amber-600 text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-amber-400 transition">
          Order Now
        </button>
      </div>

      {/* Categories + Menu Items Section */}
      <div className="flex-1 p-6" style={{ backgroundImage: "url('BIG-BG.jpg')" }}>
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:mt-5 mb-8">
          <div
            onClick={resetFilter}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-20 sm:w-24 h-12 sm:h-14 bg-contain bg-no-repeat bg-center rounded-4xl flex items-center justify-center shadow-md"
                 style={{ backgroundImage: "url('BIG-BG.jpg')" }}
                >
            </div>
            <p className="mt-2 text-xs sm:text-sm font-medium">All Menu</p>
          </div>
          {categories.map((cat, index) => (
            <div
              key={index}
              onClick={() => filterItems(cat)}
              className="flex flex-col items-center cursor-pointer"
            >
            <div
              className="w-24 sm:w-28 h-12 sm:h-14 rounded-4xl flex items-center justify-center shadow-md bg-center bg-cover"
              style={{ backgroundImage: categoryBackgrounds[cat] || "url('BIG-BG.jpg')" }}
              >
            </div>
              <p className="mt-2 text-xs sm:text-sm font-medium">{cat}</p>
            </div>
          ))}
          
        </div>

        {/* Menu Items */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600"></div>
          </div>
          ) : error ? (
            <div className="text-center text-red-500 text-3xl font-semibold">{error}</div>
            ) : (
              <div className="w-fit mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 md:grid-cols-3 
                        justify-items-center justify-center gap-y-5 gap-x-3 mt-10 mb-10">

            {filteredItemsMemo.length === 0 ? (
              <div className="text-center text-gray-500">No items found.</div>
              ) : (
                filteredItemsMemo.map((item) => (
                  <div key={item.id} className="w-40 sm:w-44 gap-2 bg-gray-950 p-4 border-2 border-amber-600 rounded-xl shadow-2xl 
                    shadow-amber-600 hover:shadow-lg transition">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      loading= "lazy"
                      className="w-full h-28 sm:h-32 object-cover rounded-md mb-3"
                    />
                    <div className="text-center">
                      <h2 className="font-bold text-amber-600 text-base sm:text-lg">{item.name}</h2>
                      <p className="text-white font-semibold mt-1 text-sm sm:text-base">{item.price} ETB</p>
                    </div>
                  </div>
                ))
              )}

          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black text-white text-center space-y-3 p-4">
        <p className="text-sm">© 2025, Nuhalal Restaurant - Taste the Love!</p>
        <p className="text-sm">© 2025, Khaled Salim contact Us @ +251916288190</p>
      </footer>
    </div>
  );
};

export default MainMenu;