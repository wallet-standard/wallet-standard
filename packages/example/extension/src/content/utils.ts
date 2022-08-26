export async function inject(src: string): Promise<void> {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'module';

        script.addEventListener('load', () => {
            script.remove();
            resolve();
        });

        document.head.prepend(script);
    });
}
