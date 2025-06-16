// MyPage.js
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

function MyPage({ user }) {
  const [savedLooks, setSavedLooks] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [view, setView] = useState('saved'); 
  const [filter, setFilter] = useState('전체');

  useEffect(() => {
    if (!user) return;

    const fetchSavedLooks = async () => {
      const q = query(collection(db, 'savedLooks'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const looks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedLooks(looks);
    };

    const fetchMyPosts = async () => {
      const q = query(collection(db, 'ootdPosts'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyPosts(posts);
    };

    fetchSavedLooks();
    fetchMyPosts();
  }, [user]);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'savedLooks', id));
    setSavedLooks(prev => prev.filter(look => look.id !== id));
  };

  const filteredLooks = filter === '전체'
    ? savedLooks
    : savedLooks.filter(look => look.situation === filter);

  if (!user) return <p style={{ textAlign: 'center' }}>로그인 후 이용해주세요.</p>;

  return (
    <div style={{ display: 'flex', maxWidth: '1200px', margin: '2rem auto' }}>
      <div style={{ width: '200px', padding: '1rem', borderRight: '1px solid #ccc' }}>
        <img src={user.photoURL} alt="프로필" style={{ borderRadius: '50%', width: '80px' }} />
        <p>{user.displayName}</p>
        <p style={{ fontSize: '0.85rem', color: 'gray' }}>{user.email}</p>

        <div style={{ marginTop: '2rem' }}>
          <button onClick={() => setView('saved')} style={{ display: 'block', marginBottom: '1rem', background: view === 'saved' ? '#549c94' : '#eee', color: view === 'saved' ? '#fff' : '#000', padding: '0.5rem', border: 'none', width: '100%' }}>⭐ 저장한 룩</button>
          <button onClick={() => setView('myPosts')} style={{ display: 'block', background: view === 'myPosts' ? '#549c94' : '#eee', color: view === 'myPosts' ? '#fff' : '#000', padding: '0.5rem', border: 'none', width: '100%' }}>📸 My OOTD</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '1rem' }}>
        {view === 'saved' ? (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label>상황별 필터: </label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="전체">전체</option>
                <option value="출근">출근</option>
                <option value="데이트">데이트</option>
                <option value="운동">운동</option>
              </select>
            </div>

            {filteredLooks.length === 0 ? (
              <p>저장한 룩이 없습니다.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {filteredLooks.map(look => (
                  <div key={look.id} style={{ width: '200px', border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
                    <img src={look.look.image} alt="룩" style={{ width: '100%', borderRadius: '8px' }} />
                    <p>날씨: {look.weather?.main?.temp}°C</p>
                    <p>상황: {look.situation}</p>
                    <p>성별: {look.gender}</p>
                    <button onClick={() => handleDelete(look.id)} style={{ marginTop: '0.5rem', color: 'red', cursor: 'pointer' }}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {myPosts.length === 0 ? (
              <p>등록한 OOTD가 없습니다.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {myPosts.map(post => (
                  <div key={post.id} style={{ width: '200px', border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
                    <img src={post.imageURL} alt="OOTD" style={{ width: '100%', borderRadius: '8px' }} />
                    <p>날짜: {new Date(post.timestamp?.seconds * 1000).toLocaleDateString()}</p>
                    <p>상황: {post.category}</p>
                    {post.comment && <p>코멘트: {post.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyPage;
