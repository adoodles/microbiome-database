import React, { useState, useEffect } from 'react';

const GCSFilesList = () => {
  const [filesList, setFilesList] = useState([]);
  const bucketName = 'curated_database';
  const subfolderName = 'siopp_ncis/'
  const apiKey = ''; 

  useEffect(() => {
    const fetchFilesList = async () => {
      try {
        const response = await fetch(
          //`https://www.googleapis.com/storage/${bucketName}/o?fields=(name)&key=${apiKey}`
          `http://localhost:3000/data`
        ).then(
            response => console.log(response.text()))
        ;

        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }

        const data = await response.json();
        console.log(data)
        setFilesList(data.items.map((item) => item.name));
      } catch (error) {
        console.error('Error fetching files list:', error);
      }
    };

    fetchFilesList();
  }, [bucketName, apiKey]);

  return (
    <div>
      <h2>Files in Bucket: {bucketName}</h2>
      <ul>
        {filesList.map((fileName, index) => (
          <li key={index}>{fileName}</li>
        ))}
      </ul>
    </div>
  );
};

export default GCSFilesList;
