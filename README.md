# 方塊風暴（Blockstorm）

一個可直接部署到 GitHub Pages 的即時雙人方塊對戰網站。玩家可建立帳號、使用公開配對尋找對手，或透過 6 位房間碼建立私人對戰。

## 使用 VS Code 開啟

1. 用 VS Code 開啟這個資料夾，或直接開啟 `blockstorm.code-workspace`。
2. 按 `F5`。
3. VS Code 會啟動本機伺服器，並在瀏覽器開啟 `http://127.0.0.1:5500/`。

不需要安裝 npm 套件或 VS Code 擴充功能。

## 功能

- 1 對 1 公開配對，以及最多 4 人的好友房間
- 角色帳號＋密碼註冊與登入（玩家不需提供 Email）
- 公開快速配對佇列，搜尋狀態固定在大廳右下角並可隨時停止
- 簡約遊戲主選單：個人資訊、貨幣欄、賽季摘要與集中模式選擇
- 每日任務、10 章線性主線與 15 項成就，可獲得方塊幣及少量星晶
- 全站紅黑白科技識別卡介面，涵蓋登入、大廳、商店、任務、聊天室、房間、遊戲與彈窗，可切換亮色／深色模式
- 14 款柔和方塊造型、12 款遊戲背板、專屬紋理與永久收藏
- 整合式個人資料表：固定玩家 ID、段位、牌位／一般勝率與場次
- 好友搜尋、好友邀請與好友對戰
- 好友房間設定／準備階段、實力平衡與每位玩家 0–6 排永久鎖定列
- 多人最後存活制、隨機／輪流攻擊目標與其他玩家即時盤面
- 大廳聊天室、房間聊天室與遊戲中快速表情
- 全站與好友排行榜
- 排行榜玩家公開資料與快速加入好友
- 一般配對與七階牌位配對
- 四種難度、遵循相同方塊規則的 AI 單人對戰
- 消行攻擊、垃圾行、勝負判定
- 單人練習模式
- HOLD、NEXT、幽靈方塊、計分與等級加速
- 落地鎖定延遲，可在方塊接觸後繼續移動與旋轉
- SRS 踢牆、T-Spin、Combo、Back-to-Back、Perfect Clear 與垃圾行抵銷／延遲
- 鍵盤與手機觸控操作
- 響應式繁體中文介面

## 本機預覽

直接開啟 `index.html` 即可進入練習模式。測試多人連線時，建議啟動任何靜態檔案伺服器，並在兩個瀏覽器視窗中建立與加入房間。

例如：

```bash
python3 -m http.server 8080
```

然後開啟 `http://localhost:8080`。

## 部署到 GitHub Pages

1. 在 GitHub 建立一個公開 repository。
2. 把這個資料夾中的所有檔案推送到預設分支。
3. 到 repository 的 **Settings → Pages**。
4. 在 **Build and deployment** 選擇 **Deploy from a branch**。
5. 選擇預設分支及 `/ (root)` 後儲存。

GitHub 完成部署後，網站會出現在 `https://你的帳號.github.io/你的-repository/`。本專案亦包含 `.github/workflows/pages.yml`，可選擇 GitHub Actions 自動發布。

## 設定 Supabase 帳號與配對服務

GitHub Pages 只負責網站檔案；帳號、房間及配對資料由 Supabase 處理。

1. 在 Supabase 建立一個專案。
2. 開啟 **SQL Editor**，依序執行 `supabase/schema.sql`、`supabase/social.sql`、`supabase/ranked.sql`、`supabase/economy.sql`、`supabase/progression.sql`、`supabase/cosmetics_v2.sql`、`supabase/multiplayer_rooms.sql` 與 `supabase/private_chat.sql`。
3. 到 **Project Settings → API**，複製 Project URL 與 publishable/anon key。
4. 將兩個值填入 `config.js`。請勿把 `service_role` key 放進網頁。
5. 到 **Authentication → URL Configuration**，把本機網址及 GitHub Pages 網址加入允許清單。
6. 在 Authentication → Sign In / Providers → Email 關閉 Confirm email。本專案會在瀏覽器中把角色帳號轉成 Supabase 使用的內部識別碼，不寄送驗證信。

資料表已啟用 Row Level Security，配對與房間寫入只能透過已授權的資料庫函式進行。

## 連線說明

多人模式使用 Supabase 管理帳號、配對及房間，並以 PeerJS 公開訊號服務協助建立 WebRTC 點對點連線；遊戲盤面不會儲存在資料庫。部分公司、學校或嚴格 NAT 網路可能阻擋點對點連線。若要正式營運或支援大量玩家，建議改用自有 PeerServer 或 WebSocket 遊戲伺服器。

## 操作

| 按鍵 | 動作 |
| --- | --- |
| `←` / `→` | 左右移動 |
| `↓` | 軟降 |
| `↑` / `X` | 順時針旋轉 |
| `Z` | 逆時針旋轉 |
| `Space` | 硬降 |
| `C` | 暫存方塊 |
| `P` | 暫停（僅練習模式） |

## 授權

MIT

### Typography / TYPE 02
English display labels are paired with small Traditional Chinese labels across static and dynamic game panels. `typography.js` leaves game text/state intact. Traditional Chinese uses bundled [Ark Pixel Font](https://github.com/TakWolf/ark-pixel-font), 12px proportional zh-TW, under SIL OFL 1.1 (see `FONT-LICENSE.txt`).

### Interaction / 03
Whole-card mode controls use native buttons with independent difficulty and room-code inputs. Pointer hover redistributes a fixed 2×2 area; reduced-motion preferences disable transitions. The lobby has one combined account/currency bar. Friend last-seen labels read existing authenticated profile timestamps and range from one minute to seven days or more; unavailable timestamps are explicitly labeled. Mono uses seven separated gray levels, and Ice uses an original stepped voxel texture.
