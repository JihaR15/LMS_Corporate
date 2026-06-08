# Product Requirements Document (PRD): Corporate LMS

## 1. Project Overview
A Learning Management System (LMS) with Role-Based Access Control (RBAC). 
Learning content is organized into **Modules**. Modules are strictly mapped to the Operator's specific job position. Operators must complete/check all assigned materials (1 material = 1 file/video) within a module before unlocking the module's Post-Test. The system tracks multiple test attempts and enforces module-specific passing scores.

## 2. Tech Stack
- **Frontend:** Next.js (App Router), Tailwind CSS
- **Backend:** Express.js, Node.js
- **Database:** MSSQL (SQL Server)
- **Database Tool:** DBeaver (Environment: Zorin OS / Linux via Docker)
- **Authentication:** JWT (JSON Web Token), Login via NIK (Nomor Induk Karyawan) and Password.

## 3. Core Features
### A. Admin Role
- **Auth:** Login.
- **Master Data:** CRUD Positions (Posisi Operator).
- **User Management:** CRUD Operator (Assign NIK, Fullname, Password, Position, Active Status).
- **Module & Material Management:** - CRUD Modules (Set Title, Target Position, and Passing Score).
  - CRUD Materials (PDF, Video). Map materials to specific Modules with `sequence_order`.
- **Post-Test Management:** CRUD Questions and Answers mapped to specific Modules, including question sequences.
- **Reporting:** View Operator learning progress, test attempts, and final scores.

### B. Operator Role
- **Auth:** Login via NIK & Password.
- **Dashboard:** View available Modules based on their assigned Position.
- **Learning Flow:**
  1. Open a Module and view the list of sequential materials.
  2. Read PDF / Watch Video.
  3. Trigger "Mark as Completed" for each material.
  4. If all materials in a module are completed -> Unlock Post-Test for that module.
- **Assessment:** Take Post-Test, view score, and see pass/fail status based on the module's passing score. Can retake the test (tracked via `attempt`).

## 4. Database Schema Proposal (Entities)
1. **Positions:** `id`, `name` (e.g., Cashier, Technician).
2. **Users:** `id`, `nik` (unique), `fullname`, `password_hash`, `role` (admin/operator), `position_id` (nullable), `is_active` (boolean).
3. **Modules:** `id`, `title`, `description`, `position_id`, `passing_score`.
4. **Materials:** `id`, `module_id`, `title`, `type` (pdf/video), `file_url`, `sequence_order`.
5. **User_Progress:** `id`, `user_id`, `material_id`, `is_completed` (boolean), `completed_at`. *(Has UNIQUE constraint on user_id & material_id)*.
6. **Questions:** `id`, `module_id`, `question_text`, `sequence_order`.
7. **Answers:** `id`, `question_id`, `answer_text`, `is_correct` (boolean).
8. **Test_Results:** `id`, `user_id`, `module_id`, `attempt` (integer), `score`, `is_passed` (boolean), `taken_at`.

## 5. System Architecture & Modularity
### Backend (Express.js Structure)
- `/routes` : `auth.routes.js`, `module.routes.js`, `material.routes.js`, `test.routes.js`
- `/controllers`: Logic for each route.
- `/middlewares`: `verifyToken`, `checkRole(admin/operator)`
- `/config`: `db.js` (MSSQL connection pool)

### Frontend (Next.js App Router Structure)
- `/app/(auth)/login`
- `/app/admin/dashboard`
- `/app/admin/modules`
- `/app/admin/modules/[id]/materials`
- `/app/operator/dashboard`
- `/app/operator/module/[id]` (Lists materials & unlock post-test button)
- `/app/operator/material/[id]` (PDF Viewer / Video Player)
- `/app/operator/post-test/[id]`
- `/components/ui`: Button, Input, Modal, Table, Checkbox
- `/components/layout`: AdminSidebar, OperatorNavbar