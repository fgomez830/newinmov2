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
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

// Funciones de exportación
const exportToExcel = (data: Anexo[], filename: string = "anexos") => {
  // Preparar los datos para Excel (excluir el id)
  const excelData = data.map(({ id, ...anexo }) => ({
    ...anexo,
    url: anexo.url || "Sin archivo",
  }));

  // Crear el workbook y worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Anexos");

  // Generar y descargar el archivo
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

const exportToPDF = (data: Anexo[], filename: string = "anexos") => {
  // Crear el documento PDF
  const doc = new jsPDF();

  // Configurar el título
  doc.setFontSize(18);
  doc.text("Reporte de Anexos", 14, 22);
  doc.setFontSize(12);
  doc.text(`Generado el: ${new Date().toLocaleDateString("es-ES")}`, 14, 32);

  // Preparar los datos para la tabla
  const tableData = data.map(({ id, ...anexo }) => [
    anexo.contrato,
    anexo.nombre,
    anexo.url || "Sin archivo",
  ]);

  // Configurar las columnas
  const columns = ["Contrato", "Nombre", "URL del Archivo"];

  // Generar la tabla usando autoTable
  autoTable(doc, {
    head: [columns],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Azul
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Guardar el PDF
  doc.save(`${filename}.pdf`);
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

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const docs: Anexo[] = [];
        querySnapshot.forEach((docSnap) => {
          docs.push({ ...(docSnap.data() as Anexo), id: docSnap.id });
          console.log("Anexo data:", docSnap.data());
        });
        console.log("Anexos:", docs);
        setRecords(docs);
      },
      (error) => {
        console.error("Error al escuchar los anexos:", error);
      }
    );

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

      {/* Búsqueda y botones de exportación */}
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1">
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
        <div className="flex gap-2">
          <button
            onClick={() => exportToExcel(filteredRecords, "anexos")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            disabled={filteredRecords.length === 0}
          >
            Exportar Excel
          </button>
          <button
            onClick={() => exportToPDF(filteredRecords, "anexos")}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            disabled={filteredRecords.length === 0}
          >
            Exportar PDF
          </button>
        </div>
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
