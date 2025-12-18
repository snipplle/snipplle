<div align="center">
  <p align="center">
    <img src="app/assets/images/logo.svg" alt="Snipplle Logo" width="200" />
  </p>

  <h1 align="center">Snipplle</h1>

  <p align="center">
    <strong>Your modern, open-source code snippet manager.</strong><br>
    Organize, share, and collaborate on your code snippets with ease.
  </p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Nuxt 4](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js)](https://nuxt.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)

  [Cloud](https://snipplle.com) • [Report Bug](https://github.com/snipplle/snipplle/issues) • [Request Feature](https://github.com/snipplle/snipplle/issues) • [Contribute](https://github.com/snipplle/snipplle/pulls)
</div>

<br>

## 🚀 About Snipplle

Snipplle is a modern, open-source code snippet manager designed to streamline your development workflow. Stop searching through old projects or chat history for that one useful function—keep everything organized, accessible, and shareable in one place.

Whether you are a solo developer building a personal library of solutions or part of a team establishing shared coding patterns, Snipplle provides the tools you need to manage your code fragments efficiently.

## ✨ Features

- **Syntax Highlighting:** Support for popular languages including JavaScript, Python, Go, Rust, and others.
- **Collections:** Organize your snippets into logical collections for easy access.
- **Workspaces:** Create your personal workspace and join multiple team workspaces for seamless collaboration.
- **Share & Collaborate:** Share snippets publicly or privately with team members.
- **Version Control:** Track changes and revert to previous versions of your snippets.
- **CLI Integration:** Manage your snippets directly from your terminal.
- **Secure:** Built with security in mind, featuring robust authentication and API token management.
- **Modern UI:** A beautiful, dark-mode optimized interface built with Nuxt UI and Tailwind CSS.

## ☁️ Cloud Version (Beta)

**The best way to experience Snipplle is through our Cloud version.**

We are currently in a **Free Public Beta**. This means you can get started instantly without worrying about servers, updates, or maintenance.

### Why choose Snipplle Cloud?
- **Zero Setup:** Start saving snippets in seconds.
- **Maintenance Free:** We handle backups, updates, and security.
- **Access Anywhere:** Your snippets are available on any device.
- **Free during Beta:** Enjoy all features without limits while we polish the experience.

👉 **[Get Started with Snipplle Cloud](https://snipplle.com)**

## 🛠️ Self-Hosted

If you prefer to have full control over your data and infrastructure, Snipplle is fully open-source and can be self-hosted.

> **Note:** Self-hosting requires managing your own database, updates, and backups. For a hassle-free experience, we recommend the [Cloud Version](#cloud-version-beta).

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- pnpm

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/snipplle.git
   cd snipplle
   ```

2. **Setup Environment Variables**
   Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   ```
   *Update `POSTGRES_DB`, `BETTER_AUTH_SECRET`, and other variables in `.env`.*

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

4. **Database Setup**
   Run the migrations to setup your database schema:
   ```bash
   pnpm db:migrate
   ```

5. **Run Development Server**
   ```bash
   pnpm dev
   ```
   Visit `http://localhost:3000` to see your local instance.

### Docker Support

You can also run Snipplle using Docker Compose:

```bash
docker-compose up -d
```

## 💻 Tech Stack

Snipplle is built with a modern, robust technology stack:

- **Framework:** [Nuxt 4](https://nuxt.com) (Vue 3)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) & Nuxt UI
- **Database:** [PostgreSQL](https://www.postgresql.org)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team)
- **Authentication:** [Better Auth](https://better-auth.com)
- **Editor:** [CodeMirror](https://codemirror.net)
- **Runtime:** [Node.js](https://nodejs.org)

## 🤝 Contributing

We welcome contributions! Whether it's reporting a bug, suggesting a feature, or submitting a pull request, your input is valuable.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

<p align="center">
  Built with ❤️ by the Snipplle Team
</p>
