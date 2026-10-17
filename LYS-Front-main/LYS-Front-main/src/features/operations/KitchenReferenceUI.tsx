import { Icon, type IconName } from "./OperationsVisuals";
import { type Order } from "./operationsStore";

export function KitchenChannel({ order }: { order: Order }) {
  return (
    <span className={`kr-channel channel-${order.channel}`}>
      <Icon
        name={
          order.channel === "Delivery"
            ? "scooter"
            : order.channel === "Recojo"
              ? "bag"
              : "cutlery"
        }
      />
      {order.channel}
    </span>
  );
}
export function KitchenSummary({
  entries,
}: {
  entries: {
    label: string;
    value: string | number;
    icon: IconName;
    tone?: string;
    hint?: string;
  }[];
}) {
  return (
    <div className="kr-summary">
      {entries.map((entry) => (
        <div key={entry.label} className={entry.tone || ""}>
          <Icon name={entry.icon} />
          <span>
            {entry.label}
            {entry.hint && <small>{entry.hint}</small>}
          </span>
          <strong>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
}
export function KitchenChart({
  values,
  line = false,
  unit = "",
  label,
}: {
  values: { label: string; value: number; preparing?: number }[];
  line?: boolean;
  unit?: string;
  label: string;
}) {
  const max = Math.max(
    unit ? 40 : 4,
    Math.ceil(Math.max(0, ...values.map((value) => value.value)) / 4) * 4,
  );
  const x = (index: number) =>
    55 + (index * 510) / Math.max(1, values.length - (line ? 1 : 0));
  const y = (value: number) => 220 - (value / max) * 180;
  const points = values
    .map((value, index) => `${x(index)},${y(value.value)}`)
    .join(" ");
  return (
    <div className="kr-chart">
      <svg viewBox="0 0 600 270" role="img" aria-label={label}>
        {Array.from({ length: 5 }, (_, index) => (
          <g key={index}>
            <path d={`M55 ${220 - index * 45}H575`} stroke="#e8edf4" />
            <text x="45" y={225 - index * 45} textAnchor="end">
              {(max * index) / 4}
              {unit && ` ${unit}`}
            </text>
          </g>
        ))}
        {line && (
          <>
            <polygon points={`55,220 ${points} 565,220`} fill="#ef001614" />
            <polyline
              points={points}
              fill="none"
              stroke="#ef0016"
              strokeWidth="3"
            />
          </>
        )}
        {values.map((value, index) => (
          <g key={value.label}>
            {line ? (
              <circle cx={x(index)} cy={y(value.value)} r="4" fill="#ef0016" />
            ) : (
              <rect
                x={x(index) + 5}
                y={y(value.value)}
                width={Math.min(70, (510 / Math.max(1, values.length)) * 0.65)}
                height={220 - y(value.value)}
                rx="3"
                fill={
                  value.preparing !== undefined
                    ? "#d5dae3"
                    : unit
                      ? ["#ef3040", "#ff9f23", "#b4bfce", "#d3d9e3"][index % 4]
                      : "#ef3040"
                }
              />
            )}
            {!line && value.preparing !== undefined && (
              <rect
                x={x(index) + 5}
                y={y(value.value)}
                width={Math.min(70, (510 / Math.max(1, values.length)) * 0.65)}
                height={(Math.max(0, value.preparing) / max) * 180}
                rx="2"
                fill="#ed0017"
              />
            )}
            <text
              x={
                x(index) +
                (line
                  ? 0
                  : Math.min(70, (510 / Math.max(1, values.length)) * 0.65) /
                      2 +
                    5)
              }
              y="247"
              textAnchor="middle"
            >
              {values.length < 8 || index % 2 === 0 ? value.label : ""}
            </text>
            {!line && unit && (
              <text
                x={
                  x(index) +
                  Math.min(70, (510 / Math.max(1, values.length)) * 0.65) / 2 +
                  5
                }
                y={y(value.value) - 10}
                textAnchor="middle"
              >
                {Math.round(value.value)} {unit}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
