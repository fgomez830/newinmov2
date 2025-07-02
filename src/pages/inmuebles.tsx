import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { db } from "../config/firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

interface Inmueble {
  id?: string;
  contrato: string;
  areapredio: string;
  direccion: string;
  estrato: string;
  evaluoanteior: string;
  evaluovigente: string;
  fichacatastral: string;
  matricula: string;
  matriculaagua: string;
  matriculaenergia: string;
  arrendador: string;
  participacion: string;
}

const defaultInmueble: Inmueble = {
  contrato: "",
  areapredio: "",
  direccion: "",
  estrato: "",
  evaluoanteior: "",
  evaluovigente: "",
  fichacatastral: "",
  matricula: "",
  matriculaagua: "",
  matriculaenergia: "",
  arrendador: "",
  participacion: "",
};

const InmueblesTable: React.FC = () => {
  const [records, setRecords] = useState<Inmueble[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const recordsPerPage = 5;

  const { register, handleSubmit, reset, setValue } = useForm<Inmueble>();

  useEffect(() => {
    const q = query(collection(db, "inmuebles"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs: Inmueble[] = [];
      querySnapshot.forEach((docSnap) => {
        docs.push({ ...(docSnap.data() as Inmueble), id: docSnap.id });
      });
      setRecords(docs);
    });
    return () => unsubscribe();
  }, []);

  const onSubmit = async (data: Inmueble) => {
    try {
      if (editingId) {
        await handleUpdate(data);
      } else {
        await addDoc(collection(db, "inmuebles"), data);
      }
      reset(defaultInmueble);
      setEditingId(null);
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleEdit = async (inmueble: Inmueble) => {
    setEditingId(inmueble.id || null);
    Object.entries(inmueble).forEach(([key, value]) => {
      setValue(key as keyof Inmueble, value);
    });
  };

  const handleUpdate = async (inmueble: Inmueble) => {
    if (!inmueble.id) return;

    const inmuebleRef = doc(db, "inmuebles", inmueble.id);
    await updateDoc(inmuebleRef, { ...inmueble });
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm("¿Estás seguro de eliminar este inmueble?")) {
      try {
        const ref = doc(db, "inmuebles", id);
        await deleteDoc(ref);
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  // Filtro por búsqueda
  const filteredRecords = records.filter((rec) =>
    Object.values(rec).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginación
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="p-4 text-black min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Gestión de Inmuebles</h2>

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por cualquier campo..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {Object.keys(defaultInmueble).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="capitalize font-medium mb-1">{key}</label>
            <input
              {...register(key as keyof Inmueble)}
              className="border p-2 rounded text-black"
            />
          </div>
        ))}
        <div className="col-span-1 md:col-span-3 flex justify-end gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editingId ? "Actualizar" : "Crear"}
          </button>
          <button
            type="button"
            onClick={() => {
              reset(defaultInmueble);
              setEditingId(null);
            }}
            className="bg-red-400 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm rounded-lg overflow-hidden bg-white">
          <thead className="bg-blue-700 text-white">
            <tr>
              {Object.keys(defaultInmueble).map((key) => (
                <th key={key} className="border p-2 capitalize">
                  {key}
                </th>
              ))}
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-blue-100 text-black transition-colors"
              >
                {Object.keys(defaultInmueble).map((key) => (
                  <td key={key} className="border p-2">
                    {String(row[key as keyof Inmueble] ?? "—")}
                  </td>
                ))}
                <td className="border p-2">
                  <div className="flex flex-row gap-2">
                    <button
                      onClick={() => handleEdit(row)}
                      className="bg-blue-700 text-white px-2 py-1 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedRecords.length === 0 && (
              <tr>
                <td
                  colSpan={Object.keys(defaultInmueble).length + 1}
                  className="text-center p-4"
                >
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 bg-gray-300 text-black rounded"
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span className="mx-4">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 bg-gray-300 text-black rounded"
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default InmueblesTable;
