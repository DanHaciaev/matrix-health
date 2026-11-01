import { Forum, IBM_Plex_Mono, Onest } from 'next/font/google'

// Шрифты общие для сайта, админки и глобальной страницы 404.
// subsets — какие наборы символов браузер загружает заранее (preload). Остальные наборы
// (кириллица, румынские ș ț) всё равно подключены и скачиваются, только когда на странице есть такие буквы.

const onest = Onest({
  variable: '--font-onest',
  subsets: ['latin'],
})

// Антиква как в надписи на логотипе — только для названия магазина рядом со знаком (латиница)
const logoSerif = Forum({
  variable: '--font-logo-serif',
  subsets: ['latin'],
  weight: '400',
})

// Только для номеров партий и артикулов — заранее не грузим
const mono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  preload: false,
})

export const fontVariables = `${onest.variable} ${logoSerif.variable} ${mono.variable}`
