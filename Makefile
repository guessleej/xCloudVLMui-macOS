###############################################################################
# Makefile — xCloudVLMui Platform [bot-mac]
#
# 硬體：Apple Silicon Mac (M1/M2/M3/M4)
# GPU ：Apple Metal / Neural Engine (不支援 CUDA)
# 推論：Ollama 在 host 端運行 (host.docker.internal:11434)
#
# Port 配置 (bot-mac 專用)：
#   nginx    → http://localhost:8880
#   backend  → http://localhost:8501/api/health
#   frontend → http://localhost:3500
#   cadvisor → http://localhost:8591
#   mosquitto→ mqtt://localhost:1884
###############################################################################

.PHONY: all help setup up down restart logs status test clean

COMPOSE      := docker compose
COMPOSE_FILE := -f docker-compose.yml

BLUE  := \033[0;34m
GREEN := \033[0;32m
YELLOW:= \033[1;33m
NC    := \033[0m

all: help

help:
	@printf "$(BLUE)╔══════════════════════════════════════════════════╗$(NC)\n"
	@printf "$(BLUE)║  xCloudVLMui — bot-mac · Apple Silicon · ARM64  ║$(NC)\n"
	@printf "$(BLUE)║  Ollama on host · Docker Desktop for Mac         ║$(NC)\n"
	@printf "$(BLUE)╠══════════════════════════════════════════════════╣$(NC)\n"
	@printf "$(BLUE)║  nginx:8880  backend:8501  frontend:3500         ║$(NC)\n"
	@printf "$(BLUE)╚══════════════════════════════════════════════════╝$(NC)\n"
	@printf "$(YELLOW)前置條件：$(NC)\n"
	@printf "  1. 安裝 Ollama: brew install ollama\n"
	@printf "  2. 拉取模型:   ollama pull gemma4:e4b && ollama pull bge-m3\n"
	@printf "  3. 啟動 Ollama: ollama serve\n"
	@echo ""
	@printf "$(YELLOW)啟動：$(NC)\n"
	@printf "  make setup    複製 .env 設定檔\n"
	@printf "  make up       建置並啟動所有服務\n"
	@printf "  make test     驗證健康狀態\n"

setup:
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env; fi
	@if [ ! -f frontend/.env.local ]; then cp frontend/.env.local.example frontend/.env.local; fi
	@printf "$(GREEN)✓ setup 完成，請填入 .env 後執行 make up$(NC)\n"

up:
	$(COMPOSE) $(COMPOSE_FILE) up -d --build
	@printf "$(GREEN)✓ bot-mac 服務已啟動！$(NC)\n"
	@printf "  主要入口 → $(BLUE)http://localhost:8880$(NC)\n"
	@printf "  Backend  → $(BLUE)http://localhost:8501/api/health$(NC)\n"
	@printf "  Frontend → $(BLUE)http://localhost:3500$(NC)\n"

down:
	$(COMPOSE) $(COMPOSE_FILE) down

restart:
	$(COMPOSE) $(COMPOSE_FILE) restart

logs:
	$(COMPOSE) $(COMPOSE_FILE) logs -f --tail=100

logs-backend:
	$(COMPOSE) $(COMPOSE_FILE) logs -f --tail=100 backend

logs-frontend:
	$(COMPOSE) $(COMPOSE_FILE) logs -f --tail=100 frontend

status:
	@printf "$(BLUE)── bot-mac 容器狀態 ──$(NC)\n"
	$(COMPOSE) $(COMPOSE_FILE) ps

test:
	@PASS=0; FAIL=0; \
	for url in "http://localhost:8501/api/health" "http://localhost:8880/api/health"; do \
		CODE=$$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 $$url 2>/dev/null); \
		if [ "$$CODE" = "200" ]; then \
			printf "  $(GREEN)✓$(NC) $$url → $$CODE\n"; PASS=$$((PASS+1)); \
		else \
			printf "  \033[0;31m✗$(NC) $$url → $$CODE\n"; FAIL=$$((FAIL+1)); \
		fi; \
	done; \
	printf "  通過: $$PASS / 失敗: $$FAIL\n"

clean:
	$(COMPOSE) $(COMPOSE_FILE) down --rmi local
