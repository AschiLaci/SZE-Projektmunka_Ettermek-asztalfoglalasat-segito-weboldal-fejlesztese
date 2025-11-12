# SZE-Projektmunka_Ettermek-asztalfoglalasat-segito-weboldal-fejlesztese

> [!WARNING]
> A `public/hidden.htaccess` fájlt futtatás előtt át kell írni `.htaccess`-re.





## Futtatás Fejlesztői Módban
```bash
npm install

npm run dev
```

Ezután az alkalmazás elérhető lesz a böngészőben:
[http://localhost:3000](http://localhost:3000)
> Ha a 3000-es port foglalt akkor a 3001-es porton és így tovább.





## Futtatás Dockerben
```
git clone <repo-url> restaurant-app
cd restaurant-app

docker build -t restaurant-app .

docker run -d -p 3000:3000 --name restaurant-ui restaurant-app
```

Ezután az alkalmazás elérhető lesz a böngészőben:
[http://localhost:3000](http://localhost:3000)
