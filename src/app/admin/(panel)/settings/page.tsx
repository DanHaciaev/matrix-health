import { RefreshSiteButton } from '@/components/admin/controls'
import { AdminTitle, Card } from '@/components/admin/parts'
import { SettingsForm } from '@/components/admin/settings-form'
import { TelegramBot } from '@/components/admin/telegram-bot'
import { requireAdmin } from '@/lib/admin/auth'
import { EMPTY_SETTINGS } from '@/lib/data'
import { botUsername, telegramConfig } from '@/lib/telegram'
import type { Settings } from '@/lib/types'

export const metadata = { title: 'Настройки' }

export default async function SettingsPage() {
  const { sb } = await requireAdmin()
  const [{ data }, username] = await Promise.all([sb.from('settings').select('*').eq('id', 1).maybeSingle(), botUsername()])

  const settings: Settings = data
    ? { ...(data as Settings), delivery_cost: Number(data.delivery_cost), free_delivery_from: Number(data.free_delivery_from) }
    : EMPTY_SETTINGS

  return (
    <>
      <AdminTitle title="Настройки" sub="Контакты и условия доставки — меняются на всём сайте сразу.">
        <RefreshSiteButton />
      </AdminTitle>
      <p className="-mt-5 mb-6 max-w-2xl text-sm text-mute">
        Правили товары или настройки напрямую в Supabase? Нажмите «Обновить сайт» — иначе изменения появятся примерно
        через минуту.
      </p>
      <SettingsForm settings={settings} />

      <Card title="Telegram-бот: уведомления о заказах и заявках" className="mt-6 max-w-4xl">
        <TelegramBot username={username} hasToken={telegramConfig.hasToken} chatIds={telegramConfig.chatIds} />
      </Card>
    </>
  )
}
