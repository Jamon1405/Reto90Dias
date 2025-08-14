import NavBar from '@/components/NavBar';

export default function EnLayout({ children }) {
  return (
    <>
      <NavBar lang="en" />
      <main>{children}</main>
    </>
  );
}
