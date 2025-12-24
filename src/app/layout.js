import './globals.css'

export const metadata = {
  title: 'Physio KG Clinical Reasoning',
  description: 'Evidence-based clinical reasoning assistant for physiotherapists',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
