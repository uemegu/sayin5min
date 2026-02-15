import React, { useMemo, useCallback } from "react";
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    MarkerType,
} from "reactflow";
import type { Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import { useSnapshot } from "valtio";
import { editorStore, editorActions } from "../../store/editorStore";
import type { Scene } from "../../types/story";

const FlowEditor: React.FC = () => {
    const snap = useSnapshot(editorStore);
    const chapter = snap.storyData?.chapters[snap.currentChapterIndex];

    // Convert scenes to nodes and edges with parallel branching logic
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        if (!chapter) return { nodes: [], edges: [] };

        const nodes: Node[] = [];
        const edges: Edge[] = [];
        const ySpacing = 200;
        const xSpacing = 350;

        let lastUnconditionalNodeId: string | null = null;
        let lastUnconditionalIndex: number = -1;
        let pendingBranchNodes: string[] = [];

        // Track current "logical column"
        let currentX = 0;

        (chapter.scenes as any).forEach((scene: Scene, index: number) => {
            const hasConditions = scene.conditions && scene.conditions.length > 0;
            const nodeId = scene.id || `scene-${index}`;
            const isSelected = index === snap.currentSceneIndex;

            // Positioning Logic
            let x = currentX;
            let y = 0;

            if (hasConditions) {
                // It's a branch. Stack it vertically if there are multiple consecutive conditional scenes.
                const branchIdx = index - (lastUnconditionalIndex + 1);
                y = (branchIdx % 2 === 0 ? 1 : -1) * Math.ceil((branchIdx + 1) / 2) * ySpacing;
            } else {
                // Main line. Move to next column.
                currentX += xSpacing;
                x = currentX;
                lastUnconditionalIndex = index;
            }

            nodes.push({
                id: nodeId,
                position: { x, y },
                data: {
                    label: (
                        <div className="node-content">
                            <div className="node-header">
                                <strong>{index + 1}. {scene.id || "No ID"}</strong>
                            </div>
                            <div className="node-location">{scene.location}</div>
                            {hasConditions && (
                                <div className="node-conditions">
                                    IF: {scene.conditions!.join(", ")}
                                </div>
                            )}
                        </div>
                    )
                },
                style: {
                    border: isSelected ? '2px solid #238636' : (hasConditions ? '1px solid #f85149' : '1px solid #30363d'),
                    background: '#161b22',
                    color: '#c9d1d9',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '11px',
                    width: 220,
                    textAlign: 'left'
                },
            });

            // Edge Logic
            if (hasConditions) {
                // Branch from the last unconditional node
                if (lastUnconditionalNodeId) {
                    edges.push({
                        id: `e-branch-${lastUnconditionalNodeId}-${nodeId}`,
                        source: lastUnconditionalNodeId,
                        target: nodeId,
                        label: `IF: ${scene.conditions!.join(", ")}`,
                        animated: true,
                        style: { stroke: '#f85149', strokeWidth: 2 },
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#f85149' },
                    });
                }
                pendingBranchNodes.push(nodeId);
            } else {
                // Main line node. Connect from previous main line AND all pending branches.
                if (lastUnconditionalNodeId) {
                    edges.push({
                        id: `e-main-${lastUnconditionalNodeId}-${nodeId}`,
                        source: lastUnconditionalNodeId,
                        target: nodeId,
                        animated: true,
                        style: { stroke: '#8b949e' },
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#8b949e' },
                    });
                }

                pendingBranchNodes.forEach(branchId => {
                    edges.push({
                        id: `e-merge-${branchId}-${nodeId}`,
                        source: branchId,
                        target: nodeId,
                        animated: true,
                        style: { stroke: '#8b949e', strokeDasharray: '5,5' },
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#8b949e' },
                    });
                });

                // Reset state for next block
                lastUnconditionalNodeId = nodeId;
                pendingBranchNodes = [];
            }

            // Goto override (always takes precedence)
            if (scene.goto) {
                const targetId = scene.goto.includes(".") ? scene.goto.split(".")[1] : scene.goto;
                const targetScene = chapter.scenes.find(s => s.id === targetId);
                if (targetScene) {
                    edges.push({
                        id: `e-goto-${nodeId}-${targetId}`,
                        source: nodeId,
                        target: targetId,
                        label: "GOTO",
                        animated: true,
                        style: { stroke: '#a371f7', strokeWidth: 2 },
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#a371f7' },
                    });
                }
            }
        });

        return { nodes, edges };
    }, [chapter, snap.currentSceneIndex]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Sync when data changes
    React.useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        if (!chapter) return;
        // Reverse lookup index from ID or label
        // Should store index in data for robust lookup
        const index = chapter.scenes.findIndex(s => (s.id || `scene-${chapter.scenes.indexOf(s)}`) === node.id);
        if (index !== -1) {
            editorActions.selectScene(index);
        }
    }, [chapter]);

    return (
        <div style={{ width: "100%", height: "100%", background: "#0d1117" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                fitView
            >
                <Background color="#30363d" gap={20} />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default FlowEditor;
