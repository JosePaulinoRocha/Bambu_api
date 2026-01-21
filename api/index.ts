import { App } from './app';

async function main() {
    const app = new App(3080);
    await app.listen();
}

main();
