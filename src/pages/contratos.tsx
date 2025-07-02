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

interface Contrato {
  id?: string;
  contrato: string;
  arrendador: string;
  canon: string;
  valoriva: string;
  mediopago: string;
  estado: string;
  valoradministracion: string;
  incrementoadmon: string;
  incremento: string;
  fecha: string;
  fechaterminacion: string;
  fechapago: string;
  descripcion: string;
  preaviso: string;
}

const defaultContrato: Contrato = {
  contrato: "",
  arrendador: "",
  canon: "",
  valoriva: "",
  mediopago: "",
  estado: "",
  valoradministracion: "",
  incrementoadmon: "",
  incremento: "",
  fecha: "",
  fechaterminacion: "",
  fechapago: "",
  descripcion: "",
  preaviso: "",
};

const ContratosTable: React.FC = () => {
  const [records, setRecords] = useState<Contrato[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const recordsPerPage = 5;

  const { register, handleSubmit, reset, setValue } = useForm<Contrato>();

  useEffect(() => {
    const q = query(collection(db, "contratos"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs: Contrato[] = [];
      querySnapshot.forEach((docSnap) => {
        docs.push({ ...(docSnap.data() as Contrato), id: docSnap.id });
      });
      setRecords(docs);
    });
    return () => unsubscribe();
  }, []);

  const onSubmit = async (data: Contrato) => {
    try {
      if (editingId) {
        await handleUpdate(data);
      } else {
        await addDoc(collection(db, "contratos"), data);
      }
      reset(defaultContrato);
      setEditingId(null);
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleEdit = async (contrato: Contrato) => {
    setEditingId(contrato.id || null);
    Object.entries(contrato).forEach(([key, value]) => {
      setValue(key as keyof Contrato, value);
    });
  };

  const handleUpdate = async (contrato: Contrato) => {
    if (!contrato.id) return;

    const contratoRef = doc(db, "contratos", contrato.id);
    await updateDoc(contratoRef, { ...contrato });
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm("¿Estás seguro de eliminar este contrato?")) {
      try {
        const ref = doc(db, "contratos", id);
        await deleteDoc(ref);
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const filteredRecords = records.filter((rec) =>
    Object.values(rec).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="p-4 text-black min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Gestión de Contratos</h2>

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
        {Object.keys(defaultContrato).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="capitalize font-medium mb-1">{key}</label>
            <input
              {...register(key as keyof Contrato)}
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
              reset(defaultContrato);
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
              {Object.keys(defaultContrato).map((key) => (
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
                {Object.keys(defaultContrato).map((key) => (
                  <td key={key} className="border p-2">
                    {String(row[key as keyof Contrato] ?? "—")}
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
                  colSpan={Object.keys(defaultContrato).length + 1}
                  className="text-center p-4"
                >
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
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

export default ContratosTable;
