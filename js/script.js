// AI按钮滚动效果
let lastScrollTop = 0;
const aiButton = document.getElementById("ai-floating-btn");

window.addEventListener("scroll", () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const deltaY = (scrollTop - lastScrollTop) * 0.3;

  // 获取按钮当前位置
  const currentTop = parseInt(getComputedStyle(aiButton).top);
  // 计算新位置（保持在视窗中间）
  const targetTop = window.innerHeight / 2 + deltaY;

  // 平滑过渡到新位置
  aiButton.style.transition = "transform 0.3s ease-out";
  aiButton.style.transform = `translateY(${deltaY}px)`;

  lastScrollTop = scrollTop;
});

// AI对话框控制
const aiChatSidebar = document.getElementById("ai-chat-sidebar");
const closeChat = document.querySelector(".close-chat");

aiButton.addEventListener("click", () => {
  aiChatSidebar.classList.add("active");
});

closeChat.addEventListener("click", () => {
  aiChatSidebar.classList.remove("active");
});

// 发送消息功能
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-message");
const chatMessages = document.getElementById("chat-messages");

// 添加API配置
const API_CONFIG = {
  url: "https://api.hbyzn.cn",
  model: "gpt-4o-2024-08-06",
  apiKey: "sk-9QGQsCeFSp6ZsR0708F07a825bA44d9b96640a03CaF88a1c", // 初始API密钥为空
};

// 获取API密钥输入框和设置按钮
const apiKeyInput = document.getElementById("api-key");
const setApiKeyButton = document.getElementById("set-api-key");

// 监听设置API密钥按钮的点击事件
setApiKeyButton.addEventListener("click", () => {
  const apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    // 更新API配置中的apiKey
    API_CONFIG.apiKey = apiKey;
    alert("API密钥设置成功！");
  } else {
    alert("请输入有效的API密钥");
  }
});

// 修改发送消息功能
async function sendToAI(message) {
  try {
    if (!API_CONFIG.apiKey) {
      throw new Error("API密钥未设置");
    }

    const response = await fetch(API_CONFIG.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_CONFIG.apiKey}`, // 使用用户输入的API密钥
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("API请求失败");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI响应错误:", error);
    return "抱歉，我现在无法回答。请稍后再试。";
  }
}

// 更新消息显示样式
function addMessage(message, isUser = true) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user-message" : "ai-message"}`;

  // 添加消息样式
  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.textContent = message;

  messageDiv.appendChild(messageContent);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 更新发送按钮事件处理
sendButton.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (message) {
    // 显示用户消息
    addMessage(message, true);
    userInput.value = "";

    // 显示加载状态
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "message ai-message loading";
    loadingDiv.textContent = "正在思考...";
    chatMessages.appendChild(loadingDiv);

    // 获取AI响应
    const aiResponse = await sendToAI(message);

    // 移除加载状态
    chatMessages.removeChild(loadingDiv);

    // 显示AI响应
    addMessage(aiResponse, false);
  }
});

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendButton.click();
  }
});
