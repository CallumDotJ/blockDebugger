import React from 'react';
import ImageUploader from '../components/ImageUploader';


export default function Debug() {

    const[selectedImage, setImage] = React.useState(null);

    const handleImageSelect = (image) => {
        setImage(image);
        console.log("Selected image:", selectedImage);
        fetchDebugDataTest();

    }

   const fetchDebugDataTest = async () => {
    try {
    // object to send
    const formData = new FormData();
    formData.append("notes", "test"); // test in notes

    const response = await fetch("https://localhost:5000/api/openai/debug", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("Debug Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching debug data:", error);
  }
};

    return (
        <div className="p-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Debug Page</h2>
            <p>This is the debug page where you can troubleshoot issues.</p>

            <ImageUploader onFileSelect={handleImageSelect}/>

            
        </div>
        
    );
}