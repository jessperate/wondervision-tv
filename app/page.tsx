"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

const channels = [
  {
    number: "05",
    eyebrow: "Now broadcasting",
    title: "Wondervision",
    tagline: "Stories from a brighter tomorrow.",
    action: "Enter the picture",
  },
  {
    number: "08",
    eyebrow: "Tonight at eight",
    title: "Midnight Movie",
    tagline: "A strange transmission from somewhere beyond.",
    action: "Watch the trailer",
  },
  {
    number: "13",
    eyebrow: "Special presentation",
    title: "Please Stand By",
    tagline: "Wondervision will return after this brief intermission.",
    action: "View the schedule",
  },
];

export default function Home() {
  const [channel, setChannel] = useState(0);
  const [powered, setPowered] = useState(true);
  const program = channels[channel];
  const dialStyle = { "--dial-angle": `${channel * 105}deg` } as CSSProperties;

  function changeChannel() {
    setPowered(true);
    setChannel((current) => (current + 1) % channels.length);
  }

  return (
    <main className="stage">
      <section className="television" aria-label="Interactive Wondervision retro television">
        <Image
          className="televisionArtwork"
          src="/wondervision-tv.png"
          alt="Gold mid-century television on a turquoise background"
          fill
          priority
          sizes="150vw"
        />

        <div className="screenMask" aria-live="polite">
          <div className={`broadcast channel-${channel} ${powered ? "isOn" : "isOff"}`}>
            <div className="scanlines" aria-hidden="true" />
            <div className="screenGlow" aria-hidden="true" />

            <div className="screenContent" key={`${channel}-${powered}`} aria-hidden={!powered}>
              <div className="stationId">
                <span>WV</span>
                <span>CH {program.number}</span>
              </div>

              <div className="program">
                <p className="eyebrow">{program.eyebrow}</p>
                <h1>{program.title}</h1>
                <p className="tagline">{program.tagline}</p>
                <button type="button">{program.action}</button>
              </div>

              <p className="signal">LIVE · COLOR</p>
            </div>

            <div className="powerStandby" aria-hidden={powered}>
              <span />
              Wondervision
            </div>
          </div>
        </div>

        <button
          className="dial channelDial"
          type="button"
          data-label="Change channel"
          style={dialStyle}
          onClick={changeChannel}
          aria-label={`Change channel. Current channel ${program.number}: ${program.title}`}
        >
          <span className="dialVisual" aria-hidden="true" />
        </button>

        <button
          className={`dial powerDial ${powered ? "isActive" : ""}`}
          type="button"
          data-label={powered ? "Turn off" : "Turn on"}
          onClick={() => setPowered((current) => !current)}
          aria-label={powered ? "Turn television off" : "Turn television on"}
          aria-pressed={powered}
        >
          <span className="dialVisual" aria-hidden="true" />
        </button>
      </section>
    </main>
  );
}
