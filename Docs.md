# API Routes Overview (NeuroCycle)

Усі шляхи нижче доступні лише після автентифікації (`/auth` виняток). Базовий префікс для кожної групи вказано заголовком.

## /auth
- `POST /auth/register` — реєстрація користувача в Cognito, створення запису в БД.
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
- `GET /patients/me/summary` — зведення: пацієнт + алергії/хронічні стани/застереження (видимі лікарю).
- `GET /patients/:id/summary` — зведення для конкретного пацієнта (для лікаря).
- CRUD: `POST /patients`, `GET /patients`, `GET /patients/:id`, `PATCH /patients/:id`, `DELETE /patients/:id`.

## /doctors
- `POST /doctors/connect` — пацієнт прив’язує лікаря за `doctorCode`, оновлює `assignedDoctorId`.
- `GET /doctors/me` — профіль лікаря для поточного користувача-лікаря.
- `GET /doctors/:id/availability` — базова доступність/робочі години лікаря.
- CRUD: `POST /doctors`, `GET /doctors`, `GET /doctors/:id`, `PATCH /doctors/:id`, `DELETE /doctors/:id`.

## /appointments
- `GET /appointments/my` — записи, що стосуються поточного користувача (пацієнт або лікар).
- `POST /appointments/:id/respond` — лікар змінює статус/час (CONFIRMED/DECLINED тощо).
- CRUD: `POST /appointments`, `GET /appointments`, `GET /appointments/:id`, `PATCH /appointments/:id`, `DELETE /appointments/:id`.

## /allergies, /chronic-conditions, /special-considerations
- Повний CRUD для кожної сутності (create/list/get/update/delete).

## /medications
- `GET /medications/my` — препарати поточного пацієнта з їхнім графіком (timeOfDay, daysOfWeek, start/end).
- CRUD: `POST /medications`, `GET /medications`, `GET /medications/:id`, `PATCH /medications/:id`, `DELETE /medications/:id`.

## /mood-entries
- `POST /mood-entries/daily` — зберегти/оновити настрій за сьогодні (повзунок + коментар).
- `GET /mood-entries/current` — останній запис настрою для головної картки.
- `GET /mood-entries/history?from&to` — історія настроїв у діапазоні.
- CRUD: `POST /mood-entries`, `GET /mood-entries`, `GET /mood-entries/:id`, `PATCH /mood-entries/:id`, `DELETE /mood-entries/:id`.

## /migraine-attacks
- `POST /migraine-attacks/:id/complete` — зафіксувати завершення/оновити напад.
- `GET /migraine-attacks/calendar?month&year` — агрегований список нападів по днях для календаря.
- `GET /migraine-attacks/my?from&to` — напади поточного пацієнта з фільтром за датами.
- CRUD: `POST /migraine-attacks`, `GET /migraine-attacks`, `GET /migraine-attacks/:id`, `PATCH /migraine-attacks/:id`, `DELETE /migraine-attacks/:id`.

## /questionnaire-templates
- `GET /questionnaire-templates/assigned` — активні шаблони, рекомендовані для поточного пацієнта (за діагнозом).
- CRUD: `POST /questionnaire-templates`, `GET /questionnaire-templates`, `GET /questionnaire-templates/:id`, `PATCH /questionnaire-templates/:id`, `DELETE /questionnaire-templates/:id`.

## /questionnaire-questions
- CRUD: `POST /questionnaire-questions`, `GET /questionnaire-questions`, `GET /questionnaire-questions/:id`, `PATCH /questionnaire-questions/:id`, `DELETE /questionnaire-questions/:id`.

## /questionnaire-responses
- `POST /questionnaire-responses/submit` — зберегти відповідь поточного пацієнта (розрахунок балів на стороні клієнта або окремо).
- `GET /questionnaire-responses/my?from&to` — історія пройдених опитувань користувача.
- CRUD: `POST /questionnaire-responses`, `GET /questionnaire-responses`, `GET /questionnaire-responses/:id`, `PATCH /questionnaire-responses/:id`, `DELETE /questionnaire-responses/:id`.

## /recommendations
- `GET /recommendations` — рекомендації для головного екрану (залежно від настрою/діагнозу).

## /diary
- `GET /diary/day?date=YYYY-MM-DD` — знімок дня: настрій, напади, нагадування, відповіді на опитування.

## /news (стаб)
- `GET /news` — повертає порожній список (заглушка).
- `POST /news` — створення (заглушка).
- `DELETE /news/:newsId` — видалення (заглушка).
