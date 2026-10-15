import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DriverSaaS Caught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem('xds_session');
      localStorage.removeItem('xds_driver_profile');
    } catch (e) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold mb-2">Ops! Ocorreu uma inconsistência temporária</h1>
          <p className="text-xs text-zinc-400 max-w-sm mb-6">
            Identificamos uma incompatibilidade de dados em cache no seu dispositivo. Clique no botão abaixo para restaurar o sistema com segurança.
          </p>

          {this.state.error && (
            <div className="mb-6 p-3 bg-zinc-950 border border-zinc-800 rounded-xl max-w-md text-left text-[11px] text-zinc-500 font-mono overflow-auto max-h-32">
              {this.state.error.toString()}
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restaurar e Voltar ao Início</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
