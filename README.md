# 🚀 Plavist - AI-Powered HR Automation Platform

Plavist is a modern HR automation platform designed to streamline the hiring process with AI-powered interview screening, intelligent candidate management, and comprehensive analytics.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎯 Core Features

- **Job Management** - Create, edit, and manage job postings with detailed requirements
- **AI-Powered Screening** - Automated candidate screening with intelligent scoring
- **Smart Questionnaires** - Build custom screening questionnaires with multiple question types
- **Application Tracking** - Track applications through the entire hiring pipeline
- **Interview Management** - Schedule and manage interviews (video, phone, in-person)
- **Candidate Database** - Comprehensive candidate profiles with skills and experience
- **Analytics Dashboard** - Real-time insights into hiring performance

### 🤖 AI Features

- **AI Interview Sessions** - Automated interviews with real-time analysis
- **Resume Analysis** - Intelligent parsing and scoring of candidate resumes
- **Smart Matching** - AI-powered candidate-job matching
- **Sentiment Analysis** - Interview response analysis

### 🎨 UI/UX

- **Modern Design** - Clean, Resend-inspired interface
- **Dark/Light Mode** - Full theme support (default: light)
- **Responsive** - Mobile-first design for all screen sizes
- **Animations** - Smooth transitions with Framer Motion

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Tables:** [TanStack Table v8](https://tanstack.com/table)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide Icons](https://lucide.dev/)

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth route group
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   ├── (dashboard)/         # Dashboard route group
│   │   ├── jobs/            # Job management pages
│   │   ├── applications/    # Application tracking
│   │   ├── candidates/      # Candidate database
│   │   ├── interviews/      # Interview management
│   │   ├── Questionnaire/   # Questionnaire builder
│   │   └── settings/        # User/company settings
│   ├── about/               # About page
│   ├── contact-us/          # Contact page
│   └── page.tsx             # Homepage
├── components/
│   ├── global/              # Reusable components
│   │   ├── FormFields.tsx   # Form input components
│   │   ├── DataTable.tsx    # TanStack table wrapper
│   │   └── UIComponents.tsx # Status badges, cards, etc.
│   ├── home/                # Homepage sections
│   ├── layout/              # Layout components
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── types/               # TypeScript definitions
│   ├── data/                # Mock data for development
│   ├── context/             # React context providers
│   └── utils.ts             # Utility functions
└── hooks/                   # Custom React hooks
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/plavist-client.git
   cd plavist-client
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

Use these credentials to test the dashboard:

- **Email:** `demo@plavist.com`
- **Password:** `demo123`

## 📄 Pages Overview

| Route                | Description                    |
| -------------------- | ------------------------------ |
| `/`                  | Homepage with features and CTA |
| `/login`             | User login                     |
| `/register`          | User registration              |
| `/jobs`              | Dashboard overview             |
| `/jobs/all`          | All jobs list                  |
| `/jobs/new`          | Create new job                 |
| `/jobs/[id]`         | Job details                    |
| `/applications`      | Application management         |
| `/candidates`        | Candidate database             |
| `/interviews`        | Interview scheduling           |
| `/Questionnaire`     | Questionnaire list             |
| `/Questionnaire/new` | Create questionnaire           |
| `/settings`          | Account settings               |

## 🧩 Component Library

### Form Fields

```tsx
import { TextInput, SelectInput, TextAreaInput, ArrayInput } from "@/components/global";

<TextInput label="Job Title" value={title} onChange={handleChange} required />
<SelectInput label="Department" options={departments} value={dept} onChange={handleChange} />
```

### Data Table

```tsx
import { DataTable, DataTableColumnHeader } from "@/components/global";

<DataTable
  columns={columns}
  data={data}
  searchKey="title"
  searchPlaceholder="Search..."
  pageSize={10}
/>;
```

### UI Components

```tsx
import { StatusBadge, StatsCard, PageHeader, EmptyState, ScoreIndicator } from "@/components/global";

<StatusBadge status="published" />
<StatsCard title="Total Jobs" value={42} icon={Briefcase} trend={{ value: 12, isPositive: true }} />
<ScoreIndicator score={85} showLabel />
```

## 🎨 Theming

The app uses Tailwind CSS v4 with oklch color system. Theme variables are in `globals.css`:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  /* ... */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
}
```

## 📊 Mock Data

Development uses mock data from `/src/lib/data/mockData.ts`:

```typescript
import {
  jobs,
  applications,
  candidates,
  questionnaires,
} from "@/lib/data/mockData";

// Helper functions
import {
  getJobById,
  getCandidateById,
  getApplicationsByJob,
} from "@/lib/data/mockData";
```

## 🔌 API Integration

Currently using mock data. To integrate with the backend:

1. Replace mock data imports with API calls
2. Use the service layer in `/src/lib/services/`
3. Configure API base URL in environment variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Collapsible sidebar on mobile
- Touch-friendly interactions

## 🧪 Development

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ by the Plavist Team

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
