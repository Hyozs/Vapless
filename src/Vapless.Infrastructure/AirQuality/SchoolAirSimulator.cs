using Vapless.Application.Interfaces;
using Vapless.Domain.Entities;

namespace Vapless.Infrastructure.AirQuality;

public sealed class SchoolAirSimulator : ISchoolAirGenerator
{
    private static readonly string[] Sensors = ["AULA-10B", "TALLER-MEC", "BIBLIOTECA", "PATIO-CENTRAL"];
    private static readonly string[] Zones = ["Bloque técnico", "Taller de mecánica", "Biblioteca", "Patio central"];

    public IReadOnlyList<SchoolAirReading> Generate(int count)
    {
        var random = new Random(1067);
        var now = DateTime.UtcNow;
        var readings = new List<SchoolAirReading>(count);

        for (var i = 0; i < count; i++)
        {
            var index = i % Sensors.Length;
            var co2 = 520 + random.NextDouble() * 780;
            var pm25 = 4 + random.NextDouble() * 26;

            readings.Add(new SchoolAirReading
            {
                SensorId = Sensors[index],
                Zone = Zones[index],
                Co2Ppm = Math.Round(co2, 0),
                Pm25 = Math.Round(pm25, 1),
                TemperatureC = Math.Round(21 + random.NextDouble() * 6, 1),
                Humidity = Math.Round(48 + random.NextDouble() * 22, 0),
                Synthetic = true,
                RecordedAt = now.AddMinutes(-i * 6)
            });
        }

        return readings;
    }
}
