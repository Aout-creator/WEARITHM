import React, { useEffect, useState } from 'react';
import { db, storage, auth } from './firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

function OOTDFeed() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      const snapshot = await getDocs(collection(db, 'ootdPosts'));
      const postList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postList);
    };
    fetchPosts();
  }, []);

  const handleDelete = async (post) => {
    if (!user || user.uid !== post.uid) return alert('본인만 삭제할 수 있습니다.');
    await deleteDoc(doc(db, 'ootdPosts', post.id));
    await deleteObject(ref(storage, post.imagePath));
    setPosts(posts.filter(p => p.id !== post.id));
  };

  const handleLike = async (post) => {
    if (!user) return alert('로그인이 필요합니다.');
    const isLiked = post.likes?.includes(user.uid);
    const newLikes = isLiked
      ? post.likes.filter(uid => uid !== user.uid)
      : [...(post.likes || []), user.uid];

    await updateDoc(doc(db, 'ootdPosts', post.id), {
      likes: newLikes,
      likesCount: newLikes.length
    });

    setPosts(posts.map(p => (p.id === post.id ? { ...p, likes: newLikes, likesCount: newLikes.length } : p)));
  };

  const handleSave = async (post) => {
    if (!user) return alert('로그인이 필요합니다.');
    try {
      await addDoc(collection(db, 'savedLooks'), {
        userId: user.uid,
        savedAt: serverTimestamp(),
        imageUrl: post.imageURL,
        category: post.category,
        gender: post.gender,
        comment: post.comment,
      });
      alert('저장되었습니다!');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', textAlign: 'center' }}>
      <h2 style={{
        fontSize: '1.3rem',
        display: 'flex',
        alignItems: 'left',
        justifyContent: 'left',
        marginLeft: '2rem',
        gap: '0.5rem',
        marginBottom: '2rem'
      }}>
         <span style={{ fontWeight: '600' }}>User's OOTD Feeds</span>
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {posts.map(post => (
          <div key={post.id} style={{
            border: '1px solid #ddd',
            padding: '1rem',
            borderRadius: '10px',
            backgroundColor: '#fafafa',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <img src={post.imageURL} alt="OOTD" style={{ width: '100%', borderRadius: '8px' }} />
            <p> 사용자: <strong>{post.username || '익명'}</strong></p>
            <p> 날짜: <strong>{new Date(post.timestamp?.seconds * 1000).toLocaleDateString()}</strong></p>
            <p> 상황: <strong>{post.category}</strong></p>
            {post.comment && <p>💬 코멘트: {post.comment}</p>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <button onClick={() => handleLike(post)} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer' }}>
                {post.likes?.includes(user?.uid) ? '❤️' : '🤍'} 좋아요 ({post.likes?.length || 0})
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {user?.uid === post.uid && (
                  <button onClick={() => handleDelete(post)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                    🗑️ 삭제
                  </button>
                )}
                {user && (
                  <button onClick={() => handleSave(post)} style={{ background: 'none', border: '1px solid #333', borderRadius: '5px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}>
                    ⭐ 저장
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OOTDFeed;
