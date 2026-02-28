# Installation

Seishiro API installation library

---

Seishiro API is designed to be runtime-agnostic, meaning you can use it in Node.js, Bun, or Deno (via npm compatibility).

## Package Manager

Langkah pertama adalah menambahkan library Seishiro ke dalam project kamu.

```bash
# Using NPM
npm install seishiro
# Using Bun
bun add seishiro
# Using Yarn
yarn add seishiro
```

Recommended Project Structure
Seishiro works best with a modular structure. We recommend the following folder layout to maintain application scalability (For Next.js) :

```
/src
 ├── /controllers      # Business logic (e.g., user.controller.ts)
 ├── /middlewares      # Security & validation (e.g., auth.middleware.ts)
 ├── /registry         # Route definitions
 ├── /messages         # Multilingual response templates
 └── /actions          # Actions Seishiro & Policy
```

Need an easy initial setup? Check out the [Simple Setup](./simple-usage.md) section.