import './globals.css';

export const metadata = {
  title: 'MedGuard | Pharmacy Inventory',
  description: 'Hospital pharmacy inventory and expiry management'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
