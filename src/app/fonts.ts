import { Forum, IBM_Plex_Mono, Onest } from 'next/font/google'

// Шрифты общие для сайта, админки и глобальной страницы 404

const onest = Onest({
  variable: '--font-onest',
  subsets: ['latin', 'latin-ext', 'cyrillic'],
})

// Антиква как в надписи на логотипе — только для названия магазина рядом со знаком
const logoSerif = Forum({
  variable: '--font-logo-serif',
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: '400',
})

// Только для номеров партий и артикулов
const mono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['400', '500'],
})

export const fontVariables = `${onest.variable} ${logoSerif.variable} ${mono.variable}`
