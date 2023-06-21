/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";

const App = () => {
  const [image, setImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageList, setImageList] = useState([]);

  const blobServiceClient = new BlobServiceClient(`https://${import.meta.env.VITE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net?${import.meta.env.VITE_SAS_TOKEN}`)
  const containerClient = blobServiceClient.getContainerClient(import.meta.env.VITE_CONTAINER)

  const handleUpload = async () => {
    const blobClient = containerClient.getBlockBlobClient(image.name)
    const options = {
      blobHTTPHeaders: { blobContentType: image.type },
      onProgress: (progress) => {
        const percentCompleted = ((progress.loadedBytes / image.size) * 100).toFixed(2);
        console.log(`Upload progress: ${percentCompleted} %`);
        setUploadProgress(percentCompleted);
      },
    }
    await blobClient.uploadBrowserData(image, options)
    const imageUrlWithoutSas = blobClient.url.split('?')[0];
    setImageUrl(imageUrlWithoutSas);
  }

  useEffect(() => {
    listImages();
  }, []);

  const listImages = async () => {
    const blobItems = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      blobItems.push({
        name: blob.name,
        url: `https://stylioo.blob.core.windows.net/${import.meta.env.VITE_CONTAINER}/${blob.name}`
      });
    }
    setImageList(blobItems);
  }

  console.log(imageList);


  const handleCopy = () => {

  }

  return (
    <div className="container">
      <div className="input">
        <input type="file" name="image" onChange={(event) => setImage(event.target.files[0])} />
        <button onClick={handleUpload}>Upload</button>
      </div>
      {uploadProgress !== 0 && <progress value={uploadProgress} max="100" />}
      {imageUrl &&
        <div className="url">
          <a target="_blank" href={imageUrl} rel="noreferrer">{imageUrl}</a>
          <button onClick={handleCopy}>Copy</button>
        </div>
      }
      <br></br>
      {imageList.map((image, idx) => (
        <div className="url" key={image.name}>
          <p>{idx + 1}</p>
          <a target="_blank" rel="noreferrer" href={image.url}>{image.url}</a>
          {/* <img width="50" src={image.url} alt={image.name} /> */}
        </div>
      ))}
    </div>
  );
};

export default App;