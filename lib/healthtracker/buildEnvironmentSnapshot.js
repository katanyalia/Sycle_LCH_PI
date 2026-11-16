export function buildEnvironmentSnapshot(environment) {
  if (
    !environment?.location?.label ||
    !environment?.retrievedAt ||
    !environment?.indicators
  ) {
    return null;
  }

  const { location, retrievedAt, indicators } = environment;

  return {
    location_label: location.label,
    location_code: location.code ?? null,
    lat: location.lat ?? null,
    lon: location.lon ?? null,
    captured_at: retrievedAt,
    indicators,
  };
}