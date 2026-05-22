# Paquetes

> Seis principios de Robert C. Martin que operan a nivel de módulos y paquetes enteros - la versión macro de SOLID. Determinan cómo agrupar clases y cómo controlar las dependencias entre grupos.

Seis principios para agrupar clases en paquetes y controlar dependencias entre módulos. La versión macro de SOLID: qué va junto y cómo se conectan los paquetes entre sí.

## Concepto

¿Qué son los principios de paquetes?

SOLID para módulos, paquetes y servicios

SOLID te dice cómo diseñar clases individuales. Estos seis principios te dicen cómo **agrupar esas clases en paquetes** y cómo manejar las dependencias entre paquetes. Son la diferencia entre un sistema que escala y uno que colapsa bajo su propio peso.

Se dividen en dos familias: **cohesión** (qué va junto) y **acoplamiento** (cómo se conectan los paquetes entre sí).

> 🏙️ Pensalo como el diseño de una ciudad. SOLID diseña los edificios individuales. Los principios de paquetes diseñan los _barrios_: qué tipos de edificios van juntos, cómo se conectan los barrios, cuáles deben ser más estables que otros. Sin zonificación, la ciudad es un caos.
> 📦 Un "paquete" puede ser una carpeta, un módulo, una librería, un microservicio, o cualquier unidad de código que se despliega o versiona de forma independiente. _La escala cambia; los principios no._

Principios de cohesión

Responden a: _¿Qué clases van en el mismo paquete?_  
  
REP (Reuse/Release Equivalence  
CCP) Common Closure  
CRP - Common Reuse

Principios de acoplamiento

Responden a: _¿Cómo se relacionan los paquetes?_  
  
ADP (Acyclic Dependencies  
SDP) Stable Dependencies  
SAP - Stable Abstractions

> **TIP:** **¿Por qué importan en un proyecto nuevo?** Ignorar estos principios al inicio no duele. Duele cuando el proyecto tiene seis meses: un cambio en un módulo rompe tres más, no podés testear nada de forma aislada, y cada release es un evento estresante. Estos principios evitan exactamente ese escenario.

## Cohesión

Principios de cohesión

¿Qué clases van juntas en un paquete?

Estos tres principios te ayudan a tomar la decisión más difícil del diseño modular: **qué código agrupa con qué otro código**. No hay una respuesta única - los tres principios están en tensión entre sí y reflejan distintas prioridades.

Principios de cohesión 3 principios

REP

Reuse/Release Equivalence Principle

La unidad de reutilización es la unidad de release

▾

Las clases o módulos que agrupás juntos en un paquete **deben ser reutilizables juntas**. Si alguien quiere usar una clase de tu paquete, debería tener sentido que use las otras también. No mezcles cosas no relacionadas solo porque "están en el mismo proyecto".

La consecuencia es que **un paquete debe poder versionarse y releasarse como unidad**. Si tenés que releasar solo parte del paquete, es señal de que debería ser dos paquetes.

Viola REP

```
// paquete: utils
parseDate() // fechas
sendEmail() // emails
calcTax() // impuestos
resizeImage() // imágenes
// "utils" no es un concepto
// nadie lo reutiliza completo
```

Respeta REP

```
// paquete: date-utils
parseDate()
formatDate()
diffDays()

// paquete: tax-engine
calcTax()
applyExemption()
// cada uno se reutiliza solo ✓
```

CCP

Common Closure Principle

Lo que cambia junto, va junto

▾

Las clases que **cambian por las mismas razones y al mismo tiempo** deben estar en el mismo paquete. Es el SRP aplicado a paquetes: un paquete debería tener una sola razón para cambiar.

Si un cambio de requisito obliga a tocar seis paquetes distintos, la cohesión es mala. Cuando el cambio se localiza en un solo paquete, el impacto es contenido, los tests son más fáciles y el deploy es menos riesgoso.

Viola CCP

```
// Cambiar la regla de IVA
// obliga a tocar:
orders/calcTotal.js
billing/invoice.js
reports/taxSummary.js
exports/taxExport.js
// 4 paquetes, 1 cambio 😬
```

Respeta CCP

```
// Toda la lógica fiscal
// vive en un solo paquete:
tax-engine/rules.js
tax-engine/calc.js
tax-engine/exemptions.js
// Cambiar IVA = 1 paquete ✓
```

CRP

Common Reuse Principle

No forzar dependencias innecesarias

▾

Las clases que **no se usan juntas no deberían estar en el mismo paquete**. Si dependés de un paquete, dependés de todo él - incluyendo las partes que no usás. Eso significa que cambios en cosas que no te interesan pueden romper tu build.

CRP es la contracara de CCP: mientras CCP agrupa lo que cambia junto, CRP separa lo que no se usa junto. La tensión entre ambos es normal y hay que gestionarla según las prioridades del proyecto.

> **TIP:** **Señal de violación de CRP** Si actualizás una dependencia y tenés que adaptar código que no usa nada de lo que cambió, es probable que el paquete del que dependés tiene baja cohesión según CRP. Mezcla cosas no relacionadas que cambian por distintas razones.

## Acoplamiento

Principios de acoplamiento

¿Cómo se relacionan los paquetes entre sí?

Una vez que definiste qué va en cada paquete, necesitás controlar **cómo se conectan**. Un grafo de dependencias mal diseñado es la causa principal de que los proyectos se vuelvan imposibles de modificar sin efectos en cascada.

Principios de acoplamiento 3 principios

ADP

Acyclic Dependencies Principle

Sin ciclos en el grafo de dependencias

▾

El grafo de dependencias entre paquetes **no debe tener ciclos**. Si A depende de B, B depende de C, y C depende de A, ninguno de los tres se puede cambiar, testear o deployar de forma independiente. Son un bloque monolítico disfrazado de módulos.

Ciclo detectado

```
orders → billing
billing → users
users → orders ← ciclo 💥

// Para testear orders
// necesitás billing y users
// Para testear users
// necesitás orders. Deadlock.
```

Sin ciclos

```
orders → billing → users
 ↓
 payments

// Grafo acíclico dirigido (DAG)
// Cada paquete se puede
// testear de forma aislada ✓
```

Para romper un ciclo, la solución más común es extraer la dependencia circular a un tercer paquete del que ambos dependan, o introducir una interfaz que invierta la dependencia (aplicando DIP de SOLID a nivel de paquetes).

SDP

Stable Dependencies Principle

Dependé de lo que es más estable que vos

▾

Un paquete debería depender solo de paquetes **más estables que él mismo**. La estabilidad se mide por cuánto cuesta cambiar un paquete: un paquete del que dependen muchos otros es difícil de cambiar (es estable. Uno del que nadie depende es fácil de cambiar) es inestable.

Si un paquete volátil (que cambia seguido) depende de un paquete estable, está bien. Si un paquete estable depende de uno volátil, cualquier cambio en el volátil fuerza cambios en cascada en todo lo que depende del estable.

Viola SDP

```
// core-domain (estable,
// 10 paquetes dependen de él)
// depende de:
ui-components ← cambia cada sprint
feature-flags ← cambia cada semana
// Un cambio en UI rompe core 💥
```

Respeta SDP

```
// core-domain (estable)
// depende de:
shared-types ← muy estable
base-errors ← muy estable

// ui-components (volátil)
// depende de core-domain ✓
```

SAP

Stable Abstractions Principle

Los paquetes estables deben ser abstractos

▾

Un paquete **estable debe ser abstracto** para que su estabilidad no impida su extensión. Un paquete estable lleno de implementaciones concretas es rígido: no se puede cambiar (muchos dependen de él) y tampoco se puede extender (es concreto).

SAP combina SDP con el principio Open/Closed de SOLID a nivel de paquetes: **cuanto más estable es un paquete, más abstracto debería ser**. Los paquetes inestables pueden ser concretos porque es fácil cambiarlos.

> **TIP:** **La métrica de abstracción** Martin define la abstracción de un paquete como la proporción de interfaces y clases abstractas sobre el total de clases. Un paquete del que todos dependen debería tener una abstracción cercana a 1 (todo interfaces). Un paquete hoja (nadie depende de él) puede tener abstracción cercana a 0.

## Tensiones

Tensiones entre principios

Los seis principios no siempre apuntan en la misma dirección

Los tres principios de cohesión están **en tensión permanente** entre sí. No podés maximizar los tres a la vez; el diseño es una decisión sobre qué priorizar según el tipo de proyecto.

> ⚖️ REP dice "agrupá lo que se reutiliza junto". CCP dice "agrupá lo que cambia junto". CRP dice "no agrupés lo que no se usa junto". _Un paquete perfecto según los tres principios no existe en la práctica - hay que elegir qué importa más._

Principio

Prioriza

Penaliza

Mejor para

REP

Reutilización

Demasiados paquetes

Librerías y SDKs publicados

CCP

Mantenibilidad

Menor reutilización

Aplicaciones con cambios frecuentes

CRP

Independencia

Más fragmentación

Sistemas con muchos consumidores

ADP

Testeabilidad

Requiere refactors

Todo sistema que crezca

SDP

Estabilidad

Restricciones de diseño

Sistemas con núcleo de negocio estable

SAP

Extensibilidad

Más abstracciones

Núcleos de dominio compartidos

> **TIP:** **Regla práctica para proyectos nuevos** En etapas tempranas, priorizá **CCP sobre REP**: es más fácil dividir un paquete cohesivo cuando el sistema crece que reparar un sistema donde los cambios se propagan a seis lugares. Una vez que el sistema estabiliza su estructura, REP y CRP cobran más importancia.

## Trampas

Trampas comunes

Los errores que aparecen cuando el proyecto escala

Las violaciones de estos principios **no duelen al principio**. Se acumulan silenciosamente hasta que el proyecto tiene seis meses y cada cambio tarda el doble porque nadie entiende bien las dependencias.

-   🧺
    
    **El paquete "utils" o "common" que lo tiene todo** Es la violación más universal. Un paquete llamado `utils` o `shared` que crece sin control viola REP (nadie lo reutiliza completo), CCP (cambia por mil razones distintas) y CRP (fuerza dependencias no relacionadas). La solución es partirlo en paquetes con nombres de dominio reales.
    
-   🔄
    
    **Dependencias circulares ocultas** Los ciclos raramente son obvios. Aparecen con el tiempo: A importa de B, B importa de C, y C necesita algo de A "solo para un caso especial". Herramientas como `madge` (JS), `pydeps` (Python) o `deptrac` (PHP) visualizan el grafo de dependencias y detectan ciclos antes de que sean un problema.
    
-   🏔️
    
    **El núcleo de dominio que depende de la infraestructura** Cuando el módulo de lógica de negocio importa directamente el ORM, el cliente HTTP o el logger, viola SDP: el módulo más estable y crítico del sistema depende de detalles de implementación que cambian con frecuencia. La solución es DIP a nivel de paquetes: el dominio define interfaces; la infraestructura las implementa.
    
-   📐
    
    **Organizar por capa técnica en lugar de por dominio** Una estructura `controllers / services / repositories` viola CCP: un cambio en la lógica de "órdenes" toca un archivo en cada una de las tres carpetas. Una estructura `orders / billing / users` (organizada por dominio) localiza los cambios.
    
-   🔍
    
    **No medir la estabilidad de los paquetes** La estabilidad de un paquete es calculable: _estabilidad = dependencias salientes / (dependencias entrantes + salientes)_. Un paquete con muchos consumidores y pocas dependencias externas tiene estabilidad cercana a 1. Si ese paquete tiene alto acoplamiento con detalles volátiles, hay un problema de diseño que se puede detectar antes de que cause daño.
