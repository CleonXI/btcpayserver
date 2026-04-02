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
- **Frontend:** Vite build for CSS/JS bundling
- **Vendor libs:** Committed directly to `wwwroot/vendor/` (no npm/yarn)
- **Theming:** Tailwind `@theme` tokens in `Styles/theme.css`, dark mode via `[data-btcpay-theme="dark"]` selector
- **Interactive JS:** Alpine.js components in `wwwroot/js/alpine-components.js` (Modal, Dropdown, Offcanvas, Collapse, Tooltip, Toast, Tabs)
- **Real-time:** SignalR + Blazor Server (authenticated users only)

## Workflow

- Use subagents to distribute workload whenever appropriate (parallel tasks, multi-file changes, independent fixes).

## Code Conventions

### General
- Do not add code comments. Code should be self-explanatory.


### JavaScript
- Use `const`/`let` only. Never use `var`.
- Use the `delegate()` utility from `wwwroot/main/utils.js` for event handling.
- Prefer native DOM APIs over jQuery. jQuery is only kept for Summernote.
- Use native `Intl` APIs and Date utilities from `utils.js` for date/time formatting.
- Shared utility functions go in `wwwroot/main/utils.js`.

### CSS
- Use Tailwind CSS utility classes when possible.
- Component classes (`.btn`, `.form-control`, `.table`, `.modal`, etc.) use Tailwind `@apply` in `Styles/components/`.
- Theme values are defined in `Styles/theme.css` via `@theme` and `@layer base`.
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
- `Styles/tailwind.css` - Tailwind entry point (imports components, theme, utilities)
- `Styles/theme.css` - Theme tokens (`@theme`) + light/dark variable definitions (`@layer base`)
- `Styles/components/` - Component CSS files (buttons, forms, tables, modals, dropdowns, navigation, accordion, toast, offcanvas, collapse)
- `Styles/site/misc.css` - Site-specific styles (validation, print, clipboard, mass actions, vendor overrides)
- `wwwroot/js/alpine-components.js` - Alpine.js interactive components (Modal, Dropdown, Offcanvas, Collapse, Tooltip, Toast, Tabs)
