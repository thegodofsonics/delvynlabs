export const metadata = {
  title: 'Delvyn Labs',
  description: 'Charan\'s Personal Workspace',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}