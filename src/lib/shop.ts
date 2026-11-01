import 'server-only'
import { getI18n } from '@/i18n/server'
import { getCatalog, getProduct, getServices, getSettings } from './data'
import { localizeCatalog, localizeCertificate, localizeProduct, localizeService, localizeSettings } from './localize'

// Данные магазина на языке текущей страницы (/en, /ro, /ru).
// Сами запросы к базе кешируются один раз на все языки, перевод подставляется уже после.

export async function getShop() {
  const [i18n, catalog, settings] = await Promise.all([getI18n(), getCatalog(), getSettings()])
  // Пустую категорию на сайте не показываем — она появится вместе с первым товаром
  const categories = catalog.categories.filter((c) => catalog.products.some((p) => p.category_id === c.id))
  return {
    i18n,
    catalog: localizeCatalog({ ...catalog, categories }, i18n.lang),
    settings: localizeSettings(settings, i18n.lang),
  }
}

export async function getShopServices() {
  const [i18n, services] = await Promise.all([getI18n(), getServices()])
  return services.map((s) => localizeService(s, i18n.lang))
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
