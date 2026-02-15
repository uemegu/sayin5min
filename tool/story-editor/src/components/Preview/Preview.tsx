import React, { useRef, useEffect } from "react";
import { useSnapshot } from "valtio";
import { editorStore, editorActions } from "../../store/editorStore";
import "./Preview.css";

const Preview: React.FC = () => {
    const { storyData, currentChapterIndex, currentSceneIndex } = useSnapshot(editorStore);
    const textRef = useRef<HTMLTextAreaElement>(null);

    if (!storyData) return null;
    const chapter = storyData.chapters[currentChapterIndex];
    const scene = chapter?.scenes[currentSceneIndex];
    if (!scene) return <div className="preview-empty">No scene selected</div>;

    const background = storyData.config.backgrounds.find(b => b.key === scene.background);
    const bgUrl = background ? `../../../../public/${background.value.replace("./", "")}` : "";

    // Shortcut handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                editorActions.addScene();
                // Focus will be handled by the next render
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (textRef.current) {
            textRef.current.focus();
        }
    }, [currentSceneIndex]);

    return (
        <div className="preview-wrapper">
            <div
                className="preview-canvas"
                style={{
                    backgroundImage: bgUrl ? `url(${bgUrl})` : "none",
                    backgroundColor: "#222"
                }}
            >
                <div className="preview-characters">
                    {scene.avatars?.map((avatar, idx) => (
                        <div
                            key={idx}
                            className={`preview-avatar ${avatar.attension ? "attension" : ""} ${avatar.zoom ? "zoom" : ""}`}
                            title={avatar.id}
                        >
                            <div className="avatar-placeholder">
                                <span className="avatar-label">{avatar.id}</span>
                                <span className="avatar-expression">{avatar.expression || "normal"}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="preview-ui">
                    <div className="preview-location">{scene.location}</div>
                    <div className="preview-dialogue-box">
                        <textarea
                            ref={textRef}
                            className="preview-text-input"
                            value={scene.text}
                            onChange={(e) => editorActions.updateScene({ text: e.target.value })}
                            placeholder="Enter dialogue here... (Ctrl+Enter to add next scene)"
                        />
                    </div>
                </div>
            </div>

            {scene.items && (
                <div className="preview-items-overlay">
                    <div className="items-container">
                        {scene.items.map((item, idx) => (
                            <div key={idx} className="item-pill">
                                {item.text} {item.flg && <span className="item-flg">➜ {item.flg}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Preview;
