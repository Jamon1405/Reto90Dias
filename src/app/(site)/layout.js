import NavBar from '@/components/NavBar';

export default function SiteLayout({ children }) {
  return (
    <>
      <NavBar lang="es" />
      <main>{children}</main>
    </>
  );
}
