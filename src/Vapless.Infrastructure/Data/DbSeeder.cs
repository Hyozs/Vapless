using Microsoft.EntityFrameworkCore;
using Vapless.Domain.Entities;
using Vapless.Domain.Enums;

namespace Vapless.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(VaplessDbContext db, CancellationToken ct = default)
    {
        await SeedProfileAsync(db, ct);
        await SeedHackCardsAsync(db, ct);
        await SeedScenariosAsync(db, ct);
        await SeedHotlinesAsync(db, ct);
        await SeedSurveysAsync(db, ct);
        await SeedCravingsAsync(db, ct);
    }

    private static async Task SeedProfileAsync(VaplessDbContext db, CancellationToken ct)
    {
        if (await db.UserProgresses.AnyAsync(ct))
        {
            return;
        }

        db.UserProgresses.Add(new UserProgress
        {
            Alias = "parcero",
            QuitDate = DateTime.UtcNow.Date.AddDays(-12),
            DailyCostCop = 8_000m,
            NicotineMgPerPod = 50m,
            PodsPerWeek = 3,
            PrimaryDevice = DeviceType.Desechable,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);
    }

    private static async Task SeedHackCardsAsync(VaplessDbContext db, CancellationToken ct)
    {
        if (await db.HackCards.AnyAsync(ct))
        {
            return;
        }

        var cards = new List<HackCard>
        {
            New(HackDeckCategory.MitosDelCuerpo, 1, "El vape solo es vapor de agua.", true,
                "El aerosol lleva nicotina, metales y químicos que irritan las vías respiratorias. No es vapor de agua."),
            New(HackDeckCategory.MitosDelCuerpo, 2, "Vapear te relaja de verdad.", true,
                "La nicotina sube la ansiedad y después la calma un rato: te quita solo el malestar que ella misma creó."),
            New(HackDeckCategory.MitosDelCuerpo, 3, "Un desechable trae poquita nicotina.", true,
                "Un desechable puede traer hasta 50 mg/ml, más que un cigarrillo. Y el cuerpo pide más rápido."),
            New(HackDeckCategory.MitosDelCuerpo, 4, "Si vapeás solo los fines de semana, no te volvés adicto.", true,
                "El cerebro adolescente aprende rápido. El uso social suele escalar sin que lo notes."),
            New(HackDeckCategory.MitosDelCuerpo, 5, "El vape no deja olor, así que no molesta a nadie.", true,
                "El aerosol queda en la ropa y en el aire. Y lo que no se ve también llega a tus pulmones."),
            New(HackDeckCategory.MitosDelCuerpo, 6, "Dejar el vape es solo fuerza de voluntad.", true,
                "La nicotina cambia tu cerebro. Con apoyo, respiración y cambios de rutina se vuelve mucho más llevadero."),

            New(HackDeckCategory.NegocioDelSabor, 1, "Los sabores frutales están ahí solo para que sepa rico.", true,
                "Están diseñados para que el primer contacto no se sienta como fumar. Es marketing, no cariño."),
            New(HackDeckCategory.NegocioDelSabor, 2, "Las empresas de vape no le apuntan a los menores.", true,
                "Colores, sabores y empaques tipo golosina apuntan justo a los más jóvenes."),
            New(HackDeckCategory.NegocioDelSabor, 3, "Un vape caro es de mejor calidad y menos dañino.", true,
                "El precio no cambia la nicotina ni los químicos del aerosol."),
            New(HackDeckCategory.NegocioDelSabor, 4, "Si es de una marca famosa, es confiable.", true,
                "En Colombia la venta a menores está prohibida, pero el mercado informal no verifica nada."),
            New(HackDeckCategory.NegocioDelSabor, 5, "El vape es más barato que el cigarrillo.", true,
                "Un pod cada dos días puede costar más de 100.000 COP al mes. Sostenido un año, es un viaje o un computador."),
            New(HackDeckCategory.NegocioDelSabor, 6, "La rebeldía es vapear.", true,
                "Rebeldía es no regalarle tus lucas a una empresa que disfraza nicotina de sandía helada."),

            New(HackDeckCategory.PresionYParche, 1, "Si tus amigos vapean, tarde o temprano vas a probar.", true,
                "No es una ley. Podés estar en el parche sin vapear; mucha gente lo hace."),
            New(HackDeckCategory.PresionYParche, 2, "Decir que no te hace quedar mal.", false,
                "Un \"no, gracias\" corto y sin sermón suele cerrar el tema. El que insiste es el que está incómodo."),
            New(HackDeckCategory.PresionYParche, 3, "Todos en el colegio vapean.", true,
                "La mayoría no lo hace, aunque parezca lo contrario. Lo que se ve en el baño no es todo el colegio."),
            New(HackDeckCategory.PresionYParche, 4, "Prestar el vape es solo un gesto de amistad.", true,
                "Compartir el dispositivo también comparte bacterias y refuerza la dependencia del grupo."),
            New(HackDeckCategory.PresionYParche, 5, "Si decís que no, te dejan por fuera.", true,
                "Un parche que te saca por no vapear no era un parche."),
            New(HackDeckCategory.PresionYParche, 6, "Cambiar de tema cuando insisten es de cobardes.", true,
                "Cambiar de tema es una estrategia inteligente: bajás la tensión y no entrás en pelea."),

            New(HackDeckCategory.LoQueHayDetras, 1, "Vapeás porque te gusta el sabor.", true,
                "Muchas veces el impulso aparece cuando estás ansioso, aburrido o con algo de casa. El sabor es la excusa."),
            New(HackDeckCategory.LoQueHayDetras, 2, "Si estás estresado, el vape te ayuda a estudiar.", true,
                "La nicotina te saca del estrés por minutos y después te lo devuelve. Rendir no es eso."),
            New(HackDeckCategory.LoQueHayDetras, 3, "Hablar de lo que sentís es de débiles.", true,
                "Ponerle nombre a lo que sentís es justo lo que te da control. La Línea Amiga 106 está para eso."),
            New(HackDeckCategory.LoQueHayDetras, 4, "Si en tu casa todos fuman o vapean, no hay nada que hacer.", true,
                "Podés cambiar tu ruta aunque tu entorno no cambie. Empezá por un día, después por otro."),
            New(HackDeckCategory.LoQueHayDetras, 5, "Pedir ayuda en el colegio es que te reporten.", true,
                "Psicoorientación es confidencial. No es un castigo: es un espacio para vos."),
            New(HackDeckCategory.LoQueHayDetras, 6, "Ya que llevás meses vapeando, dejarlo no sirve.", true,
                "El cuerpo empieza a recuperarse desde las primeras horas. Nunca es tarde para empezar.")
        };

        db.HackCards.AddRange(cards);
        await db.SaveChangesAsync(ct);
    }

    private static async Task SeedScenariosAsync(VaplessDbContext db, CancellationToken ct)
    {
        if (await db.SocialScenarios.AnyAsync(ct))
        {
            return;
        }

        db.SocialScenarios.AddRange(
            new SocialScenario
            {
                Title = "La esquina del barrio",
                Context = "Salís del colegio y el parche se arma en la esquina de siempre. Uno saca un pod y lo pasa.",
                PeerPhrase = "¿Sí o no? Todos estamos vapeando, no te hagás.",
                Trigger = EmotionalTrigger.PresionSocial,
                Difficulty = 1
            },
            new SocialScenario
            {
                Title = "El baño del colegio",
                Context = "En el descanso, dos compañeros entran al baño a vapear y te dicen que cuides la puerta.",
                PeerPhrase = "Quedate ahí y no digás nada, es solo un toque.",
                Trigger = EmotionalTrigger.PresionSocial,
                Difficulty = 2
            },
            new SocialScenario
            {
                Title = "La fiesta de 15",
                Context = "En la fiesta hay música y alguien ofrece un vape de mango. Insiste porque \"no es cigarrillo\".",
                PeerPhrase = "Relajate, esto no es cigarrillo. Probá y me contás.",
                Trigger = EmotionalTrigger.PresionSocial,
                Difficulty = 2
            },
            new SocialScenario
            {
                Title = "El grupo de WhatsApp",
                Context = "En el chat del salón mandan fotos de pods nuevos y retan a quien no se apunte.",
                PeerPhrase = "El que no vapea es porque no tiene plata, jajaja.",
                Trigger = EmotionalTrigger.PresionSocial,
                Difficulty = 2
            },
            new SocialScenario
            {
                Title = "La casa en silencio",
                Context = "Llegás y no hay nadie. Discutiste con tu mamá y la casa se siente muy quieta.",
                PeerPhrase = "Nadie te va a ver. Solo vos y el vape.",
                Trigger = EmotionalTrigger.Familia,
                Difficulty = 3
            },
            new SocialScenario
            {
                Title = "El parcial de matemáticas",
                Context = "Mañana hay parcial y no entendés la mitad de los temas. Sentís el pecho apretado.",
                PeerPhrase = "Unas caladas y seguís estudiando, relajado.",
                Trigger = EmotionalTrigger.EstresAcademico,
                Difficulty = 2
            });

        await db.SaveChangesAsync(ct);
    }

    private static async Task SeedHotlinesAsync(VaplessDbContext db, CancellationToken ct)
    {
        if (await db.SupportHotlines.AnyAsync(ct))
        {
            return;
        }

        db.SupportHotlines.AddRange(
            new SupportHotline
            {
                Name = "Línea Amiga 106",
                Phone = "106",
                Schedule = "24 horas, todos los días",
                Description = "Orientación psicológica gratuita de la Alcaldía de Medellín. Podés hablar de vapeo, ansiedad o problemas en casa.",
                Scope = "Medellín",
                SortOrder = 1
            },
            new SupportHotline
            {
                Name = "Línea de Emergencias 123",
                Phone = "123",
                Schedule = "24 horas, todos los días",
                Description = "Para una urgencia de salud o si alguien está en riesgo inmediato.",
                Scope = "Medellín",
                SortOrder = 2
            },
            new SupportHotline
            {
                Name = "ICBF Línea 141",
                Phone = "141",
                Schedule = "24 horas, todos los días",
                Description = "Protección de niños, niñas y adolescentes. También orienta a familias.",
                Scope = "Colombia",
                SortOrder = 3
            },
            new SupportHotline
            {
                Name = "Psicoorientación Pascual Bravo",
                Phone = "Presencial",
                Schedule = "Lunes a viernes, jornada escolar",
                Description = "Espacio confidencial en el colegio. Podés pedir cita sin que sea un reporte disciplinario.",
                Scope = "Instituto Técnico Industrial Pascual Bravo",
                SortOrder = 4
            });

        await db.SaveChangesAsync(ct);
    }

    private static async Task SeedSurveysAsync(VaplessDbContext db, CancellationToken ct)
    {
        if (await db.RiskSurveys.AnyAsync(ct))
        {
            return;
        }

        var data = new (ComunaMedellin Comuna, int Age, DeviceType Device, int Freq, bool School, EmotionalTrigger Trigger, FamilyContext Family)[]
        {
            (ComunaMedellin.Robledo, 16, DeviceType.Desechable, 8, true, EmotionalTrigger.PresionSocial, FamilyContext.SoloEnCasa),
            (ComunaMedellin.Robledo, 15, DeviceType.Desechable, 6, true, EmotionalTrigger.Ansiedad, FamilyContext.UnSoloPadre),
            (ComunaMedellin.Robledo, 17, DeviceType.PodRecargable, 4, false, EmotionalTrigger.Aburrimiento, FamilyContext.AmbosPadres),
            (ComunaMedellin.Robledo, 14, DeviceType.Desechable, 12, true, EmotionalTrigger.Familia, FamilyContext.Acudiente),
            (ComunaMedellin.Robledo, 16, DeviceType.Mod, 2, false, EmotionalTrigger.Curiosidad, FamilyContext.AmbosPadres),
            (ComunaMedellin.Robledo, 15, DeviceType.Desechable, 5, true, EmotionalTrigger.PresionSocial, FamilyContext.FamiliaExtensa),

            (ComunaMedellin.LaCandelaria, 16, DeviceType.PodRecargable, 3, true, EmotionalTrigger.PresionSocial, FamilyContext.AmbosPadres),
            (ComunaMedellin.LaCandelaria, 17, DeviceType.Desechable, 7, true, EmotionalTrigger.EstresAcademico, FamilyContext.UnSoloPadre),
            (ComunaMedellin.LaCandelaria, 15, DeviceType.Desechable, 4, false, EmotionalTrigger.Curiosidad, FamilyContext.FamiliaExtensa),
            (ComunaMedellin.LaCandelaria, 16, DeviceType.Mod, 1, false, EmotionalTrigger.Aburrimiento, FamilyContext.AmbosPadres),
            (ComunaMedellin.LaCandelaria, 14, DeviceType.Desechable, 9, true, EmotionalTrigger.Ansiedad, FamilyContext.Acudiente),
            (ComunaMedellin.LaCandelaria, 17, DeviceType.PodRecargable, 2, true, EmotionalTrigger.PresionSocial, FamilyContext.AmbosPadres),

            (ComunaMedellin.SanJavier, 15, DeviceType.Desechable, 10, true, EmotionalTrigger.Familia, FamilyContext.SoloEnCasa),
            (ComunaMedellin.SanJavier, 16, DeviceType.Desechable, 6, true, EmotionalTrigger.Ansiedad, FamilyContext.UnSoloPadre),
            (ComunaMedellin.SanJavier, 14, DeviceType.Desechable, 8, true, EmotionalTrigger.PresionSocial, FamilyContext.Acudiente),
            (ComunaMedellin.SanJavier, 17, DeviceType.PodRecargable, 3, false, EmotionalTrigger.EstresAcademico, FamilyContext.FamiliaExtensa),
            (ComunaMedellin.SanJavier, 16, DeviceType.Mod, 1, false, EmotionalTrigger.Curiosidad, FamilyContext.AmbosPadres),
            (ComunaMedellin.SanJavier, 15, DeviceType.Desechable, 5, true, EmotionalTrigger.Aburrimiento, FamilyContext.UnSoloPadre),

            (ComunaMedellin.Manrique, 16, DeviceType.Desechable, 2, false, EmotionalTrigger.Curiosidad, FamilyContext.AmbosPadres),
            (ComunaMedellin.Manrique, 15, DeviceType.PodRecargable, 1, false, EmotionalTrigger.Aburrimiento, FamilyContext.FamiliaExtensa),
            (ComunaMedellin.Belen, 17, DeviceType.PodRecargable, 2, false, EmotionalTrigger.EstresAcademico, FamilyContext.AmbosPadres)
        };

        var now = DateTime.UtcNow;
        var surveys = data.Select((d, i) => new RiskSurvey
        {
            Comuna = d.Comuna,
            Age = d.Age,
            PrimaryDevice = d.Device,
            FrequencyPerDay = d.Freq,
            UsesInSchool = d.School,
            Trigger = d.Trigger,
            FamilyContext = d.Family,
            Synthetic = true,
            SubmittedAt = now.AddDays(-(i % 9)).AddMinutes(-i * 3)
        });

        db.RiskSurveys.AddRange(surveys);
        await db.SaveChangesAsync(ct);
    }

    private static async Task SeedCravingsAsync(VaplessDbContext db, CancellationToken ct)
    {
        if (await db.Cravings.AnyAsync(ct))
        {
            return;
        }

        var profileId = await db.UserProgresses.Where(p => p.IsActive).Select(p => p.Id).FirstAsync(ct);
        var now = DateTime.UtcNow;

        db.Cravings.AddRange(
            new Craving
            {
                UserProgressId = profileId,
                OccurredAt = now.AddDays(-3).AddHours(-2),
                Intensity = CravingIntensity.Moderado,
                MinutesResisted = 4,
                Overcome = true,
                StrategyUsed = "Respiracion478",
                Trigger = EmotionalTrigger.PresionSocial
            },
            new Craving
            {
                UserProgressId = profileId,
                OccurredAt = now.AddDays(-1).AddHours(-5),
                Intensity = CravingIntensity.Fuerte,
                MinutesResisted = 6,
                Overcome = true,
                StrategyUsed = "Respiracion478",
                Trigger = EmotionalTrigger.Familia
            });

        await db.SaveChangesAsync(ct);
    }

    private static HackCard New(HackDeckCategory category, int order, string statement, bool isMyth, string explanation) =>
        new()
        {
            Category = category,
            SortOrder = order,
            Statement = statement,
            IsMyth = isMyth,
            Explanation = explanation,
            XpReward = 10
        };
}



