import GLib from "gi://GLib";
const languages = {
    "zh_CN": {
        "network": "网络",
        "bluetooth": "蓝牙",
        "connect": "连接",
        "disconnect": "断开",
        "no-active-network": "无已连接网络",

        "input-wifi-password": "请输入WiFi密码",
        "failed-to-connect": "连接WiFi {wifi} 失败",

        "username": "用户名",
        "password": "密码",



        "hidden-network": "隐藏的网络",
        
        "no-media": "无媒体",

        "unknown": "未知",
    },
    "en": {
        "network": "Network",
        "bluetooth": "Bluetooth",
        "connect": "Connect",
        "disconnect": "Disconnect",
        "no-active-network": "No Active Network",

        "input-wifi-password": "Input Your WiFi Password",

        "failed-to-connect": "Failed to connect to {wifi}",
        "username": "Username",
        "password": "Password",

        "hidden-network": "Hidden Network",

        "no-media": "No Media",

        "unknown": "Unknown"
    }
}
const currentLang = (GLib.getenv("LANG") || 'en').split('.')[0]; // 如 "zh_CN" 或 "en"
export default languages[currentLang] || languages["en"]; // 回退到英语