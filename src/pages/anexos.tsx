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
import { uploadFile } from "../config/firebase"; // Asegúrate de que esta función retorna la URL pública

interface Anexo {
  id?: string;
  contrato: string;
  nombre: string;
  url: string;
}

const defaultAnexo: Anexo = {
  contrato: "",
  nombre: "",
  url: "",
};

const AnexosTable: React.FC = () => {
  const [records, setRecords] = useState<Anexo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, setValue, getValues } =
    useForm<Anexo>();
  const recordsPerPage = 5;

  useEffect(() => {
    const q = query(collection(db, "anexos"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs: Anexo[] = [];
      querySnapshot.forEach((docSnap) => {
        docs.push({ ...(docSnap.data() as Anexo), id: docSnap.id });
      });
      setRecords(docs);
    });
    return () => unsubscribe();
  }, []);

  const onSubmit = async (data: Anexo) => {
    try {
      setUploading(true);

      // Si hay archivo seleccionado, súbelo
      if (file) {
        const url = await uploadFile(file);
        data.url = url;
      }

      if (editingId) {
        await handleUpdate(data);
      } else {
        await addDoc(collection(db, "anexos"), data);
      }

      reset(defaultAnexo);
      setEditingId(null);
      setFile(null);
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (anexo: Anexo) => {
    setEditingId(anexo.id || null);
    Object.entries(anexo).forEach(([key, value]) => {
      setValue(key as keyof Anexo, value);
    });
    setFile(null);
  };

  const handleUpdate = async (anexo: Anexo) => {
    if (!anexo.id) return;
    const anexoRef = doc(db, "anexos", anexo.id);
    await updateDoc(anexoRef, { ...anexo });
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm("¿Estás seguro de eliminar este anexo?")) {
      try {
        const ref = doc(db, "anexos", id);
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
      <h2 className="text-2xl font-bold mb-6">Gestión de Anexos</h2>

      {/* Búsqueda */}
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
        <div className="flex flex-col">
          <label className="font-medium mb-1">Contrato</label>
          <input
            {...register("contrato")}
            className="border p-2 rounded text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-medium mb-1">Nombre</label>
          <input
            {...register("nombre")}
            className="border p-2 rounded text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-medium mb-1">Archivo</label>
          <input
            type="file"
            accept="*/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border p-2 rounded text-black"
          />
        </div>

        <div className="col-span-1 md:col-span-3 flex justify-end gap-4">
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {uploading ? "Subiendo..." : editingId ? "Actualizar" : "Crear"}
          </button>
          <button
            type="button"
            onClick={() => {
              reset(defaultAnexo);
              setEditingId(null);
              setFile(null);
            }}
            className="bg-red-400 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm bg-white">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="border p-2">Contrato</th>
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Archivo</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-blue-100 text-black transition-colors"
              >
                <td className="border p-2">{row.contrato}</td>
                <td className="border p-2">{row.nombre}</td>
                <td className="border p-2">
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Ver archivo
                  </a>
                </td>
                <td className="border p-2">
                  <div className="flex gap-2">
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
                <td colSpan={4} className="text-center p-4">
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

export default AnexosTable;
