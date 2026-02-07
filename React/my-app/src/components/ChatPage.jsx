import React, { useState } from 'react';
import ChatArea from './ChatArea';
import Sidebar from './Sidebar';
import '../App.css';

const ChatPage = () => {
    const [sidebarMode, setSidebarMode] = useState('mode_selection');
    const [visualizerData, setVisualizerData] = useState(null);

    const handleVisualization = (data) => {
        setVisualizerData(data);
    };

    return (
        <div className="chat-page">
            <div className="chat-area-container">
                <ChatArea
                    sidebarMode={sidebarMode}
                    onVisualization={handleVisualization}
                />
            </div>
            <div className="sidebar-container">
                <Sidebar
                    mode={sidebarMode}
                    setMode={setSidebarMode}
                    visualizerData={visualizerData}
                />
            </div>
        </div>
    );
};

export default ChatPage;
