import React, { useState } from "react";

function ImageUploader({ onFileSelect }) {
    const [preview, setPreview] = useState(null);


    const handleFileChange = (event) => {
        const image = event.target.files[0];
        if(image)
        {
            setPreview(URL.createObjectURL(image));
            onFileSelect(image);
        }
    }
    return (
        <div className="p-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Image Uploader</h2>
            <input
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="border p-2 w-full max-w-md"
            />
            {preview && (
                <div className="mt-4">
                    <img src={preview} alt="Uploaded" className="max-w-full h-auto mx-auto" />
                </div>
            )}
        </div>
    );
}

export default ImageUploader;

