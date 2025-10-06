import { Howler } from "howler";
import { useState, useEffect } from "react";
import "./mutebutton.css";

export function MuteButton() {
    const [muted, setMuted] = useState(false);
    useEffect(() => {
        Howler.mute(muted);
    }, [muted]);
    return (
        <button className={"MuteButton"} onClick={() => setMuted((m) => !m)}>
            {muted ? "🔇" : "🔉"}
        </button>
    );
}
