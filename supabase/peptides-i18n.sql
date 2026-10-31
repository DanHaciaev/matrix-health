-- =====================================================================
--  Английские и румынские тексты для 15 пептидов из peptides.sql,
--  категории «Пептиды» и слогана магазина.
--
--  Порядок: schema.sql → i18n.sql → peptides.sql → этот файл.
--  Повторный запуск перезапишет переводы этих товаров
--  (ручные правки переводов в админке будут заменены).
-- =====================================================================

-- Категория
update public.categories
   set translations = '{
     "en": { "name": "Peptides", "description": "Lyophilized powders in vials" },
     "ro": { "name": "Peptide",  "description": "Liofilizate în flacoane" }
   }'::jsonb
 where slug = 'peptides';

-- Слоган магазина (если он не менялся вручную)
update public.settings
   set translations = coalesce(translations, '{}'::jsonb) || '{
     "en": { "tagline": "Peptides with laboratory documents for every batch" },
     "ro": { "tagline": "Peptide cu documente de laborator pentru fiecare lot" }
   }'::jsonb
 where id = 1;

-- Товары
with v (slug, kind, en_name, en_short, en_desc, en_comp, ro_name, ro_short, ro_desc, ro_comp) as (
values
-- 1 ─────────────────────────────────────────────────────────────────
('glow', 'research',
 'GLOW (GHK-Cu + BPC-157 + TB-500)',
 'A combined lyophilizate of three peptides in one vial: the copper tripeptide GHK-Cu, BPC-157 and TB-500.',
 'GLOW is a blend of three peptides that are usually studied separately.

GHK-Cu is the naturally occurring tripeptide glycyl-histidyl-lysine bound to a copper ion. It is found in human blood plasma and is known from research on skin repair.

BPC-157 is a synthetic 15-amino-acid peptide, a fragment of a protein from gastric juice. TB-500 is a synthetic fragment of the protein thymosin beta-4.

Data on the effects of the components come mainly from cell and animal studies. There are no clinical studies of this combination in humans.',
 array['GHK-Cu (copper tripeptide)', 'BPC-157', 'TB-500 (thymosin β4 fragment)'],
 'GLOW (GHK-Cu + BPC-157 + TB-500)',
 'Liofilizat combinat din trei peptide într-un singur flacon: tripeptida cu cupru GHK-Cu, BPC-157 și TB-500.',
 'GLOW este un amestec de trei peptide care de obicei sunt studiate separat.

GHK-Cu este tripeptida naturală glicil-histidil-lizină legată de un ion de cupru. Se găsește în plasma sângelui uman și este cunoscută din cercetările privind refacerea pielii.

BPC-157 este o peptidă sintetică din 15 aminoacizi, un fragment al unei proteine din sucul gastric. TB-500 este un fragment sintetic al proteinei timozină beta-4.

Datele despre efectele componentelor provin în principal din studii pe celule și animale. Nu există studii clinice ale acestei combinații la om.',
 array['GHK-Cu (tripeptidă cu cupru)', 'BPC-157', 'TB-500 (fragment de timozină β4)']),

-- 2 ─────────────────────────────────────────────────────────────────
('ss-31', 'research',
 'SS-31 (elamipretide)',
 'A tetrapeptide that accumulates in the inner mitochondrial membrane.',
 'SS-31 (international name: elamipretide) is the synthetic tetrapeptide D-Arg-Dmt-Lys-Phe-NH2, where Dmt is 2,6-dimethyltyrosine.

The peptide enters cells and binds to cardiolipin, a lipid of the inner mitochondrial membrane. It is being studied in clinical trials in rare mitochondrial diseases.',
 array['SS-31 (elamipretide)'],
 'SS-31 (elamipretidă)',
 'Tetrapeptidă care se acumulează în membrana internă a mitocondriilor.',
 'SS-31 (denumire internațională — elamipretidă) este tetrapeptida sintetică D-Arg-Dmt-Lys-Phe-NH2, unde Dmt este 2,6-dimetiltirozina.

Peptida pătrunde în celule și se leagă de cardiolipină, un lipid al membranei mitocondriale interne. Este studiată în studii clinice în boli mitocondriale rare.',
 array['SS-31 (elamipretidă)']),

-- 3 ─────────────────────────────────────────────────────────────────
('bpc-157-tb-500', 'research',
 'BPC-157 + TB-500',
 'Two peptides in one vial: BPC-157 and a fragment of thymosin beta-4 (TB-500).',
 'BPC-157 (Body Protection Compound) is a synthetic 15-amino-acid peptide (Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val), a fragment of a protein isolated from gastric juice.

TB-500 is a synthetic fragment of thymosin beta-4, a protein involved in reorganizing the cell cytoskeleton.

Both peptides are being studied in preclinical research (in cells and animals) in connection with tissue repair. They are not registered as medicines.',
 array['BPC-157', 'TB-500 (thymosin β4 fragment)'],
 'BPC-157 + TB-500',
 'Două peptide într-un singur flacon: BPC-157 și un fragment de timozină beta-4 (TB-500).',
 'BPC-157 (Body Protection Compound) este o peptidă sintetică din 15 aminoacizi (Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val), un fragment al unei proteine izolate din sucul gastric.

TB-500 este un fragment sintetic al timozinei beta-4, o proteină implicată în reorganizarea citoscheletului celular.

Ambele peptide sunt studiate în cercetări preclinice (pe celule și animale) în legătură cu refacerea țesuturilor. Nu sunt înregistrate ca medicamente.',
 array['BPC-157', 'TB-500 (fragment de timozină β4)']),

-- 4 ─────────────────────────────────────────────────────────────────
('ipamorelin', 'research',
 'Ipamorelin',
 'A pentapeptide — a selective agonist of the ghrelin receptor.',
 'Ipamorelin is the synthetic pentapeptide Aib-His-D-2-Nal-D-Phe-Lys-NH2.

It binds to the ghrelin receptor (GHSR-1a) in the pituitary gland and stimulates the release of growth hormone. In studies it was notably selective: it had little effect on cortisol and ACTH levels.

It has been studied in clinical trials and is not registered as a medicine.',
 array['Ipamorelin'],
 'Ipamorelină',
 'Pentapeptidă — agonist selectiv al receptorului grelinei.',
 'Ipamorelina este pentapeptida sintetică Aib-His-D-2-Nal-D-Phe-Lys-NH2.

Se leagă de receptorul grelinei (GHSR-1a) din hipofiză și stimulează eliberarea hormonului de creștere. În studii s-a remarcat prin selectivitate: a influențat slab nivelul de cortizol și ACTH.

A fost studiată în studii clinice și nu este înregistrată ca medicament.',
 array['Ipamorelină']),

-- 5 ─────────────────────────────────────────────────────────────────
('5-amino-1mq', 'research',
 '5-Amino-1MQ',
 'A small-molecule inhibitor of the NNMT enzyme. Not a peptide, but sold in the same line.',
 '5-Amino-1MQ (5-amino-1-methylquinolinium) is a small molecule, not a peptide.

It inhibits the enzyme nicotinamide N-methyltransferase (NNMT), which is active in adipose tissue. Studies have been carried out in cells and mice; there are no clinical studies in humans.',
 array['5-Amino-1MQ'],
 '5-Amino-1MQ',
 'Inhibitor cu moleculă mică al enzimei NNMT. Nu este peptidă, dar se vinde în aceeași gamă.',
 '5-Amino-1MQ (5-amino-1-metilchinoliniu) este o moleculă mică, nu o peptidă.

Inhibă enzima nicotinamid-N-metiltransferaza (NNMT), activă în țesutul adipos. Studiile au fost efectuate pe celule și șoareci; nu există studii clinice la om.',
 array['5-Amino-1MQ']),

-- 6 ─────────────────────────────────────────────────────────────────
('thymosin-alpha-1', 'research',
 'Thymosin alpha-1',
 'A 28-amino-acid peptide originally isolated from thymus tissue.',
 'Thymosin alpha-1 is a 28-amino-acid peptide first isolated from the thymus gland.

Its synthetic form, thymalfasin, is registered in a number of countries as an immunomodulating medicine, mainly for chronic viral hepatitis.',
 array['Thymosin alpha-1'],
 'Timozină alfa-1',
 'Peptidă din 28 de aminoacizi, izolată inițial din țesutul timusului.',
 'Timozina alfa-1 este o peptidă din 28 de aminoacizi, izolată pentru prima dată din timus.

Forma sa sintetică, timalfasina, este înregistrată în mai multe țări ca medicament imunomodulator, în principal pentru hepatitele virale cronice.',
 array['Timozină alfa-1']),

-- 7 ─────────────────────────────────────────────────────────────────
('retatrutide', 'investigational',
 'Retatrutide',
 'A triple agonist of the GIP, GLP-1 and glucagon receptors. In clinical development.',
 'Retatrutide is a synthetic peptide by Eli Lilly that activates three receptors at once: GIP, GLP-1 and glucagon.

It is in phase III clinical trials for obesity and type 2 diabetes. At the time this description was written, it is not registered as a medicine.',
 array['Retatrutide'],
 'Retatrutidă',
 'Triplu agonist al receptorilor GIP, GLP-1 și glucagonului. În dezvoltare clinică.',
 'Retatrutida este o peptidă sintetică a companiei Eli Lilly care activează simultan trei receptori: GIP, GLP-1 și glucagonul.

Se află în studii clinice de fază III pentru obezitate și diabet zaharat de tip 2. La momentul redactării descrierii nu este înregistrată ca medicament.',
 array['Retatrutidă']),

-- 8 ─────────────────────────────────────────────────────────────────
('tirzepatide', 'rx',
 'Tirzepatide',
 'A dual agonist of the GIP and GLP-1 receptors. The active substance of the prescription medicines Mounjaro and Zepbound.',
 'Tirzepatide is a synthetic peptide by Eli Lilly that activates the receptors of two gut hormones: GIP and GLP-1.

It is registered as a prescription medicine: Mounjaro for type 2 diabetes and Zepbound for obesity.',
 array['Tirzepatide'],
 'Tirzepatidă',
 'Agonist dublu al receptorilor GIP și GLP-1. Substanța activă a medicamentelor cu prescripție Mounjaro și Zepbound.',
 'Tirzepatida este o peptidă sintetică a companiei Eli Lilly care activează receptorii a doi hormoni intestinali: GIP și GLP-1.

Este înregistrată ca medicament eliberat pe bază de rețetă: Mounjaro — pentru diabetul zaharat de tip 2, Zepbound — pentru obezitate.',
 array['Tirzepatidă']),

-- 9 ─────────────────────────────────────────────────────────────────
('cagrilintide', 'investigational',
 'Cagrilintide',
 'A long-acting amylin analogue. In clinical development.',
 'Cagrilintide is a long-acting synthetic analogue of the hormone amylin developed by Novo Nordisk.

It is being studied in clinical trials for obesity, alone and in combination with semaglutide (CagriSema). At the time this description was written, it is not registered as a medicine.',
 array['Cagrilintide'],
 'Cagrilintidă',
 'Analog al amilinei cu acțiune prelungită. În dezvoltare clinică.',
 'Cagrilintida este un analog sintetic cu acțiune prelungită al hormonului amilină, dezvoltat de compania Novo Nordisk.

Este studiată în studii clinice pentru obezitate — separat și în combinație cu semaglutida (CagriSema). La momentul redactării descrierii nu este înregistrată ca medicament.',
 array['Cagrilintidă']),

-- 10 ────────────────────────────────────────────────────────────────
('mots-c', 'research',
 'MOTS-c',
 'A 16-amino-acid peptide encoded in mitochondrial DNA.',
 'MOTS-c is a 16-amino-acid peptide (Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg) encoded in mitochondrial DNA. It was described in 2015.

It is being studied in connection with the regulation of metabolism and insulin sensitivity; most data come from animal studies.',
 array['MOTS-c'],
 'MOTS-c',
 'Peptidă din 16 aminoacizi, codificată în ADN-ul mitocondrial.',
 'MOTS-c este o peptidă din 16 aminoacizi (Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg), codificată în ADN-ul mitocondrial. A fost descrisă în 2015.

Este studiată în legătură cu reglarea metabolismului și sensibilitatea la insulină; majoritatea datelor provin din studii pe animale.',
 array['MOTS-c']),

-- 11 ────────────────────────────────────────────────────────────────
('nad-plus', 'research',
 'NAD+',
 'Nicotinamide adenine dinucleotide — a coenzyme of cellular energy metabolism. Not a peptide.',
 'NAD+ (nicotinamide adenine dinucleotide) is a coenzyme present in all living cells. It takes part in the redox reactions of energy metabolism and serves as a substrate for sirtuin and PARP enzymes.

According to studies, NAD+ levels in tissues decline with age.',
 array['NAD+ (nicotinamide adenine dinucleotide)'],
 'NAD+',
 'Nicotinamid adenin dinucleotid — coenzimă a metabolismului energetic celular. Nu este peptidă.',
 'NAD+ (nicotinamid adenin dinucleotid) este o coenzimă prezentă în toate celulele vii. Participă la reacțiile de oxido-reducere ale metabolismului energetic și servește drept substrat pentru enzimele sirtuine și PARP.

Conform studiilor, nivelul NAD+ în țesuturi scade odată cu vârsta.',
 array['NAD+ (nicotinamid adenin dinucleotid)']),

-- 12 ────────────────────────────────────────────────────────────────
('oxytocin', 'rx_hormone',
 'Oxytocin',
 'A 9-amino-acid peptide hormone of the hypothalamus.',
 'Oxytocin is the nonapeptide Cys-Tyr-Ile-Gln-Asn-Cys-Pro-Leu-Gly-NH2 with a disulfide bond between the cysteine residues. It is produced in the hypothalamus and released by the posterior pituitary gland.

In medicine it is used as a prescription drug, mainly in obstetrics.',
 array['Oxytocin'],
 'Oxitocină',
 'Hormon peptidic al hipotalamusului din 9 aminoacizi.',
 'Oxitocina este nonapeptida Cys-Tyr-Ile-Gln-Asn-Cys-Pro-Leu-Gly-NH2, cu o legătură disulfidică între resturile de cisteină. Este produsă în hipotalamus și eliberată de lobul posterior al hipofizei.

În medicină se folosește ca medicament cu prescripție, în principal în obstetrică.',
 array['Oxitocină']),

-- 13 ────────────────────────────────────────────────────────────────
('selank', 'research',
 'Selank',
 'A heptapeptide — a synthetic analogue of tuftsin.',
 'Selank is the synthetic heptapeptide Thr-Lys-Pro-Arg-Pro-Gly-Pro. It is based on the natural peptide tuftsin, extended with a Pro-Gly-Pro fragment for greater stability.

It was developed at the Institute of Molecular Genetics of the Russian Academy of Sciences. In Russia it is registered as a medicine in the form of nasal drops.',
 array['Selank'],
 'Selank',
 'Heptapeptidă — analog sintetic al tuftsinei.',
 'Selank este heptapeptida sintetică Thr-Lys-Pro-Arg-Pro-Gly-Pro. Are la bază peptida naturală tuftsină, la care s-a adăugat fragmentul Pro-Gly-Pro pentru o stabilitate mai mare.

A fost dezvoltat la Institutul de Genetică Moleculară al Academiei de Științe a Rusiei. În Rusia este înregistrat ca medicament sub formă de picături nazale.',
 array['Selank']),

-- 14 ────────────────────────────────────────────────────────────────
('epitalon', 'research',
 'Epitalon',
 'The tetrapeptide Ala-Glu-Asp-Gly, created on the basis of a pineal gland extract.',
 'Epitalon is the synthetic tetrapeptide Ala-Glu-Asp-Gly. It was created at the Saint Petersburg Institute of Bioregulation and Gerontology (V. Khavinson) on the basis of epithalamin, an extract of the pineal gland.

It is being studied in connection with ageing; most data come from cell and animal studies.',
 array['Epitalon'],
 'Epitalon',
 'Tetrapeptida Ala-Glu-Asp-Gly, creată pe baza unui extract din glanda pineală.',
 'Epitalonul este tetrapeptida sintetică Ala-Glu-Asp-Gly. A fost creat la Institutul de Bioreglare și Gerontologie din Sankt Petersburg (V. Havinson) pe baza epitalaminei — un extract din glanda pineală (epifiză).

Este studiat în legătură cu procesele de îmbătrânire; majoritatea datelor provin din studii pe celule și animale.',
 array['Epitalon']),

-- 15 ────────────────────────────────────────────────────────────────
('ghk-cu', 'research',
 'GHK-Cu (copper tripeptide)',
 'The naturally occurring tripeptide glycyl-histidyl-lysine bound to copper.',
 'GHK-Cu is the tripeptide Gly-His-Lys bound to a copper ion (Cu2+). It is found in human blood plasma, saliva and urine and was described in 1973.

It is widely studied in cosmetology and dermatology in connection with skin repair and is used in cosmetic products.',
 array['GHK-Cu'],
 'GHK-Cu (tripeptidă cu cupru)',
 'Tripeptida naturală glicil-histidil-lizină legată de cupru.',
 'GHK-Cu este tripeptida Gly-His-Lys legată de un ion de cupru (Cu2+). Se găsește în plasma sângelui, salivă și urina umană și a fost descrisă în 1973.

Este studiată pe larg în cosmetologie și dermatologie în legătură cu refacerea pielii și se folosește în produse cosmetice.',
 array['GHK-Cu'])
),

-- Общие тексты, которые зависят только от типа товара
common (kind, en_usage, en_warning, ro_usage, ro_warning) as (
values
('research',
 'Lyophilized powder for preparing a solution. Sold for scientific and laboratory research. Not a medicinal product; any use only on a doctor’s recommendation.',
 'Not a medicinal product. Consult a specialist before use.',
 'Liofilizat pentru prepararea soluției. Se comercializează pentru cercetări științifice și de laborator. Nu este medicament; orice utilizare — doar la recomandarea medicului.',
 'Nu este medicament. Consultați un specialist înainte de utilizare.'),
('investigational',
 'Lyophilized powder for preparing a solution. Sold for scientific and laboratory research. Not a medicinal product; any use only on a doctor’s recommendation.',
 'Investigational substance not registered as a medicine. Use outside clinical trials is not approved. Do not use without a doctor’s prescription and supervision.',
 'Liofilizat pentru prepararea soluției. Se comercializează pentru cercetări științifice și de laborator. Nu este medicament; orice utilizare — doar la recomandarea medicului.',
 'Substanță aflată în studiu, neînregistrată ca medicament. Utilizarea în afara studiilor clinice nu este aprobată. Nu utilizați fără prescripția și supravegherea medicului.'),
('rx',
 'Prescription medicinal substance. Use and dosage are determined only by the attending doctor.',
 'Prescription medicinal substance. Use only as prescribed and supervised by a doctor.',
 'Substanță medicamentoasă eliberată pe bază de rețetă. Modul de utilizare și doza le stabilește doar medicul curant.',
 'Substanță medicamentoasă eliberată pe bază de rețetă. Se utilizează doar la indicația și sub supravegherea medicului.'),
('rx_hormone',
 'Prescription medicinal substance. Use and dosage are determined only by the attending doctor.',
 'Prescription medicinal substance (hormone). Use only as prescribed and supervised by a doctor.',
 'Substanță medicamentoasă eliberată pe bază de rețetă. Modul de utilizare și doza le stabilește doar medicul curant.',
 'Substanță medicamentoasă (hormon) eliberată pe bază de rețetă. Se utilizează doar la indicația și sub supravegherea medicului.')
)
update public.products p
   set translations = jsonb_build_object(
     'en', jsonb_build_object(
       'name', v.en_name,
       'pack', 'Vial · lyophilized',
       'unit_label', 'per vial',
       'short_description', v.en_short,
       'description', v.en_desc,
       'usage', c.en_usage,
       'warning', c.en_warning,
       'composition', (
         select jsonb_agg(jsonb_build_object('name', n, 'amount', 'see label') order by i)
           from unnest(v.en_comp) with ordinality as x(n, i)
       ),
       'specs', jsonb_build_array(
         jsonb_build_object('label', 'Form', 'value', 'Lyophilized powder in a vial'),
         jsonb_build_object('label', 'Manufacturer', 'value', 'SP Laboratory (United Kingdom)'),
         jsonb_build_object('label', 'Storage', 'value', 'Dry powder — at −20 °C or +2…+8 °C, protected from light. Reconstituted solution — at +2…+8 °C.')
       )
     ),
     'ro', jsonb_build_object(
       'name', v.ro_name,
       'pack', 'Flacon · liofilizat',
       'unit_label', 'per flacon',
       'short_description', v.ro_short,
       'description', v.ro_desc,
       'usage', c.ro_usage,
       'warning', c.ro_warning,
       'composition', (
         select jsonb_agg(jsonb_build_object('name', n, 'amount', 'vezi eticheta') order by i)
           from unnest(v.ro_comp) with ordinality as x(n, i)
       ),
       'specs', jsonb_build_array(
         jsonb_build_object('label', 'Formă', 'value', 'Liofilizat în flacon'),
         jsonb_build_object('label', 'Producător', 'value', 'SP Laboratory (Marea Britanie)'),
         jsonb_build_object('label', 'Păstrare', 'value', 'Pulberea uscată — la −20 °C sau +2…+8 °C, ferită de lumină. Soluția preparată — la +2…+8 °C.')
       )
     )
   )
  from v
  join common c on c.kind = v.kind
 where p.slug = v.slug;

-- Проверка: у скольких товаров есть переводы (должно быть 15)
select count(*) as translated_products
  from public.products
 where translations ? 'en' and translations ? 'ro';
