import React from 'react';

const VisualizerDisplay = ({ data }) => {
    if (!data) {
        return (
            <div className="visualizer-empty">
                <div className="visualizer-empty-icon">👁️</div>
                <p>No visualization yet</p>
                <span>When you describe a situation in chat, a visualization will appear here</span>
            </div>
        );
    }

    return (
        <div className="visualizer-content">
            <div className="visualizer-section">
                <div className="visualizer-section-header">
                    <span className="visualizer-icon">🏠</span>
                    <h4>SCENE</h4>
                </div>
                <p>{data.scene || 'No scene information'}</p>
            </div>

            <div className="visualizer-section">
                <div className="visualizer-section-header">
                    <span className="visualizer-icon">👥</span>
                    <h4>CHARACTERS</h4>
                </div>
                <p>{data.characters || 'No characters'}</p>
            </div>

            <div className="visualizer-section">
                <div className="visualizer-section-header">
                    <span className="visualizer-icon">▶️</span>
                    <h4>ACTION SEQUENCE</h4>
                </div>
                <p>{data.actionSequence || 'No actions'}</p>
            </div>

            <div className="visualizer-section">
                <div className="visualizer-section-header">
                    <span className="visualizer-icon">💬</span>
                    <h4>DIALOGUE</h4>
                </div>
                <p>{data.dialogue || 'No dialogue reported'}</p>
            </div>
        </div>
    );
};

export default VisualizerDisplay;
