import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Evidence Review Workbench',
  description: 'Clinical evidence review application for prior authorization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}