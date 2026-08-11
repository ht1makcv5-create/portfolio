import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Lang = 'en' | 'uk';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SERVICE_OPTIONS_UK = ['Лендінг', 'Корпоративний сайт', 'Інтернет-магазин', 'UI/UX дизайн', 'Брендинг', 'Запуск / підтримка'];
const SERVICE_OPTIONS_EN = ['Landing page', 'Corporate site', 'Online store', 'UI/UX design', 'Branding', 'Launch / support'];

const PACKAGE_OPTIONS_UK = ['Базовий', 'Професійний', 'Максимальний'];
const PACKAGE_OPTIONS_EN = ['Basic', 'Professional', 'Full-scope'];

const BUDGET_OPTIONS_UK = ['до 1 000 ₴', '1 000 – 2 500 ₴', '2 500 – 5 000 ₴', '5 000 ₴+'];
const BUDGET_OPTIONS_EN = ['up to ₴1,000', '₴1,000 – 2,500', '₴2,500 – 5,000', '₴5,000+'];

interface WizardState {
  service: string;
  pkg: string;
  budget: string;
  message: string;
  deadline: string;
  name: string;
  phone: string;
  telegram: string;
}

const EMPTY_STATE: WizardState = {
  service: '', pkg: '', budget: '', message: '', deadline: '', name: '', phone: '', telegram: '',
};

export default function OrderWizard({ lang }: { lang: Lang }) {
  const isUk = lang === 'uk';
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<WizardState>(EMPTY_STATE);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [lastUrl, setLastUrl] = useState('');
  const [attempted, setAttempted] = useState(false);

  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const steps = isUk
    ? ['Що потрібно', 'Пакет і бюджет', 'Про проєкт', 'Контакти']
    : ['What you need', 'Package & budget', 'About the project', 'Contacts'];

  const summaries = [data.service, data.pkg && data.budget ? `${data.pkg} · ${data.budget}` : data.pkg || data.budget, data.message ? '✓' : '', data.name];

  const services = isUk ? SERVICE_OPTIONS_UK : SERVICE_OPTIONS_EN;
  const packages = isUk ? PACKAGE_OPTIONS_UK : PACKAGE_OPTIONS_EN;
  const budgets = isUk ? BUDGET_OPTIONS_UK : BUDGET_OPTIONS_EN;

  const goto = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(Math.max(0, Math.min(3, n)));
  };

  const buildMessage = () => {
    const lines = [
      `🌐 ${isUk ? 'Заявка на сайт' : 'Website inquiry'}`,
      data.service ? `🏷 ${isUk ? 'Потрібно' : 'Need'}: ${data.service}` : '',
      data.pkg ? `📦 ${isUk ? 'Пакет' : 'Package'}: ${data.pkg}` : '',
      data.budget ? `💰 ${isUk ? 'Бюджет' : 'Budget'}: ${data.budget}` : '',
      data.message.trim() ? `📝 ${isUk ? 'Про проєкт' : 'About'}: ${data.message.trim()}` : '',
      data.deadline.trim() ? `⏱ ${isUk ? 'Дедлайн' : 'Deadline'}: ${data.deadline.trim()}` : '',
      `👤 ${isUk ? "Ім'я" : 'Name'}: ${data.name.trim()}`,
      data.phone.trim() ? `📱 ${isUk ? 'Телефон' : 'Phone'}: ${data.phone.trim()}` : '',
      data.telegram.trim() ? `Telegram: ${data.telegram.trim()}` : '',
    ].filter(Boolean);
    return lines.join('\n');
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    setAttempted(true);
    if (data.name.trim().length < 2 || data.phone.trim().length < 5) {
      goto(3);
      return;
    }
    const url = `https://t.me/sefice?text=${encodeURIComponent(buildMessage())}`;
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      setSendError(true);
      setLastUrl(url);
      return;
    }
    setSendError(false);
    setSent(true);
  };

  const cardBase =
    'rounded-sm border border-[hsl(var(--border))] p-5 text-left font-sans text-sm text-[hsl(var(--foreground))] transition-colors duration-300 hover:border-[hsl(var(--primary)_/_0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]';
  const cardActive = 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)_/_0.08)]';

  if (sent) {
    return (
      <div className="rounded-sm border border-[hsl(var(--border))] p-10 text-center" data-testid="text-wizard-sent">
        <p className="font-serif text-3xl italic text-[hsl(var(--foreground))]">
          {isUk ? 'Telegram відкрито — надішли повідомлення!' : 'Telegram opened — hit send!'}
        </p>
        <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
          {isUk ? 'Якщо вікно не відкрилось, напиши напряму: @sefice' : "If it didn't open, message directly: @sefice"}
        </p>
        <button
          onClick={() => { setSent(false); setData(EMPTY_STATE); setStep(0); setAttempted(false); }}
          data-testid="button-wizard-again"
          className="mt-6 border-b border-[hsl(var(--foreground))] pb-1 text-sm hover:text-[hsl(var(--primary))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
        >
          {isUk ? 'Надіслати ще одну заявку' : 'Send another request'}
        </button>
      </div>
    );
  }

  if (sendError) {
    return (
      <div className="rounded-sm border border-[hsl(var(--border))] p-10 text-center" role="alert" data-testid="text-wizard-error">
        <p className="font-serif text-2xl italic text-[hsl(var(--foreground))]">
          {isUk ? 'Браузер заблокував спливаюче вікно' : 'Your browser blocked the pop-up'}
        </p>
        <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
          {isUk ? 'Дані заявки збережені — просто відкрий Telegram вручну.' : 'Your details are saved — just open Telegram manually.'}
        </p>
        <a
          href={lastUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { setSendError(false); setSent(true); }}
          data-testid="link-wizard-fallback"
          className="mt-6 inline-block border border-[hsl(var(--primary)_/_0.6)] bg-[hsl(var(--primary)_/_0.1)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary)_/_0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
        >
          {isUk ? 'Відкрити Telegram' : 'Open Telegram'}
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-[220px_1fr] md:gap-16">
      {/* Sidebar */}
      <div>
        <h3 className="font-serif text-3xl italic text-[hsl(var(--foreground))]">{isUk ? 'Заявка' : 'Request'}</h3>
        <p className="mt-1 font-mono text-xs text-[hsl(var(--primary))]">
          {String(step + 1).padStart(2, '0')} {isUk ? 'з' : 'of'} 04
        </p>
        <div className="mt-6 divide-y divide-[hsl(var(--border))] border-t border-[hsl(var(--border))]">
          {steps.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => goto(i)}
              data-testid={`button-wizard-step-${i}`}
              className={`flex w-full items-center justify-between py-3 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))] ${
                i === step ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'
              }`}
            >
              <span>
                <span className="mr-2 font-mono text-xs opacity-60">{String(i + 1).padStart(2, '0')}</span>
                {label}
              </span>
              {summaries[i] && <span className="ml-2 truncate text-xs text-[hsl(var(--primary))]">{summaries[i]}</span>}
            </button>
          ))}
        </div>
        <p className="mt-6 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
          {isUk ? 'Відповідаю особисто, без ботів' : 'I reply personally, no bots'}
        </p>
      </div>

      {/* Step content */}
      <form onSubmit={submit} className="overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -24 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {step === 0 && (
              <div>
                <h4 className="font-serif text-3xl italic text-[hsl(var(--foreground))] md:text-4xl">
                  {isUk ? 'Що тобі потрібно?' : 'What do you need?'}
                </h4>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                  {isUk ? 'Обери напрям. Якщо ще не визначився — нормально, познач це.' : "Pick a direction. If you're not sure yet — that's fine too."}
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {services.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('service', s)}
                      data-testid={`button-wizard-service-${s}`}
                      className={`${cardBase} ${data.service === s ? cardActive : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => set('service', isUk ? 'Ще не визначився' : 'Not sure yet')}
                    data-testid="button-wizard-service-unsure"
                    className={`${cardBase} col-span-2 md:col-span-3 ${data.service.includes(isUk ? 'не визначився' : 'Not sure') ? cardActive : ''}`}
                  >
                    {isUk ? 'Ще не визначився' : 'Not sure yet'}
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h4 className="font-serif text-3xl italic text-[hsl(var(--foreground))] md:text-4xl">
                  {isUk ? 'Який пакет?' : 'Which package?'}
                </h4>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                  {isUk ? 'Різниця — у глибині опрацювання деталей.' : 'The difference is in how deep the polish goes.'}
                </p>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {packages.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => set('pkg', p)}
                      data-testid={`button-wizard-package-${p}`}
                      className={`${cardBase} ${data.pkg === p ? cardActive : ''}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => set('pkg', isUk ? 'Ще не знаю' : 'Not sure')}
                  data-testid="button-wizard-package-unsure"
                  className={`${cardBase} mt-3 block w-full ${data.pkg === (isUk ? 'Ще не знаю' : 'Not sure') ? cardActive : ''}`}
                >
                  {isUk ? 'Ще не знаю' : 'Not sure'}
                </button>

                <AnimatePresence>
                  {data.pkg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      <h5 className="font-serif text-xl italic text-[hsl(var(--foreground))]">
                        {isUk ? 'На який бюджет орієнтуєшся?' : 'What budget are you thinking?'}
                      </h5>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {budgets.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => set('budget', b)}
                            data-testid={`button-wizard-budget-${b}`}
                            className={`${cardBase} ${data.budget === b ? cardActive : ''}`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => set('budget', isUk ? 'Поки не визначився' : 'Not sure yet')}
                        data-testid="button-wizard-budget-unsure"
                        className={`${cardBase} mt-3 block w-full ${data.budget === (isUk ? 'Поки не визначився' : 'Not sure yet') ? cardActive : ''}`}
                      >
                        {isUk ? 'Поки не визначився' : 'Not sure yet'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {step === 2 && (
              <div>
                <h4 className="font-serif text-3xl italic text-[hsl(var(--foreground))] md:text-4xl">
                  {isUk ? 'Розкажи про проєкт' : 'Tell me about the project'}
                </h4>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                  {isUk ? 'Що за бізнес, для кого сайт, посилання на чинний сайт чи Instagram теж допоможе.' : 'What kind of business, who the site is for — a link to an existing site or Instagram helps too.'}
                </p>
                <textarea
                  value={data.message}
                  onChange={(e) => set('message', e.target.value)}
                  rows={5}
                  data-testid="input-wizard-message"
                  className="mt-6 w-full resize-none border-b border-[hsl(var(--border))] bg-transparent py-2 text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
                />
                <label className="mt-6 block">
                  <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                    {isUk ? 'Дедлайн' : 'Deadline'} <span className="normal-case opacity-60">({isUk ? 'не обов\'язково' : 'optional'})</span>
                  </span>
                  <input
                    value={data.deadline}
                    onChange={(e) => set('deadline', e.target.value)}
                    placeholder={isUk ? 'Наприклад: до кінця місяця' : 'E.g.: by end of month'}
                    data-testid="input-wizard-deadline"
                    className="mt-2 w-full border-b border-[hsl(var(--border))] bg-transparent py-2 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)_/_0.4)] focus:border-[hsl(var(--primary))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
                  />
                </label>
              </div>
            )}

            {step === 3 && (
              <div>
                <h4 className="font-serif text-3xl italic text-[hsl(var(--foreground))] md:text-4xl">
                  {isUk ? 'Як з тобою зв\'язатись?' : 'How to reach you?'}
                </h4>
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">{isUk ? "Ім'я" : 'Name'}</span>
                    <input
                      required
                      value={data.name}
                      onChange={(e) => set('name', e.target.value)}
                      placeholder={isUk ? 'Як до тебе звертатись' : 'What should I call you'}
                      data-testid="input-wizard-name"
                      className="mt-2 w-full border-b border-[hsl(var(--border))] bg-transparent py-2 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)_/_0.4)] focus:border-[hsl(var(--primary))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">{isUk ? 'Телефон' : 'Phone'}</span>
                    <input
                      required
                      type="tel"
                      value={data.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+380 00 000 00 00"
                      data-testid="input-wizard-phone"
                      className="mt-2 w-full border-b border-[hsl(var(--border))] bg-transparent py-2 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)_/_0.4)] focus:border-[hsl(var(--primary))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                      Telegram <span className="normal-case opacity-60">({isUk ? 'не обов\'язково' : 'optional'})</span>
                    </span>
                    <input
                      value={data.telegram}
                      onChange={(e) => set('telegram', e.target.value)}
                      placeholder="@username"
                      data-testid="input-wizard-telegram"
                      className="mt-2 w-full border-b border-[hsl(var(--border))] bg-transparent py-2 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)_/_0.4)] focus:border-[hsl(var(--primary))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
                    />
                  </label>
                </div>
                {attempted && (data.name.trim().length < 2 || data.phone.trim().length < 5) && (
                  <p className="mt-4 text-sm text-red-400" role="alert">
                    {isUk ? "Вкажи ім'я та телефон, щоб надіслати заявку." : 'Please add your name and phone to submit.'}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <div className="mt-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => goto(step - 1)}
            disabled={step === 0}
            data-testid="button-wizard-back"
            className="font-sans text-xs uppercase tracking-[0.25em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] disabled:opacity-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
          >
            ← {isUk ? 'Назад' : 'Back'}
          </button>
          <div className="flex items-center gap-3">
            {step < 3 && (
              <button
                type="button"
                onClick={() => goto(step + 1)}
                data-testid="button-wizard-next"
                className="border border-[hsl(var(--border))] px-6 py-3 font-sans text-xs uppercase tracking-[0.25em] text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(var(--primary))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
              >
                {isUk ? 'Далі' : 'Next'} →
              </button>
            )}
            <button
              type="submit"
              data-testid="button-wizard-submit"
              className="bg-[hsl(var(--primary))] px-6 py-3 font-sans text-xs uppercase tracking-[0.25em] text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--primary))]"
            >
              {isUk ? 'Надіслати заявку' : 'Send request'} →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
