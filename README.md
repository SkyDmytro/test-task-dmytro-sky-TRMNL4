# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv create --template minimal --types ts --install pnpm .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## How to run with database

Create `.env` in the project root:

```env
DB_ROOT_PASSWORD=rootpassword
DB_NAME=sveltekit_db
DB_USER=sveltekit_user
DB_PASSWORD=secretpassword
```

### 1. Full app + DB in Docker (run migrations and seed yourself)

Run the whole stack in Docker and apply migrations and seed manually:

```sh
docker compose up -d --build
docker compose run --rm app pnpm run migrate
docker compose run --rm app pnpm run seed
```

Open the app at [http://localhost:3000](http://localhost:3000).

**Why run migrations and seed yourself:** You control when schema and data change. In production you avoid applying migrations on every deploy, reduce risk of failed starts, and can run migrations in a separate step (e.g. CI or release pipeline). Seed stays a deliberate action for dev/staging, not something that runs automatically in production.

### 2. Only DB in Docker + local SvelteKit

Use MySQL in Docker and run the app locally with hot reload:

```sh
docker compose up -d mysql
```

Ensure `.env` has connection for the host (MySQL is on port **3307**):

```env
DB_HOST=localhost
DB_PORT=3307
DB_NAME=sveltekit_db
DB_USER=sveltekit_user
DB_PASSWORD=secretpassword
```

Then:

```sh
pnpm install
pnpm run migrate
pnpm run seed
pnpm run dev
```

App: [http://localhost:5173](http://localhost:5173).

Useful commands:

```sh
docker compose logs -f           # follow logs
docker compose down              # stop containers
docker compose down -v           # stop and remove volumes (deletes DB data)
```
