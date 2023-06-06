# Passso a passo:

1. npx create-react-app wfdb
2. cd wfdb -> npm start
3. Limpar App.js -> mudar ext. para jsx
4. Limpas App.css
5. Criar diretórios dentro de src: components, hooks, pages, services e utils;
6. Instalar dependencias: npm install react-router-dom axios
7. Instalando o Tailwind CSS -> npm install -D tailwindcss
8. Criando o arquivo de configuração do Tailwind CSS -> npx tailwindcss init
9. Editar o arquivo tailwind.config.js
   ```js
   module.exports = {
     content: ["./src/**/*.{js,jsx,ts,tsx}"],
     theme: {},
     plugins: [],
   };
   ```
10. No arquivo index.css limpar tudo e colocar:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
11. Colocar esse código no app.jsx para testar se o tailwind está funcionando:

    ```jsx
    import "./App.css";

    function App() {
      return (
        <>
          <h1 className="text-3xl font-bold underline">WFDB</h1>
          <button className="rounded-full bg-sky-500 py-2 px-3 text-white">
            Botão
          </button>
        </>
      );
    }
    export default App;
    ```

12. Criando a marcação inicial:

    ```jsx
    import "./App.css";
    function App() {
      return (
        <div className="flex bg-gray-100 min-h-screen">
          <div className="bg-sky-700 w-64 flex flex-col p-5">
            <div>Logo</div>
            <div className="flex flex-1">menu</div>
            <div>rodapé</div>
          </div>
          <div className="bg-gray-100 text-left">mapa</div>
        </div>
      );
    }

    export default App;
    ```

13. Criando o componente do mapa:
    - npm install --save pigeon-maps
    - Criar componente MapHolder.jsx
    ```jsx
    import { Map, Marker } from "pigeon-maps";
    function MapHolder() {
      return (
        <Map defaultCenter={[50.879, 4.6997]} defaultZoom={11}>
          <Marker width={50} anchor={[50.879, 4.6997]} />
        </Map>
      );
    }
    export default MapHolder;
    ```
    - Atualizar o App.jsx -> Carregar o MapHolder (no lugar da palavra "mapa");
    ```jsx
    <MapHolder />
    ```
14. Criar o componente do _wireframe_ da aplicação;

    ```jsx
    function Wireframe({ children }) {
      return (
        <div className="flex bg-gray-100 min-h-screen">
          <div className="bg-sky-700 w-64 flex flex-col p-5">
            <div className="mb-5">
              <img src="WFDB-logo.png" alt="Logo" />
            </div>
            <div className="flex flex-1">menu</div>
            <div>rodapé</div>
          </div>
          <div className="bg-gray-100 text-left min-h-screen flex-1">
            {children}
          </div>
        </div>
      );
    }

    export default Wireframe;
    ```

15. Criar um serviços para o consumo do dados do INPE (na pasta services -> inpe.service.js)

    ```js
    class INPEService {
      #baseURL;

      constructor() {
        this.#baseURL = "https://queimadas.dgi.inpe.br";
      }

      async menu() {
        const response = await fetch(`${this.#baseURL}/home/`);
        const data = await response.json();
        return data;
      }
    }

    export default INPEService;
    ```

16. Criando o componente do menu -> menuINPE.jsx

    ```jsx
    import { useState, useEffect, useMemo } from "react";
    import INPEService from "../services/inpe.service";

    function MenuINPE({ onClick }) {
      const inpeService = useMemo(() => new INPEService(), []);
      const [menuData, setMenuData] = useState([]);
      useEffect(() => {
        (async () => {
          let data = await inpeService.menu();
          let prepareddata = data.files.map((item) => {
            const url = item.links.filter(
              (link) => link.name === "24h (JSON)"
            )[0].url;
            return {
              label: item.name,
              url,
            };
          });
          setMenuData(prepareddata);
        })();
      }, [inpeService]);
      const handleOnClick = (event) => {
        const url = event.target.dataset.url;
        onClick(url);
      };
      return (
        <ul className="w-full block">
          {menuData?.map((item, index) => (
            <li key={index}>
              <button
                className="rounded-full bg-sky-800 w-full mb-3 py-2 text-white hover:bg-sky-900"
                onClick={handleOnClick}
                data-url={item.url}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      );
    }

    export default MenuINPE;
    ```

17. Alterar o App.jsx colocando o menu junto do mapa

    ```jsx
    import "./App.css";
    import MapHolder from "./components/MapHolder";
    import Wireframe from "./components/Wireframe";
    import MenuINPE from "./components/MenuINPE";

    function App() {
      return (
        <Wireframe>
          <MenuINPE onClick={(event) => console.log(event)} />
          <MapHolder />
        </Wireframe>
      );
    }
    export default App;
    ```

18. Alterando o wireframe para renderizar os componentes no "lugar":

    ```jsx
    function Wireframe({ children }) {
      return (
        <div className="flex bg-gray-100 h-screen overflow-hidden">
          <div className="bg-sky-700 w-64 flex flex-col p-5">
            <div className="mb-5">
              <img src="WFDB-logo.png" alt="Logo" />
            </div>
            <div className="flex flex-1 overflow-y-auto pr-6">
              {children[0]}
            </div>
            <div>rodapé</div>
          </div>
          <div className="bg-gray-100 text-left min-h-screen flex-1">
            {children[1]}
          </div>
        </div>
      );
    }

    export default Wireframe;
    ```

19. Atualizando o serviço do INPE

    ```jsx
    class INPEService {
      #baseURL;

      constructor() {
        this.#baseURL = "https://queimadas.dgi.inpe.br";
      }

      async menu() {
        const response = await fetch(`${this.#baseURL}/home/`);
        const data = await response.json();
        return data;
      }

      async fetchData(url) {
        const response = await fetch(`${this.#baseURL}${url}`);
        const data = await response.json();
        return data;
      }
    }

    export default INPEService;
    ```

20. Atualizando o App.jsx

    ```jsx
    import "./App.css";
    import MapHolder from "./components/MapHolder";
    import Wireframe from "./components/Wireframe";
    import MenuINPE from "./components/MenuINPE";
    import { useEffect, useState, useMemo } from "react";
    import INPEService from "./services/inpe.service";

    function App() {
      const inpeService = useMemo(() => new INPEService(), []);
      const [url, setUrl] = useState("");
      const [geoJson, setGeoJson] = useState();

      useEffect(() => {
        (async () => {
          if (url !== "") {
            console.log(url);
            let data = await inpeService.fetchData(url);
            console.log(data);
            setGeoJson(data);
          }
        })();
      }, [url, inpeService]);
      return (
        <Wireframe>
          <MenuINPE onClick={(event) => setUrl(event)} />
          <MapHolder geoJson={geoJson} />
        </Wireframe>
      );
    }

    export default App;
    ```

21. Colocando cor nos focos de incêndio (MapHolder.jsx);

    ```jsx
    import { Map, GeoJson } from "pigeon-maps";
    function MapHolder({ geoJson }) {
      return (
        <Map defaultCenter={[-14.235004, -51.92528]} defaultZoom={4}>
          <GeoJson
            data={geoJson}
            styleCallback={(feature, hover) => {
              if (feature.geometry.type === "LineString") {
                return { strokeWidth: "1", stroke: "black" };
              }
              return {
                fill: "#FFBF80",
                strokeWidth: "1",
                stroke: "white",
                r: "5",
              };
            }}
          />
        </Map>
      );
    }

    export default MapHolder;
    ```

22. Tratando o active do botão -> atualizar componentente de menu

    ```jsx
    import { useState, useEffect, useMemo } from "react";
    import INPEService from "../services/inpe.service";

    function MenuINPE({ onClick, activeUrl }) {
      const inpeService = useMemo(() => new INPEService(), []);
      const [menuData, setMenuData] = useState([]);
      useEffect(() => {
        (async () => {
          let data = await inpeService.menu();
          let prepareddata = data.files.map((item) => {
            const url = item.links.filter(
              (link) => link.name === "48h (JSON)"
            )[0].url;
            return {
              label: item.name,
              url,
            };
          });
          setMenuData(prepareddata);
        })();
      }, [inpeService]);
      const handleOnClick = (event) => {
        const url = event.target.dataset.url;
        onClick(url);
      };

      const isActive = (url) => {
        return url === activeUrl
          ? "bg-amber-500 hover:bg-amber-500"
          : "bg-sky-800 hover:bg-sky-900";
      };
      return (
        <ul className="w-full block">
          {menuData?.map((item, index) => (
            <li key={index}>
              <button
                className={`rounded-full w-full mb-3 py-2 text-white  ${isActive(
                  item.url
                )}`}
                onClick={handleOnClick}
                data-url={item.url}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      );
    }

    export default MenuINPE;
    ```

23. Atualizando compoenten de App.jsx (enviar o link carregado);

    ```jsx
    import "./App.css";
    import MapHolder from "./components/MapHolder";
    import Wireframe from "./components/Wireframe";
    import MenuINPE from "./components/MenuINPE";
    import { useEffect, useState, useMemo } from "react";
    import INPEService from "./services/inpe.service";

    function App() {
      const inpeService = useMemo(() => new INPEService(), []);
      const [url, setUrl] = useState("");
      const [geoJson, setGeoJson] = useState();

      useEffect(() => {
        (async () => {
          if (url !== "") {
            console.log(url);
            let data = await inpeService.fetchData(url);
            console.log(data);
            setGeoJson(data);
          }
        })();
      }, [url, inpeService]);
      return (
        <Wireframe>
          <MenuINPE onClick={(event) => setUrl(event)} activeUrl={url} />
          <MapHolder geoJson={geoJson} />
        </Wireframe>
      );
    }
    export default App;
    ```
