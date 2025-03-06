const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3000;

// 開啟 CORS，允許前端直接呼叫
app.use(cors());

app.get('/api/route_status', async (req, res) => {
  try {
    const response = await axios.get('https://entry.orisries.playhorny.com/route_status', {
      headers: {
        "Accept": "application/json",
        "User-Agent": "UnityPlayer/2022.3.32f1 (UnityWebRequest/1.0, libcurl/8.5.0-DEV)",
        "horny-truedau": "ZFF3NHc5V2dYY1E=",
        "client-version": "1x4x0",
        "X-Unity-Version": "2022.3.32f1"
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("API 呼叫錯誤:", error.message);
    res.status(500).send("伺服器錯誤: " + error.message);
  }
});

app.listen(PORT, () => console.log(`API Proxy 運行在 http://localhost:${PORT}/api/route_status`));
