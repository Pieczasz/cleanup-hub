// Leaflet
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Marker } from "react-leaflet";

// Interfaces
interface CustomMarkerProps {
  position: L.LatLngExpression;
  children: React.ReactNode;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ position, children }) => {
  // Inline SVG as a string
  const inlineSVG = `
    <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet">
      <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
        <path d="M2425 4890 c-579 -62 -1066 -441 -1260 -980 -65 -181 -77 -262 -82 -553 -5 -287 1 -362 42 -522 32 -123 84 -248 160 -385 138 -251 954 -1759 985 -1820 41 -82 113 -152 186 -180 156 -58 301 12 395 192 23 46 263 479 532 963 270 484 508 916 529 960 48 99 102 271 124 390 35 201 28 579 -16 773 -114 513 -487 926 -985 1091 -192 63 -426 91 -610 71z m298 -1046 c138 -31 291 -119 385 -222 104 -115 192 -303 192 -414 0 -99 -75 -272 -165 -381 -90 -108 -228 -199 -370 -243 -86 -27 -324 -27 -410 0 -142 44 -280 135 -370 243 -90 109 -165 282 -165 381 0 111 88 299 192 414 92 100 236 186 372 219 92 23 245 24 339 3z"/>
      </g>
    </svg>
  `;

  const customIcon = L.divIcon({
    className: "custom-marker",
    html: inlineSVG, // Use inline SVG as HTML content for the icon
    iconSize: [50, 50], // Size of the icon
    iconAnchor: [25, 50], // Adjust anchor point of the icon
  });

  return (
    <Marker position={position} icon={customIcon}>
      {children}
    </Marker>
  );
};

export default CustomMarker;
