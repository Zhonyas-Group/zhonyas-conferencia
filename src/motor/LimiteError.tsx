import { Component, type ReactNode } from 'react';
import { registrarProblema } from './diagnostico';

interface Props {
  id: string;
  titulo: string;
  /** En la pantalla del público no se enseña el error: queda la diapositiva vacía. */
  discreto?: boolean;
  children: ReactNode;
}

/**
 * Si una diapositiva lanza un error, se muestra un aviso en su lugar y el
 * resto de la presentación sigue funcionando.
 */
export class LimiteError extends Component<Props, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    registrarProblema(`La diapositiva «${this.props.id}» falló: ${error.message}`);
  }

  render() {
    if (this.state.error) {
      if (this.props.discreto) return <div className="diapositiva-rota diapositiva-rota--discreta" />;
      return (
        <div className="diapositiva-rota" role="alert">
          <p className="diapositiva-rota__titulo">{this.props.titulo}</p>
          <p className="diapositiva-rota__detalle">Esta diapositiva no se pudo dibujar.</p>
          <code>{this.state.error.message}</code>
        </div>
      );
    }
    return this.props.children;
  }
}
