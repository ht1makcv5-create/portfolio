# Boohx: 3D-чернетка

Дата: 2026-09-08. Оригінал: https://boohx.pp.ua/.

Робота стосується `artifacts/boohx`, який публікує чинний GitHub Pages workflow. Після уточнення власника за основу взято темний Boohx із Cormorant, кремовим текстом та золотими акцентами. Світлий `artifacts/portfolio-site` із вкладеного початкового ТЗ залишено без змін.

## Аудит репозиторію

Перевірено `main`, `gh-pages` та всі наявні на початку роботи feature-гілки:

`2d-ghost-back`, `blob-art-contact`, `boohx-improvements`, `budget-tiers-smaller`, `contact-reorder-and-response-time`, `editorial-polish-font-photo`, `five-visible-photos`, `fix-ci-and-3d-ghost`, `ghost-classic-silhouette`, `ghost-mouth-fix-and-perf`, `green-accent-declutter-art`, `header-glassmorphism`, `hero-services-cta-cards`, `mesh-art-decoration`, `mini-ghost-3d`, `mini-ghost-right`, `more-design-polish`, `order-wizard-and-home-nav`, `pricing-tiers`, `projects-photo-texture`, `revert-2d-mobile-photo-font`, `service-detail-pages`, `services-detail-tariff-tabs`, `services-gauge-rail`, `services-hero-and-team-nav`, `services-smooth-alternating-rail`, `services-thermometer-fill`, `smooth-scroll-and-circular-ghost`, `tariff-section-on-service-pages`, `theme-decorations`, `wizard-email-and-smoothness`.

Усі перелічені feature-гілки вже входили в `main`; переносити невлиті коміти не потрібно. `gh-pages` містила окрему історію зібраного сайту. Серед історичних експериментів знайдено `GhostScene` з React Three Fiber, Drei, плаванням, очима й частинками. У чинному `main` використовується легкий SVG `MiniGhost`. Готових GLB/GLTF/OBJ/FBX моделей у перевірених гілках не знайдено.

Ідею окремого декоративного об'єкта перевикористано, але геометрію, освітлення, керування рухом і резервне відображення реалізовано відповідно до Boohx. Старі гілки та компоненти збережено. З hero прибрано лише підключення `MiniGhost`, щоб він не дублював скульптуру; сам файл не видалено.

## Реалізація

- `artifacts/boohx/src/components/Hero3DObject.tsx`: wrapper, ліниве завантаження, курсор, доступність, видимість, SVG fallback та error boundary.
- `artifacts/boohx/src/components/sculpture/SculptureCanvas.tsx`: Three.js геометрія, матеріал, камера, світло і рух.
- `artifacts/boohx/src/pages/portfolio.tsx`: підключення праворуч у hero і компактно в деталях Frontend-розробки. У Boohx немає окремої послуги Digital Experience.
- `artifacts/boohx/src/index.css`: розміри, орбіта, м'яка тінь і резервна форма.

Об'єкт — процедурна асиметрична скульптура із вираженою талією. Матеріал: тепле золото, roughness 0.38, metalness 0.02; кремове основне світло, золотий контур і слабке зелене заповнення. Немає HDRI, bloom чи додаткового повноекранного Canvas.

Курсор нормалізується відносно контейнера в діапазоні −1…1, а нахил і зміщення наближаються через damping. Після виходу курсора ціль стає нейтральною; положення повертається поступово. Hover плавно збільшує масштаб на 3.5% і трохи підсилює контурне світло. Базовий рух — слабке синусоїдальне плавання та повільне обертання.

Поза viewport або в прихованій вкладці `frameloop="never"`, а обробник курсора знятий. Час руху накопичується лише під час активних кадрів. Важкий модуль не завантажується до першої видимості. DPR обмежено 1–1.5, на мобільному — 1; геометрія спрощується з 72×48 до 40×28 сегментів.

Touch-пристрої не імітують курсор. За reduced motion сцена статична, `frameloop="demand"`. Для saveData, слабкого телефона, відсутності WebGL2, помилки завантаження або втрати контексту залишається легкий SVG із тією ж палітрою. Декорація має `aria-hidden`, фіксовану область і `pointer-events:none`; кнопки доступні незалежно від 3D.

Українські title, description та Open Graph замінили Replit placeholder. Додано `lang="uk"` і синхронізацію з UA/EN, знято обмеження zoom. Усунуто перетин нижнього підпису CTA з карткою на планшеті. Форми, контакти, проєкти, тарифи й адміністративний застосунок не змінено.

## Використання конектора

Через генератор зображень створено референс `artifacts/boohx/public/models/boohx-sculpture-reference.png`. Його збережено в робочій гілці й перевірено як доступний PNG. Конектор to3D викликано з glTF/web у режимах high і fast. Обидві спроби повернули HTTP 400 `Failed to generate 3D model`, без job ID та без моделі. Тому інтегрована геометрія створена кодом Three.js; її не слід називати моделлю, отриманою від to3D. PNG — референс і не завантажується в hero.

## Перевірка та обмеження

- Встановлення залежностей із frozen lockfile, TypeScript і production build перевірено.
- Візуально перевірено desktop 1363px, tablet 768px, mobile 390px і 320px; у 320px `scrollWidth = clientWidth`.
- Перевірено головну, послуги, деталі Frontend, відкриття мобільного меню, UA/EN і перехід форми з першого кроку на другий та назад. Реальну заявку не надсилали.
- У браузері перевірки WebGL недоступний: перевірено SVG fallback, збереження контенту та працездатність CTA. Помилок застосунку в спостереженому журналі не виявлено; були повідомлення розширення браузера.
- Рух WebGL, hover-освітлення, зупинку GPU-кадрів та reduced-motion Canvas потрібно додатково переглянути на пристрої з WebGL2. Підтримку реалізовано в коді, але в цьому браузері візуально не підтверджено. Окрему перевірку 200% browser zoom не виконано.
- Vite попереджає про розмір чанків: Three.js завантажується окремим модулем приблизно 243 KB gzip, лише за потреби.

## Збереження

Робоча гілка: `codex/boohx-3d-draft`. Злиття в `main`, запуск workflow і деплой не виконуються за прямою вказівкою власника. `scripts/build-sites.mjs` готує статичний Boohx для збереження чернетки Sites; попередню команду повної збірки монорепозиторію збережено як `build:workspace`.
