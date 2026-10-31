import 'server-only'
import { getI18n } from '@/i18n/server'
import { getCatalog, getProduct, getSettings } from './data'
import { localizeCatalog, localizeCertificate, localizeProduct, localizeSettings } from './localize'

// Данные магазина на языке текущей страницы (/en, /ro, /ru).
// Сами запросы к базе кешируются один раз на все языки, перевод подставляется уже после.

export async function getShop() {
  const [i18n, catalog, settings] = await Promise.all([getI18n(), getCatalog(), getSettings()])
  return {
    i18n,
    catalog: localizeCatalog(catalog, i18n.lang),
    settings: localizeSettings(settings, i18n.lang),
  }
}

export async function getShopProduct(slug: string) {
  const [i18n, data] = await Promise.all([getI18n(), getProduct(slug)])
  if (!data) return null
  return {
    product: localizeProduct(data.product, i18n.lang),
    certificates: data.certificates.map((c) => localizeCertificate(c, i18n.lang)),
    related: data.related.map((p) => localizeProduct(p, i18n.lang)),
  }
}
