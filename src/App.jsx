import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Reactの状態管理
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [placeName, setPlaceName] = useState("");

  const API_KEY = "1e3ac7de64cf893df650e32029cfcd8f"; // ★ここを書き換え！

  // 画面が表示された時に一度だけ実行される処理
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherData(latitude, longitude);
      },
      (error) => {
        alert("位置情報の取得に失敗しました: " + error.message);
        setLoading(false);
      }
    );
  }, []);

  // 天気データを取得する関数
  const fetchWeatherData = async (lat, lon) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setWeatherData(data);
        setPlaceName(`${data.city.name}, ${data.city.country}`);
        changeBackground(data.list[0].weather[0].main);
      } else {
        alert("データ取得失敗");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("通信エラー");
    } finally {
      setLoading(false);
    }
  };

  // 背景画像を決める関数
  const changeBackground = (weather) => {
    let bgUrl = '';
    switch(weather) {
      case 'Clear': bgUrl = 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?ixlib=rb-4.0.3&q=80&w=1920'; break;
      case 'Clouds': bgUrl = 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?ixlib=rb-4.0.3&q=80&w=1920'; break;
      case 'Rain':
      case 'Drizzle':
      case 'Thunderstorm': bgUrl = 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3&q=80&w=1920'; break;
      case 'Snow': bgUrl = 'https://images.unsplash.com/photo-1517299321609-52687d1bc555?ixlib=rb-4.0.3&q=80&w=1920'; break;
      default: bgUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&q=80&w=1920'; break;
    }
    document.body.style.backgroundImage = `url(${bgUrl})`;
  };

  // --- 表示部分 ---
  return (
    <div className="App">
      {/* ローディング画面 */}
      {loading && (
        <div className="loader-wrap">
          <div className="loader"></div>
          <p>空の様子を確認中...</p>
        </div>
      )}

      <h1>天気予報アプリ (React版)</h1>

      {/* データがある時だけ表示 */}
      {weatherData && (
        <>
          <h2 className="place-name">{placeName}</h2>

          {/* 現在の天気 */}
          <div className="weather-card">
            <div className="icon">
              <img 
                src={`https://openweathermap.org/img/wn/${weatherData.list[0].weather[0].icon}@2x.png`} 
                alt="weather icon" 
              />
            </div>
            <div className="info">
              <p>
                <span className="description">現在の天気：{weatherData.list[0].weather[0].description}</span><br />
                <span className="temp">{Math.round(weatherData.list[0].main.temp)}℃</span>
              </p>
            </div>
          </div>

          {/* 予報リスト */}
          <div className="forecast-wrap">
            <h3>今後の予報</h3>
            <table>
              <thead>
                <tr>
                  <th>日時</th>
                  <th>天気</th>
                  <th>気温</th>
                </tr>
              </thead>
              <tbody>
                {weatherData.list.slice(1).map((forecast, index) => {
                   const date = new Date(forecast.dt * 1000);
                   const month = date.getMonth() + 1;
                   const d = date.getDate();
                   const h = date.getHours();
                   const m = String(date.getMinutes()).padStart(2, '0');
                   
                   return (
                    <tr key={index}>
                      <td>{month}/{d} {h}:{m}</td>
                      <td>
                        <img 
                          src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`} 
                          width="30" 
                          style={{verticalAlign:"middle"}} 
                        /> 
                        {forecast.weather[0].description}
                      </td>
                      <td>{Math.round(forecast.main.temp)}℃</td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default App;