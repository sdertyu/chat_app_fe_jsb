<template>
    <div class="chat-typing">
        <div class="typing-indicator">
            <div class="typing-bubble">
                <div class="typing-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Component for showing typing indicator
</script>

<style scoped>
.chat-typing {
    display: flex;
    align-items: flex-start;
    margin: 8px 0;
    padding: 0 16px;
}

.typing-indicator {
    display: flex;
    align-items: center;
}

.typing-bubble {
    background-color: #e4e6ea;
    border-radius: 18px;
    padding: 12px 16px;
    margin-left: 8px;
    position: relative;
}

.typing-bubble::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 8px solid #e4e6ea;
}

.typing-dots {
    display: flex;
    align-items: center;
    gap: 3px;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #8a8d91;
    animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
    animation-delay: -0.32s;
}

.dot:nth-child(2) {
    animation-delay: -0.16s;
}

.dot:nth-child(3) {
    animation-delay: 0s;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0.8);
        opacity: 0.5;
    }

    40% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .typing-bubble {
        background-color: #3a3b3c;
    }

    .typing-bubble::before {
        border-right-color: #3a3b3c;
    }

    .dot {
        background-color: #b0b3b8;
    }
}
</style>
