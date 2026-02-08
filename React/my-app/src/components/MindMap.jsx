import React, { useState, useRef, useCallback } from 'react';

const MindMap = () => {
    const containerRef = useRef(null);
    const [nodes, setNodes] = useState([
        { id: 1, text: 'Central Idea', x: 400, y: 250, isRoot: true }
    ]);
    const [connections, setConnections] = useState([]);
    const [draggingNode, setDraggingNode] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Helper to calculate the "bendy" path between two points
    const getCurvePath = (startX, startY, endX, endY) => {
        const midX = (startX + endX) / 2;
        return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
    };

    const handleMouseDown = (e, id) => {
        if (e.target.tagName === 'INPUT') return;
        setDraggingNode({
            id,
            offsetX: e.clientX - nodes.find(n => n.id === id).x,
            offsetY: e.clientY - nodes.find(n => n.id === id).y
        });
    };

    const handleMouseMove = (e) => {
        if (!draggingNode || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - draggingNode.offsetX;
        const y = e.clientY - rect.top - draggingNode.offsetY;

        setNodes(prev => prev.map(node =>
            node.id === draggingNode.id ? { ...node, x, y } : node
        ));
    };

    const stopDragging = () => setDraggingNode(null);

    const addNode = (parentId) => {
        const parent = nodes.find(n => n.id === parentId);
        const newNode = {
            id: Date.now(),
            text: 'New Node',
            x: parent.x + 150,
            y: parent.y + (Math.random() * 100 - 50),
        };

        setNodes(prev => [...prev, newNode]);
        setConnections(prev => [...prev, { from: parentId, to: newNode.id }]);
        setEditingId(newNode.id);
    };

    const updateText = (id, text) => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            style={{
                width: '100%',
                height: '100%',
                background: '#f8f9fa',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'sans-serif',
                userSelect: 'none',
                borderRadius: '14px' // Match other components
            }}
        >
            {/* SVG Layer for Connections */}
            <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#adb5bd" />
                    </marker>
                </defs>
                {connections.map((conn, idx) => {
                    const from = nodes.find(n => n.id === conn.from);
                    const to = nodes.find(n => n.id === conn.to);
                    if (!from || !to) return null;
                    return (
                        <path
                            key={idx}
                            d={getCurvePath(from.x + 60, from.y + 20, to.x, to.y + 20)}
                            stroke="#adb5bd"
                            strokeWidth="2"
                            fill="none"
                            markerEnd="url(#arrowhead)"
                        />
                    );
                })}
            </svg>

            {/* Nodes Layer */}
            {nodes.map(node => (
                <div
                    key={node.id}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                    style={{
                        position: 'absolute',
                        left: node.x,
                        top: node.y,
                        width: '120px',
                        minHeight: '40px',
                        backgroundColor: node.isRoot ? '#4c6ef5' : 'white',
                        color: node.isRoot ? 'white' : '#343a40',
                        border: `2px solid ${node.isRoot ? '#364fc7' : '#dee2e6'}`,
                        borderRadius: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '5px 10px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        cursor: draggingNode?.id === node.id ? 'grabbing' : 'grab',
                        zIndex: 2
                    }}
                >
                    {editingId === node.id ? (
                        <input
                            autoFocus
                            value={node.text}
                            onChange={(e) => updateText(node.id, e.target.value)}
                            onBlur={() => setEditingId(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                            style={{ width: '90%', border: 'none', textAlign: 'center', outline: 'none', background: 'transparent', color: 'inherit' }}
                        />
                    ) : (
                        <div onDoubleClick={() => setEditingId(node.id)} style={{ fontSize: '14px', fontWeight: '500' }}>
                            {node.text}
                        </div>
                    )}

                    {/* Add Child Button */}
                    <button
                        onClick={() => addNode(node.id)}
                        style={{
                            position: 'absolute',
                            right: '-10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: '#51cf66',
                            color: 'white',
                            fontSize: '16px',
                            lineHeight: '1',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        +
                    </button>
                </div>
            ))}

            <div style={{ position: 'absolute', bottom: 20, left: 20, color: '#868e96', fontSize: '12px' }}>
                Double-click text to edit • Drag to move • Click + to add branch
            </div>
        </div>
    );
};

export default MindMap;