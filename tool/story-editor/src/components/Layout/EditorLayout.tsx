import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSnapshot } from "valtio";
import { editorStore, editorActions } from "../../store/editorStore";
import SceneList from "../SceneList/SceneList";
import Preview from "../Preview/Preview";
import Inspector from "../Inspector/Inspector";
import FlowEditor from "../FlowEditor/FlowEditor";
import { ArrowLeft, GitGraph, FileText } from "lucide-react";

const EditorLayout: React.FC = () => {
    const { chapterIndex } = useParams<{ chapterIndex: string }>();
    const { storyData } = useSnapshot(editorStore);
    const [viewMode, setViewMode] = React.useState<"text" | "graph">("text");

    useEffect(() => {
        if (chapterIndex && storyData) {
            const idx = parseInt(chapterIndex);
            if (!isNaN(idx) && idx >= 0 && idx < storyData.chapters.length) {
                editorActions.selectChapter(idx);
            }
        }
    }, [chapterIndex, storyData]);

    if (!storyData) return <div>Loading...</div>;

    const currentChapter = storyData.chapters[editorStore.currentChapterIndex];

    return (
        <div className="editor-container">
            <header className="editor-header">
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Link to="/" className="icon-button" title="Back to Dashboard">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1>{currentChapter?.title || "Untitled Chapter"}</h1>
                </div>

                <div className="view-toggle">
                    <button
                        className={viewMode === "text" ? "active" : "secondary"}
                        onClick={() => setViewMode("text")}
                        title="Text Preview"
                    >
                        <FileText size={16} /> Text
                    </button>
                    <button
                        className={viewMode === "graph" ? "active" : "secondary"}
                        onClick={() => setViewMode("graph")}
                        title="Flow Graph"
                    >
                        <GitGraph size={16} /> Graph
                    </button>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => {
                        const blob = new Blob([JSON.stringify(storyData, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "Story.ja.json";
                        a.click();
                        URL.revokeObjectURL(url);
                    }}>Export JSON</button>
                </div>
            </header>
            <main className="editor-main">
                <div className="pane left-pane">
                    <SceneList />
                </div>
                <div className="pane center-pane">
                    {viewMode === "text" && <Preview />}
                    {viewMode === "graph" && <FlowEditor />}
                </div>
                <div className="pane right-pane">
                    <Inspector />
                </div>
            </main>
        </div>
    );
};

export default EditorLayout;
