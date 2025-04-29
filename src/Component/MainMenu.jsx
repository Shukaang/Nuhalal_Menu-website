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
    "Breakfast & Brunch": "url(Breakfast.jpg)",
  "Burgers & Sandwiches": "url(Burger.jpg)",
  "Pizza & Fast Foods": "url(Pizza.jpg)",
  "Ethiopian Dishes": "url(Ethiopian.jpg)",
  "Arabian Specials": "url(Arabian.jpg)",
  "Salads & Healthy Picks": "url(Salad.jpg)",
  "Desserts & Sweets": "url(Desert.jpg)",
  "Juices & Hot Drinks": "url(Fruits.jpg)",
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
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <div className="bg-no-repeat bg-cover p-6 flex justify-between items-center"
           style={{backgroundImage: "url('Menu-bg-Arabian.jpg')"}}
      >
        <h1 className="text-4xl font-bold text-black menu-title">Nuhalal Menu</h1>
        <button className="bg-green-600 text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-green-400 transition">
          Order Now
        </button>
      </div>

      {/* Categories + Menu Items Section */}
      <div className="flex-1 p-6" style={{ backgroundImage: "url('BIG-BG.jpg')" }}>
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
        <div
            onClick={resetFilter}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-24 h-14 bg-contain bg-no-repeat bg-center rounded-4xl flex items-center justify-center shadow-md"
                 style={{ backgroundImage: "url('BIG-BG.jpg')" }}
                >
            </div>
            <p className="mt-2 text-sm font-medium">All Menu</p>
          </div>
          {categories.map((cat, index) => (
            <div
              key={index}
              onClick={() => filterItems(cat)}
              className="flex flex-col items-center cursor-pointer"
            >
            <div
              className="w-24 h-14 rounded-4xl flex items-center justify-center shadow-md bg-center bg-cover"
              style={{ backgroundImage: categoryBackgrounds[cat] || "url('BIG-BG.jpg')" }}
              >
            </div>
              <p className="mt-2 text-sm font-medium">{cat}</p>
            </div>
          ))}
          
        </div>

        {/* Menu Items */}
        {error ? (
          <div className="text-center text-red-500 text-3xl font-semibold">{error}</div>
        ) : (
          <div className="w-fit mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 md:grid-cols-3 justify-items-center justify-center gap-y-5 gap-x-3">
            {filteredItemsMemo.length === 0 ? (
              <div className="text-center text-gray-500">No items found.</div>
              ) : (
                filteredItemsMemo.map((item) => (
                  <div key={item.id} className="w-40 h-auto sm:gap-x-3 bg-gray-950 p-4 border-2 border-green-700 rounded-xl shadow-2xl 
                  shadow-green-800 hover:shadow-lg transition">
                    <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-md mb-3"
                    />
                    <div className="text-center">
                      <p className="text-white font-semibold mt-1">{item.price} ETB</p>
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
        <p className="text-sm">© 2025, Khaled Salim. Contact us @ +251916288190</p>
      </footer>
    </div>
  );
};

export default MainMenu;
