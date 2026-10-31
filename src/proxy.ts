import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { DEFAULT_LANG, LANG_COOKIE, hasLocale, matchLanguage, stripLocale } from '@/i18n/config'
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/lib/supabase/env'

// Язык не пишется в адресе: /catalog открывается на языке посетителя.
// Внутри Next.js страницы лежат в app/[lang], поэтому адрес незаметно подменяется (rewrite):
// /catalog → /ro/catalog. Посетитель видит /catalog, страницы остаются статичными.

const YEAR = 60 * 60 * 24 * 365

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return protectAdmin(request)

  // Ссылки вида /ro/... — запоминаем язык и ведём на обычный адрес без префикса.
  // Удобно для рекламы: ссылка /ro сразу откроет сайт на румынском.
  const first = pathname.split('/')[1]
  if (hasLocale(first)) {
    const url = request.nextUrl.clone()
    url.pathname = stripLocale(pathname)
    const response = NextResponse.redirect(url) // 307: не кешируется браузером, cookie ставится каждый раз
    response.cookies.set(LANG_COOKIE, first, { path: '/', maxAge: YEAR, sameSite: 'lax' })
    return response
  }

  // Язык: выбранный раньше → язык браузера → английский
  const saved = request.cookies.get(LANG_COOKIE)?.value
  const lang = hasLocale(saved) ? saved : (matchLanguage(request.headers.get('accept-language')) ?? DEFAULT_LANG)

  const url = request.nextUrl.clone()
  url.pathname = `/${lang}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

// Обновляет сессию Supabase и не пускает в админку без входа.
// Права администратора дополнительно проверяются на сервере (lib/admin/auth.ts).
async function protectAdmin(request: NextRequest) {
  const isLogin = request.nextUrl.pathname.startsWith('/admin/login')

  if (!isSupabaseConfigured) {
    return isLogin ? NextResponse.next() : NextResponse.redirect(new URL('/admin/login', request.url))
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(list, headers) {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !isLogin) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  // Всё, кроме служебных файлов Next.js и файлов с расширением (картинки, robots.txt, icon.png)
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
}
