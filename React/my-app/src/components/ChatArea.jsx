import React, { useState, useEffect, useRef } from 'react';
import { initializeGemini, sendMessage, resetChat } from '../gemini/geminiChat';
import { speakText, stopAudio } from '../gemini/elevenLabsVoice';

const ChatArea = (props) => {
    const { sidebarMode } = props;
    const [messages, setMessages] = useState([
        { id: 1, sender: 'agent', text: 'Hey What\'s up?' },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const messagesEndRef = useRef(null);

    // Track if we have successfully suggested a theme/tool
    // We use a ref so it persists across renders but doesn't trigger re-renders itself
    const hasSuggestedThemeRef = useRef(false);

    useEffect(() => {
        try {
            initializeGemini();
        } catch (error) {
            console.error("Failed to initialize Gemini:", error);
            setMessages(prev => [...prev, { id: Date.now(), sender: 'agent', text: 'Error: Could not connect to AI service. Please check API key.' }]);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const userText = inputText.trim();
        const newMessage = { id: Date.now(), sender: 'user', text: userText };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            let systemInjection = "";

            // Only analyze if we haven't found a theme yet
            if (!hasSuggestedThemeRef.current) {
                const { analyzeTheme } = await import('../gemini/geminiChat');
                const analysis = await analyzeTheme(userText);
                console.log("Analysis Result:", analysis);

                if (analysis.theme && analysis.theme !== 'Unclear') {
                    // Found a clear theme!
                    hasSuggestedThemeRef.current = true;

                    if (props.onThemeAction) {
                        if (analysis.theme === 'Specificity') {
                            props.onThemeAction('mode', 'visualizer');
                            systemInjection = "[SYSTEM: The user describes a specific scenario. Suggest they use the 'Visualizer' tool in the sidebar to map it out.] ";
                        } else if (analysis.theme === 'Complexity') {
                            props.onThemeAction('mode', 'mind_map');
                            systemInjection = "[SYSTEM: The user describes a complex situation. Suggest they use the 'Mind Map' tool in the sidebar to organize their thoughts.] ";
                        } else if (analysis.theme === 'Simplicity') {
                            if (analysis.targetGame) {
                                props.onThemeAction('game', analysis.targetGame);
                                systemInjection = `[SYSTEM: The user expresses simple but strong emotion. Suggest they play '${analysis.targetGame}' in the Games menu to help regulate this emotion.] `;
                            }
                        }
                    }

                    // Schedule follow-up check (only once when theme is found)
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('gemini-followup-check'));
                    }, 10000);
                } else {
                    // Theme is Unclear
                    systemInjection = "[SYSTEM: The user's input is unclear or vague. Do NOT give advice yet. Ask a clarifying question to determine if they are navigating a specific scenario (Specificity), dealing with complex relationships (Complexity), or feeling strong emotions (Simplicity). Your goal is to categorize them before helping.] ";
                }
            }

            // Contextualize the message based on sidebar mode
            let contextPrefix = "";
            if (sidebarMode) {
                const modeName = sidebarMode.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                contextPrefix = `[User is currently in "${modeName}" view] `;
            }

            // Send actual message with injected system instruction to guide the agent's response
            const fullPrompt = systemInjection + contextPrefix + userText;
            console.log("--- DEBUG: SENDING MESSAGE ---");
            console.log("System Injection:", systemInjection);
            console.log("Full Prompt:", fullPrompt);
            const responseText = await sendMessage(fullPrompt);

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'agent',
                text: responseText
            }]);

            if (voiceEnabled) {
                speakText(responseText).catch(console.error);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'agent',
                text: "I'm sorry, I encountered an error responding to that."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        resetChat();
        stopAudio();
        // Reset theme tracking on chat reset
        if (hasSuggestedThemeRef.current) hasSuggestedThemeRef.current = false;
        setMessages([{ id: Date.now(), sender: 'agent', text: 'Chat reset. How can I help you now?' }]);
    };

    const toggleVoice = () => {
        if (voiceEnabled) {
            stopAudio();
        }
        setVoiceEnabled(!voiceEnabled);
    };

    return (
        <div className="chat-area">
            <div className="messages-list">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
                {isLoading && (
                    <div className="message-bubble agent">
                        <span className="loading-dots">Thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="input-area">
                <button
                    onClick={toggleVoice}
                    className="voice-button"
                    title={voiceEnabled ? "Voice On" : "Voice Off"}
                    style={{
                        marginRight: '10px',
                        backgroundColor: voiceEnabled ? '#4285f4' : '#6c757d',
                        fontSize: '16px',
                        padding: '8px 12px'
                    }}
                >
                    {voiceEnabled ? '🔊' : '🔇'}
                </button>
                <button onClick={handleReset} className="reset-button" title="Reset Chat" style={{ marginRight: '10px', backgroundColor: '#6c757d' }}>
                    ↺
                </button>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading}>
                    {isLoading ? '...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default ChatArea;
