# SZE-Projektmunka_Ettermek-asztalfoglalasat-segito-weboldal-fejlesztese

## Futtatás Fejlesztői Módban
```bash
npm install

npm run dev
```

Ezután az alkalmazás elérhető lesz a böngészőben:
[http://localhost:3000](http://localhost:3000)





## Futtatás Dockerben
```
git clone <repo-url> restaurant-app
cd restaurant-app

docker build -t restaurant-app .

docker run -d -p 3000:3000 --name restaurant-ui restaurant-app
```

Ezután az alkalmazás elérhető lesz a böngészőben:
[http://localhost:3000](http://localhost:3000)
