import express, { type Request, type Response } from "express";
import axios from "axios";

type LD = {
  id: number;
  filmName: string;
  rotationType: "CAV" | "CLV";
  region: string;
  lengthMinutes: number;
  videoFormat: "NTSC" | "PAL";
};

let laserDiscs: LD[] = [
  {
    id: 1,
    filmName: "Blade Runner",
    rotationType: "CAV",
    region: "US",
    lengthMinutes: 117,
    videoFormat: "NTSC",
  },
  {
    id: 2,
    filmName: "Terminator 2",
    rotationType: "CLV",
    region: "EU",
    lengthMinutes: 137,
    videoFormat: "PAL",
  },
];

//  Servidor Express
const app = express();
const port = 3000;

app.use(express.json());

// --- Rutas ---
// Mostrar todos los discos
app.get("/ld", (_req: Request, res: Response) => {
  res.json(laserDiscs);
});

// Mostrar un disco por su ID
app.get("/ld/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const found = laserDiscs.find((x) => x.id === id);
  return found
    ? res.json(found)
    : res.status(404).json({ message: "Equipo no encontrado" });
});

// Guardar un nuevo disco
app.post("/ld", (req: Request, res: Response) => {
  try {
    const nuevo: LD = {
      id: Date.now(), // id simple
      ...req.body,
    };
    laserDiscs.push(nuevo);
    res.status(201).json(nuevo);
  } catch (err: any) {
    res.status(500).json({ message: "Error al crear el disco", detail: err.message });
  }
});

// Eliminar un disco
app.delete("/ld/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const exists = laserDiscs.some((x) => x.id === id);
    if (!exists) return res.status(404).json({ message: "Equipo no encontrado" });

    laserDiscs = laserDiscs.filter((x) => x.id !== id);
    res.json({ message: "Disco eliminado correctamente" });
  } catch (err: any) {
    res.status(500).json({ message: "Error al eliminar el disco", detail: err.message });
  }
});

// --- Inicio del servidor ---
app.listen(port, () => {
  console.log(`🚀 Servidor en http://localhost:${port}`);

  // Esperar 1 segundo
  setTimeout(testApi, 1000);
});

// Cliente haciendo las llamadas
async function testApi() {
  try {
    // 1) Obtener todos los discos
    const listaInicial = await axios.get<LD[]>("http://localhost:3000/ld");
    console.log("Lista inicial:");
    console.log(listaInicial.data);

    // 2) Crear un nuevo disco
    const nuevoDiscoData = {
      filmName: "Jurassic Park",
      rotationType: "CAV" as const,
      region: "US",
      lengthMinutes: 127,
      videoFormat: "NTSC" as const,
    };
    const creado = await axios.post<LD>("http://localhost:3000/ld", nuevoDiscoData);
    console.log("Creado:");
    console.log(creado.data);

    // 3) Volver a obtener todos
    const listaConNuevo = await axios.get<LD[]>("http://localhost:3000/ld");
    console.log("Lista tras crear:");
    console.log(listaConNuevo.data);

    // 4) Eliminar el creado
    await axios.delete(`http://localhost:3000/ld/${creado.data.id}`);
    console.log("Eliminado id:", creado.data.id);

    // 5) Lista final
    const listaFinal = await axios.get<LD[]>("http://localhost:3000/ld");
    console.log("Lista final:");
    console.log(listaFinal.data);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("Axios error:", err.message);
    } else {
      console.log("Error:", err);
    }
  }
}