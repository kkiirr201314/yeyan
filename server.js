const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const CONFIG_FILE = path.join(__dirname, 'config.json');

// 讀取 `client-version`
let clientVersion = "1x4x2"; // 預設值
if (fs.existsSync(CONFIG_FILE)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    clientVersion = config.clientVersion;
}

app.use(cors());
app.use(express.json());

// 取得 `client-version`
app.get('/api/get_version', (req, res) => {
    res.json({ clientVersion });
});

// 設定新的 `client-version`
app.post('/api/set_version', (req, res) => {
    if (req.body.clientVersion) {
        clientVersion = req.body.clientVersion;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify({ clientVersion }), 'utf-8'); // 儲存版本
        res.json({ message: "client-version 更新成功", clientVersion });
    } else {
        res.status(400).json({ message: "請提供 client-version" });
    }
});

// 代理請求
app.get('/api/route_status', async (req, res) => {
    try {
        const response = await axios.get('https://entry.orisries.playhorny.com/route_status', {
            headers: {
                "Accept": "application/json",
                "User-Agent": "UnityPlayer/2022.3.32f1 (UnityWebRequest/1.0, libcurl/8.5.0-DEV)",
                "horny-truedau": "ZFF3NHc5V2dYY1E=",
                "client-version": clientVersion, // 這裡動態使用變數
                "X-Unity-Version": "2022.3.32f1"
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("API 呼叫錯誤:", error.message);
        res.status(500).send("伺服器錯誤: " + error.message);
    }
});

app.listen(PORT, () => console.log(`API Proxy 運行在 http://localhost:${PORT}`));
