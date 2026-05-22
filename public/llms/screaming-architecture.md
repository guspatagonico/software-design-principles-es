# Screaming

> La estructura de un proyecto debería gritar qué hace el sistema, no qué framework usa. Si abrís el código y lo primero que ves es "Rails" o "Spring", algo está mal.

La estructura de carpetas de un proyecto debería gritar qué hace, no qué framework usa. El dominio manda; la tecnología sirve.

## Concepto

¿Qué grita tu arquitectura?

El proyecto debe revelar su propósito, no su tecnología

Robert C. Martin acuñó el término en 2011: si entrás a un proyecto nuevo y las carpetas de primer nivel dicen `controllers / models / views`, lo único que sabés es que usaron MVC. No sabés si es una tienda, un sistema de salud o un banco. **La arquitectura debería gritar el dominio del negocio.**

> 🏥 Los planos de un hospital gritan "hospital": salas de operaciones, guardia, UCI, farmacia. No dicen "edificio con puertas y ventanas de la empresa Acme Construction". _La estructura revela el propósito, no el proveedor de materiales._
> 📚 Una biblioteca bien organizada grita "biblioteca": secciones de ficción, ciencia, historia, referencia. No dice "estanterías de madera, sistema de catalogación Dewey". _El sistema de organización es un detalle. El dominio es lo que importa._
> **TIP:** **La prueba del taxi** Mostrále la estructura de carpetas de tu proyecto a alguien que no lo conoce durante 10 segundos. Si no puede adivinar a grandes rasgos qué hace el sistema (si lo único que puede decir es "usa Express" o "usa Laravel") tu arquitectura está gritando el framework, no el dominio.

## La estructura

La estructura que grita

Carpetas de dominio vs carpetas técnicas

El cambio concreto es simple: las carpetas de primer nivel dejan de representar capas técnicas y pasan a representar **conceptos del dominio de negocio**. La tecnología queda dentro de cada módulo de dominio, como un detalle de implementación.

Grita el framework

src/ controllers/ UserController.js OrderController.js ProductController.js models/ User.js Order.js Product.js services/ UserService.js OrderService.js repositories/ UserRepo.js ↑ ¿Qué hace el sistema? Impossible de saberlo.

Grita el dominio

src/ orders/ ← caso de uso central Order.js OrderService.js OrderRepository.js billing/ ← área de negocio Invoice.js PaymentService.js catalog/ ← área de negocio Product.js users/ User.js ↑ Un e-commerce. Obvio.

Sistema de salud - grita MVC

app/ Http/Controllers/ PatientController.php DoctorController.php Models/ Patient.php Appointment.php Repositories/ Podría ser cualquier cosa.

Sistema de salud - grita el dominio

src/ patients/ Patient.php MedicalHistory.php appointments/ Appointment.php Scheduler.php prescriptions/ billing/ Sistema de salud. Obvio.

> **TIP:** **Los frameworks van adentro, no afuera** Express, Django, Laravel - son detalles de implementación. Pueden vivir en una carpeta `infrastructure/` o `adapters/` dentro de cada módulo de dominio, pero no deberían dictar la estructura de primer nivel del proyecto. El dominio manda; la tecnología sirve.

## Los principios

Los principios concretos

Cinco decisiones que hacen que la arquitectura grite

Screaming Architecture no es solo una convención de carpetas. Es una actitud hacia el código que se manifiesta en cinco decisiones concretas de diseño.

01

Los casos de uso son ciudadanos de primera clase

Los _casos de uso del negocio_ ("crear pedido", "aprobar solicitud", "cancelar suscripción") deben ser visibles en la estructura del código. Si tenés que leer el README para entender qué hace el sistema, los casos de uso están enterrados en capas técnicas.

02

Los frameworks son herramientas, no identidad

El framework web, el ORM, el motor de templates - son _detalles de implementación_. Deberían poder reemplazarse sin cambiar la lógica de negocio. Si un cambio de ORM requiere reescribir casos de uso, el framework colonizó el dominio.

03

La base de datos es un detalle

PostgreSQL, MongoDB, Redis - son mecanismos de persistencia, no el sistema. El esquema de la base de datos no debería dictar la forma de las entidades del dominio. La decisión de qué base de datos usar debería poder postergarse.

04

La UI es un detalle

Web, mobile, CLI, API REST - son formas de entregar la funcionalidad. La lógica de negocio no debería saber nada de HTML, JSON o gRPC. Podés cambiar la interfaz de usuario sin tocar el dominio, y deberías poder _testear el dominio sin ninguna interfaz._

05

La estructura comunica intención

Cada decisión de organización (nombres de carpetas, de archivos, de módulos) debería comunicar algo sobre el dominio. `src/orders/CreateOrderUseCase.js` dice mucho más que `src/services/OrderService.js`. El código se lee más de lo que se escribe.

## Trampas

Trampas comunes

Cuando la estructura sigue gritando "framework"

La mayoría de los frameworks de desarrollo web generan una estructura de carpetas por defecto que viola Screaming Architecture. Seguir esa estructura sin cuestionarla es la trampa más común.

-   📦
    
    **Seguir la estructura por defecto del framework sin cuestionarla**Rails genera `app/controllers`, `app/models`, `app/views`. Laravel genera algo similar. Django también. Esas estructuras están optimizadas para onboarding rápido, no para comunicar el dominio. Son puntos de partida, no destinos.
    
-   🗂️
    
    **Carpetas técnicas en el primer nivel**Si el primer nivel de `src/` tiene `helpers/`, `utils/`, `middlewares/`, `validators/` - todo lo visible es tecnología, no dominio. Esas carpetas deberían vivir dentro de los módulos de dominio que las usan, no en el nivel raíz.
    
-   🏷️
    
    **Nombrar por tipo técnico en lugar de por rol de dominio**`UserManager`, `OrderProcessor`, `ProductHandler` dicen poco sobre qué hacen exactamente. `CreateOrderUseCase`, `ApproveRefundPolicy`, `InventoryChecker` comunican intención de negocio clara y son buscables.
    
-   🌀
    
    **Módulos de dominio con dependencias cruzadas sin control**Organizar por dominio no significa que los módulos puedan depender libremente entre sí. `orders/` puede depender de `catalog/`, pero si `catalog/` también depende de `orders/`, hay un ciclo que viola ADP. La estructura de dominio debe respetarse también en el grafo de dependencias.
    
-   📋
    
    **Confundir Screaming Architecture con carpetas gigantes por dominio**Organizar por dominio no significa un archivo de 2000 líneas por módulo. Cada módulo de dominio puede tener su propia estructura interna (entidades, casos de uso, repositorios) siempre que la estructura raíz grite el negocio.

## Origen del principio

Screaming Architecture fue articulado por **Robert C. Martin** ("Uncle Bob") en su blog en 2011, como parte del marco más amplio de Clean Architecture. La idea central es que la arquitectura de un sistema debe comunicar la intención del sistema, no los detalles de su implementación técnica.

## Solo aplica a código?

Es la consecuencia visible de aplicar SoC y CCP a la estructura de carpetas.

> Complementa Clean Architecture · Aplica CCP a carpetas · Refuerza SoC · Requiere adaptar conv. del framework

