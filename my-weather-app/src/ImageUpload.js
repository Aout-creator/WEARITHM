import React, { useState } from 'react';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function ImageUpload() {
  const [imageFile, setImageFile] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!imageFile) return alert('파일을 선택하세요!');
    setUploading(true);

    const fileRef = ref(storage, `ootdImages/${Date.now()}_${imageFile.name}`);
    await uploadBytes(fileRef, imageFile);
    const downloadURL = await getDownloadURL(fileRef);

    setImageURL(downloadURL);
    setUploading(false);
  };

  return (
    <div style={{ margin: '2rem auto', maxWidth: '500px', textAlign: 'center' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '0.7rem 1.2rem',
          backgroundColor: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        📤 내 OOTD 등록하기
      </button>

      {isOpen && (
        <div style={{ marginTop: '1.5rem' }}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <br /><br />
          <button onClick={handleUpload} disabled={uploading} style={{ padding: '0.5rem 1rem' }}>
            {uploading ? '업로드 중...' : '업로드하기'}
          </button>

          {imageURL && (
            <div style={{ marginTop: '1rem' }}>
              <p>✅ 업로드 완료!</p>
              <img src={imageURL} alt="Uploaded" style={{ width: '100%', borderRadius: '8px' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;

