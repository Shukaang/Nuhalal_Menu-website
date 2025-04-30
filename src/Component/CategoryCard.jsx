// components/CategoryCard.jsx
import React from 'react';

const CategoryCard = ({ category, onClick, imageUrl }) => (
  <div onClick={() => onClick(category)} className="flex flex-col items-center cursor-pointer">
    <div
      className="w-24 h-14 rounded-4xl flex items-center justify-center shadow-md bg-center bg-cover"
      style={{ backgroundImage: imageUrl }}
    />
    <p className="mt-2 text-sm font-medium">{category}</p>
  </div>
);

export default CategoryCard;
