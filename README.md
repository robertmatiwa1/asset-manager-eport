# Asset Manager — Eport Developer Assessment

A full-stack role-based asset management web application built using Next.js 16, Supabase (PostgreSQL), and Vercel.  
This project was submitted as part of the Eport (Pvt) Ltd Developer Assessment — 1st Dev Task.

---

## Live Deployment

Frontend (Vercel): https://asset-manager-eport.vercel.app/  

---

## Tech Stack

| Area      | Technology                            |
|-----------|----------------------------------------|
| Frontend  | Next.js 16 (App Router)               |
| Backend   | Supabase PostgreSQL + RLS             |
| Auth      | Supabase Auth (Email/Password)        |
| Deployment| Vercel (continuous deployment via GitHub) |
| Styling   | TailwindCSS                           |
| State     | React Hooks                           |

---

## Features Implemented

### Authentication

- Supabase email/password login
- Secure session handling
- Role-based routing & navigation (`ADMIN` and `USER`)
- Protected routes using reusable guards and checks

### Admin Features

- Admin Dashboard with high-level stats
- Manage Users
  - Create basic user profiles
  - List users with role and created date
  - Delete user records
- Manage Categories
  - Add new categories
  - List existing categories
  - Delete categories
- Manage Departments
  - Add new departments
  - List existing departments
  - Delete departments
- Manage Assets
  - View all assets in the system
  - See category, department, and owner
  - Delete any asset

### User Features

- User Dashboard
  - See the count of own assets
  - See total value of own assets
- User Assets
  - Create new assets with:
    - Name
    - Category (lookup)
    - Department (lookup)
    - Date Purchased
    - Cost
  - View a list of own assets only (RLS enforced)

### UX / Polish

- Top navigation bar with role-aware menu items
- Loading skeletons while data is fetched
- Confirmation modals before delete actions
- Clean, simple responsive layout using TailwindCSS

---

## Project Structure

src/
  app/
    admin/
      dashboard/
        page.tsx
      users/
        page.tsx
      categories/
        page.tsx
      departments/
        page.tsx
      assets/
        page.tsx
    user/
      dashboard/
        page.tsx
      assets/
        page.tsx
    login/
      page.tsx
  components/
    NavBar.tsx
    Modal.tsx
    AdminGuard.tsx
    UserGuard.tsx
  lib/
    auth.ts
    supabaseClient.ts
    supabaseAdmin.ts
  styles/
    globals.css

Database Schema (Supabase)
profiles
column	type	notes
id	uuid (PK)	Supabase auth user id
email	text	unique
full_name	text	required
role	text	ADMIN or USER
created_at	timestamp	default now()

categories
column	type
id	uuid (PK)
name	text
created_at	timestamp

departments
column	type
id	uuid (PK)
name	text
created_at	timestamp

assets
column	type	notes
id	uuid (PK)	
name	text	asset name
category_id	uuid	FK → categories.id
department_id	uuid	FK → departments.id
date_purchased	date	
cost	numeric	
created_by	uuid	FK → profiles.id (owner)
created_at	timestamp	default now()

**Row Level Security (RLS)**

Example RLS policies for assets:

-- Users may insert only assets that belong to themselves
CREATE POLICY "user_insert_own_assets"
ON assets FOR INSERT
WITH CHECK (created_by = auth.uid());

-- Users may view only their own assets
CREATE POLICY "user_select_own_assets"
ON assets FOR SELECT
USING (created_by = auth.uid());

-- Admins have full access via role in profiles
CREATE POLICY "admin_full_access_assets"
ON assets FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
);


(In the actual project, policies are configured directly in Supabase.)

**Local Development**
1. Install dependencies
    npm install

2. Environment variables

Create a file named .env.local in the project root and add:

NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY


These values are taken from the Supabase dashboard (Project Settings → API).

3. Run the dev server
    npm run dev


The app runs on:

    http://localhost:3000

**Deployment (Vercel + GitHub)**

    The repository is connected to Vercel.

    On each push to the main branch:

    Vercel pulls the latest code from GitHub.

    Runs npm install and npm run build.

    Deploys the optimized Next.js application.

    Supabase hosts the PostgreSQL database and authentication.

Production URL:
    https://asset-manager-eport.vercel.app/

**Example Test Flow**

A reviewer can test the system as follows:

    Open the live app: https://asset-manager-eport.vercel.app/

Log in as an Admin to:

    View dashboard

    Create categories and departments

    Create / view / delete assets

    View and manage user profiles

    Log in as a User to:

    Create own assets

    View only own assets

    See personal asset stats on dashboard

(Exact test credentials can be shared privately if required.)

**Known Limitations**

    No email invitation workflow yet for users.

    No edit forms for updating existing entities (only create/delete).

    No pagination for large data sets.

    No automated tests (unit/integration) at this stage.

    Error messages are basic alerts (can be upgraded to toast notifications).

**Possible Enhancements**

    Add edit functionality for assets, categories, departments, and profiles.

    Add file uploads (e.g. attach images or documents to assets).

    Add search and filter for large asset lists.

    Add audit logging for admin actions.

    Add CSV import/export for assets.

    Add dark mode toggle.

Conclusion

This project demonstrates:

Clean, modular Next.js 16 architecture.

Secure, role-based access control with Supabase and RLS.

Practical asset management flows for both Admin and User roles.

Production-ready deployment pipeline using Vercel and Supabase.

Professional coding standards, structure, and documentation suitable for a real-world team environment.

Submitted by Robert Matiwa for the
Eport (Pvt) Ltd — Software Developer 1st Dev Task.