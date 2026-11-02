-- =====================================================================
--  Страницы с редактируемым текстом. Пока одна — «Что такое пептиды» (/peptides).
--  Текст правится в Админке → «Страницы». Русский — в поле content,
--  английский и румынский — в translations (пустое поле заменяется текстом на другом языке).
--
--  Запустите один раз в Supabase → SQL Editor. Повторный запуск безопасен:
--  если страница уже есть, её текст не перезаписывается.
-- =====================================================================

create table if not exists public.pages (
  slug         text primary key check (slug ~ '^[a-z0-9-]+$'),
  title        text not null,                       -- название в админке
  content      jsonb not null default '{}'::jsonb,  -- текст на русском
  translations jsonb not null default '{}'::jsonb,  -- { "en": {...}, "ro": {...} }
  updated_at   timestamptz not null default now()
);

drop trigger if exists pages_touch on public.pages;
create trigger pages_touch before update on public.pages
  for each row execute function public.touch_updated_at();

alter table public.pages enable row level security;

drop policy if exists "pages read" on public.pages;
create policy "pages read" on public.pages
  for select using (true);
drop policy if exists "pages admin" on public.pages;
create policy "pages admin" on public.pages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.pages (slug, title, content, translations) values (
  'peptides',
  'Что такое пептиды',
  '{
  "titleStart": "Что такое",
  "titleAccent": "пептиды",
  "lead": "Главное за пять минут: как устроены пептиды, как они работают и что важно знать до начала курса.",
  "whatTitle": "Короткие цепочки аминокислот",
  "whatText": "В пептиде обычно от 2 до 50 аминокислот. Организм сам вырабатывает тысячи пептидов: они работают как сигнальные молекулы — передают клеткам команды. Например, инсулин и окситоцин — пептидные гормоны.",
  "peptide": "Пептид",
  "peptideText": "2–50 аминокислот. Сигнал: передаёт конкретную команду конкретным клеткам.",
  "protein": "Белок",
  "proteinText": "От 50 до тысяч аминокислот. Строительный материал и ферменты организма.",
  "howTitle": "Как они работают",
  "how": [
    {
      "title": "Находят свой рецептор",
      "text": "Пептид связывается с определённым рецептором на поверхности клетки — как ключ с замком."
    },
    {
      "title": "Запускают ответ клетки",
      "text": "Клетка получает сигнал: например, начать восстановление ткани или выработку гормона."
    },
    {
      "title": "Действуют точечно",
      "text": "У каждого пептида своя задача, поэтому их подбирают под конкретную цель."
    }
  ],
  "areasTitle": "Что изучают",
  "areasNote": "Направления, в которых пептиды активно исследуют. Это не обещание результата: эффект зависит от человека и подбирается со специалистом.",
  "areas": [
    {
      "title": "Восстановление тканей",
      "text": "BPC-157 и TB-500 изучают для заживления мышц, сухожилий и связок.",
      "products": [
        "bpc-157-tb-500",
        "glow"
      ]
    },
    {
      "title": "Иммунитет",
      "text": "Тимозин альфа-1 — пептид вилочковой железы, его изучают для поддержки иммунитета.",
      "products": [
        "thymosin-alpha-1"
      ]
    },
    {
      "title": "Кожа",
      "text": "GHK-Cu (пептид меди) участвует в выработке коллагена, его используют и в косметике.",
      "products": [
        "ghk-cu"
      ]
    },
    {
      "title": "Метаболизм и вес",
      "text": "Тирзепатид — пептидный препарат, одобренный для лечения диабета 2 типа и снижения веса; рядом изучают ретатрутид.",
      "products": [
        "tirzepatide",
        "retatrutide"
      ]
    },
    {
      "title": "Энергия клеток",
      "text": "SS-31 и MOTS-c — митохондриальные пептиды, их изучают в связи с выработкой энергии в клетках и старением.",
      "products": [
        "ss-31",
        "mots-c"
      ]
    },
    {
      "title": "Долголетие",
      "text": "Эпиталон изучают в связи с теломерами и старением клеток (исследования Владимира Хавинсона).",
      "products": [
        "epitalon"
      ]
    }
  ],
  "useTitle": "Как применяют",
  "use": [
    {
      "title": "Подкожные инъекции",
      "text": "Самый частый способ. Пептид во флаконе — сухой порошок (лиофилизат), его растворяют перед применением."
    },
    {
      "title": "Капсулы, спреи, кремы",
      "text": "Некоторые пептиды принимают внутрь, через нос или наносят на кожу — зависит от пептида."
    },
    {
      "title": "Курсами",
      "text": "Пептиды обычно применяют курсами с перерывами. Схему подбирает специалист."
    },
    {
      "title": "В холодильнике",
      "text": "Флаконы хранят в холодильнике при +2…+8 °C."
    }
  ],
  "safetyTitle": "Что важно знать",
  "safety": [
    {
      "title": "Подбор со специалистом",
      "text": "Дозировка зависит от возраста, веса и состояния здоровья. Не начинайте курс без консультации."
    },
    {
      "title": "Возможны побочные эффекты",
      "text": "Например, покраснение в месте укола. О любой реакции сообщайте специалисту."
    },
    {
      "title": "Качество важнее цены",
      "text": "Подделки и неправильно хранившиеся пептиды бесполезны или опасны. Проверяйте сертификат анализа партии."
    },
    {
      "title": "Не замена лечению",
      "text": "Многие пептиды пока изучаются и не зарегистрированы как лекарства. Они не заменяют лечение, назначенное врачом."
    }
  ],
  "faqTitle": "Вопросы",
  "faq": [
    {
      "q": "Пептиды безопасны?",
      "a": "При правильном подборе и под контролем специалиста их обычно хорошо переносят. Но это активные вещества: возможны побочные эффекты и противопоказания."
    },
    {
      "q": "Когда будет результат?",
      "a": "Зависит от пептида и цели — от нескольких дней до нескольких недель или месяцев."
    },
    {
      "q": "Можно вместе с лекарствами?",
      "a": "Часто да, но обязательно расскажите специалисту обо всех лекарствах и добавках, которые принимаете."
    }
  ],
  "ctaTitle": "Не знаете, с чего начать?",
  "ctaText": "Специалист подберёт пептиды под вашу цель и подскажет, какие анализы сдать.",
  "disclaimer": "Информация на странице носит справочный характер и не является медицинской рекомендацией."
}'::jsonb,
  '{
  "en": {
    "titleStart": "What are",
    "titleAccent": "peptides",
    "lead": "The essentials in five minutes: how peptides are built, how they work and what to know before starting a course.",
    "whatTitle": "Short chains of amino acids",
    "whatText": "A peptide usually contains 2 to 50 amino acids. The body produces thousands of them on its own: peptides work as signalling molecules that pass commands to cells. Insulin and oxytocin, for example, are peptide hormones.",
    "peptide": "Peptide",
    "peptideText": "2–50 amino acids. A signal: it passes a specific command to specific cells.",
    "protein": "Protein",
    "proteinText": "From 50 to thousands of amino acids. Building material and enzymes of the body.",
    "howTitle": "How they work",
    "how": [
      {
        "title": "Find their receptor",
        "text": "A peptide binds to a specific receptor on the cell surface — like a key to a lock."
      },
      {
        "title": "Trigger a response",
        "text": "The cell receives the signal: for example, to start tissue repair or produce a hormone."
      },
      {
        "title": "Act precisely",
        "text": "Each peptide has its own task, so they are chosen for a specific goal."
      }
    ],
    "areasTitle": "What they are studied for",
    "areasNote": "Areas where peptides are actively researched. This is not a promise of results: the effect depends on the person and is chosen with a specialist.",
    "areas": [
      {
        "title": "Tissue repair",
        "text": "BPC-157 and TB-500 are studied for the healing of muscles, tendons and ligaments."
      },
      {
        "title": "Immunity",
        "text": "Thymosin alpha-1 is a peptide of the thymus gland, studied to support the immune system."
      },
      {
        "title": "Skin",
        "text": "GHK-Cu (copper peptide) takes part in collagen production and is also used in cosmetics."
      },
      {
        "title": "Metabolism and weight",
        "text": "Tirzepatide is a peptide drug approved for type 2 diabetes and weight loss; retatrutide is being studied alongside it."
      },
      {
        "title": "Cell energy",
        "text": "SS-31 and MOTS-c are mitochondrial peptides studied in connection with cellular energy and ageing."
      },
      {
        "title": "Longevity",
        "text": "Epitalon is studied in connection with telomeres and cell ageing (research by Vladimir Khavinson)."
      }
    ],
    "useTitle": "How they are used",
    "use": [
      {
        "title": "Subcutaneous injections",
        "text": "The most common way. A peptide in a vial is a dry powder (lyophilisate) that is dissolved before use."
      },
      {
        "title": "Capsules, sprays, creams",
        "text": "Some peptides are taken orally, through the nose or applied to the skin — it depends on the peptide."
      },
      {
        "title": "In courses",
        "text": "Peptides are usually taken in courses with breaks. The schedule is chosen by a specialist."
      },
      {
        "title": "In the fridge",
        "text": "Vials are stored in a refrigerator at +2…+8 °C."
      }
    ],
    "safetyTitle": "What is important to know",
    "safety": [
      {
        "title": "Choose with a specialist",
        "text": "The dosage depends on age, weight and health. Do not start a course without a consultation."
      },
      {
        "title": "Side effects are possible",
        "text": "For example, redness at the injection site. Report any reaction to the specialist."
      },
      {
        "title": "Quality matters more than price",
        "text": "Fakes and improperly stored peptides are useless or dangerous. Check the certificate of analysis for the batch."
      },
      {
        "title": "Not a replacement for treatment",
        "text": "Many peptides are still being studied and are not registered as medicines. They do not replace treatment prescribed by a doctor."
      }
    ],
    "faqTitle": "Questions",
    "faq": [
      {
        "q": "Are peptides safe?",
        "a": "With the right choice and a specialist’s supervision, they are usually well tolerated. But they are active substances: side effects and contraindications are possible."
      },
      {
        "q": "When will I see results?",
        "a": "It depends on the peptide and the goal — from a few days to several weeks or months."
      },
      {
        "q": "Can I take them with medications?",
        "a": "Often yes, but be sure to tell the specialist about all medications and supplements you take."
      }
    ],
    "ctaTitle": "Not sure where to start?",
    "ctaText": "A specialist will choose peptides for your goal and tell you which tests to take.",
    "disclaimer": "The information on this page is for reference only and is not medical advice."
  },
  "ro": {
    "titleStart": "Ce sunt",
    "titleAccent": "peptidele",
    "lead": "Esențialul în cinci minute: cum sunt alcătuite peptidele, cum funcționează și ce trebuie să știți înainte de a începe o cură.",
    "whatTitle": "Lanțuri scurte de aminoacizi",
    "whatText": "Un peptid conține de obicei între 2 și 50 de aminoacizi. Organismul produce singur mii de peptide: ele funcționează ca molecule de semnalizare care transmit comenzi celulelor. De exemplu, insulina și oxitocina sunt hormoni peptidici.",
    "peptide": "Peptid",
    "peptideText": "2–50 de aminoacizi. Un semnal: transmite o comandă anume unor celule anume.",
    "protein": "Proteină",
    "proteinText": "De la 50 la mii de aminoacizi. Material de construcție și enzime ale organismului.",
    "howTitle": "Cum funcționează",
    "how": [
      {
        "title": "Își găsesc receptorul",
        "text": "Peptidul se leagă de un anumit receptor de pe suprafața celulei — ca o cheie de lacăt."
      },
      {
        "title": "Declanșează un răspuns",
        "text": "Celula primește semnalul: de exemplu, să înceapă refacerea țesutului sau producerea unui hormon."
      },
      {
        "title": "Acționează țintit",
        "text": "Fiecare peptid are rolul său, de aceea se aleg pentru un obiectiv anume."
      }
    ],
    "areasTitle": "Pentru ce sunt studiate",
    "areasNote": "Direcții în care peptidele sunt cercetate activ. Nu este o promisiune de rezultat: efectul depinde de persoană și se alege împreună cu un specialist.",
    "areas": [
      {
        "title": "Refacerea țesuturilor",
        "text": "BPC-157 și TB-500 sunt studiate pentru vindecarea mușchilor, tendoanelor și ligamentelor."
      },
      {
        "title": "Imunitate",
        "text": "Timozina alfa-1 este un peptid al timusului, studiat pentru susținerea imunității."
      },
      {
        "title": "Piele",
        "text": "GHK-Cu (peptidul de cupru) participă la producerea colagenului și este folosit și în cosmetică."
      },
      {
        "title": "Metabolism și greutate",
        "text": "Tirzepatida este un medicament peptidic aprobat pentru diabetul de tip 2 și scăderea în greutate; alături de ea este studiată retatrutida."
      },
      {
        "title": "Energia celulelor",
        "text": "SS-31 și MOTS-c sunt peptide mitocondriale, studiate în legătură cu producerea de energie în celule și îmbătrânirea."
      },
      {
        "title": "Longevitate",
        "text": "Epitalonul este studiat în legătură cu telomerii și îmbătrânirea celulelor (cercetările lui Vladimir Havinson)."
      }
    ],
    "useTitle": "Cum se folosesc",
    "use": [
      {
        "title": "Injecții subcutanate",
        "text": "Cea mai frecventă cale. Peptidul din flacon este o pulbere uscată (liofilizat), care se dizolvă înainte de utilizare."
      },
      {
        "title": "Capsule, spray-uri, creme",
        "text": "Unele peptide se iau pe cale orală, nazală sau se aplică pe piele — depinde de peptid."
      },
      {
        "title": "În cure",
        "text": "Peptidele se folosesc de obicei în cure, cu pauze. Schema o alege specialistul."
      },
      {
        "title": "La frigider",
        "text": "Flacoanele se păstrează la frigider, la +2…+8 °C."
      }
    ],
    "safetyTitle": "Ce este important de știut",
    "safety": [
      {
        "title": "Alegerea cu un specialist",
        "text": "Doza depinde de vârstă, greutate și starea de sănătate. Nu începeți o cură fără consultație."
      },
      {
        "title": "Sunt posibile efecte adverse",
        "text": "De exemplu, roșeață la locul injecției. Spuneți specialistului despre orice reacție."
      },
      {
        "title": "Calitatea contează mai mult decât prețul",
        "text": "Falsurile și peptidele păstrate greșit sunt inutile sau periculoase. Verificați certificatul de analiză al lotului."
      },
      {
        "title": "Nu înlocuiesc tratamentul",
        "text": "Multe peptide sunt încă studiate și nu sunt înregistrate ca medicamente. Ele nu înlocuiesc tratamentul prescris de medic."
      }
    ],
    "faqTitle": "Întrebări",
    "faq": [
      {
        "q": "Sunt peptidele sigure?",
        "a": "Alese corect și sub controlul unui specialist, sunt de obicei bine tolerate. Dar sunt substanțe active: sunt posibile efecte adverse și contraindicații."
      },
      {
        "q": "Când apare rezultatul?",
        "a": "Depinde de peptid și de obiectiv — de la câteva zile la câteva săptămâni sau luni."
      },
      {
        "q": "Se pot lua împreună cu medicamente?",
        "a": "Adesea da, dar spuneți-i neapărat specialistului despre toate medicamentele și suplimentele pe care le luați."
      }
    ],
    "ctaTitle": "Nu știți de unde să începeți?",
    "ctaText": "Specialistul alege peptidele pentru obiectivul dvs. și vă spune ce analize să faceți.",
    "disclaimer": "Informațiile de pe această pagină au caracter informativ și nu reprezintă o recomandare medicală."
  }
}'::jsonb
)
on conflict (slug) do nothing;

-- Проверка
select slug, title, updated_at from public.pages;
