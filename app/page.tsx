import Image from "next/image";

export default function Home() {
  return (
    <main className="stage">
      <section className="television" aria-label="Wondervision retro television">
        <Image
          className="televisionArtwork"
          src="/wondervision-tv.png"
          alt="Gold mid-century television on a turquoise background"
          fill
          priority
          sizes="100vw"
        />

        <div className="screenMask">
          <div className="broadcast">
            <div className="scanlines" aria-hidden="true" />
            <div className="screenGlow" aria-hidden="true" />

            <div className="stationId">
              <span>WV</span>
              <span>CH 05</span>
            </div>

            <div className="program">
              <p className="eyebrow">Now broadcasting</p>
              <h1>Wondervision</h1>
              <p className="tagline">Stories from a brighter tomorrow.</p>
              <button type="button">Enter the picture</button>
            </div>

            <p className="signal">LIVE · COLOR</p>
          </div>
        </div>
      </section>
    </main>
  );
}
