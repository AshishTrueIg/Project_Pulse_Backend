# Database ERD — Version 1

This is the initial relational model for the internal project, team, feedback,
health, milestone, and financial management platform.

The diagram intentionally focuses on important keys and business fields. Audit
columns such as `updated_at`, `deleted_at`, and `updated_by` can be added
consistently in migrations without making the ERD unreadable.

```mermaid
erDiagram
    direction LR

    ORGANIZATION ||--o{ USER : "employs"
    ORGANIZATION ||--o{ ROLE : "defines"
    USER ||--o{ USER_ROLE : "receives"
    ROLE ||--o{ USER_ROLE : "assigned through"
    ORGANIZATION ||--o{ CLIENT : "serves"
    ORGANIZATION ||--o{ PROJECT : "owns"
    CLIENT ||--o{ PROJECT : "commissions"
    USER ||--o{ PROJECT : "manages"
    PROJECT ||--o{ PROJECT_ASSIGNMENT : "staffs"
    USER ||--o{ PROJECT_ASSIGNMENT : "works through"
    PROJECT ||--o{ MILESTONE : "delivers"
    USER ||--o{ MILESTONE : "owns"
    PROJECT ||--o{ HEALTH_UPDATE : "reports"
    USER ||--o{ HEALTH_UPDATE : "submits"
    HEALTH_UPDATE ||--|{ HEALTH_DIMENSION : "contains"
    PROJECT ||--o{ RISK : "tracks"
    USER ||--o{ RISK : "owns"
    HEALTH_UPDATE ||--o{ ACTION_ITEM : "creates"
    USER ||--o{ ACTION_ITEM : "owns"
    PROJECT ||--o{ FEEDBACK : "provides context for"
    USER ||--o{ FEEDBACK : "authors"
    USER ||--o{ FEEDBACK : "receives"
    FEEDBACK ||--o{ IMPROVEMENT_GOAL : "creates"
    USER ||--o{ IMPROVEMENT_GOAL : "owns"
    PROJECT ||--o| CONTRACT : "operates under"
    CONTRACT ||--o{ INVOICE : "bills through"
    INVOICE ||--o{ PAYMENT : "collects"
    PROJECT ||--o{ PROJECT_COST : "incurs"
    ORGANIZATION ||--o{ AUDIT_LOG : "records"
    USER ||--o{ AUDIT_LOG : "performs"

    ORGANIZATION["Organization"] {
        uuid id PK
        string name
        string slug UK
        string timezone
        string currency
        int reporting_cadence_days
        datetime created_at
    }

    USER["User"] {
        uuid id PK
        uuid organization_id FK
        string email UK
        string password_hash
        string full_name
        string status
        datetime last_login_at
        datetime created_at
    }

    ROLE["Role"] {
        uuid id PK
        uuid organization_id FK
        string name
        json permissions
        bool is_system
        datetime created_at
    }

    USER_ROLE["User Role"] {
        uuid user_id PK, FK
        uuid role_id PK, FK
        datetime assigned_at
    }

    CLIENT["Client"] {
        uuid id PK
        uuid organization_id FK
        string name
        string primary_contact_name
        string primary_contact_email
        string status
        datetime created_at
    }

    PROJECT["Project"] {
        uuid id PK
        uuid organization_id FK
        uuid client_id FK
        uuid manager_user_id FK
        string name
        string code UK
        string stage
        string overall_health
        date start_date
        date target_end_date
        string status
    }

    PROJECT_ASSIGNMENT["Project Assignment"] {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        string project_role
        text responsibilities
        bool is_dedicated
        date joined_at
        date left_at
    }

    MILESTONE["Milestone or MVP"] {
        uuid id PK
        uuid project_id FK
        uuid owner_user_id FK
        uuid accepted_by_user_id FK
        string name
        string milestone_type
        string status
        text acceptance_criteria
        date due_date
        datetime accepted_at
    }

    HEALTH_UPDATE["Weekly Health Update"] {
        uuid id PK
        uuid project_id FK
        uuid submitted_by_user_id FK
        date period_start
        date period_end
        string suggested_health
        string final_health
        text override_reason
        datetime submitted_at
    }

    HEALTH_DIMENSION["Health Dimension"] {
        uuid id PK
        uuid health_update_id FK
        string dimension
        string status
        text reason
        datetime created_at
    }

    RISK["Risk or Blocker"] {
        uuid id PK
        uuid project_id FK
        uuid owner_user_id FK
        string title
        text description
        string severity
        string status
        date target_date
    }

    ACTION_ITEM["Action Item"] {
        uuid id PK
        uuid health_update_id FK
        uuid owner_user_id FK
        string title
        string status
        date target_date
        datetime completed_at
    }

    FEEDBACK["Feedback"] {
        uuid id PK
        uuid project_id FK
        uuid author_user_id FK
        uuid subject_user_id FK
        string feedback_type
        string visibility
        text summary
        datetime published_at
        datetime acknowledged_at
        text employee_response
    }

    IMPROVEMENT_GOAL["Improvement Goal"] {
        uuid id PK
        uuid feedback_id FK
        uuid user_id FK
        string title
        text success_measure
        string status
        date target_date
        date review_date
    }

    CONTRACT["Project Contract"] {
        uuid id PK
        uuid project_id FK
        string billing_model
        string currency
        decimal monthly_amount
        date start_date
        date end_date
        string status
    }

    INVOICE["Invoice"] {
        uuid id PK
        uuid contract_id FK
        string invoice_number UK
        date period_start
        date period_end
        decimal amount
        date due_date
        string status
    }

    PAYMENT["Payment"] {
        uuid id PK
        uuid invoice_id FK
        decimal amount
        string reference
        datetime paid_at
        datetime recorded_at
    }

    PROJECT_COST["Project Cost"] {
        uuid id PK
        uuid project_id FK
        date cost_month
        string category
        decimal amount
        text notes
        datetime created_at
    }

    AUDIT_LOG["Audit Log"] {
        uuid id PK
        uuid organization_id FK
        uuid actor_user_id FK
        string action
        string entity_type
        uuid entity_id
        json before_value
        json after_value
        datetime created_at
    }
```

## Important modeling decisions

- Roles and permissions are organization-scoped, while project responsibilities
  live on `project_assignments`.
- Project health is stored as immutable weekly snapshots with separate
  dimensions for schedule, scope, quality, client sentiment, and team condition.
- A milestone records manual MVP acceptance, including who accepted it and when.
- Feedback separates author and recipient and supports employee acknowledgement
  without turning feedback into an automatic performance score.
- Financial information is anchored to a project contract and then separated
  into invoices, payments, and operational project-cost estimates.
- Sensitive changes are captured in an append-only audit log.
