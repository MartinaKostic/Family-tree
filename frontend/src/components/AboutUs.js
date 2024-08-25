import React from "react";

function AboutUs() {
  return (
    <div className="bg-gray-100 py-8 px-2 md:px-20 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">About Us</h1>
      <div className="flex flex-col md:flex-row items-center justify-around">
        <img
          src="/images/tree.jpg"
          alt="Family Tree"
          className="max-w-md rounded-lg shadow-md mb-6 md:mb-0"
        />
        <div className="max-w-lg">
          <p className="text-lg text-gray-700">
            Welcome to Our Family History Tracker, an application designed to
            help you keep track of your family's lineage and heritage. This tool
            allows you to map out relationships and the historical context that
            shaped your ancestors' lives. By preserving your family history, you
            create a legacy that can be cherished for generations to come.
            Explore your roots, connect with your past, and share your unique
            heritage with loved ones.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
