"use server"

// Compat: las acciones del CRUD v0 se movieron al modelo F1.
// Reexport desde familias/actions.
export {
  toggleAlumnoStatus as toggleAlumno,
  updateAlumnoF1 as updateAlumno,
} from "../familias/actions"
