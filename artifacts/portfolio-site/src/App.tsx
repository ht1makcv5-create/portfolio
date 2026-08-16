import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Route, Switch, useLocation } from 'wouter';
import { ArrowUpRight, Check, CircleAlert, Clock3, ExternalLink, Inbox, Menu, Paperclip, PenLine, Send, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  getGetAdminSessionQueryKey, getGetDashboardQueryKey, getListRequestsQueryKey,
  useCreateAdminSession, useCreateRequest, useDeleteAdminSession, useGetAdminSession,
  useGetDashboard, useGetTelegramBot, useListRequests, useTrackVisit, useUpdateRequest,
} from '@workspace/api-client-react';
import type { Request as StudioRequest } from '@workspace/api-client-react';
import NotFound from '@/pages/not-found';
import Services from '@/pages/Services';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const services = ['Brand identity', 'Art direction', 'Editorial & print', 'Digital experience', 'Something in between'];
const statuses = ['new', 'in_progress', 'completed', 'archived'] as const;

function Mark() {
  return <div className="flex items-center gap-2"><span className="h-3 w-3 rotate-45 bg-accent inline-block" /><span className="font-semibold tracking-[-.04em]">yana<span className="text-accent">.</span></span></div>;
}

function PublicNav() {
  const [open, setOpen] = useState(false);
  return <header className="fixed inset-x-0 top-0 z-40 border-b border-border/50 bg-background/90 px-5 py-4 backdrop-blur-md md:px-10 md:py-5 transition-all duration-300">
    <div className="mx-auto flex max-w-[1380px] items-center justify-between">
      <Link href="/" data-testid="link-logo" className="hover:scale-110 transition-transform duration-300"><Mark /></Link>
      <nav className={`${open ? 'flex' : 'hidden'} absolute left-5 right-5 top-16 flex-col gap-5 rounded-md border border-border bg-card p-5 text-sm md:static md:flex md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:p-0 transition-all duration-300 ${open ? 'scale-in' : ''}`}>
        <a href="#work" data-testid="link-work" className="hover:text-accent transition-all duration-300 hover:translate-x-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full">Наші роботи</a>
        <Link href="/services" data-testid="link-services" className="hover:text-accent transition-all duration-300 hover:translate-x-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full">Послуги</Link>
        <a href="#approach" data-testid="link-approach" className="hover:text-accent transition-all duration-300 hover:translate-x-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full">Підхід</a>
        <a href="#contact" data-testid="link-contact" className="hover:text-accent transition-all duration-300 hover:translate-x-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full">Обговорити проєкт</a>
        <Link href="/admin" data-testid="link-admin" className="mono text-[10px] uppercase tracking-[.16em] text-muted-foreground hover:text-accent transition-all duration-300 hover:scale-105">Кабінет студії ↗</Link>
      </nav>
      <div className="flex items-center gap-3">
        <button onClick={() => setOpen(!open)} className="md:hidden hover:scale-110 transition-transform duration-300" data-testid="button-mobile-menu" aria-label="Toggle menu">{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
    </div>
  </header>;
}

function GlobalOrderCta() {
  const [orderOpen, setOrderOpen] = useState(false);
  return <>
    <button
      onClick={() => setOrderOpen(true)}
      data-testid="button-order-site-global"
      aria-label="Відкрити форму замовлення сайту"
      className="fixed right-4 top-3 z-[60] inline-flex items-center gap-2 border border-[#2b2031]/15 bg-[#e35e50] px-4 py-3 text-[11px] font-bold uppercase tracking-[.08em] text-[#2b2031] shadow-[0_10px_30px_rgba(43,32,49,.2)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(227,94,80,.4)] sm:right-8 sm:top-4 sm:px-5 sm:py-3.5 sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#2b2031] focus:ring-offset-2 focus:ring-offset-background hover:scale-105 animate-pulse"
    >
      Замовити сайт <ArrowUpRight size={15} className="transition-transform group-hover:rotate-45" />
    </button>
    {orderOpen && <OrderPanel onClose={() => setOrderOpen(false)} />}
  </>;
}

function OrderPanel({ onClose }: { onClose: () => void }) {
  const create = useCreateRequest();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', service: '', budget: '', message: '' });
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate(
      { data: { kind: 'order', ...form, service: form.service || undefined, budget: form.budget || undefined } },
      { onSuccess: () => { setSent(true); setForm({ name: '', contact: '', service: '', budget: '', message: '' }); } },
    );
  };
  return <div className="fixed inset-0 z-50 flex items-start justify-end bg-[#2b2031]/35 backdrop-blur-sm p-3 pt-20 sm:p-5 sm:pt-24 fade-in" role="dialog" aria-modal="true" data-testid="dialog-order-panel">
    <div className="max-h-[calc(100dvh-6rem)] w-full max-w-md overflow-y-auto border-2 border-[#e35e50]/30 bg-[#f5e8d0] p-6 text-[#2b2031] shadow-2xl sm:p-8 slide-in-right rounded-sm hover-lift">
      <div className="mb-7 flex items-start justify-between gap-5"><div><p className="mono text-[10px] uppercase tracking-[.2em] text-[#e35e50] animate-pulse">Нове замовлення</p><h2 className="serif mt-2 text-4xl gradient-text">Замовити сайт</h2></div><button onClick={onClose} data-testid="button-close-order-panel" className="rounded-full border border-[#2b2031]/20 p-2 hover:bg-[#2b2031]/5 transition-all duration-300 hover:rotate-90 hover:scale-110"><X size={17} /></button></div>
      {sent ? <div className="py-8"><span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#e35e50]"><Check size={19} /></span><h3 className="serif text-4xl">Заявку прийнято.</h3><p className="mt-3 text-sm leading-relaxed text-[#2b2031]/65">Дані вже відправлено в робочий Telegram-бот. Ми звʼяжемося з вами за вказаним контактом.</p><button onClick={onClose} data-testid="button-close-sent-panel" className="mt-7 border-b border-[#2b2031] pb-1 text-sm">Закрити</button></div> :
      <form onSubmit={submit} className="space-y-5">
        <label className="block"><span className="mb-1 block text-xs text-[#2b2031]/60 transition-all duration-300">Ваше імʼя</span><input required minLength={2} value={form.name} onChange={e => update('name', e.target.value)} data-testid="input-panel-name" className="w-full border-b-2 border-[#2b2031]/25 bg-transparent py-2 text-sm outline-none focus:border-[#e35e50] transition-all duration-300 hover:border-[#2b2031]/40" /></label>
        <label className="block"><span className="mb-1 block text-xs text-[#2b2031]/60 transition-all duration-300">Телефон, Telegram або email</span><input required minLength={3} value={form.contact} onChange={e => update('contact', e.target.value)} data-testid="input-panel-contact" className="w-full border-b-2 border-[#2b2031]/25 bg-transparent py-2 text-sm outline-none focus:border-[#e35e50] transition-all duration-300 hover:border-[#2b2031]/40" /></label>
        <label className="block"><span className="mb-1 block text-xs text-[#2b2031]/60 transition-all duration-300">Що потрібно зробити</span><select value={form.service} onChange={e => update('service', e.target.value)} data-testid="select-panel-service" className="w-full border-b-2 border-[#2b2031]/25 bg-[#f5e8d0] py-2 text-sm outline-none focus:border-[#e35e50] transition-all duration-300 hover:border-[#2b2031]/40 cursor-pointer"><option value="">Оберіть послугу</option>{services.map(service => <option key={service}>{service}</option>)}</select></label>
        <label className="block"><span className="mb-1 block text-xs text-[#2b2031]/60 transition-all duration-300">Коротко про завдання</span><textarea required minLength={5} rows={3} value={form.message} onChange={e => update('message', e.target.value)} data-testid="input-panel-message" className="w-full resize-none border-b-2 border-[#2b2031]/25 bg-transparent py-2 text-sm outline-none focus:border-[#e35e50] transition-all duration-300 hover:border-[#2b2031]/40" /></label>
        {create.isError && <p className="flex items-center gap-2 text-xs text-[#b94035] fade-in"><CircleAlert size={14} /> Не вдалося відправити. Спробуйте ще раз.</p>}
        <button disabled={create.isPending} type="submit" data-testid="button-panel-submit" className="w-full bg-[#e35e50] px-5 py-3 text-sm font-semibold text-[#2b2031] disabled:opacity-50 transition-all duration-300 hover:bg-[#e35e50]/90 hover:scale-105 hover:shadow-lg active:scale-95 rounded-sm">{create.isPending ? 'Відправляємо…' : 'Відправити'}</button>
      </form>}
    </div>
  </div>;
}

function Portfolio() {
  const trackVisit = useTrackVisit();
  useEffect(() => {
    const storageKey = 'yana-visitor-session';
    let sessionId = localStorage.getItem(storageKey);
    if (!sessionId) {
      sessionId = `${crypto.randomUUID()}-${Date.now()}`;
      localStorage.setItem(storageKey, sessionId);
    }
    trackVisit.mutate({ data: { sessionId, path: window.location.pathname } });
  }, []);
  return <div className="grain min-h-[100dvh] overflow-hidden bg-background">
    <PublicNav />
    <main>
      <section className="relative px-5 pb-24 pt-36 md:px-10 md:pb-36 md:pt-48 overflow-hidden">
        <div className="mx-auto grid max-w-[1380px] items-end gap-14 md:grid-cols-[1.1fr_.9fr]">
          <div className="reveal">
            <p className="mono mb-7 text-[10px] uppercase tracking-[.2em] text-accent animate-pulse">Креативна студія · Київ / будь-де</p>
            <h1 className="max-w-4xl text-[clamp(4rem,10vw,10.5rem)] leading-[.82] tracking-[-.075em] text-shadow-soft">Створюємо<br /><span className="serif font-normal italic text-accent gradient-text">сайти</span> з характером.</h1>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/services" className="inline-flex items-center gap-2 bg-accent px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:scale-105 hover:shadow-lg">
                Наші послуги <ArrowUpRight size={16} />
              </Link>
              <a href="#work" className="inline-flex items-center gap-2 border-2 border-foreground px-6 py-3 text-sm font-semibold transition-all duration-300 hover:border-accent hover:text-accent hover:translate-x-1">
                Дивитись роботи
              </a>
            </div>
          </div>
          <div className="reveal max-w-sm pb-2 md:justify-self-end" style={{ animationDelay: '.12s' }}>
            <p className="text-lg leading-relaxed text-muted-foreground">Yana — невелика студія для ідей із характером. Створюємо бренди, сайти та цифрові враження, які запамʼятовуються.</p>
            <div className="mt-8 grid grid-cols-2 gap-4 pt-8 border-t border-border">
              <div>
                <div className="serif text-4xl gradient-text">50+</div>
                <p className="mt-2 text-sm text-muted-foreground">Проєктів</p>
              </div>
              <div>
                <div className="serif text-4xl gradient-text">5+</div>
                <p className="mt-2 text-sm text-muted-foreground">Років</p>
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-24 top-48 hidden h-80 w-80 rounded-full border-2 border-accent/40 md:block float glow-accent" />
        <div className="pointer-events-none absolute -right-8 top-64 hidden h-48 w-48 rounded-full bg-secondary md:block scale-in" style={{ animationDelay: '.3s' }} />
        <div className="pointer-events-none absolute -left-32 top-96 hidden h-64 w-64 rounded-full bg-accent/10 md:block blur-3xl" />
      </section>

      <section id="work" className="border-y border-border bg-muted/40 px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1380px]">
          <div className="mb-12 flex items-end justify-between"><div><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-accent">01 / Наші роботи</p><h2 className="serif text-5xl md:text-7xl">Проєкти, які<br /><i>мають значення.</i></h2></div><span className="mono hidden text-[10px] text-muted-foreground md:block">2021—2026</span></div>
          <div className="grid gap-5 md:grid-cols-[1.35fr_.65fr]">
            <article className="group min-h-[430px] overflow-hidden bg-[#d95b4f] p-7 text-[#f7e7cc] md:p-10 hover-lift transition-all duration-500 cursor-pointer rounded-sm"><div className="flex justify-between text-xs"><span>01 — Identity</span><span>Olha Studio</span></div><div className="mt-24 max-w-xl"><h3 className="serif text-7xl leading-[.8] md:text-9xl group-hover:tracking-tight transition-all duration-300">Made<br /><i>slowly.</i></h3><p className="mt-7 max-w-xs text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">A tactile identity for a ceramics practice built around patient hands.</p></div><div className="mt-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#f7e7cc] transition-all duration-300 group-hover:translate-x-2 group-hover:bg-[#f7e7cc] group-hover:text-[#d95b4f]"><ArrowUpRight size={17} /></div></article>
            <div className="grid gap-5">
              <article className="group min-h-[205px] bg-[#dcb65c] p-7 text-[#2b2031] hover-lift transition-all duration-500 cursor-pointer rounded-sm"><div className="flex justify-between text-xs"><span>02 — Editorial</span><span>Vatra Journal</span></div><h3 className="serif mt-14 text-5xl leading-[.8] group-hover:tracking-tight transition-all duration-300">A journal for<br /><i>the in-between.</i></h3><div className="mt-5 flex justify-end transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110"><ArrowUpRight size={18} /></div></article>
              <article className="group min-h-[205px] bg-[#4f6f7a] p-7 text-[#f6e8cf] hover-lift transition-all duration-500 cursor-pointer rounded-sm"><div className="flex justify-between text-xs"><span>03 — Digital</span><span>Forma Objects</span></div><h3 className="serif mt-14 text-5xl leading-[.8] group-hover:tracking-tight transition-all duration-300">Objects with<br /><i>a point of view.</i></h3><div className="mt-5 flex justify-end transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110"><ArrowUpRight size={18} /></div></article>
            </div>
          </div>
        </div>
      </section>

      <section id="approach" className="px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-[1380px] gap-14 md:grid-cols-[.6fr_1fr]">
          <div><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-accent">02 / Як ми працюємо</p><p className="serif text-5xl leading-[.9] md:text-7xl">Хороша робота<br /><i>починається з уваги.</i></p></div>
          <div className="grid gap-0 divide-y divide-border border-y border-border">
            {[['01', 'Listen first', 'Every project starts with questions. We find the human detail that makes your idea specific.'], ['02', 'Find the shape', 'Strategy, words, image, and motion come together as one clear point of view.'], ['03', 'Make it felt', 'We sweat the quiet parts — the texture, the pause, the thing people remember later.']].map(([n, title, copy]) => <div key={n} className="grid gap-5 py-7 md:grid-cols-[70px_1fr_1.3fr] md:items-start"><span className="mono text-[11px] text-accent">{n}</span><h3 className="text-xl font-semibold">{title}</h3><p className="leading-relaxed text-muted-foreground">{copy}</p></div>)}
          </div>
        </div>
      </section>
      <ContactSection />
    </main>
    <footer className="border-t border-border px-5 py-8 md:px-10"><div className="mx-auto flex max-w-[1380px] flex-col gap-5 text-sm md:flex-row md:items-center md:justify-between"><Mark /><p className="text-muted-foreground">Small studio, serious attention.</p><a href="mailto:hello@yana.studio" data-testid="link-email" className="hover:text-accent">hello@yana.studio</a></div></footer>
  </div>;
}

function ContactSection() {
  const create = useCreateRequest();
  const [sent, setSent] = useState(false);
  const [kind, setKind] = useState<'contact' | 'order'>('order');
  const [form, setForm] = useState({ name: '', contact: '', service: '', budget: '', message: '' });
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); create.mutate({ data: { ...form, kind, ...(kind === 'contact' ? { service: undefined, budget: undefined } : {}) } }, { onSuccess: () => { setSent(true); setForm({ name: '', contact: '', service: '', budget: '', message: '' }); } }); };
  return <section id="contact" className="bg-[#2b2031] px-5 py-20 text-[#f5e8d0] md:px-10 md:py-28">
    <div className="mx-auto grid max-w-[1380px] gap-14 md:grid-cols-[.8fr_1.2fr]">
      <div><p className="mono mb-5 text-[10px] uppercase tracking-[.2em] text-[#e35e50]">03 / Bring us a brief</p><h2 className="serif text-6xl leading-[.85] md:text-8xl">Let’s make<br /><i>something<br />worth feeling.</i></h2><p className="mt-9 max-w-xs leading-relaxed text-[#f5e8d0]/60">No polished brief required. A hunch, a question, a half-formed thought — that’s enough to start.</p></div>
      {sent ? <div className="flex min-h-[420px] flex-col justify-center border-t border-[#f5e8d0]/20 md:border-l md:border-t-0 md:pl-16"><span className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#e35e50] text-[#2b2031]"><Check /></span><h3 className="serif text-6xl">It’s with us.</h3><p className="mt-5 max-w-sm text-[#f5e8d0]/65">Thanks for trusting us with the first step. We’ll read this properly and get back to you soon.</p><button onClick={() => setSent(false)} data-testid="button-send-another" className="mt-10 w-fit border-b border-[#f5e8d0] pb-2 text-sm hover:text-[#e35e50]">Send another note</button></div> :
      <form onSubmit={submit} className="border-t border-[#f5e8d0]/20 md:border-l md:border-t-0 md:pl-16">
        <div className="mb-10 flex gap-2 pt-8 md:pt-0"><button type="button" onClick={() => setKind('order')} data-testid="button-kind-order" className={`rounded-full border px-4 py-2 text-sm transition-colors ${kind === 'order' ? 'border-[#e35e50] bg-[#e35e50] text-[#2b2031]' : 'border-[#f5e8d0]/30'}`}>I have a project</button><button type="button" onClick={() => setKind('contact')} data-testid="button-kind-contact" className={`rounded-full border px-4 py-2 text-sm transition-colors ${kind === 'contact' ? 'border-[#e35e50] bg-[#e35e50] text-[#2b2031]' : 'border-[#f5e8d0]/30'}`}>Just saying hello</button></div>
        <div className="grid gap-8 md:grid-cols-2"><Field label="Your name" value={form.name} onChange={v => update('name', v)} required testId="input-name" /><Field label="Email or Telegram" value={form.contact} onChange={v => update('contact', v)} required testId="input-contact" /></div>
        {kind === 'order' && <div className="mt-8 grid gap-8 md:grid-cols-2"><label className="block"><span className="mb-2 block text-xs text-[#f5e8d0]/60">What do you need?</span><select required value={form.service} onChange={e => update('service', e.target.value)} data-testid="select-service" className="w-full border-b border-[#f5e8d0]/30 bg-transparent py-3 text-sm outline-none focus:border-[#e35e50]"><option value="" className="text-foreground">Choose a direction</option>{services.map(s => <option key={s} className="text-foreground">{s}</option>)}</select></label><Field label="Working budget" value={form.budget} onChange={v => update('budget', v)} testId="input-budget" /></div>}
        <label className="mt-8 block"><span className="mb-2 block text-xs text-[#f5e8d0]/60">Tell us a little about it</span><textarea required minLength={5} value={form.message} onChange={e => update('message', e.target.value)} data-testid="input-message" rows={4} className="w-full resize-none border-b border-[#f5e8d0]/30 bg-transparent py-3 text-sm outline-none focus:border-[#e35e50]" placeholder="What are you trying to make happen?" /></label>
        {create.isError && <p className="mt-5 flex items-center gap-2 text-sm text-[#ff9b8f]"><CircleAlert size={15} /> We couldn’t send that. Please try once more.</p>}
        <button disabled={create.isPending} type="submit" data-testid="button-submit-request" className="mt-10 inline-flex items-center gap-3 bg-[#e35e50] px-6 py-3.5 text-sm font-semibold text-[#2b2031] transition-transform hover:translate-x-1 disabled:opacity-50">{create.isPending ? 'Sending…' : 'Send the brief'} <Send size={16} /></button>
      </form>}
    </div>
  </section>;
}

function Field({ label, value, onChange, required, testId }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; testId: string }) {
  return <label className="block"><span className="mb-2 block text-xs text-[#f5e8d0]/60">{label}</span><input required={required} value={value} onChange={e => onChange(e.target.value)} data-testid={testId} className="w-full border-b border-[#f5e8d0]/30 bg-transparent py-3 text-sm outline-none focus:border-[#e35e50]" /></label>;
}

function Admin() {
  const [, setLocation] = useLocation();
  const session = useGetAdminSession();
  const loggedIn = !!session.data?.authenticated;
  return <div className="min-h-[100dvh] bg-background">{loggedIn ? <Dashboard session={session.data!} onLogout={() => setLocation('/admin')} /> : <AdminLogin loading={session.isLoading} />}</div>;
}

function AdminLogin({ loading }: { loading: boolean }) {
  const bot = useGetTelegramBot();
  const create = useCreateAdminSession();
  const queryClient = useQueryClient();
  const [mock, setMock] = useState(false);
  useEffect(() => {
    (window as Window & { onTelegramAuth?: (data: unknown) => void }).onTelegramAuth = data => create.mutate({ data: data as never }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() }) });
    return () => { delete (window as Window & { onTelegramAuth?: (data: unknown) => void }).onTelegramAuth; };
  }, [create, queryClient]);
  return <div className="grain flex min-h-[100dvh] items-center justify-center px-5 py-10"><div className="w-full max-w-[520px]">
    <Link href="/" data-testid="link-login-back" className="mb-20 block"><Mark /></Link><p className="mono mb-5 text-[10px] uppercase tracking-[.2em] text-accent">Private studio desk</p><h1 className="serif text-7xl leading-[.82] md:text-8xl">Come on in.</h1><p className="mt-7 max-w-sm leading-relaxed text-muted-foreground">A quiet place to keep track of the ideas people have trusted us with.</p>
    <div className="mt-12 border border-border bg-card p-7"><div className="mb-7 flex items-start gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2b2031] text-[#f5e8d0]"><Send size={17} /></span><div><h2 className="font-semibold">Sign in with Telegram</h2><p className="mt-1 text-sm text-muted-foreground">Only the studio account can access this desk.</p></div></div>
      {loading || bot.isLoading ? <div className="h-11 animate-pulse bg-muted" /> : bot.data?.username ? <div className="space-y-3"><div className="flex h-11 items-center justify-center bg-[#2b2031] text-sm text-[#f5e8d0]">{/* Telegram widget mounts here in production */}<button onClick={() => setMock(!mock)} data-testid="button-telegram-login" className="flex h-full w-full items-center justify-center gap-2 hover:bg-[#3a2d42]">Continue with @{bot.data.username} <ExternalLink size={14} /></button></div><p className="text-center text-xs text-muted-foreground">Telegram Login Widget connects securely. {mock && 'Waiting for Telegram verification…'}</p></div> : <p className="text-sm text-destructive">Telegram sign-in is temporarily unavailable.</p>}
      {create.isError && <p className="mt-4 text-sm text-destructive">We couldn’t verify this Telegram account.</p>}
    </div><p className="mt-8 text-xs text-muted-foreground">Not the studio? <Link href="/" data-testid="link-return-home" className="underline hover:text-accent">Return to the portfolio</Link></p>
  </div></div>;
}

function Dashboard({ session, onLogout }: { session: { firstName?: string | null; username?: string | null }; onLogout: () => void }) {
  const queryClient = useQueryClient();
  const logout = useDeleteAdminSession();
  const [status, setStatus] = useState('');
  const [kind, setKind] = useState('');
  const [search, setSearch] = useState('');
  const params = useMemo(() => ({ ...(status ? { status: status as never } : {}), ...(kind ? { kind: kind as never } : {}), ...(search ? { search } : {}) }), [status, kind, search]);
  const dashboard = useGetDashboard();
  const requests = useListRequests(params);
  const update = useUpdateRequest();
  const signOut = () => logout.mutate(undefined, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() }); onLogout(); } });
  const patch = (id: number, next: string) => update.mutate({ id, data: { status: next as never } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey(params) }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); } });
  const metrics = dashboard.data;
  return <div className="grain min-h-[100dvh] bg-[#f0eadb]"><header className="border-b border-border bg-[#2b2031] px-5 py-5 text-[#f5e8d0] md:px-10"><div className="mx-auto flex max-w-[1500px] items-center justify-between"><Link href="/" data-testid="link-dashboard-logo"><Mark /></Link><div className="flex items-center gap-5 text-sm"><span className="hidden text-[#f5e8d0]/60 md:block">Good morning, {session.firstName || session.username || 'there'}</span><button onClick={signOut} data-testid="button-logout" className="border-b border-[#f5e8d0]/50 pb-1 text-xs hover:text-[#e35e50]">Sign out</button></div></div></header>
    <main className="mx-auto max-w-[1500px] px-5 py-10 md:px-10 md:py-14"><div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-accent">Studio desk / requests</p><h1 className="serif text-6xl leading-[.85] md:text-8xl">Keep the thread.</h1></div><p className="max-w-xs text-sm leading-relaxed text-muted-foreground">Every new message is a possible beginning. Stay close to the ones that matter.</p></div>
      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{([
        ['All requests', metrics?.total ?? '—', Inbox],
        ['New today', metrics?.newCount ?? '—', Clock3],
        ['Orders', metrics?.orderCount ?? '—', Paperclip],
        ['Completed', metrics?.completedCount ?? '—', Check],
      ] as [string, string | number, LucideIcon][]).map(([label, value, Icon]) => <div key={label} className="border border-border bg-card p-5"><div className="mb-8 flex justify-between text-muted-foreground"><span className="text-sm">{label}</span><Icon size={17} /></div><strong className="serif text-5xl font-normal">{value}</strong></div>)}</div>
      <div className="mb-10 grid gap-3 border-y border-border py-3 sm:grid-cols-3">
        <div className="px-2 py-2"><p className="mono text-[10px] uppercase tracking-wider text-muted-foreground">All visits</p><strong className="mt-2 block text-2xl">{metrics?.totalVisits ?? '—'}</strong></div>
        <div className="px-2 py-2"><p className="mono text-[10px] uppercase tracking-wider text-muted-foreground">Unique visitors</p><strong className="mt-2 block text-2xl">{metrics?.uniqueVisitors ?? '—'}</strong></div>
        <div className="px-2 py-2"><p className="mono text-[10px] uppercase tracking-wider text-muted-foreground">Visitors today</p><strong className="mt-2 block text-2xl">{metrics?.todayVisitors ?? '—'}</strong></div>
      </div>
      <div className="mb-5 flex flex-col gap-3 border-y border-border py-4 md:flex-row"><div className="relative flex-1"><input value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-requests" placeholder="Search names, contacts, messages…" className="w-full bg-transparent py-2 text-sm outline-none" /></div><select value={status} onChange={e => setStatus(e.target.value)} data-testid="select-filter-status" className="border border-border bg-card px-3 py-2 text-sm"><option value="">Every status</option>{statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select><select value={kind} onChange={e => setKind(e.target.value)} data-testid="select-filter-kind" className="border border-border bg-card px-3 py-2 text-sm"><option value="">All types</option><option value="order">Orders</option><option value="contact">Contacts</option></select></div>
      {requests.isLoading ? <div className="space-y-2">{[1,2,3].map(n => <div key={n} className="h-28 animate-pulse bg-muted" />)}</div> : requests.isError ? <div className="border border-destructive/30 bg-destructive/5 p-8 text-sm text-destructive">Couldn’t load the request list. Refresh to try again.</div> : !requests.data?.length ? <div className="border border-border bg-card p-14 text-center"><PenLine className="mx-auto mb-4 text-accent" /><h2 className="serif text-4xl">Nothing here yet.</h2><p className="mt-2 text-sm text-muted-foreground">Try a different filter, or wait for the next good idea.</p></div> : <div className="space-y-2">{requests.data.map((request, index) => <RequestRow key={request.id} request={request} onStatus={patch} index={index} />)}</div>}
    </main>
  </div>;
}

function RequestRow({ request, onStatus, index }: { request: StudioRequest; onStatus: (id: number, status: string) => void; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return <article className="border border-border bg-card reveal" style={{ animationDelay: `${index * .04}s` }}><button onClick={() => setExpanded(!expanded)} data-testid={`button-expand-request-${request.id}`} className="grid w-full gap-4 p-5 text-left md:grid-cols-[90px_1.1fr_1fr_150px_110px] md:items-center md:px-6"><span className="mono text-[10px] uppercase tracking-wider text-accent">{request.kind}</span><span><strong className="block font-semibold">{request.name}</strong><span className="text-sm text-muted-foreground">{request.contact}</span></span><span className="line-clamp-1 text-sm text-muted-foreground">{request.message}</span><span className="text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span><span className={`justify-self-start px-2 py-1 text-[10px] uppercase tracking-wider md:justify-self-end ${request.status === 'new' ? 'bg-[#e35e50]/15 text-[#b94035]' : request.status === 'completed' ? 'bg-[#4f6f7a]/15 text-[#315864]' : 'bg-muted text-muted-foreground'}`}>{request.status.replace('_', ' ')}</span></button>{expanded && <div className="border-t border-border bg-muted/30 px-5 py-6 md:px-6"><div className="grid gap-7 md:grid-cols-[1fr_240px]"><div><p className="text-sm leading-relaxed">{request.message}</p>{request.service && <p className="mt-5 text-xs text-muted-foreground">Service · <span className="text-foreground">{request.service}</span></p>}{request.budget && <p className="mt-2 text-xs text-muted-foreground">Budget · <span className="text-foreground">{request.budget}</span></p>}</div><label className="text-xs text-muted-foreground">Move to<select value={request.status} onChange={e => onStatus(request.id, e.target.value)} data-testid={`select-status-request-${request.id}`} className="mt-2 w-full border border-border bg-card p-2 text-sm text-foreground"><option value="new">New</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label></div></div>}</article>;
}

function Router() {
  return <Switch><Route path="/" component={Portfolio} /><Route path="/services" component={Services} /><Route path="/admin" component={Admin} /><Route component={NotFound} /></Switch>;
}
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><GlobalOrderCta /><Toaster /></TooltipProvider></QueryClientProvider>; }
export default App;