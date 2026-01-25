# API Routes Overview (NeuroCycle)

Усі шляхи нижче доступні лише після автентифікації (`/auth` виняток). Базовий
префікс для кожної групи вказано заголовком.

## /auth

- `POST /auth/register` — реєстрація користувача в Cognito, створення запису в
  БД.
- `POST /auth/login` — логін, повертає токени Cognito та профіль користувача.
- `POST /auth/logout` — вихід із сесії Cognito.
- `POST /auth/refresh` — оновлення токенів за активною сесією.
- `POST /auth/reset/request` — запит на email для скидання паролю.
- `POST /auth/reset/confirm` — підтвердження коду та зміна паролю.
- `POST /auth/confirm` — підтвердження email.
- `GET /auth/me` — повертає поточного користувача за токеном.

## /users

- `GET /users/me` — поточний користувач (дубль `/auth/me` на випадок потреби).
- `POST /users` — створити користувача (CRUD).
- `GET /users` — список користувачів.
- `GET /users/:id` — деталі користувача.
- `PATCH /users/:id` — оновити користувача.
- `DELETE /users/:id` — видалити користувача.

## /patients

- `GET /patients/me` — профіль пацієнта для поточного користувача.
- `GET /patients/me/summary` — зведення: пацієнт + алергії/хронічні
  стани/застереження (видимі лікарю).
- `GET /patients/:id/summary` — зведення для конкретного пацієнта (для лікаря).
- CRUD: `POST /patients`, `GET /patients`, `GET /patients/:id`,
  `PATCH /patients/:id`, `DELETE /patients/:id`.

## /doctors

- `POST /doctors/connect` — пацієнт прив’язує лікаря за `doctorCode`, оновлює
  `assignedDoctorId`.
- `GET /doctors/me` — профіль лікаря для поточного користувача-лікаря.
- `GET /doctors/:id/availability` — базова доступність/робочі години лікаря.
- CRUD: `POST /doctors`, `GET /doctors`, `GET /doctors/:id`,
  `PATCH /doctors/:id`, `DELETE /doctors/:id`.

## /appointments

- `GET /appointments/my` — записи, що стосуються поточного користувача (пацієнт
  або лікар).
- `POST /appointments/:id/respond` — лікар змінює статус/час (CONFIRMED/DECLINED
  тощо).
- CRUD: `POST /appointments`, `GET /appointments`, `GET /appointments/:id`,
  `PATCH /appointments/:id`, `DELETE /appointments/:id`.

## /allergies, /chronic-conditions, /special-considerations

- Повний CRUD для кожної сутності (create/list/get/update/delete).

## /medication-schedules

- `GET /medication-schedules/my` — графіки прийому поточного пацієнта (з назвами
  препаратів, дозою, днями/часами, початком/кінцем, рекомендаціями).
- `POST /medication-schedules/my` — створити графік для себе (пацієнт);
  `createdByDoctor` виставляється автоматично, якщо запит робить лікар.
- CRUD/адміністрування: `POST /medication-schedules`,
  `GET /medication-schedules`, `GET /medication-schedules/:id`,
  `PATCH /medication-schedules/:id`, `DELETE /medication-schedules/:id` (для
  ролей із доступом; можна фільтрувати `?patientId=`).

## /medication-intakes

- `GET /medication-intakes/my?from&to` — історія фактичних прийомів поточного
  пацієнта.
- `POST /medication-intakes/my` — зафіксувати прийом за `scheduleId` (час можна
  передати або використовується поточний).
- Списки/CRUD для адміністрування:
  `GET /medication-intakes?patientId=&scheduleId=&from=&to`,
  `GET /medication-intakes/:id`, `PATCH /medication-intakes/:id`,
  `DELETE /medication-intakes/:id`, `POST /medication-intakes`.

## /mood-entries

- `POST /mood-entries/daily` — зберегти/оновити настрій за сьогодні (повзунок +
  коментар).
- `GET /mood-entries/current` — останній запис настрою для головної картки.
- `GET /mood-entries/history?from&to` — історія настроїв у діапазоні.
- CRUD: `POST /mood-entries`, `GET /mood-entries`, `GET /mood-entries/:id`,
  `PATCH /mood-entries/:id`, `DELETE /mood-entries/:id`.

## /migraine-attacks

- `POST /migraine-attacks/:id/complete` — зафіксувати завершення/оновити напад.
- `GET /migraine-attacks/calendar?month&year` — агрегований список нападів по
  днях для календаря.
- `GET /migraine-attacks/my?from&to` — напади поточного пацієнта з фільтром за
  датами.
- CRUD: `POST /migraine-attacks`, `GET /migraine-attacks`,
  `GET /migraine-attacks/:id`, `PATCH /migraine-attacks/:id`,
  `DELETE /migraine-attacks/:id`.

## /questionnaire-templates

- `GET /questionnaire-templates/assigned` — активні шаблони, рекомендовані для
  поточного пацієнта (за діагнозом).
- CRUD: `POST /questionnaire-templates`, `GET /questionnaire-templates`,
  `GET /questionnaire-templates/:id`, `PATCH /questionnaire-templates/:id`,
  `DELETE /questionnaire-templates/:id`.

## /questionnaire-questions

- CRUD: `POST /questionnaire-questions`, `GET /questionnaire-questions`,
  `GET /questionnaire-questions/:id`, `PATCH /questionnaire-questions/:id`,
  `DELETE /questionnaire-questions/:id`.

## /questionnaire-responses

- `POST /questionnaire-responses/submit` — зберегти відповідь поточного пацієнта
  (розрахунок балів на стороні клієнта або окремо).
- `GET /questionnaire-responses/my?from&to` — історія пройдених опитувань
  користувача.
- CRUD: `POST /questionnaire-responses`, `GET /questionnaire-responses`,
  `GET /questionnaire-responses/:id`, `PATCH /questionnaire-responses/:id`,
  `DELETE /questionnaire-responses/:id`.

## /recommendations

- `GET /recommendations` — рекомендації для головного екрану (залежно від
  настрою/діагнозу).

## /diary

- `GET /diary/day?date=YYYY-MM-DD` — знімок дня: настрій, напади, активні
  графіки прийому ліків, фактичні прийоми за день, відповіді на опитування.

## Моделі

Нижче наведено детальний опис усіх полів для кожної моделі.

### `User` (користувач)

| Назва властивості | Тип      | Опис                                 |
| ----------------- | -------- | ------------------------------------ |
| id                | objectId | Унікальний ідентифікатор користувача |
| email             | string   | Логін користувача (email)            |
| passwordHash      | string   | Хеш пароля                           |
| role              | enum     | Роль: `PATIENT`, `DOCTOR`, `ADMIN`   |
| isActive          | boolean  | Чи активний акаунт                   |
| createdAt         | datetime | Дата створення акаунта               |
| updatedAt         | datetime | Дата останнього оновлення            |

### `Patient` (профіль пацієнта)

| Назва властивості | Тип      | Опис                                                     |
| ----------------- | -------- | -------------------------------------------------------- |
| id                | objectId | Унікальний ідентифікатор профілю пацієнта                |
| userId            | objectId | Посилання на `User`                                      |
| fullName          | string   | Повне ім’я пацієнта                                      |
| dateOfBirth       | date     | Дата народження                                          |
| sex               | enum     | Стать: `MALE`, `FEMALE`, `OTHER`, `UNSPECIFIED`          |
| phone             | string   | Номер телефону                                           |
| diagnosisType     | enum     | `NONE`, `EPISODIC_MIGRAINE`, `CHRONIC_MIGRAINE`, `OTHER` |
| assignedDoctorId  | objectId | Поточний лікар (посилання на `Doctor`, опційно)          |
| timezone          | string   | Часовий пояс користувача (для нагадувань)                |
| preferredLanguage | string   | Мова інтерфейсу / комунікації                            |
| createdAt         | datetime | Дата створення профілю                                   |
| updatedAt         | datetime | Дата останнього оновлення                                |

### `Doctor` (профіль лікаря)

| Назва властивості | Тип      | Опис                                                  |
| ----------------- | -------- | ----------------------------------------------------- |
| id                | objectId | Унікальний ідентифікатор профілю лікаря               |
| userId            | objectId | Посилання на `User`                                   |
| fullName          | string   | Повне ім’я лікаря                                     |
| specialization    | string   | Спеціалізація (невролог, психіатр тощо)               |
| clinic            | string   | Назва клініки / закладу                               |
| phone             | string   | Контактний номер телефону                             |
| email             | string   | Робочий email                                         |
| doctorCode        | string   | Код підключення пацієнта до лікаря                    |
| workingHours      | string   | Опис робочих годин (можна винести в окрему структуру) |
| createdAt         | datetime | Дата створення профілю                                |
| updatedAt         | datetime | Дата оновлення                                        |

### `ChronicCondition` (хронічні захворювання)

| Назва властивості | Тип      | Опис                                           |
| ----------------- | -------- | ---------------------------------------------- |
| id                | objectId | Унікальний ідентифікатор запису                |
| patientId         | objectId | Посилання на `Patient`                         |
| name              | string   | Назва діагнозу (наприклад, “Хронічна мігрень”) |
| sinceDate         | date     | З якої дати відомий діагноз                    |
| stage             | string   | Стадія / ступінь (опційно)                     |
| notes             | string   | Додаткові коментарі                            |
| treatingPhysician | string   | Лікуючий лікар (текстово)                      |
| visibleToDoctor   | boolean  | Чи може закріплений лікар бачити цей запис     |
| isActive          | boolean  | Чи актуальний діагноз                          |
| createdAt         | datetime | Дата створення                                 |
| updatedAt         | datetime | Дата оновлення                                 |

### `Allergy` (алергії пацієнта)

| Назва властивості | Тип      | Опис                                                 |
| ----------------- | -------- | ---------------------------------------------------- |
| id                | objectId | Унікальний ідентифікатор                             |
| patientId         | objectId | Посилання на `Patient`                               |
| substance         | string   | Речовина / препарат (наприклад, “Ibuprofen”)         |
| reaction          | string   | Опис реакції (кропив’янка, анафілаксія, нудота тощо) |
| severity          | enum     | `LOW`, `MODERATE`, `HIGH`                            |
| notes             | string   | Додаткові коментарі                                  |
| visibleToDoctor   | boolean  | Чи бачить лікар цю алергію                           |
| createdAt         | datetime | Дата створення                                       |
| updatedAt         | datetime | Дата оновлення                                       |

### `SpecialConsiderations` (особливі застереження)

| Назва властивості            | Тип      | Опис                                                                    |
| ---------------------------- | -------- | ----------------------------------------------------------------------- |
| id                           | objectId | Унікальний ідентифікатор                                                |
| patientId                    | objectId | Посилання на `Patient`                                                  |
| religiousRestrictions        | string[] | Список релігійних/етичних обмежень (наприклад, “no_pork”, “no_alcohol”) |
| religiousNote                | string   | Текстовий опис релігійних / етичних обмежень                            |
| dietRestrictions             | string[] | Дієтичні обмеження (`vegan`, `halal`, `kosher`, `gluten_free` тощо)     |
| otherRestrictions            | string   | Інші важливі застереження                                               |
| pregnancyStatus              | enum     | `NONE`, `PREGNANT`, `LACTATION`, `PLANNING`, `UNKNOWN`                  |
| consentUseForRecommendations | boolean  | Згода використовувати ці дані для рекомендацій                          |
| visibleToDoctor              | boolean  | Чи бачить лікар повний блок застережень                                 |
| createdAt                    | datetime | Дата створення                                                          |
| updatedAt                    | datetime | Дата оновлення                                                          |

### `MedicationSchedule` (графік прийому ліків)

| Назва властивості | Тип      | Опис                                                        |
| ----------------- | -------- | ----------------------------------------------------------- |
| id                | objectId | Унікальний ідентифікатор графіка                            |
| patientId         | objectId | Посилання на `Patient`                                      |
| medicationName    | string   | Назва препарату                                             |
| doseValue         | number   | Кількість дози                                              |
| doseUnit          | string   | Одиниця вимірювання дози (мг, мл тощо)                      |
| startDate         | date     | Початок прийому                                             |
| endDate           | date     | Кінець прийому (опційно)                                    |
| daysOfWeek        | number[] | Дні тижня (0–6), порожній список означає щодня              |
| timesOfDay        | string[] | Список часів доби `HH:mm`                                   |
| recommendations   | string   | Додаткові рекомендації                                      |
| createdByDoctor   | boolean  | Чи створив запис лікар                                      |
| timezone          | string   | Часовий пояс, що застосовується для часу прийому/нагадувань |
| createdAt         | datetime | Дата створення                                              |
| updatedAt         | datetime | Дата оновлення                                              |

### `MedicationIntake` (фактичний прийом ліків)

| Назва властивості | Тип      | Опис                              |
| ----------------- | -------- | --------------------------------- |
| id                | objectId | Унікальний ідентифікатор прийому  |
| scheduleId        | objectId | Посилання на `MedicationSchedule` |
| patientId         | objectId | Посилання на `Patient`            |
| takenAt           | datetime | Коли був зроблений прийом         |
| createdAt         | datetime | Дата створення запису             |
| updatedAt         | datetime | Дата оновлення                    |

### `MoodEntry` (щоденний емоційний стан)

| Назва властивості | Тип      | Опис                                                   |
| ----------------- | -------- | ------------------------------------------------------ |
| id                | objectId | Унікальний ідентифікатор                               |
| patientId         | objectId | Посилання на `Patient`                                 |
| date              | date     | Дата, до якої належить запис                           |
| moodScore         | number   | Оцінка настрою (відповідає позиції повзунка смайликів) |
| moodScaleType     | enum     | Тип шкали, наприклад, `EMOJI_SLIDER`                   |
| comment           | string   | Коментар користувача (“чому так себе почуваю”)         |
| createdAt         | datetime | Дата створення                                         |
| updatedAt         | datetime | Дата оновлення                                         |

### `MigraineAttack` (напад головного болю / мігрені)

| Назва властивості     | Тип      | Опис                                                                                                       |
| --------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| id                    | objectId | Унікальний ідентифікатор нападу                                                                            |
| patientId             | objectId | Посилання на `Patient`                                                                                     |
| startDateTime         | datetime | Час початку нападу                                                                                         |
| endDateTime           | datetime | Час завершення нападу (може бути null, якщо триває)                                                        |
| durationMinutes       | number   | Тривалість у хвилинах (кешоване значення)                                                                  |
| intensityVAS          | number   | Інтенсивність болю за ВАШ (0–10)                                                                           |
| headacheLocations     | string[] | Локалізація болю в голові (`FOREHEAD`, `TEMPORAL`, `OCCIPITAL`, `ONE_SIDE`, `BOTH_SIDES`, `EYES`, `OTHER`) |
| otherBodyPainLocation | string   | Біль в інших ділянках тіла (текстове поле)                                                                 |
| suspectedTriggers     | string[] | Ймовірні тригери (стрес, недосип, погода, менструація тощо)                                                |
| auraPresent           | boolean  | Чи була аура                                                                                               |
| auraTypes             | string[] | Типи аури (зорові, сенсорні, мовні, моторні)                                                               |
| additionalSymptoms    | string[] | Супутні симптоми (нудота, світлобоязнь, фонофобія тощо)                                                    |
| mcgillCompleted       | boolean  | Чи заповнений опитувальник Мак-Гілла для цього нападу                                                      |
| mcgillPainProfile     | string   | Короткий опис типу болю за Мак-Гіллом (наприклад, “пульсуючий, виснажливий”)                               |
| isRedFlag             | boolean  | Чи розпізнано “червоні прапорці” для цього нападу                                                          |
| redFlags              | string[] | Які саме red flags спрацювали (коди або текстові ярлики)                                                   |
| createdAt             | datetime | Дата створення запису                                                                                      |
| updatedAt             | datetime | Дата оновлення                                                                                             |

### `QuestionnaireTemplate` (шаблон опитувальника)

| Назва властивості | Тип      | Опис                                                           |
| ----------------- | -------- | -------------------------------------------------------------- |
| id                | objectId | Унікальний ідентифікатор                                       |
| code              | string   | Системний код (`PHQ9`, `GAD7`, `MCGILL`, `MIDAS`, `HIT6` тощо) |
| title             | string   | Назва опитувальника                                            |
| description       | string   | Короткий опис                                                  |
| periodicity       | enum     | `DAILY`, `WEEKLY`, `MONTHLY`, `ON_DEMAND`                      |
| targetCondition   | string   | Для яких станів / діагнозів рекомендований                     |
| isActive          | boolean  | Чи використовується зараз у застосунку                         |
| createdAt         | datetime | Дата створення                                                 |
| updatedAt         | datetime | Дата оновлення                                                 |

### `QuestionnaireQuestion` (питання опитувальника)

| Назва властивості | Тип      | Опис                                                                          |
| ----------------- | -------- | ----------------------------------------------------------------------------- |
| id                | objectId | Унікальний ідентифікатор                                                      |
| questionnaireId   | objectId | Посилання на `QuestionnaireTemplate`                                          |
| order             | number   | Порядковий номер питання                                                      |
| text              | string   | Текст питання                                                                 |
| answerType        | enum     | Тип відповіді: `LIKERT_0_3`, `LIKERT_0_4`, `DESCRIPTOR_LIST`, `VAS_0_10` тощо |
| options           | string[] | Варіанти відповіді (якщо це шкала/список)                                     |
| createdAt         | datetime | Дата створення                                                                |
| updatedAt         | datetime | Дата оновлення                                                                |

### `QuestionnaireResponse` (відповідь на опитувальник)

| Назва властивості | Тип      | Опис                                         |
| ----------------- | -------- | -------------------------------------------- |
| id                | objectId | Унікальний ідентифікатор                     |
| patientId         | objectId | Посилання на `Patient`                       |
| questionnaireId   | objectId | Посилання на `QuestionnaireTemplate`         |
| doctorId          | objectId | Лікар, який призначив опитувальник (опційно) |
| startedAt         | datetime | Час початку заповнення                       |
| completedAt       | datetime | Час завершення                               |
| answers           | json     | Масив відповідей (питання → обране значення) |
| totalScore        | number   | Сумарний бал (PHQ-9, GAD-7 тощо)             |
| severityLevel     | string   | Інтерпретація (“легка”, “помірна”, “важка”)  |
| redFlagsDetected  | boolean  | Чи були red flags в цьому опитувальнику      |
| redFlags          | string[] | Список кодів / описів прапорців              |
| createdAt         | datetime | Дата створення                               |
| updatedAt         | datetime | Дата оновлення                               |

### `Appointment` (запис на прийом)

| Назва властивості | Тип      | Опис                                                           |
| ----------------- | -------- | -------------------------------------------------------------- |
| id                | objectId | Унікальний ідентифікатор                                       |
| patientId         | objectId | Посилання на `Patient`                                         |
| doctorId          | objectId | Посилання на `Doctor`                                          |
| requestedBy       | enum     | Хто ініціював: `PATIENT` або `DOCTOR`                          |
| status            | enum     | `REQUESTED`, `CONFIRMED`, `DECLINED`, `CANCELLED`, `COMPLETED` |
| requestedAt       | datetime | Коли був створений запит                                       |
| scheduledStart    | datetime | Запланований початок консультації                              |
| scheduledEnd      | datetime | Запланований кінець консультації                               |
| locationType      | enum     | `ONLINE`, `OFFLINE`, `PHONE`                                   |
| patientComment    | string   | Коментар пацієнта при записі                                   |
| doctorComment     | string   | Коментар лікаря                                                |
| createdAt         | datetime | Дата створення                                                 |
| updatedAt         | datetime | Дата оновлення                                                 |
