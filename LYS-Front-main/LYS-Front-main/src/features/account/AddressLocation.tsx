import { mapLink } from "../checkout/location";
import { Icon } from "../../components/Icon";
import type { AccountAddress } from "./accountStore";
export function AddressLocation({ address }: { address: AccountAddress }) {
  return (
    <div className="account-address-location">
      <svg
        viewBox="0 0 480 240"
        role="img"
        aria-label={`Esquema de la dirección ${address.street}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="480" height="240" fill="#edf0f1" />
        <path
          d="M0 20h480M0 100h480M0 190h480M60 0v240M240 0v240M420 0v240"
          stroke="white"
          strokeWidth="17"
        />
        <path d="m0 220 480-200" stroke="white" strokeWidth="20" />
        <path d="M255 110h145v65H255Z" fill="#cfe5cd" />
        <text x="325" y="150" textAnchor="middle" fill="#43633c" fontSize="14">
          {address.district}
        </text>
        <g
          transform="translate(225 80)"
          fill="#ed0000"
          stroke="white"
          strokeWidth="3"
        >
          <path d="M0-26C-38-26-24 8 0 34 24 8 38-26 0-26Z" />
          <circle cy="-4" r="7" fill="white" stroke="none" />
        </g>
      </svg>
      <span>
        {address.point
          ? "Esquema de ubicación"
          : "Sin punto de entrega guardado"}
      </span>
      {address.point && (
        <a
          href={mapLink(address.point)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="pin" />
          Ver ubicación en el mapa
        </a>
      )}
    </div>
  );
}
