declare module '@vitejs/plugin-react' {
    import { Plugin } from 'vite';
    function react(options?: unknown): Plugin;
    export default react;
}
