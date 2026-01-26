import { useState, useEffect } from 'react';
import './App.css';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

function App() {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [placeName, setPlaceName] = useState("");

  const API_KEY = "1e3ac7de64cf893df650e32029cfcd8f"; 

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

  const fetchWeatherData = async (lat, lon) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${API_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setWeatherData(data);
        setPlaceName(`${data.city.name}, ${data.city.country}`);
        changeBackground(data.list[0].weather[0].main);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

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
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
  };

  const getGraphData = () => {
    if (!weatherData) return [];
    return weatherData.list.slice(0, 9).map(item => {
      const date = new Date(item.dt * 1000);
      return {
        time: `${date.getHours()}:00`,
        temp: Math.round(item.main.temp),
      };
    });
  };

  const getIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className="App" style={{ minHeight: '100vh', paddingBottom: '50px' }}>
      {loading && (
        <div className="loader-wrap">
          <div className="loader"></div>
          <p>空の様子を確認中...</p>
        </div>
      )}

      <h1 style={{ color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', padding: '20px' }}>
        天気予報アプリ
      </h1>

      {weatherData && (
        <>
          <h2 className="place-name" style={{ color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
            {placeName}
          </h2>

          <div className="weather-card">
            <div className="icon">
              <img 
                src={getIconUrl(weatherData.list[0].weather[0].icon)} 
                alt="weather icon" 
                onError={(e) => { e.target.src = 'https://openweathermap.org/img/wn/01d@2x.png'; }}
              />
            </div>
            <div className="info">
              <p>
                <span className="description">現在の天気：{weatherData.list[0].weather[0].description}</span><br />
                <span className="temp" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                  {Math.round(weatherData.list[0].main.temp)}℃
                </span>
              </p>
            </div>
          </div>

          <div className="graph-container" style={{ 
            width: '90%', 
            maxWidth: '800px', 
            height: '350px', 
            margin: '30px auto', 
            background: 'rgba(255,255,255,0.9)', 
            padding: '20px', 
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: '#333', marginBottom: '15px', textAlign: 'center' }}>24時間の気温推移</h3>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={getGraphData()} margin={{ top: 20, right: 30, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
                <XAxis dataKey="time" tick={{ fill: '#333', fontSize: 12 }} />
                <YAxis unit="℃" tick={{ fill: '#333', fontSize: 12 }} domain={['auto', 'auto']} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#ff7300" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#ff7300' }} 
                  label={{ position: 'top', fontSize: 12, fill: '#333', fontWeight: 'bold' }}
                  name="気温"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="forecast-wrap" style={{ width: '90%', maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>今後の予報</h3>
            <table style={{ width: '100%', background: 'rgba(255,255,255,0.8)', borderRadius: '15px', overflow: 'hidden', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.1)' }}>
                  <th style={{ padding: '10px' }}>日時</th>
                  <th>天気</th>
                  <th>気温</th>
                </tr>
              </thead>
              <tbody>
                {weatherData.list.slice(1, 11).map((forecast, index) => {
                   const date = new Date(forecast.dt * 1000);
                   return (
                    <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px' }}>{date.getMonth() + 1}/{date.getDate()} {date.getHours()}:00</td>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px' }}>
                        <img 
                          src={getIconUrl(forecast.weather[0].icon)}
                          alt="forecast icon"
                          width="40" 
                          height="40"
                          onError={(e) => { e.target.src = 'https://openweathermap.org/img/wn/01d@2x.png'; }}
                        /> 
                        {forecast.weather[0].description}
                      </td>
                      <td style={{ fontWeight: 'bold' }}>{Math.round(forecast.main.temp)}℃</td>
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
