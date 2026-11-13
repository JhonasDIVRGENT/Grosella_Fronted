# Frontend · Pastelería Grosella (Angular 22)

```bash
npm install
npm start          # http://localhost:4200
npm run build      # genera dist/Frontend
```

Estructura:

```
src/app
├── core/        modelos, servicios HTTP, guard, interceptor y utilidades de estados
├── layout/      barra superior granate + menú lateral por perfil
├── shared/      etiqueta de estado y pipes (soles, fecha, hora)
└── pages/       login, inicio y las 8 vistas de los prototipos GUI
```

La URL del backend se configura en `src/environments/environment.ts`.
