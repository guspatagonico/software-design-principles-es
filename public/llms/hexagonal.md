# Hexagonal

> El dominio vive en el centro. Define puertos (interfaces) que describen lo que necesita. El mundo exterior conecta a través de adaptadores que implementan esos puertos. El dominio no sabe nada de afuera.

El dominio en el centro, el mundo afuera. Define puertos (interfaces) y conecta el exterior con adaptadores intercambiables. El dominio no sabe nada de infraestructura.

## Concepto

¿Qué es la arquitectura hexagonal?

El dominio en el centro · El mundo afuera

Alistair Cockburn la formuló en 2005. La idea central: la aplicación debería ser igualmente usable por **cualquier medio externo** (HTTP, CLI, tests, eventos) y debería poder funcionar en **aislamiento completo** de bases de datos, servicios externos y frameworks. Todo eso se logra con puertos y adaptadores.

*[Diagrama: representación visual del concepto]*

> 🔌 El tomacorriente de tu casa no sabe qué enchufás en él - un teléfono, una lámpara o un cargador de laptop. Define un contrato (forma, voltaje) y cualquier dispositivo que lo cumpla funciona. _El dominio define los puertos; los adaptadores son los enchufes que conectan el mundo exterior._
> **TIP:** **El nombre "hexagonal" es arbitrario** Cockburn eligió el hexágono como forma porque tiene suficientes lados para dibujar varios puertos. No hay nada mágico en el número seis. Por eso el nombre más descriptivo es **Ports and Adapters** - es lo que realmente importa en el patrón.

## Los puertos

Los puertos

Las interfaces que el dominio define para comunicarse con el exterior

Un **puerto** es simplemente una interfaz (un contrato) definida por el dominio. Describe lo que el dominio necesita o lo que el dominio ofrece, sin saber nada sobre quién lo implementa. Hay dos tipos con roles completamente distintos.

Driving ports · Puertos primarios

Entradas al dominio

Definen **cómo se puede usar el dominio** desde afuera. Son las operaciones que el dominio expone: sus casos de uso. El mundo exterior _conduce_ la aplicación a través de estos puertos.

ICreateOrderPort → createOrder(data)

IGetOrderPort → getOrderById(id)

IProcessPaymentPort → processPayment(order)

Driven ports · Puertos secundarios

Lo que el dominio necesita

Definen **qué necesita el dominio del exterior** para funcionar. El dominio _conduce_ a los servicios externos a través de estos puertos. Los define el dominio; los implementa la infraestructura.

IOrderRepository → save, findById

IMailer → sendConfirmation(order)

IPaymentGateway → charge(amount, card)

> 🎭 Los puertos _driving_ son como el escenario de un teatro: definen qué actuaciones son posibles. Los puertos _driven_ son como la tramoya: el escenario no sabe si hay humanos moviendo los telones o un sistema automático - solo sabe que cuando los pide, aparecen.
> **TIP:** **¿Dónde viven los puertos?** Los puertos (ambos tipos) viven _dentro del dominio_. Son interfaces definidas por el dominio para sus propias necesidades. Los adaptadores viven afuera e implementan esas interfaces. Esto garantiza que la dependencia siempre apunta hacia adentro: la infraestructura depende del dominio, nunca al revés.

## Los adaptadores

Los adaptadores

Los traductores entre el dominio y el mundo exterior

Un **adaptador** es la implementación concreta de un puerto. Traduce entre el lenguaje del dominio y el lenguaje de la tecnología específica que conecta. Es intercambiable: podés reemplazar un adaptador por otro sin tocar el dominio.

Adaptadores driving - conectan el exterior con el dominio

HTTP Controller

REST / GraphQL Controller

Recibe el request HTTP, extrae los datos, los convierte al formato que el puerto driving espera, llama al caso de uso y convierte la respuesta a HTTP. _No tiene lógica de negocio._

CLI Adapter

Command Line Interface

El mismo dominio puede usarse desde la línea de comandos. El adaptador CLI parsea los argumentos y llama al mismo puerto driving. _El dominio no cambia._

Test Adapter

Tests de aceptación

Los tests son adaptadores driving. Llaman directamente al puerto driving del dominio, sin levantar servidor HTTP. _Tests rápidos, sin infraestructura._

Message Consumer

Event / Queue Consumer

Un mensaje de Kafka o SQS dispara un caso de uso. El adaptador deserializa el mensaje y llama al puerto driving. _El dominio no sabe que hay una queue._

Adaptadores driven - conectan el dominio con servicios externos

PostgreSQL Adapter

Repository implementation

Implementa `IOrderRepository` usando SQL. Si cambiamos a MongoDB, escribimos `MongoOrderRepository`. _El dominio no cambia._

SendGrid Adapter

Mailer implementation

Implementa `IMailer` usando la API de SendGrid. Reemplazable por SES o cualquier otro proveedor sin tocar el dominio.

In-Memory Adapter

Fake para tests

Implementa los puertos driven con almacenamiento en memoria. Permite testear el dominio completo _sin base de datos ni servicios externos._ Tests instantáneos.

Stripe Adapter

Payment gateway

Implementa `IPaymentGateway` con Stripe. En tests se usa un _FakePaymentGateway_ que aprueba o rechaza según el monto.

## En el código

Ports & Adapters en el código

Del puerto a la implementación concreta

La implementación sigue siempre el mismo patrón: el **dominio define la interfaz**, la **infraestructura la implementa**, y la **composición** los conecta. El dominio nunca importa nada de la capa de adaptadores.

Puerto driven (dentro del dominio)

```
// src/orders/ports/IOrderRepository.ts
// Vive en el dominio. No importa nada.

interface IOrderRepository {
 save(order: Order): Promise<void>
 findById(id: string): Promise<Order | null>
 listByStatus(s: string): Promise<Order[]>
}

interface IMailer {
 sendConfirmation(order: Order): Promise<void>
}
```

Caso de uso (usa los puertos)

```js
// src/orders/CreateOrderUseCase.ts

class CreateOrderUseCase {
 constructor(
 private repo: IOrderRepository,
 private mailer: IMailer
) {}

 async execute(data: CreateOrderDTO) {
 const order = Order.create(data)
 await this.repo.save(order)
 await this.mailer.sendConfirmation(order)
 return order
 }
}
```

Adaptador driven (implementa el puerto)

```js
// src/infra/db/PostgresOrderRepository.ts
import { db } from './connection'

class PostgresOrderRepository
 implements IOrderRepository {

 async save(order: Order) {
 await db.query(
 `INSERT INTO orders...`,
 [order.id, order.total]
)
 }
 //... findById, listByStatus
}
```

Composición (conecta todo)

```js
// src/infra/composition-root.ts
// El único lugar donde se conocen
// las implementaciones concretas

const repo = new PostgresOrderRepository()
const mailer = new SendGridMailer()
const useCase = new CreateOrderUseCase(
 repo, mailer
)

// En tests:
const useCase = new CreateOrderUseCase(
 new InMemoryOrderRepo(),
 new FakeMailer()
)
```

> **TIP:** **El beneficio más concreto: tests sin infraestructura** Porque el caso de uso solo conoce interfaces, podés crear implementaciones en memoria para los tests. El suite completo de tests del dominio corre en milisegundos, sin levantar base de datos, sin llamadas de red, sin configuración de entorno. Y si el dominio pasa los tests, la lógica de negocio es correcta independientemente de qué adaptadores uses en producción.

## Trampas

Trampas comunes

Cuando los puertos se convierten en tuberías vacías

Hexagonal Architecture puede aplicarse mecánicamente sin captar el espíritu. El resultado es una arquitectura que tiene la forma correcta pero no los beneficios - capas adicionales sin valor real.

-   🪞
    
    **Puertos que son mirrors exactos de la infraestructura**Si `IOrderRepository` tiene métodos como `executeQuery(sql, params)` o `findByRawFilter(mongoFilter)`, el puerto está filtrando la tecnología hacia adentro. El dominio ahora conoce SQL o MongoDB indirectamente. Los puertos deben hablar el lenguaje del dominio: `findPendingOrders()`, no `findWhere({status:'pending'})`.
    
-   📋
    
    **Un puerto por cada método de infraestructura**Crear una interfaz de un solo método para cada operación (`ISaveOrder`, `IFindOrder`, `IDeleteOrder`) es sobre-fragmentar. Un puerto representa una _capacidad_ del dominio, no una operación atómica. `IOrderRepository` agrupa todas las operaciones de persistencia de órdenes.
    
-   🔄
    
    **Lógica de negocio en los adaptadores driving**El controller HTTP debería ser un adaptador delgado: recibe input, llama al caso de uso, devuelve output. Cuando empieza a tener lógica condicional de negocio, esa lógica no puede testearse sin levantar el servidor HTTP y los beneficios de la arquitectura se pierden.
    
-   💾
    
    **Adaptadores driven que transforman la forma del dominio**Si el repositorio de PostgreSQL retorna filas SQL y quien consume decide cómo mapearlas a entidades, el mapping está en el lugar equivocado. El adaptador driven es responsable de convertir los datos del storage al formato de la entidad de dominio - y de volver a convertir al guardar.
    
-   🏗️
    
    **Aplicarla donde es overhead puro**Hexagonal Architecture agrega complejidad real: más archivos, más interfaces, más indirección. Para scripts, herramientas internas simples o prototipos, el overhead no se justifica. El patrón brilla cuando el dominio es complejo, las integraciones son múltiples o el sistema necesita testearse en aislamiento.

## Origen del principio

**Alistair Cockburn** formuló Ports and Adapters en 2005 como respuesta a la dificultad de testear aplicaciones con dependencias directas a bases de datos y servicios externos. La motivó la pregunta: _"¿Cómo puedo testear mi aplicación sin la base de datos?"_. La respuesta fue definir interfaces que el dominio controla y que la infraestructura implementa.

## Solo aplica a código?

Hexagonal es la base práctica de Clean Architecture y comparte el mismo principio fundamental.

> Implementa DIP de SOLID · Precede Clean Architecture · Compatible con DDD · Overhead en sistemas simples

