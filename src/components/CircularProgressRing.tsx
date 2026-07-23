type Props = {
  percent: number;
  current: number;
  total: number;
};

export function CircularProgressRing({ percent, current, total }: Props) {
  const size = 56;
  const stroke = 4;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(percent, 1));

  return (
    <div
      className="flex items-center gap-2"
      style={{ direction: "ltr" }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          style={{ transformOrigin: "50% 50%" }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--gold)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-start justify-center text-base font-semibold text-white"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)", marginTop: 18 }}
        >
          {Math.round(percent * 100)}%
        </span>
      </div>
      <span
        className="font-medium text-white/80"
        style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)", fontSize: "1rem" }}
      >
        {current} / {total}
      </span>
    </div>
  );
}
