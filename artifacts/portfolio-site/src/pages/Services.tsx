import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, Check, Code, Palette, Sparkles, Zap } from 'lucide-react';

const services = [
  {
    id: 'brand-identity',
    title: 'Brand Identity',
    subtitle: 'Візуальна мова вашого бренду',
    icon: Palette,
    color: '#d95b4f',
    textColor: '#f7e7cc',
    description: 'Створюємо комплексну айдентику, яка говорить про ваші цінності та виділяє вас серед конкурентів.',
    deliverables: ['Логотип та фірмовий стиль', 'Кольорова палітра та типографіка', 'Брендбук та гайдлайни', 'Візитки та бізнес-матеріали'],
    process: ['Дослідження та стратегія', 'Концепція та ескізи', 'Розробка та фіналізація', 'Впровадження'],
    timeline: '4-8 тижнів',
    price: 'від $2,000'
  },
  {
    id: 'web-design',
    title: 'Web Design & Development',
    subtitle: 'Сайти, що продають та вражають',
    icon: Code,
    color: '#4f6f7a',
    textColor: '#f6e8cf',
    description: 'Розробляємо сучасні веб-сайти з фокусом на UX/UI, швидкість та конверсію.',
    deliverables: ['Адаптивний дизайн', 'Інтерактивні анімації', 'SEO-оптимізація', 'CMS інтеграція'],
    process: ['UX дослідження', 'Прототипування', 'Візуальний дизайн', 'Розробка та тестування'],
    timeline: '6-12 тижнів',
    price: 'від $3,500'
  },
  {
    id: 'digital-experience',
    title: 'Digital Experience',
    subtitle: 'Інтерактивні рішення',
    icon: Sparkles,
    color: '#dcb65c',
    textColor: '#2b2031',
    description: 'Створюємо незабутні цифрові враження через motion design, інтерактиви та інновації.',
    deliverables: ['Motion graphics', 'Інтерактивні прототипи', '3D візуалізації', 'Мікроанімації'],
    process: ['Концепція взаємодії', 'Storyboarding', 'Анімація та розробка', 'Інтеграція'],
    timeline: '4-10 тижнів',
    price: 'від $2,500'
  },
  {
    id: 'strategy',
    title: 'Creative Strategy',
    subtitle: 'Від ідеї до втілення',
    icon: Zap,
    color: '#e35e50',
    textColor: '#f5e8d0',
    description: 'Допомагаємо знайти унікальну позицію бренду та розробити стратегію комунікації.',
    deliverables: ['Бренд-аудит', 'Позиціонування', 'Tone of voice', 'Контент-стратегія'],
    process: ['Аналіз ринку', 'Інсайти та гіпотези', 'Стратегічний план', 'Дорожня карта'],
    timeline: '3-6 тижнів',
    price: 'від $1,800'
  }
];

const processSteps = [
  { num: '01', title: 'Discovery', desc: 'Глибоко занурюємось у ваш бізнес та цілі' },
  { num: '02', title: 'Strategy', desc: 'Формуємо чітку стратегію та план дій' },
  { num: '03', title: 'Design', desc: 'Створюємо візуальні рішення та прототипи' },
  { num: '04', title: 'Development', desc: 'Втілюємо дизайн у життя з увагою до деталей' },
  { num: '05', title: 'Launch', desc: 'Запускаємо та супроводжуємо проєкт' }
];

const stats = [
  { value: '50+', label: 'Завершених проєктів' },
  { value: '98%', label: 'Задоволених клієнтів' },
  { value: '5+', label: 'Років досвіду' },
  { value: '24/7', label: 'Підтримка' }
];

export default function Services() {
  const [activeService, setActiveService] = useState(services[0].id);
  const currentService = services.find(s => s.id === activeService) || services[0];

  return (
    <div className="grain min-h-[100dvh] overflow-hidden bg-background">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/50 bg-background/90 px-5 py-4 backdrop-blur-md md:px-10 md:py-5">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between">
          <Link href="/" className="hover:scale-110 transition-transform duration-300">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rotate-45 bg-accent inline-block" />
              <span className="font-semibold tracking-[-.04em]">yana<span className="text-accent">.</span></span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/" className="hover:text-accent transition-all duration-300">Головна</Link>
            <Link href="/services" className="text-accent">Послуги</Link>
            <a href="/#contact" className="hover:text-accent transition-all duration-300">Контакт</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative px-5 pb-20 pt-32 md:px-10 md:pb-32 md:pt-40">
          <div className="mx-auto max-w-[1380px]">
            <div className="reveal">
              <p className="mono mb-5 text-[10px] uppercase tracking-[.2em] text-accent animate-pulse">Наші послуги</p>
              <h1 className="serif max-w-4xl text-[clamp(3.5rem,8vw,8rem)] leading-[.85] tracking-[-.065em]">
                Створюємо<br />
                <span className="italic gradient-text">digital-продукти</span><br />
                з душею.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Від стратегії до втілення — допомагаємо брендам знайти свій голос і створити незабутнє враження.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-[1380px]">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="reveal border border-border bg-card p-8 hover-lift"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="serif text-6xl gradient-text">{stat.value}</div>
                  <p className="mt-3 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/40 px-5 py-20 md:px-10 md:py-32">
          <div className="mx-auto max-w-[1380px]">
            <div className="mb-16">
              <p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-accent">Що ми робимо</p>
              <h2 className="serif text-5xl md:text-7xl">Наші послуги</h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {services.map((service, i) => {
                const Icon = service.icon;
                return (
                  <article
                    key={service.id}
                    className="group min-h-[400px] overflow-hidden p-8 md:p-10 hover-lift transition-all duration-500 cursor-pointer rounded-sm"
                    style={{ backgroundColor: service.color, color: service.textColor }}
                    onClick={() => setActiveService(service.id)}
                  >
                    <div className="flex justify-between items-start mb-12">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Icon size={24} />
                      </div>
                      <span className="text-sm opacity-60">0{i + 1}</span>
                    </div>
                    <h3 className="serif text-5xl leading-[.9] group-hover:tracking-tight transition-all duration-300">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                      {service.subtitle}
                    </p>
                    <p className="mt-6 max-w-sm leading-relaxed opacity-75 group-hover:opacity-100 transition-opacity">
                      {service.description}
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-sm font-semibold">
                      Детальніше <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 md:px-10 md:py-32">
          <div className="mx-auto max-w-[1380px]">
            <div className="mb-16">
              <p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-accent">Детальніше</p>
              <h2 className="serif text-5xl md:text-7xl">
                {currentService.title}
              </h2>
            </div>

            <div className="grid gap-16 lg:grid-cols-[1.2fr_.8fr]">
              <div>
                <div
                  className="rounded-sm p-10 mb-10 hover-lift transition-all duration-300"
                  style={{ backgroundColor: currentService.color, color: currentService.textColor }}
                >
                  <p className="text-lg leading-relaxed mb-8">{currentService.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="opacity-80">
                      <span className="block mb-2 text-xs uppercase tracking-wider opacity-60">Термін</span>
                      <strong>{currentService.timeline}</strong>
                    </div>
                    <div className="opacity-80">
                      <span className="block mb-2 text-xs uppercase tracking-wider opacity-60">Ціна</span>
                      <strong>{currentService.price}</strong>
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-xl font-semibold mb-5">Що ви отримаєте</h3>
                  <div className="space-y-3">
                    {currentService.deliverables.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check size={18} className="text-accent mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-5">Процес роботи</h3>
                  <div className="grid gap-3">
                    {currentService.process.map((step, i) => (
                      <div key={i} className="flex items-center gap-4 border border-border bg-card p-4 rounded-sm hover-lift">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-sm font-semibold">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="sticky top-32">
                  <h3 className="text-xl font-semibold mb-5">Обрати послугу</h3>
                  <div className="space-y-2 mb-8">
                    {services.map(service => (
                      <button
                        key={service.id}
                        onClick={() => setActiveService(service.id)}
                        className={`w-full text-left p-4 border transition-all duration-300 rounded-sm ${
                          activeService === service.id
                            ? 'border-accent bg-accent/5'
                            : 'border-border bg-card hover:border-accent/50'
                        }`}
                      >
                        <div className="font-semibold">{service.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">{service.subtitle}</div>
                      </button>
                    ))}
                  </div>

                  <a
                    href="/#contact"
                    className="block w-full text-center bg-accent px-6 py-4 text-sm font-semibold text-background transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-sm"
                  >
                    Обговорити проєкт
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/40 px-5 py-20 md:px-10 md:py-32">
          <div className="mx-auto max-w-[1380px]">
            <div className="mb-16 text-center">
              <p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-accent">Як ми працюємо</p>
              <h2 className="serif text-5xl md:text-7xl">Наш процес</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-5">
              {processSteps.map((step, i) => (
                <div
                  key={i}
                  className="reveal border border-border bg-card p-6 hover-lift"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="mono text-3xl text-accent">{step.num}</span>
                  <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#2b2031] px-5 py-20 text-[#f5e8d0] md:px-10 md:py-28">
          <div className="mx-auto max-w-[1380px] text-center">
            <p className="mono mb-5 text-[10px] uppercase tracking-[.2em] text-[#e35e50]">Готові почати?</p>
            <h2 className="serif mx-auto max-w-3xl text-6xl leading-[.9] md:text-8xl">
              Розкажіть нам про свій проєкт
            </h2>
            <p className="mx-auto mt-8 max-w-xl leading-relaxed text-[#f5e8d0]/70">
              Не потрібен ідеальний бриф. Ідея, питання, навіть напівсформована думка — цього достатньо, щоб почати.
            </p>
            <a
              href="/#contact"
              className="mt-12 inline-flex items-center gap-3 bg-[#e35e50] px-8 py-4 text-sm font-semibold text-[#2b2031] transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Обговорити проєкт <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-5 py-8 md:px-10">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-5 text-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rotate-45 bg-accent inline-block" />
            <span className="font-semibold tracking-[-.04em]">yana<span className="text-accent">.</span></span>
          </div>
          <p className="text-muted-foreground">Small studio, serious attention.</p>
          <a href="mailto:hello@yana.studio" className="hover:text-accent">hello@yana.studio</a>
        </div>
      </footer>
    </div>
  );
}
