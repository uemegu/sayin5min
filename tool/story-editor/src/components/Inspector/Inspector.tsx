import React, { useState } from "react";
import { useSnapshot } from "valtio";
import { editorStore, editorActions } from "../../store/editorStore";
import type { Expression, Avatar } from "../../types/story";
import "./Inspector.css";

const Inspector: React.FC = () => {
    const { storyData, currentChapterIndex, currentSceneIndex } = useSnapshot(editorStore);
    const [tab, setTab] = useState<"scene" | "chars" | "logic">("scene");

    if (!storyData) return null;
    const scene = storyData.chapters[currentChapterIndex]?.scenes[currentSceneIndex];
    if (!scene) return <div className="inspector-empty">Select a scene to edit properties</div>;

    const updateScene = (updates: any) => editorActions.updateScene(updates);

    return (
        <div className="inspector-container">
            <div className="inspector-tabs">
                <button className={tab === "scene" ? "active" : ""} onClick={() => setTab("scene")}>Scene</button>
                <button className={tab === "chars" ? "active" : ""} onClick={() => setTab("chars")}>Chars</button>
                <button className={tab === "logic" ? "active" : ""} onClick={() => setTab("logic")}>Logic</button>
            </div>

            <div className="inspector-content scrollable">
                {tab === "scene" && (
                    <div className="inspector-section">
                        <label>Location</label>
                        <input value={scene.location} onChange={(e) => updateScene({ location: e.target.value })} />

                        <label>Background</label>
                        <select value={scene.background} onChange={(e) => updateScene({ background: e.target.value })}>
                            <option value="">None</option>
                            {storyData.config.backgrounds.map(b => <option key={b.key} value={b.key}>{b.key}</option>)}
                        </select>

                        <label>BGM</label>
                        <select value={scene.bgm} onChange={(e) => updateScene({ bgm: e.target.value })}>
                            <option value="">None</option>
                            {storyData.config.bgms.map(b => <option key={b.key} value={b.key}>{b.key}</option>)}
                        </select>

                        <label>Voice</label>
                        <select value={scene.voice} onChange={(e) => updateScene({ voice: e.target.value })}>
                            <option value="">None</option>
                            {storyData.config.voices.map(v => <option key={v.key} value={v.key}>{v.key}</option>)}
                        </select>

                        <label>Effect</label>
                        <select value={scene.effect || ""} onChange={(e) => updateScene({ effect: e.target.value || undefined })}>
                            <option value="">None</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                )}

                {tab === "chars" && (
                    <div className="inspector-section">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h3>Avatars ({scene.avatars?.length || 0})</h3>
                            <button onClick={() => {
                                const newAvatars = [...(scene.avatars || []), { id: storyData.config.avatars[0]?.key || "", action: "idle" }];
                                updateScene({ avatars: newAvatars });
                            }}>Add</button>
                        </div>
                        {scene.avatars?.map((avatar, idx) => (
                            <div key={idx} className="avatar-edit-card">
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <select
                                        value={avatar.id}
                                        onChange={(e) => {
                                            const newAvatars = [...scene.avatars!];
                                            newAvatars[idx] = { ...newAvatars[idx], id: e.target.value };
                                            updateScene({ avatars: newAvatars });
                                        }}
                                    >
                                        {storyData.config.avatars.map(a => <option key={a.key} value={a.key}>{a.key} ({a.option})</option>)}
                                    </select>
                                    <button className="danger-text" onClick={() => {
                                        const newAvatars = scene.avatars!.filter((_, i) => i !== idx);
                                        updateScene({ avatars: newAvatars });
                                    }}>Delete</button>
                                </div>

                                <div className="avatar-edit-grid">
                                    <div>
                                        <label>Expression</label>
                                        <select
                                            value={avatar.expression || "normal"}
                                            onChange={(e) => {
                                                const newAvatars = [...scene.avatars!];
                                                newAvatars[idx] = { ...newAvatars[idx], expression: e.target.value as Expression };
                                                updateScene({ avatars: newAvatars });
                                            }}
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="happy">Happy</option>
                                            <option value="sad">Sad</option>
                                            <option value="angry">Angry</option>
                                            <option value="surprised">Surprised</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Action</label>
                                        <select
                                            value={avatar.action}
                                            onChange={(e) => {
                                                const newAvatars = [...scene.avatars!];
                                                newAvatars[idx] = { ...newAvatars[idx], action: e.target.value };
                                                updateScene({ avatars: newAvatars });
                                            }}
                                        >
                                            {storyData.config.animations.map(a => <option key={a.key} value={a.key}>{a.key}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <label><input type="checkbox" checked={avatar.attension} onChange={(e) => {
                                        const newAvatars = [...scene.avatars!];
                                        newAvatars[idx] = { ...newAvatars[idx], attension: e.target.checked };
                                        updateScene({ avatars: newAvatars });
                                    }} /> Focus</label>
                                    <label><input type="checkbox" checked={avatar.zoom} onChange={(e) => {
                                        const newAvatars = [...scene.avatars!];
                                        newAvatars[idx] = { ...newAvatars[idx], zoom: e.target.checked };
                                        updateScene({ avatars: newAvatars });
                                    }} /> Zoom</label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === "logic" && (
                    <div className="inspector-section">
                        <label>Scene ID</label>
                        <input value={scene.id || ""} onChange={(e) => updateScene({ id: e.target.value })} placeholder="unique_id" />

                        <label>Goto (Jump to Chapter.Scene or "good_end")</label>
                        <input value={scene.goto || ""} onChange={(e) => updateScene({ goto: e.target.value })} placeholder="chapter_id.scene_id" />

                        <h3>Conditions (Requirements)</h3>
                        {(scene.conditions || []).map((cond, idx) => (
                            <div key={idx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                <input
                                    value={cond}
                                    onChange={(e) => {
                                        const newConds = [...(scene.conditions || [])];
                                        newConds[idx] = e.target.value;
                                        updateScene({ conditions: newConds });
                                    }}
                                    placeholder="Flag name"
                                />
                                <button className="danger-text" onClick={() => {
                                    const newConds = scene.conditions!.filter((_, i) => i !== idx);
                                    updateScene({ conditions: newConds.length > 0 ? newConds : undefined });
                                }}>Remove</button>
                            </div>
                        ))}
                        <button onClick={() => {
                            const newConds = [...(scene.conditions || []), ""];
                            updateScene({ conditions: newConds });
                        }}>Add Condition</button>

                        <h3>Choices (Items)</h3>
                        {scene.items?.map((item, idx) => (
                            <div key={idx} className="item-edit-card">
                                <input value={item.text} onChange={(e) => {
                                    const newItems = [...scene.items!];
                                    newItems[idx] = { ...newItems[idx], text: e.target.value };
                                    updateScene({ items: newItems });
                                }} placeholder="Choice text" />
                                <input value={item.flg || ""} onChange={(e) => {
                                    const newItems = [...scene.items!];
                                    newItems[idx] = { ...newItems[idx], flg: e.target.value };
                                    updateScene({ items: newItems });
                                }} placeholder="Flag name" />
                                <button onClick={() => {
                                    const newItems = scene.items!.filter((_, i) => i !== idx);
                                    updateScene({ items: newItems.length > 0 ? newItems : undefined });
                                }}>Remove Choice</button>
                            </div>
                        ))}
                        <button onClick={() => {
                            const newItems = [...(scene.items || []), { text: "New Choice" }];
                            updateScene({ items: newItems });
                        }}>Add Choice</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inspector;
