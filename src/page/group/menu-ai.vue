<template>
  <div class="screen-ai">
    <div class="screen-ai__header">
      <div class="screen-ai__title-row">
        <div class="screen-ai__title">
          <span class="screen-ai__eyebrow">AI 大屏助手</span>
          <strong>{{ currentScreenTitle }}</strong>
        </div>
        <span class="screen-ai__status" :class="{ 'is-loading': loading }">
          <i></i>
          {{ loading ? "生成中" : "就绪" }}
        </span>
      </div>
      <div class="screen-ai__meta">
        <span class="screen-ai__metric">{{ messages.length }} 条消息</span>
        <span class="screen-ai__metric">{{ canvasComponentCount }} 个组件</span>
        <el-button text size="small" :disabled="!messages.length || loading" @click="clearMessages">
          清空记录
        </el-button>
      </div>
    </div>

    <div class="screen-ai__body">
      <div v-if="messages.length === 0" class="screen-ai__welcome">
        <div class="screen-ai__welcome-main">
          <div class="screen-ai__welcome-badge">AI</div>
          <div>
            <h3>告诉我你想怎么调整这个大屏</h3>
            <p>开源版保留 AI 助手体验，会按 public/config.js 中的 ai 配置直连三方模型接口。</p>
          </div>
        </div>
        <div class="screen-ai__quick">
          <button
            v-for="(item, index) in quickPrompts"
            :key="item"
            type="button"
            class="screen-ai__quick-item"
            :disabled="loading"
            @click="sendMessage(item)">
            <span class="screen-ai__quick-index">{{ String(index + 1).padStart(2, "0") }}</span>
            <span class="screen-ai__quick-text">{{ item }}</span>
          </button>
        </div>
      </div>

      <div v-else ref="messageList" class="screen-ai__messages">
        <div
          v-for="message in messages"
          :key="message.id"
          class="screen-ai__message"
          :class="`is-${message.role}`">
          <div class="screen-ai__message-meta">
            <span>{{ message.role === "user" ? "我" : "AI" }}</span>
            <time>{{ message.time }}</time>
          </div>
          <div class="screen-ai__bubble">{{ message.text }}</div>
        </div>
      </div>
    </div>

    <div class="screen-ai__footer">
      <el-input
        v-model="newMessage"
        type="textarea"
        :rows="4"
        resize="none"
        :disabled="loading"
        placeholder="描述你想让 AI 辅助完成的操作"
        @keydown.enter.exact.prevent="sendMessage()" />
      <div class="screen-ai__actions">
        <el-button :disabled="loading || !newMessage.trim()" type="primary" @click="sendMessage">
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { sendMessage as requestAiMessage } from "@/api/ai";
import { aiDefaultModel } from "@/config";

const formatTime = () =>
  new Date().toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

export default {
  name: "MenuAiPanel",
  inject: ["contain"],
  data() {
    return {
      newMessage: "",
      loading: false,
      messages: [],
      quickPrompts: [
        "分析当前大屏还有哪些可以优化",
        "帮我整理当前画布组件结构",
        "给当前大屏生成三条改进建议",
        "说明如何配置一个静态数据图表",
      ],
    };
  },
  computed: {
    currentScreenTitle() {
      return this.contain?.config?.title || this.contain?.config?.name || "未命名大屏";
    },
    canvasComponentCount() {
      return Array.isArray(this.contain?.list) ? this.contain.list.length : 0;
    },
  },
  methods: {
    clearMessages() {
      this.messages = [];
      this.newMessage = "";
    },
    async sendMessage(text) {
      const content = String(text || this.newMessage || "").trim();
      if (!content || this.loading) return;
      this.messages.push({
        id: `user-${Date.now()}`,
        role: "user",
        text: content,
        time: formatTime(),
      });
      this.newMessage = "";
      this.loading = true;
      try {
        const response = await requestAiMessage(this.buildMessages(content), aiDefaultModel, {
          stream: false,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error?.message || `AI 请求失败：${response.status}`);
        }
        const reply = data?.choices?.[0]?.message?.content || "AI 未返回有效内容";
        this.messages.push({
          id: `ai-${Date.now()}`,
          role: "assistant",
          text: reply,
          time: formatTime(),
        });
      } catch (error) {
        this.messages.push({
          id: `ai-error-${Date.now()}`,
          role: "assistant",
          text: error?.message || "AI 请求失败，请检查 public/config.js 中的 ai 配置",
          time: formatTime(),
        });
        this.$message.error(error?.message || "AI 请求失败");
      } finally {
        this.loading = false;
        this.scrollToBottom();
      }
      this.scrollToBottom();
    },
    buildMessages(content) {
      const screen = this.contain?.config || {};
      const components = (this.contain?.list || []).slice(0, 30).map(item => ({
        index: item.index,
        name: item.name,
        title: item.title,
        type: item.component?.prop,
        left: item.left,
        top: item.top,
        width: item.component?.width,
        height: item.component?.height,
        group: item.group || "",
      }));
      const history = this.messages
        .slice(-8, -1)
        .map(item => ({
          role: item.role === "user" ? "user" : "assistant",
          content: item.text,
        }));

      return [
        {
          role: "system",
          content:
            "你是 Avue Data 开源版的大屏设计助手。请用简体中文回答，优先给出可执行的设计、数据配置和组件调整建议。当前开源版仅保留基础组件、多屏幕、过滤器和静态/API 数据源，不要建议数据库、SQL、工作流、规则引擎或部署功能。",
        },
        {
          role: "user",
          content: `当前大屏：${JSON.stringify({
            title: screen.title || screen.name || "未命名大屏",
            width: screen.width,
            height: screen.height,
            componentCount: this.canvasComponentCount,
            components,
          })}`,
        },
        ...history,
        {
          role: "user",
          content,
        },
      ];
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messageList;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.screen-ai {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-color-primary);
  color: var(--text-color-primary);
}

.screen-ai__header {
  flex-shrink: 0;
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--border-color-base);
  background: var(--bg-color-secondary);
}

.screen-ai__title-row,
.screen-ai__meta,
.screen-ai__actions,
.screen-ai__message-meta {
  display: flex;
  align-items: center;
}

.screen-ai__title-row {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.screen-ai__title {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;

  strong {
    overflow: hidden;
    font-size: 14px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.screen-ai__eyebrow,
.screen-ai__message-meta time {
  color: var(--text-color-secondary);
  font-size: 11px;
}

.screen-ai__status,
.screen-ai__metric {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border: 1px solid var(--border-color-base);
  border-radius: 6px;
  background: var(--bg-color-light);
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1;
}

.screen-ai__status {
  gap: 6px;

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--success-color);
  }

  &.is-loading i {
    background: var(--primary-color);
    animation: status-pulse 1s ease-in-out infinite;
  }
}

.screen-ai__meta {
  justify-content: space-between;
  gap: 8px;
}

.screen-ai__body {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.screen-ai__welcome,
.screen-ai__messages {
  flex: 1;
  overflow-y: auto;
}

.screen-ai__welcome {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  padding: 18px;
}

.screen-ai__welcome-main {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border-color-base);
  border-radius: 8px;
  background: var(--bg-color-secondary);

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    line-height: 1.35;
  }

  p {
    margin: 0;
    color: var(--text-color-secondary);
    font-size: 13px;
    line-height: 1.65;
  }
}

.screen-ai__welcome-badge {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary-color);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
}

.screen-ai__quick {
  display: grid;
  gap: 8px;
}

.screen-ai__quick-item {
  width: 100%;
  min-height: 58px;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border-color-base);
  background: var(--bg-color-card);
  color: var(--text-color-primary);
  border-radius: 8px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
}

.screen-ai__quick-index {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary-lighter-color);
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 600;
}

.screen-ai__quick-text {
  min-width: 0;
  font-size: 13px;
  line-height: 1.45;
}

.screen-ai__messages {
  padding: 14px;
}

.screen-ai__message {
  margin-bottom: 14px;

  &.is-user {
    text-align: right;
  }
}

.screen-ai__message-meta {
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.screen-ai__bubble {
  display: inline-block;
  max-width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 8px;
  background: var(--bg-color-secondary);
  color: var(--text-color-primary);
  font-size: 13px;
  line-height: 1.65;
  text-align: left;
  white-space: pre-wrap;
}

.is-user .screen-ai__bubble {
  background: var(--primary-color);
  color: #fff;
}

.screen-ai__footer {
  flex-shrink: 0;
  padding: 12px;
  border-top: 1px solid var(--border-color-base);
  background: var(--bg-color-secondary);
}

.screen-ai__actions {
  justify-content: flex-end;
  margin-top: 8px;
}

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.45;
    transform: scale(0.78);
  }
}
</style>
