import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

function TopLikedFeed({ season }) {
  const [gender, setGender] = useState('전체');
  const [situation, setSituation] = useState('전체');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const colRef = collection(db, 'ootdPosts');
    let q = query(colRef, where('season', '==', season));

    if (gender !== '전체') q = query(q, where('gender', '==', gender));
    if (situation !== '전체') q = query(q, where('situation', '==', situation));

    q = query(q, orderBy('likesCount', 'desc'), limit(3));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(items);
    });

    return () => unsubscribe();
  }, [season, gender, situation]);

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3> 이번 시즌 룩북 TOP 3</h3>

      <div style={{ marginBottom: '1rem' }}>
        <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ marginRight: '1rem', padding: '0.5rem' }}>
          <option value="전체">전체 성별</option>
          <option value="여성">여성</option>
          <option value="남성">남성</option>
        </select>

        <select value={situation} onChange={(e) => setSituation(e.target.value)} style={{ padding: '0.5rem' }}>
          <option value="전체">전체 상황</option>
          <option value="출근">출근</option>
          <option value="데이트">데이트</option>
          <option value="운동">운동</option>
        </select>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: 'gray', fontStyle: 'italic' }}>
          아직 해당 계절의 인기 OOTD가 없어요 😳<br />
          가장 먼저 스타일을 공유해보세요!
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
          {posts.map((post, index) => (
            <div key={post.id} style={{ width: '220px', padding: '1rem', background: '#f9f9f9', borderRadius: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>{index + 1}위</span>
              <img src={post.imageUrl} alt="OOTD" style={{ width: '100%', borderRadius: '8px', margin: '0.5rem 0' }} />
              <p> 성별: {post.gender}</p>
              <p> 상황: {post.situation}</p>
              <p>❤️ 좋아요: {post.likesCount || 0}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TopLikedFeed;
