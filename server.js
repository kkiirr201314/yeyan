const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const CONFIG_FILE = path.join(__dirname, 'config.json');

// 預設設定
let config = {
    userId: "9243242896",
    authToken: "Bearer 固定的TOKEN",
    clientVersion: "1x4x2",
    userCookie: "_cf_bm=固定的Cookie"
};

// 讀取設定檔
if (fs.existsSync(CONFIG_FILE)) {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}

app.use(cors());
app.use(express.json());

// 取得完整 API 設定
app.get('/api/get_config', (req, res) => {
    res.json(config);
});

// 更新 API 設定
app.post('/api/set_config', (req, res) => {
    const { userId, authToken, clientVersion, userCookie } = req.body;

    if (userId) config.userId = userId;
    if (authToken) config.authToken = authToken;
    if (clientVersion) config.clientVersion = clientVersion;
    if (userCookie) config.userCookie = userCookie;

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 4), 'utf-8');
    res.json({ message: "設定更新成功", config });
});

// 取得 Client-Version
app.get('/api/get_version', (req, res) => {
    res.json({ clientVersion: config.clientVersion });
});

// 設定 Client-Version
app.post('/api/set_version', (req, res) => {
    if (req.body.clientVersion) {
        config.clientVersion = req.body.clientVersion;
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 4), 'utf-8');
        res.json({ message: "client-version 更新成功", clientVersion: config.clientVersion });
    } else {
        res.status(400).json({ message: "請提供 client-version" });
    }
});

// 取得使用者資訊
app.get('/api/userinfo/:userId', async (req, res) => {
    const userId = req.params.userId;
    console.log(`收到查詢請求，userId: ${userId}`);
    
    // 如果 userId 無效，直接回傳錯誤，防止伺服器卡住
    if (!userId || userId.toLowerCase() === "none" || isNaN(userId)) {
        console.error(`無效的 userId: ${userId}`);
        return res.status(400).json({ error: "無效的 user_id" });
    }

    
    try {
        const response = await axios.get(`https://entry.orisries.playhorny.com/g/userinfo/detail/${userId}`, {
            headers: {
                "User-Agent": "UnityPlayer/2022.3.32f1 (UnityWebRequest/1.0, libcurl/8.5.0-DEV)",
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
                "Host": "entry.orisries.playhorny.com",
                "Authorization": config.authToken,
                "horny-truedau": "ZFF3NHc5V2dYY1E=",
                "client-version": config.clientVersion,
                "X-Unity-Version": "2022.3.32f1",
                "Cookie": config.userCookie
            },
            timeout: 5000
        });

        res.json(response.data);
    } catch (error) {
        console.error("取得使用者資訊時發生錯誤:", error.message);
        res.status(error.response?.status || 500).json({ error: "無法取得使用者資訊：" + error.message });
    }
});

// 取得伺服器狀態
app.get('/api/route_status', async (req, res) => {
    try {
        const response = await axios.get('https://entry.orisries.playhorny.com/route_status', {
            headers: {
                "Accept": "application/json",
                "User-Agent": "UnityPlayer/2022.3.32f1 (UnityWebRequest/1.0, libcurl/8.5.0-DEV)",
                "horny-truedau": "ZFF3NHc5V2dYY1E=",
                "client-version": config.clientVersion,
                "X-Unity-Version": "2022.3.32f1"
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("API 呼叫錯誤:", error.message);
        res.status(500).json({ error: "伺服器錯誤: " + error.message });
    }
});

app.listen(PORT, () => console.log(`API Proxy 運行在 http://localhost:${PORT}`));
