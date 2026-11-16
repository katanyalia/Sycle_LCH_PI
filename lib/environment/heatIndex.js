// Referensi algoritma: NWS Weather Prediction Center, "The Heat Index Equation" (Rothfusz 1990 + penyesuaian).
// Heat Index adalah estimasi rasa panas dari suhu & kelembapan relatif — BUKAN suhu tubuh,
// diagnosis, indeks UV, atau skor risiko medis.

const toFahrenheit = (celsius) => (celsius * 9) / 5 + 32;
const toCelsius = (fahrenheit) => ((fahrenheit - 32) * 5) / 9;

// Rentang masuk akal untuk input; di luar ini dianggap tidak valid (tidak dihitung).
export const HEAT_INDEX_INPUT_LIMITS = {
  temperatureC: { min: -30, max: 60 },
  humidity: { min: 0, max: 100 },
};

export function isValidHeatIndexInput(temperatureC, humidity) {
  return (
    Number.isFinite(temperatureC) &&
    Number.isFinite(humidity) &&
    temperatureC >= HEAT_INDEX_INPUT_LIMITS.temperatureC.min &&
    temperatureC <= HEAT_INDEX_INPUT_LIMITS.temperatureC.max &&
    humidity >= HEAT_INDEX_INPUT_LIMITS.humidity.min &&
    humidity <= HEAT_INDEX_INPUT_LIMITS.humidity.max
  );
}

// Mengembalikan Heat Index dalam °C (1 desimal), atau null bila input tidak valid.
export function computeHeatIndexC(temperatureC, humidity) {
  if (!isValidHeatIndexInput(temperatureC, humidity)) return null;

  const T = toFahrenheit(temperatureC);
  const RH = humidity;

  // Langkah 1: rumus sederhana Steadman.
  let hi = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + RH * 0.094);

  // Langkah 2: bila rata-rata dengan suhu >= 80°F, pakai regresi Rothfusz.
  if ((hi + T) / 2 >= 80) {
    hi =
      -42.379 +
      2.04901523 * T +
      10.14333127 * RH -
      0.22475541 * T * RH -
      0.00683783 * T * T -
      0.05481717 * RH * RH +
      0.00122874 * T * T * RH +
      0.00085282 * T * RH * RH -
      0.00000199 * T * T * RH * RH;

    // Penyesuaian kelembapan rendah.
    if (RH < 13 && T >= 80 && T <= 112) {
      hi -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    }
    // Penyesuaian kelembapan tinggi.
    if (RH > 85 && T >= 80 && T <= 87) {
      hi += ((RH - 85) / 10) * ((87 - T) / 5);
    }
  }

  return Math.round(toCelsius(hi) * 10) / 10;
}
