<!-- xCloudVLMui — macOS README -->
<div align="center">

# xCloudVLMui Platform — macOS

**工廠設備健康管理平台 · 工廠視覺 AI 指揮台**

[![Platform](https://img.shields.io/badge/Platform-Apple%20Silicon%20Mac-000000?logo=apple&logoColor=white)]()
[![LLM](https://img.shields.io/badge/LLM-Ollama%20on%20host-ff6600)]()
[![Arch](https://img.shields.io/badge/Arch-ARM64%20(Apple%20Silicon)-555555)]()
[![Python](https://img.shields.io/badge/Python-3.11-3776ab?logo=python&logoColor=white)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white)]()
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)]()
[![Docker](https://img.shields.io/badge/Docker-Compose%20v2-2496ED?logo=docker&logoColor=white)]()

> 由 **云碩科技 xCloudinfo Corp.Limited** 開發
> 適用於 **Apple Silicon Mac（M 系列）** 的本地開發與輕量部署版本
> LLM 推論透過 **Ollama on host**（`host.docker.internal:11434`）執行，無需 NVIDIA GPU

</div>

---

## 硬體需求 — Apple Silicon Mac

| 項目 | 規格 |
|------|------|
| **平台** | Apple Silicon Mac（M1 / M2 / M3 / M4 系列）|
| **架構** | ARM64（aarch64）|
| **推論引擎** | Ollama（運行於 macOS host，非容器內）|
| **LLM 存取路徑** | `http://host.docker.internal:11434` |
| **建議記憶體** | 16 GB（建議 32 GB 以上以載入較大模型）|
| **Docker** | Docker Desktop for Mac（Apple Silicon 版）|
| **OS** | macOS 13 Ventura 或更新版本 |

> ⚠️ macOS 版本不包含 NVIDIA CUDA 容器。
> llama-cpp 與 vlm-webui 為輕量 stub，LLM 推論由 macOS host 上的 Ollama 處理。

---

## 服務架構與 Port 配置

```
┌────────────────────────────────────────────────────────────┐
│                   Apple Silicon Mac                        │
│                                                            │
│  ┌─ Docker Desktop ────────────────────────────────────┐  │
│  │                                                     │  │
│  │  ┌─ nginx :8880 ───────────────────────────────┐   │  │
│  │  │  ┌─ frontend :3500 ──────────────────────┐  │   │  │
│  │  │  │  Next.js 14 · 視覺巡檢 · MQTT · RAG   │  │   │  │
│  │  │  └──────────────────────────────────────┘  │   │  │
│  │  │  ┌─ backend :8501 ───────────────────────┐  │   │  │
│  │  │  │  FastAPI · SQLite · ChromaDB · MQTT   │  │   │  │
│  │  │  └──────────────────────────────────────┘  │   │  │
│  │  └────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │  ┌─ mosquitto :1884 ──┐  ┌─ cadvisor :8591 ──────┐ │  │
│  │  │  MQTT Broker       │  │  容器資源監控           │ │  │
│  │  └────────────────────┘  └──────────────────────┘ │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─ macOS host ────────────────────────────────────────┐  │
│  │  Ollama（host.docker.internal:11434）               │  │
│  │  Gemma 4 E4B · bge-m3 embedding · qwen3-vl VLM     │  │
│  │  Apple Neural Engine + GPU 加速                     │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

| 服務 | 外部 Port | 內部 Port | 說明 |
|------|-----------|-----------|------|
| nginx（主要入口）| **8880** | 80 | 反向代理統一入口 |
| backend API | 8501 | 8000 | FastAPI + RAG + MQTT |
| frontend | 3500 | 3000 | Next.js 儀表板 |
| vlm-webui（stub）| 8590 | 8090 | WebRTC 視覺串流（輕量版）|
| llama-cpp（stub）| 18580 | 8080 | 轉接至 Ollama host |
| cadvisor | 8591 | 8080 | 容器資源監控 |
| MQTT TCP | 1884 | 1883 | Eclipse Mosquitto |
| MQTT WS | 9002 | 9001 | MQTT over WebSocket |

---

## 快速部署

### 前置條件

```bash
# 1. 安裝 Docker Desktop for Mac（Apple Silicon 版）
# https://www.docker.com/products/docker-desktop/

# 2. 安裝 Ollama
brew install ollama
# 或從 https://ollama.com 下載

# 3. 啟動 Ollama 並拉取模型
ollama serve &
ollama pull gemma3:4b          # 建議主要 LLM
ollama pull bge-m3              # RAG embedding 模型
ollama pull qwen2.5-vl:7b      # VLM 視覺推論（可選）

# 4. 確認 Ollama 可用
curl http://localhost:11434/api/tags
```

### 部署步驟

```bash
# 1. Clone 專案
git clone https://github.com/guessleej/xCloudVLMui-macOS.git
cd xCloudVLMui-macOS

# 2. 設定環境
make setup
# 編輯 backend/.env：填入 SECRET_KEY
# 確認 LLM_BASE_URL=http://host.docker.internal:11434
# 編輯 frontend/.env.local：填入 NEXTAUTH_SECRET

# 3. 啟動所有服務
make up

# 4. 驗證服務健康
make test
```

### 訪問介面

| 介面 | URL |
|------|-----|
| 主要 Web UI | `http://localhost:8880` |
| API 文件 | `http://localhost:8880/docs` |
| Ollama | `http://localhost:11434` |

---

## Ollama 模型配置

| 模型 | 大小 | 用途 |
|------|------|------|
| `gemma3:4b` | ~2.5GB | LLM 問答（推薦）|
| `gemma2:9b` | ~5.5GB | LLM 問答（高精度）|
| `bge-m3` | ~600MB | RAG embedding |
| `qwen2.5-vl:7b` | ~4.5GB | VLM 視覺推論 |

> Apple Silicon 的 Unified Memory 架構讓 M 系列 Mac 可高效運行中型 LLM，
> Metal GPU 加速讓推論速度遠超純 CPU。

---

## 故障排除

### Ollama 無法連線
```bash
# 確認 Ollama 正在執行
curl http://localhost:11434/api/tags

# 確認 backend/.env 設定
# LLM_BASE_URL=http://host.docker.internal:11434
```

### Docker Desktop 記憶體配置
```
Docker Desktop → Settings → Resources → Memory
建議設定 8GB 以上（預設 2GB 不足）
```

### ARM64 映像相容性
```bash
# 確認映像有 ARM64 版本
docker pull --platform linux/arm64 <image>
```

---

## 多平台總覽

| 平台 | 倉庫 | Port | 架構 | 推論加速 |
|------|------|------|------|----------|
| DGX Spark | [xCloudVLMui-dgx-spark](https://github.com/guessleej/xCloudVLMui-dgx-spark) | :8780 | ARM64 | GB10 CUDA 13 / DGX OS 7.4 |
| MIC-743 | [xCloudVLMui-mic743](https://github.com/guessleej/xCloudVLMui-mic743) | :8780 | ARM64 | Blackwell CUDA 12.6 / JetPack 7.x |
| AIR-030 | [xCloudVLMui-air030](https://github.com/guessleej/xCloudVLMui-air030) | :8780 | ARM64 | Ampere CUDA 11.4 / JetPack 5.1 |
| x86 | [xCloudVLMui-x86](https://github.com/guessleej/xCloudVLMui-x86) | :8680 | AMD64 | CPU / 可選 NVIDIA GPU |
| **macOS** | **[xCloudVLMui-macOS](https://github.com/guessleej/xCloudVLMui-macOS)** | **:8880** | **ARM64** | **Ollama on Apple Silicon** |

---

<div align="center">
由 <strong>云碩科技 xCloudinfo Corp.Limited</strong> 開發 · Powered by Apple Silicon + Ollama
</div>
