const tickerItems = [
  { text: "Social Media Architecture", accent: false },
  { text: "Growth", accent: true },
  { text: "Visual Distinction", accent: false },
  { text: "Brand Systems", accent: true },
  { text: "Creative Direction", accent: false },
  { text: "Architecture Systems", accent: true },
];

function TickerGroup() {
  return (
    <div className="marquee-group px-[var(--section-padding-x)] py-3.5">
      {tickerItems.map((item, index) => (
        <div key={`${item.text}-${index}`} className="contents">
          <span
            className={`marquee-item ${item.accent ? "marquee-item--accent" : ""}`}
          >
            {item.text}
          </span>
          {index < tickerItems.length - 1 ? (
            <span className="marquee-separator" aria-hidden>
              —
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default function MarqueeTicker() {
  return (
    <section className="marquee-shell">
      <div className="marquee-track">
        <TickerGroup />
        <TickerGroup />
      </div>
    </section>
  );
}
