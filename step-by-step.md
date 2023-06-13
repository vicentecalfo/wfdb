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

24. Criando notificação para mostrar a quantidade de focos de incêndios reportados: (Notification.jsx)

    ```jsx
    function Notification({ geoJson }) {
      const totalWildefireReported = geoJson?.features.length;
      const Dialog = () => {
        const message =
          totalWildefireReported === 0
            ? "Não foram reportados focos de incêndio nas últimas 48 horas"
            : `Foram encontrados ${totalWildefireReported} focos de incêndio nas últimas 48 horas.`;
        if (!geoJson) return null;
        return (
          <div
            className={`p-5 text-white rounded drop-shadow-2xl absolute z-50 w-auto top-4 right-4 ${
              totalWildefireReported === 0 ? "bg-green-700" : "bg-red-700"
            }`}
          >
            {message}
          </div>
        );
      };
      return <Dialog />;
    }

    export default Notification;
    ```

25. Atualizar o componente de mapa (MapHolder.jsx)

    ```jsx
    import Notification from "./Notification";
    import { Map, GeoJson } from "pigeon-maps";

    function MapHolder({ geoJson }) {
      return (
        <>
          <Notification geoJson={geoJson} />
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
                  r: "10",
                };
              }}
            />
          </Map>
        </>
      );
    }

    export default MapHolder;
    ```

26. Ativar o clique nos focos de incêndio -> atualizar (MapHolder.jsx)

    ```jsx
    import { useState } from "react";
    import Notification from "./Notification";
    import { Map, GeoJson } from "pigeon-maps";

    function MapHolder({ geoJson }) {
      const [additionalInfo, setAdditionalInfo] = useState(null);
      const clickHandler = ({ event, anchor, payload }) => {
        console.log("event", event);
        console.log("anchor", anchor);
        console.log("payload", payload);
        setAdditionalInfo(payload.properties);
      };
      return (
        <>
          <Notification geoJson={geoJson} additionalInfo={additionalInfo} />
          <Map defaultCenter={[-14.235004, -51.92528]} defaultZoom={4}>
            <GeoJson
              data={geoJson}
              onClick={clickHandler}
              styleCallback={(feature, hover) => {
                if (feature.geometry.type === "LineString") {
                  return { strokeWidth: "1", stroke: "black" };
                }
                return {
                  fill: "#FFBF80",
                  strokeWidth: "1",
                  stroke: "white",
                  r: "10",
                };
              }}
            />
          </Map>
        </>
      );
    }

    export default MapHolder;
    ```

27. Criando a tabela com mais informações:

    ```jsx
    function Notification({ geoJson, additionalInfo }) {
      const totalWildefireReported = geoJson?.features.length;
      const Dialog = () => {
        const message =
          totalWildefireReported === 0
            ? "Não foram reportados focos de incêndio nas últimas 48 horas"
            : `Foram encontrados ${totalWildefireReported} focos de incêndio nas últimas 48 horas.`;
        if (!geoJson) return null;
        return (
          <div
            className={`p-5 text-white rounded drop-shadow-2xl absolute z-50 w-auto top-10 right-10 ${
              totalWildefireReported === 0 ? "bg-green-700" : "bg-red-700"
            }`}
          >
            {message}
          </div>
        );
      };
      const AdditionalInfoTable = () => {
        if (!additionalInfo) return null;
        const {
          data_hora_gmt,
          estado,
          municipio,
          pais,
          satelite,
          latitude,
          longitude,
        } = additionalInfo;
        return (
          <div
            className={`p-5 rounded drop-shadow-2xl absolute z-50 bottom-10 right-10 bg-white w-1/3`}
          >
            <table className="w-full">
              <tr>
                <th className="w-1/2">País</th>
                <td>{pais}</td>
              </tr>
              <tr>
                <th>Estado</th>
                <td>{estado}</td>
              </tr>
              <tr>
                <th>Município</th>
                <td>{municipio}</td>
              </tr>
              <tr>
                <th>Latitude</th>
                <td>{latitude}</td>
              </tr>
              <tr>
                <th>Longitude</th>
                <td>{longitude}</td>
              </tr>
              <tr>
                <th>Notificado em</th>
                <td>{data_hora_gmt}</td>
              </tr>
            </table>
          </div>
        );
      };
      return (
        <>
          <AdditionalInfoTable />
          <Dialog />
        </>
      );
    }

    export default Notification;
    ```

28. Tratando a data da notificação e incluindo dado do satélite:

    ```jsx
    import moment from "moment";
    import "moment/locale/pt-br";
    moment.locale("pt-br");

    function Notification({ geoJson, additionalInfo }) {
      const totalWildefireReported = geoJson?.features.length;
      const Dialog = () => {
        const message =
          totalWildefireReported === 0
            ? "Não foram reportados focos de incêndio nas últimas 48 horas"
            : `Foram encontrados ${totalWildefireReported} focos de incêndio nas últimas 48 horas.`;
        if (!geoJson) return null;
        return (
          <div
            className={`p-5 text-white rounded drop-shadow-2xl absolute z-50 w-auto top-10 right-10 ${
              totalWildefireReported === 0 ? "bg-green-700" : "bg-red-700"
            }`}
          >
            {message}
          </div>
        );
      };
      const AdditionalInfoTable = () => {
        if (!additionalInfo) return null;
        const {
          data_hora_gmt,
          estado,
          municipio,
          pais,
          satelite,
          latitude,
          longitude,
        } = additionalInfo;
        return (
          <div
            className={`p-5 rounded drop-shadow-2xl absolute z-50 bottom-10 right-10 bg-white w-1/3`}
          >
            <table className="w-full">
              <tr>
                <th className="w-1/2">País</th>
                <td>{pais}</td>
              </tr>
              <tr>
                <th>Estado</th>
                <td>{estado}</td>
              </tr>
              <tr>
                <th>Município</th>
                <td>{municipio}</td>
              </tr>
              <tr>
                <th>Latitude</th>
                <td>{latitude}</td>
              </tr>
              <tr>
                <th>Longitude</th>
                <td>{longitude}</td>
              </tr>
              <tr>
                <th>Notificado em</th>
                <td>{moment(data_hora_gmt).format("LLLL")}</td>
              </tr>
              <tr>
                <th>Satélite</th>
                <td>{satelite}</td>
              </tr>
            </table>
          </div>
        );
      };
      return (
        <>
          <AdditionalInfoTable />
          <Dialog />
        </>
      );
    }

    export default Notification;
    ```

29. Criando um Hook customizado para controlar o zoom (hooks/useZoom.js)

    ```jsx
    import { useState } from "react";

    function useZoom() {
      const [zoom, setZoom] = useState(4);

      function zoomIn() {
        if (zoom < 11) setZoom(zoom + 1);
        console.log(zoom);
      }

      function zoomOut() {
        if (zoom > 0) setZoom(zoom - 1);
        console.log(zoom);
      }

      return { zoom, zoomIn, zoomOut };
    }

    export default useZoom;
    ```

30. Criando os botões de controle e usando o hook

    ```jsx
    import "./App.css";
    import MapHolder from "./components/MapHolder";
    import Wireframe from "./components/Wireframe";
    import MenuINPE from "./components/MenuINPE";
    import { useEffect, useState, useMemo } from "react";
    import INPEService from "./services/inpe.service";
    import useZoom from "./hooks/useZoom";

    function App() {
      const inpeService = useMemo(() => new INPEService(), []);
      const [url, setUrl] = useState("");
      const [geoJson, setGeoJson] = useState();
      const { zoom, zoomIn, zoomOut } = useZoom();

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
          <MapHolder geoJson={geoJson} zoom={zoom} />
          <>
            <button
              className="bg-sky-950 text-white py-2 rounded-md w-full text-xs"
              onClick={() => zoomIn()}
            >
              Zoom In
            </button>
            <button
              className="bg-sky-950 text-white py-2 rounded-md w-full text-xs"
              onClick={() => zoomOut()}
            >
              Zoom Out
            </button>
          </>
        </Wireframe>
      );
    }

    export default App;
    ```

31. Ajustando o problema do centroide e "salto" do zoom, quando usar o scroll do mouse;
32. Atualizando o hook useZoom, para permitir a mudando do zoom de forma livre:

    ```jsx
    import { useState } from "react";

    function useZoom() {
      const [zoom, setZoom] = useState(4);

      function zoomIn() {
        if (zoom < 11) setZoom(zoom + 1);
        console.log(zoom);
      }

      function zoomOut() {
        if (zoom > 0) setZoom(zoom - 1);
        console.log(zoom);
      }

      return { zoom, zoomIn, zoomOut, setZoom };
    }

    export default useZoom;
    ```

33. Atualizando o componente de mapa (MapHolder.jsx), para ajustar o centroid e recuperar os valores atuais de centro e zoom do mapa:

    ```jsx
    import { useEffect, useState } from "react";
    import Notification from "./Notification";
    import { Map, GeoJson } from "pigeon-maps";

    function MapHolder({ geoJson, zoom, center, onBoundsChanged }) {
      const [additionalInfo, setAdditionalInfo] = useState(null);
      const clickHandler = ({ event, anchor, payload }) => {
        console.log("event", event);
        console.log("anchor", anchor);
        console.log("payload", payload);
        setAdditionalInfo(payload.properties);
      };
      useEffect(() => {
        setAdditionalInfo(null);
      }, [geoJson]);
      return (
        <>
          <Notification geoJson={geoJson} additionalInfo={additionalInfo} />
          <Map center={center} zoom={zoom} onBoundsChanged={onBoundsChanged}>
            <GeoJson
              data={geoJson}
              onClick={clickHandler}
              styleCallback={(feature, hover) => {
                if (feature.geometry.type === "LineString") {
                  return { strokeWidth: "1", stroke: "black" };
                }
                return {
                  fill: "#FFBF80",
                  strokeWidth: "1",
                  stroke: "white",
                  r: "10",
                };
              }}
            />
          </Map>
        </>
      );
    }
    ```

34. Declarando as props nova do mapa no componente App.jsx

    ```jsx
    import "./App.css";
    import MapHolder from "./components/MapHolder";
    import Wireframe from "./components/Wireframe";
    import MenuINPE from "./components/MenuINPE";
    import { useEffect, useState, useMemo } from "react";
    import INPEService from "./services/inpe.service";
    import useZoom from "./hooks/useZoom";

    function App() {
      const inpeService = useMemo(() => new INPEService(), []);
      const [url, setUrl] = useState("");
      const [geoJson, setGeoJson] = useState();
      const { zoom, zoomIn, zoomOut, setZoom } = useZoom();
      const [center, setCenter] = useState([-14.235004, -51.92528]);

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
          <MapHolder
            geoJson={geoJson}
            zoom={zoom}
            center={center}
            onBoundsChanged={({ center, zoom }) => {
              setCenter(center);
              setZoom(zoom);
            }}
          />
          <>
            <button
              className="bg-sky-950 text-white py-2 rounded-md w-full text-xs"
              onClick={() => zoomIn()}
            >
              Zoom In
            </button>
            <button
              className="bg-sky-950 text-white py-2 rounded-md w-full text-xs"
              onClick={() => zoomOut()}
            >
              Zoom Out
            </button>
          </>
        </Wireframe>
      );
    }

    export default App;
    ```

35. Instalar o react dom <code>npm install react-router-dom</code>
36. Vamos criar uma pasta chamada pages dentro de src
37. Dentro da pasta pages vamos criar um componente chamado MapPage (MapPage.jsx), com todo conteúdo que temo hoje em APP.jsx (não esqueçam de tirar o app.css e mudar os caminhos relativos)

    ```jsx
    import MapHolder from "../components/MapHolder";
    import Wireframe from "../components/Wireframe";
    import MenuINPE from "../components/MenuINPE";
    import { useEffect, useState, useMemo } from "react";
    import INPEService from "../services/inpe.service";
    import useZoom from "../hooks/useZoom";

    function MapPage() {
      const inpeService = useMemo(() => new INPEService(), []);
      const [url, setUrl] = useState("");
      const [geoJson, setGeoJson] = useState();
      const { zoom, zoomIn, zoomOut, setZoom } = useZoom();
      const [center, setCenter] = useState([-14.235004, -51.92528]);

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
        <>
          <Wireframe>
            <MenuINPE onClick={(event) => setUrl(event)} activeUrl={url} />
            <MapHolder
              geoJson={geoJson}
              zoom={zoom}
              center={center}
              onBoundsChanged={({ center, zoom }) => {
                setCenter(center);
                setZoom(zoom);
              }}
            />
            <>
              <button
                className="bg-sky-950 text-white py-2 rounded-md w-full text-xs"
                onClick={() => zoomIn()}
              >
                Zoom In
              </button>
              <button
                className="bg-sky-950 text-white py-2 rounded-md w-full text-xs"
                onClick={() => zoomOut()}
              >
                Zoom Out
              </button>
            </>
          </Wireframe>
        </>
      );
    }

    export default MapPage;
    ```

38. Alterar App.jsx para:

    ```jsx
    import "./App.css";
    import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
    import MapPage from "./pages/MapPage";

    function App() {
      return (
        <Router>
          <Routes>
            <Route exact path="/" element={<MapPage />} />
          </Routes>
        </Router>
      );
    }

    export default App;
    ```

39. A aplicação deve voltar a funcionar.
40. Na pasta pages, vamos criar um componente chamado AboutPage.jsx

    ```jsx
    function AboutPage() {
      return <h1>About Page</h1>;
    }

    export default AboutPage;
    ```

41. Atualizar as rotas no App.jsx:

    ```jsx
    import "./App.css";
    import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
    import MapPage from "./pages/MapPage";
    import AboutPage from "./pages/AboutPage";

    function App() {
      return (
        <Router>
          <Routes>
            <Route exact path="/" element={<MapPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Router>
      );
    }

    export default App;
    ```

42. Fazer modificações no Wireframe para inclsuão do menu:

    ```jsx
    function Wireframe({ children }) {
      return (
        <div className="flex bg-gray-100 overflow-hidden wireframe">
          <div className="bg-sky-700 w-64 flex flex-col p-5 pb-0 drop-shadow-2xl">
            <div className="mb-5 pb-5 border-b border-sky-800 flex flex-col content-center">
              <img src="WFDB-logo.png" alt="Logo" className="w-4/5" />
              <span className="text-sm mt-3 text-white">
                Alerta de incêdio nas últimas 48hs.
              </span>
            </div>
            <div className="flex flex-1 overflow-y-auto pr-6 w-full">
              {children[0]}
            </div>
            <div className="grid grid-cols-2 p-6 border-t border-sky-800 gap-x-2">
              {children[2]}
            </div>
          </div>
          <div className="bg-gray-100 text-left min-h-screen flex-1 relative flex items-center justify-center">
            {children[1]}
          </div>
        </div>
      );
    }

    export default Wireframe;
    ```

43. Incluir a base do menu no App.jsx (O componente LINK deve estar dentro do componente Router)

    ```jsx
    import "./App.css";
    import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
    import MapPage from "./pages/MapPage";
    import AboutPage from "./pages/AboutPage";
    import { Link } from "react-router-dom";

    function App() {
      return (
        <Router>
          <div className="h-screen app">
            <div className="bg-sky-900 flex items-center px-4">
              <div className="flex-1">logo</div>
              <ul className="flex gap-2">
                <li className="p-2 bg-sky-700 rounded text-white hover:bg-amber-600">
                  <Link to="/">Alertas de 48hs</Link>
                </li>
                <li className="p-2 bg-sky-700 rounded text-white hover:bg-amber-600">
                  <Link to="/about">Sobre a Ferramenta</Link>
                </li>
              </ul>
            </div>
            <main>
              <Routes>
                <Route exact path="/" element={<MapPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      );
    }

    export default App;
    ```
44. Mudando o Logo de lugar -> Vamos retirar o Logo de dentro do Wireframe

      ```jsx
      function Wireframe({ children }) {
        return (
          <div className="flex bg-gray-100 overflow-hidden wireframe">
            <div className="bg-sky-700 w-64 flex flex-col p-5 pb-0 drop-shadow-2xl">
              <div className="mb-5 pb-5 border-b border-sky-800 flex flex-col content-center">
                <span className="text-sm text-white">Alerta de incêdio nas últimas 48hs.</span>
              </div>
              <div className="flex flex-1 overflow-y-auto pr-6 w-full">{children[0]}</div>
              <div className="grid grid-cols-2 p-6 border-t border-sky-800 gap-x-2">
                  {children[2]}
              </div>
            </div>
            <div className="bg-gray-100 text-left min-h-screen flex-1 relative flex items-center justify-center">
              {children[1]}
            </div>
          </div>
        );
      }

      export default Wireframe;
      ```
45. Vamos colocar o logo dentro de App.jsx alterando o tamanho dele (class w-32):
      ```jsx
      import "./App.css";
      import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
      import MapPage from "./pages/MapPage";
      import AboutPage from "./pages/AboutPage";
      import { Link } from "react-router-dom";

      function App() {
        return (
          <Router>
            <div className="h-screen app">
              <div className="bg-sky-900 flex items-center px-4">
                <div className="flex-1">
                <img src="WFDB-logo.png" alt="Logo" className="w-32" />
                </div>
                <ul className="flex gap-2">
                  <li className="p-2 bg-sky-700 rounded text-white hover:bg-amber-600">
                    <Link to="/">Alertas de 48hs</Link>
                  </li>
                  <li className="p-2 bg-sky-700 rounded text-white hover:bg-amber-600">
                    <Link to="/about">Sobre a Ferramenta</Link>
                  </li>
                </ul>
              </div>
              <main>
                <Routes>
                  <Route exact path="/" element={<MapPage />} />
                  <Route path="/about" element={<AboutPage />} />
                </Routes>
              </main>
            </div>
          </Router>
        );
      }

      export default App;

      ```
  4. Atualizar o app.css

      ```css
        .app{
            display: grid;
            grid-template-rows: 10vh 90vh;
            overflow: hidden;
        }

        .wireframe{
            height: 90vh;
        }
      ```
  46. Criando um componente de navegação (components/Navigation.jsx):
      ```jsx
      import { Link, useLocation } from "react-router-dom";
      function Navigation() {
        let location = useLocation().pathname;
        const menuItens = [
          { to: "/", label: "Alerta de 48hs" },
          { to: "/about", label: "Sobre a Ferramenta" },
        ];

        return (
          <div className="bg-sky-900 flex items-center px-4">
            <div className="flex-1">
              <img src="WFDB-logo.png" alt="Logo" className="w-32" />
            </div>
            <ul className="flex gap-2">
              {menuItens.map(({ to, label }, index) => (
                <li
                  key={index}
                  className={`p-2 bg-sky-700 rounded text-white hover:bg-amber-600 ${
                    location === to ? "bg-amber-600" : ""
                  }`}
                >
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        );
      }

      export default Navigation;
      ```
  4. Atualizando o App.jsx
      ```jsx
      import "./App.css";
      import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
      import MapPage from "./pages/MapPage";
      import AboutPage from "./pages/AboutPage";
      import Navigation from "./components/Navigation";


      function App() {
        return (
          <Router>
            <div className="h-screen app">
              <Navigation />
              <main>
                <Routes>
                  <Route exact path="/" element={<MapPage />} />
                  <Route path="/about" element={<AboutPage />} />
                </Routes>
              </main>
            </div>
          </Router>
        );
      }

      export default App;
      ```
3. Atualizando a página About.jsx
    ```jsx
        function AboutPage() {
          return (
            <div className="p-6">
              <h1 className="text-3xl mb-4">Sobre a Ferramenta</h1>
              <p>
                Bem-vindo(a) à nossa ferramenta de monitoramento de focos de incêndio!
                Aqui, fornecemos informações em tempo real sobre os focos de incêndio
                ocorridos nas últimas 48 horas, utilizando dados fornecidos pelo INPE
                (Instituto Nacional de Pesquisas Espaciais).
              </p>

              <p>
                Nossa ferramenta foi desenvolvida para auxiliar no acompanhamento e na
                análise dos incêndios, oferecendo uma visão abrangente das áreas
                afetadas. Com base nos dados confiáveis e atualizados do INPE, exibimos
                no mapa a localização precisa dos focos de incêndio, permitindo uma
                compreensão clara da extensão e gravidade dos eventos.
              </p>
            </div>
          );
        }
        export default AboutPage;
    ```
4. Passagem de parâmetros - Criar página CountryPage.jsx

    ```jsx
    import { useParams } from "react-router-dom";

      function CountryPage(props) {
          let { country } = useParams(); 
        return (
          <div className="p-6">
            <h1 className="text-3xl mb-4">{country}</h1>
            <p>Você clicou em {country}.</p>
          </div>
        );
      }

      export default CountryPage;

    ```
5. Atualizar Notification:

    ```jsx
      import moment from 'moment';
      import { Link } from "react-router-dom";
      import 'moment/locale/pt-br';
      moment.locale('pt-br');

      function Notification({ geoJson, additionalInfo }) {
        const totalWildefireReported = geoJson?.features.length;
        const Dialog = () => {
          const message =
            totalWildefireReported === 0
              ? "Não foram reportados focos de incêndio nas últimas 48 horas"
              : `Foram encontrados ${totalWildefireReported} focos de incêndio nas últimas 48 horas.`;
          if (!geoJson) return null;
          return (
            <div
              className={`p-5 text-white rounded drop-shadow-2xl absolute z-50 w-auto top-5 right-5 ${
                totalWildefireReported === 0 ? "bg-green-700" : "bg-red-700"
              }`}
            >
              {message}
            </div>
          );
        };
        const AdditionalInfoTable = () => {
          if (!additionalInfo) return null;
          const {
            data_hora_gmt,
            estado,
            municipio,
            pais,
            satelite,
            latitude,
            longitude,
          } = additionalInfo;
          return (
            <div
              className={`p-4 rounded drop-shadow-2xl absolute z-50 bottom-20 right-5 bg-white w-1/3`}
            >
              <table className="w-full">
                <tr>
                  <th className="w-1/2">País</th>
                  <td><Link to={`/country/${pais}`}>{pais}</Link></td>
                </tr>
                <tr>
                  <th>Estado</th>
                  <td>{estado}</td>
                </tr>
                <tr>
                  <th>Município</th>
                  <td>{municipio}</td>
                </tr>
                <tr>
                  <th>Latitude</th>
                  <td>{latitude}</td>
                </tr>
                <tr>
                  <th>Longitude</th>
                  <td>{longitude}</td>
                </tr>
                <tr>
                  <th>Notificado em</th>
                  <td>{moment(data_hora_gmt).format('LLLL')}</td>
                </tr>
                <tr>
                  <th>Satélite</th>
                  <td>{satelite}</td>
                </tr>
              </table>
            </div>
          );
        };
        return (
          <>
            <AdditionalInfoTable />
            <Dialog />
          </>
        );
      }

      export default Notification;
    ```

5. Atualizar o routers no App.jsx

    ```jsx

      import "./App.css";
      import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
      import MapPage from "./pages/MapPage";
      import AboutPage from "./pages/AboutPage";
      import Navigation from "./components/Navigation";
      import CountryPage from "./pages/CountryPage";


      function App() {
        return (
          <Router>
            <div className="h-screen app">
              <Navigation />
              <main>
                <Routes>
                  <Route exact path="/" element={<MapPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/country/:country" element={<CountryPage />} />
                </Routes>
              </main>
            </div>
          </Router>
        );
      }

      export default App;
    ```

3. Preparando para o Deploy: npm run build