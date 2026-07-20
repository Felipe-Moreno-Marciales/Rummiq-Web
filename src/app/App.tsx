import styles from './App.module.css';

/**
 * Cáscara inicial de la aplicación.
 *
 * En esta fase (inicialización) solo se establece el punto de entrada y la
 * identidad básica. Las pantallas del juego se construyen en fases posteriores.
 */
export function App() {
  return (
    <main className={styles.shell}>
      <section className={styles.card} aria-labelledby="app-title">
        <h1 id="app-title" className={styles.title}>
          Rummiq Web
        </h1>
        <p className={styles.tagline}>
          Juego de fichas independiente inspirado en los clásicos de tipo rummy.
        </p>
        <p className={styles.notice}>
          Proyecto en construcción. Implementación no oficial y sin relación con marcas comerciales.
        </p>
      </section>
    </main>
  );
}
