WanNiFakPrungNiLeaum's Database Schema
users is the account of all roles.
reservation can be made by customers.
pet is the accepted reservation.
``` mermaid
erDiagram
    users ||--|o staffs : is
    users ||--|o customers : is
    users ||--|o managers : is
    users ||--o{ reservations : makes
    customers ||--o{ pets : has
    branches ||--o{ staffs : works_for
    branches ||--o{ pets : is_in

    oauthusers{
        serial id PK
        uuid user_id FK
        text provider NN U
        text provider_user_id NN U
        timestampz created_at
    }
    users{
        uuid userid PK
        text username NN U
        text password 
        text email NN U
        text phone 
        timestampz created_at
        text role
    }
    customers{
        uuid customer_id PK
        uuid userid FK
    }
    staffs{
        uuid staff_id PK
        uuid userid FK
        uuid branch_id FK
    }
    managers{
        uuid manager_id PK
        uuid userid FK
    }
    reservations{
        uuid reservation_id PK
        uuid userid FK
        uuid branch_id FK
        text customer_name
        text customer_phone
        text customer_email
        date reservation_date
        timestamptz check_in
        timestamptz check_out
        text pet_name
        text pet_type
        text pet_breed
        text pet_sex
        numeric pet_weight
        date pet_birth
        text pet_condition
        text pet_note
        timestamptz created_at
    }

    pets{
        uuid pet_id PK
        uuid userid FK
        uuid branch_id FK
        text customer_name
        text customer_phone
        text customer_email
        date reservation_date
        timestamptz check_in
        timestamptz check_out
        text pet_name
        text pet_type
        text pet_breed
        text pet_sex
        numeric pet_weight
        date pet_birth
        text status
        text pet_condition
        text pet_note
        timestamptz created_at
    }
    branches{
        uuid branch_id PK
        text branch_name
    }

```