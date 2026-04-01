# CLAUDE.md

## Project Overview

BTCPay Server - self-hosted, open-source Bitcoin payment processor.
Built with ASP.NET Core (.NET 10), Razor Views, Tailwind CSS v4, jQuery (minimal, only for Summernote), and Vue.js 2.7.14 (EOL, migration planned).

## Build & Run

```bash
dotnet restore
dotnet build
dotnet run --project BTCPayServer
```

## Architecture

- **Backend:** ASP.NET Core MVC with Razor Views
- **Frontend:** No bundler (no webpack/vite). All JS/CSS served as static files from `wwwroot/`
- **Vendor libs:** Committed directly to `wwwroot/vendor/` (no npm/yarn)
- **Theming:** CSS custom properties (`--btcpay-*`) in `wwwroot/main/themes/`
- **Real-time:** SignalR + Blazor Server (authenticated users only)

## Workflow

- Use subagents to distribute workload whenever appropriate (parallel tasks, multi-file changes, independent fixes).

## Code Conventions

### General
- Do not add code comments. Code should be self-explanatory.
- Do not repeat yourself (DRY). Extract shared logic into reusable utilities.
- Do not add Co-Authored-By or AI attribution lines to commit messages.

### Commits
- Group related changes into separate, focused commits.
- Each commit should represent a single logical change.
- Use conventional commit prefixes: `fix:`, `feat:`, `refactor:`, `chore:`.
- Write concise commit messages that explain "why", not "what".

### JavaScript
- Use `const`/`let` only. Never use `var`.
- Use the `delegate()` utility from `wwwroot/main/utils.js` for event handling.
- Do not modify built-in prototypes (String, Number, Array, etc.).
- Prefer native DOM APIs over jQuery. jQuery is only kept for Summernote.
- Use native `Intl` APIs and Date utilities from `utils.js` for date/time formatting.
- Shared utility functions go in `wwwroot/main/utils.js`.

### CSS
- Use Tailwind CSS utility classes when possible.
- Bootstrap component classes (`.btn`, `.form-control`, `.card`, `.alert`, `.table`, `.modal`, etc.) are redefined via `@layer components` in `Styles/tailwind.css`.
- Use `--btcpay-*` CSS custom properties for theming.
- Tailwind breakpoints are aligned with Bootstrap: sm=576px, md=768px, lg=992px, xl=1200px, 2xl=1400px.
- Avoid `!important` unless overriding third-party styles or print media.

### Razor Views
- Use `asp-append-version="true"` on all script and link tags.
- Use `asp-for` helpers for form labels and inputs.
- Add `loading="lazy"` to images that are below the fold (product listings, perk images).

### Accessibility
- All layouts must include a skip-to-content link.
- Use semantic HTML (`header`, `main`, `nav`, `section`).
- Manage focus after dynamic DOM operations.
- Use ARIA attributes for custom interactive components.

## Key Files

- `Views/Shared/_Layout.cshtml` - Main layout
- `Views/Shared/LayoutFoot.cshtml` - Script loading
- `Views/Shared/LayoutHead.cshtml` - CSS loading
- `wwwroot/main/utils.js` - Shared JS utilities (delegate, debounce, noExponents, date helpers)
- `wwwroot/main/site.js` - Main site JavaScript
- `Styles/tailwind.css` - Tailwind source config + component layer
- `wwwroot/main/tailwind-output.css` - Generated Tailwind output (git-ignored)
- `wwwroot/js/btcpay-components.js` - Vanilla JS replacements for Bootstrap JS (Modal, Toast, Tooltip, etc.)
- `wwwroot/main/themes/default.css` - Light theme
- `wwwroot/main/themes/default-dark.css` - Dark theme
