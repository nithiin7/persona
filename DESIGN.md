# Design System — Persona

Modern, minimal, clean. Inspired by Linear, Vercel, and Notion dashboards.

**Core principle:** Whitespace and typography carry the hierarchy. Color is used sparingly and only where it has semantic meaning. Animations serve navigation feedback, not decoration.

---

## Backgrounds

### Page background

Every full-page route uses this fixed background:

```tsx
<div className="fixed inset-0 z-0 bg-gray-50">
  <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
</div>
<div className="relative z-10">{/* content */}</div>
```

### Never use

- Colored gradient backgrounds (`from-rose-50 via-sky-50 to-violet-50`)
- Floating gradient orbs (`blur-3xl rounded-full animate-float`)
- Mesh/line grid overlays (`bg-[linear-gradient(to_right,...)]`)

---

## Color Palette

| Token          | Tailwind class          | Use for                   |
| -------------- | ----------------------- | ------------------------- |
| Page bg        | `bg-gray-50`            | Page background           |
| Surface        | `bg-white`              | Cards, panels, strips     |
| Hover surface  | `hover:bg-gray-50`      | Interactive surface hover |
| Border default | `border-gray-200`       | All borders               |
| Border hover   | `hover:border-gray-300` | Hover border upgrade      |
| Text primary   | `text-gray-900`         | Headings, labels          |
| Text secondary | `text-gray-500`         | Body, descriptions        |
| Text tertiary  | `text-gray-400`         | Placeholders, hints       |

### Status colors (semantic use only)

| Meaning                      | Text               | Bar/bg           |
| ---------------------------- | ------------------ | ---------------- |
| Success / high score (≥80%)  | `text-emerald-600` | `bg-emerald-500` |
| Warning / mid score (50–79%) | `text-amber-600`   | `bg-amber-500`   |
| Error / low score (<50%)     | `text-red-600`     | `bg-red-500`     |

### Never use

- Gradient text clipping (`bg-gradient-to-r ... bg-clip-text text-transparent`)
- Per-element accent colors (different color per tab, per section type)
- Glass morphism (`bg-white/40 backdrop-blur-xl border-white/40`)

---

## Typography

```tsx
// Page heading
<h1 className="text-2xl font-semibold text-gray-900">...</h1>

// Section heading
<h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">...</h2>

// Card heading
<h3 className="text-sm font-semibold text-gray-900">...</h3>

// Body / description
<p className="text-sm text-gray-500">...</p>

// Section label / ALL-CAPS category
<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">...</p>

// Tabular numbers (scores, counts)
<span className="tabular-nums">...</span>
```

---

## Layout

```tsx
// Standard content container (use on every page)
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// Section spacing between major blocks
<div className="space-y-6">

// Card grid (resume grid)
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
```

---

## Horizontal Strips

Used for the app header, profile row, action bars:

```tsx
<div className="border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
```

---

## Cards

```tsx
// Standard content card
<Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
  <div className="p-6">...</div>
</Card>

// Info/highlight card (e.g. completion bar)
<div className="bg-white border border-gray-200 rounded-xl p-5">
```

**Never add:** `backdrop-blur`, `bg-white/50`, `border-white/40`, or hover gradient overlay divs inside cards.

---

## Buttons

```tsx
// Primary action (save, confirm, submit)
<Button className="bg-gray-900 text-white hover:bg-gray-700 transition-colors duration-200">

// Secondary / outline
<Button variant="outline" className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200">

// Danger action (delete, reset)
<Button variant="outline" className="text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors duration-200">
```

**Never use:** Colored gradient buttons (`from-teal-500 to-cyan-600`), shine overlays, or `hover:scale-[1.02]` on buttons.

---

## Progress Bars

```tsx
// Large progress bar (profile completion card)
<div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
  <div
    className={cn("h-full rounded-full transition-all duration-700 ease-out", barColor)}
    style={{ width: `${score}%` }}
  />
</div>

// Inline mini progress bar (profile row strip)
<Progress value={score} className="h-1 w-16 shrink-0" />
```

---

## Tabs

```tsx
<TabsList className="h-auto bg-white border border-gray-200 rounded-lg p-1 flex gap-0.5 overflow-x-auto whitespace-nowrap shadow-sm">
  <TabsTrigger
    value="..."
    className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-500
      data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-none
      hover:text-gray-700 transition-colors duration-150"
  >
    <Icon className="h-3.5 w-3.5 shrink-0" />
    Label
  </TabsTrigger>
</TabsList>
```

**Never use:** Per-tab gradient active states, per-tab accent colors, colored icon circles inside tabs.

Tab content animation:

```tsx
<TabsContent className="mt-0 animate-in fade-in-50 slide-in-from-bottom-1 duration-300">
```

---

## Animations

Defined in `globals.css`. Use these for page and section entry:

| Class             | Effect                      | Best for                |
| ----------------- | --------------------------- | ----------------------- |
| `animate-fade-in` | 0.3s opacity 0→1            | Full-page entry, strips |
| `animate-fade-up` | 0.45s opacity + 10px Y lift | Content sections        |

### Stagger pattern for multiple sections

```tsx
<div className="animate-fade-up">...</div>
<div className="animate-fade-up" style={{ animationDelay: "80ms" }}>...</div>
<div className="animate-fade-up" style={{ animationDelay: "160ms" }}>...</div>
```

### Hover transitions

- Color-only changes: `transition-colors duration-200`
- With transform: `transition-all duration-200`
- Card lift: `hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`

**Never use:** `animate-float`, blob animations, `hover:scale-[1.02]` on large surfaces, multi-second transitions.

---

## Icons

Use Lucide React. Icon sizes:

- In buttons: `h-3.5 w-3.5`
- In tabs: `h-3.5 w-3.5 shrink-0`
- In stat rows: `h-3.5 w-3.5 text-gray-400 shrink-0`
- Standalone/decorative: `h-4 w-4`

---

## Stat Chips (profile row)

```tsx
<div className="flex items-center gap-1.5 text-sm text-gray-500">
  <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
  <span className="font-semibold text-gray-700">{count}</span>
  <span className="hidden lg:inline text-gray-400">{label}</span>
</div>
```

---

## Avatar / User Icon

```tsx
<div className="shrink-0 h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
  <User className="h-4 w-4 text-gray-400" />
</div>
```

---

## Import Option Buttons

```tsx
<Button
  variant="outline"
  className="justify-start gap-3 h-auto py-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
>
  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 shrink-0">
    <Icon className="h-4 w-4 text-gray-500" />
  </div>
  <div className="text-left">
    <div className="text-sm font-medium text-gray-800">Title</div>
    <div className="text-xs text-gray-400">Subtitle</div>
  </div>
</Button>
```

---

## AppHeader

```tsx
<header className="h-14 border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-40">
  <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
    {/* dividers: <div className="h-4 w-px bg-gray-200" /> */}
    {/* nav links: text-gray-500 hover:text-gray-900 transition-colors duration-200 */}
  </div>
</header>
```

**Never add:** Multiple stacked gradient overlay divs, `backdrop-blur-xl` on the header, `border-purple-200/50`.

---

## Form Fields

Use inline labels above inputs — never floating/absolute-positioned labels or icon-in-bubble decorations.

```tsx
// Standard field group (reusable pattern)
<div className="space-y-1.5">
  <div className="flex items-baseline justify-between">
    <label className="text-xs font-medium text-gray-500">Label</label>
    <span className="text-[10px] text-gray-400">Optional hint</span>{" "}
    {/* only if needed */}
  </div>
  <Input className="h-8 border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0" />
</div>;

// Taller input (standalone fields, basic info)
className =
  "h-9 border-gray-200 bg-white placeholder:text-gray-400 text-sm text-gray-900 focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";

// Textarea
className =
  "border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none";
```

Section group label (above a group of fields, e.g. "Personal Details"):

```tsx
<p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
  Personal Details
</p>
```

Leading icon in a label (optional):

```tsx
<label className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
  <Icon className="h-3.5 w-3.5 text-gray-400" />
  Label
</label>
```

**Never use:** Floating labels with `absolute -top-2.5`, `bg-white/80` label backgrounds, colored icon circles inside/beside inputs (`bg-teal-100/80`), per-field color theming.

---

## Accordion Items (sections lists)

```tsx
<AccordionItem className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors duration-150">
  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 transition-colors duration-150">
    <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
      <span className="text-sm font-medium text-gray-900 truncate">
        {name}
        {subtitle && (
          <span className="font-normal text-gray-500 ml-1.5">· {subtitle}</span>
        )}
      </span>
      {date && (
        <span className="text-xs text-gray-400 shrink-0 mr-2">{date}</span>
      )}
    </div>
  </AccordionTrigger>
  <AccordionContent>
    <div className="px-4 pb-4 pt-3 space-y-4 border-t border-gray-100">
      {/* fields */}
    </div>
  </AccordionContent>
</AccordionItem>
```

**Never use:** Per-section gradient backgrounds (`from-cyan-500/5`), `backdrop-blur-md`, colored borders (`border-cyan-500/30`), colored trigger text (`text-cyan-900`).

---

## Inline "Add bullet" button (inside accordion)

```tsx
<Button
  variant="ghost"
  size="sm"
  className="h-6 px-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
>
  <Plus className="h-3 w-3 mr-1" />
  Add bullet
</Button>
```

## Delete row button

```tsx
<Button
  variant="ghost"
  size="sm"
  className="h-8 w-8 shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
>
  <Trash2 className="h-3.5 w-3.5" />
</Button>
```

## "Add Section" footer button

```tsx
<Button
  variant="outline"
  className="w-full h-9 border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
>
  <Plus className="h-3.5 w-3.5 mr-1.5" />
  Add Work Experience
</Button>
```

---

## Pages Updated

These pages already follow this design system:

- `/home` — `home/page.tsx`, `profile-row.tsx`, `resumes-section.tsx`
- `/profile` — `profile/page.tsx`, `profile-edit-form.tsx`, all five profile form components
- Global — `app-header.tsx`, `globals.css`
