import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SeasonLookbookComponent from './SeasonLookbookComponent';

function getLookKey(season, situation, gender) {
  const seasonMap = { 고정: 'default', 봄: 'spring', 여름: 'summer', 가을: 'fall', 겨울: 'winter' };
  const situationMap = { 출근: 'work', 데이트: 'date', 운동: 'sport' };
  const genderMap = { 남: 'man', 여: 'woman' };
  return `${situationMap[situation]}_${seasonMap[season]}_${genderMap[gender]}`;
}

function getSeason(month) {
  if ([12, 1, 2].includes(month)) return '겨울';
  if ([3, 4, 5].includes(month)) return '봄';
  if ([6, 7, 8].includes(month)) return '여름';
  return '가을';
}

function getWeatherTip(main) {
  if (main === 'Rain') return '☔️ 우산을 꼭 챙기세요!';
  if (main === 'Snow') return '☃️ 눈길 조심하세요!';
  if (main === 'Clear') return '🌞 맑고 화창합니다!';
  if (main === 'Clouds') return '🌥️ 흐려요. 겉옷을 추천드립니다!';
  if (main === 'Mist') return '🌫️ 안개가 짙습니다. 시야 확보에 주의하세요!';
  return '';
}

function Weather({ user }) {
  const [city, setCity] = useState('');
  const [situation, setSituation] = useState('출근');
  const [gender, setGender] = useState('여');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [currentLook, setCurrentLook] = useState(null);
  const [recommendationMode, setRecommendationMode] = useState('temp');
  const [gptRecommendation, setGptRecommendation] = useState('');

  const API_KEY = 'f7668985a3f2607aa04970d38d15ae74';
  const month = new Date().getMonth() + 1;

  useEffect(() => {
    if (weather && recommendationMode === 'temp') {
      const season = getSeason(month);
      const lookKey = getLookKey(season, situation, gender) + '_temp';

      fetch('/looks.json')
        .then(res => res.json())
        .then(data => {
          if (data[lookKey]) {
            setCurrentLook(data[lookKey]);
          } else {
            setCurrentLook(null);
          }
        })
        .catch(() => setCurrentLook(null));
    }
  }, [weather, situation, gender, month, recommendationMode]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('브라우저가 위치 정보를 지원하지 않습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            setWeather(data);
            setError('');
          })
          .catch(() => setError('날씨 정보를 가져오지 못했습니다.'));
      },
      () => {
        setError('위치 접근을 거부하셨습니다.');
      }
    );
  }, []);

  const fetchCityWeather = () => {
    if (!city) return;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.cod === '404') {
          setError('‼️해당 도시를 찾을 수 없습니다.');
          setWeather(null);
        } else {
          setWeather(data);
          setError('');
        }
      })
      .catch(() => setError('도시 날씨를 불러오는 데 실패했습니다.'));
  };

  const fetchGPTRecommendation = async () => {
    if (!weather) return;

    const prompt = `${weather.name}의 날씨는 ${weather.weather[0].description}, 온도는 ${weather.main.temp}도입니다. ${situation} 상황에 어울리는 ${gender === '여' ? '여성' : '남성'} 코디를 한 줄로 추천해줘.`;

    try {
      const res = await axios.post(
                        "https://us-central1-wearithm.cloudfunctions.net/getGPTRecommendation",
                        { prompt }
                    );

      setGptRecommendation(res.data);
    } catch (err) {
      console.error('GPT 추천 실패:', err);
      setGptRecommendation('추천을 가져오지 못했어요.');
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '2rem', padding: '0.5rem 1rem', gap: '0.5rem', maxWidth: '600px', margin: '1rem auto' }}>
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchCityWeather()}
          placeholder="도시 입력 (예: Seoul)"
          style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem' }}
        />
        <button onClick={() => setRecommendationMode('temp')} style={{ backgroundColor: recommendationMode === 'temp' ? '#549c94' : '#eee', color: recommendationMode === 'temp' ? '#fff' : '#000', border: 'none', borderRadius: '1rem', padding: '0.4rem 0.8rem', cursor: 'pointer' }}>온도</button>
        <button onClick={() => setRecommendationMode('season')} style={{ backgroundColor: recommendationMode === 'season' ? '#549c94' : '#eee', color: recommendationMode === 'season' ? '#fff' : '#000', border: 'none', borderRadius: '1rem', padding: '0.4rem 0.8rem', cursor: 'pointer' }}>계절</button>
        <button onClick={fetchCityWeather} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>🔍︎</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
        <div>
          <label>OCCASION: </label>
          <select value={situation} onChange={(e) => setSituation(e.target.value)} style={{ padding: '0.5rem' }}>
            <option value="출근">출근</option>
            <option value="데이트">데이트</option>
            <option value="운동">운동</option>
          </select>
        </div>
        <div>
          <label>GENDER: </label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ padding: '0.5rem' }}>
            <option value="여">여성</option>
            <option value="남">남성</option>
          </select>
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {recommendationMode === 'season' ? (
        <SeasonLookbookComponent gender={gender === '여' ? 'woman' : 'man'} />
      ) : (
        weather && currentLook && (
          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '10px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem', marginTop: '2rem' }}>
            <div style={{ flex: 1, minWidth: '250px', textAlign: 'left', marginLeft: '0.5rem' }}>
              <h3> {weather.name} </h3>
              <p>🌡️ 온도: {weather.main.temp}°C</p>
              <p>☁️ 날씨: {weather.weather[0].description}</p>
              <p>{getWeatherTip(weather.weather[0].main)}</p>

              <h4>추천 룩:</h4>
              {Array.isArray(currentLook.brands) && currentLook.brands.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4>🔗 관련 브랜드 추천</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {currentLook.brands.map((b, i) => (
                      <a
                        key={i}
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#000000', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', transition: '0.2s' }}
                        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#549c94')}
                        onMouseOut={e => (e.currentTarget.style.backgroundColor = '#000000')}
                      >
                        <img src={b.logo} alt={`${b.name} 로고`} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                        {b.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={fetchGPTRecommendation} style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#549c94',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                AI 코디 추천받기
              </button>

              {gptRecommendation && (
                <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', marginTop: '1rem', textAlign: 'left' }}>
                  <h4>🧠 GPT 한줄 코디 추천</h4>
                  <p style={{ fontStyle: 'italic', color: '#444' }}>{gptRecommendation}</p>
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: '250px', textAlign: 'center' }}>
              <img src={currentLook.image} alt="룩 이미지" style={{ width: '100%', maxWidth: '300px', borderRadius: '8px' }} />
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default Weather;
