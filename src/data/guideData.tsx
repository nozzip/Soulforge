import React from "react";
import {
    PersonAdd,
    Category,
    Search,
    FilterList,
    ShoppingCart,
    LocalOffer,
    LocalShipping,
    WhatsApp,
    Star,
    AutoStories,
    Backpack,
    AccessibilityNew,
    Map,
    Groups,
    Casino,
} from "@mui/icons-material";
import { GuideStep } from "../../types";

export const howToBuySteps: GuideStep[] = [
    {
        title: "Crea tu Cuenta",
        description:
            "El primer paso para todo aventurero es inscribir su nombre en los registros de la Forja.",
        longDescription:
            "Regístrate en la Forja para acceder a tu inventario personal. Con una cuenta podrás guardar tus artefactos favoritos en la Lista de Deseos, ver el historial de tus pedidos y recibir beneficios exclusivos del gremio. Tu nombre de aventurero aparecerá en todas las crónicas (reseñas) que dejes y será tu identidad en La Taberna (Foro).",
        icon: <PersonAdd sx={{ fontSize: 32 }} />,
        tip: "Tener una cuenta acelera el proceso de invocación (checkout). Nota: Tu nombre de usuario será el mismo para el foro y no podrá cambiarse.",
    },
    {
        title: "Explora el Catálogo",
        description:
            "Navega por las estanterías digitales llenas de creaciones únicas.",
        longDescription:
            "Navega por nuestra colección de miniaturas épicas. Cada artefacto muestra su tamaño, diseñador, y precio tanto en monedas de oro como en pesos argentinos. Haz clic en cualquier miniatura para ver más detalles, imágenes y elegir la escala perfecta. La calidad es nuestra ley.",
        icon: <Category sx={{ fontSize: 32 }} />,
        tip: "Puedes ver las miniaturas en 360 grados en algunos de nuestros modelos destacados.",
    },
    {
        title: "Usa el Buscador",
        description:
            "Encuentra rápidamente el artefacto exacto que tu campaña necesita.",
        longDescription:
            "Usa nuestro buscador mágico para encontrar miniaturas por nombre, set, o diseñador. El conocimiento es poder, y encontrar lo que buscas es el primer paso hacia la victoria. El buscador te mostrará sugerencias en tiempo real basadas en los archivos de la forja.",
        icon: <Search sx={{ fontSize: 32 }} />,
        tip: 'Búscanos por "Dragon" o "Warrior" para ver la variedad de nuestras forjas.',
    },
    {
        title: "Filtra por Categorías",
        description:
            "Refina tu búsqueda según las necesidades de tu grupo de aventureros.",
        longDescription:
            "Usa los filtros del catálogo para separar el trigo de la paja. Filtra por tamaño (desde Small hasta Gargantuan), diseñadores legendarios, tipo de criatura o el arma que portan. Puedes combinar múltiples filtros para encontrar esa quimera con espada que tanto buscas.",
        icon: <FilterList sx={{ fontSize: 32 }} />,
        tip: "Los filtros se encuentran en la parte superior del catálogo en móviles y a la izquierda en PC.",
    },
    {
        title: "Agrega al Carrito",
        description:
            "Asegura tus hallazgos antes de que otro aventurero se los lleve.",
        longDescription:
            'Cuando encuentres un artefacto digno, haz clic en "Añadir al Carrito". Tus elecciones se guardarán de forma segura mientras continúas explorando las profundidades del catálogo. Si no tienes oro suficiente hoy, agrégalo a tu Wishlist para volver por él en tu próxima aventura.',
        icon: <ShoppingCart sx={{ fontSize: 32 }} />,
        tip: "El carrito guardará tus tesoros incluso si cierras el portal por error.",
    },
    {
        title: "Revisa tu Carrito",
        description: "Verifica tu equipo antes de partir hacia la batalla final.",
        longDescription:
            "En el carrito podrás ajustar las cantidades de cada miniatura y verificar que todo esté en orden. Si posees un pergamino de descuento (cupón), ¡ahora es el momento de usar su magia! Los cupones de descuento se aplican directamente sobre el total de oro requerido.",
        icon: <LocalOffer sx={{ fontSize: 32 }} />,
        tip: "Recuerda que si el total supera el límite del reino, ¡podrías obtener envío gratuito!",
    },
    {
        title: "Carga tus Datos",
        description: "Dinos dónde debemos enviar los refuerzos para tu campaña.",
        longDescription:
            "Ingresa tu información de envío con precisión: nombre completo, dirección del refugio, ciudad, código postal y tu número de contacto. La logística es clave para un buen asedio. Verifica dos veces tu dirección; no querrás que tu dragón termine en el reino equivocado.",
        icon: <LocalShipping sx={{ fontSize: 32 }} />,
        tip: "Tus datos están protegidos por hechizos de cifrado de alto nivel.",
    },
    {
        title: "Finaliza en WhatsApp",
        description:
            "Sella el pacto con los maestros forjadores de forma directa.",
        longDescription:
            "Al confirmar, invocarás un portal directo a WhatsApp con nuestro equipo. Allí coordinaremos el pago (MercadoPago, transferencia) y los detalles del envío para que las piezas lleguen seguras. Estamos en línea durante el día. Si envías tu mensaje de noche, te responderemos al amanecer.",
        icon: <WhatsApp sx={{ fontSize: 32 }} />,
        tip: "Ten a mano tu número de pedido para una comunicación más fluida.",
    },
    {
        title: "Review & Descuento",
        description: "Comparte tu leyenda y recibe tesoros por tu sabiduría.",
        longDescription:
            "Tras recibir tu pedido, obtendrás un enlace único para dejar tu opinión. Al escribir tu crónica, recibirás un pergamino de descuento del 15% para tu próxima adquisición en la Forja. Tus crónicas ayudan a otros aventureros a conocer la calidad de nuestro acero (resina).",
        icon: <Star sx={{ fontSize: 32 }} />,
        tip: "¡Sube una foto de tu miniatura pintada para inspirar a otros guerreros!",
    },
];

export const newAdventurerSteps: GuideStep[] = [
    {
        title: "La Llamada a la Aventura",
        description: "¿Qué es Dungeons & Dragons?",
        longDescription:
            "Imagina una historia donde tú eres el protagonista. No hay guion, solo posibilidades infinitas. D&D es un juego de rol de mesa donde tú y tus amigos crean una leyenda compartida. Un jugador, el Dungeon Master (DM), es el narrador y árbitro del mundo, mientras que tú controlas a un héroe único. Juntos explorarán mazmorras, lucharán contra bestias y forjarán su destino.",
        icon: <AutoStories sx={{ fontSize: 32 }} />,
        tip: "No necesitas ser actor ni experto en reglas para empezar. Solo necesitas imaginación.",
    },
    {
        title: "El Equipo Inicial",
        description: "Las herramientas del oficio.",
        longDescription:
            "Para comenzar tu viaje, necesitarás lo básico: un set de dados poliédricos (el d20 será tu mejor amigo y tu peor enemigo), una hoja de personaje para anotar tus habilidades, y un lápiz. Los manuales son útiles, pero un buen DM te guiará. No necesitas gastar una fortuna para dar tus primeros pasos.",
        icon: <Backpack sx={{ fontSize: 32 }} />,
        tip: "Existen muchas aplicaciones gratuitas para lanzar dados si aún no tienes los tuyos.",
    },
    {
        title: "Tu Avatar en la Mesa",
        description: "¿Por qué necesito una miniatura?",
        longDescription:
            'Cuando la batalla comienza y el caos se desata, saber dónde estás parado puede salvarte la vida. Una miniatura no es solo una pieza de plástico; es la representación física de tu héroe. Ver a tu paladín enfrentarse cara a cara con un dragón en el tablero convierte un "ataque" en una memoria épica. Es tu ancla en el mundo físico para las hazañas de tu imaginación.',
        icon: <AccessibilityNew sx={{ fontSize: 32 }} />,
        tip: 'Muchos jugadores comienzan con una miniatura que se "parezca" a su personaje y luego encargan una personalizada a medida que suben de nivel.',
    },
    {
        title: "El Tablero y el Mapa",
        description: "El mundo toma forma.",
        longDescription:
            "El combate en D&D suele jugarse en una cuadrícula de 1 pulgada, donde cada cuadro representa 5 pies (1.5 metros). Aquí es donde la táctica brilla: flanquear enemigos, cubrirse tras una roca, o lanzar una bola de fuego sin quemar a tus aliados. Las miniaturas y el terreno dan vida a estas situaciones, permitiendo que todos visualicen la misma escena.",
        icon: <Map sx={{ fontSize: 32 }} />,
        tip: "No necesitas escenografía profesional al principio; un mapa dibujado en papel cuadriculado es suficiente para una gran aventura.",
    },
    {
        title: "El Azar de los Dados",
        description: "Cuando el destino decide.",
        longDescription:
            "¿Lograrás saltar el abismo? ¿Tu espada atravesará la armadura del orco? Para averiguarlo, lanzas los dados. El resultado, sumado a tus habilidades, determina el éxito o el fracaso. A veces un 1 (Fallo Crítico) crea una historia más divertida que un 20 (Éxito Crítico). Abraza el caos.",
        icon: <Casino sx={{ fontSize: 32 }} />,
    },
    {
        title: "Únete a la Comunidad",
        description: "Nunca viajarás solo.",
        longDescription:
            "La comunidad de rol es inmensa y acogedora. Desde tiendas locales hasta grupos en línea, siempre hay una mesa buscando aventureros. No temas ser nuevo; todos fuimos nivel 1 alguna vez. Pregunta, aprende y, sobre todo, diviértete. Tu leyenda apenas comienza.",
        icon: <Groups sx={{ fontSize: 32 }} />,
        tip: 'Pregunta en Soulforge o en tu tienda local por noches de "Aventureros de la Liga" para principiantes.',
    },
];
