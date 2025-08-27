import React from 'react';

const updates = [
  {
    title: 'API Change: Switched to Spoonacular',
    description: 'The recipe search is now powered by the Spoonacular API, providing access to a much larger database of recipes and more powerful search capabilities.',
  },
  {
    title: 'New Ingredient Input',
    description: 'The comma-separated textarea has been replaced with a more user-friendly system. You can now add ingredients one by one, and they appear as tags that can be easily removed.',
  },
  {
    title: 'Receipt Scanning Feature Removed',
    description: 'The experimental feature to scan ingredients from a receipt using OCR has been removed to focus on improving the core recipe search experience.',
  },
  {
    title: 'Initial Recipe Search',
    description: 'The app was first built using TheMealDB API and a simple textarea for entering a comma-separated list of ingredients.',
  },
];

const Changelog = () => {
  return (
    <div className="mt-10 w-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Project Updates</h2>
      <div className="space-y-4">
        {updates.map((update, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-lg text-gray-900">{update.title}</h3>
            <p className="text-gray-600 mt-1">{update.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Changelog;
