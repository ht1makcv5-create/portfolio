import { lazy, Suspense, useEffect, useRef, useState, Component } from 'react';
import type { ReactNode } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

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
type Page = 'home' | 'projects' | 'about' | 'services' | 'contact';

/* ------------------------------------------------------------------ */
/* Translations                                                        */
/* ------------------------------------------------------------------ */
const T = {
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
} as const;

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
    id: 'branding',
    en: { title: 'Branding & Identity', short: 'A mark that means something.', detail: 'Logo, color palette, typography and brand guidelines. A consistent visual language across every touchpoint — web, print, social media.' },
    uk: { title: 'Брендинг + айдентика', short: 'Знак, що щось означає.', detail: 'Логотип, палітра, шрифти та гайдлайн бренду. Єдиний стиль для всіх точок контакту — сайт, друк, соцмережі.' },
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
      className="flex items-center gap-[3px] font-sans text-[11px] uppercase tracking-[0.25em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
      aria-label="Toggle language"
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
function HamburgerButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="flex h-8 w-8 flex-col items-end justify-center gap-[5px]"
      aria-label="Open menu"
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
  t: typeof T['en'];
}) {
  const navItems: { page: Page; label: string }[] = [
    { page: 'home', label: 'boohx™' },
    { page: 'projects', label: t.navProjects },
    { page: 'about', label: t.navAbout },
    { page: 'services', label: t.navServices },
    { page: 'contact', label: t.navContact },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
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
                className="font-sans text-[11px] uppercase tracking-[0.25em] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
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
                className="text-left border-b border-[hsl(var(--border))] py-6 group"
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
          className="font-sans text-[11px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
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
              className="relative px-4 py-1.5 font-sans text-[11px] uppercase tracking-[0.22em] transition-colors duration-300"
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
          <HamburgerButton onClick={() => setMobileOpen(true)} isOpen={false} />
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
function HomePage({ t }: { t: typeof T['en'] }) {
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
function ProjectCard({ t }: { t: typeof T['en'] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="https://mzshop.xyz"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative block border-y border-[hsl(var(--border))] py-10 md:py-14"
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
              View
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
    </a>
  );
}

function ProjectsPage({ t }: { t: typeof T['en'] }) {
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
          <span className="font-sans text-xs tracking-[0.3em] text-[hsl(var(--primary))]">01</span>
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">{t.selectedWork}</span>
          <span className="h-px flex-1 bg-[hsl(var(--border))]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProjectCard t={t} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex items-center justify-between border-b border-[hsl(var(--border))] py-8 opacity-40 md:py-10"
        >
          <div className="flex items-center gap-6">
            <span className="font-serif italic leading-none text-[hsl(var(--muted-foreground)_/_0.35)]" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>02</span>
            <span className="font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">{t.moreWork}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ABOUT page                                                          */
/* ------------------------------------------------------------------ */
function AboutPage({ t, onContact }: { t: typeof T['en']; onContact: () => void }) {
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
              className="mt-12 inline-flex items-center gap-3 border border-[hsl(var(--primary)_/_0.5)] px-6 py-3 font-sans text-xs uppercase tracking-[0.3em] text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary)_/_0.08)]"
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
function ServicesPage({ t, lang }: { t: typeof T['en']; lang: Lang }) {
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
                  className="group flex w-full items-center gap-5 py-6 text-left"
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
            <a href="https://t.me/sefice" target="_blank" rel="noopener noreferrer">
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
function ContactLinkRow({ href, label, sub }: { href: string; label: string; sub: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative block border-b border-[hsl(var(--border))] py-8 md:py-10"
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

function ContactPage({ t, lang }: { t: typeof T['en']; lang: Lang }) {
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
            <ContactLinkRow href="mailto:ht1makcv5@gmail.com" label="ht1makcv5@gmail.com" sub={t.emailSub} />
            <ContactLinkRow href="https://t.me/sefice" label="@sefice" sub={t.tgSub} />
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
          </h2>
          <h2 className="font-serif italic leading-[0.9] text-[hsl(var(--muted-foreground)_/_0.5)]" style={{ fontSize: 'clamp(3rem, 8vw, 8rem)' }}>
            {t.ctaBigSub}
          </h2>
          <a
            href="https://t.me/sefice"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-block font-sans text-sm tracking-[0.25em] text-[hsl(var(--primary))] hover:opacity-80 transition-opacity"
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
/* Page root                                                           */
/* ------------------------------------------------------------------ */
export default function Portfolio() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
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
    setCurrentPage(page);
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

      <AnimatePresence mode="wait">
        {currentPage === 'home' && (
          <PageWrap pageKey="home">
            <HomePage t={t} />
          </PageWrap>
        )}
        {currentPage === 'projects' && (
          <PageWrap pageKey="projects">
            <ProjectsPage t={t} />
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
