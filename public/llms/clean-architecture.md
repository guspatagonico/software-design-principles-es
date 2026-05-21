# Clean Arch

> Las dependencias solo pueden apuntar hacia adentro. El núcleo de lógica de negocio no sabe nada de bases de datos, frameworks ni HTTP. Los detalles dependen de las abstracciones, nunca al revés.

Las dependencias solo pueden apuntar hacia adentro. El núcleo de negocio no sabe nada de bases de datos, frameworks ni HTTP. Los detalles dependen de las abstracciones, nunca al revés.

## Concepto

La regla fundamental

Las dependencias solo apuntan hacia adentro

Clean Architecture organiza el sistema en **anillos concéntricos**. La regla de dependencia es simple e inflexible: el código de un anillo exterior puede depender del código de un anillo interior, pero **jamás al revés**. El núcleo no importa nada de afuera.

Frameworks & Drivers

Web, DB, UI, Devices

Interface Adapters

Controllers, Presenters, Gateways

Use Cases

Application Business

Entities

Enterprise Rules

Frameworks

Entities ← las dependencias solo van en esta dirección

> 🧅 Como una cebolla: las capas externas envuelven a las internas. Podés pelar y reemplazar la capa exterior sin tocar el corazón. _El núcleo de la cebolla no sabe que tiene capas encima —y no necesita saberlo._
> **TIP:** **La regla en una oración** Si estás en una capa interna y necesitás hacer un `import` de algo de una capa más externa, estás violando la Dependency Rule. El dominio no importa Express. Los casos de uso no importan Sequelize. Las entidades no importan nada de infraestructura.

Las cuatro capas

De adentro hacia afuera: estabilidad decreciente

Cada capa tiene una responsabilidad específica. Las capas internas son **más estables** —cambian menos y son las más valiosas. Las capas externas son más volátiles y son reemplazables.

1\. Entities — Entidades

Más estable

Las _reglas de negocio de la empresa_. Las que existirían aunque el sistema fuera papel y lápiz. No saben de bases de datos, de HTTP ni de ningún framework. Son los objetos más puros del sistema —clases o estructuras de datos con las reglas críticas de negocio.

OrderCustomerProductInvoiceMoneyreglas de dominio

2\. Use Cases — Casos de uso

Lógica de aplicación

Las _reglas de negocio específicas de la aplicación_. Orquestan el flujo de datos hacia y desde las entidades para cumplir los objetivos del usuario. Conocen a las entidades, pero no a las capas externas. Definen interfaces (puertos) para lo que necesitan de afuera.

CreateOrderUseCaseProcessPaymentUseCaseApproveRefundUseCaseIOrderRepository (interfaz)

3\. Interface Adapters

Conversión de datos

Convierten datos entre el formato conveniente para los casos de uso y el formato conveniente para la capa exterior. Los _controllers_ toman input del mundo exterior y lo convierten. Los _presenters_ toman el output de los casos de uso y lo convierten para la UI. Los _gateways_ implementan las interfaces definidas por los casos de uso.

OrderControllerOrderPresenterPostgresOrderRepositorySendGridMailer

4\. Frameworks & Drivers

Más volátil

La capa más externa. Frameworks web, bases de datos, UI, dispositivos externos, servicios de terceros. _Escribimos poco código en esta capa_ —principalmente pegamento que conecta los detalles externos con la capa de adaptadores. Es la capa más fácil de reemplazar.

Express / FastifyPostgreSQL / MongoDBReact / VueSendGrid SDKAWS SDK

La Dependency Rule en el código

Cómo se invierte la dependencia con interfaces

El problema práctico de la Dependency Rule es: ¿cómo hace un caso de uso para guardar datos en una base de datos si no puede importar el ORM? La respuesta es **inversión de dependencias**: el caso de uso define una interfaz; la infraestructura la implementa.

Viola la Dependency Rule

```js
// Use case importa infraestructura 💥
import { db } from '../db/postgres'
import { sendgrid } from 'sendgrid'

class CreateOrderUseCase {
  async execute(data) {
    const order = new Order(data)
    // conoce Postgres directamente
    await db.query('INSERT...')
    // conoce SendGrid directamente
    await sendgrid.send(...)
  }
}
```

Respeta la Dependency Rule

```js
// Use case define interfaces (puertos)
class CreateOrderUseCase {
  constructor(
    orderRepo: IOrderRepository,
    mailer:    IMailer
  ) { ... }

  async execute(data) {
    const order = new Order(data)
    await this.orderRepo.save(order)
    await this.mailer.sendConfirm(order)
  }
  // No sabe qué hay detrás ✓
}
```

La interfaz (definida en capa interna)

```
// Vive en la capa de Use Cases
// No importa nada de infraestructura
interface IOrderRepository {
  save(order: Order): Promise<void>
  findById(id: string): Promise<Order>
  findByStatus(s: string): Promise<Order[]>
}
```

La implementación (capa externa)

```js
// Vive en Interface Adapters
// Implementa la interfaz del dominio
import { db } from '../postgres'

class PostgresOrderRepository
  implements IOrderRepository {

  async save(order: Order) {
    await db.query('INSERT...')
  }
}
```

> **TIP:** **El beneficio clave: testeabilidad total del dominio** Porque el caso de uso recibe sus dependencias por inyección y solo conoce interfaces, podés testearlo con mocks en memoria sin ninguna base de datos ni servicio externo. `new CreateOrderUseCase(new InMemoryOrderRepo(), new FakeMailer())`. El test corre en milisegundos y no necesita infraestructura.

Trampas comunes

Las formas en que la infraestructura coloniza el dominio

La Dependency Rule es fácil de entender y difícil de mantener bajo presión. Las violaciones casi siempre aparecen como atajos razonables cuando hay deadline.

-   🔗
    
    **Entidades que extienden modelos de ORM**`class Order extends Model` o `class Order(Base)` ancla la entidad más estable del sistema a un framework específico. Cambiar de ORM implica reescribir el dominio. La entidad debería ser una clase simple; la persistencia es responsabilidad de un adaptador separado.
    
-   📨
    
    **Casos de uso que retornan DTOs de framework**Si un caso de uso retorna un objeto que incluye atributos del ORM, timestamps de Sequelize o anotaciones de JPA, la capa interna está expuesta a detalles de la externa. Los casos de uso deberían retornar entidades de dominio o DTOs simples definidos en la capa interna.
    
-   🌐
    
    **Lógica de negocio en los controllers**El controller debería recibir el request, extraer los datos, llamar al caso de uso y devolver la respuesta. Cualquier lógica condicional de negocio en el controller está en la capa equivocada —y no puede testearse sin levantar el servidor HTTP.
    
-   💾
    
    **Casos de uso que conocen el esquema de BD**Si un caso de uso construye una query SQL, conoce el nombre de una tabla o mapea columnas, la Dependency Rule está rota. Esa lógica pertenece al repositorio —el adaptador que implementa la interfaz de persistencia definida por el caso de uso.
    
-   ⚡
    
    **Invertir las capas "solo para este caso"**La excepción más peligrosa: "en este caso específico necesito que el dominio acceda directamente a la base de datos porque es más eficiente". Cada excepción erosiona la arquitectura. Si el caso de uso necesita datos, define una interfaz para obtenerlos; la eficiencia es problema del adaptador.
    

Origen

**Robert C. Martin** formalizó Clean Architecture en su libro homónimo (2017), sintetizando ideas de Hexagonal Architecture (Cockburn, 2005), Onion Architecture (Palermo, 2008) y otras. La Dependency Rule es el corazón de todas estas variantes: las dependencias siempre apuntan hacia el dominio, nunca hacia afuera de él.

Relación con otros principios

Clean Architecture es la aplicación sistemática de DIP, SoC e Information Hiding a nivel arquitectónico.

Aplica DIP de SOLID Amplía Hexagonal Arch. Complementa Screaming Arch. Requiere disciplina sostenida

← Anterior Siguiente →

## Las capas

Las cuatro capas

De adentro hacia afuera: estabilidad decreciente

Cada capa tiene una responsabilidad específica. Las capas internas son **más estables** —cambian menos y son las más valiosas. Las capas externas son más volátiles y son reemplazables.

1\. Entities — Entidades

Más estable

Las _reglas de negocio de la empresa_. Las que existirían aunque el sistema fuera papel y lápiz. No saben de bases de datos, de HTTP ni de ningún framework. Son los objetos más puros del sistema —clases o estructuras de datos con las reglas críticas de negocio.

OrderCustomerProductInvoiceMoneyreglas de dominio

2\. Use Cases — Casos de uso

Lógica de aplicación

Las _reglas de negocio específicas de la aplicación_. Orquestan el flujo de datos hacia y desde las entidades para cumplir los objetivos del usuario. Conocen a las entidades, pero no a las capas externas. Definen interfaces (puertos) para lo que necesitan de afuera.

CreateOrderUseCaseProcessPaymentUseCaseApproveRefundUseCaseIOrderRepository (interfaz)

3\. Interface Adapters

Conversión de datos

Convierten datos entre el formato conveniente para los casos de uso y el formato conveniente para la capa exterior. Los _controllers_ toman input del mundo exterior y lo convierten. Los _presenters_ toman el output de los casos de uso y lo convierten para la UI. Los _gateways_ implementan las interfaces definidas por los casos de uso.

OrderControllerOrderPresenterPostgresOrderRepositorySendGridMailer

4\. Frameworks & Drivers

Más volátil

La capa más externa. Frameworks web, bases de datos, UI, dispositivos externos, servicios de terceros. _Escribimos poco código en esta capa_ —principalmente pegamento que conecta los detalles externos con la capa de adaptadores. Es la capa más fácil de reemplazar.

Express / FastifyPostgreSQL / MongoDBReact / VueSendGrid SDKAWS SDK

La Dependency Rule en el código

Cómo se invierte la dependencia con interfaces

El problema práctico de la Dependency Rule es: ¿cómo hace un caso de uso para guardar datos en una base de datos si no puede importar el ORM? La respuesta es **inversión de dependencias**: el caso de uso define una interfaz; la infraestructura la implementa.

Viola la Dependency Rule

```js
// Use case importa infraestructura 💥
import { db } from '../db/postgres'
import { sendgrid } from 'sendgrid'

class CreateOrderUseCase {
  async execute(data) {
    const order = new Order(data)
    // conoce Postgres directamente
    await db.query('INSERT...')
    // conoce SendGrid directamente
    await sendgrid.send(...)
  }
}
```

Respeta la Dependency Rule

```js
// Use case define interfaces (puertos)
class CreateOrderUseCase {
  constructor(
    orderRepo: IOrderRepository,
    mailer:    IMailer
  ) { ... }

  async execute(data) {
    const order = new Order(data)
    await this.orderRepo.save(order)
    await this.mailer.sendConfirm(order)
  }
  // No sabe qué hay detrás ✓
}
```

La interfaz (definida en capa interna)

```
// Vive en la capa de Use Cases
// No importa nada de infraestructura
interface IOrderRepository {
  save(order: Order): Promise<void>
  findById(id: string): Promise<Order>
  findByStatus(s: string): Promise<Order[]>
}
```

La implementación (capa externa)

```js
// Vive en Interface Adapters
// Implementa la interfaz del dominio
import { db } from '../postgres'

class PostgresOrderRepository
  implements IOrderRepository {

  async save(order: Order) {
    await db.query('INSERT...')
  }
}
```

> **TIP:** **El beneficio clave: testeabilidad total del dominio** Porque el caso de uso recibe sus dependencias por inyección y solo conoce interfaces, podés testearlo con mocks en memoria sin ninguna base de datos ni servicio externo. `new CreateOrderUseCase(new InMemoryOrderRepo(), new FakeMailer())`. El test corre en milisegundos y no necesita infraestructura.

Trampas comunes

Las formas en que la infraestructura coloniza el dominio

La Dependency Rule es fácil de entender y difícil de mantener bajo presión. Las violaciones casi siempre aparecen como atajos razonables cuando hay deadline.

-   🔗
    
    **Entidades que extienden modelos de ORM**`class Order extends Model` o `class Order(Base)` ancla la entidad más estable del sistema a un framework específico. Cambiar de ORM implica reescribir el dominio. La entidad debería ser una clase simple; la persistencia es responsabilidad de un adaptador separado.
    
-   📨
    
    **Casos de uso que retornan DTOs de framework**Si un caso de uso retorna un objeto que incluye atributos del ORM, timestamps de Sequelize o anotaciones de JPA, la capa interna está expuesta a detalles de la externa. Los casos de uso deberían retornar entidades de dominio o DTOs simples definidos en la capa interna.
    
-   🌐
    
    **Lógica de negocio en los controllers**El controller debería recibir el request, extraer los datos, llamar al caso de uso y devolver la respuesta. Cualquier lógica condicional de negocio en el controller está en la capa equivocada —y no puede testearse sin levantar el servidor HTTP.
    
-   💾
    
    **Casos de uso que conocen el esquema de BD**Si un caso de uso construye una query SQL, conoce el nombre de una tabla o mapea columnas, la Dependency Rule está rota. Esa lógica pertenece al repositorio —el adaptador que implementa la interfaz de persistencia definida por el caso de uso.
    
-   ⚡
    
    **Invertir las capas "solo para este caso"**La excepción más peligrosa: "en este caso específico necesito que el dominio acceda directamente a la base de datos porque es más eficiente". Cada excepción erosiona la arquitectura. Si el caso de uso necesita datos, define una interfaz para obtenerlos; la eficiencia es problema del adaptador.
    

Origen

**Robert C. Martin** formalizó Clean Architecture en su libro homónimo (2017), sintetizando ideas de Hexagonal Architecture (Cockburn, 2005), Onion Architecture (Palermo, 2008) y otras. La Dependency Rule es el corazón de todas estas variantes: las dependencias siempre apuntan hacia el dominio, nunca hacia afuera de él.

Relación con otros principios

Clean Architecture es la aplicación sistemática de DIP, SoC e Information Hiding a nivel arquitectónico.

Aplica DIP de SOLID Amplía Hexagonal Arch. Complementa Screaming Arch. Requiere disciplina sostenida

← Anterior Siguiente →

## En el código

La Dependency Rule en el código

Cómo se invierte la dependencia con interfaces

El problema práctico de la Dependency Rule es: ¿cómo hace un caso de uso para guardar datos en una base de datos si no puede importar el ORM? La respuesta es **inversión de dependencias**: el caso de uso define una interfaz; la infraestructura la implementa.

Viola la Dependency Rule

```js
// Use case importa infraestructura 💥
import { db } from '../db/postgres'
import { sendgrid } from 'sendgrid'

class CreateOrderUseCase {
  async execute(data) {
    const order = new Order(data)
    // conoce Postgres directamente
    await db.query('INSERT...')
    // conoce SendGrid directamente
    await sendgrid.send(...)
  }
}
```

Respeta la Dependency Rule

```js
// Use case define interfaces (puertos)
class CreateOrderUseCase {
  constructor(
    orderRepo: IOrderRepository,
    mailer:    IMailer
  ) { ... }

  async execute(data) {
    const order = new Order(data)
    await this.orderRepo.save(order)
    await this.mailer.sendConfirm(order)
  }
  // No sabe qué hay detrás ✓
}
```

La interfaz (definida en capa interna)

```
// Vive en la capa de Use Cases
// No importa nada de infraestructura
interface IOrderRepository {
  save(order: Order): Promise<void>
  findById(id: string): Promise<Order>
  findByStatus(s: string): Promise<Order[]>
}
```

La implementación (capa externa)

```js
// Vive en Interface Adapters
// Implementa la interfaz del dominio
import { db } from '../postgres'

class PostgresOrderRepository
  implements IOrderRepository {

  async save(order: Order) {
    await db.query('INSERT...')
  }
}
```

> **TIP:** **El beneficio clave: testeabilidad total del dominio** Porque el caso de uso recibe sus dependencias por inyección y solo conoce interfaces, podés testearlo con mocks en memoria sin ninguna base de datos ni servicio externo. `new CreateOrderUseCase(new InMemoryOrderRepo(), new FakeMailer())`. El test corre en milisegundos y no necesita infraestructura.

Trampas comunes

Las formas en que la infraestructura coloniza el dominio

La Dependency Rule es fácil de entender y difícil de mantener bajo presión. Las violaciones casi siempre aparecen como atajos razonables cuando hay deadline.

-   🔗
    
    **Entidades que extienden modelos de ORM**`class Order extends Model` o `class Order(Base)` ancla la entidad más estable del sistema a un framework específico. Cambiar de ORM implica reescribir el dominio. La entidad debería ser una clase simple; la persistencia es responsabilidad de un adaptador separado.
    
-   📨
    
    **Casos de uso que retornan DTOs de framework**Si un caso de uso retorna un objeto que incluye atributos del ORM, timestamps de Sequelize o anotaciones de JPA, la capa interna está expuesta a detalles de la externa. Los casos de uso deberían retornar entidades de dominio o DTOs simples definidos en la capa interna.
    
-   🌐
    
    **Lógica de negocio en los controllers**El controller debería recibir el request, extraer los datos, llamar al caso de uso y devolver la respuesta. Cualquier lógica condicional de negocio en el controller está en la capa equivocada —y no puede testearse sin levantar el servidor HTTP.
    
-   💾
    
    **Casos de uso que conocen el esquema de BD**Si un caso de uso construye una query SQL, conoce el nombre de una tabla o mapea columnas, la Dependency Rule está rota. Esa lógica pertenece al repositorio —el adaptador que implementa la interfaz de persistencia definida por el caso de uso.
    
-   ⚡
    
    **Invertir las capas "solo para este caso"**La excepción más peligrosa: "en este caso específico necesito que el dominio acceda directamente a la base de datos porque es más eficiente". Cada excepción erosiona la arquitectura. Si el caso de uso necesita datos, define una interfaz para obtenerlos; la eficiencia es problema del adaptador.
    

Origen

**Robert C. Martin** formalizó Clean Architecture en su libro homónimo (2017), sintetizando ideas de Hexagonal Architecture (Cockburn, 2005), Onion Architecture (Palermo, 2008) y otras. La Dependency Rule es el corazón de todas estas variantes: las dependencias siempre apuntan hacia el dominio, nunca hacia afuera de él.

Relación con otros principios

Clean Architecture es la aplicación sistemática de DIP, SoC e Information Hiding a nivel arquitectónico.

Aplica DIP de SOLID Amplía Hexagonal Arch. Complementa Screaming Arch. Requiere disciplina sostenida

← Anterior Siguiente →

## Trampas

Trampas comunes

Las formas en que la infraestructura coloniza el dominio

La Dependency Rule es fácil de entender y difícil de mantener bajo presión. Las violaciones casi siempre aparecen como atajos razonables cuando hay deadline.

-   🔗
    
    **Entidades que extienden modelos de ORM**`class Order extends Model` o `class Order(Base)` ancla la entidad más estable del sistema a un framework específico. Cambiar de ORM implica reescribir el dominio. La entidad debería ser una clase simple; la persistencia es responsabilidad de un adaptador separado.
    
-   📨
    
    **Casos de uso que retornan DTOs de framework**Si un caso de uso retorna un objeto que incluye atributos del ORM, timestamps de Sequelize o anotaciones de JPA, la capa interna está expuesta a detalles de la externa. Los casos de uso deberían retornar entidades de dominio o DTOs simples definidos en la capa interna.
    
-   🌐
    
    **Lógica de negocio en los controllers**El controller debería recibir el request, extraer los datos, llamar al caso de uso y devolver la respuesta. Cualquier lógica condicional de negocio en el controller está en la capa equivocada —y no puede testearse sin levantar el servidor HTTP.
    
-   💾
    
    **Casos de uso que conocen el esquema de BD**Si un caso de uso construye una query SQL, conoce el nombre de una tabla o mapea columnas, la Dependency Rule está rota. Esa lógica pertenece al repositorio —el adaptador que implementa la interfaz de persistencia definida por el caso de uso.
    
-   ⚡
    
    **Invertir las capas "solo para este caso"**La excepción más peligrosa: "en este caso específico necesito que el dominio acceda directamente a la base de datos porque es más eficiente". Cada excepción erosiona la arquitectura. Si el caso de uso necesita datos, define una interfaz para obtenerlos; la eficiencia es problema del adaptador.
    

Origen

**Robert C. Martin** formalizó Clean Architecture en su libro homónimo (2017), sintetizando ideas de Hexagonal Architecture (Cockburn, 2005), Onion Architecture (Palermo, 2008) y otras. La Dependency Rule es el corazón de todas estas variantes: las dependencias siempre apuntan hacia el dominio, nunca hacia afuera de él.

Relación con otros principios

Clean Architecture es la aplicación sistemática de DIP, SoC e Information Hiding a nivel arquitectónico.

Aplica DIP de SOLID Amplía Hexagonal Arch. Complementa Screaming Arch. Requiere disciplina sostenida

← Anterior Siguiente →
