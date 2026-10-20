using Vapless.Application.DTOs;
using Vapless.Application.Interfaces;
using Vapless.Domain.Interfaces;

namespace Vapless.Application.Services;

public sealed class SchoolAirService : ISchoolAirService
{
    private const int MinimumReadings = 8;
    private readonly ISchoolAirRepository _readings;
    private readonly ISchoolAirGenerator _generator;
    private readonly IUnitOfWork _unitOfWork;

    public SchoolAirService(ISchoolAirRepository readings, ISchoolAirGenerator generator, IUnitOfWork unitOfWork)
    {
        _readings = readings;
        _generator = generator;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SchoolAirReadingDto>> GetLatestAsync(CancellationToken ct = default)
    {
        var latest = await _readings.ListLatestAsync(MinimumReadings, ct);
        if (latest.Count < MinimumReadings)
        {
            var generated = _generator.Generate(MinimumReadings);
            foreach (var reading in generated)
            {
                await _readings.AddAsync(reading, ct);
            }

            await _unitOfWork.SaveChangesAsync(ct);
            latest = await _readings.ListLatestAsync(MinimumReadings, ct);
        }

        return latest
            .Select(r => new SchoolAirReadingDto(
                r.SensorId,
                r.Zone,
                Math.Round(r.Co2Ppm, 0),
                Math.Round(r.Pm25, 1),
                Math.Round(r.TemperatureC, 1),
                Math.Round(r.Humidity, 0),
                r.Synthetic,
                r.RecordedAt,
                Label(r.Co2Ppm, r.Pm25)))
            .ToList();
    }

    private static string Label(double co2, double pm25)
    {
        if (co2 >= 1200 || pm25 >= 35)
        {
            return "Ventilá el espacio";
        }

        if (co2 >= 800 || pm25 >= 15)
        {
            return "Aire aceptable";
        }

        return "Aire fresco";
    }
}
