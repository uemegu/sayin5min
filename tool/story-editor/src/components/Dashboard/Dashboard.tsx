import React from "react";
import { Link } from "react-router-dom";
import { useSnapshot } from "valtio";
import { editorStore, editorActions } from "../../store/editorStore";
import { Settings, FileUp, Save } from "lucide-react";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
    const { storyData } = useSnapshot(editorStore);

    if (!storyData) return <div className="dashboard-loading">Loading Story Data...</div>;

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(storyData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Story.ja.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Story Editor: Dashboard</h1>
                <div className="dashboard-actions">
                    <Link to="/config" className="action-button">
                        <Settings size={18} /> Asset Studio
                    </Link>
                    <button onClick={handleExport} className="action-button">
                        <Save size={18} /> Export JSON
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <h2>Chapters ({storyData.chapters.length})</h2>
                <div className="chapter-grid">
                    {storyData.chapters.map((chapter, index) => (
                        <div key={chapter.id} className="chapter-card">
                            <div className="chapter-card-header">
                                <span className="chapter-id">{chapter.id}</span>
                            </div>
                            <div className="chapter-card-body">
                                <h3>{chapter.title}</h3>
                                <p>{chapter.scenes.length} Scenes</p>
                            </div>
                            <div className="chapter-card-footer">
                                <Link to={`/editor/${index}`} className="edit-button">Edit Scenes</Link>
                            </div>
                        </div>
                    ))}
                    {/* Placeholder for Add Chapter */}
                    <div className="chapter-card add-card" onClick={() => alert("Add Chapter Not Implemented Yet")}>
                        <span>+ Add Chapter</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
