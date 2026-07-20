import estilos from './Aplicacion.module.css';

/**
 * Cáscara inicial de la aplicación.
 *
 * En esta fase (inicialización) solo se establece el punto de entrada y la
 * identidad básica. Las pantallas del juego se construyen en fases posteriores.
 */
export function Aplicacion() {
  return (
    <main className={estilos.contenedor}>
      <section className={estilos.tarjeta} aria-labelledby="titulo-app">
        <h1 id="titulo-app" className={estilos.titulo}>
          Rummiq Web
        </h1>
        <p className={estilos.lema}>
          Juego de fichas independiente inspirado en los clásicos de tipo rummy.
        </p>
        <p className={estilos.aviso}>
          Proyecto en construcción. Implementación no oficial y sin relación con marcas comerciales.
        </p>
      </section>
    </main>
  );
}
