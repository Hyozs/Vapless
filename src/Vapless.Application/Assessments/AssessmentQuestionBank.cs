using Vapless.Domain.Enums;

namespace Vapless.Application.Assessments;

public sealed record AssessmentOptionDefinition(string Id, string Label, int Value);

public sealed record AssessmentQuestionDefinition(
    string Id,
    AssessmentDimension Dimension,
    string Prompt,
    string Helper,
    IReadOnlyList<AssessmentOptionDefinition> Options);

public static class AssessmentQuestionBank
{
    public static IReadOnlyList<AssessmentQuestionDefinition> All { get; } =
    [
        new AssessmentQuestionDefinition(
            "q-frecuencia",
            AssessmentDimension.Frecuencia,
            "En los últimos 7 días, ¿cuántas veces vapeteaste?",
            "Frecuencia de consumo en la semana.",
            [
                new("a", "Nunca", 0),
                new("b", "1 o 2 veces", 1),
                new("c", "3 a 5 veces", 2),
                new("d", "Todos o casi todos los días", 3)
            ]),
        new AssessmentQuestionDefinition(
            "q-primeros30",
            AssessmentDimension.Frecuencia,
            "Cuando te despertás, ¿vapeás dentro de los primeros 30 minutos?",
            "El uso temprano es una de las señales más fuertes de dependencia.",
            [
                new("a", "No vapeo al despertar", 0),
                new("b", "A veces, después de un rato", 1),
                new("c", "Casi siempre, antes del desayuno", 2),
                new("d", "Es lo primero que hago al abrir los ojos", 3)
            ]),
        new AssessmentQuestionDefinition(
            "q-dias",
            AssessmentDimension.Frecuencia,
            "¿En cuántos días a la semana consumís?",
            "Los días con consumo cuentan más que los días sin vapeo.",
            [
                new("a", "Ninguno", 0),
                new("b", "1 o 2 días", 1),
                new("c", "3 o 4 días", 2),
                new("d", "5 o más días", 3)
            ]),
        new AssessmentQuestionDefinition(
            "q-abstinencia",
            AssessmentDimension.DependenciaEmocional,
            "¿Sentís ansiedad, irritabilidad o vacío cuando no podés vapear?",
            "Síntomas de abstinencia: el cuerpo pide la sustancia.",
            [
                new("a", "No, casi nunca", 0),
                new("b", "Rara vez y lo manejo", 1),
                new("c", "Frecuentemente me molesta", 2),
                new("d", "Siempre me pone de mal genio o ansioso", 3)
            ]),
        new AssessmentQuestionDefinition(
            "q-uso-emocional",
            AssessmentDimension.DependenciaEmocional,
            "¿Usás el vape para calmarte, relajarte o dormir?",
            "Muchas veces el vape se vuelve la forma de regular emociones.",
            [
                new("a", "No, no lo uso para eso", 0),
                new("b", "Alguna vez, cuando estoy estresado", 1),
                new("c", "Casi siempre que estoy ansioso o cansado", 2),
                new("d", "Es mi forma principal de calmarme", 3)
            ]),
        new AssessmentQuestionDefinition(
            "q-concentracion",
            AssessmentDimension.DependenciaEmocional,
            "Cuando no vapeás, ¿te cuesta concentrarte o quedás inquieto?",
            "El bajo rendimiento sin nicotina también es una señal de dependencia.",
            [
                new("a", "No, soy igual", 0),
                new("b", "A veces por un rato", 1),
                new("c", "Frecuentemente me cuesta", 2),
                new("d", "Apenas sin vapeo no rindo ni estoy tranquilo", 3)
            ]),
        new AssessmentQuestionDefinition(
            "q-intentos",
            AssessmentDimension.Control,
            "¿Intentaste reducir el consumo y no pudiste?",
            "Los intentos fallidos son el patrón clásico de pérdida de control.",
            [
                new("a", "No lo intenté", 0),
                new("b", "Lo intenté y me fue bien", 1),
                new("c", "Lo intenté y no pude mantenerlo", 2),
                new("d", "Lo intenté varias veces y siempre vuelvo", 3)
            ]),
        new AssessmentQuestionDefinition(
            "q-ocultar",
            AssessmentDimension.Control,
            "¿Ocultás tu consumo o mintés sobre cuánto vapeás?",
            "Ocultar el consumo indica que todavía no te sentís en control.",
            [
                new("a", "No, soy abierto con eso", 0),
                new("b", "A veces lo minimizo", 1),
                new("c", "Se lo escondo a mi familia", 2),
                new("d", "Tengo que ocultarlo siempre", 3)
            ]),
        new AssessmentQuestionDefinition(
            "q-colegio",
            AssessmentDimension.Entorno,
            "¿Vapeás dentro del colegio (baño, patio o pasillos)?",
            "El consumo en la escuela expone a otros y te mete en más situaciones de riesgo.",
            [
                new("a", "Nunca", 0),
                new("b", "Alguna vez", 1),
                new("c", "Frecuentemente", 2),
                new("d", "Es parte de mi rutina en el colegio", 3)
            ]),
        new AssessmentQuestionDefinition(
            "q-escenario-bano",
            AssessmentDimension.Entorno,
            "En el baño del colegio dos compañeros te piden que cuides la puerta mientras vapean. ¿Qué hacés?",
            "Presión entre pares: hay forma de salir sin quedar por fuera.",
            [
                new("a", "Me quedo con ellos y vapeo", 3),
                new("b", "Lo manejo con humor: me río y les digo que paso", 1),
                new("c", "Les digo que no de frente y me salgo", 0),
                new("d", "Propongo otra cosa: salimos 5 minutos a respirar y volvemos", 0)
            ])
    ];
}
