import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { ReactNode, FormEvent } from 'react';
import { motion, useMotionValue, useSpring, useScroll, useTransform, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import Lenis from 'lenis';

const MiniGhost = lazy(() => import('@/components/MiniGhost'));
const AmbientSparkles = lazy(() => import('@/components/AmbientSparkles'));
const OrderWizard = lazy(() => import('@/components/OrderWizard'));
import MeshArt from '@/components/MeshArt';
import BlobArt from '@/components/BlobArt';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type Lang = 'en' | 'uk';
type ServiceId = 'landing' | 'corporate' | 'shop' | 'uxui' | 'frontend' | 'branding' | 'launch' | 'support' | 'seo';
type Page = 'home' | 'projects' | 'about' | 'services' | 'contact' | 'case-mzshop' | ServiceId;

/* ------------------------------------------------------------------ */
/* Translations                                                        */
/* ------------------------------------------------------------------ */
interface Copy {
  descriptor: string;
  basedIn: string;
  scroll: string;
  navProjects: string;
  navAbout: string;
  navServices: string;
  navContact: string;
  selectedWork: string;
  mzshopDesc: string;
  moreWork: string;
  about: string;
  noteOnProcess: string;
  aboutMain: string;
  aboutSub: string;
  skills: string[];
  orderBtn: string;
  contact: string;
  letsBuild: string;
  emailSub: string;
  tgSub: string;
  footerYear: string;
  howItWorks: string;
  howSteps: { step: string; desc: string }[];
  ctaButton: string;
  ctaBig: string;
  ctaBigSub: string;
  servicesTitle: string;
  ctaSubtle: string;
  ctaHeading: string;
  ctaDesc: string;
}

const T: Record<Lang, Copy> = {
  en: {
    descriptor: 'web design · development',
    basedIn: 'solitary practice, based in kyiv',
    scroll: 'scroll',
    navProjects: 'Projects',
    navAbout: 'Team',
    navServices: 'Services',
    navContact: 'Contact',
    selectedWork: 'Selected Work',
    mzshopDesc: 'Online jewelry store — earrings catalog, elegant dark gold aesthetic. Ukrainian e-shop built for a quiet kind of luxury.',
    moreWork: 'more work, arriving quietly',
    about: 'About',
    noteOnProcess: 'a note on process',
    aboutMain: 'Hi! I build websites. I design, code, and launch them.',
    aboutSub: 'I started my journey in web development recently, but I\u2019ve already realized: this is the work I want to do every day. I love watching a blank screen transform into a finished, beautiful, functional website. I\u2019m open to new projects and interesting challenges. I always work for results\u00a0\u2014 so that each of my next websites is better than the previous one!',
    skills: ['web design', 'front-end development', 'ui / ux', 'launch'],
    orderBtn: 'Order a website',
    contact: 'Contact',
    letsBuild: "Let\u2019s build something.",
    emailSub: 'email',
    tgSub: 'telegram',
    footerYear: '\u00a9 boohx 2026',
    howItWorks: 'How it works',
    howSteps: [
      { step: 'Consultation', desc: 'We discuss your goals, audience and wishes. Completely free.' },
      { step: 'Strategy', desc: 'I analyze competitors, define the structure and plan the work.' },
      { step: 'Design', desc: 'I create the design in Figma, aligned with your brand.' },
      { step: 'Development', desc: 'I build the site — responsive, fast, and production-ready.' },
      { step: 'Launch', desc: 'We deploy the site on your domain. Done and ready to work.' },
    ],
    ctaButton: 'Message on Telegram',
    ctaBig: 'Have an idea?',
    ctaBigSub: "let\u2019s talk.",
    servicesTitle: 'Services',
    ctaSubtle: "don't know where to start?",
    ctaHeading: 'Free consultation',
    ctaDesc: 'Describe your task in Telegram — the service you need, timeline, rough budget. I\u2019ll get back to you shortly.',
  },
  uk: {
    descriptor: 'веб-дизайн · розробка',
    basedIn: 'самостійна практика, київ',
    scroll: 'гортай',
    navProjects: 'Проєкти',
    navAbout: 'Команда',
    navServices: 'Послуги',
    navContact: 'Контакт',
    selectedWork: 'Роботи',
    mzshopDesc: 'Онлайн-магазин прикрас — каталог сережок, елегантна темно-золота естетика. Украïнський e-shop для тихої розкоші.',
    moreWork: 'більше робіт — скоро',
    about: 'Про мене',
    noteOnProcess: 'про процес',
    aboutMain: 'Привіт! Я роблю сайти. Дизайню, верстаю та запускаю їх у життя.',
    aboutSub: 'Я почав свій шлях у веб-розробці зовсім нещодавно, але вже встиг зрозуміти: це справа, якою я хочу займатися щодня. Мені подобається бачити, як чистий екран перетворюється на готовий, красивий та функціональний сайт. Я відкритий до нових замовлень та цікавих викликів. Завжди працюю на результат, щоб кожен мій наступний сайт був кращим за попередній!',
    skills: ['веб-дизайн', 'фронтенд-розробка', 'ui / ux', 'запуск'],
    orderBtn: 'Замовити сайт',
    contact: 'Контакт',
    letsBuild: 'Побудуємо щось разом.',
    emailSub: 'пошта',
    tgSub: 'телеграм',
    footerYear: '\u00a9 boohx 2026',
    howItWorks: 'Як це працює',
    howSteps: [
      { step: 'Консультація', desc: 'Обговорюємо задачу, цілі та побажання. Повністю безкоштовно.' },
      { step: 'Стратегія', desc: 'Аналізую конкурентів, структурую контент та складаю план робіт.' },
      { step: 'Дизайн', desc: 'Розробляю дизайн у Figma з урахуванням вашого бренду.' },
      { step: 'Розробка', desc: 'Верстаю та програмую сайт — адаптивно, швидко, акуратно.' },
      { step: 'Запуск', desc: 'Розгортаємо сайт на вашому домені. Все готово до роботи.' },
    ],
    ctaButton: 'Написати в Telegram',
    ctaBig: 'Маєш ідею?',
    ctaBigSub: 'поговорімо.',
    servicesTitle: 'Послуги',
    ctaSubtle: 'не знаєш з чого почати?',
    ctaHeading: 'Безкоштовна консультація',
    ctaDesc: 'Опиши задачу в Telegram — потрібну послугу, терміни, орієнтовний бюджет. Зв\u02bfяжусь найближчим часом.',
  },
};

/* ------------------------------------------------------------------ */
/* Services data                                                       */
/* ------------------------------------------------------------------ */
const PRICING_TIERS = [
  {
    id: 'mini',
    price: '2 000 ₴',
    recommended: false,
    uk: {
      name: 'Міні',
      items: ['Односторінковий сайт (лендінг) без бота', 'Розміщення на безкоштовній платформі'],
    },
    en: {
      name: 'Mini',
      items: ['One-page landing site, no bot', 'Hosted on a free platform'],
    },
  },
  {
    id: 'basic',
    price: '3 500 ₴',
    term: { uk: '3-5 днів', en: '3-5 days' },
    tabLabel: { uk: 'Швидко', en: 'Fast' },
    recommended: false,
    uk: {
      name: 'Базовий',
      items: [
        'Повна розробка сайту (поточну версію макета вже можна дивитись)',
        'Запуск та налаштування одного головного Telegram-бота',
        'Розміщення на безкоштовній платформі — без щомісячної плати за сервери',
      ],
    },
    en: {
      name: 'Basic',
      items: [
        'Full website build (current mockup already viewable)',
        'Launch and setup of one main Telegram bot',
        'Hosted on a free platform — no monthly server fees',
      ],
    },
  },
  {
    id: 'optimal',
    price: '4 500 ₴',
    term: { uk: '5-9 днів', en: '5-9 days' },
    tabLabel: { uk: 'Щоб знаходили в Google', en: 'Found on Google' },
    recommended: true,
    uk: {
      name: 'Оптимальний',
      items: [
        'Повна розробка сайту + фінальні правки під побажання',
        'Запуск і синхронізація обох Telegram-ботів окремо',
        'Стабільна робота без щомісячних абонплат за хостинг',
        'Базове тестування системи перед фінальною здачею',
      ],
    },
    en: {
      name: 'Optimal',
      items: [
        'Full website build + final revisions to your requests',
        'Launch and sync of both Telegram bots separately',
        'Stable setup with no monthly hosting fees',
        'Basic QA testing before final handoff',
      ],
    },
  },
  {
    id: 'max',
    price: '6 500 ₴',
    term: { uk: '9-14 днів', en: '9-14 days' },
    tabLabel: { uk: 'Максимум', en: 'Maximum' },
    recommended: false,
    uk: {
      name: 'Максимум',
      items: [
        'Усе, що в тарифі «Оптимальний»',
        'Розміщення на окремому виділеному сервері (VPS) для швидкості та стабільності 24/7',
        '1 місяць технічної підтримки після запуску',
      ],
    },
    en: {
      name: 'Max',
      items: [
        'Everything in the Optimal tier',
        'Deployed on a dedicated VPS for 24/7 speed and stability',
        '1 month of technical support after launch',
      ],
    },
  },
  {
    id: 'premium',
    price: '9 000 ₴',
    recommended: false,
    uk: {
      name: 'Преміум',
      items: [
        'Усе, що в тарифі «Максимум»',
        '3 місяці технічної підтримки замість одного',
        'Один додатковий раунд дизайн-правок після запуску',
        'Пріоритетна відповідь на звернення',
      ],
    },
    en: {
      name: 'Premium',
      items: [
        'Everything in the Max tier',
        '3 months of support instead of 1',
        'One extra round of design tweaks after launch',
        'Priority response on requests',
      ],
    },
  },
];

const TARIFF_TABS = [
  {
    id: 'basic',
    price: '3 500 ₴',
    uk: { tabLabel: 'Швидко', name: 'Базовий', tagline: 'Хочеш сайт швидко і без зайвого клопоту', term: '3-5 днів', items: [
      'Повна розробка сайту (поточну версію макета вже можна дивитись)',
      'Запуск та налаштування одного головного Telegram-бота',
      'Розміщення на безкоштовній платформі — без щомісячної плати за сервери',
    ] },
    en: { tabLabel: 'Fast', name: 'Basic', tagline: 'Want a site fast, without extra hassle', term: '3-5 days', items: [
      'Full website build (current mockup already viewable)',
      'Launch and setup of one main Telegram bot',
      'Hosted on a free platform — no monthly server fees',
    ] },
  },
  {
    id: 'optimal',
    price: '4 500 ₴',
    uk: { tabLabel: 'Щоб знаходили в Google', name: 'Оптимальний', tagline: 'Хочеш щоб твій сайт знаходили в Google', term: '5-9 днів', items: [
      'Повна розробка сайту + фінальні правки під побажання',
      'Запуск і синхронізація обох Telegram-ботів окремо',
      'Стабільна робота без щомісячних абонплат за хостинг',
      'Базове тестування системи перед фінальною здачею',
    ] },
    en: { tabLabel: 'Found on Google', name: 'Optimal', tagline: 'Want your site to actually rank on Google', term: '5-9 days', items: [
      'Full website build + final revisions to your requests',
      'Launch and sync of both Telegram bots separately',
      'Stable setup with no monthly hosting fees',
      'Basic QA testing before final handoff',
    ] },
  },
  {
    id: 'max',
    price: '6 500 ₴',
    uk: { tabLabel: 'Максимум', name: 'Максимум', tagline: "Хочеш щоб сайт справляв вау-ефект і запам'ятовувався", term: '9-14 днів', items: [
      'Усе, що в тарифі «Оптимальний»',
      'Розміщення на окремому виділеному сервері (VPS) для швидкості та стабільності 24/7',
      '1 місяць технічної підтримки після запуску',
    ] },
    en: { tabLabel: 'Maximum', name: 'Max', tagline: 'Want the site to leave a real impression', term: '9-14 days', items: [
      'Everything in the Optimal tier',
      'Deployed on a dedicated VPS for 24/7 speed and stability',
      '1 month of technical support after launch',
    ] },
  },
];

const SERVICES = [
  {
    id: 'landing',
    en: { title: 'Landing Pages', short: 'One page — maximum conversion.', detail: 'A focused landing page built to promote a product or service. Fast, responsive, and structured to guide the visitor to a single clear action.', stats: [
      { value: '1 day', label: 'minimum timeline' },
      { value: '90+', label: 'PageSpeed on mobile' },
      { value: '60 days', label: 'support included' },
    ] },
    uk: { title: 'Розробка лендингів', short: 'Одна сторінка — максимум конверсії.', detail: 'Ефективна цільова сторінка для просування продукту або послуги. Швидка, адаптивна, зі структурою, що веде відвідувача до дії.', stats: [
      { value: '1 день', label: 'мінімальний термін' },
      { value: '90+', label: 'PageSpeed на мобільному' },
      { value: '60 днів', label: 'підтримки максимум' },
    ] },
  },
  {
    id: 'corporate',
    en: { title: 'Corporate Websites', short: 'Your brand online — serious.', detail: 'Multi-page representative website for a company or brand. Built with a CMS so you can update content yourself without calling a developer.', stats: [
      { value: '3 days', label: 'minimum timeline' },
      { value: '90+', label: 'PageSpeed on mobile' },
      { value: '60 days', label: 'support included' },
    ] },
    uk: { title: 'Корпоративні сайти', short: 'Ваш бренд в інтернеті — серйозно.', detail: 'Багатосторінковий представницький сайт для компанії або бренду. Із CMS — щоб ви могли самостійно оновлювати контент без розробника.', stats: [
      { value: '3 дні', label: 'мінімальний термін' },
      { value: '90+', label: 'PageSpeed на мобільному' },
      { value: '60 днів', label: 'підтримки максимум' },
    ] },
  },
  {
    id: 'shop',
    en: { title: 'Online Stores', short: 'Full e-commerce, ready from day one.', detail: 'Complete online store with catalog, cart and payment integration. Optimized for speed and designed to drive sales from the moment of launch.', stats: [
      { value: '5 days', label: 'minimum timeline' },
      { value: '85+', label: 'PageSpeed on mobile' },
      { value: '60 days', label: 'support included' },
    ] },
    uk: { title: 'Інтернет-магазини', short: 'Повноцінний e-commerce з першого дня.', detail: 'Готовий магазин із каталогом, кошиком та підключенням оплати. Оптимізований для продажів та швидкої роботи з моменту запуску.', stats: [
      { value: '5 днів', label: 'мінімальний термін' },
      { value: '85+', label: 'PageSpeed на мобільному' },
      { value: '60 днів', label: 'підтримки максимум' },
    ] },
  },
  {
    id: 'uxui',
    en: { title: 'UX / UI Design', short: 'Interfaces that guide, not confuse.', detail: "Wireframes, prototypes and final Figma designs. Clean interfaces built around the user's intent — every click leads somewhere meaningful.", stats: [
      { value: '2 days', label: 'minimum timeline' },
      { value: 'Figma', label: 'delivery format' },
      { value: '2', label: 'revision rounds' },
    ] },
    uk: { title: 'UX / UI дизайн', short: 'Інтерфейси, що ведуть, а не плутають.', detail: 'Вайрфрейми, прототипи та фінальний дизайн у Figma. Зрозумілий інтерфейс, побудований навколо мети користувача.', stats: [
      { value: '2 дні', label: 'мінімальний термін' },
      { value: 'Figma', label: 'формат передачі' },
      { value: '2', label: 'раунди правок' },
    ] },
  },
  {
    id: 'frontend',
    en: { title: 'Front-end Development', short: 'Turning design into a working site.', detail: 'I build the interface in code — responsive, fast, and true to the design. Clean, maintainable front-end that actually works the way it looks.', stats: [
      { value: '3 days', label: 'minimum timeline' },
      { value: '90+', label: 'PageSpeed on mobile' },
      { value: '30 days', label: 'support included' },
    ] },
    uk: { title: 'Frontend-розробка', short: 'Перетворюю дизайн на робочий сайт.', detail: 'Верстаю та програмую інтерфейс — адаптивно, швидко, у точній відповідності до дизайну. Чистий, підтримуваний код.', stats: [
      { value: '3 дні', label: 'мінімальний термін' },
      { value: '90+', label: 'PageSpeed на мобільному' },
      { value: '30 днів', label: 'підтримки максимум' },
    ] },
  },
  {
    id: 'branding',
    en: { title: 'Branding & Identity', short: 'A mark that means something.', detail: 'Logo, color palette, typography and brand guidelines. A consistent visual language across every touchpoint — web, print, social media.', stats: [
      { value: '4 days', label: 'minimum timeline' },
      { value: '3+', label: 'concepts to choose from' },
      { value: '1', label: 'brand guideline file' },
    ] },
    uk: { title: 'Брендинг + айдентика', short: 'Знак, що щось означає.', detail: 'Логотип, палітра, шрифти та гайдлайн бренду. Єдиний стиль для всіх точок контакту — сайт, друк, соцмережі.', stats: [
      { value: '4 дні', label: 'мінімальний термін' },
      { value: '3+', label: 'концепти на вибір' },
      { value: '1', label: 'файл гайдлайну' },
    ] },
  },
  {
    id: 'launch',
    en: { title: 'Website Launch', short: 'From finished build to production.', detail: 'Domain setup, hosting, final checks and going live. I make sure the site is genuinely ready for real visitors before launch day.', stats: [
      { value: '1 day', label: 'minimum timeline' },
      { value: '90+', label: 'PageSpeed on mobile' },
      { value: '0', label: 'downtime at launch' },
    ] },
    uk: { title: 'Запуск сайту', short: 'Від готової збірки до production.', detail: 'Налаштування домену, хостингу, фінальна перевірка та вихід у продакшн. Переконуюсь, що сайт справді готовий до реальних відвідувачів.', stats: [
      { value: '1 день', label: 'мінімальний термін' },
      { value: '90+', label: 'PageSpeed на мобільному' },
      { value: '0', label: 'простою при запуску' },
    ] },
  },
  {
    id: 'support',
    en: { title: 'Ongoing Support', short: 'Help after the site goes live.', detail: 'Updates, fixes, and small improvements after launch — so the site keeps working and growing instead of gathering dust.', stats: [
      { value: '24h', label: 'response time' },
      { value: '60 days', label: 'covered minimum' },
      { value: '∞', label: 'small fixes included' },
    ] },
    uk: { title: 'Підтримка сайту', short: 'Допомога після запуску.', detail: 'Оновлення, виправлення та невеликі покращення після запуску — щоб сайт не пилився, а розвивався.', stats: [
      { value: '24г', label: 'час відповіді' },
      { value: '60 днів', label: 'мінімальне покриття' },
      { value: '∞', label: 'дрібних правок' },
    ] },
  },
  {
    id: 'seo',
    en: { title: 'SEO Optimization', short: 'Found on Google, not buried.', detail: 'Technical SEO, meta tags, site structure and speed optimization. So your target audience finds you without you having to chase them.', stats: [
      { value: '5 days', label: 'minimum timeline' },
      { value: '90+', label: 'PageSpeed on mobile' },
      { value: '30 days', label: 'support included' },
    ] },
    uk: { title: 'SEO-оптимізація', short: 'Знайдуть в Google, а не в його надрах.', detail: 'Технічне SEO, мета-теги, структура та швидкість сайту. Щоб ваша аудиторія знаходила вас сама.', stats: [
      { value: '5 днів', label: 'мінімальний термін' },
      { value: '90+', label: 'PageSpeed на мобільному' },
      { value: '30 днів', label: 'підтримки максимум' },
    ] },
  },
];

/* ------------------------------------------------------------------ */
/* Cursor glow                                                         */
/* ------------------------------------------------------------------ */
function CursorGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { damping: 30, stiffness: 200, mass: 0.4 });
  const springY = useSpring(y, { damping: 30, stiffness: 200, mass: 0.4 });

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-[340px] w-[340px] rounded-full mix-blend-screen md:block"
      style={{
        translateX: springX,
        translateY: springY,
        x: '-50%',
        y: '-50%',
        background: 'radial-gradient(circle, hsl(var(--primary) / 0.10) 0%, hsl(var(--primary) / 0.03) 45%, transparent 70%)',
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Language toggle                                                     */
/* ------------------------------------------------------------------ */
function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.92 }}
      data-testid="button-lang-toggle"
      className="flex items-center gap-[3px] rounded-sm font-sans text-[11px] uppercase tracking-[0.25em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
      aria-label={lang === 'uk' ? 'Перемкнути мову на англійську' : 'Switch language to Ukrainian'}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={lang}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
          className="text-[hsl(var(--primary))]"
        >
          {lang === 'en' ? 'EN' : 'UA'}
        </motion.span>
      </AnimatePresence>
      <span className="opacity-30">/</span>
      <span className="opacity-40">{lang === 'en' ? 'UA' : 'EN'}</span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Hamburger button (mobile)                                          */
/* ------------------------------------------------------------------ */
function HamburgerButton({ onClick, isOpen, lang }: { onClick: () => void; isOpen: boolean; lang: Lang }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      data-testid="button-mobile-menu"
      className="flex h-11 w-11 flex-col items-end justify-center gap-[5px] p-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
      aria-label={isOpen ? (lang === 'uk' ? 'Закрити меню' : 'Close menu') : (lang === 'uk' ? 'Відкрити меню' : 'Open menu')}
      aria-expanded={isOpen}
    >
      <motion.span
        className="h-px bg-[hsl(var(--foreground))] origin-right"
        animate={{ width: '100%', rotate: isOpen ? -45 : 0, y: isOpen ? 6 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.span
        className="h-px bg-[hsl(var(--foreground))] origin-right"
        animate={{ width: '68%', opacity: isOpen ? 0 : 1, x: isOpen ? 10 : 0 }}
        transition={{ duration: 0.25 }}
      />
      <motion.span
        className="h-px bg-[hsl(var(--foreground))] origin-right"
        animate={{ width: '100%', rotate: isOpen ? 45 : 0, y: isOpen ? -6 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile menu overlay                                                 */
/* ------------------------------------------------------------------ */
function MobileMenu({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  lang,
  onToggleLang,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  lang: Lang;
  onToggleLang: () => void;
  t: Copy;
}) {
  const navItems: { page: Page; label: string }[] = [
    { page: 'home', label: 'boohx™' },
    { page: 'projects', label: t.navProjects },
    { page: 'services', label: t.navServices },
    { page: 'about', label: t.navAbout },
    { page: 'contact', label: t.navContact },
  ];

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'uk' ? 'Меню навігації' : 'Navigation menu'}
          initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
          animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
          exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[90] flex flex-col bg-[hsl(var(--background))]"
        >
          {/* top bar */}
          <div className="flex items-center justify-between px-8 pt-8 pb-4">
            <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">boohx™</span>
            <div className="flex items-center gap-5">
              <LangToggle lang={lang} onToggle={onToggleLang} />
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                data-testid="button-close-mobile-menu"
                className="rounded-sm font-sans text-[11px] uppercase tracking-[0.25em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
              >
                {lang === 'uk' ? 'Закрити' : 'Close'} ✕
              </motion.button>
            </div>
          </div>

          {/* nav list */}
          <nav className="flex-1 flex flex-col justify-center px-8 gap-2">
            {navItems.slice(1).map((item, i) => (
              <motion.button
                key={item.page}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.05 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => { onNavigate(item.page); onClose(); }}
                aria-current={currentPage === item.page ? 'page' : undefined}
                data-testid={`link-mobile-nav-${item.page}`}
                className="text-left border-b border-[hsl(var(--border))] py-6 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
              >
                <span
                  className="font-serif italic transition-colors duration-300 group-hover:text-[hsl(var(--primary))]"
                  style={{
                    fontSize: 'clamp(2.2rem, 8vw, 3.5rem)',
                    color: currentPage === item.page ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                  }}
                >
                  {item.label}
                </span>
              </motion.button>
            ))}
          </nav>

          {/* footer */}
          <div className="px-8 pb-10 font-sans text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
            {t.footerYear}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Top navigation bar                                                  */
/* ------------------------------------------------------------------ */
function TopNav({
  currentPage,
  onNavigate,
  lang,
  onToggleLang,
}: {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  lang: Lang;
  onToggleLang: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { page: Page; label: string }[] = [
    { page: 'home', label: lang === 'uk' ? 'Головна' : 'Home' },
    { page: 'projects', label: lang === 'uk' ? 'Проєкти' : 'Projects' },
    { page: 'services', label: lang === 'uk' ? 'Послуги' : 'Services' },
    { page: 'about', label: lang === 'uk' ? 'Команда' : 'Team' },
    { page: 'contact', label: lang === 'uk' ? 'Контакт' : 'Contact' },
  ];

  const t = T[lang];

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-10 md:py-6">
        {/* Logo */}
        <motion.button
          onClick={() => onNavigate('home')}
          data-testid="link-logo"
          className="rounded-sm font-sans text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
          whileTap={{ scale: 0.95 }}
        >
          boohx™
        </motion.button>

        {/* Desktop centered nav pills */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background)_/_0.7)] px-3 py-1.5 backdrop-blur-sm">
          {navItems.map((item) => (
            <motion.button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              whileTap={{ scale: 0.95 }}
              aria-current={currentPage === item.page ? 'page' : undefined}
              data-testid={`link-nav-${item.page}`}
              className="relative rounded-full px-4 py-1.5 font-sans text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
              style={{
                color: currentPage === item.page
                  ? 'hsl(var(--foreground))'
                  : 'hsl(var(--muted-foreground))',
              }}
            >
              {currentPage === item.page && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-[hsl(var(--border))]"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Desktop right: lang toggle */}
        <div className="hidden md:flex items-center">
          <LangToggle lang={lang} onToggle={onToggleLang} />
        </div>

        {/* Mobile: lang + hamburger */}
        <div className="flex md:hidden items-center gap-4">
          <LangToggle lang={lang} onToggle={onToggleLang} />
          <HamburgerButton onClick={() => setMobileOpen((o) => !o)} isOpen={mobileOpen} lang={lang} />
        </div>
      </header>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        currentPage={currentPage}
        onNavigate={onNavigate}
        lang={lang}
        onToggleLang={onToggleLang}
        t={t}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Page transition wrapper                                            */
/* ------------------------------------------------------------------ */
const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function PageWrap({ children, pageKey }: { children: ReactNode; pageKey: string }) {
  return (
    <motion.div
      key={pageKey}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-[100dvh] w-full"
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* HOME page                                                           */
/* ------------------------------------------------------------------ */
function HomePage({ t, lang, onViewWork }: { t: Copy; lang: Lang; onViewWork: () => void }) {
  const letters = 'boohx'.split('');

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-6">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <MeshArt className="absolute inset-0 h-full w-full opacity-70" />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[70vw] w-[70vw] max-h-[900px] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.09) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="noise-overlay absolute inset-0 opacity-[0.035]" />
      </div>

      {/* Mini ghost — faceless, small, right side */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[4%] top-[18%] z-0 md:right-[8%]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ width: 'clamp(48px, 6vw, 88px)' }}>
          <Suspense fallback={null}>
            <MiniGhost />
          </Suspense>
        </div>
      </motion.div>

      {/* Hero text */}
      <div className="relative z-10 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={t.descriptor}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="mb-6 font-sans text-[10px] uppercase tracking-[0.5em] text-[hsl(var(--muted-foreground))] md:text-xs"
          >
            {t.descriptor}
          </motion.p>
        </AnimatePresence>

        <h1 className="flex select-none font-serif italic leading-[0.82] text-[hsl(var(--foreground))]">
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 90, rotate: -3 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 1.1, delay: 0.35 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-[19vw] bg-gradient-to-b from-[hsl(var(--foreground))] to-[hsl(var(--foreground)_/_0.55)] bg-clip-text text-transparent md:text-[16vw]"
              style={i === letters.length - 1 ? { color: 'hsl(var(--primary) / 0.85)', WebkitTextFillColor: 'hsl(var(--primary) / 0.85)' } : undefined}
            >
              {letter}
            </motion.span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mt-8 flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.35em] text-[hsl(var(--muted-foreground))]"
        >
          <span className="text-[hsl(var(--primary))]">est.</span>
          <AnimatePresence mode="wait">
            <motion.span key={t.basedIn} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }}>
              {t.basedIn}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        <motion.button
          type="button"
          onClick={onViewWork}
          data-testid="link-hero-cta"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ gap: '1rem' }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="mt-10 flex items-center gap-3 rounded-sm border-b border-[hsl(var(--foreground)_/_0.4)] pb-1.5 font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
        >
          {lang === 'uk' ? 'Дивитись роботи' : 'View the work'}
          <span aria-hidden>→</span>
        </motion.button>
      </div>

      {/* Bottom descriptor */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute bottom-8 right-8 z-10 hidden md:flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--muted-foreground))]"
      >
        <span className="text-[hsl(var(--primary))]">веб-дизайн</span>
        <span className="opacity-30">·</span>
        <span>розробка</span>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PROJECTS page                                                       */
/* ------------------------------------------------------------------ */
function ProjectCard({ t, onOpen }: { t: Copy; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid="link-project-mzshop"
      className="group relative block w-full border-y border-[hsl(var(--border))] py-10 text-left transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_60px_-14px_hsl(var(--primary)_/_0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] md:py-14"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-14">
        <div className="flex items-start gap-6 md:w-1/2">
          <span
            className="shrink-0 font-serif italic leading-none text-[hsl(var(--muted-foreground)_/_0.35)] transition-colors duration-500 group-hover:text-[hsl(var(--primary)_/_0.55)]"
            style={{ fontSize: 'clamp(3.5rem, 9vw, 7rem)' }}
          >
            01
          </span>
          <div className="pt-2 md:pt-3">
            <h3 className="font-serif text-3xl italic text-[hsl(var(--foreground))] md:text-5xl">mzshop.xyz</h3>
            <AnimatePresence mode="wait">
              <motion.p
                key={t.mzshopDesc}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35 }}
                className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-[hsl(var(--muted-foreground))]"
              >
                {t.mzshopDesc}
              </motion.p>
            </AnimatePresence>
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-sans text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
              <span>e-commerce</span><span>·</span><span>ui / ux</span><span>·</span><span>front-end</span>
            </div>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden md:w-1/2">
          <motion.div
            className="h-full w-full"
            style={{ background: 'linear-gradient(135deg, #0f0e10 0%, #1a1619 30%, #241e1a 60%, #0d0c0e 100%)' }}
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem', color: '#c9a961', opacity: 0.35, letterSpacing: '0.15em', fontStyle: 'italic' }}>mzshop</span>
            </div>
          </motion.div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(var(--background)_/_0.5)] via-transparent to-transparent" />
          <div className="absolute bottom-4 right-4">
            <span className="relative flex items-center gap-2 bg-[hsl(var(--background)_/_0.55)] px-3 py-1.5 backdrop-blur-sm font-sans text-xs text-[hsl(var(--foreground))] uppercase tracking-[0.3em]">
              Case study
              <motion.span animate={{ x: hovered ? 5 : 0 }} transition={{ duration: 0.4 }}>→</motion.span>
            </span>
          </div>
        </div>
      </div>
      <motion.span
        aria-hidden
        className="absolute -bottom-px left-0 h-px bg-[hsl(var(--primary))]"
        initial={{ width: '0%' }}
        animate={{ width: hovered ? '100%' : '0%' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </button>
  );
}

function BotCard({ num, handle, tagUk, tagEn, titleUk, titleEn, descUk, descEn, lang }: {
  num: string; handle: string; tagUk: string; tagEn: string;
  titleUk: string; titleEn: string; descUk: string; descEn: string; lang: Lang;
}) {
  const [hovered, setHovered] = useState(false);
  const isUk = lang === 'uk';
  return (
    <a
      href={`https://t.me/${handle.replace('@', '')}`}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid={`link-bot-${handle.replace('@', '')}`}
      className="group relative block border-b border-[hsl(var(--border))] py-8 transition-shadow duration-500 hover:shadow-[0_0_50px_-16px_hsl(var(--primary)_/_0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] md:py-10"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-14">
        <div className="flex items-start gap-5 md:w-3/5">
          <span
            className="shrink-0 font-serif italic leading-none text-[hsl(var(--muted-foreground)_/_0.25)] transition-colors duration-500 group-hover:text-[hsl(var(--primary)_/_0.5)]"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          >{num}</span>
          <div className="pt-1">
            <span className="mb-2 inline-block font-sans text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--primary)_/_0.7)]">
              {isUk ? tagUk : tagEn}
            </span>
            <h3 className="font-serif text-2xl italic text-[hsl(var(--foreground))] md:text-3xl">
              {isUk ? titleUk : titleEn}
            </h3>
            <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              {isUk ? descUk : descEn}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:w-2/5 md:justify-end md:pt-2">
          <span className="font-sans text-xs tracking-[0.15em] text-[hsl(var(--muted-foreground)_/_0.5)] transition-colors group-hover:text-[hsl(var(--muted-foreground))]">
            {handle}
          </span>
          <motion.span
            animate={{ x: hovered ? 5 : 0 }}
            transition={{ duration: 0.4 }}
            className="text-[hsl(var(--primary))]"
          >→</motion.span>
        </div>
      </div>
      <motion.span
        aria-hidden
        className="absolute -bottom-px left-0 h-px bg-[hsl(var(--primary))]"
        initial={{ width: '0%' }}
        animate={{ width: hovered ? '100%' : '0%' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </a>
  );
}

function ProjectsPage({ t, lang, onOpenCase }: { t: Copy; lang: Lang; onOpenCase: () => void }) {
  return (
    <div className="min-h-[100dvh] w-full bg-[hsl(var(--background))]">
      <div className="mx-auto w-full max-w-6xl px-6 pt-28 pb-20 md:pt-36 md:pb-28">

        {/* — Sites section label — */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 flex items-baseline gap-4 md:mb-20"
        >
          <span className="font-sans text-xs tracking-[0.3em] text-[hsl(var(--primary))]">01</span>
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">{t.selectedWork}</span>
          <span className="h-px flex-1 bg-[hsl(var(--border))]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProjectCard t={t} onOpen={onOpenCase} />
        </motion.div>

        {/* — Bots section label — */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 mt-20 flex items-baseline gap-4 md:mt-28"
        >
          <span className="font-sans text-xs tracking-[0.3em] text-[hsl(var(--primary))]">02</span>
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
            {lang === 'uk' ? 'Боти' : 'Bots'}
          </span>
          <span className="h-px flex-1 bg-[hsl(var(--border))]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <BotCard
            num="01"
            handle="@boohxFit_bot"
            tagUk="особистий проєкт · тренування"
            tagEn="personal project · fitness"
            titleUk="boohxFit — тренувальний бот"
            titleEn="boohxFit — fitness bot"
            descUk="Бот для особистих тренувань, зроблений для себе. Веде облік підходів, ваги та прогресу — без зайвих застосунків. Просто Telegram і залізо."
            descEn="A personal training bot built for my own use. Tracks sets, weight, and progress — no extra apps needed. Just Telegram and iron."
            lang={lang}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <BotCard
            num="02"
            handle="@boohx_bot"
            tagUk="особистий проєкт · утиліта"
            tagEn="personal project · utility"
            titleUk="boohx — пошук юзернеймів"
            titleEn="boohx — username finder"
            descUk="Перевіряє, чи вільний юзернейм у Telegram. Написав для себе — витрачав забагато часу на ручний пошук гарних нікнеймів для клієнтів і проєктів."
            descEn="Checks whether a Telegram username is available. Built for personal use — I was spending too much time manually hunting clean handles for clients and projects."
            lang={lang}
          />
        </motion.div>

      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CASE STUDY page — mzshop.xyz / Галина Коцюба                       */
/* ------------------------------------------------------------------ */
function ServiceDetailPage({ svc, index, lang, onBack, onNavigate }: { svc: (typeof SERVICES)[number]; index: number; lang: Lang; onBack: () => void; onNavigate: (page: Page) => void }) {
  const isUk = lang === 'uk';
  const s = svc[lang];
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-[100dvh] w-full bg-[hsl(var(--background))]">
      {/* Purple glow, matching the Services hero */}
      <div
        className="pointer-events-none absolute left-0 top-0 -z-10 h-[480px] w-full"
        style={{
          background: 'radial-gradient(ellipse 55% 60% at 25% 20%, rgba(124,92,255,0.22) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="mx-auto w-full max-w-6xl px-6 pt-28 pb-24 md:pt-36 md:pb-32">
        {/* Breadcrumb */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-1 font-sans text-xs text-[hsl(var(--muted-foreground))]"
        >
          <button onClick={() => onNavigate('home')} className="hover:text-[hsl(var(--foreground))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--primary))]" data-testid="link-breadcrumb-home">
            {isUk ? 'Головна' : 'Home'}
          </button>
          {' / '}
          <button onClick={onBack} className="hover:text-[hsl(var(--foreground))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--primary))]" data-testid="link-breadcrumb-services">
            {isUk ? 'Послуги' : 'Services'}
          </button>
          {' / '}
          <span className="text-[hsl(var(--foreground))]">{s.title}</span>
        </motion.p>
        <p className="mb-10 font-sans text-[11px] uppercase tracking-[0.3em] text-[hsl(270_70%_72%)]">
          {isUk ? 'ПОСЛУГА' : 'SERVICE'} / 0{index + 1}
        </p>

        <div className="grid gap-12 md:grid-cols-[1fr_280px] md:gap-16">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans font-bold leading-[0.95] text-[hsl(var(--foreground))]"
              style={{ fontSize: 'clamp(2.6rem, 6.5vw, 4.5rem)' }}
            >
              {s.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 max-w-xl font-sans text-base leading-relaxed text-[hsl(var(--muted-foreground))]"
            >
              {s.detail}
            </motion.p>

            <motion.button
              type="button"
              onClick={() => {
                const params = new URLSearchParams({ service: s.title });
                setLocation(`/contact?${params.toString()}`);
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              data-testid="button-service-detail-discuss"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-10 inline-flex items-center gap-3 bg-[hsl(270_70%_60%)] px-6 py-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(270_70%_60%)]"
            >
              {isUk ? 'Обговорити проєкт' : 'Discuss the project'} →
            </motion.button>

            <motion.button
              type="button"
              onClick={onBack}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              data-testid="button-back-to-services"
              className="mt-6 block font-sans text-xs uppercase tracking-[0.25em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
            >
              ← {isUk ? 'Усі послуги' : 'All services'}
            </motion.button>
          </div>

          {/* Stats column */}
          <div className="flex flex-col gap-8 md:border-l md:border-[hsl(var(--border))] md:pl-10">
            {s.stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                data-testid={`stat-service-detail-${i}`}
              >
                <p className="font-mono text-4xl font-medium leading-none tracking-tight text-[hsl(var(--foreground))]">
                  {stat.value}
                  <span className="text-[hsl(270_70%_72%)]">.</span>
                </p>
                <p className="mt-2 max-w-[10rem] font-sans text-xs uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))]">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <TariffSection lang={lang} serviceName={s.title} />
      </div>
    </div>
  );
}


function CaseMzshopPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const isUk = lang === 'uk';
  return (
    <div className="min-h-[100dvh] w-full bg-[hsl(var(--background))]">
      <div className="mx-auto w-full max-w-6xl px-6 pt-28 pb-24 md:pt-36 md:pb-32">

        {/* Back link */}
        <motion.button
          type="button"
          onClick={onBack}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          data-testid="button-back-to-projects"
          className="mb-14 flex items-center gap-2 rounded-sm font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
        >
          ← {isUk ? 'Назад до проєктів' : 'Back to projects'}
        </motion.button>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          {['E-COMMERCE', 'UI / UX', 'FRONT-END'].map(tag => (
            <span
              key={tag}
              className="border border-[hsl(var(--border))] px-3 py-1 font-sans text-[10px] tracking-[0.25em] text-[hsl(var(--muted-foreground))]"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Hero name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <h1 className="leading-none" style={{ fontSize: 'clamp(2.8rem, 9vw, 7rem)' }}>
            <span className="font-sans font-bold text-[hsl(var(--foreground))]">
              {isUk ? 'Галина ' : 'Galyna '}
            </span>
            <span className="font-serif italic text-[hsl(var(--primary))]">
              {isUk ? 'Коцюба' : 'Kotsiuba'}
            </span>
          </h1>
        </motion.div>

        {/* Hero subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mb-16 max-w-2xl font-serif italic text-lg leading-relaxed text-[hsl(var(--muted-foreground))] md:text-xl"
        >
          {isUk
            ? 'Цифровий магазин авторських сережок — для тієї, чия робота потребує не просто вітрини, а власного простору з характером.'
            : 'A digital storefront for handcrafted earrings — built for a maker whose work deserves more than a marketplace listing.'}
        </motion.p>

        {/* Divider */}
        <div className="mb-16 h-px w-full bg-[hsl(var(--border))]" />

        {/* Two-column body */}
        <div className="flex flex-col gap-16 md:flex-row md:gap-20">

          {/* Left — narrative */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="md:w-3/5"
          >
            {isUk ? (
              <>
                <p className="mb-6 font-sans text-[15px] leading-[1.85] text-[hsl(var(--foreground)_/_0.85)]">
                  Галина Коцюба — майстриня авторських прикрас з Києва. Вона ліпить, плавить і збирає кожну пару сережок вручну — з полімерної глини, смоли та металу. За три роки роботи у неї зібралася лояльна аудиторія в Instagram, але не було єдиного місця, де можна показати весь асортимент і прийняти замовлення без зайвих повідомлень.
                </p>
                <p className="mb-6 font-sans text-[15px] leading-[1.85] text-[hsl(var(--foreground)_/_0.85)]">
                  На момент звернення до нас її <strong className="text-[hsl(var(--foreground))]">цифрова присутність</strong> зводилася до Instagram-профілю та папки на Etsy. Асортимент — великий, контексту — нуль.
                </p>
                <p className="mb-6 font-sans text-[15px] leading-[1.85] text-[hsl(var(--foreground)_/_0.85)]">
                  Завдання, яке ми сформулювали разом: побудувати не просто «інтернет-магазин», а простір, де кожна прикраса читається як окрема робота — з описом матеріалів, фотографіями на моделі та кнопкою замовлення без зайвих кроків.
                </p>
                <p className="font-sans text-[15px] leading-[1.85] text-[hsl(var(--foreground)_/_0.85)]">
                  Результат — <a href="https://mzshop.xyz" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 transition-colors hover:text-[hsl(var(--primary))]">mzshop.xyz</a>: темна золота естетика, каталог із фільтрами, кошик та форма замовлення через Telegram. Сайт запущений у 2026, і вже в перший місяць приніс Галині перші онлайн-продажі без посередників.
                </p>
              </>
            ) : (
              <>
                <p className="mb-6 font-sans text-[15px] leading-[1.85] text-[hsl(var(--foreground)_/_0.85)]">
                  Galyna Kotsiuba is a Kyiv-based jewelry maker. She hand-crafts each pair of earrings from polymer clay, resin, and metal — slowly, deliberately, one piece at a time. Over three years she built a loyal Instagram audience, but had no single place to show her full range and take orders without a flood of DMs.
                </p>
                <p className="mb-6 font-sans text-[15px] leading-[1.85] text-[hsl(var(--foreground)_/_0.85)]">
                  When she came to us, her <strong className="text-[hsl(var(--foreground))]">digital presence</strong> was an Instagram profile and an Etsy folder. The work was plentiful; the context was zero.
                </p>
                <p className="mb-6 font-sans text-[15px] leading-[1.85] text-[hsl(var(--foreground)_/_0.85)]">
                  The brief we shaped together: not just a shop, but a space where each piece reads like a standalone work — material notes, on-model photography, and an order flow with no unnecessary steps.
                </p>
                <p className="font-sans text-[15px] leading-[1.85] text-[hsl(var(--foreground)_/_0.85)]">
                  The result is <a href="https://mzshop.xyz" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 transition-colors hover:text-[hsl(var(--primary))]">mzshop.xyz</a>: dark-gold aesthetic, filtered catalog, cart, and Telegram order flow. Launched in 2026 — and within the first month, Galyna received her first direct online sales without a single marketplace cut.
                </p>
              </>
            )}
          </motion.div>

          {/* Right — context sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="md:w-2/5"
          >
            {/* Client badge */}
            <div className="mb-8 inline-flex flex-col border border-[hsl(var(--border))] px-5 py-4">
              <span className="mb-1 font-sans text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
                {isUk ? 'Інтернет-продавець' : 'Online seller'}
              </span>
              <span className="font-serif text-2xl italic text-[hsl(var(--foreground))]">
                {isUk ? 'Галина' : 'Galyna'}
              </span>
            </div>

            <p className="font-sans text-sm leading-[1.9] text-[hsl(var(--muted-foreground))]">
              {isUk
                ? 'Галина Коцюба — продавець авторських сережок з Києва. Працює сама: від ескізу до упаковки. Її клієнтки — жінки, які цінують речі зі змістом і не хочуть купувати «як у всіх». Сайт став для неї першим кроком від ремесла до бізнесу.'
                : 'Galyna Kotsiuba — a solo jewelry maker from Kyiv. She handles everything: sketch to shipping. Her customers are women who value intentional objects and refuse to buy "what everyone else has." The site was her first step from craft to business.'}
            </p>
          </motion.div>
        </div>

        {/* Bottom credits bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="divider-gradient mt-20 pt-10 md:mt-28"
        >
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: isUk ? 'Клієнт' : 'Client', value: isUk ? 'Галина Коцюба' : 'Galyna Kotsiuba' },
              { label: isUk ? 'Локація' : 'Location', value: isUk ? 'Київ — Україна' : 'Kyiv — Ukraine' },
              { label: isUk ? 'Рік' : 'Year', value: '2026' },
              { label: isUk ? 'Роль' : 'Role', value: 'Strategy · UX · UI · Frontend' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="mb-2 font-sans text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground)_/_0.55)]">{label}</p>
                <p className="font-sans text-sm text-[hsl(var(--foreground)_/_0.8)]">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ABOUT page                                                          */
/* ------------------------------------------------------------------ */
function AboutPage({ t, lang, onContact }: { t: Copy; lang: Lang; onContact: () => void }) {
  return (
    <div className="relative min-h-[100dvh] w-full bg-[hsl(var(--background))]">
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center opacity-[0.1] grayscale"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop)' }}
      />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-[hsl(var(--background))] via-transparent to-[hsl(var(--background))]" />
      <MeshArt className="pointer-events-none absolute right-0 top-0 -z-10 h-[600px] w-[600px] opacity-40" />
      <div className="mx-auto w-full max-w-6xl px-6 pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 flex items-baseline gap-4 md:mb-20"
        >
          <span className="font-sans text-xs tracking-[0.3em] text-[hsl(var(--primary))]">02</span>
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">{t.about}</span>
          <span className="h-px flex-1 bg-[hsl(var(--border))]" />
        </motion.div>

        {/* Team member card — no photo, initials avatar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 flex flex-col items-center gap-5 border border-[hsl(var(--border))] px-8 py-12 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_60px_-20px_hsl(var(--primary)_/_0.4)] md:mb-24"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[hsl(var(--primary)_/_0.5)] bg-[hsl(var(--primary)_/_0.08)] font-serif text-3xl italic text-[hsl(var(--primary))]">
            B
          </div>
          <div>
            <p className="font-serif text-2xl italic text-[hsl(var(--foreground))]">boohx</p>
            <p className="mt-1 font-sans text-xs font-bold uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
              {lang === 'uk' ? 'Засновник · веб-дизайн і розробка' : 'Founder · web design & development'}
            </p>
          </div>
        </motion.div>

        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">{t.noteOnProcess}</p>
          </motion.div>

          <motion.div
            className="md:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={t.aboutMain}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35 }}
                className="font-serif text-2xl italic leading-[1.35] text-[hsl(var(--foreground))] md:text-4xl md:leading-[1.3]"
              >
                {t.aboutMain}
              </motion.p>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.p
                key={t.aboutSub}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="mt-8 max-w-2xl font-sans text-sm leading-relaxed text-[hsl(var(--muted-foreground))]"
              >
                {t.aboutSub}
              </motion.p>
            </AnimatePresence>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-sans text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
              {t.skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>

            {/* How it works */}
            <div className="divider-gradient mt-16 pt-12">
              <p className="mb-10 font-sans text-xs uppercase tracking-[0.4em] text-[hsl(var(--muted-foreground))]">{t.howItWorks}</p>
              <div className="grid grid-cols-1 gap-y-8 md:grid-cols-5 md:gap-x-6">
                {t.howSteps.map((s, i) => (
                  <motion.div
                    key={s.step}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.07 }}
                    className="flex flex-col gap-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--border))] font-sans text-[10px] tracking-wider text-[hsl(var(--muted-foreground))]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="font-serif text-lg italic leading-snug text-[hsl(var(--foreground))]">{s.step}</p>
                    <p className="font-sans text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.button
              onClick={onContact}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              data-testid="link-about-contact-cta"
              className="mt-12 inline-flex items-center gap-3 border border-[hsl(var(--primary)_/_0.5)] px-6 py-3 font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary)_/_0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
            >
              {t.orderBtn}
              <span aria-hidden>↓</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SERVICES page                                                       */
/* ------------------------------------------------------------------ */
function BotOrderForm({ lang }: { lang: Lang }) {
  const isUk = lang === 'uk';
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [lastUrl, setLastUrl] = useState('');
  const [form, setForm] = useState({
    name: '', telegram: '', description: '', botType: '', deadline: '',
  });
  const [features, setFeatures] = useState<string[]>([]);

  const featureOptions = isUk
    ? ['Каталог / меню', 'Оплата онлайн', 'Адмін-панель', 'Розсилка', 'Інтеграція з CRM', 'Мультимова']
    : ['Catalog / menu', 'Online payments', 'Admin panel', 'Broadcasts', 'CRM integration', 'Multi-language'];

  const botTypes = isUk
    ? ['Інтернет-магазин', 'Запис на послуги', 'Інформаційний / FAQ', 'Розсилка / канал', 'Свій варіант']
    : ['Online store', 'Booking / appointments', 'Info / FAQ', 'Broadcast / channel', 'Custom'];

  const deadlines = isUk
    ? ['Без поспіху', 'До місяця', '2–3 тижні', 'Терміново']
    : ['No rush', 'Within a month', '2–3 weeks', 'ASAP'];

  const toggleFeature = (f: string) =>
    setFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = [
      `🤖 ${isUk ? 'Замовлення бота' : 'Bot order'}`,
      form.name ? `👤 ${isUk ? 'Імʼя' : 'Name'}: ${form.name}` : '',
      `📱 Telegram: ${form.telegram}`,
      form.botType ? `🏷 ${isUk ? 'Тип' : 'Type'}: ${form.botType}` : '',
      `📝 ${isUk ? 'Опис' : 'Description'}: ${form.description}`,
      features.length ? `⚙️ ${isUk ? 'Функції' : 'Features'}: ${features.join(', ')}` : '',
      form.deadline ? `⏱ ${isUk ? 'Дедлайн' : 'Deadline'}: ${form.deadline}` : '',
    ].filter(Boolean).join('\n');
    const tgUrl = `https://t.me/sefice?text=${encodeURIComponent(lines)}`;
    const win = window.open(tgUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      setSendError(true);
      setLastUrl(tgUrl);
      return;
    }
    setSendError(false);
    setSent(true);
  };

  const isValid = form.telegram.trim().length > 1 && form.description.trim().length > 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.7 }}
      className="mt-16 border border-[hsl(var(--border))]"
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        data-testid="button-toggle-bot-order-form"
        aria-expanded={open}
        className="group flex w-full items-center justify-between px-8 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
      >
        <div>
          <p className="mb-1 font-sans text-[10px] uppercase tracking-[0.35em] text-[hsl(var(--primary)_/_0.7)]">
            {isUk ? 'Новий напрям' : 'New direction'}
          </p>
          <h3 className="font-serif text-2xl italic text-[hsl(var(--foreground))] md:text-3xl">
            {isUk ? 'Замовити Telegram-бота' : 'Order a Telegram bot'}
          </h3>
        </div>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0 text-2xl leading-none text-[hsl(var(--primary))]"
        >+</motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {sent ? (
              <div className="flex flex-col items-center gap-4 px-8 pb-10 pt-4 text-center">
                <span className="text-4xl">🤖</span>
                <p className="font-serif text-xl italic text-[hsl(var(--foreground))]">
                  {isUk ? 'Відкрили Telegram — відправ повідомлення!' : 'Telegram opened — just hit send!'}
                </p>
                <button type="button" onClick={() => { setSent(false); setForm({ name: '', telegram: '', description: '', botType: '', deadline: '' }); setFeatures([]); }}
                  data-testid="button-bot-order-again"
                  className="mt-2 font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))] underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]">
                  {isUk ? 'Нова заявка' : 'New request'}
                </button>
              </div>
            ) : sendError ? (
              <div className="flex flex-col items-center gap-4 px-8 pb-10 pt-4 text-center" role="alert" data-testid="text-bot-order-error">
                <span className="text-4xl">⚠️</span>
                <p className="font-serif text-xl italic text-[hsl(var(--foreground))]">
                  {isUk ? 'Браузер заблокував спливаюче вікно' : 'Your browser blocked the pop-up'}
                </p>
                <p className="max-w-sm font-sans text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {isUk ? 'Дані заявки збережено — просто відкрийте Telegram вручну.' : "Your request details are saved — just open Telegram manually."}
                </p>
                <a
                  href={lastUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { setSendError(false); setSent(true); }}
                  data-testid="link-bot-order-fallback"
                  className="mt-2 bg-[hsl(var(--primary))] px-6 py-3 font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--background))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
                >
                  {isUk ? 'Відкрити Telegram' : 'Open Telegram'}
                </a>
                <button
                  type="button"
                  onClick={() => setSendError(false)}
                  data-testid="button-bot-order-error-back"
                  className="font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))] underline"
                >
                  {isUk ? 'Повернутись до форми' : 'Back to the form'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5 px-8 pb-10 pt-2 md:grid-cols-2">

                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
                    {isUk ? "Імʼя" : "Name"} <span className="opacity-40">({isUk ? 'необовʼязково' : 'optional'})</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={isUk ? 'Як до вас звертатись' : 'What to call you'}
                    data-testid="input-bot-name"
                    className="border border-[hsl(var(--border))] bg-transparent px-4 py-3 font-sans text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)_/_0.4)] focus:border-[hsl(var(--primary)_/_0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] transition-colors"
                  />
                </div>

                {/* Telegram */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
                    Telegram <span className="text-[hsl(var(--primary))]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.telegram}
                    onChange={e => setForm(f => ({ ...f, telegram: e.target.value }))}
                    placeholder="@username"
                    data-testid="input-bot-telegram"
                    className="border border-[hsl(var(--border))] bg-transparent px-4 py-3 font-sans text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)_/_0.4)] focus:border-[hsl(var(--primary)_/_0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] transition-colors"
                  />
                </div>

                {/* Bot type */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
                    {isUk ? 'Тип бота' : 'Bot type'}
                  </label>
                  <select
                    value={form.botType}
                    onChange={e => setForm(f => ({ ...f, botType: e.target.value }))}
                    data-testid="select-bot-type"
                    className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 font-sans text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary)_/_0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] transition-colors"
                  >
                    <option value="">{isUk ? 'Оберіть...' : 'Select...'}</option>
                    {botTypes.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                {/* Deadline */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
                    {isUk ? 'Дедлайн' : 'Deadline'}
                  </label>
                  <select
                    value={form.deadline}
                    onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    data-testid="select-bot-deadline"
                    className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 font-sans text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary)_/_0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] transition-colors"
                  >
                    <option value="">{isUk ? 'Не важливо' : 'Not important'}</option>
                    {deadlines.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-sans text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
                    {isUk ? 'Опис проєкту' : 'Project description'} <span className="text-[hsl(var(--primary))]">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder={isUk
                      ? 'Розкажіть про ваш бізнес, чого хочете від бота, які задачі він має вирішувати...'
                      : 'Tell me about your business, what you want the bot to do, what problems it should solve...'}
                    data-testid="input-bot-description"
                    className="resize-none border border-[hsl(var(--border))] bg-transparent px-4 py-3 font-sans text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)_/_0.4)] focus:border-[hsl(var(--primary)_/_0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] transition-colors"
                  />
                </div>

                {/* Features checkboxes */}
                <div className="flex flex-col gap-3 md:col-span-2">
                  <label className="font-sans text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
                    {isUk ? 'Потрібні функції' : 'Desired features'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {featureOptions.map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFeature(f)}
                        aria-pressed={features.includes(f)}
                        data-testid={`button-feature-${f}`}
                        className={`border px-3 py-1.5 font-sans text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] ${
                          features.includes(f)
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)_/_0.1)] text-[hsl(var(--foreground))]'
                            : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)_/_0.5)]'
                        }`}
                      >{f}</button>
                    ))}
                  </div>
                </div>

                {/* Price note + submit */}
                <div className="flex flex-col gap-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
                  <p className="font-sans text-xs text-[hsl(var(--muted-foreground)_/_0.6)] italic">
                    {isUk ? '💬 Ціну обговоримо в особистих — після того як зрозуміємо обʼєм.' : '💬 Price discussed in DMs — after we scope the work together.'}
                  </p>
                  <motion.button
                    type="submit"
                    disabled={!isValid}
                    whileHover={isValid ? { scale: 1.03 } : {}}
                    whileTap={isValid ? { scale: 0.97 } : {}}
                    data-testid="button-submit-bot-order"
                    className={`px-8 py-4 font-sans text-xs uppercase tracking-[0.3em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] ${
                      isValid
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--background))] cursor-pointer'
                        : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground)_/_0.4)] cursor-not-allowed'
                    }`}
                  >
                    {isUk ? 'Відправити →' : 'Send →'}
                  </motion.button>
                </div>

              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TariffSection({ lang, serviceName }: { lang: Lang; serviceName: string | null }) {
  const [activeTab, setActiveTab] = useState(0);
  const [, setLocation] = useLocation();

  return (
    <div className="divider-gradient mt-20 pt-14">
      <p className="mb-2 font-sans text-[11px] uppercase tracking-[0.4em] text-[hsl(270_70%_72%)]">
        {lang === 'uk' ? 'ОРІЄНТОВНІ ТАРИФИ' : 'SAMPLE PRICING'}
      </p>
      <h2
        className="font-sans font-bold leading-[0.95] text-[hsl(var(--foreground))]"
        style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)' }}
      >
        {lang === 'uk' ? 'Що тобі потрібно?' : 'What do you need?'}
      </h2>

      <div className="mt-10 grid gap-3 md:grid-cols-3">
        {TARIFF_TABS.map((tab, i) => {
          const tb = tab[lang];
          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(i)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={activeTab === i}
              data-testid={`button-tariff-tab-${tab.id}`}
              className={`border p-5 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] ${
                activeTab === i ? 'border-[hsl(270_70%_60%)] bg-[hsl(270_70%_60%_/_0.08)]' : 'border-[hsl(var(--border))]'
              }`}
            >
              <span className="font-sans text-xs tracking-[0.2em] text-[hsl(270_70%_72%)]">0{i + 1}</span>
              <p className="mt-2 font-sans text-xl font-bold text-[hsl(var(--foreground))]">{tb.tabLabel}</p>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {(() => {
          const tab = TARIFF_TABS[activeTab];
          const tb = tab[lang];
          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              data-testid={`card-tariff-${tab.id}`}
              className="mt-6 grid gap-10 border border-[hsl(var(--border))] p-8 transition-shadow duration-500 hover:shadow-[0_0_60px_-20px_hsl(270_70%_60%_/_0.5)] md:grid-cols-2 md:p-12"
            >
              <div>
                <h3 className="font-sans text-4xl font-bold text-[hsl(var(--foreground))] md:text-5xl">{tb.name}</h3>
                <p className="mt-3 max-w-xs font-serif text-lg italic leading-snug text-[hsl(var(--muted-foreground))]">
                  {tb.tagline}
                </p>
                <p className="mt-6 font-sans text-xs uppercase tracking-[0.2em] text-[hsl(270_70%_72%)]">
                  {lang === 'uk' ? 'ТЕРМІН' : 'TIMELINE'}: {tb.term}
                </p>
                <motion.button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams({ service: serviceName || tb.name, pkg: tb.tabLabel });
                    setLocation(`/contact?${params.toString()}`);
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  data-testid="button-tariff-discuss"
                  className="mt-8 inline-flex items-center gap-3 bg-[hsl(270_70%_60%)] px-6 py-3 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(270_70%_60%)]"
                >
                  {lang === 'uk' ? 'Обговорити проєкт' : 'Discuss the project'} →
                </motion.button>
              </div>
              <ul className="space-y-3 self-center">
                {tb.items.map((item) => (
                  <li key={item} className="flex gap-2.5 font-sans text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                    <span className="mt-0.5 text-[hsl(270_70%_72%)]" aria-hidden>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

function ServicesPage({ t, lang, onNavigate }: { t: Copy; lang: Lang; onNavigate: (page: Page) => void }) {
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: railRef, offset: ['start center', 'end center'] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
  const dotTopPercent = useTransform(smoothProgress, [0, 1], [0, 100]);
  const dotTop = useMotionTemplate`${dotTopPercent}%`;

  return (
    <div className="min-h-[100dvh] w-full bg-[hsl(var(--background))]">
      {/* Purple-tinted "what do you need" hero */}
      <div className="relative flex flex-col items-center overflow-hidden px-6 pb-24 pt-32 text-center md:pt-40">
        <div
          className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center opacity-[0.14] grayscale"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1711577423906-41ec065a98c9?q=80&w=1600&auto=format&fit=crop)' }}
        />
        <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-[hsl(var(--background))] via-transparent to-[hsl(var(--background))]" />
        <div
          className="pointer-events-none absolute -top-20 left-1/2 -z-10 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            width: '80%',
            maxWidth: 900,
            height: 420,
            background: 'radial-gradient(ellipse 60% 55% at 35% 40%, rgba(124,92,255,0.28) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(90,72,255,0.2) 0%, transparent 70%)',
          }}
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 font-sans text-xs uppercase tracking-[0.4em] text-[hsl(270_70%_72%)]"
        >
          {lang === 'uk' ? 'Послуги' : 'Services'}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans font-bold leading-[0.95] text-[hsl(var(--foreground))]"
          style={{ fontSize: 'clamp(2.6rem, 8vw, 5.5rem)' }}
        >
          {lang === 'uk' ? 'Що тобі потрібно?' : 'What do you need?'}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 max-w-md font-sans text-sm text-[hsl(var(--muted-foreground))]"
        >
          {lang === 'uk'
            ? 'Обери напрям нижче — або гортай список і читай деталі кожного формату.'
            : 'Pick a direction below — or scroll through the list to read the details of each.'}
        </motion.p>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 pt-4 pb-20 md:pb-28">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 flex items-baseline gap-4 md:mb-20"
        >
          <span className="font-sans text-xs tracking-[0.3em] text-[hsl(var(--primary))]">03</span>
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">{t.servicesTitle}</span>
          <span className="h-px flex-1 bg-[hsl(var(--border))]" />
        </motion.div>

        {/* Alternating slides with a centered gauge that fills as you scroll */}
        <div ref={railRef} className="relative">
          {/* Empty track — runs through the whole section */}
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-[3px] -translate-x-1/2 rounded-full bg-[hsl(var(--border))] md:block" aria-hidden />
          {/* Filled portion — grows downward from the top as you scroll */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-0 hidden w-[3px] -translate-x-1/2 rounded-full md:block"
            style={{
              height: '100%',
              scaleY: smoothProgress,
              transformOrigin: 'top',
              background: 'linear-gradient(to bottom, hsl(270 80% 72%), hsl(255 75% 58%))',
              boxShadow: '0 0 12px 1px hsl(270 75% 68% / 0.45)',
            }}
            aria-hidden
          />
          {/* Soft glow trailing the fill tip */}
          <motion.div
            className="pointer-events-none absolute left-1/2 hidden h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl md:block"
            style={{ top: dotTop, background: 'radial-gradient(circle, hsl(270 75% 68% / 0.4) 0%, transparent 70%)' }}
            aria-hidden
          />
          {/* Bulb at the current fill level */}
          <motion.div
            className="pointer-events-none absolute left-1/2 hidden h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(270_80%_72%)] shadow-[0_0_18px_5px_hsl(270_75%_68%_/_0.65)] md:block"
            style={{ top: dotTop }}
            aria-hidden
          />

          <div className="flex flex-col gap-10 md:gap-14">
            {SERVICES.map((svc, i) => {
              const s = svc[lang];
              const onRight = i % 2 === 1;
              return (
                <motion.div
                  key={svc.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-15% 0px -15% 0px' }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  data-testid={`card-service-${svc.id}`}
                  className={`relative flex min-h-[22vh] flex-col justify-center py-4 md:w-[calc(50%-2.5rem)] ${
                    onRight ? 'md:ml-auto md:text-left' : 'md:mr-auto md:text-right'
                  }`}
                >
                  <span className="font-sans text-xs tracking-[0.3em] text-[hsl(270_70%_72%)]">0{i + 1}</span>
                  <p className={`mt-3 font-serif text-xl italic leading-snug text-[hsl(var(--muted-foreground))] ${onRight ? '' : 'md:ml-auto md:max-w-sm'}`}>
                    {s.short}
                  </p>
                  <h3 className="mt-2 font-sans text-5xl font-bold leading-[0.92] text-[hsl(var(--foreground))] md:text-6xl">
                    {s.title}
                  </h3>

                  <motion.button
                    type="button"
                    onClick={() => onNavigate(svc.id as Page)}
                    whileHover={{ gap: '0.75rem' }}
                    data-testid={`button-service-more-${svc.id}`}
                    className={`mt-5 inline-flex w-fit items-center gap-2 border-b border-[hsl(var(--foreground)_/_0.4)] pb-1 font-sans text-xs uppercase tracking-[0.2em] text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(270_70%_72%)] hover:text-[hsl(270_70%_72%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] ${onRight ? '' : 'md:ml-auto'}`}
                  >
                    {lang === 'uk' ? 'Детальніше' : 'Learn more'}
                    <span aria-hidden>→</span>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <TariffSection lang={lang} serviceName={null} />

        <BotOrderForm lang={lang} />

        {/* CTA block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 grid gap-10 md:grid-cols-2 md:gap-14"
        >
          <div>
            <p className="mb-3 font-sans text-[11px] uppercase tracking-[0.4em] text-[hsl(var(--muted-foreground))]">{t.ctaSubtle}</p>
            <h2 className="font-serif text-3xl italic text-[hsl(var(--foreground))] md:text-4xl">{t.ctaHeading}</h2>
          </div>
          <div className="flex flex-col gap-6">
            <p className="font-sans text-sm leading-relaxed text-[hsl(var(--muted-foreground))] max-w-sm">{t.ctaDesc}</p>
            <a href="https://t.me/sefice" target="_blank" rel="noopener noreferrer" data-testid="link-services-cta-telegram" className="inline-block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 bg-[#229ED9] px-7 py-4 font-sans text-xs uppercase tracking-[0.3em] text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-2.012 9.487c-.147.665-.54.826-1.094.513l-3.02-2.226-1.458 1.404c-.163.163-.298.298-.606.298l.214-3.083 5.606-5.064c.243-.216-.054-.338-.381-.122L7.54 14.245l-2.964-.924c-.645-.2-.657-.645.136-.953l11.58-4.466c.537-.196 1.01.117.81.946z" />
                </svg>
                {t.ctaButton}
              </motion.span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CONTACT page                                                        */
/* ------------------------------------------------------------------ */
function ContactLinkRow({ href, label, sub, testId }: { href: string; label: string; sub: string; testId: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid={testId}
      className="group relative block border-b border-[hsl(var(--border))] py-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] md:py-10"
    >
      <div className="flex items-baseline justify-between">
        <motion.span
          className="font-serif italic text-[hsl(var(--foreground))]"
          style={{ fontSize: 'clamp(1.8rem, 5vw, 3.6rem)' }}
          animate={{ x: hovered ? 14 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {label}
        </motion.span>
        <motion.span
          animate={{ opacity: hovered ? 1 : 0.5 }}
          className="hidden font-sans text-[10px] uppercase tracking-[0.35em] text-[hsl(var(--muted-foreground))] md:block"
        >
          {sub}
        </motion.span>
      </div>
      <motion.span
        aria-hidden
        className="absolute -bottom-px left-0 h-px bg-[hsl(var(--primary))]"
        initial={{ width: '0%' }}
        animate={{ width: hovered ? '100%' : '0%' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </a>
  );
}

function ContactPage({ t, lang }: { t: Copy; lang: Lang }) {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[hsl(var(--background))]">
      <BlobArt className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[700px] w-[900px] -translate-x-1/2 opacity-50" />
      <div className="mx-auto w-full max-w-6xl px-6 pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 flex items-baseline gap-4 md:mb-20"
        >
          <span className="font-sans text-xs tracking-[0.3em] text-[hsl(var(--primary))]">04</span>
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">{t.contact}</span>
          <span className="h-px flex-1 bg-[hsl(var(--border))]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={t.letsBuild}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="mb-14 font-serif text-3xl italic text-[hsl(var(--foreground))] md:text-5xl"
            >
              {t.letsBuild}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Order wizard — front and center */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-2 font-sans text-[11px] uppercase tracking-[0.5em] text-[hsl(var(--primary))]">
            {lang === 'uk' ? 'ГОТОВІ ПОЧАТИ?' : 'READY TO START?'}
          </p>
          <h2 className="font-serif italic leading-[0.9] text-[hsl(var(--foreground))]" style={{ fontSize: 'clamp(3.2rem, 9vw, 8.5rem)' }}>
            {lang === 'uk' ? 'Замовити' : 'Order a'}
            <span className="block text-[hsl(var(--primary))]">{lang === 'uk' ? 'сайт під ключ' : 'website, start to finish'}</span>
          </h2>

          <div className="mt-16">
            <Suspense fallback={null}>
              <OrderWizard lang={lang} />
            </Suspense>
          </div>
        </motion.div>

        {/* Direct contacts — below the wizard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 md:mt-32"
        >
          <div className="divider-gradient">
            <ContactLinkRow href="mailto:ht1makcv5@gmail.com" label="ht1makcv5@gmail.com" sub={t.emailSub} testId="link-email" />
            <ContactLinkRow href="https://t.me/sefice" label="@sefice" sub={t.tgSub} testId="link-telegram" />
          </div>
          <p className="mt-8 flex items-center gap-2 font-sans text-sm text-[hsl(var(--muted-foreground))]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
            {lang === 'uk'
              ? 'Відповідаю зазвичай протягом години — найшвидше в Telegram: '
              : 'I usually reply within an hour — fastest via Telegram: '}
            <a
              href="https://t.me/sefice"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-response-time-telegram"
              className="text-[hsl(var(--primary))] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
            >
              @sefice
            </a>
          </p>
        </motion.div>

        {/* Footer */}
        <div className="divider-gradient mt-20 pt-8 flex justify-between items-center">
          <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">{t.footerYear}</span>
          <span className="font-serif text-lg italic text-[hsl(var(--muted-foreground)_/_0.4)]">boohx</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Global "Order a website" CTA + slide-out panel                      */
/* ------------------------------------------------------------------ */
function GlobalOrderCta({ lang }: { lang: Lang }) {
  const [, setLocation] = useLocation();
  const label = lang === 'uk' ? 'Замовити сайт' : 'Order a website';

  return (
    <motion.button
      onClick={() => setLocation('/contact')}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      data-testid="button-order-site-global"
      className="fixed bottom-5 right-5 z-[70] border border-[hsl(var(--primary)_/_0.55)] bg-[hsl(var(--background)_/_0.9)] px-5 py-3 font-sans text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--primary))] shadow-lg backdrop-blur-sm transition-colors hover:bg-[hsl(var(--primary)_/_0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] md:bottom-8 md:right-8 md:px-6 md:py-3.5"
    >
      {label}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* URL <-> Page mapping (so direct links and refresh work correctly)   */
/* ------------------------------------------------------------------ */
const SERVICE_IDS: readonly ServiceId[] = ['landing', 'corporate', 'shop', 'uxui', 'frontend', 'branding', 'launch', 'support', 'seo'];
const PAGE_SLUGS: readonly Page[] = ['home', 'projects', 'about', 'services', 'contact', 'case-mzshop', ...SERVICE_IDS];

function pageFromLocation(location: string): Page {
  const slug = location.replace(/^\/+/, '').split('?')[0];
  return (PAGE_SLUGS as readonly string[]).includes(slug) ? (slug as Page) : 'home';
}

/* ------------------------------------------------------------------ */
/* Page root                                                           */
/* ------------------------------------------------------------------ */
export default function Portfolio() {
  const [location, setLocation] = useLocation();
  const currentPage = pageFromLocation(location);
  const [savedLang, setSavedLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('boohx-lang');
      return saved === 'uk' || saved === 'en' ? saved : 'uk';
    } catch { return 'uk'; }
  });

  const t = T[savedLang];

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1 });
    (window as unknown as { __boohxLenis?: Lenis }).__boohxLenis = lenis;
    let raf: number;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as unknown as { __boohxLenis?: Lenis }).__boohxLenis;
    };
  }, []);

  const toggleLang = () => {
    setSavedLang((prev) => {
      const next: Lang = prev === 'en' ? 'uk' : 'en';
      try { localStorage.setItem('boohx-lang', next); } catch { /* noop */ }
      return next;
    });
  };

  const navigate = (page: Page) => {
    setLocation(page === 'home' ? '/' : `/${page}`);
    const lenis = (window as unknown as { __boohxLenis?: { scrollTo: (v: number, opts?: object) => void } }).__boohxLenis;
    if (lenis) lenis.scrollTo(0, { duration: 1 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-30 opacity-[0.025]" />

      <TopNav
        currentPage={currentPage}
        onNavigate={navigate}
        lang={savedLang}
        onToggleLang={toggleLang}
      />

      <CursorGlow />

      <div className="grid-overlay pointer-events-none fixed inset-0 z-0 hidden md:block" aria-hidden />
      <Suspense fallback={null}>
        <AmbientSparkles />
      </Suspense>

      <GlobalOrderCta lang={savedLang} />

      <AnimatePresence mode="wait">
        {currentPage === 'home' && (
          <PageWrap pageKey="home">
            <HomePage t={t} lang={savedLang} onViewWork={() => navigate('projects')} />
          </PageWrap>
        )}
        {currentPage === 'projects' && (
          <PageWrap pageKey="projects">
            <ProjectsPage t={t} lang={savedLang} onOpenCase={() => navigate('case-mzshop')} />
          </PageWrap>
        )}
        {currentPage === 'case-mzshop' && (
          <PageWrap pageKey="case-mzshop">
            <CaseMzshopPage lang={savedLang} onBack={() => navigate('projects')} />
          </PageWrap>
        )}
        {currentPage === 'about' && (
          <PageWrap pageKey="about">
            <AboutPage t={t} lang={savedLang} onContact={() => navigate('contact')} />
          </PageWrap>
        )}
        {currentPage === 'services' && (
          <PageWrap pageKey="services">
            <ServicesPage t={t} lang={savedLang} onNavigate={navigate} />
          </PageWrap>
        )}
        {SERVICE_IDS.includes(currentPage as ServiceId) && (() => {
          const idx = SERVICES.findIndex((s) => s.id === currentPage);
          if (idx === -1) return null;
          return (
            <PageWrap pageKey={currentPage}>
              <ServiceDetailPage svc={SERVICES[idx]} index={idx} lang={savedLang} onBack={() => navigate('services')} onNavigate={navigate} />
            </PageWrap>
          );
        })()}
        {currentPage === 'contact' && (
          <PageWrap pageKey="contact">
            <ContactPage t={t} lang={savedLang} />
          </PageWrap>
        )}
      </AnimatePresence>
    </div>
  );
}
