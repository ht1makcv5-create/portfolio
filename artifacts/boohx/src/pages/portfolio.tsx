import { lazy, Suspense, useEffect, useRef, useState, Component } from 'react';
import type { ReactNode, FormEvent } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

const GhostScene = lazy(() => import('@/components/GhostScene'));

/* ------------------------------------------------------------------ */
/* WebGL error boundary                                                */
/* ------------------------------------------------------------------ */
class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type Lang = 'en' | 'uk';
type Page = 'home' | 'projects' | 'about' | 'services' | 'contact' | 'case-mzshop';

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
    navAbout: 'About',
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
    navAbout: 'Про мене',
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
const SERVICES = [
  {
    id: 'landing',
    en: { title: 'Landing Pages', short: 'One page — maximum conversion.', detail: 'A focused landing page built to promote a product or service. Fast, responsive, and structured to guide the visitor to a single clear action.' },
    uk: { title: 'Розробка лендингів', short: 'Одна сторінка — максимум конверсії.', detail: 'Ефективна цільова сторінка для просування продукту або послуги. Швидка, адаптивна, зі структурою, що веде відвідувача до дії.' },
  },
  {
    id: 'corporate',
    en: { title: 'Corporate Websites', short: 'Your brand online — serious.', detail: 'Multi-page representative website for a company or brand. Built with a CMS so you can update content yourself without calling a developer.' },
    uk: { title: 'Корпоративні сайти', short: 'Ваш бренд в інтернеті — серйозно.', detail: 'Багатосторінковий представницький сайт для компанії або бренду. Із CMS — щоб ви могли самостійно оновлювати контент без розробника.' },
  },
  {
    id: 'shop',
    en: { title: 'Online Stores', short: 'Full e-commerce, ready from day one.', detail: 'Complete online store with catalog, cart and payment integration. Optimized for speed and designed to drive sales from the moment of launch.' },
    uk: { title: 'Інтернет-магазини', short: 'Повноцінний e-commerce з першого дня.', detail: 'Готовий магазин із каталогом, кошиком та підключенням оплати. Оптимізований для продажів та швидкої роботи з моменту запуску.' },
  },
  {
    id: 'uxui',
    en: { title: 'UX / UI Design', short: 'Interfaces that guide, not confuse.', detail: "Wireframes, prototypes and final Figma designs. Clean interfaces built around the user's intent — every click leads somewhere meaningful." },
    uk: { title: 'UX / UI дизайн', short: 'Інтерфейси, що ведуть, а не плутають.', detail: 'Вайрфрейми, прототипи та фінальний дизайн у Figma. Зрозумілий інтерфейс, побудований навколо мети користувача.' },
  },
  {
    id: 'frontend',
    en: { title: 'Front-end Development', short: 'Turning design into a working site.', detail: 'I build the interface in code — responsive, fast, and true to the design. Clean, maintainable front-end that actually works the way it looks.' },
    uk: { title: 'Frontend-розробка', short: 'Перетворюю дизайн на робочий сайт.', detail: 'Верстаю та програмую інтерфейс — адаптивно, швидко, у точній відповідності до дизайну. Чистий, підтримуваний код.' },
  },
  {
    id: 'branding',
    en: { title: 'Branding & Identity', short: 'A mark that means something.', detail: 'Logo, color palette, typography and brand guidelines. A consistent visual language across every touchpoint — web, print, social media.' },
    uk: { title: 'Брендинг + айдентика', short: 'Знак, що щось означає.', detail: 'Логотип, палітра, шрифти та гайдлайн бренду. Єдиний стиль для всіх точок контакту — сайт, друк, соцмережі.' },
  },
  {
    id: 'launch',
    en: { title: 'Website Launch', short: 'From finished build to production.', detail: 'Domain setup, hosting, final checks and going live. I make sure the site is genuinely ready for real visitors before launch day.' },
    uk: { title: 'Запуск сайту', short: 'Від готової збірки до production.', detail: 'Налаштування домену, хостингу, фінальна перевірка та вихід у продакшн. Переконуюсь, що сайт справді готовий до реальних відвідувачів.' },
  },
  {
    id: 'support',
    en: { title: 'Ongoing Support', short: 'Help after the site goes live.', detail: 'Updates, fixes, and small improvements after launch — so the site keeps working and growing instead of gathering dust.' },
    uk: { title: 'Підтримка сайту', short: 'Допомога після запуску.', detail: 'Оновлення, виправлення та невеликі покращення після запуску — щоб сайт не пилився, а розвивався.' },
  },
  {
    id: 'seo',
    en: { title: 'SEO Optimization', short: 'Found on Google, not buried.', detail: 'Technical SEO, meta tags, site structure and speed optimization. So your target audience finds you without you having to chase them.' },
    uk: { title: 'SEO-оптимізація', short: 'Знайдуть в Google, а не в його надрах.', detail: 'Технічне SEO, мета-теги, структура та швидкість сайту. Щоб ваша аудиторія знаходила вас сама.' },
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
    { page: 'about', label: t.navAbout },
    { page: 'services', label: t.navServices },
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
    { page: 'projects', label: lang === 'uk' ? 'Проєкти' : 'Projects' },
    { page: 'about', label: lang === 'uk' ? 'Про мене' : 'About' },
    { page: 'services', label: lang === 'uk' ? 'Послуги' : 'Services' },
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
        <motion.div
          className="absolute left-1/2 top-1/2 h-[70vw] w-[70vw] max-h-[900px] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.09) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="noise-overlay absolute inset-0 opacity-[0.035]" />
      </div>

      {/* Ghost — bottom-left */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 z-0"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="relative overflow-visible"
          style={{ width: 'clamp(300px, 50vw, 760px)', height: 'clamp(320px, 78vh, 860px)' }}
        >
          <div
            className="pointer-events-none absolute inset-0 -z-10 rounded-full"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 45% 65%, rgba(90,72,255,0.22) 0%, rgba(60,40,200,0.08) 50%, transparent 75%)',
              transform: 'translateX(-8%) translateY(5%)',
            }}
          />
          <WebGLBoundary>
            <Suspense fallback={null}>
              <GhostScene />
            </Suspense>
          </WebGLBoundary>
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
              className="text-[19vw] md:text-[16vw]"
              style={i === letters.length - 1 ? { color: 'hsl(var(--primary) / 0.85)' } : undefined}
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
      className="group relative block w-full border-y border-[hsl(var(--border))] py-10 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] md:py-14"
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
      className="group relative block border-b border-[hsl(var(--border))] py-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] md:py-10"
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
          className="mt-20 border-t border-[hsl(var(--border))] pt-10 md:mt-28"
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
function AboutPage({ t, onContact }: { t: Copy; onContact: () => void }) {
  return (
    <div className="min-h-[100dvh] w-full bg-[hsl(var(--background))]">
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
            <div className="mt-16 border-t border-[hsl(var(--border))] pt-12">
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

function ServicesPage({ t, lang }: { t: Copy; lang: Lang }) {
  const [openService, setOpenService] = useState<string | null>(null);

  return (
    <div className="min-h-[100dvh] w-full bg-[hsl(var(--background))]">
      <div className="mx-auto w-full max-w-6xl px-6 pt-28 pb-20 md:pt-36 md:pb-28">
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

        <div className="flex flex-col">
          {SERVICES.map((svc, i) => {
            const s = svc[lang];
            const isOpen = openService === svc.id;
            return (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.06 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="border-b border-[hsl(var(--border))]"
              >
                <button
                  onClick={() => setOpenService(isOpen ? null : svc.id)}
                  aria-expanded={isOpen}
                  data-testid={`button-service-${svc.id}`}
                  className="group flex w-full items-center gap-5 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
                >
                  <span className="shrink-0 font-serif italic text-2xl leading-none text-[hsl(var(--muted-foreground)_/_0.3)] group-hover:text-[hsl(var(--primary)_/_0.5)] transition-colors">
                    0{i + 1}
                  </span>
                  <div className="flex-1">
                    <span className="font-serif text-2xl italic text-[hsl(var(--foreground))] md:text-3xl">{s.title}</span>
                    <span className="mt-1 block font-sans text-xs text-[hsl(var(--muted-foreground))] tracking-wide">{s.short}</span>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[hsl(var(--primary))] text-xl leading-none"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pl-11 font-sans text-sm leading-relaxed text-[hsl(var(--muted-foreground))] max-w-xl">
                        {s.detail}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

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
    <div className="min-h-[100dvh] w-full bg-[hsl(var(--background))]">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="border-t border-[hsl(var(--border))]">
            <ContactLinkRow href="mailto:ht1makcv5@gmail.com" label="ht1makcv5@gmail.com" sub={t.emailSub} testId="link-email" />
            <ContactLinkRow href="https://t.me/sefice" label="@sefice" sub={t.tgSub} testId="link-telegram" />
          </div>
        </motion.div>

        {/* Big CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 md:mt-32"
        >
          <p className="mb-2 font-sans text-[11px] uppercase tracking-[0.5em] text-[hsl(var(--primary))]">
            {lang === 'uk' ? 'ГОТОВІ ПОЧАТИ?' : 'READY TO START?'}
          </p>
          <h2 className="font-serif italic leading-[0.9] text-[hsl(var(--foreground))]" style={{ fontSize: 'clamp(3rem, 8vw, 8rem)' }}>
            {t.ctaBig}
            <span className="block text-[hsl(var(--muted-foreground)_/_0.5)]">{t.ctaBigSub}</span>
          </h2>
          <a
            href="https://t.me/sefice"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-telegram-big-cta"
            className="mt-10 inline-block rounded-sm font-sans text-sm tracking-[0.25em] text-[hsl(var(--primary))] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
          >
            @sefice
          </a>
        </motion.div>

        {/* Footer */}
        <div className="mt-20 border-t border-[hsl(var(--border))] pt-8 flex justify-between items-center">
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
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const label = lang === 'uk' ? 'Замовити сайт' : 'Order a website';

  return (
    <>
      <motion.button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        data-testid="button-order-site-global"
        aria-haspopup="dialog"
        className="fixed bottom-5 right-5 z-[70] border border-[hsl(var(--primary)_/_0.55)] bg-[hsl(var(--background)_/_0.9)] px-5 py-3 font-sans text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--primary))] shadow-lg backdrop-blur-sm transition-colors hover:bg-[hsl(var(--primary)_/_0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] md:bottom-8 md:right-8 md:px-6 md:py-3.5"
      >
        {label}
      </motion.button>
      <AnimatePresence>
        {open && (
          <OrderSitePanel
            lang={lang}
            onClose={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function OrderSitePanel({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const isUk = lang === 'uk';
  const panelRef = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [lastUrl, setLastUrl] = useState('');
  const [form, setForm] = useState({ name: '', contact: '', service: '', budget: '', message: '' });
  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const services = isUk
    ? ['Лендинг', 'Корпоративний сайт', 'Інтернет-магазин', 'UI/UX дизайн', 'Інше']
    : ['Landing page', 'Corporate website', 'Online store', 'UI/UX design', 'Other'];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const message = form.message.replace(/\s+/g, ' ').trim();
    if (name.length < 2 || message.length < 5) return;
    const lines = [
      `🌐 ${isUk ? 'Замовлення сайту' : 'Website order'}`,
      `👤 ${isUk ? 'Імʼя' : 'Name'}: ${name}`,
      `📱 ${isUk ? 'Контакт' : 'Contact'}: ${form.contact.trim()}`,
      form.service ? `🏷 ${isUk ? 'Послуга' : 'Service'}: ${form.service}` : '',
      form.budget.trim() ? `💰 ${isUk ? 'Бюджет' : 'Budget'}: ${form.budget.trim()}` : '',
      `📝 ${isUk ? 'Опис' : 'Message'}: ${message}`,
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

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex justify-end bg-[hsl(var(--background)_/_0.72)] backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-panel-title"
        data-testid="dialog-order-panel"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-[100dvh] w-full max-w-md flex-col overflow-y-auto border-l border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6 outline-none md:p-10"
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--primary))]">
              {isUk ? 'Нове замовлення' : 'New order'}
            </p>
            <h2 id="order-panel-title" className="mt-2 font-serif text-3xl italic text-[hsl(var(--foreground))] md:text-4xl">
              {isUk ? 'Замовити сайт' : 'Order a website'}
            </h2>
          </div>
          <button
            onClick={onClose}
            data-testid="button-close-order-panel"
            aria-label={isUk ? 'Закрити' : 'Close'}
            className="rounded-full border border-[hsl(var(--border))] p-3 text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--primary))]"
          >
            ✕
          </button>
        </div>

        {sent ? (
          <div className="flex flex-1 flex-col justify-center py-8" data-testid="text-order-sent">
            <p className="font-serif text-3xl italic text-[hsl(var(--foreground))]">
              {isUk ? 'Telegram відкрито — надішліть повідомлення!' : 'Telegram opened — just hit send!'}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              {isUk ? 'Якщо вікно не відкрилось, напишіть напряму: @sefice' : "If it didn't open, message directly: @sefice"}
            </p>
            <button
              onClick={() => {
                setSent(false);
                setForm({ name: '', contact: '', service: '', budget: '', message: '' });
              }}
              data-testid="button-order-again"
              className="mt-8 w-fit border-b border-[hsl(var(--foreground))] pb-1 text-sm hover:text-[hsl(var(--primary))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
            >
              {isUk ? 'Надіслати ще одну заявку' : 'Send another request'}
            </button>
          </div>
        ) : sendError ? (
          <div className="flex flex-1 flex-col justify-center py-8" data-testid="text-order-error" role="alert">
            <p className="font-serif text-2xl italic text-[hsl(var(--foreground))]">
              {isUk ? 'Браузер заблокував спливаюче вікно' : 'Your browser blocked the pop-up'}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              {isUk
                ? 'Ваші дані нікуди не зникли — просто натисніть кнопку нижче, щоб відкрити Telegram вручну.'
                : "Your details weren't lost — just tap the button below to open Telegram manually."}
            </p>
            <a
              href={lastUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setSendError(false);
                setSent(true);
              }}
              data-testid="link-order-fallback"
              className="mt-8 inline-flex w-fit items-center gap-3 border border-[hsl(var(--primary)_/_0.6)] bg-[hsl(var(--primary)_/_0.1)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary)_/_0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
            >
              {isUk ? 'Відкрити Telegram' : 'Open Telegram'}
            </a>
            <button
              type="button"
              onClick={() => setSendError(false)}
              data-testid="button-order-error-back"
              className="mt-4 w-fit text-xs uppercase tracking-[0.25em] text-[hsl(var(--muted-foreground))] underline hover:text-[hsl(var(--foreground))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
            >
              {isUk ? 'Повернутись до форми' : 'Back to the form'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-xs text-[hsl(var(--muted-foreground))]">{isUk ? "Ваше ім'я" : 'Your name'}</span>
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                data-testid="input-panel-name"
                className="w-full border-b border-[hsl(var(--border))] bg-transparent py-2 text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[hsl(var(--muted-foreground))]">
                {isUk ? 'Телефон, Telegram або email' : 'Phone, Telegram, or email'}
              </span>
              <input
                required
                minLength={3}
                value={form.contact}
                onChange={(e) => update('contact', e.target.value)}
                data-testid="input-panel-contact"
                className="w-full border-b border-[hsl(var(--border))] bg-transparent py-2 text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[hsl(var(--muted-foreground))]">{isUk ? 'Що потрібно зробити' : 'What do you need'}</span>
              <select
                value={form.service}
                onChange={(e) => update('service', e.target.value)}
                data-testid="select-panel-service"
                className="w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] py-2 text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
              >
                <option value="">{isUk ? 'Оберіть послугу' : 'Choose a service'}</option>
                {services.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[hsl(var(--muted-foreground))]">{isUk ? 'Орієнтовний бюджет' : 'Rough budget'}</span>
              <input
                value={form.budget}
                onChange={(e) => update('budget', e.target.value)}
                data-testid="input-panel-budget"
                className="w-full border-b border-[hsl(var(--border))] bg-transparent py-2 text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[hsl(var(--muted-foreground))]">{isUk ? 'Коротко про завдання' : 'Briefly about the task'}</span>
              <textarea
                required
                minLength={5}
                rows={4}
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                data-testid="input-panel-message"
                className="w-full resize-none border-b border-[hsl(var(--border))] bg-transparent py-2 text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
              />
            </label>
            <button
              type="submit"
              data-testid="button-panel-submit"
              className="mt-2 w-full border border-[hsl(var(--primary)_/_0.6)] bg-[hsl(var(--primary)_/_0.1)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary)_/_0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
            >
              {isUk ? 'Відправити в Telegram' : 'Send via Telegram'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* URL <-> Page mapping (so direct links and refresh work correctly)   */
/* ------------------------------------------------------------------ */
const PAGE_SLUGS: readonly Page[] = ['home', 'projects', 'about', 'services', 'contact', 'case-mzshop'];

function pageFromLocation(location: string): Page {
  const slug = location.replace(/^\/+/, '');
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

  const toggleLang = () => {
    setSavedLang((prev) => {
      const next: Lang = prev === 'en' ? 'uk' : 'en';
      try { localStorage.setItem('boohx-lang', next); } catch { /* noop */ }
      return next;
    });
  };

  const navigate = (page: Page) => {
    setLocation(page === 'home' ? '/' : `/${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <AboutPage t={t} onContact={() => navigate('contact')} />
          </PageWrap>
        )}
        {currentPage === 'services' && (
          <PageWrap pageKey="services">
            <ServicesPage t={t} lang={savedLang} />
          </PageWrap>
        )}
        {currentPage === 'contact' && (
          <PageWrap pageKey="contact">
            <ContactPage t={t} lang={savedLang} />
          </PageWrap>
        )}
      </AnimatePresence>
    </div>
  );
}
