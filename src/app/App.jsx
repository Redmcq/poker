import { Suspense, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import Spinner from '../components/ui/Spinner';
import { Header } from '../features/layout/components/Header';
import { Footer } from '../features/layout/components/Footer';
import { useHotkeys } from '../hooks/useHotkeys';
import { useTheme } from '../hooks/useTheme';
import CommandPalette from '../components/palette/CommandPalette';

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { toggle } = useTheme();
  useHotkeys({ 'ctrl+k': () => setPaletteOpen(true) });
  return (
    <div className="app">
      <Header />
      <main>
        <Suspense fallback={<Spinner />}>
          <RouterProvider router={router} />
        </Suspense>
      </main>
      <Footer />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onToggleTheme={toggle}
      />
    </div>
  );
}
