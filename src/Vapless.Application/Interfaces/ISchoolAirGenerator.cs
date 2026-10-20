using Vapless.Application.DTOs;

namespace Vapless.Application.Interfaces;

public interface ISchoolAirGenerator
{
    IReadOnlyList<Domain.Entities.SchoolAirReading> Generate(int count);
}
