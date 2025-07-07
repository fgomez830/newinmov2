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
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Cartera {
  id?: string;
  contrato: string;
  fechainicio: string;
  fechaterminacion: string;
  incremento: string;
  canon: string;
  arrendador: string;
  mediopago: string;
  valorarriendo: string;
  fechapago: string;
  fecha: string;
  estado: string;
  descripcion: string;
  preaviso: string;
}

const defaultCartera: Cartera = {
  contrato: "",
  fechainicio: "",
  fechaterminacion: "",
  incremento: "",
  canon: "",
  arrendador: "",
  mediopago: "",
  valorarriendo: "",
  fechapago: "",
  fecha: "",
  estado: "",
  descripcion: "",
  preaviso: "",
};

// Funciones de exportación
const exportToExcel = (data: Cartera[], filename: string = "cartera") => {
  // Preparar los datos para Excel (excluir el id)
  const excelData = data.map(({ id, ...cartera }) => cartera);

  // Crear el workbook y worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cartera");

  // Generar y descargar el archivo
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

const exportToPDF = (data: Cartera[], filename: string = "cartera") => {
  // Crear el documento PDF
  const doc = new jsPDF();

  // Configurar el título
  doc.setFontSize(18);
  doc.text("Reporte de Cartera", 14, 22);
  doc.setFontSize(12);
  doc.text(`Generado el: ${new Date().toLocaleDateString("es-ES")}`, 14, 32);

  // Preparar los datos para la tabla
  const tableData = data.map(({ id, ...cartera }) => Object.values(cartera));

  // Configurar las columnas
  const columns = [
    "Contrato",
    "Fecha Inicio",
    "Fecha Terminación",
    "Incremento",
    "Canon",
    "Arrendador",
    "Medio Pago",
    "Valor Arriendo",
    "Fecha Pago",
    "Fecha",
    "Estado",
    "Descripción",
    "Preaviso",
  ];

  // Generar la tabla usando autoTable
  autoTable(doc, {
    head: [columns],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 6,
      cellPadding: 1,
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

const CarteraTable: React.FC = () => {
  const [records, setRecords] = useState<Cartera[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const recordsPerPage = 5;

  const { register, handleSubmit, reset, setValue } = useForm<Cartera>();

  useEffect(() => {
    const q = query(collection(db, "cartera"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs: Cartera[] = [];
      querySnapshot.forEach((docSnap) => {
        docs.push({ ...(docSnap.data() as Cartera), id: docSnap.id });
      });
      setRecords(docs);
    });
    return () => unsubscribe();
  }, []);

  const onSubmit = async (data: Cartera) => {
    try {
      if (editingId) {
        await handleUpdate(data);
      } else {
        await addDoc(collection(db, "cartera"), data);
      }
      reset(defaultCartera);
      setEditingId(null);
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleEdit = async (cartera: Cartera) => {
    setEditingId(cartera.id || null);
    Object.entries(cartera).forEach(([key, value]) => {
      setValue(key as keyof Cartera, value);
    });
  };

  const handleUpdate = async (cartera: Cartera) => {
    if (!cartera.id) return;

    const carteraRef = doc(db, "cartera", cartera.id);
    await updateDoc(carteraRef, { ...cartera });
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm("¿Estás seguro de eliminar este registro?")) {
      try {
        const ref = doc(db, "cartera", id);
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
      <h2 className="text-2xl font-bold mb-6">Gestión de Cartera</h2>

      {/* Barra de búsqueda y botones de exportación */}
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
            onClick={() => exportToExcel(filteredRecords, "cartera")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            disabled={filteredRecords.length === 0}
          >
            Exportar Excel
          </button>
          <button
            onClick={() => exportToPDF(filteredRecords, "cartera")}
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
        {Object.keys(defaultCartera).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="capitalize font-medium mb-1">{key}</label>
            <input
              {...register(key as keyof Cartera)}
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
              reset(defaultCartera);
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
              {Object.keys(defaultCartera).map((key) => (
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
                {Object.keys(defaultCartera).map((key) => (
                  <td key={key} className="border p-2">
                    {String(row[key as keyof Cartera] ?? "—")}
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
                  colSpan={Object.keys(defaultCartera).length + 1}
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

export default CarteraTable;
