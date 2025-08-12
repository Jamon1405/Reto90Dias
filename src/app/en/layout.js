import NavBar from '@/components/NavBar';

export default function EnLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar lang="en" />
        <main>{children}</main>
      </body>
    </html>
  );
}
