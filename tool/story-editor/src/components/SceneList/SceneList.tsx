import React from "react";
import { useSnapshot } from "valtio";
import { editorStore, editorActions } from "../../store/editorStore";
import { Plus, Trash2 } from "lucide-react";
import "./SceneList.css";

const SceneList: React.FC = () => {
    const { storyData, currentChapterIndex, currentSceneIndex } = useSnapshot(editorStore);

    if (!storyData) return null;
    const chapter = storyData.chapters[currentChapterIndex];
    if (!chapter) return null;

    return (
        <div className="scene-list-container">
            <div className="scene-list-header">
                <span>Scenes ({chapter.scenes.length})</span>
                <button className="icon-button" onClick={() => editorActions.addScene()} title="Add Scene (Ctrl+Enter)">
                    <Plus size={16} />
                </button>
            </div>
            <div className="scrollable">
                {chapter.scenes.map((scene, index) => (
                    <div
                        key={index}
                        className={`scene-item ${index === currentSceneIndex ? "active" : ""}`}
                        onClick={() => editorActions.selectScene(index)}
                    >
                        <div className="scene-item-num">{index + 1}</div>
                        <div className="scene-item-content">
                            <div className="scene-item-title">{scene.id || `Scene ${index + 1}`}</div>
                            <div className="scene-item-loc">{scene.location}</div>
                            <div className="scene-item-preview">{scene.text || (scene.items ? "[Choice Selection]" : "(No text)")}</div>
                        </div>
                        {chapter.scenes.length > 1 && (
                            <button
                                className="delete-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm("Delete this scene?")) editorActions.deleteScene();
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SceneList;
