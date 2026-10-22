(function () {
  /* =========================================================
     Banco de datos del Dojo (cliente)
     - 24 tarjetas de Mitos y Realidades: 12 mitos + 12 realidades
     - 6 escenarios de presión social con 3 respuestas únicas cada uno
     Fuente de verdad del Dojo en la interfaz. Ver AGENTS.md.
     ========================================================= */

  const XP_PER_CARD = 10;

  const cards = [
    /* ---------------- Mitos del cuerpo ---------------- */
    {
      id: 1,
      theme: "Mitos del cuerpo",
      statement: "El vape solo es vapor de agua.",
      isMyth: true,
      explanation:
        "No es vapor de agua: es un aerosol con nicotina, propilenglicol y saborizantes. Eso irrita la garganta y los pulmones, y la nicotina es lo que te mantiene vapeando."
    },
    {
      id: 2,
      theme: "Mitos del cuerpo",
      statement: "Vapear te relaja de verdad.",
      isMyth: true,
      explanation:
        "Lo que sentís es la pausa de la nicotina. Cuando baja, vuelven la ansiedad y las ganas de fumar otra vez: por eso la terminás buscando tan seguido."
    },
    {
      id: 3,
      theme: "Mitos del cuerpo",
      statement: "Un desechable trae poquita nicotina.",
      isMyth: true,
      explanation:
        "Un desechable puede llevar hasta 50 mg de nicotina por pod. Eso es más que un cigarrillo común, y por eso engancha más rápido de lo que uno cree."
    },
    {
      id: 4,
      theme: "Mitos del cuerpo",
      statement: "La nicotina del vape engancha igual de rápido que la del cigarrillo.",
      isMyth: false,
      explanation:
        "Es la misma molécula y llega igual de rápido al cerebro. Por eso el craving y el síndrome de abstinencia se sienten tan parecidos a los del tabaco."
    },
    {
      id: 5,
      theme: "Mitos del cuerpo",
      statement: "El cuerpo se adapta tan rápido que cada vez necesitás más para sentir lo mismo.",
      isMyth: false,
      explanation:
        "Eso se llama tolerancia: los receptores se ajustan y la misma dosis empieza a alcanzar menos. Subirle la potencia al dispositivo es la respuesta del hábito, no una solución."
    },
    {
      id: 6,
      theme: "Mitos del cuerpo",
      statement: "Cuando dejás de vapear, la irritación de la garganta y la tos bajan en pocas semanas.",
      isMyth: false,
      explanation:
        "Es cierto y es buena noticia: en una o dos semanas la tos y la irritación de la garganta bajan, y con el tiempo la función pulmonar se recupera. Tu cuerpo empieza a trabajar a tu favor apenas paras."
    },

    /* ---------------- El negocio del sabor ---------------- */
    {
      id: 7,
      theme: "El negocio del sabor",
      statement: "Los sabores frutales están ahí solo para que sepa rico.",
      isMyth: true,
      explanation:
        "También están para que quieras el siguiente. Los sabores afrutados o de postre son los que más llaman la atención de quienes recién empiezan, y eso no es casualidad."
    },
    {
      id: 8,
      theme: "El negocio del sabor",
      statement: "Las empresas de vape no le apuntan a los menores.",
      isMyth: true,
      explanation:
        "Los sabores y las cajas con diseño de caramelo están pensados para llamar la atención, y la nicotina engancha más a los cerebros jóvenes que a los adultos."
    },
    {
      id: 9,
      theme: "El negocio del sabor",
      statement: "Un vape caro es de mejor calidad y menos dañino.",
      isMyth: true,
      explanation:
        "El precio no cambia la nicotina ni el aerosol. Un equipo caro puede tener exactamente la misma concentración que uno barato: pagás más por el diseño, no por la salud."
    },
    {
      id: 10,
      theme: "El negocio del sabor",
      statement: "Un mismo dispositivo puede llevar más nicotina que una cajetilla completa.",
      isMyth: false,
      explanation:
        "Un pod de 50 mg tiene más nicotina que varios cigarrillos de una cajetilla. Por eso el consumo se dispara tan rápido cuando alguien empieza."
    },
    {
      id: 11,
      theme: "El negocio del sabor",
      statement: "El sabor a fruta o a postre es el que más llama la atención de quienes empiezan.",
      isMyth: false,
      explanation:
        "Las ventas suben justo con los sabores frutales y de postre, que son los que más captan a quienes nunca vapearon. Si un sabor te chamañ fuerte, ese producto está diseñado para engancharte."
    },
    {
      id: 12,
      theme: "El negocio del sabor",
      statement: "Un pod recargable no es más sano que un desechable.",
      isMyth: false,
      explanation:
        "Lo que importa es la nicotina que le cargás, no el formato. Si le ponés 50 mg, tenés exactamente el mismo nivel de nicotina que con un desechable."
    },

    /* ---------------- Presión y parche ---------------- */
    {
      id: 13,
      theme: "Presión y parche",
      statement: "Si tus amigos vapean, tarde o temprano vas a probar.",
      isMyth: true,
      explanation:
        "Nadie está obligado a probar. Decir que no es una decisión tuya, y la presión se acaba: el que insiste no te necesita, te quiere convencer."
    },
    {
      id: 14,
      theme: "Presión y parche",
      statement: "Decir que no te hace quedar mal.",
      isMyth: false,
      explanation:
        "Es verdad: tu cuerpo y tu plata no son un tema de grupo. La mayoría de los demás respeta el no, sobre todo si lo decís tranquilo y sin dar explicaciones."
    },
    {
      id: 15,
      theme: "Presión y parche",
      statement: "Todos en el colegio vapean.",
      isMyth: true,
      explanation:
        "Lo que ves desde adentro siempre exaggerado: el efecto de lupa te hace creer que son más de los que son. En los datos de Vapless, la mayoría de quienes responden no vapean."
    },
    {
      id: 16,
      theme: "Presión y parche",
      statement: "Prestar el vape es solo un gesto de amistad.",
      isMyth: true,
      explanation:
        "Prestar el dispositivo es darle a alguien la nicotina de tu bolsillo. La amistad no necesita eso para existir, y tu cuerpo tampoco."
    },
    {
      id: 17,
      theme: "Presión y parche",
      statement: "El primer vapeo casi siempre llega por alguien que ya te estaba insistiendo.",
      isMyth: false,
      explanation:
        "La presión del grupo es el motivo más citado para empezar. Por eso ese primer no tuyo pesa tanto: no estás fallando, estás cortando una cadena."
    },
    {
      id: 18,
      theme: "Presión y parche",
      statement: "Dejar de vapear no te saca del grupo.",
      isMyth: false,
      explanation:
        "La pertenencia no depende del dispositivo. Si te sentís parte del grupo siendo vos, eso no cambia por dejar de vapear."
    },

    /* ---------------- Lo que hay detrás ---------------- */
    {
      id: 19,
      theme: "Lo que hay detrás",
      statement: "Vapeás porque te gusta el sabor.",
      isMyth: true,
      explanation:
        "A veces hay algo de sabor, pero casi siempre hay una función: calmar la ansiedad, sobrevivir al estrés o quedar con el grupo. Eso se puede cambiar."
    },
    {
      id: 20,
      theme: "Lo que hay detrás",
      statement: "Si estás estresado, el vape te ayuda a estudiar.",
      isMyth: true,
      explanation:
        "Al principio puede que sientas que te concentra, pero eso es la alerta de la nicotina. Cuando baja, viene el rebote: cansancio y más dificultad para seguir."
    },
    {
      id: 21,
      theme: "Lo que hay detrás",
      statement: "El vape se usa seguido para calmarse.",
      isMyth: false,
      explanation:
        "Esa es la clave: si lo usás para regular emociones, la dependencia no es solo física. Por eso las respiraciones y hablar con alguien son tan importantes."
    },
    {
      id: 22,
      theme: "Lo que hay detrás",
      statement: "Hablar de lo que sentís es de débiles.",
      isMyth: true,
      explanation:
        "Decir estoy mal es lo más valiente que hay. Lo que se siente como debilidad muchas veces es simplemente no tener a quién con quién decirlo lo que te pasa."
    },
    {
      id: 23,
      theme: "Lo que hay detrás",
      statement: "Pedir apoyo en salud o en el colegio no es una denuncia.",
      isMyth: false,
      explanation:
        "La Línea 106 y los servicios de salud son confidenciales. Nadie está obligado a reportarte y vos tenés derecho a pedir ayuda."
    },
    {
      id: 24,
      theme: "Lo que hay detrás",
      statement: "Cuando alguien en tu casa vapea o fuma, las chances de que vos también lo hagas suben.",
      isMyth: false,
      explanation:
        "El ambiente familiar es uno de los factores más citados para empezar. Eso no te condena: te dice que pedir ayuda en la casa es más importante de lo que parece."
    }
  ];

  const scenarios = [
    {
      id: 1,
      title: "La esquina del barrio",
      trigger: "Presión del parche",
      difficulty: 1,
      context:
        "Salís del colegio y el parche se arma en la esquina de siempre. Uno saca un pod y lo pasa de uno en uno, como si fuera a turno.",
      peerPhrase: "¿Sí o no? Todos estamos vapeando, no te hagás.",
      responses: [
        {
          strategy: "HUMOR",
          text: "Hoy no, parce. Me quedo en la esquina igual, pero con una bebida en la mano: así no me queda olor a mango en el uniforme."
        },
        {
          strategy: "DIRECTA",
          text: "No, gracias. No vapeo y hoy no voy a cambiar eso. Pasen ustedes, yo me quedo acá."
        },
        {
          strategy: "ALTERNATIVA",
          text: "Yo me quedo acá afuera un rato. Después nos vamos a la cancha y me contás cómo les fue en el parcial de ayer."
        }
      ]
    },
    {
      id: 2,
      title: "El baño del colegio",
      trigger: "Presión del parche",
      difficulty: 2,
      context:
        "En el descanso dos compañeros se meten al baño a vapear y te piden que hagas de centinela en la puerta mientras ellos fuman.",
      peerPhrase: "Quedate ahí y no digás nada, es solo un toque.",
      responses: [
        {
          strategy: "HUMOR",
          text: "Yo soy vigilante del pasillo, no del baño. Si me ponés a cuidar la puerta, el que se queda sin fumar es él."
        },
        {
          strategy: "DIRECTA",
          text: "No. Yo no cuido la puerta mientras vapean: si se enteran, a mí me hacen parte y ustedes ni miran."
        },
        {
          strategy: "ALTERNATIVA",
          text: "Nos vamos al patio a tomar agua y volvemos al timbre, así nadie se queda esperando afuera."
        }
      ]
    },
    {
      id: 3,
      title: "La fiesta de 15",
      trigger: "Presión del parche",
      difficulty: 2,
      context:
        "En la quinceañera hay música a todo volumen y un compañero te ofrece un vape de mango. Insiste con que no es cigarrillo y que solo probés una vez.",
      peerPhrase: "Relajate, esto no es cigarrillo. Probá y me contás.",
      responses: [
        {
          strategy: "HUMOR",
          text: "El mango ya lo probé una vez y fue pura agua con azúcar. Hoy me quedo con la bebida y con el baile, que ahí no me traga nadie."
        },
        {
          strategy: "DIRECTA",
          text: "No, gracias. No fumo ni vapeo, y no voy a empezar hoy porque me ofrezcan mango."
        },
        {
          strategy: "ALTERNATIVA",
          text: "Yo a esta fiesta entré por la música y la comida. Si se les acaba, bajamos a la cocina a pedir algo."
        }
      ]
    },
    {
      id: 4,
      title: "El grupo de WhatsApp",
      trigger: "Presión del parche",
      difficulty: 2,
      context:
        "En el chat del salón circulan fotos de pods nuevos y retan a quien no se apunte al pedido del viernes. Después te escriben directo.",
      peerPhrase: "El que no vapea es porque no tiene plata, jajaja.",
      responses: [
        {
          strategy: "HUMOR",
          text: "Parce, con lo del almuerzo compro mejor. Ese pod no me hace falta y a mí el banano sí."
        },
        {
          strategy: "DIRECTA",
          text: "No me apunto. Y no me gusta que me traten así en el grupo, así que ni lo voy a seguir."
        },
        {
          strategy: "ALTERNATIVA",
          text: "Dejo ese chat y me meto al del equipo, que ahí sí hablamos de todo. Si quieren, nos vemos en la cancha."
        }
      ]
    },
    {
      id: 5,
      title: "La casa en silencio",
      trigger: "Situaciones en casa",
      difficulty: 3,
      context:
        "Llegás a la casa y está vacía. Discutiste con tu mamá en la mañana y la rabia te quedó en el cuerpo. Todo está en silencio y vos también quedaste callado.",
      peerPhrase: "Nadie te va a ver. Solo vos y el vape.",
      responses: [
        {
          strategy: "HUMOR",
          text: "Hoy la casa está tan en silencio que se oye el reloj de la cocina. Me voy a poner un podcast antes de que me gane la ansiedad."
        },
        {
          strategy: "DIRECTA",
          text: "No. Hoy no quiero vapear. Lo que me pasa es que estoy mal, y prefiero buscar a alguien antes que taparlo."
        },
        {
          strategy: "ALTERNATIVA",
          text: "Le escribo a mi mamá aunque sea por bobina. Si no, me pongo a caminar un rato por el parque y vuelvo más tranquilo."
        }
      ]
    },
    {
      id: 6,
      title: "El parcial de matemáticas",
      trigger: "Estrés académico",
      difficulty: 2,
      context:
        "Mañana hay parcial de matemáticas, no entendés la mitad de los temas y tenés el pecho apretado. En la mesa hay un vape que te pertenece.",
      peerPhrase: "Unas caladas y seguís estudiando, relajado.",
      responses: [
        {
          strategy: "HUMOR",
          text: "Si me pongo a vapear con este pecho apretado, el parcial lo termino con las manos temblando y sin entender ni la primera pregunta."
        },
        {
          strategy: "DIRECTA",
          text: "No. Si me siento así es porque tengo que parar cinco minutos y respirar, no porque me falte un vape."
        },
        {
          strategy: "ALTERNATIVA",
          text: "Voy a bajar al patio a respirar un rato y después repaso de nuevo. Si sigo sin entender, le pido ayuda a la profe."
        }
      ]
    }
  ];

  window.VaplessDojoData = {
    cards: cards,
    scenarios: scenarios,
    xpPerCard: XP_PER_CARD
  };
})();
