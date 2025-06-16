import React, { useState } from 'react';
import TopLikedFeed from './topLikeFeed';
import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// 월(month)에 따라 계절 반환
const getSeason = (month) => {
  if ([12, 1, 2].includes(month)) return 'winter';
  if ([3, 4, 5].includes(month)) return 'spring';
  if ([6, 7, 8].includes(month)) return 'summer';
  return 'fall';
};

function ImageUpload() {
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [situation, setSituation] = useState('출근');
  const [gender, setGender] = useState('여성');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const month = new Date().getMonth() + 1;
  const season = getSeason(month);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!imageFile) return alert('파일을 선택하세요');
    setUploading(true);

    const fileRef = ref(storage, `ootdImages/${Date.now()}_${imageFile.name}`);
    await uploadBytes(fileRef, imageFile);
    const downloadURL = await getDownloadURL(fileRef);

    await addDoc(collection(db, 'ootdPosts'), {
      imageUrl: downloadURL,
      situation,
      gender,
      season,
      likes: 0,
      createdAt: serverTimestamp()
    });

    setUploading(false);
    setUploadSuccess(true);
  };

  return (
    <div style={{ margin: '2rem auto', maxWidth: '500px', textAlign: 'center' }}>
      <TopLikedFeed season={season} />

      <hr style={{ margin: '2rem 0' }} />

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
        Upload My OOTD
      </button>

      {isOpen && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label>상황: </label>
            <select value={situation} onChange={(e) => setSituation(e.target.value)}>
              <option value="출근">출근</option>
              <option value="데이트">데이트</option>
              <option value="운동">운동</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>성별: </label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="여성">여성</option>
              <option value="남성">남성</option>
            </select>
          </div>

          <input type="file" accept="image/*" onChange={handleFileChange} />
          <br /><br />
          <button onClick={handleUpload} disabled={uploading} style={{ padding: '0.5rem 1rem' }}>
            {uploading ? '업로드 중...' : '업로드하기'}
          </button>

          {uploadSuccess && (
            <p style={{ color: 'green', marginTop: '1rem' }}>✅ 업로드 및 저장 완료!</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
