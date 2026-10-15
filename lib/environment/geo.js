export function distanceKm(lat1, lon1, lat2, lon2) {
  const rad = (deg) => (deg * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

// K-08 & privasi: koordinat perangkat dibulatkan 2 desimal (± 1 km) sebelum dipakai.
export const roundCoordinate = (value) => Math.round(value * 100) / 100;
