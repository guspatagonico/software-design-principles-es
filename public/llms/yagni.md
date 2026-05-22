# YAGNI

> No construyas lo que todavía no necesitás. La funcionalidad que no existe no tiene bugs, no hay que mantenerla y no complica el diseño.

No implementes funcionalidad hasta que realmente la necesitás. La funcionalidad que no existe no tiene bugs, no hay que mantenerla y no complica el diseño.

## Concepto

¿Qué significa YAGNI?

No construyas el futuro imaginario

YAGNI viene de Extreme Programming (XP) y dice algo simple pero difícil de seguir: **no implementes funcionalidad hasta que realmente la necesitás**. El problema no es que los devs sean malos prediciendo el futuro —es que nadie puede predecirlo bien.

> 🏠 No construís el garage antes de tener auto. No ponés tres habitaciones extra "por si viene gente". Construís lo que necesitás ahora, con espacio para crecer, pero sin construir el crecimiento de antemano. _Cada metro cuadrado tiene un costo de mantenimiento._
> 📦 En software, el código que escribís "por si acaso" necesita ser mantenido, testeado, documentado y entendido por el próximo dev. Y el 80% de las veces, la funcionalidad anticipada nunca se usa —o cuando sí se usa, los requisitos son completamente distintos a los que imaginaste. _Escribiste código inútil que ahora es una carga._
> **TIP:** **La pregunta de YAGNI** Antes de agregar algo, preguntate: _"¿Hay un requisito concreto hoy que justifique esto?"_. Si la respuesta es "sería útil si...", "en el futuro podría...", o "qué pasa si...", es YAGNI. Cerrá el editor y seguí con lo que sí se necesita.

## En el código

YAGNI en el código

El peor código es el que no debería existir

Las violaciones de YAGNI más comunes no parecen violaciones en el momento en que se cometen. Parecen **buenas decisiones de diseño**. El problema es que añaden complejidad real por un beneficio hipotético.

Viola YAGNI

```
class PaymentProcessor {
  // Solo usamos Stripe hoy
  processStripe(amount) { … }

  // "Por si acaso" agregamos
  processPaypal(amount) { … }
  processMercadoPago(a) { … }
  processBitcoin(amount) { … }
  processBankTransfer(a) { … }
  // Nadie los pidió 😬
}
```

Respeta YAGNI

```
class PaymentProcessor {
  process(amount) {
    // Solo Stripe, que es
    // lo que necesitamos hoy
    return stripe.charge(amount)
  }
}

// Cuando llegue el requisito
// de Paypal, lo agregamos ✓
```

Viola YAGNI — parámetros fantasma

```js
function getUser(
  id,
  includeDeleted = false,
  withPermissions = false,
  format = 'json',
  version = 1
) {
  // Los últimos 4 parámetros
  // nunca se usan en la app
}
```

Respeta YAGNI

```js
function getUser(id) {
  // Hace exactamente lo que
  // se necesita ahora
  return db.find('users', id)
}

// Cuando necesitemos filtrar
// borrados, lo agregamos ✓
```

> **TIP:** **Sobre la flexibilidad "por si acaso"** Diseñar para la extensión futura (principio Open/Closed de SOLID) no contradice YAGNI. La diferencia es que OCP dice "diseñá de forma que sea fácil agregar X cuando lo necesités", mientras que YAGNI dice "no implementes X antes de necesitarlo". La arquitectura debe ser abierta; la implementación, mínima.

## Cuándo sí

¿Cuándo sí anticipar?

YAGNI no es excusa para ignorar el contexto

YAGNI tiene límites. Hay situaciones donde **la anticipación razonada** —distinta a la especulación— está justificada. La clave es que el requisito futuro sea **conocido y comprometido**, no imaginado.

-   📋
    
    **El requisito está en el roadmap confirmado** Si el Product Owner ya comprometió que en dos semanas van a necesitar soporte multi-idioma, tiene sentido diseñar las strings de texto de forma externalizable desde ahora. El requisito no es especulativo —es conocido y tiene fecha.
    
-   💸
    
    **Cambiar después sería exponencialmente más caro** Hay decisiones de arquitectura que son muy costosas de revertir: la elección de base de datos, el modelo de autenticación, la estructura de IDs. Para estas, un análisis cuidadoso ahora puede evitar una reescritura completa después.
    
-   🔐
    
    **Seguridad y privacidad** Ciertos controles de seguridad son más fáciles de diseñar desde el principio que de retrofitear. El cifrado de datos sensibles, el manejo de tokens, la auditoría de accesos —no son funcionalidad especulativa, son requerimientos implícitos de cualquier sistema.
    
-   📈
    
    **Escala conocida y cercana** Si sabés que el sistema va a pasar de 100 a 100.000 usuarios en seis meses —porque hay un contrato firmado— diseñar para esa escala ahora es razonable. Si es una esperanza, no lo es.
    

> **TIP:** **La distinción clave** _Especulación_ es "podría pasar". _Anticipación razonada_ es "va a pasar y tenemos evidencia concreta". YAGNI se aplica a la primera. La segunda es simplemente buen diseño informado.

## Trampas

Trampas comunes

Las violaciones de YAGNI siempre parecen razonables

Nadie viola YAGNI pensando que está haciendo algo malo. Las violaciones siempre vienen disfrazadas de **buenas intenciones**: ser proactivo, pensar en el futuro, no tener que volver a tocar ese código.

-   🔮
    
    **El sistema de plugins genérico para una app de 3 usuarios** "Hagamos que sea extensible con plugins para que cualquiera pueda agregar funcionalidad". Nadie va a hacer plugins. Ahora tenés una capa de indirección gigante que hace el código mucho más difícil de seguir.
    
-   🌐
    
    **Internacionalización desde el día uno sin usuarios internacionales** Externalizar todas las strings, agregar soporte de locales, manejar plurales en varios idiomas —cuando la app solo va a estar en español y no hay ningún plan concreto de expandirse.
    
-   ⚙️
    
    **Parámetros de configuración para cosas que nunca van a cambiar** "Vamos a hacer que el timeout sea configurable". Nadie lo va a configurar. Ahora hay una variable de entorno más, un ítem en el README más, y un valor por defecto que nadie sabe de dónde viene.
    
-   🏭
    
    **Abstracciones para un único caso de uso** Crear una interfaz `INotificationSender` con una única implementación `EmailNotificationSender` "para cuando agreguemos SMS". Si no hay SMS en el roadmap, es complejidad pura.
    
-   📊
    
    **Métricas y logging exhaustivo desde el inicio** Instrumentar cada función, cada query, cada request antes de saber qué problema estás tratando de diagnosticar. Medí lo que necesitás ahora; agregá más instrumentación cuando tengas una pregunta concreta que responder.
