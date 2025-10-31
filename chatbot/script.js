class AgriChatbot {
    constructor() {
        this.initializeChatbot();
    }
    
    initializeChatbot() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupChatbot());
        } else {
            this.setupChatbot();
        }
    }
    
    setupChatbot() {
        console.log('Setting up chatbot...');
        
        // Get elements with null checks
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        
        // Check if all elements exist
        if (!this.chatMessages || !this.userInput || !this.sendButton) {
            console.error('Missing HTML elements:', {
                chatMessages: !!this.chatMessages,
                userInput: !!this.userInput,
                sendButton: !!this.sendButton
            });
            return;
        }
        
        console.log('All elements found, initializing event listeners...');
        this.initializeEventListeners();
        this.addMessage('Chatbot ready! How can I help you with agriculture today?', 'bot');
    }
    
    initializeEventListeners() {
        console.log('Setting up event listeners...');
        
        this.sendButton.addEventListener('click', () => {
            console.log('Send button clicked');
            this.sendMessage();
        });
        
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Enter key pressed');
                this.sendMessage();
            }
        });
        
        console.log('Event listeners setup complete');
    }
    
    async sendMessage() {
    const message = this.userInput.value.trim();
    const language = document.getElementById('languageSelect')?.value || 'english';
    
    console.log('🔍 FRONTEND DEBUG - Sending message:', message);
    console.log('🔍 FRONTEND DEBUG - Selected language:', language);
    
    // Add user message
    this.addMessage(message, 'user');
    this.userInput.value = '';
    this.sendButton.disabled = true;

    // Show thinking message
    const thinkingElement = this.addMessage('Agri-Assist is thinking...', 'bot', true);

    try {
        console.log('🔍 FRONTEND DEBUG - Making API request...');
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                language: language 
            })
        });
        
        console.log('🔍 FRONTEND DEBUG - API response status:', response.status);
        const data = await response.json();
        console.log('🔍 FRONTEND DEBUG - API response data:', data);
        
        // Remove thinking message
        thinkingElement.remove();
        
        // Add bot response
        if (data.answer) {
            this.addMessage(data.answer, 'bot');
        } else {
            this.addMessage('Sorry, I encountered an error.', 'bot');
        }
        
    } catch (error) {
        console.error('❌ FRONTEND ERROR:', error);
        thinkingElement.remove();
        this.addMessage('Sorry, I encountered an error. Please check the console.', 'bot');
    }
    
    this.sendButton.disabled = false;
}
    
    addMessage(text, sender, isThinking = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message ${isThinking ? 'thinking' : ''}`;
        messageDiv.textContent = text;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        return messageDiv;
    }
}

// Initialize chatbot
console.log('Loading AgriChatbot...');
new AgriChatbot();