namespace Vapless.Domain.Enums;

public enum ComunaMedellin
{
    Popular = 1,
    SantaCruz = 2,
    Manrique = 3,
    Aranjuez = 4,
    Castilla = 5,
    DoceDeOctubre = 6,
    Robledo = 7,
    VillaHermosa = 8,
    BuenosAires = 9,
    LaCandelaria = 10,
    LaurelesEstadio = 11,
    LaAmerica = 12,
    SanJavier = 13,
    ElPoblado = 14,
    Guayabal = 15,
    Belen = 16,
    Palmitas = 90,
    SanCristobal = 91,
    SanAntonioDePrado = 92,
    SantaElena = 93,
    Altavista = 94
}

public static class ComunaCatalog
{
    private static readonly Dictionary<ComunaMedellin, string> Names = new()
    {
        [ComunaMedellin.Popular] = "Popular",
        [ComunaMedellin.SantaCruz] = "Santa Cruz",
        [ComunaMedellin.Manrique] = "Manrique",
        [ComunaMedellin.Aranjuez] = "Aranjuez",
        [ComunaMedellin.Castilla] = "Castilla",
        [ComunaMedellin.DoceDeOctubre] = "Doce de Octubre",
        [ComunaMedellin.Robledo] = "Robledo",
        [ComunaMedellin.VillaHermosa] = "Villa Hermosa",
        [ComunaMedellin.BuenosAires] = "Buenos Aires",
        [ComunaMedellin.LaCandelaria] = "La Candelaria",
        [ComunaMedellin.LaurelesEstadio] = "Laureles - Estadio",
        [ComunaMedellin.LaAmerica] = "La América",
        [ComunaMedellin.SanJavier] = "San Javier",
        [ComunaMedellin.ElPoblado] = "El Poblado",
        [ComunaMedellin.Guayabal] = "Guayabal",
        [ComunaMedellin.Belen] = "Belén",
        [ComunaMedellin.Palmitas] = "San Sebastián de Palmitas",
        [ComunaMedellin.SanCristobal] = "San Cristóbal",
        [ComunaMedellin.SanAntonioDePrado] = "San Antonio de Prado",
        [ComunaMedellin.SantaElena] = "Santa Elena",
        [ComunaMedellin.Altavista] = "Altavista"
    };

    public static string GetName(ComunaMedellin comuna) =>
        Names.TryGetValue(comuna, out var name) ? name : $"Comuna {(int)comuna}";

    public static bool IsValid(int code) => Enum.IsDefined(typeof(ComunaMedellin), code);

    public static ComunaMedellin FromCode(int code) => (ComunaMedellin)code;

    public static IEnumerable<ComunaMedellin> All => Names.Keys;
}
