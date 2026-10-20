using Vapless.Domain.Common;

namespace Vapless.Domain.Entities;

public class SchoolAirReading : BaseEntity
{
    public string SensorId { get; set; } = "AULA-10B";
    public string Zone { get; set; } = "Bloque técnico";
    public double Co2Ppm { get; set; }
    public double Pm25 { get; set; }
    public double TemperatureC { get; set; }
    public double Humidity { get; set; }
    public bool Synthetic { get; set; } = true;
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
}
