# HR Module (Frontend-first) — Backend Contract

This document describes the **backend API contracts** required to support the **frontend HR module** implemented in `src/modules/hr/`.

## Scope

- **Employees**: HR manages people from the existing `Users` table, plus additional HR fields stored in HR tables.
- **Attendance**: daily check-in/out, import from Excel, company settings for calculations.
- **Leaves**: balances + approvals, reusing existing planning leaves endpoints where possible.
- **Payroll**: monthly runs + payslips computed using Tunisian 2025 formulas (configurable rates).

## Conventions

- **Base URL**: frontend calls `${API_URL}/api/hr/...`
- **Envelope**: frontend accepts either:
  - raw JSON objects/arrays, or
  - `{ "success": true, "data": ... }`
- **Dates**: ISO `YYYY-MM-DD`
- **Times**: `HH:mm` (24h)
- **Money**: decimal, recommend **3 decimals** for TND calculations
- **Auth**: `Authorization: Bearer <token>`
- **Tenant**: header injected automatically by frontend when applicable.

## Data Types (JSON shapes)

### Employee salary config

```json
{
  "id": 1,
  "userId": 12,
  "grossSalary": 2200.0,
  "isHeadOfFamily": true,
  "childrenCount": 2,
  "customDeductions": 0,
  "bankAccount": "TN59....",
  "cnssNumber": "12345678",
  "hireDate": "2024-06-01",
  "department": "Operations",
  "position": "Technician",
  "employmentType": "full_time"
}
```

### Attendance record

```json
{
  "id": 10,
  "userId": 12,
  "date": "2026-03-18",
  "checkIn": "08:00",
  "checkOut": "17:00",
  "breakDuration": 60,
  "source": "import",
  "rawData": { "Employee": "12", "In": "08:00", "Out": "17:00", "Device": "X" },
  "hoursWorked": 8.0,
  "overtimeHours": 0.0,
  "status": "present",
  "notes": "optional"
}
```

### Attendance settings

```json
{
  "id": 1,
  "weekendDays": [5, 6],
  "standardHoursPerDay": 8,
  "overtimeThreshold": 8,
  "overtimeMultiplier": 1.5,
  "roundingMethod": "15min",
  "calculationMethod": "actual_hours",
  "lateThresholdMinutes": 10,
  "holidays": ["2026-01-01", "2026-03-20"]
}
```

### Leave balance

```json
{
  "userId": 12,
  "leaveType": "annual",
  "annualAllowance": 18,
  "used": 3,
  "pending": 1,
  "remaining": 14
}
```

### Payroll run / entry

```json
{
  "id": 5,
  "month": 3,
  "year": 2026,
  "status": "draft",
  "totalGross": 10000.0,
  "totalNet": 7800.0,
  "createdBy": 1,
  "createdAt": "2026-03-18T10:00:00Z",
  "confirmedAt": null,
  "entries": [
    {
      "id": 100,
      "payrollRunId": 5,
      "userId": 12,
      "userName": "John Doe",
      "grossSalary": 2200.0,
      "cnss": 212.96,
      "taxableGross": 1987.04,
      "abattement": 350.0,
      "taxableBase": 1637.04,
      "irpp": 305.00,
      "css": 19.87,
      "netSalary": 1662.17,
      "workedDays": 22,
      "totalHours": 176,
      "overtimeHours": 4,
      "leaveDays": 0,
      "details": {
        "irppBrackets": [
          { "from": 833.33, "to": 1666.67, "rate": 0.25, "taxableInBracket": 803.71, "taxAmount": 200.93 }
        ]
      }
    }
  ]
}
```

## Required Endpoints

### Employees

- `GET /api/hr/employees`
  - **Response**: array of `{ user, salaryConfig }`

```json
[
  {
    "user": { "id": 12, "firstName": "John", "lastName": "Doe", "email": "john@x.tld" },
    "salaryConfig": { "id": 1, "userId": 12, "grossSalary": 2200, "isHeadOfFamily": true, "childrenCount": 2, "employmentType": "full_time" }
  }
]
```

- `GET /api/hr/employees/{id}`
  - **Response**: `{ user, salaryConfig, attendanceSummary?, leaveBalance?, payrollHistory? }` (extensible)

- `PUT /api/hr/employees/{id}/salary-config`
  - **Request**: partial salary config
  - **Response**: saved salary config

### Attendance

- `GET /api/hr/attendance?month=&year=&userId=`
  - **Response**: `AttendanceRecord[]`

- `POST /api/hr/attendance`
  - **Request**: `{ userId, date, checkIn?, checkOut?, breakDuration?, notes?, status?, source: "manual" }`
  - **Response**: created `AttendanceRecord`

- `PUT /api/hr/attendance/{id}`
  - **Request**: partial update
  - **Response**: updated record

- `POST /api/hr/attendance/import`
  - **Request**:

```json
{ "rows": [ { "userId": 12, "date": "2026-03-18", "checkIn": "08:00", "checkOut": "17:00", "rawData": { "...": "..." }, "source": "import" } ] }
```

  - **Response**:

```json
{ "imported": 10, "errors": [ { "row": 3, "message": "Unknown employee" } ] }
```

- `GET /api/hr/attendance/settings`
- `PUT /api/hr/attendance/settings`

### Leaves (HR-side balances)

- `GET /api/hr/leaves/balances?year=`
- `PUT /api/hr/leaves/balances/{userId}`
  - **Request**: `{ year, leaveType, annualAllowance }`
  - **Response**: balances for that user (or all users)

### Payroll

- `POST /api/hr/payroll/run`
  - **Request**: `{ month, year }`
  - **Response**: created draft `PayrollRun`

- `GET /api/hr/payroll/runs?year=`
- `GET /api/hr/payroll/runs/{id}`
- `PUT /api/hr/payroll/runs/{id}/confirm`
- `GET /api/hr/payroll/payslip/{entryId}`

## Reused existing planning endpoints (no changes required)

- `GET /api/planning/schedule/{userId}`
- `GET /api/planning/leaves/{userId}`
- `POST /api/planning/leaves`
- `PUT /api/planning/leaves/{id}`
- `DELETE /api/planning/leaves/{id}`

## Tunisian 2025 payroll formulas (monthly)

Defaults (configurable later):

- CNSS rate: `0.0968`
- CSS rate: `0.01`
- Abattement:
  - head of family: `150`
  - per child: `100`

Steps:

1. \(cnss = grossSalary * 0.0968\)
2. \(taxableGross = grossSalary - cnss\)
3. \(abattement = (isHeadOfFamily ? 150 : 0) + (childrenCount * 100)\)
4. \(taxableBase = max(0, taxableGross - abattement)\)
5. IRPP progressive brackets (tax only the portion inside each bracket)
6. \(css = taxableGross * 0.01\)
7. \(netSalary = grossSalary - cnss - irpp - css\)

Frontend implementation source of truth: `src/modules/hr/utils/tunisianTaxEngine.ts`.

