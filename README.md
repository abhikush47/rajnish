# Rajnish Kushwaha — Official Website

Modern political & social leadership website for **Rajnish Kushwaha**, Gen-Z social worker, emerging youth politician, and founder of **RMoksha NGO** from Kalikamai Gaupalika, Parsa, Nepal.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | JavaScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| 3D | React Three Fiber + Drei |
| i18n | next-intl (Nepali + English) |
| Forms | React Hook Form |
| Database | Firebase Firestore |
| Icons | Lucide React |

---

## 📁 Folder Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.js          # Locale layout with NextIntlClientProvider
│   │   ├── page.js            # Homepage
│   │   ├── about/             # About Rajnish
│   │   ├── rmoksha/           # RMoksha NGO page
│   │   ├── campaigns/         # Social campaigns
│   │   ├── manifesto/         # Digital manifesto
│   │   ├── mayor-2084/        # Mayor candidate page
│   │   ├── volunteer/         # Volunteer registration
│   │   ├── youth-ideas/       # Youth ideas submission
│   │   ├── gallery/           # Photo gallery
│   │   ├── news/              # News page
│   │   └── contact/           # Contact page
│   ├── layout.js              # Root layout
│   └── page.js                # Root redirect to /ne
├── components/
│   ├── layout/
│   │   ├── Navbar.js          # Responsive navbar with lang toggle
│   │   └── Footer.js          # Footer with links & socials
│   ├── sections/
│   │   ├── HeroSection.js     # Animated hero with stats counter
│   │   ├── VisionSection.js   # 4 vision pillars
│   │   ├── RMokshaTeaser.js   # NGO intro section
│   │   ├── CampaignHighlights.js # Campaign cards
│   │   └── MayorTeaser.js     # Mayor 2084 teaser
│   └── ui/
│       └── MarqueeTicker.js   # Scrolling ticker
├── lib/
│   ├── utils.js               # Utility functions & animation variants
│   └── firebase.js            # Firebase config & helpers
├── styles/
│   └── globals.css            # Global CSS + Tailwind
├── i18n.js                    # next-intl configuration
└── middleware.js              # i18n routing middleware
messages/
├── ne.json                    # Nepali translations
└── en.json                    # English translations
```

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.local.example .env.local
# Fill in your Firebase credentials
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/ne` (Nepali) by default.

- Nepali: [http://localhost:3000/ne](http://localhost:3000/ne)
- English: [http://localhost:3000/en](http://localhost:3000/en)

---

## 🌐 Language Switching

- Default language: **Nepali (ne)**
- Toggle via the **EN / नेपाली** button in the navbar
- Routing: `/ne/*` for Nepali, `/en/*` for English
- All translations in `messages/ne.json` and `messages/en.json`

---

## 🎨 Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `primary-700` | `#c80d0d` | Main red brand |
| `primary-400` | `#ff6b6b` | Accents, links |
| `gold-400` | `#fbbf24` | Star/award accents |
| `dark-950` | `#0a0a0a` | Background |

### Fonts
- **Display**: Bebas Neue (headers, English)
- **Body**: Barlow (body text)
- **Nepali**: Noto Sans Devanagari
- **Mono**: JetBrains Mono

---

## 🔥 Firebase Setup

1. Create a project at [firebase.google.com](https://firebase.google.com)
2. Enable **Firestore Database**
3. Enable **Storage** (for gallery uploads)
4. Copy your config to `.env.local`

Collections auto-created on first submission:
- `volunteers` — volunteer registrations
- `youth_ideas` — idea submissions
- `contacts` — contact form messages

---

## 📦 Next Steps (To Complete)

- [ ] Add actual photos/images to `/public/images/`
- [ ] Implement 3D Nepal map using React Three Fiber
- [ ] Build full Gallery page with image grid
- [ ] Expand Campaigns page with all project details
- [ ] Complete RMoksha NGO page with programs
- [ ] Add Youth Ideas form with Firebase save
- [ ] Implement News page with CMS or static articles
- [ ] Add Google Maps to Contact page
- [ ] Wire all forms to Firebase
- [ ] Deploy to Vercel

---

## 🚀 Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Set environment variables in Vercel Dashboard > Project > Settings > Environment Variables.

---

## 📱 Pages

| Route | Page |
|-------|------|
| `/ne` or `/en` | Homepage |
| `/ne/about` | About Rajnish |
| `/ne/rmoksha` | RMoksha NGO |
| `/ne/campaigns` | Social Campaigns |
| `/ne/manifesto` | Digital Manifesto |
| `/ne/mayor-2084` | Mayor Candidate 2084 |
| `/ne/volunteer` | Volunteer Registration |
| `/ne/youth-ideas` | Youth Ideas Form |
| `/ne/gallery` | Photo Gallery |
| `/ne/news` | News |
| `/ne/contact` | Contact |

---

*Built with ❤️ in Nepal for Rajnish Kushwaha*
