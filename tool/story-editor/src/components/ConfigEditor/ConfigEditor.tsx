import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSnapshot } from "valtio";
import { editorStore, editorActions } from "../../store/editorStore";
import { ArrowLeft, Trash2, Plus, Play, Square } from "lucide-react";
import "./ConfigEditor.css";

const ConfigEditor: React.FC = () => {
    const snap = useSnapshot(editorStore);
    const [activeType, setActiveType] = useState<"backgrounds" | "bgms" | "voices" | "avatars" | "animations">("backgrounds");
    const assetRoot = import.meta.env.VITE_ASSET_ROOT || "/game-assets";

    // Audio control state
    const [playingUrl, setPlayingUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    if (!snap.storyData) return <div className="loading">Data not loaded</div>;

    const configList = snap.storyData.config[activeType] as any[];

    const handleUpdate = (newList: any[]) => {
        editorActions.updateConfig(activeType, newList);
    };

    const handleItemChange = (idx: number, field: string, value: string) => {
        const newList = [...configList.map(item => ({ ...item }))];
        newList[idx][field] = value;
        handleUpdate(newList);
    };

    const handleDelete = (idx: number) => {
        const newList = configList.filter((_, i) => i !== idx);
        handleUpdate(newList);
    };

    const handleAdd = () => {
        const newItem = activeType === "avatars"
            ? { key: "new_char", value: "./models/placeholder.vrm", option: "New Character" }
            : { key: "new_item", value: activeType === "bgms" ? "./bgms/placeholder.mp3" : "./images/placeholder.png" };
        handleUpdate([...configList, newItem]);
    };

    const resolvePath = (assetPath: string) => {
        const cleaned = assetPath.replace(/^\.\//, "");
        return `${assetRoot}/${cleaned}`;
    };

    const toggleAudio = (url: string) => {
        if (playingUrl === url) {
            // Stop
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setPlayingUrl(null);
        } else {
            // Stop current if any
            if (audioRef.current) {
                audioRef.current.pause();
            }
            // Play new
            const audio = new Audio(url);
            audioRef.current = audio;
            setPlayingUrl(url);
            audio.play().catch(err => {
                console.error("Playback failed", err);
                setPlayingUrl(null);
            });
            audio.onended = () => {
                setPlayingUrl(null);
                audioRef.current = null;
            };
        }
    };

    return (
        <div className="config-editor-container">
            <header className="config-header">
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Link to="/" className="icon-button"><ArrowLeft /></Link>
                    <h1>Asset Studio</h1>
                </div>
            </header>

            <div className="config-main">
                <nav className="config-sidebar">
                    <button className={activeType === "backgrounds" ? "active" : ""} onClick={() => setActiveType("backgrounds")}>Backgrounds</button>
                    <button className={activeType === "bgms" ? "active" : ""} onClick={() => setActiveType("bgms")}>BGM</button>
                    <button className={activeType === "voices" ? "active" : ""} onClick={() => setActiveType("voices")}>Voices</button>
                    <button className={activeType === "avatars" ? "active" : ""} onClick={() => setActiveType("avatars")}>Avatars</button>
                    <button className={activeType === "animations" ? "active" : ""} onClick={() => setActiveType("animations")}>Animations</button>
                </nav>

                <div className="config-content">
                    <div className="content-header">
                        <h2>{activeType.toUpperCase()}</h2>
                        <button className="add-button" onClick={handleAdd}><Plus size={16} /> Add New</button>
                    </div>

                    <div className="asset-grid">
                        {configList.map((item, idx) => {
                            const fullPath = resolvePath(item.value);
                            const isPlaying = playingUrl === fullPath;

                            return (
                                <div key={idx} className="asset-card">
                                    <div className="asset-preview">
                                        {activeType === "backgrounds" && (
                                            <img src={fullPath} alt={item.key} onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.classList.add('missing');
                                            }} />
                                        )}
                                        {(activeType === "bgms" || activeType === "voices") && (
                                            <div className="audio-preview">
                                                <button
                                                    className={`audio-control-btn ${isPlaying ? 'playing' : ''}`}
                                                    onClick={() => toggleAudio(fullPath)}
                                                >
                                                    {isPlaying ? <Square size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                                                </button>
                                                <span>{isPlaying ? "Playing..." : "Click to preview"}</span>
                                            </div>
                                        )}
                                        {activeType === "avatars" && (
                                            <div className="vrm-placeholder">
                                                <Box size={40} />
                                                <span>VRM: {item.value.split("/").pop()}</span>
                                            </div>
                                        )}
                                        {activeType === "animations" && (
                                            <div className="anime-placeholder">
                                                <Play size={40} />
                                                <span>Motion: {item.key}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="asset-info">
                                        <div className="input-group">
                                            <label>Key</label>
                                            <input value={item.key} onChange={(e) => handleItemChange(idx, "key", e.target.value)} />
                                        </div>
                                        <div className="input-group">
                                            <label>Value (Path)</label>
                                            <input value={item.value} onChange={(e) => handleItemChange(idx, "value", e.target.value)} />
                                        </div>
                                        {item.option !== undefined && (
                                            <div className="input-group">
                                                <label>Option (Name)</label>
                                                <input value={item.option} onChange={(e) => handleItemChange(idx, "option", e.target.value)} />
                                            </div>
                                        )}
                                        <button className="delete-asset" onClick={() => handleDelete(idx)}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Box = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);

export default ConfigEditor;
