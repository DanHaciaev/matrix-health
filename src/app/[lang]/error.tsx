'use client'

import { ErrorView } from '@/components/error-view'

export default function ShopError(props: { error: unknown; retry: () => void }) {
  return <ErrorView {...props} />
}
