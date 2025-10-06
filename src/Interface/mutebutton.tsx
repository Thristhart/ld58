import { Howler } from "howler";
import { useState, useEffect } from "react";
import "./mutebutton.css";

export function MuteButton() {
    const [muted, setMuted] = useState(localStorage.getItem("muted") === "true");
    useEffect(() => {
        Howler.mute(muted);
        localStorage.setItem("muted", `${muted}`);
    }, [muted]);
    const [volume, setVolume] = useState(parseFloat(localStorage.getItem("volume") ?? "1.0"));
    useEffect(() => {
        Howler.volume(volume);
        localStorage.setItem("volume", `${volume}`);
    }, [volume]);
    return (
        <div className="volumecontrols">
            <button className={"MuteButton"} onClick={() => setMuted((m) => !m)}>
                {muted ? "🔇" : "🔉"}
            </button>
            <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => setVolume(e.target.valueAsNumber)}
            />
        </div>
    );
}
