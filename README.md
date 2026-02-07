You are helping me build a full-stack, production-quality, multi-vendor fashion platform using Next.js App Router.

PROJECT OVERVIEW
The project is called "Love On The Runway".
It is a fashion show ecommerce platform for a church event.

There are three types of users:
1. SUPER_ADMIN – manages the entire system
2. DESIGNER – uploads outfits and manages their orders
3. CUSTOMER – browses outfits, adds to cart, checks out, and votes

PLATFORM STRUCTURE

The platform consists of a single Next.js application with two main areas:

1. Public-facing website → loveontherunway.com  
   - Accessible to all visitors and customers  
   - Used for browsing outfits, designers, cart, checkout, and voting

2. Unified backend portal → loveontherunway.com/admin  
   - One login system for both DESIGNER and SUPER_ADMIN  
   - Access and interface are determined by user role

   • SUPER_ADMIN dashboard inside /admin  
     - Full system management  
     - Manage designers, products, orders, and settings

   • DESIGNER dashboard inside /admin  
     - Manage only their own products and orders  
     - Cannot access admin-only features

   The application must use role-based rendering so:
   - Both designers and super admins log in from the same /admin entry point  
   - Navigation menus, pages, and permissions are dynamically controlled by role  
   - URLs are shared but protected by server-side role checks

TECH STACK
- Next.js (App Router)
- PostgreSQL database
- Prisma ORM
- NextAuth for authentication
- Cloudinary for image uploads
- Email-based checkout (no payment yet)
- Future payment integration with Paystack (not implemented now)

GENERAL RULES
- Use Prisma for all database access
- Use server components where possible
- Enforce role-based access control on the server
- Validate all inputs using Zod
- Never trust frontend-only checks
- Keep code clean, modular, and production-ready

DATABASE REQUIREMENTS (PRISMA + POSTGRESQL)

1. Use PostgreSQL as the database.

2. Define enums:
   - Role: SUPER_ADMIN, DESIGNER, CUSTOMER
   - OrderStatus: PENDING, CONFIRMED, COMPLETED, CANCELLED

3. User model:
   - Represents every authenticated person
   - Fields:
     - id (primary key)
     - name
     - email (unique)
     - password (hashed)
     - role (Role enum)
     - isActive (boolean)
     - createdAt
     - updatedAt

4. DesignerProfile model:
   - Exists only for users with DESIGNER role
   - One-to-one relationship with User
   - Fields:
     - id
     - userId (unique, relation to User)
     - brandName
     - bio
     - isApproved (boolean)
     - isVisible (boolean)
     - createdAt
     - updatedAt

5. Product model:
   - Represents an outfit
   - Owned by a DesignerProfile
   - Fields:
     - id
     - designerId (relation to DesignerProfile)
     - name
     - description
     - isVisible (boolean)
     - createdAt
     - updatedAt

6. ProductImage model:
   - Stores Cloudinary image references
   - One product can have multiple images
   - Fields:
     - id
     - productId
     - publicId (Cloudinary)
     - url
     - createdAt

7. ProductVariant model:
   - Represents size, color, and measurements of a product
   - Fields:
     - id
     - productId
     - size
     - color
     - measurements (stored as JSON)
     - stock (optional)
     - createdAt

8. Order model:
   - Represents a checkout transaction
   - Fields:
     - id
     - customerId (relation to User)
     - status (OrderStatus)
     - createdAt
     - updatedAt

9. OrderItem model:
   - Represents a product inside an order
   - Supports multi-designer orders
   - Fields:
     - id
     - orderId
     - productId
     - variantId
     - designerId
     - quantity

10. Vote model:
    - Represents a user voting for a product
    - Fields:
      - id
      - userId
      - productId
      - createdAt
    - Enforce a unique constraint so a user can vote only once per product

11. Include:
    - Proper relations
    - Indexes where necessary
    - Cascading deletes to avoid orphan records
    - Timestamps on all major models

AUTHENTICATION (NEXTAUTH)

- Use NextAuth with Credentials Provider
- Use Prisma Adapter
- Hash passwords securely
- Store userId and role in JWT and session
- Prevent login if user.isActive is false
- Make system extensible for future OAuth providers

ROLE-BASED ACCESS CONTROL (MIDDLEWARE)

- Public routes:
  - Landing page
  - Designers listing
  - Product pages
  - Cart
  - Voting page

- Protected routes under /admin:
  - SUPER_ADMIN → full access
  - DESIGNER → limited to their resources only

- Redirect unauthenticated users to /login
- Block inactive users entirely

CLOUDINARY IMAGE UPLOADS

- Use Cloudinary for image storage
- Upload multiple images per product
- Store images in "love-on-the-runway/products"
- Save only publicId and secure URL in database
- Restrict uploads to designers only
- Handle upload errors gracefully

DESIGNER CAPABILITIES (INSIDE /admin)

Routes:
- /admin/dashboard
- /admin/products
- /admin/orders

Capabilities:
- Create, edit, delete products
- Upload and manage multiple product images
- Add, edit, and remove product variants
- Store measurements as JSON
- View only orders related to their products
- See vote counts per product
- Must not access other designers’ data

SUPER ADMIN CAPABILITIES (INSIDE /admin)

Routes:
- /admin/dashboard
- /admin/designers
- /admin/products
- /admin/orders
- /admin/settings

Capabilities:
- View platform statistics
- Approve or disable designers
- Toggle designer visibility on public site
- View and hide any product
- View all orders
- Enable or disable voting globally
- Control event phase (before show / after show)

PUBLIC WEBSITE

Landing page:
- Display outfits in random order on each request
- Show only products that are visible and belong to approved designers
- Include image, product name, and designer name
- SEO optimized

Designer category:
- List all approved and visible designers
- Clicking a designer shows all their products

Product detail page:
- Image gallery
- Variant selection (size, color)
- Measurement display
- Add to cart functionality

CART & CHECKOUT (NO PAYMENT YET)

Cart:
- Store cart in session or localStorage
- Support products from multiple designers
- Persist selected variants

Checkout:
- Create Order and OrderItem records
- Orders start with status PENDING
- Group order items by designer
- Send an email to each designer containing:
  - Customer details
  - Product details
  - Selected size, color, and measurements

VOTING SYSTEM

- Users can vote for products after the show
- Voting is enabled or disabled by super admin
- A user can vote only once per product
- Enforce vote uniqueness at the database level
- Display total votes per product
- At voting and checkout user needs to provide their unique email address.

FUTURE PAYMENT (DO NOT IMPLEMENT NOW)

- Prepare the system for Paystack integration
- Store placeholders for transaction reference
- Ensure payment can be added later without refactoring

FINAL INSTRUCTIONS

- Always enforce permissions on the server
- Prefer server components
- Do not expose secrets
- Write clean, readable, maintainable code
- Treat this as a production-ready system, not a demo
- Start with creating the folders and file structures.
