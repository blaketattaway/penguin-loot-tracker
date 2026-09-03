import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useTranslation } from "react-i18next";

import { Party } from "../../../hooks/endpoints";
import { penguinPin } from "./penguinPin";

import "leaflet/dist/leaflet.css";
import styles from "../party.module.css";

interface PartyMapProps {
  parties: Party[];
  selectedYear: number | null;
  onSelect: (year: number) => void;
}

/**
 * Frames every edition on first render, and eases to one when it's picked.
 * Split out because these are imperative Leaflet calls, and `useMap` only works
 * from inside the MapContainer tree.
 */
const MapFraming = ({
  parties,
  selectedYear,
}: {
  parties: Party[];
  selectedYear: number | null;
}) => {
  const map = useMap();

  // The first render frames everything; only a deliberate change of year flies
  // to one pin. Without this the initial selection would immediately zoom into
  // a single city and the guild would never see the map's whole point.
  const hasFramed = useRef(false);
  const previousYear = useRef<number | null>(null);

  const bounds = useMemo(
    () => parties.map((party) => [party.latitude, party.longitude] as [number, number]),
    [parties]
  );

  useEffect(() => {
    if (bounds.length === 0 || hasFramed.current) return;

    hasFramed.current = true;

    if (bounds.length === 1) {
      map.setView(bounds[0], 11);
      return;
    }

    map.fitBounds(L.latLngBounds(bounds), { padding: [56, 56], maxZoom: 9 });
  }, [map, bounds]);

  useEffect(() => {
    const previous = previousYear.current;
    previousYear.current = selectedYear;

    // Only a real change of year flies. The very first selection arrives
    // together with the fit above, and flying then would undo it.
    if (previous === null || previous === selectedYear || selectedYear === null)
      return;

    const party = parties.find((p) => p.year === selectedYear);
    if (!party) return;

    // flyTo over setView: the movement is what tells the user the map and the
    // section below are showing the same place.
    map.flyTo([party.latitude, party.longitude], Math.max(map.getZoom(), 9), {
      duration: 0.7,
    });
    // `parties` is intentionally not a dependency: re-fetching the list (a
    // language switch refetches for localized pet names) must not re-fly the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, selectedYear]);

  return null;
};

/**
 * Where the guild has partied. Each pin is a penguin; clicking one opens that
 * year's section below.
 *
 * Scroll-wheel zoom is off deliberately — the map sits inside a scrolling page,
 * and hijacking the wheel to zoom is the classic way an embedded map stops the
 * page from scrolling. The zoom buttons and pinch-to-zoom still work.
 */
const PartyMap = ({ parties, selectedYear, onSelect }: PartyMapProps) => {
  const { t } = useTranslation();

  const located = parties.filter(
    (party) => party.latitude !== 0 || party.longitude !== 0
  );

  if (located.length === 0) return null;

  return (
    <div className={styles.map}>
      <MapContainer
        center={[located[0].latitude, located[0].longitude]}
        zoom={5}
        scrollWheelZoom={false}
        attributionControl
        style={{ height: "100%", width: "100%" }}
      >
        {/* Plain OpenStreetMap tiles, darkened by a CSS filter on the tile pane
            (see .mapTiles). The dark basemaps that ship ready-made — CARTO,
            Stadia — now all want an API key, and a key is a secret to rotate
            and a bill to watch for a map a dozen people will ever open. */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        <MapFraming parties={located} selectedYear={selectedYear} />

        {located.map((party) => (
          <Marker
            key={party.year}
            position={[party.latitude, party.longitude]}
            icon={penguinPin({
              className: [
                styles.pin,
                party.year === selectedYear ? styles.pinActive : "",
                party.isUpcoming ? styles.pinUpcoming : "",
              ]
                .filter(Boolean)
                .join(" "),
              innerClassName: styles.pinInner,
              label: t("party.map.pinLabel", {
                year: party.year,
                city: party.city,
              }),
            })}
            eventHandlers={{ click: () => onSelect(party.year) }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              <strong>{party.year}</strong> · {party.city}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PartyMap;
