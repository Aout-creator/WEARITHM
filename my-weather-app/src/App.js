import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Weather from './Weather';
import OOTDFeed from './OOTDFeed';
import { auth } from './firebase';
import MyPage from './myPage';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    });
    return () => unsubscribe();
  }, []);
  const provider = new GoogleAuthProvider();

  const handleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
      })
      .catch((error) => console.error('로그인 실패:', error));
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        localStorage.removeItem('user');
      })
      .catch((error) => console.error('로그아웃 실패:', error));
  };

  return (
    <Router>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
          <h1 style={{ fontWeight: 'bold', fontSize: '2rem', margin: 0 }}>WEARITHM</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <nav>
              <Link to="/" style={{ marginRight: '1rem', textDecoration: 'none', fontWeight: 'bold', color: '#549c94' }}>
                Home
              </Link>
              <Link to="/feed" style={{ marginRight: '1rem', textDecoration: 'none', fontWeight: 'bold', color: '#549c94' }}>
                Feeds
              </Link>
              <Link to="/mypage" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#549c94' }}>
                 MyPage
              </Link>
            </nav>

            {user ? (
              <>
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="profile"
                    style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                  />
                )}
                <span style={{ fontSize: '0.9rem' }}> {user.displayName || '사용자'}</span>
                              <button
                onClick={handleLogout}
                style={{
                  marginRight: '0.5rem',
                  background: 'none',
                  border: 'none',
                  fontWeight: 'bold',
                  color: '#549c94',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: 0
                }}
              >
                Logout
              </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                style={{
                  marginRight: '0.5rem',
                  background: 'none',
                  border: 'none',
                  fontWeight: 'bold',
                  color: '#549c94',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: 0
                }}
              >
                Login
              </button>
            )}
          </div>
        </div>

        <div style={{ height: '7rem' }}></div>

        <Routes>
          <Route path="/" element={<Weather user={user} />} />
          <Route path="/feed" element={<OOTDFeed user={user} />} />
          <Route path="/myPage" element={<MyPage user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
