const SPARKS = [
  { x: 150, y: 168, delay: "0s", garnet: false },
  { x: 1040, y: 150, delay: "1.4s", garnet: false },
  { x: 250, y: 500, delay: "2.2s", garnet: true },
  { x: 990, y: 470, delay: "0.8s", garnet: false },
  { x: 600, y: 78, delay: "3s", garnet: false },
  { x: 430, y: 530, delay: "1.8s", garnet: false },
  { x: 800, y: 96, delay: "2.6s", garnet: true },
];

const WAVES = [
  { d: "M-30 214C170 132 310 286 490 198S820 108 1040 188 1260 246 1260 188", flow: "await-flow" },
  { d: "M-30 318C190 392 370 236 610 318S990 412 1260 286", flow: "await-flow await-flow-slow" },
  {
    d: "M-30 438C200 512 430 352 690 446S1020 528 1260 398",
    flow: "await-flow await-flow-slow",
    delay: "-7s",
  },
  {
    d: "M-30 268C150 214 280 372 470 286S780 196 980 292 1160 360 1260 300",
    flow: "await-flow await-flow-garnet",
    trace: "await-trace await-trace-garnet",
  },
];

export function HistoryAwait() {
  return (
    <div className="history-await" aria-hidden>
      <svg viewBox="0 80 1200 500" preserveAspectRatio="xMidYMid meet" fill="none">
        {WAVES.map((wave) => (
          <path key={wave.d} pathLength="1000" className={wave.trace ?? "await-trace"} d={wave.d} />
        ))}
        {WAVES.map((wave) => (
          <path
            key={`${wave.d}-flow`}
            pathLength="1000"
            className={wave.flow}
            style={wave.delay ? { animationDelay: wave.delay } : undefined}
            d={wave.d}
          />
        ))}

        <g transform="translate(600 320)">
          <circle r="210" fill="rgba(196,163,90,0.14)" className="await-breathe" />
          <g className="await-spin">
            <circle r="214" className="await-ring await-ring-soft" />
            <circle cy="-214" r="6" fill="#c4a35a" />
            <path d="M0 -214v26" className="await-ring" />
            <circle cx="214" r="4.5" fill="#7a2433" />
          </g>
          <g className="await-spin-rev">
            <circle r="148" className="await-ring" strokeDasharray="3 9" />
            <circle cy="-148" r="7" fill="#e0c57a" />
            <circle cx="-148" r="3.5" fill="#c4a35a" />
          </g>
          <circle r="72" className="await-ring await-ring-garnet" />
          <circle r="6" fill="#c4a35a" />
          <circle r="2.2" fill="#fffaf2" />
        </g>

        {SPARKS.map((spark) => (
          <g key={`${spark.x}-${spark.y}`} transform={`translate(${spark.x} ${spark.y})`}>
            <path
              className={spark.garnet ? "await-spark await-spark-garnet" : "await-spark"}
              style={{ animationDelay: spark.delay }}
              d="M0-8 1.7-1.7 8 0 1.7 1.7 0 8-1.7 1.7-8 0-1.7-1.7Z"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
